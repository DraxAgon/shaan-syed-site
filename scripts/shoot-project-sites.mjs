/**
 * Screenshots the live sites of shipped projects and writes them as
 * 1600x900 WebP into public/images. This gives the projects page real
 * product imagery instead of a placeholder.
 *
 *   node scripts/shoot-project-sites.mjs
 */
import { spawn } from "node:child_process";
import sharp from "sharp";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9361;
const TARGETS = { "project-rilo": "https://riloai.app" };

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, "--headless", "--disable-gpu", "--no-first-run",
  "--hide-scrollbars",
  "--user-data-dir=C:/Users/shaan/AppData/Local/Temp/claude-cdp-shoot", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(300);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (m, p = {}, s) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p, sessionId: s })); });

const { result: t } = await send("Target.createTarget", { url: "about:blank" });
const { result: a } = await send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
const s = a.sessionId;
await send("Page.enable", {}, s);

for (const [name, url] of Object.entries(TARGETS)) {
  await send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false }, s);
  await send("Page.navigate", { url }, s);
  await sleep(6000);
  const r = await send("Page.captureScreenshot", { format: "png" }, s);
  if (!r.result?.data) { console.log(`MISS ${name}`); continue; }
  const buf = Buffer.from(r.result.data, "base64");
  await sharp(buf).resize(1600, 900, { fit: "cover", position: "top" }).webp({ quality: 86 })
    .toFile(`public/images/${name}.webp`);
  console.log(`OK   ${name}  from ${url}`);
}
ws.close(); chrome.kill();
