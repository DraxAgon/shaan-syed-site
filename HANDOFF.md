# Handoff

Everything you need to change this site yourself.

- **Live site:** see the URL at the top of the delivery message
- **Repo:** https://github.com/DraxAgon/shaan-syed-site
- **Local path:** `C:\Users\shaan\Projects\shaan-syed-site`

---

## 1. Swap in your real photos

Every image is a committed placeholder at the correct dimensions. For
the portraits and the org logos, **overwrite the file with the same
filename** and redeploy. No code change.

```
public/images/portrait-hero.webp    1200x1500   4:5   home hero
public/images/portrait-bio.webp     1000x1000   1:1   bio page
public/images/logo-toronto.webp      256x256    1:1
public/images/logo-strello.webp      256x256    1:1
public/images/logo-sumodino.webp     256x256    1:1
public/images/logo-targetalpha.webp  256x256    1:1
public/images/logo-northern.webp     256x256    1:1
public/images/logo-waterloo.webp     256x256    1:1
public/images/logo-laurier.webp      256x256    1:1
```

Both portraits render at 112px wide, so crop tight. Logos sit on a 28px
tile, so square crops only.

The four `project-*.webp` files are the one exception. Project images
are off by default so the projects page stays prose-led. To turn one
on, drop the file in and add one line to that project in
`src/content/projects.ts`:

```ts
image: "/images/project-rilo.webp",
```

Full detail is in `public/images/PLACEHOLDERS.md`.

## 2. Swap in your real resume

Replace `public/Shaan_Syed_Resume.pdf` with the real file, same
filename. The `/resume` page embeds it and offers it as a download.
If the file is ever missing the page still renders and says so rather
than showing a broken frame.

## 3. Edit content

All content is typed data in `src/content/`. Nothing is hard-coded in
the page components, so adding a job means adding one object.

| File | Holds |
|---|---|
| `profile.ts` | Name, subtitle, hero line, availability line, socials |
| `experience.ts` | The home page Experience list |
| `projects.ts` | The four project entries |
| `education.ts` | Degrees, high school, high school record, interests |
| `skills.ts` | The two labelled skill runs |
| `awards.ts` | Awards and honours |
| `certifications.ts` | Completed and in-progress certifications |
| `bio.ts` | The first-person paragraphs on `/bio` |

### Copy rules are enforced, not just documented

The site copy bans em dashes, en dashes, exclamation points and a long
list of filler vocabulary. After editing any copy, run the audit:

```
npm run build
npm run start          # in one terminal
node scripts/copy-audit.mjs   # in another
```

It exits non-zero if a hard rule is broken and prints exactly what it
found. It reads the rendered pages, so it catches meta descriptions and
alt text too.

### Two facts that must not drift

- The Ignition Hacks result is **`3rd Place, Best Use of Base44`**, a
  sponsor track placement. It was not an overall hackathon win. Do not
  let this become "winner", "award-winning" or "Base44 track".
- In-progress certifications live in their own group and are never
  styled to read as earned. Only move one to Completed when it is.

## 4. Redeploy

The Vercel project is connected to the GitHub repo, so:

```
git add -A
git commit -m "content: update experience"
git push
```

Vercel builds and deploys `main` automatically. Watch it at
https://vercel.com/dashboard.

Always run `npm run build` locally first. A broken build on `main` means
a failed deploy.

## 5. Attach a custom domain

`shaansyed.com` and `shaansyed.dev` are the natural choices.

1. Buy the domain (Vercel sells them directly, or use any registrar).
2. Vercel dashboard, select the project, Settings, Domains, Add.
3. Vercel shows the DNS records to set. If you bought through Vercel
   this is automatic; otherwise add an `A` record to `76.76.21.21` or
   the `CNAME` Vercel gives you.
4. **Then update `siteUrl` in `src/content/profile.ts`** and push. That
   value feeds the canonical URL, the sitemap, `robots.txt`, the JSON-LD
   `Person` schema and the Open Graph tags. If you skip this, link
   previews and search results keep pointing at the vercel.app URL.

## 6. Open questions

These were flagged rather than guessed. All are one-line edits.

| Item | Currently | Where to change |
|---|---|---|
| Northern Secondary start year | `2022` | `education.ts`, `highSchool.dates`. LinkedIn says 2022, an older resume said September 2023. 2022 matches a four-year program ending June 2026. |
| First co-op employer | omitted | Not named anywhere in the source material, so nothing was invented. Add to `bio.ts` when it is signed. |
| Phantom live app link | omitted | `projects.ts`, add to the Phantom `links` array once the Base44 app URL exists. The repo link is live now; a dead link would have been worse. |
| Other social handles | GitHub, LinkedIn, email only | `profile.ts`, `socials`. |

## 7. Things deliberately left out

- No analytics, no cookie banner, no tracking of any kind.
- No phone number. It belongs on the resume, not a public page.
- No install counts for Rilo. They go stale and nobody updates them.
- No "Hire me" button. The availability line in the footer does that job
  more quietly.
