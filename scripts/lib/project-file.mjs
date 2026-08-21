/**
 * Writing project markdown.
 *
 * Shared by scripts/scaffold-projects.mjs and tools/studio, so there is one
 * definition of what valid frontmatter looks like. Two code paths writing YAML
 * by hand would drift, and the schema in src/content/config.ts is the thing
 * they'd drift away from.
 */

import { writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';

export const PROJECT_TYPES = ['creative', 'technical'];

/** Mirrors the Zod schema in src/content/config.ts. Kept in step by hand. */
export function validateProject(data) {
  const errors = [];
  const len = (s) => (typeof s === 'string' ? s.trim().length : 0);

  if (len(data.title) < 3 || len(data.title) > 120) errors.push('title must be 3-120 characters');
  if (!PROJECT_TYPES.includes(data.type)) errors.push(`type must be one of ${PROJECT_TYPES.join(', ')}`);
  const year = Number(data.year);
  if (!Number.isInteger(year) || year < 2005 || year > new Date().getFullYear()) {
    errors.push(`year must be an integer between 2005 and ${new Date().getFullYear()}`);
  }
  if (len(data.summary) < 1 || len(data.summary) > 180) errors.push('summary is required, max 180 characters');
  if (!Array.isArray(data.stack) || data.stack.length === 0) errors.push('stack needs at least one entry');
  if (data.cover && (len(data.coverAlt) < 3 || len(data.coverAlt) > 180)) {
    errors.push('coverAlt is required with a cover, 3-180 characters');
  }
  for (const item of data.gallery ?? []) {
    if (len(item.alt) < 3 || len(item.alt) > 180) {
      errors.push(`gallery alt text for ${item.src} must be 3-180 characters`);
    }
  }
  return errors;
}

/** Minimal YAML for the shapes this schema actually uses. */
function yamlValue(v) {
  return JSON.stringify(v);
}

export function serializeFrontmatter(data) {
  const lines = [];
  const put = (key, value) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      if (key === 'gallery') {
        if (value.length === 0) return;
        lines.push('gallery:');
        for (const item of value) {
          lines.push(`  - src: ${yamlValue(item.src)}`);
          lines.push(`    alt: ${yamlValue(item.alt)}`);
          if (item.caption) lines.push(`    caption: ${yamlValue(item.caption)}`);
        }
        return;
      }
      lines.push(`${key}: [${value.map(yamlValue).join(', ')}]`);
      return;
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value).filter(([, v]) => v);
      if (entries.length === 0) return;
      lines.push(`${key}:`);
      for (const [k, v] of entries) lines.push(`  ${k}: ${yamlValue(v)}`);
      return;
    }
    lines.push(`${key}: ${typeof value === 'string' ? yamlValue(value) : value}`);
  };

  // Order matters only for readability; keep it consistent with existing files.
  put('title', data.title);
  put('type', data.type);
  put('year', Number(data.year));
  put('summary', data.summary);
  put('stack', data.stack);
  put('tags', data.tags?.length ? data.tags : undefined);
  put('role', data.role || undefined);
  put('cover', data.cover);
  put('coverAlt', data.coverAlt);
  put('gallery', data.gallery);
  put('links', data.links);
  put('draft', data.draft !== false);
  put('order', data.order === undefined || data.order === '' ? undefined : Number(data.order));

  return lines.join('\n');
}

export function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Write src/content/projects/<slug>.md.
 * Refuses to clobber an existing file unless overwrite is set.
 */
export async function writeProjectFile({ projectRoot, slug, data, body, overwrite = false }) {
  const errors = validateProject(data);
  if (errors.length) throw new Error(errors.join('; '));

  const dir = path.join(projectRoot, 'src/content/projects');
  const file = path.join(dir, `${slug}.md`);
  if (!overwrite) {
    const exists = await access(file).then(() => true).catch(() => false);
    if (exists) throw new Error(`${slug}.md already exists — pick a different title or allow overwrite`);
  }

  const content = `---\n${serializeFrontmatter(data)}\n---\n\n${body || '## Overview\n\nAdd detail here.\n'}`;
  await mkdir(dir, { recursive: true });
  await writeFile(file, content, 'utf8');
  return file;
}
