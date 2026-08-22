---
title: "unboxedesign"
type: "technical"
year: 2026
summary: "Headless WordPress + Next.js website for a graphic design studio, with ISR and SMTP contact form."
stack: ["NextJS", "TypeScript", "TailwindCSS", "WordPress", "Nodemailer", "Vercel"]
role: "Freelance Web Developer"
tags: ["web-development", "nextjs", "typescript", "react", "javascript"]
cover: "/images/projects/technical/UnboxeDesign/hero.webp"
coverAlt: "unboxedesign studio website homepage"
gallery:
  - src: "/images/projects/technical/UnboxeDesign/hero.webp"
    alt: "unboxedesign homepage hero reading Think Outside The Box"
    caption: "Home — Framer Motion hero over a looping video background"
  - src: "/images/projects/technical/UnboxeDesign/portfolio.webp"
    alt: "Portfolio grid showing all projects with category filter buttons"
    caption: "Portfolio — 138 items from WordPress, filterable by category"
  - src: "/images/projects/technical/UnboxeDesign/portfolio-web.webp"
    alt: "Portfolio grid filtered to web design projects"
    caption: "Filters are URL-driven, so a filtered view stays shareable"
  - src: "/images/projects/technical/UnboxeDesign/testimonials.webp"
    alt: "Client testimonials page"
    caption: "Testimonials — a second WordPress collection"
  - src: "/images/projects/technical/UnboxeDesign/contact.webp"
    alt: "Contact page with the project enquiry form"
    caption: "Contact — submissions go out through the studio's own SMTP"
links:
  live: "https://unboxedesign.com"
featured: false
draft: false
order: 20
---

Built the production website for [unboxedesign](https://unboxedesign.com), a boutique graphic design studio. The site uses Next.js 16 as a headless front-end against a WordPress CMS hosted on a separate subdomain, pulling portfolio items, testimonials, and client data via the WP REST API.

## Features

- **Headless CMS** — WordPress on `cms.unboxedesign.com` feeds the Next.js front-end via REST API; content editors never touch code
- **Incremental Static Regeneration** — Pages revalidate every 5 minutes with an on-demand webhook triggered on WordPress publish, so portfolio updates go live instantly
- **Portfolio grid** — Filterable by category (print, web, packaging, identity, illustration), each item linking to a dedicated project page generated at build time
- **Contact form** — Server-side form submission via Nodemailer routed through the studio's own SMTP server
- **Animations** — Framer Motion hero with video background, scroll-driven reveals throughout
- **Tailwind CSS v4** — Custom design tokens (cream palette, DM Serif Text + DM Sans type system) via `@theme` and `@utility` directives
