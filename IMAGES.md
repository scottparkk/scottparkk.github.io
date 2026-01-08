# Image Contribution Guide

Phase 3 establishes a lightweight, performance‑first image pipeline.

## Goals
- Responsive, optimized images without client JS
- Modern formats (AVIF/WebP) generated automatically later (future enhancement)
- Consistent naming & alt text for accessibility
- Prevent layout shift (fixed aspect ratios)

## Where Images Live
| Type | Location | Notes |
|------|----------|-------|
| Project assets (normalized) | `public/images/projects/<type>/<slug>/` | `cover.<ext>` + additional gallery files |
| Blog hero (current) | `public/images/blog/` | Optional `hero` field in blog frontmatter |
| Future imported assets | `src/assets/projects/` | Planned migration for automatic variants (`image()` schema) |
| Favicons / static | `public/` | Served as‑is |

## Adding / Normalizing a Project Cover (Current Convention)
After running the normalization script, each project expects:

```
public/images/projects/<type>/<slug>/cover.<ext>
```

Steps:
1. Export master (JPEG/PNG/WebP) max ~1600–2000px on longest side.
2. Compress (target <300KB ideally) – illustration/flat art can be far smaller.
3. Create folder: `public/images/projects/<type>/<slug>/` (type = `creative` | `technical`).
4. Save as `cover.<ext>` (use `.jpg` for photographic, `.png` for transparency, consider `.webp` if you already have it).
5. Any gallery images: drop alongside (`detail-1.jpg`, `alt-version.png`, etc.). Keep names lowercase kebab.
6. Frontmatter already rewritten to point to `/images/projects/<type>/<slug>/cover.<ext>` and gallery files. If you change an extension, update the markdown (or re-run a future enhancement script).
7. Run `npm run check:images` to verify nothing missing.

## Naming Conventions
- Lowercase, hyphen-separated; avoid spaces & uppercase.
- For covers we now standardize to `cover.<ext>` inside the slug folder.
- Gallery: short descriptive names: `arch-diagram.jpg`, `v2-palette.png`, `layout-mobile.jpg`.

## Alt Text Guidelines
Describe the content *not* the medium.
Good: `Line chart showing request throughput climbing steadily above 10k rps.`
Avoid: `Image of a chart` or redundant `Screenshot of...` unless necessary.
Decorative images (pure flourish) can be omitted or later use `alt=""`.

## Aspect Ratios
- Cards: approximate 4:3 (enforced via CSS `aspect-[4/3]`). Crop/compose accordingly.
- If your source is a very tall/vertical image, consider a separate landscape crop for the cover.

## Blur / Placeholder (Future Option)
Currently we rely on fast optimized delivery and proper sizing. If we add a blur placeholder:
- We'll generate a tiny (24–32px) version and inline as a background while the main image loads.
- This stays optional; performance is already good for modest file sizes.

## Migration Path (Imported Images)
Later we can switch from string paths to imported modules:
```md
cover: ../assets/projects/api-gateway-cover.jpg
```
Then `image()` in the content schema will validate and `<Image />` can generate multiple formats. No frontmatter changes besides the path form.

## Checklist Before Committing
- Width ≤ 2000px (master)
- File size reasonable (< 300KB typical cover; diagrams often <150KB)
- Descriptive `coverAlt` provided
- Folder structure correct (`/images/projects/<type>/<slug>/`)
- Cover named `cover.<ext>`
- `npm run check:images` passes

## FAQ
**Do I have to manually create multiple sizes?** Not now. We use a single master. Future enhancement will automate variants.

**When do we need an external service?** Reassess if > 400 images or build time becomes slow.

**What about SVG?** Inline small SVG illustrations directly in markdown or components for better control.

---

Questions or refinements: update this doc as the pipeline evolves.
