/**
 * Records a real interaction with a live app and encodes it to MP4.
 *
 * Unlike record-demo.mjs, which pans down a marketing page, this one
 * drives the app: it captures every frame while clicking through a
 * timed script of steps, so the result shows the product being used.
 *
 *   node scripts/record-interaction.mjs <config.json>
 *
 * Config shape:
 *   {
 *     "url": "https://example.com",
 *     "name": "phantom-demo",
 *     "seconds": 16,
 *     "width": 1440, "height": 900,
 *     "settleMs": 9000,
 *     "steps": [ { "atSecond": 2.5, "clickText": "Amazon" } ]
 *   }
 *
 * A step clicks the first button or link whose visible text contains
 * clickText, or matches clickSelector. Steps that match nothing are
 * reported rather than failing the run.
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, statSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const cfgPath = process.argv[2];
if (!cfgPath) {
  console.error("usage: node scripts/record-interaction.mjs <config.json>");
  process.exit(1);
}
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));

const FFMPEG =
  "C:/Users/shaan/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffmpeg.exe";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9431;
const W = cfg.width ?? 1440;
const H = cfg.height ?? 900;
const FPS = 30;
const TOTAL = Math.round((cfg.seconds ?? 16) * FPS);

const frameDir = mkdtempSync(path.join(tmpdir(), "act-frames-"));
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, "--headless", "--disable-gpu",
  "--hide-scrollbars", "--no-first-run", "--force-device-scale-factor=1",
  `--user-data-dir=${path.join(tmpdir(), "claude-cdp-act")}`, "about:blank",
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
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false }, s);
await send("Page.navigate", { url: cfg.url }, s);
await sleep(cfg.settleMs ?? 9000);

const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, s);
  return r.result?.result?.value;
};

console.log(`"${await ev("document.title")}" — recording ${TOTAL} frames at ${W}x${H}`);

/* Map each step onto the frame it fires at. */
const steps = (cfg.steps ?? []).map((step) => ({
  ...step,
  atFrame: Math.round((step.atSecond ?? 0) * FPS),
  done: false,
}));

/* Resolve a step to viewport coordinates.

   Matching runs over every element, not just buttons and links, because
   SVG nodes carry no innerText and are not focusable. Returning a point
   lets the click go through as a real mouse event, which also fires the
   hover states an app draws on its own nodes. */
const locateScript = (step) => {
  const target = step.clickSelector
    ? `document.querySelector(${JSON.stringify(step.clickSelector)})`
    : `(()=>{const want=${JSON.stringify(step.clickText ?? "")}.toLowerCase();
        const all=[...document.querySelectorAll('button,a[href],[role=button],text,tspan,g,div,span,li')];
        const hit=all.find(e=>{
          const txt=(e.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase();
          return txt && txt.includes(want) && txt.length < want.length + 60;
        });
        return hit || null;})()`;

  return `(()=>{
    const el = ${target};
    if(!el) return JSON.stringify({ok:false});
    const r = el.getBoundingClientRect();
    if(!r.width && !r.height) return JSON.stringify({ok:false});
    return JSON.stringify({
      ok:true,
      x: Math.round(r.left + r.width/2),
      y: Math.round(r.top + r.height/2),
      text: (el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,44)
    });
  })()`;
};

async function performStep(step) {
  const raw = await ev(locateScript(step));
  let hit;
  try { hit = JSON.parse(raw); } catch { hit = { ok: false }; }
  if (!hit.ok) return "no match";

  for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
    await send("Input.dispatchMouseEvent", {
      type, x: hit.x, y: hit.y, button: "left",
      clickCount: type === "mouseMoved" ? 0 : 1,
    }, s);
    await sleep(40);
  }
  return `clicked "${hit.text}" at ${hit.x},${hit.y}`;
}

let written = 0;
for (let f = 0; f < TOTAL; f++) {
  for (const step of steps) {
    if (!step.done && f >= step.atFrame) {
      const outcome = await performStep(step);
      console.log(`  ${(f / FPS).toFixed(1)}s  ${step.clickText ?? step.clickSelector} -> ${outcome}`);
      step.done = true;
    }
  }

  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, s);
  if (!shot.result?.data) continue;
  const buf = Buffer.from(shot.result.data, "base64");
  writeFileSync(path.join(frameDir, `f${String(written).padStart(5, "0")}.png`), buf);
  if (written === 0) {
    await sharp(buf).webp({ quality: 82 }).toFile(`public/media/${cfg.name}-poster.webp`);
  }
  written++;
  if (written % 90 === 0) console.log(`  ${written}/${TOTAL} frames`);
}
ws.close();
chrome.kill();

const missed = steps.filter((x) => !x.done);
if (missed.length) console.log(`note: ${missed.length} step(s) never fired`);

console.log(`captured ${written} frames, encoding`);
const out = `public/media/${cfg.name}.mp4`;
const enc = spawnSync(FFMPEG, [
  "-y", "-framerate", String(FPS),
  "-i", path.join(frameDir, "f%05d.png"),
  "-c:v", "libx264", "-preset", "slow", "-crf", "30",
  "-pix_fmt", "yuv420p", "-vf", `scale=${W}:-2`,
  "-movflags", "+faststart", "-an", out,
], { encoding: "utf8" });

if (enc.status !== 0) {
  console.error(enc.stderr?.slice(-1800));
  process.exit(1);
}
rmSync(frameDir, { recursive: true, force: true });
console.log(`wrote ${out}  ${(statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
