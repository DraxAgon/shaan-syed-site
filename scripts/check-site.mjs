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

console.log("Rilo, recording and the scrollable page");
await go("/projects?p=Rilo");
ck("recording is playing",
  await ev(`(()=>{const v=document.querySelector('.demo-video');return !!v&&!v.paused&&v.currentTime>0})()`));
ck("offers the scroll mode",
  (await ev(`document.querySelector('.demo-toggle')?.textContent`))?.includes("Scroll the real page"));
await ev(`document.querySelector('.demo-toggle').click()`);
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

console.log("Redi AI, the mockup");
await go("/projects?p=Redi%20AI");
ck("mockup renders", await ev(`!!document.querySelector('.redi')`));
ck("it is labelled a mockup",
  (await ev(`document.querySelector('.demo-caption-text')?.textContent`))?.toLowerCase().includes("mockup"));
const first = await ev(`document.querySelector('.redi-text')?.textContent`);
await ev(`[...document.querySelectorAll('.redi-chip')].find(c=>c.textContent.includes('Scholarship')).click()`);
await sleep(600);
ck("changing the role regenerates the set",
  (await ev(`document.querySelector('.redi-text')?.textContent`)) !== first);
await ev(`document.querySelectorAll('.redi-question')[0].click()`);
await sleep(600);
ck("a question opens the scoring view", await ev(`!!document.querySelector('.redi-score')`));
ck("scores are marked illustrative",
  (await ev(`document.querySelector('.redi-illustrative')?.textContent`)) === "illustrative");

console.log("Phantom, recording and the live embed");
await go("/projects?p=Phantom");
ck("the demo runs the Kariba case",
  (await ev(`document.querySelector('.demo-caption-text')?.textContent`))?.includes("Kariba"));
ck("award wording is exact",
  (await ev(`document.querySelector('.browser-award')?.textContent`)) ===
    "3rd Place, Best Use of Base44, Ignition Hacks 2026");
ck("the Render link is present",
  await ev(`[...document.querySelectorAll('.browser-links a')].some(x=>x.href.includes('onrender.com'))`));
await ev(`document.querySelector('.demo-toggle').click()`);
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
