/**
 * Generates the committed placeholder images.
 *
 * Every slot ships as a solid on-brand tone at the exact target
 * dimensions, so dropping in a real photo of the same name is the only
 * step needed. Run with: node scripts/generate-placeholders.mjs
 *
 * Slots that already exist on disk are skipped, because most of this
 * list has since been replaced by real imagery (the logos are pulled
 * from their official sites). Pass --force to overwrite anyway.
 */
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "images");
const force = process.argv.includes("--force");

// Tokens from src/app/globals.css.
const LIFT = { r: 0x1f, g: 0x19, b: 0x13 };
const HAIRLINE = { r: 0x2e, g: 0x26, b: 0x20 };

const slots = [
  { file: "portrait-hero.webp", w: 960, h: 1200, tone: HAIRLINE },
  // The /bio photo rail, in the order the frames run down the page.
  { file: "bio-grad.webp", w: 1000, h: 1333, tone: HAIRLINE },
  { file: "bio-piano.webp", w: 1000, h: 1704, tone: HAIRLINE },
  { file: "bio-noodles.webp", w: 1000, h: 750, tone: HAIRLINE },
  { file: "bio-city.webp", w: 1000, h: 1333, tone: HAIRLINE },
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

const exists = async (file) =>
  access(file).then(
    () => true,
    () => false,
  );

await mkdir(OUT, { recursive: true });

let written = 0;

for (const slot of slots) {
  const out = path.join(OUT, slot.file);

  if (!force && (await exists(out))) {
    console.log(`${slot.file}  skipped, already on disk`);
    continue;
  }

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
  written += 1;
  console.log(`${slot.file}  ${slot.w}x${slot.h}`);
}

console.log(`\n${written} placeholder${written === 1 ? "" : "s"} written to public/images`);
