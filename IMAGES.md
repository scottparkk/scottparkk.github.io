# Image Guide

Images are re-mastered on the way into the repo, then Astro generates responsive
variants at build time. You add one file; the build produces the rest.

## Where images live

| Type | Location | Notes |
|------|----------|-------|
| Project assets | `src/assets/images/projects/<type>/<slug>/` | `cover.<ext>` plus gallery files. `<type>` is `creative` or `technical`. |
| About page photos | `src/assets/images/my_life/`, `src/assets/images/albums/` | Referenced from `src/pages/about.astro` |
| Favicon, fonts, PDFs | `public/` | Served as-is, never processed |

Content always references images by the web-style path `/images/…`, **not** by
their real location. `src/lib/images.ts` maps between the two. This is
deliberate: it keeps frontmatter independent of where assets physically sit, so
the storage layer can change without touching how images render.

A path that doesn't resolve **fails the build** rather than 404ing silently.

## Adding images

The scaffold script does everything, including compression:

```
npm run scaffold:projects -- <path-to-image-folder> [--type=creative|technical]
```

It copies each image into `src/assets/images/projects/<type>/<slug>/`, re-masters
it, and writes `src/content/projects/<slug>.md` with `draft: true` and the correct
paths. Fill in `summary`, `stack`, `role`, and `tags` afterward.

Adding by hand instead? Drop the file in the right folder, then:

```
npm run images:process
```

Never commit a raw camera or print export. One 8334×10417 PNG is 90 MB; the same
image as a master is 0.4 MB.

## Re-mastering

| Command | Does |
|---------|------|
| `npm run images:plan` | Dry run — reports savings, writes nothing |
| `npm run images:process` | Re-masters in place, updates references if extensions change |
| `node scripts/verify-images.mjs /tmp/qc` | Compares against the Desktop originals, reports SSIM/PSNR |

Both read `scripts/lib/process-image.mjs`, which is the single source of truth for
compression. The planned local ingest tool imports the same function so every
path produces identical output.

**Always re-master from the originals**, never from files already in the repo.
Re-compressing a compressed image compounds loss. Masters live at
`~/Desktop/portfolio-image-originals/`.

## Format and size policy

Set in `scripts/lib/process-image.mjs`, chosen by measurement on this project:

- **PNG → WebP** (q82). Flat and illustrated artwork; ~97% smaller.
- **JPEG → mozjpeg** (q82). On already-lossy photos mozjpeg beats WebP by ~25%.
- **Animated GIF → animated WebP** (q75). Frames preserved.
- **Width capped at 2560px**, height at 16000px.

Width, not "long edge" — capping the long edge squashes tall images. The 16000px
height ceiling exists because WebP refuses to encode above 16383px and fails
outright rather than degrading.

A grainy photo occasionally needs more than q82. Check with `verify-images.mjs`;
anything below about 0.94 SSIM is worth re-encoding at `--quality=95`.

## Naming

- Lowercase, hyphen-separated. Avoid spaces — they work, but complicate tooling.
- Covers are `cover.<ext>` inside the slug folder.
- Gallery files get short descriptive names: `arch-diagram.png`, `layout-mobile.jpg`.

## Alt text

Describe the content, not the medium.

Good: `Line chart showing request throughput climbing steadily above 10k rps.`
Avoid: `Image of a chart`, or a redundant `Screenshot of…`.

Alt text should match what is actually in the frame. Two gallery entries once
carried different descriptions for the same file, and neither described it.

## Before committing

- Ran through `images:process` (or added via `scaffold:projects`)
- `coverAlt` written and accurate
- `npm run check` passes — validates content, checks every referenced image
  exists, and builds

## FAQ

**Do I create multiple sizes?** No. Add one master; Astro generates the
responsive set at build time. Change the widths in the components, not on disk.

**Why not Astro's `image()` schema helper?** It only works inside a content
collection Zod schema and resolves paths relative to each markdown file. That
couples images to markdown. The glob resolver in `src/lib/images.ts` works
whatever holds the metadata.

**What about SVG?** Inline small SVGs directly in components for full control.
