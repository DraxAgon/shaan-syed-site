/**
 * Records a scroll-through of a live site and encodes it to MP4.
 *
 *   node scripts/record-demo.mjs <url> <name> [seconds] [width] [height]
 *   node scripts/record-demo.mjs https://riloai.app rilo-demo 14
 *
 * Frames are captured at deterministic scroll offsets rather than by
 * screencast, so the pan is smooth and identical on every run.
 * Writes public/media/<name>.mp4 and public/media/<name>-poster.webp.
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const [, , URL_ARG, NAME, SECS, WIDTH, HEIGHT] = process.argv;
if (!URL_ARG || !NAME) {
  console.error("usage: node scripts/record-demo.mjs <url> <name> [seconds] [width] [height]");
  process.exit(1);
}

const FFMPEG =
  "C:/Users/shaan/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffmpeg.exe";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9401;
const W = Number(WIDTH ?? 1280);
const H = Number(HEIGHT ?? 800);
const FPS = 30;
const DURATION = Number(SECS ?? 14);
const TOTAL = Math.round(DURATION * FPS);
const HOLD = Math.round(FPS * 1.2); // still frames at each end

const frameDir = mkdtempSync(path.join(tmpdir(), "demo-frames-"));
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, "--headless", "--disable-gpu",
  "--hide-scrollbars", "--no-first-run", "--force-device-scale-factor=1",
  `--user-data-dir=${path.join(tmpdir(), "claude-cdp-rec")}`, "about:blank",
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
await send("Page.navigate", { url: URL_ARG }, s);
await sleep(7000); // let fonts, images and entrance animations settle

const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, s);
  return r.result?.result?.value;
};

const title = await ev(`document.title`);
const pageHeight = await ev(
  `Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)`,
);
const maxScroll = Math.max(0, pageHeight - H);
console.log(`"${title}" — page ${pageHeight}px, scrollable ${maxScroll}px, ${TOTAL} frames`);

/* Ease in and out so the pan starts and stops gently. */
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

let written = 0;
for (let f = 0; f < TOTAL; f++) {
  let y;
  if (f < HOLD) y = 0;
  else if (f > TOTAL - HOLD) y = maxScroll;
  else y = Math.round(maxScroll * ease((f - HOLD) / (TOTAL - 2 * HOLD)));

  await ev(`window.scrollTo(0, ${y})`);
  await sleep(16);
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, s);
  if (!shot.result?.data) continue;

  const buf = Buffer.from(shot.result.data, "base64");
  writeFileSync(path.join(frameDir, `f${String(written).padStart(5, "0")}.png`), buf);
  if (written === 0) {
    await sharp(buf).webp({ quality: 82 }).toFile(`public/media/${NAME}-poster.webp`);
  }
  written++;
  if (written % 60 === 0) console.log(`  ${written}/${TOTAL}`);
}
ws.close();
chrome.kill();
console.log(`captured ${written} frames, encoding`);

const out = `public/media/${NAME}.mp4`;
const enc = spawnSync(FFMPEG, [
  "-y", "-framerate", String(FPS),
  "-i", path.join(frameDir, "f%05d.png"),
  "-c:v", "libx264", "-preset", "slow", "-crf", "30",
  "-pix_fmt", "yuv420p",
  "-vf", `scale=${W}:-2`,
  "-movflags", "+faststart",
  "-an", out,
], { encoding: "utf8" });

if (enc.status !== 0) {
  console.error(enc.stderr?.slice(-1800));
  process.exit(1);
}
rmSync(frameDir, { recursive: true, force: true });
console.log(`wrote ${out}  ${(statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
