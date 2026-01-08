import { defineCollection, z } from 'astro:content';
import { PROJECT_TYPES, currentYear } from '../lib/content-types.js';

// Projects collection schema
const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(3).max(120),
    type: z.enum(PROJECT_TYPES),
    year: z.number().min(2005).max(currentYear),
    summary: z.string().max(180),
    stack: z.array(z.string()),
  // Optional classification tags (e.g., data-viz, performance, platform)
  tags: z.array(z.string()).optional(),
    role: z.string().optional(),
    // Cover image path (currently string path). Future: switch to image() for responsive pipeline.
    cover: z.string().optional(),
    // Accessible alt text for the cover image (required if cover present)
    coverAlt: z.string().min(3).max(180).optional(),
  // Cover focal point: CSS object-position value (e.g., 'center center', 'top center', '50% 30%')
  coverFocus: z.string().regex(/^[a-zA-Z0-9%\s.-]{3,30}$/).optional(),
  // Alternative numeric focal point controls (0-100 percentages) to build object-position dynamically
  coverFocusX: z.number().min(0).max(100).optional(),
  coverFocusY: z.number().min(0).max(100).optional(),
    // Optional gallery of additional images (creative / visual storytelling)
    gallery: z.array(z.object({
      src: z.string(),
      alt: z.string().min(3).max(180),
      caption: z.string().max(240).optional(),
    })).optional(),
    // Featured flag for highlighting on home / top sections
    featured: z.boolean().optional(),
    links: z.object({
      repo: z.string().url().optional(),
      live: z.string().url().optional(),
      caseStudy: z.string().url().optional(),
    }).optional(),
    draft: z.boolean().default(false),
    // Optional manual ordering weight (lower = earlier). Use spaced integers (e.g., 100, 200) to allow easy insertion.
    order: z.number().optional(),
  }),
  // Enforce conditional logic (coverAlt required if cover is defined)
  // Using "schema"+superRefine pattern not directly supported inside object above, so we wrap below
  // NOTE: defineCollection currently doesn't expose direct superRefine; simple runtime check will occur in scripts later if needed.
});

// Blog collection schema
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(3).max(120),
    date: z.date(),
    summary: z.string().max(200),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    hero: z.string().optional(),
    updated: z.date().optional(),
  }),
});

// Export collections
export const collections = {
  projects: projectsCollection,
  blog: blogCollection,
};
