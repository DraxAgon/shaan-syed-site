/**
 * Writes the four project marks as 256x256 WebP into public/images.
 *
 * Provenance matters here, so it is recorded per project rather than
 * left for a reader to guess:
 *
 *   Redi AI  REAL, redrawn. The app ships favicon.svg, which is the
 *            Filament, a hairline with a dot on one end. That is the
 *            app's second object, and at 20px on cream it read as a
 *            scratch beside three solid marks. The mark here is Redi
 *            himself, the face the app opens on and the thing anyone
 *            who has used it recognises, drawn from the same ratios in
 *            rediConfig.ts that src/components/redi-orb.tsx draws from:
 *            same gradient, same rim, same eyes, same resting mouth.
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

/* Redi's resting face, at the app's own ratios scaled to a 32 unit tile.
   Every number is FACE and ORB in src/components/redi-orb.tsx multiplied
   by 32: eyes at 0.066 x 0.094 radius, 0.19 either side of centre and
   0.095 above it; mouth centred 0.17 below, 0.34 wide. The path is the
   same two quadratic lens mouthPath() builds, evaluated once at the idle
   pose of openness 0.06 and curve 0.5 rather than animated. No tile and
   no plate behind him: he is a circle, and the ground he sits on is
   whichever page is drawing him. */
const REDI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <radialGradient id="orb" cx="0.4" cy="0.35" r="0.72">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="55%" stop-color="#FFC933"/>
      <stop offset="100%" stop-color="#F5A623"/>
    </radialGradient>
  </defs>
  <circle cx="16" cy="16" r="15.76" fill="url(#orb)"/>
  <circle cx="16" cy="16" r="15.76" fill="none" stroke="#FFF0A0" stroke-opacity="0.4" stroke-width="0.48"/>
  <ellipse cx="9.92" cy="12.96" rx="2.11" ry="3.01" fill="#2A1F05"/>
  <ellipse cx="22.08" cy="12.96" rx="2.11" ry="3.01" fill="#2A1F05"/>
  <path d="M10.56 20.3Q16 24.87 21.44 20.3Q16 27.04 10.56 20.3Z" fill="#2A1F05"/>
</svg>`;

async function write(name, svg) {
  await sharp(Buffer.from(svg), { density: 600 })
    .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(OUT + name + ".webp");
  console.log(`OK   ${name.padEnd(14)} ${svg.length}B of SVG`);
}

await write("logo-rilo", RILO);
await write("logo-redi", REDI);
await write("logo-phantom", PHANTOM);
await write("logo-loxbox", LOXBOX);
