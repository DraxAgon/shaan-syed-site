/**
 * Writes the four project marks as 256x256 WebP into public/images.
 *
 * Provenance matters here, so it is recorded per project rather than
 * left for a reader to guess:
 *
 *   Redi AI  REAL, fetched. The app ships favicon.svg, which is the
 *            Filament from its own design system. Vector, so the shape
 *            comes across exactly; see LIFT below for the one change.
 *   Rilo     REAL, redrawn. riloai.app ships only a 32x32 icon, too
 *            soft once a 26px tile is drawn on a 2x screen. The mark
 *            here is that icon's own geometry, measured off it and
 *            restated as vector: same #FF6A2B ground, same R. The
 *            Chrome Web Store icon is a different mark, an illustrated
 *            red panda, which turns to mush at 22px and is not used.
 *   Phantom  DERIVED. The app ships no icon at all, only a letterspaced
 *            PHANTOM wordmark. Built instead from its own styles.css
 *            tokens, drawing the thing the app draws: a project
 *            boundary in --project amber with cleared land in --loss red.
 *   Loxbox   DERIVED. No public build and no icon. Built from its own
 *            design system: the darkroom ground and the HeatRing, which
 *            that system calls the hero object of the app. Safelight
 *            ember, and no glow, both of which that system asks for.
 *
 * Swap either derived mark out the moment the project ships a real one.
 * Re-run with: node scripts/build-project-logos.mjs
 */
import sharp from "sharp";

const OUT = "public/images/";

/* Rilo's shipped 32x32 icon, measured off it: the R sits in a 10x14 box
   at x11..20 y9..22 on a 2-unit stem, its bowl bulging to x19.5 and
   closing onto a bottom bar at y16 that the leg then drops from. Those
   measurements are why the coordinates below look arbitrary. */
const RILO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7.5" fill="#FF6A2B"/>
  <g fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round">
    <path d="M12 9V23"/>
    <path d="M12 10h4.3c2.3 0 3.3 1.4 3.3 3s-0.8 3-1.8 3H12"/>
    <path d="m17.8 16 2 7"/>
  </g>
</svg>`;

/* Phantom's own palette: --bg #06090b, --project #F0B429, --loss #FF4D3D.
   A boundary with a corner of it already gone. */
const PHANTOM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#06090b"/>
  <path d="M8 16 16 20.5V25.9L8 21.3Z" fill="#FF4D3D"/>
  <path d="M16 6.1 24.5 11v10L16 25.9 7.5 21V11Z" fill="none" stroke="#F0B429" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

/* Loxbox's own tokens: darkroom #131110, ember #F0803C, and the inert
   track it warms along. The ring is left open, because a box that has
   run down is a box that has opened. */
const LOXBOX = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#131110"/>
  <circle cx="16" cy="16" r="7.4" fill="none" stroke="#2A2422" stroke-width="2.4"/>
  <circle cx="16" cy="16" r="7.4" fill="none" stroke="#F0803C" stroke-width="2.4"
    stroke-linecap="round" stroke-dasharray="34 12.5" transform="rotate(-90 16 16)"/>
</svg>`;

const REDI_SRC = "https://redi-ai.vercel.app/favicon.svg";

/* The Filament is drawn for a browser tab: a 32px tile on the browser's
   own dark chrome, where a tail at 0.25 and a source dot at 0.28 still
   register. Here the same tile is drawn at 20px on cream, and both drop
   out, leaving a mark that reads as a faint scratch beside three solid
   ones. The floor is lifted so it holds at that size. Same shape, same
   golds, still dimming along its length, just not to nothing. */
const LIFT = [
  ['stop-opacity="0.25"', 'stop-opacity="0.6"'],
  ['opacity="0.28"', 'opacity="0.5"'],
];

async function write(name, svg) {
  await sharp(Buffer.from(svg), { density: 600 })
    .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(OUT + name + ".webp");
  console.log(`OK   ${name.padEnd(14)} ${svg.length}B of SVG`);
}

/* Fetched rather than inlined, so a change upstream is picked up on the
   next run instead of silently drifting from the real mark. */
let redi;
try {
  const res = await fetch(REDI_SRC, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(String(res.status));
  redi = await res.text();
  if (!redi.includes("<svg")) throw new Error("not an svg");
  for (const [from, to] of LIFT) {
    /* If upstream restyles the Filament these stop matching, and the
       mark should be re-checked at 20px rather than silently shipped. */
    if (!redi.includes(from)) console.log(`WARN logo-redi       upstream dropped ${from}, recheck at 20px`);
    redi = redi.replaceAll(from, to);
  }
  console.log(`FETCH logo-redi      <- ${REDI_SRC}`);
} catch (err) {
  console.log(`FAIL logo-redi       ${REDI_SRC} unreachable (${err.message}), left as is`);
}

await write("logo-rilo", RILO);
if (redi) await write("logo-redi", redi);
await write("logo-phantom", PHANTOM);
await write("logo-loxbox", LOXBOX);
