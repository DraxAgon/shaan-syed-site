# Handoff

- **Live site:** https://shaan-syed.vercel.app
- **Repo:** https://github.com/DraxAgon/shaan-syed-site
- **Local path:** `C:\Users\shaan\Projects\shaan-syed-site`

---

## 1. The photos

All five slots now hold real photos, so nothing is outstanding here.

```
public/images/portrait-hero.webp    960x1200  4:5   home
public/images/bio-grad.webp        1000x1333  3:4   bio, frame 01
public/images/bio-piano.webp       1000x1704  ~4:7  bio, frame 02
public/images/bio-noodles.webp     1000x750   4:3   bio, frame 03
public/images/bio-city.webp        1000x1333  3:4   bio, frame 04
```

To swap one, overwrite the file and update its `width` and `height`
where it is declared: the home portrait in `src/app/page.tsx`, the rail
in `bioPhotos` in `src/content/bio.ts`. Next needs the real pixel
dimensions to reserve the space, so a new photo at a different ratio
means editing those two numbers as well as the file.

The home portrait renders at 208px wide and is a cutout composited onto
`--color-lift`, which is the same tone as the plate behind it, so the
padding around the shoulders is invisible. Match that tone if you
replace it with another cutout. The bio rail renders around 260px wide
and its shapes differ on purpose, so crop each frame to its own ratio
rather than to a single shape.

The rail carries no captions: the prose beside it already says what each
photo is, so only `alt` text is stored, in `src/content/bio.ts`. To add
or drop a frame, edit that array; the tilt cycles every four frames, so
the rail stays crooked at any count.

Everything else on the site uses real imagery too: organisation logos
pulled from their official sites, brand icons for the tech stack, and a
live screenshot of riloai.app.

## 2. Pages

| Route | Holds |
|---|---|
| `/` | Portrait and identity on the left. Built and Experience as expandable rows on the right, then the skills runs. |
| `/bio` | A tilted photo rail on the left, the first-person paragraphs on the right, then education, high school record, and interests full width. |
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
exclamation point reaches the rendered pages. Point it somewhere else
with `AUDIT_BASE`, not `BASE`.

`/` `/bio` `/awards` and the 404 are read straight off the wire.
`/projects` is not: it draws its panels on the client, so the served
HTML is a few hundred characters and none of the copy. The audit opens
each project in headless Chrome instead, and walks the Redi rail so
every caption has been on screen before it reads. It refuses to report
clean on a panel that did not render, because a check that cannot fail
is worse than no check. That is not hypothetical here: the banned-word
half of this script spent its whole life matching a backspace
character instead of a word boundary and reported every page clean.
Both halves now self-test on startup and exit 2 if either is broken.

### The interaction check

`next build` says nothing about whether the demos, the disclosure rows
or the nav menu still work. This does:

```
npm run build && npm run start   # one terminal
node scripts/check-site.mjs      # another
```

41 checks, exits non-zero on the first failure. Set `BASE` to point it
at the deployed site instead of localhost.

One of them only runs against a deployed origin. riloai.app allows
framing from the two Vercel hosts and not from localhost, so "the real
page loads inside the frame" is skipped locally. It also cannot be
asserted the obvious way: Chrome puts a cross-origin iframe in its own
process, so the parent's frame tree never lists it, and a frame that
was refused still fires `onload` and still answers 200. The check
therefore wants both a 200 for the document and no
`ERR_BLOCKED_BY_RESPONSE`.

## 4. Regenerating assets

```
node scripts/fetch-logos.mjs           # org logos from official sites
node scripts/generate-icons.mjs        # brand icons from simple-icons
node scripts/shoot-project-sites.mjs   # screenshot riloai.app
node scripts/generate-placeholders.mjs # fills any missing image slot
```

### The project demos

