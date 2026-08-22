# Design System & UI Style Guide

A thin custom layer on top of Tailwind. No runtime JS for styling, no dark mode,
no colour used for meaning. The **About page is the reference**: grey labels,
black content, one reading size.

## The core pattern

Every section on the site is a **grey label over black content**. The label names
the thing; it never competes with it. This replaced the old bold-heading look.

```html
<h2 class="label">Overview</h2>
<p class="copy">The actual words.</p>
```

## Tokens (`src/styles/global.css`, `:root`)

| Token | Value | Used for |
|---|---|---|
| `--bg-color` | `#fbfbfb` | Page ground |
| `--color-text-primary` | `#1e1e1e` | Titles, links, emphasis — the "black" |
| `--color-text-secondary` | `#525252` | Body prose |
| `--color-text-muted` | `#737373` | Chip text, tertiary info |
| `--color-text-label` | `#9ca3af` | Section labels — the "grey headers" |
| `--color-rule` | `#d1d5db` | Hairlines, chip borders |
| `--text-lead` | `1.5rem` | Lead paragraph (About headline) |
| `--text-base` | `0.9rem` | **Everything you read.** Body, labels, links |
| `--text-sm` | `0.8rem` | Card titles in grids |
| `--text-xs` | `0.7rem` | Meta lines, captions, counters |
| `--radius-chip` | `0.15rem` | Every chip. Slightly rounded, never a pill |

There are four text sizes. If a new element needs a fifth, it probably doesn't.

## Type primitives

| Class | What it is |
|---|---|
| `label` | Grey section header. `--text-base`, weight 500 |
| `copy` | Body prose. `--text-base`, line-height 1.5, secondary grey |
| `lead` | Lead paragraph / large statement. `--text-lead`, weight 500 |
| `meta` | Mono uppercase micro-text (dates on the blog listing) |

Page titles are **not** large. A project `h1` is `1.25rem`; the About headline is
`1.5rem`. The only oversized type on the site is the SCOTT PARK wordmark in the nav.

## Chips

Two variants, no colour. Used for project type, tags, stack/tools, and the tag
filter on listing pages.

| Class | Look | Meaning |
|---|---|---|
| `chip chip-solid` | Black fill, white text | The one primary label (project type, active filter) |
| `chip chip-outline` | Transparent, grey border + text | Everything secondary (tags, tools, inactive filter) |

`0.6rem`, weight 600, uppercase, `letter-spacing: 0.05em`, `--radius-chip`.

`TagFilter.astro` implements the same two states locally (`.tag-chip`,
`.tag-chip[aria-pressed="true"]`) because the buttons carry filter behaviour —
keep the two in step.

## Other components

| Class | Purpose |
|---|---|
| `btn` + `btn-primary` / `btn-outline` / `btn-muted` | Buttons. Rare — most actions are quiet underlined text links |
| `card` | Elevated container. Used only for empty states |
| `nav-link` / `nav-link-active` | Legacy; the nav styles itself |
| `heading-display` / `heading-gradient` | Legacy display treatments, unused |

## Project page layout

`src/pages/projects/[slug].astro`, shared by creative and technical work.

```
┌────────────┬──────────────────────┬──────┐
│ back link  │                      │ ▣    │  ← rail: square thumbs
│ TYPE chip  │                      │ ▣    │    active in colour,
│ Title      │      one large       │ ▣    │    rest grayscale
│ year·role  │        image         │ ▣    │
│ summary    │       (sticky)       │ ▣    │
│ Overview   │                      │      │
│ Tools      │                      │      │
│ Tags       │  caption   01 / 07   │      │
│ Links      │                      │      │
└────────────┴──────────────────────┴──────┘
```

- The image is the page. Text sits left, the selector rail right.
- Stage and rail are `position: sticky`; the left column scrolls past them.
- Exactly one thumbnail is ever in colour: the one on the stage. Hovering a
  thumb previews it on the stage (colour follows), leaving the rail snaps back
  to the locked choice, and clicking locks it in. No ring, no rounding, 4px gap.
- Clicking the stage opens full screen. Arrow keys move through the set anywhere
  on the page.
- Below 1024px this becomes a single column: head → image → horizontal thumb
  strip → the rest of the text.
- There is **no back button at the bottom** of the page. One quiet link at the
  top of the left column, and that's it.

### Project markdown format

Frontmatter drives everything structural. The body is **prose only**:

```markdown
---
title: "…"
type: "creative"
…
---

The overview paragraph, straight in. No `## Overview` heading — the page
renders that label itself.

## Features

Extra sections use `##`. Sub-sections use `###`.
```

- `##` in the body renders as a grey `label`, matching the template's own labels.
- `###` renders as small black bold.
- An empty body is valid — the page omits the Overview block entirely.
- `scripts/lib/project-file.mjs`, `scripts/scaffold-projects.mjs` and
  `tools/studio` all write this shape. Change one, change all three.

## Accessibility

Contrast targets WCAG AA. `--color-text-label` on `--bg-color` is ~2.6:1, so it
is only ever used for labels that restate nearby content — never for the content
itself. Focus rings on all interactive elements; skip link in `BaseLayout`.

## Adding a variant

Add the class inside `@layer components` in `global.css` and add its base name to
`safelist` in `tailwind.config.cjs` if it's ever generated dynamically.
