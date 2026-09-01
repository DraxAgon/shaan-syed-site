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
  /* The school publishes no standalone crest. The site banner carries
     it twice, so the left third is cropped out and the white ground is
     keyed to transparent by PREP below. */
  "logo-northern": [
    "https://schoolweb.tdsb.on.ca/Portals/northernss/Banners/w_northern%20banner%203.png",
  ],
  "logo-sumodino": ["https://sumodino.ca/apple-touch-icon.png", "https://sumodino.com/favicon.ico"],
};

/* Per-org preprocessing, applied before the shared resize. Only orgs
   whose only public source is a composite image need an entry here. */
const PREP = {
  /* The banner is crest, photo, crest. Cut at the white gutter after
     the first crest rather than at a fixed fraction, so a reshot
     banner cannot leave a slice of the photo in the logo. Then key the
     white ground to transparent, with a short feather so the edges
     stay smooth on the cream logo tile. */
  "logo-northern": async (buf) => {
    const flat = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = flat.info;

    const whiteColumn = (x) => {
      for (let y = 0; y < height; y++) {
        const o = (y * width + x) * 4;
        if (Math.min(flat.data[o], flat.data[o + 1], flat.data[o + 2]) < 235) return false;
      }
      return true;
    };

    let cut = width;
    let seenCrest = false;
    let run = 0;
    for (let x = 0; x < width; x++) {
      if (whiteColumn(x)) {
        run++;
        if (seenCrest && run >= 6) {
          cut = x - run + 1;
          break;
        }
      } else {
        seenCrest = true;
        run = 0;
      }
    }

    const crest = await sharp(buf)
      .extract({ left: 0, top: 0, width: cut, height })
      .trim({ background: "#ffffff", threshold: 20 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = crest;
    for (let i = 0; i < info.width * info.height; i++) {
      const o = i * 4;
      const min = Math.min(data[o], data[o + 1], data[o + 2]);
      data[o + 3] = min >= 245 ? 0 : min > 215 ? Math.round((255 * (245 - min)) / 30) : 255;
    }
    return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png()
      .toBuffer();
  },
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
      let buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200) continue;
      if (PREP[name]) buf = await PREP[name](buf);
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
