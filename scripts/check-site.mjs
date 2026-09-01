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
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (m, p = {}, s) =>
  new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p, sessionId: s })); });

const { result: t } = await send("Target.createTarget", { url: "about:blank" });
const { result: a } = await send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
const s = a.sessionId;
await send("Page.enable", {}, s);
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false }, s);

const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, s);
  return r.result?.result?.value;
};
const go = async (path) => { await send("Page.navigate", { url: BASE + path }, s); await sleep(4200); };

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

console.log("Rilo, the ported demo, the recording and the page");
await go("/projects?p=Rilo");

/* Rilo has three modes now, so the panel opens on a switcher rather
   than a single toggle. */
const mode = (tab) =>
  `[...document.querySelectorAll('.demo-mode')].find(b => b.textContent.trim() === ${JSON.stringify(tab)})`;

ck("three modes are offered",
  (await ev(`document.querySelectorAll('.demo-mode').length`)) === 3,
  await ev(`[...document.querySelectorAll('.demo-mode')].map(b=>b.textContent).join('|')`));
ck("it opens on the playable demo", await ev(`!!document.querySelector('.rd')`));

/* The flow is the whole point, so walk it end to end. */
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
ck("a draft comes back on the path taken",
  (await ev(`document.querySelector('.rd-draft')?.textContent`))?.includes("Count me in"));

await ev(`${mode("Recording")}.click()`);
await sleep(2500);
ck("the recording plays",
  await ev(`(()=>{const v=document.querySelector('.demo-video');return !!v&&!v.paused&&v.currentTime>0})()`));

await ev(`${mode("The page")}.click()`);
await sleep(2200);
ck("full page capture loads",
  await ev(`(()=>{const i=document.querySelector('.demo-scroll-img');return !!i&&i.naturalHeight>4000})()`));
ck("the panel scrolls",
  await ev(`(()=>{const d=document.querySelector('.demo-scroll');return d.scrollHeight>d.clientHeight+200})()`));
ck("Add to Chrome points at the Web Store",
  await ev(`[...document.querySelectorAll('a.demo-hotspot')].some(x=>x.href.includes('chromewebstore.google.com'))`));
ck("Get Started points at the login page",
  await ev(`[...document.querySelectorAll('a.demo-hotspot')].some(x=>x.href.includes('/login'))`));
ck("outbound hotspots are safe",
  await ev(`[...document.querySelectorAll('a.demo-hotspot')].every(x=>x.target==='_blank'&&x.rel.includes('noopener'))`));
const before = await ev(`document.querySelector('.demo-scroll').scrollTop`);
await ev(`[...document.querySelectorAll('button.demo-hotspot')].find(b=>b.getAttribute('aria-label').startsWith('Pricing'))?.click()`);
await sleep(1500);
ck("an in-page anchor scrolls the panel",
  (await ev(`document.querySelector('.demo-scroll').scrollTop`)) > before + 500);

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

console.log("Phantom, recording and the live embed");
await go("/projects?p=Phantom");
ck("the demo runs the Kariba case",
  (await ev(`document.querySelector('.demo-caption-text')?.textContent`))?.includes("Kariba"));
ck("award wording is exact",
  (await ev(`document.querySelector('.browser-award')?.textContent`)) ===
    "3rd Place, Best Use of Base44, Ignition Hacks 2026");
ck("the Render link is present",
  await ev(`[...document.querySelectorAll('.browser-links a')].some(x=>x.href.includes('onrender.com'))`));
await ev(`[...document.querySelectorAll('.demo-mode')].find(b => b.textContent.trim() === "Live app").click()`);
await sleep(8000);
ck("the live app embeds", await ev(`!!document.querySelector('.demo-frame')`));

console.log("Deep links");
await go("/projects?p=Loxbox");
ck("?p= selects the right project",
  (await ev(`document.querySelector('.browser-title')?.textContent`)) === "Loxbox");

ws.close();
chrome.kill();

console.log(`\n${pass} passed, ${fails.length} failed`);
for (const f of fails) console.log(`  - ${f}`);
process.exit(fails.length ? 1 : 0);
