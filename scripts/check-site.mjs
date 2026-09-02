/**
 * Smoke test for the interactive parts of the site.
 *
 * The pages are static, but the demos, the disclosure rows and the nav
 * menu are not, and none of that is covered by `next build`. Run it
 * against a running server:
 *
 *   npm run build && npm run start      # one terminal
 *   node scripts/check-site.mjs         # another
 *
 * Set BASE to check a deployment instead of localhost.
 * Exits non-zero on the first failing expectation.
 */
import { spawn } from "node:child_process";

const BASE = process.env.BASE ?? "http://localhost:3000";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9531;

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, "--headless", "--disable-gpu",
  "--no-first-run", "--hide-scrollbars",
  "--autoplay-policy=no-user-gesture-required",
  "--user-data-dir=C:/Users/shaan/AppData/Local/Temp/claude-cdp-check", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(300);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
/* Chrome puts a cross-origin iframe in its own process, so the parent's
   frame tree never lists it and the frame element's onload fires either
   way. The network is what tells the two apart, and it takes both
   halves: a refused frame is still fetched and still answers 200, then
   the renderer drops it with ERR_BLOCKED_BY_RESPONSE. Checking only the
   200 would pass on a frame nobody can see. */
const documents = [];
const docFailures = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === "Network.responseReceived" && m.params.type === "Document") {
    documents.push({ url: m.params.response.url, status: m.params.response.status });
  }
  if (m.method === "Network.loadingFailed" && m.params.type === "Document") {
    docFailures.push(m.params.errorText);
  }
};
const send = (m, p = {}, s) =>
  new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p, sessionId: s })); });

const { result: t } = await send("Target.createTarget", { url: "about:blank" });
const { result: a } = await send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
const s = a.sessionId;
await send("Page.enable", {}, s);
await send("Network.enable", {}, s);
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false }, s);

const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, s);
  return r.result?.result?.value;
};
const go = async (path) => {
  documents.length = 0;
  docFailures.length = 0;
  await send("Page.navigate", { url: BASE + path }, s);
  await sleep(4200);
};

let pass = 0;
const fails = [];
const ck = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fails.push(name); console.log(`  FAIL  ${name} ${detail}`); }
};

console.log("Home, disclosure rows and nav menu");
await go("/");
ck("collapsed panels are hidden from tab order",
  await ev(`getComputedStyle(document.querySelector('.disclosure-panel-inner')).visibility === 'hidden'`));
await ev(`document.querySelectorAll('.disclosure-head')[0].click()`);
await sleep(600);
ck("a row expands on click",
  await ev(`document.querySelector('.disclosure').classList.contains('is-open')`));
ck("aria-expanded follows it",
  await ev(`document.querySelectorAll('.disclosure-head')[0].getAttribute('aria-expanded') === 'true'`));
