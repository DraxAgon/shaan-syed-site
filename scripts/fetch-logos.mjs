/**
 * Downloads organisation logos from their official sites and writes
 * them as 256x256 WebP into public/images.
 *
 * Any org that has no usable source is reported as MISS and falls back
 * to a monogram tile in the UI, which is intentional rather than a
 * broken image. Re-run with: node scripts/fetch-logos.mjs
 */
import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const OUT = "public/images/";

const PICKS = {
  "logo-toronto": ["https://www.toronto.ca/wp-content/themes/cot/img/apple-touch-icon.png"],
  "logo-waterloo": [
    "https://uwaterloo.ca/profiles/uw_base_profile/themes/uw_fdsu_theme_resp/icon.svg",
    "https://uwaterloo.ca/profiles/uw_base_profile/themes/uw_fdsu_theme_resp/apple-touch-icon.png",
  ],
  "logo-laurier": ["https://www.wlu.ca/apple-touch-icon.png"],
  "logo-strello": ["https://strello.health/apple-touch-icon.png", "https://strello.health/favicon.png"],
  "logo-targetalpha": [
    "https://images.squarespace-cdn.com/content/v1/62e9d92459966a0033b73d2d/38fbb8e7-3b8b-4a6a-94e9-695182c9b14a/favicon.ico",
  ],
  "logo-northern": [
    "https://northernsecondaryschool.ca/apple-touch-icon.png",
    "https://www.northernss.com/apple-touch-icon.png",
    "https://schoolweb.tdsb.on.ca/Portals/northern/favicon.ico",
  ],
  "logo-sumodino": ["https://sumodino.ca/apple-touch-icon.png", "https://sumodino.com/favicon.ico"],
};

const results = {};
for (const [name, urls] of Object.entries(PICKS)) {
  let done = false;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200) continue;
      await sharp(buf, { density: 384 })
        .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 92 })
        .toFile(OUT + name + ".webp");
      console.log(`OK   ${name.padEnd(18)} ${buf.length}B  <- ${url.slice(0, 68)}`);
      results[name] = true;
      done = true;
      break;
    } catch {
      /* try the next candidate */
    }
  }
  if (!done) {
    console.log(`MISS ${name.padEnd(18)} no usable source, will use a monogram`);
    results[name] = false;
  }
}
console.log("\n" + JSON.stringify(results, null, 1));
