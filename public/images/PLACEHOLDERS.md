# Image placeholders

Every file below is committed as a solid on-brand tone at the exact
target dimensions. To use a real image, **overwrite the file with the
same filename**. No code change is needed for the portraits and logos.

Regenerate all placeholders with:

```
node scripts/generate-placeholders.mjs
```

## Portraits

| File | Used on | Target size | Aspect | Note |
|---|---|---|---|---|
| `portrait-hero.webp` | Home hero | 1200x1500 | 4:5 | Renders at 112px wide. Crop tight, the rail is narrow. |
| `portrait-bio.webp` | Bio page | 1000x1000 | 1:1 | Square crop, also renders at 112px. |

## Organisation logos

Rendered on a 28px tile with a hairline border, so a transparent PNG
converted to WebP works well. Square crops only.

| File | Used for | Target size | Aspect |
|---|---|---|---|
| `logo-toronto.webp` | City of Toronto | 256x256 | 1:1 |
| `logo-strello.webp` | Strello Health | 256x256 | 1:1 |
| `logo-sumodino.webp` | Sumo Dino | 256x256 | 1:1 |
| `logo-targetalpha.webp` | Target Alpha | 256x256 | 1:1 |
| `logo-northern.webp` | Northern Secondary | 256x256 | 1:1 |
| `logo-waterloo.webp` | University of Waterloo | 256x256 | 1:1 |
| `logo-laurier.webp` | Lazaridis / Laurier | 256x256 | 1:1 |

## Project images (optional)

These are the one exception to the filename-drop rule. The projects
page is prose-led, so a project image is **off by default**. Dropping
in the file is step one; step two is one line in
`src/content/projects.ts`.

| File | Used for | Target size | Aspect |
|---|---|---|---|
| `project-rilo.webp` | Rilo | 1600x900 | 16:9 |
| `project-rediai.webp` | Redi AI | 1600x900 | 16:9 |
| `project-phantom.webp` | Phantom | 1600x900 | 16:9 |
| `project-loxbox.webp` | Loxbox | 1600x900 | 16:9 |

To turn one on, add the `image` field to that project object:

```ts
{
  name: "Rilo",
  // ...
  image: "/images/project-rilo.webp",
}
```

Leaving `image` unset renders the entry as prose with no empty box,
which is why the four placeholders do not show up on the live site.