**There are no recordings any more.** Every project is either framable
live or rebuilt in the browser, and a video of a thing the visitor could
be clicking is the worse version of it. The `video` mode is gone from
`project-demo.tsx`, the four `.mp4` and poster files are deleted, and
`src`/`poster`/`label` are gone from the `demo` type. `record-demo.mjs`
and `record-interaction.mjs` still exist but nothing renders what they
produce, so treat them as unused unless you put the mode back.

```
node scripts/capture-fullpage.mjs https://riloai.app rilo-page 1280 2
```

`capture-fullpage.mjs` grabs a whole page as one tall WebP for the
scroll mode, which is the fallback if framing is ever withdrawn.

Whether a project gets a live embed or a scrollable capture comes down
to one header. Phantom sends no `X-Frame-Options`. riloai.app now sends
`frame-ancestors 'self'` plus the two Vercel origins, so it frames here
and nowhere else; `/login` is still `SAMEORIGIN` and stays that way.

Every project has something hands-on:

| Project | How it works |
|---|---|
| Rilo | The real page, framed live, opening on its own demo section |
| Redi AI | The app rebuilt screen by screen, walk it |
| Phantom | The live app, fully clickable, with a guide beside it |

Two details worth knowing:

- **Rilo opens on `#demo`, zoomed out.** The fragment lands the frame on
  the demo rather than the hero. `liveZoom: 0.62` then draws the frame
  1/0.62 larger and scales it back down, so riloai.app still lays itself
  out at a real desktop width and the whole demo fits the panel in one
  view instead of needing a scroll.
- **Phantom's case cannot be deep linked.** The app routes on
  `#companies` and `#explorer` only; which case is open is internal
  state, so it always opens on the Amazon list, and those entries are
  marked "Illustrative project" in the app itself. Rather than leave a
  visitor there, the panel carries a `guide` beside the frame that sends
  them to the Kariba case first, which is the real registered project
  with buyers on public record. If Phantom ever reads a case from the
  URL, drop the guide's first step and point `liveUrl` straight at it.

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
Nothing MISSes now. Any org that does start missing falls back to a
monogram tile, which is deliberate rather than a broken image.

Sumo Dino's site is a Square Online app shell, so the logo is not in
the served HTML as an `<img>`; the two candidate URLs in the script are
the header mark and the round festival badge, both read out of the
shell's bootstrap state. If either 404s, re-read that state from
`https://www.sumodinoclawcity.com/` rather than guessing a path.

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
| Rilo copy vs riloai.app | conflict, see below | `projects.ts` |
| Rilo's "100+ downloads" | your number, unverified here | `projects.ts` |
| Phantom links | none, repo is private | `projects.ts` |
| Northern start year | `2022` | `education.ts` |
| First co-op employer | omitted | `bio.ts` |

### Stage and tags

Each project carries a `stage`, in its own chip so it reads as a state
rather than as another fact about the work, and optional `tags` for
things the prose does not already say. `Stage` is a fixed union, because
a free string drifts into marketing. Only `Published` takes the brass;
everything else is the same quiet chip, so the page cannot read as
though four projects had all shipped.

Two of these are judgement calls, so check them:

- **Rilo's `100+ downloads` is your figure**, not one I could verify. It
  is phrased as a floor so it stays true as the number grows, but it is
  still the one thing on the site that can go stale, which is why the
  old note said no install counts. Change or drop it if it is wrong.
- **Loxbox reads `Early development`.** It was `Preparing release`,
  which you said overstated it: that phrasing reads as a checklist away
  from the App Store, and there is no build anyone can install. The
  entry now says early in four places, on purpose, since one of them
  alone is easy to skim past: the stage chip, the status line
  ("Mobile, and early"), a `No public build yet` tag, and a closing
  paragraph saying nothing is settled and there is no date. The chip
  also draws with a dashed border, the visual opposite of the brass one
  a published project gets. When it does get closer, walk it back up
  through `Preparing release` to `Published` plus the store link.

Tags are otherwise deliberately thin. I only wrote ones I could check
against the repo, so Phantom has none and Loxbox's says only what is
absent. It is a good slot for real numbers once you have them.

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
