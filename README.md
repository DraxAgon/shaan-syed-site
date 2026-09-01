# shaan-syed-site

Personal site for Shaan Syed. Next.js App Router, TypeScript, Tailwind
CSS v4. Fully static, no CMS, no database, no analytics.

## Local development

```
npm install
npm run dev
```

Then open http://localhost:3000.

```
npm run build     # production build, must pass clean before deploying
npm run start     # serve the production build locally
npm run lint      # eslint
npx tsc --noEmit  # type check
```

## Editing content

All content lives as typed objects in `src/content/`. Pages map over
that data, so nothing is hard-coded in JSX. Adding a job is a one-object
edit.

| File | Holds |
|---|---|
| `profile.ts` | Name, subtitle, hero line, availability line, social links |
| `experience.ts` | The Experience list on the home page |
| `projects.ts` | The four project entries |
| `education.ts` | Degrees, high school, the high school record, interests |
| `skills.ts` | The two labelled skill runs |
| `awards.ts` | Awards and honours |
| `certifications.ts` | Completed and in-progress certifications |
| `bio.ts` | The first-person paragraphs on `/bio` |

## Copy rules

Site copy follows a strict style: no em dashes, no en dashes, no
exclamation points, and a banned vocabulary list. The audit is
automated. With the production server running:

```
npm run build && npm run start
node scripts/copy-audit.mjs
```

It exits non-zero if any hard rule is broken. Run it after editing copy.

## Images

See `public/images/PLACEHOLDERS.md`. Every slot ships as a committed
placeholder at the right dimensions; swapping in a real photo is mostly
a filename drop.

## Design

One idea, applied everywhere: a 112px right-aligned metadata rail. The
section heading, every org logo and every date align to a single
vertical axis, and that axis is the left edge of the 680px prose
measure. `src/components/section.tsx` is the only layout primitive.

Colour tokens and their measured contrast ratios are documented at the
top of `src/app/globals.css`. `--brass` is text and stroke only; it
fails contrast as a fill behind light text.
