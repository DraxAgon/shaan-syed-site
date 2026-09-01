# Handoff

- **Live site:** https://shaan-syed.vercel.app
- **Repo:** https://github.com/DraxAgon/shaan-syed-site
- **Local path:** `C:\Users\shaan\Projects\shaan-syed-site`

---

## 1. The one thing only you can supply

**Your photo.** Two slots, both still placeholders:

```
public/images/portrait-hero.webp   1200x1500  4:5  home
public/images/portrait-bio.webp    1000x1000  1:1  bio
```

Overwrite each with the same filename and push. No code change. The
home portrait renders at 208px wide and the bio one at 128px, so crop
tight on your face.

Everything else on the site now uses real imagery: organisation logos
pulled from their official sites, brand icons for the tech stack, and a
live screenshot of riloai.app.

## 2. Pages

| Route | Holds |
|---|---|
| `/` | Portrait and identity on the left. Built and Experience as expandable rows on the right, then the skills runs. |
| `/bio` | The first-person paragraphs, education, high school record, and interests. |
| `/projects` | A numbered index with a detail panel. `?p=Loxbox` deep-links to one. |
| `/awards` | Honours, completed certifications, and in-progress certifications. |

There is no resume page. Nothing repeats across pages.

## 3. Editing content

All content is typed data in `src/content/`. Nothing is hard-coded in
the pages.

| File | Holds |
|---|---|
| `profile.ts` | Name, subtitle, the one-line summary, social links |
| `projects.ts` | The four projects, in the order they appear |
| `experience.ts` | The Experience rows, in the order they appear |
| `education.ts` | Degrees, high school, high school record, interests |
| `skills.ts` | The two skill runs |
| `awards.ts`, `certifications.ts` | The `/awards` page |
| `bio.ts` | The `/bio` paragraphs |

### The copy is written to not go stale

The site is a record of what you have built, not a status feed. Nothing
says "currently" or names a work in progress, so it stays true without
edits. Keep it that way when you add things.

### Two facts that must not drift

- The Ignition Hacks result is **`3rd Place, Best Use of Base44`**, a
  sponsor track placement, not an overall win. Do not let it become
  "winner" or "award-winning".
- In-progress certifications sit in their own group on `/awards` and are
  never styled to read as earned.

### The language check

```
npm run build
npm run start                  # one terminal
node scripts/copy-audit.mjs    # another
```

Exits non-zero if a banned word, an em dash, an en dash, or an
exclamation point reaches the rendered pages.

## 4. Regenerating assets

```
node scripts/fetch-logos.mjs           # org logos from official sites
node scripts/generate-icons.mjs        # brand icons from simple-icons
node scripts/shoot-project-sites.mjs   # screenshot riloai.app
node scripts/generate-placeholders.mjs # the two portrait placeholders
```

`fetch-logos.mjs` prints MISS for any org it cannot find a logo for.
Only Sumo Dino MISSes now, so it renders as a monogram tile, which is
deliberate rather than a broken image. Drop a real `logo-sumodino.webp`
(256x256) into `public/images` and set the path in `experience.ts` to
use it.

Northern Secondary School publishes no standalone crest. The script
crops it out of the school's own site banner, which runs crest, photo,
crest. It cuts at the white gutter after the first crest rather than at
a fixed fraction, then keys the white ground to transparent. That lives
in the `PREP` map at the top of `fetch-logos.mjs`, which is the one
place to fix if TDSB ever reshoots the banner.

## 5. Redeploy

```
git add -A
git commit -m "content: ..."
git push
```

Vercel builds and deploys `main` automatically. Run `npm run build`
first; a broken build on `main` is a failed deploy.

## 6. Custom domain

`shaansyed.com` and `shaansyed.dev` are the natural choices.

1. Buy it, then in the Vercel dashboard open the project, Settings,
   Domains, Add.
2. Vercel prints the DNS records to set.
3. **Then set `siteUrl` in `src/content/profile.ts`** and push. That one
   value feeds the canonical URL, the sitemap, `robots.txt`, the JSON-LD
   and the Open Graph tags. Skip it and link previews keep pointing at
   the vercel.app address.

## 7. Open items

| Item | State | Where |
|---|---|---|
| Your portrait | placeholder | `public/images/portrait-*.webp` |
| Rilo copy vs riloai.app | conflict, see below | `projects.ts` |
| Phantom links | none, repo is private | `projects.ts` |
| Sumo Dino logo | monogram | `experience.ts` |
| Northern start year | `2022` | `education.ts` |
| First co-op employer | omitted | `bio.ts` |

### The Rilo conflict is worth a look

The copy you gave me says Rilo "never sends anything" and contrasts it
against tools that "ask for full OAuth inbox access". Your own landing
page at riloai.app says "Secure Google OAuth" and "lets you send it
without ever leaving your inbox", and that screenshot now sits directly
above the paragraph on `/projects`.

Both claims are on the page at once and they read as contradictory. I
left your wording untouched because you wrote it, but one of the two
needs to change.

### Phantom has no links

`github.com/rayaandev/ignitionhacks-2026` is a private repo, so it
returns 404 for anyone who is not a collaborator. Rather than ship a
dead link the entry has none. Make the repo public, or supply the
Base44 app URL, and add it back to the `links` array.

## 8. Deliberately left out

- No analytics, no cookie banner, no tracking.
- No phone number.
- No install counts for Rilo. They go stale.
- No availability line. You asked for it gone.
