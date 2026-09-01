/**
 * Pulls real preview imagery for the projects that have a public
 * presence, and writes it as 1600x900 WebP into public/images.
 *
 * A project with no public source keeps no image, and the projects
 * page simply renders it as prose. Re-run with:
 *   node scripts/fetch-project-images.mjs
 */
import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const SOURCES = {
  "project-rilo": "https://riloai.app",
  "project-phantom": "https://github.com/rayaandev/ignitionhacks-2026",
};

for (const [name, site] of Object.entries(SOURCES)) {
  try {
    const res = await fetch(site, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.log(`MISS ${name.padEnd(16)} site HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();
    const base = new URL(res.url);

    const candidates = [];
    for (const m of html.matchAll(
      /<meta[^>]+(?:property|name)="(?:og:image|twitter:image)(?::src)?"[^>]*content="([^"]+)"/gi,
    )) {
      try {
        candidates.push(new URL(m[1], base).href);
      } catch {}
    }

    let done = false;
    for (const url of [...new Set(candidates)]) {
      try {
        const img = await fetch(url, {
          headers: { "User-Agent": UA },
          signal: AbortSignal.timeout(15000),
        });
        if (!img.ok) continue;
        const buf = Buffer.from(await img.arrayBuffer());
        if (buf.length < 3000) continue;
        const meta = await sharp(buf).metadata();
        if (!meta.width || meta.width < 400) continue;
        await sharp(buf)
          .resize(1600, 900, { fit: "cover", position: "top" })
          .webp({ quality: 86 })
          .toFile(`public/images/${name}.webp`);
        console.log(`OK   ${name.padEnd(16)} ${meta.width}x${meta.height} <- ${url.slice(0, 60)}`);
        done = true;
        break;
      } catch {}
    }
    if (!done) console.log(`MISS ${name.padEnd(16)} no usable og:image`);
  } catch (e) {
    console.log(`MISS ${name.padEnd(16)} ${e.name}`);
  }
}
