## Design System & UI Style Guide

This portfolio uses a lightweight custom design layer on top of Tailwind CSS. The goal: expressive, compact UI primitives with high legibility, minimal repetition, and zero runtime JS.

### Typography

Primary font: Inter (regular currently loaded).  
Monospace accent: Roboto Mono for small meta text, tags, and stack chips.

Utility classes:
- `heading-display` – heavy display weight (pair with size utilities like `text-4xl` / `md:text-6xl`).
- `heading-gradient` – gradient text treatment (works on any heading level).
- `meta` – compact uppercase-styled system / date / subtle info line (Roboto Mono, tracking + tone).

Recommended size scale (apply via Tailwind utilities):
```
text-xs  (mono meta fallback)
text-sm  body-secondary
text-base default
text-lg  lead paragraphs
text-2xl section headings
text-4xl+ hero / page titles (with heading-display)
```

### Components

| Class | Purpose |
|-------|---------|
| `btn` | Base inline-flex button foundation |
| `btn-primary` | High-emphasis action (inverted in dark mode) |
| `btn-outline` | Low-emphasis bordered action |
| `btn-muted` | Neutral / tertiary surface action |
| `card` | Elevated container with interactive hover motion |
| `badge` + `badge-creative|technical|writing` | Category / type label |
| `tag` | Generic small label (mono) |
| `stack-tag` | Rounded mono chip for technology stack items |
| `nav-link` / `nav-link-active` | Top navigation items |

### Color Tokens

Semantic groups: `creative`, `technical`, `writing`, plus neutral surfaces.  
Gradients are applied manually (`heading-gradient`).

### Patterns

1. Use `card` pattern: heading + meta + body + tags.
2. Prefer `heading-display` on major titles; omit on dense list subheadings for hierarchy contrast.
3. Use `meta` for year, role, dates, update markers.
4. Keep action rows to at most 2 high-emphasis buttons.

### Dark Mode

Via `prefers-color-scheme`. Component classes include dark variants in `global.css` – no JS toggle yet.

### Accessibility

Contrast ratios target WCAG AA. Focus ring provided on interactive elements. Skip link in `BaseLayout`.

### Adding New Variants

Add new component class inside `@layer components` and safelist its base class in `tailwind.config.cjs` if generated dynamically.

### Future Enhancements

- Variable font axes for Inter.
- Optional theme toggle.
- Tokenize spacing + size scales.

---
Generated with the initial design system rollout. Update alongside component evolution.
