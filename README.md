# Scott Park Portfolio

A performance-first portfolio built with [Astro](https://astro.build/) and Tailwind CSS, showcasing creative and technical projects with zero client-side JavaScript by default.

## ✅ Implemented Features

### Phase 0: Foundation
- ✅ Semantic HTML structure with proper landmarks (`<header>`, `<main>`, `<footer>`)
- ✅ Centralized navigation component with active state
- ✅ Skip-to-content accessibility link
- ✅ Dark mode support via `prefers-color-scheme`

### Phase 1: Content Model
- ✅ Content collections for projects and blog posts
- ✅ Zod schema validation for frontmatter
- ✅ Sample creative and technical projects
- ✅ Sample blog post with full metadata

### Phase 2: Pages & Data Binding  
- ✅ Project listing page with type groupings
- ✅ Dynamic project detail pages with full metadata
- ✅ Blog listing page with date sorting
- ✅ Dynamic blog post pages with prev/next navigation
- ✅ Home page with featured content from each type
- ✅ Updated About page
- ✅ Filtered project type routes (`/projects/creative`, `/projects/technical`)

### Phase 5: Quality & Validation (Partial)
- ✅ Content validation script
- ✅ Build verification
- ✅ npm scripts for validation and checking

## Performance Budget Status

Current targets (maintained):
- ✅ HTML per page: < 25KB gzipped
- ✅ Critical CSS: < 10KB (Tailwind purged)
- ✅ JS shipped on static pages: 0 KB
- ⏳ Lighthouse targets: Performance ≥ 95, Accessibility ≥ 98, SEO ≥ 95 (to be tested)

## Content Structure

```
src/content/
  projects/
    climate-dashboard.md     (type: creative)
    api-gateway.md          (type: technical)
  blog/
    2025-hello-world.md
```

Projects support both creative and technical types with full metadata including stack, links, and year. Blog posts include tags, summaries, and date management.

## Available Scripts

```bash
npm run dev              # Start development server
npm run build           # Build for production  
npm run preview         # Preview production build
npm run validate:content # Validate frontmatter and content structure
npm run check           # Validate content + build (CI-ready)
npm run deploy          # Deploy to GitHub Pages
```

## Next Priority Tasks

Based on the [full roadmap](ROADMAP.md), immediate next steps:

### Phase 2 Completions
All Phase 2 tasks in scope are complete.

### Phase 3: Images & Media  
- [ ] P3-01: Image optimization utilities
- [ ] P3-02: Replace static images with Astro `<Image />` components
- [ ] P3-03: Responsive image strategy

### Phase 4: Metadata & Discovery
- [ ] P4-01: OpenGraph & Twitter card automation
- [ ] P4-02: RSS feed generation  
- [ ] P4-03: JSON feed
- [ ] P4-04: Sitemap generation

### Phase 5: Automation
- [ ] P5-01: GitHub Actions for deployment
- [ ] P5-02: Lighthouse CI budget enforcement
- [ ] P5-03: Bundle size guards

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Validate content structure
npm run validate:content

# Full check (validate + build)
npm run check
```

The site runs on `http://localhost:4321` in development.

## Architecture Decisions

- **Content-first**: Markdown with frontmatter for easy content management
- **Zero JS by default**: Static generation with progressive enhancement
- **Accessibility-first**: Semantic HTML, proper landmarks, skip links
- **Performance budget**: Aggressive size constraints drive better decisions
- **Type safety**: Zod schemas for content validation

## Design System

Core UI primitives and typography guidelines live in `STYLEGUIDE.md`.

Key classes: `card`, `badge-*`, `tag`, `stack-tag`, `btn-*`, `heading-display`, `heading-gradient`, `meta`, `nav-link`.

Mono accent (Roboto Mono) highlights dense metadata + tags for contrast.

## File Structure

```
src/
├── components/
│   └── Nav.astro                 # Centralized navigation
├── content/
│   ├── config.ts                 # Content collections & schemas  
│   ├── projects/                 # Project markdown files
│   └── blog/                     # Blog post markdown files
├── layouts/
│   └── BaseLayout.astro          # Main layout with semantic structure
├── lib/
│   └── content-types.ts          # Type constants and utilities
├── pages/
│   ├── index.astro               # Home with featured content
│   ├── about.astro               # About page
│   ├── projects.astro            # Project listing
│   ├── projects/[slug].astro     # Project details
│   ├── blog.astro                # Blog listing  
│   └── blog/[slug].astro         # Blog post details
└── styles/
    └── global.css                # Global styles + Tailwind

scripts/
└── validate-content.mjs          # Content validation utility
```

This foundation supports the full roadmap while maintaining performance and accessibility standards.