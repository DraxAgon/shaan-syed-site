/**
 * Generates the committed placeholder images.
 *
 * Every slot ships as a solid on-brand tone at the exact target
 * dimensions, so dropping in a real photo of the same name is the only
 * step needed. Run with: node scripts/generate-placeholders.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "images");

// Tokens from src/app/globals.css.
const LIFT = { r: 0x1f, g: 0x19, b: 0x13 };
const HAIRLINE = { r: 0x2e, g: 0x26, b: 0x20 };

const slots = [
  { file: "portrait-hero.webp", w: 1200, h: 1500, tone: HAIRLINE },
  { file: "portrait-bio.webp", w: 1000, h: 1000, tone: HAIRLINE },
  { file: "logo-toronto.webp", w: 256, h: 256, tone: LIFT },
  { file: "logo-strello.webp", w: 256, h: 256, tone: LIFT },
  { file: "logo-sumodino.webp", w: 256, h: 256, tone: LIFT },
  { file: "logo-targetalpha.webp", w: 256, h: 256, tone: LIFT },
  { file: "logo-northern.webp", w: 256, h: 256, tone: LIFT },
  { file: "logo-waterloo.webp", w: 256, h: 256, tone: LIFT },
  { file: "logo-laurier.webp", w: 256, h: 256, tone: LIFT },
  { file: "project-rilo.webp", w: 1600, h: 900, tone: LIFT },
  { file: "project-rediai.webp", w: 1600, h: 900, tone: LIFT },
  { file: "project-phantom.webp", w: 1600, h: 900, tone: LIFT },
  { file: "project-loxbox.webp", w: 1600, h: 900, tone: LIFT },
];

await mkdir(OUT, { recursive: true });

for (const slot of slots) {
  const out = path.join(OUT, slot.file);
  await sharp({
    create: {
      width: slot.w,
      height: slot.h,
      channels: 3,
      background: slot.tone,
    },
  })
    .webp({ quality: 80 })
    .toFile(out);
  console.log(`${slot.file}  ${slot.w}x${slot.h}`);
}

console.log(`\n${slots.length} placeholders written to public/images`);