await ev(`document.querySelector('.nav-caret').click()`);
await sleep(500);
ck("nav menu opens", await ev(`document.querySelector('.nav-menu').classList.contains('is-open')`));
ck("menu lists every project", (await ev(`document.querySelectorAll('.nav-menu-link').length`)) === 4);
await ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))`);
await sleep(400);
ck("Escape closes it", await ev(`!document.querySelector('.nav-menu').classList.contains('is-open')`));

console.log("Rilo, the live page and the ported demo");
await go("/projects?p=Rilo");

const mode = (tab) =>
  `[...document.querySelectorAll('.demo-mode')].find(b => b.textContent.trim() === ${JSON.stringify(tab)})`;

ck("two ways in are offered, and neither is a recording",
  (await ev(`document.querySelectorAll('.demo-mode').length`)) === 2 &&
    !(await ev(`[...document.querySelectorAll('.demo-mode')].map(b=>b.textContent).join('|')`))
      .toLowerCase().includes("recording"),
  await ev(`[...document.querySelectorAll('.demo-mode')].map(b=>b.textContent).join('|')`));
ck("no video element is left anywhere on the page",
  (await ev(`document.querySelectorAll('video').length`)) === 0);
ck("it opens on the live page", await ev(`!!document.querySelector('.demo-frame')`));
ck("the frame targets the canonical host",
  (await ev(`document.querySelector('.demo-frame')?.src`))?.includes("www.riloai.app"));
ck("the frame opens on the demo section, not the hero",
  (await ev(`document.querySelector('.demo-frame')?.getAttribute('src')`))?.endsWith("#demo"));
/* The page is drawn wider than the panel and scaled back down, so more of
   the demo fits without a scroll. Both halves have to hold: the layout box
   bigger than the stage, and the painted box matching it. */
ck("the frame is zoomed out to fit the panel", await ev(`(() => {
  const fit = document.querySelector('.demo-frame-fit.is-zoomed');
  const stage = document.querySelector('.demo-stage');
  if (!fit || !stage) return false;
  const z = parseFloat(getComputedStyle(fit).getPropertyValue('--frame-zoom'));
  const laidOut = fit.offsetWidth;
  const painted = fit.getBoundingClientRect().width;
  const stageW = stage.getBoundingClientRect().width;
  return z > 0 && z < 1 && laidOut > stageW * 1.2 && Math.abs(painted - stageW) < 6;
})()`));

/* riloai.app allows framing from the deployed origins only, so the frame
   genuinely loading can be asserted there and not against localhost.
   A blocked frame still fires onload and still leaves an element in the
   DOM, so the assertion has to be the served document itself. */
if (BASE.startsWith("https://")) {
  await sleep(6000);
  const framed = documents.filter((d) => d.url.includes("riloai.app"));
  const refused = docFailures.includes("net::ERR_BLOCKED_BY_RESPONSE");
  ck("the real page loads inside the frame",
    framed.some((d) => d.status === 200) && !refused,
    JSON.stringify({ framed, docFailures }));
} else {
  console.log("  SKIP  frame load (localhost is not on riloai.app's allowlist)");
}

await ev(`${mode("Try it")}.click()`);
await sleep(900);
ck("the ported demo starts in the inbox", await ev(`!!document.querySelector('.rd-row-unread')`));
await ev(`document.querySelector('.rd-row-unread').click()`);
await sleep(500);
await ev(`document.querySelector('.rd-reply').click()`);
await sleep(500);
await ev(`document.querySelector('.rd-rilo').click()`);
await sleep(3200);
ck("asking Rilo reaches the option step", await ev(`!!document.querySelector('.rd-options')`));
await ev(`[...document.querySelectorAll('.rd-option')].find(x=>x.textContent.includes('Say yes')).click()`);
await sleep(600);
await ev(`[...document.querySelectorAll('.rd-option')].find(x=>x.textContent.includes('Confirm')).click()`);
await sleep(600);
ck("two choices unlock generate", await ev(`!document.querySelector('.rd-go').disabled`));
await ev(`document.querySelector('.rd-go').click()`);
await sleep(2600);
ck("the draft matches the path taken",
  (await ev(`document.querySelector('.rd-draft')?.textContent`))?.includes("Count me in"));


console.log("Redi AI, the walkthrough");
await go("/projects?p=Redi%20AI");
ck("the walkthrough renders", await ev(`!!document.querySelector('.rw')`));
ck("it says the screens are rebuilt, not recorded",
  (await ev(`document.querySelector('.demo-caption-text')?.textContent`))?.toLowerCase().includes("rebuilt"));
ck("it opens on Home", await ev(`document.querySelector('.rp-app')?.dataset.screen`) === "home");

/* Typing a role has to carry through the whole walkthrough, because that is
   the one thing the panel claims: these are your questions, not a fixed set. */
await ev(`[...document.querySelectorAll('.rw-stop')].find(b=>b.textContent.includes('Add a role')).click()`);
await sleep(400);
await ev(`(()=>{const t=document.querySelector('.ra-input');
  const set=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;
  set.call(t,'Registered nurse at Toronto General');
  t.dispatchEvent(new Event('input',{bubbles:true}));})()`);
await sleep(200);
await ev(`document.querySelector('.ra-primary').click()`);
await sleep(2600);
ck("what it worked out follows what was typed",
  (await ev(`document.querySelector('.ra-title')?.textContent`)) === "Registered nurse" &&
  (await ev(`document.querySelector('.ra-org')?.textContent`)) === "Toronto General");
ck("a brand new role reads NOT STARTED",
  (await ev(`document.querySelector('.ra-cov-label')?.textContent`)) === "NOT STARTED");
ck("the 24 question promise is on the confirm screen",
  (await ev(`document.querySelector('.ra-promise')?.textContent`))?.includes("24 questions"));

await ev(`[...document.querySelectorAll('.rw-stop')].find(b=>b.textContent.includes('The report')).click()`);
await sleep(600);
ck("the report scores six skills",
  (await ev(`document.querySelectorAll('.ra-skill').length`)) === 6);
ck("scores are ranges, never a point",
  /^\d+ to \d+$/.test(await ev(`document.querySelector('.ra-skill-range')?.textContent`)));
ck("one row is the one to work on first",
  (await ev(`document.querySelectorAll('.ra-skill-eyebrow').length`)) === 1);
ck("the figures are marked as fixed",
  (await ev(`document.querySelector('.rw-note')?.textContent`))?.includes("scores are fixed"));

/* The report is the last stop, so the forward control has to become the way
   back to the top rather than a dead button. */
ck("the last step offers a restart",
  (await ev(`document.querySelector('.rw-nav.is-primary')?.textContent`)) === "Start again");
await ev(`document.querySelector('.rw-nav.is-primary').click()`);
await sleep(700);
ck("restarting returns to Home",
  (await ev(`document.querySelector('.rp-app')?.dataset.screen`)) === "home");
ck("the role typed earlier survives the restart",
  (await ev(`document.querySelector('.ra-role-name')?.textContent`)) === "Registered nurse");

console.log("Phantom, the guided Kariba case and the live embed");
await go("/projects?p=Phantom");
/* Phantom's case cannot be reached by URL, so the panel guides rather than
   deep links. These assert the guide exists and leads with the Kariba case,
   which is the real registered project; the app's own default list is the
   illustrative one. */
ck("the panel guides the visitor through the Kariba case",
  (await ev(`document.querySelector('.demo-guide-title')?.textContent`))?.includes("Kariba"));
ck("the guide's first step opens the Kariba case",
  (await ev(`document.querySelector('.demo-guide-steps li')?.textContent`))?.includes("Kariba case"));
ck("the guide has every step",
  (await ev(`document.querySelectorAll('.demo-guide-steps li').length`)) === 5);
ck("award wording is exact",
  (await ev(`document.querySelector('.browser-award')?.textContent`)) ===
    "3rd Place, Best Use of Base44, Ignition Hacks 2026");
ck("the Render link is present",
  await ev(`[...document.querySelectorAll('.browser-links a')].some(x=>x.href.includes('onrender.com'))`));
/* One mode now, so there is no switcher to click. */
ck("the live app embeds", await ev(`!!document.querySelector('.demo-frame')`));
ck("a single mode offers no switcher",
  (await ev(`document.querySelectorAll('.demo-mode').length`)) === 0);

console.log("Stage and tags");
await go("/projects?p=Rilo");
ck("a shipped project reads Published",
  (await ev(`document.querySelector('.browser-stage')?.textContent`)) === "Published");
ck("the download count is shown as a tag",
  (await ev(`[...document.querySelectorAll('.browser-tag')].map(e=>e.textContent).join('|')`))
    ?.includes("100+ downloads"));
await go("/projects?p=Redi%20AI");
ck("an unreleased project does not read as shipped",
  (await ev(`document.querySelector('.browser-stage')?.textContent`)) === "Not published yet");
await go("/projects?p=Loxbox");
ck("an early project reads as early rather than as nearly out",
  (await ev(`document.querySelector('.browser-stage')?.textContent`)) === "Early development");

console.log("Deep links");
ck("?p= selects the right project",
  (await ev(`document.querySelector('.browser-title')?.textContent`)) === "Loxbox");

ws.close();
chrome.kill();

console.log(`\n${pass} passed, ${fails.length} failed`);
for (const f of fails) console.log(`  - ${f}`);
process.exit(fails.length ? 1 : 0);
