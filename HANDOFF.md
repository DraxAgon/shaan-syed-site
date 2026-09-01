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

### The interaction check

`next build` says nothing about whether the demos, the disclosure rows
or the nav menu still work. This does:

```
npm run build && npm run start   # one terminal
node scripts/check-site.mjs      # another
```

24 checks, exits non-zero on the first failure. Set `BASE` to point it
at the deployed site instead of localhost.

## 4. Regenerating assets

```
node scripts/fetch-logos.mjs           # org logos from official sites
node scripts/generate-icons.mjs        # brand icons from simple-icons
node scripts/shoot-project-sites.mjs   # screenshot riloai.app
node scripts/generate-placeholders.mjs # the two portrait placeholders
```

### The project demos

```
node scripts/record-demo.mjs https://riloai.app rilo-demo 14
node scripts/record-interaction.mjs scripts/demos/phantom.json
node scripts/capture-fullpage.mjs https://riloai.app rilo-page 1280 2
```

`record-demo.mjs` pans down a page. `record-interaction.mjs` drives an
app through a timed click script, which is what Phantom needs since it
is a dashboard rather than a scrolling page; its steps live in
`scripts/demos/phantom.json`. `capture-fullpage.mjs` grabs a whole page
as one tall WebP for the scroll mode.

Whether a project gets a live embed or a scrollable capture comes down
to one header. Phantom sends no `X-Frame-Options`, so it embeds live and
stays clickable. riloai.app sends `X-Frame-Options: SAMEORIGIN`, so a
browser refuses to frame it and the scroll capture stands in. If you
ever want Rilo embedded live, that header on your own server is the
thing to change, and weakening it only for this is probably not worth
it.

Every project has something hands-on:

| Project | Recording | Hands-on |
|---|---|---|
| Rilo | 14s scroll-through | Scroll the real page, buttons work |
| Redi AI | none, nothing public yet | Walk the app, screen by screen |
| Phantom | 17.5s Kariba walkthrough | Open the live app, fully clickable |

The Rilo capture is flat, so `capture-fullpage.mjs` also records where
every button sits and where it points, into
`src/content/rilo-page-hotspots.json`. Those become invisible overlays:
Add to Chrome opens the Web Store, Get Started opens the login page, and
the in-page links scroll the panel instead of leaving the site.
Re-running the capture regenerates the hotspots, so the two never drift.
The trailing `2` captures at twice the pixel density, which is what keeps
the page sharp when the panel draws it smaller than its natural width.
If you re-capture, copy the printed `scrollImageWidth` and
`scrollImageHeight` into `projects.ts`.

Redi AI has no public build, so its panel is the app's own screens
rebuilt in the browser rather than a capture: Home, both steps of adding
a role, the question, the follow up and the report, walked in order.

Three files, all under `src/components`:

| File | Holds |
|---|---|
| `redi-demo.tsx` | The screens, the walkthrough rail, and the role parser |
| `redi-orb.tsx` | Redi's face, from the ratios in the app's `rediConfig.ts` |
| `redi-filament.tsx` | The gold line, in its hairline, travel, wave and pulse states |

The values come from the RediAI repo and the comments name the file each
one came from: the palette from `src/theme/color.ts`, the type ramp from
`type.ts`, the spacing and radii from `layout.ts`, the six skills and
their hues from `src/shared/skills.ts` plus `SKILL_HUE_NAMES`, and the
question, the answer and the follow up verbatim from the QA log in
`QUESTIONS.md`. If a screen changes in the app, those are the places to
re-read.

The phone is drawn at the app's own 393x844 and scaled as one piece by
`--zoom`, so every number in the CSS is the number in the app rather
than a guess at what it would be at some other width. The panel sizes
off `@container redi`, not the window: the projects browser goes two
column at 900px and the panel is about 560px wide there, so a viewport
breakpoint would put the phone and the rail side by side in a box too
narrow for both.

Two things are true and the panel says both: nothing calls a model, and
the scores are fixed. What you type in the role box is read by a few
lines of regex in `readRole` and carried through the rest of the
walkthrough, so the title, the organisation and the blurb follow your
own words. Redi's three faces (Bricolage Grotesque, Instrument Sans,
JetBrains Mono) are loaded in `src/app/layout.tsx` with `preload: false`,
because they are drawn on one panel of one page.

If you want it replaced with real screens, an Expo build or a TestFlight
link is all it takes.

Phantom's demo deliberately runs the **Kariba case** rather than the
Amazon list. Kariba is a real project with real buyers on public
record; the Amazon entries are marked "Illustrative project" in the app
itself, so putting them in a portfolio demo would show invented numbers
as if they were findings.

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
