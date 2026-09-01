/**
 * Captures a whole page as one tall WebP.
 *
 *   node scripts/capture-fullpage.mjs <url> <name> [width]
 *   node scripts/capture-fullpage.mjs https://riloai.app rilo-page 1280
 *
 * Used for sites that refuse to be framed. riloai.app sends
 * X-Frame-Options: SAMEORIGIN, so it cannot be embedded live, but the
 * full page rendered into a scrollable panel still lets a visitor read
 * the whole thing at their own pace.
 *
 * Writes public/media/<name>.webp and prints its pixel height, which
 * the component needs to size the panel.
 */
import { spawn } from "node:child_process";
import { statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";

const [, , URL_ARG, NAME, WIDTH] = process.argv;
if (!URL_ARG || !NAME) {
  console.error("usage: node scripts/capture-fullpage.mjs <url> <name> [width]");
  process.exit(1);
}

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9481;
const W = Number(WIDTH ?? 1280);

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, "--headless", "--disable-gpu",
  "--hide-scrollbars", "--no-first-run", "--force-device-scale-factor=1",
  `--user-data-dir=${path.join(tmpdir(), "claude-cdp-full")}`, "about:blank",
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
await send("Emulation.setDeviceMetricsOverride", { width: W, height: 900, deviceScaleFactor: 1, mobile: false }, s);
await send("Page.navigate", { url: URL_ARG }, s);
await sleep(7000);

const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, s);
  return r.result?.result?.value;
};

/* Walk the page first so anything that reveals on scroll has fired
   before the capture, then return to the top. */
const height = await ev(
  `Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)`,
);
for (let y = 0; y < height; y += 600) {
  await ev(`window.scrollTo(0, ${y})`);
  await sleep(220);
}
await ev(`window.scrollTo(0, 0)`);
await sleep(1500);

/* Collect every interactive target with its position in the full-page
   image, so the flat capture can be made clickable again.

   Three kinds come out:
     external  an absolute URL, opened in a new tab
     site      a root-relative path, resolved against the origin
     anchor    an in-page link, resolved to a y offset so clicking it
               scrolls the panel instead of leaving the site */
const hotspots = JSON.parse(
  await ev(`(() => {
    const origin = location.origin;
    const out = [];
    for (const el of document.querySelectorAll('a[href], button')) {
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 14) continue;
      const label = (el.innerText || el.getAttribute('aria-label') || '')
        .replace(/\\s+/g, ' ').trim();
      if (!label) continue;
      const raw = el.getAttribute('href') || '';
      let kind = null, href = null, scrollTo = null;
      if (/^https?:/i.test(raw)) { kind = 'external'; href = raw; }
      else if (raw.startsWith('#')) {
        const target = document.querySelector(raw) ||
          document.getElementById(raw.slice(1));
        if (target) {
          kind = 'anchor';
          scrollTo = Math.round(target.getBoundingClientRect().top + window.scrollY);
        }
      } else if (raw.startsWith('/')) { kind = 'site'; href = origin + raw; }
      if (!kind) continue;
      out.push({
        label: label.slice(0, 48), kind, href, scrollTo,
        x: Math.round(r.left + window.scrollX),
        y: Math.round(r.top + window.scrollY),
        w: Math.round(r.width), h: Math.round(r.height),
      });
    }
    /* Drop duplicates that sit on top of each other. */
    const seen = new Set();
    return JSON.stringify(out.filter(o => {
      const k = o.label + '|' + o.y + '|' + o.x;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    }));
  })()`),
);

const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, s);
ws.close();
chrome.kill();

if (!shot.result?.data) {
  console.error("capture failed");
  process.exit(1);
}

const buf = Buffer.from(shot.result.data, "base64");
const meta = await sharp(buf).metadata();
const out = `public/media/${NAME}.webp`;
await sharp(buf).webp({ quality: 78 }).toFile(out);

/* Positions are stored as percentages so the overlay scales with
   whatever width the panel ends up at. */
const scaled = hotspots.map((h) => ({
  label: h.label,
  kind: h.kind,
  href: h.href ?? undefined,
  scrollPct: h.scrollTo == null ? undefined : +((h.scrollTo / meta.height) * 100).toFixed(4),
  left: +((h.x / meta.width) * 100).toFixed(4),
  top: +((h.y / meta.height) * 100).toFixed(4),
  width: +((h.w / meta.width) * 100).toFixed(4),
  height: +((h.h / meta.height) * 100).toFixed(4),
}));

const jsonPath = `src/content/${NAME}-hotspots.json`;
writeFileSync(jsonPath, JSON.stringify(scaled, null, 1) + "\n");

console.log(`wrote ${out}`);
console.log(`  ${meta.width}x${meta.height}px, ${(statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`  set scrollImageHeight: ${meta.height} in projects.ts`);
console.log(`wrote ${jsonPath}`);
for (const k of ["external", "site", "anchor"]) {
  console.log(`  ${k}: ${scaled.filter((h) => h.kind === k).length}`);
}
