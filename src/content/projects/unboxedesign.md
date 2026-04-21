---
title: "unboxedesign"
type: "technical"
year: 2026
summary: "Headless WordPress + Next.js website for a graphic design studio, with ISR and SMTP contact form."
stack: ["NextJS", "TypeScript", "TailwindCSS", "WordPress", "Nodemailer", "Vercel"]
role: "Freelance Web Developer"
tags: ["web-development", "nextjs", "typescript", "react", "javascript"]
cover: "/images/projects/technical/UnboxeDesign/Cover.png"
coverAlt: "unboxedesign studio website homepage"
gallery:
  - src: "/images/projects/technical/UnboxeDesign/site.png"
    alt: "unboxedesign website full view"
    caption: "Portfolio grid, services, and contact sections"
links:
  live: "https://unboxedesign.com"
featured: false
draft: false
order: 125
---

## Overview

Built the production website for [unboxedesign](https://unboxedesign.com), a boutique graphic design studio. The site uses Next.js 16 as a headless front-end against a WordPress CMS hosted on a separate subdomain, pulling portfolio items, testimonials, and client data via the WP REST API.

## Features

- **Headless CMS** — WordPress on `cms.unboxedesign.com` feeds the Next.js front-end via REST API; content editors never touch code
- **Incremental Static Regeneration** — Pages revalidate every 5 minutes with an on-demand webhook triggered on WordPress publish, so portfolio updates go live instantly
- **Portfolio grid** — Filterable by category (print, web, packaging, identity, illustration), each item linking to a dedicated project page generated at build time
- **Contact form** — Server-side form submission via Nodemailer routed through the studio's own SMTP server
- **Animations** — Framer Motion hero with video background, scroll-driven reveals throughout
- **Tailwind CSS v4** — Custom design tokens (cream palette, DM Serif Text + DM Sans type system) via `@theme` and `@utility` directives
