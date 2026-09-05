/**
 * Builds the site's icons from the landing page portrait, so the tab
 * carries the same face the home page opens with:
 *
 *   src/app/favicon.ico     16, 32 and 48px, for the tab and history
 *   src/app/icon.png        256px, what modern browsers prefer
 *   src/app/apple-icon.png  180px, the iOS home screen tile
 *
 * Re-run after replacing the portrait:
 *   node scripts/build-favicon.mjs
 *
 * The source is 960x1200 with the head high in the frame, so the square
 * below is a crop rather than a fit: a letterboxed full portrait renders
 * the face as about four pixels at tab size. CROP is as tight as it goes
 * without clipping — air over the hair, the chin just off the bottom
 * edge — because at 16px the face is the whole icon and everything else
 * is noise; a looser crop turned the shirt collar into a white blob
 * under a smudge. Its ground is #1e1814, within a shade of the site's
 * own --color-lift, so nothing needs painting in behind it.
 *
 * icon.png and apple-icon.png are palette-quantised: they are
 * photographs, so full colour costs three times the bytes for a
 * difference that does not survive being drawn at any size an icon is
 * drawn at. The frames inside the .ico cannot be — Next decodes that
 * file at build time and rejects a PNG in it that is not RGBA — so they
 * are written straight, with an alpha channel the source does not carry
 * added for it. They are small enough that it costs nothing.
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "public/images/portrait-hero.webp";
/* Square, in source pixels. Centred on the head, not on the frame. */
const CROP = { left: 105, top: 95, width: 710, height: 710 };

/* PNG-in-ICO, which every browser this site targets reads. The older
   BMP encoding buys nothing here and costs three times the bytes. */
const ICO_SIZES = [16, 32, 48];

const square = (size, { rgba = false } = {}) => {
  const image = sharp(SOURCE)
    .extract(CROP)
    .resize(size, size, { fit: "cover", kernel: "lanczos3" });
  return (rgba ? image.ensureAlpha() : image)
    .png({ compressionLevel: 9, palette: !rgba })
    .toBuffer();
};

/* ICONDIR, then one 16-byte ICONDIRENTRY per image, then the PNGs.
   A width or height of 256 is written as 0, which is why the byte is
   masked rather than assigned. */
const ico = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;

  images.forEach(({ size, data }, i) => {
    const at = i * 16;
    directory.writeUInt8(size & 0xff, at);
    directory.writeUInt8(size & 0xff, at + 1);
    directory.writeUInt8(0, at + 2); // palette size, 0 for truecolour
    directory.writeUInt8(0, at + 3); // reserved
    directory.writeUInt16LE(1, at + 4); // colour planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel
    directory.writeUInt32LE(data.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });

  return Buffer.concat([header, directory, ...images.map((i) => i.data)]);
};

const images = await Promise.all(
  ICO_SIZES.map(async (size) => ({
    size,
    data: await square(size, { rgba: true }),
  })),
);
writeFileSync("src/app/favicon.ico", ico(images));

writeFileSync("src/app/icon.png", await square(256));
writeFileSync("src/app/apple-icon.png", await square(180));

console.log(
  `wrote src/app/favicon.ico (${ICO_SIZES.join(", ")}px), icon.png (256px), apple-icon.png (180px)`,
);
