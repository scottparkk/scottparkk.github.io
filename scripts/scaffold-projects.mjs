#!/usr/bin/env node
/**
 * Scaffold project markdown files from a directory tree of images.
 *
 * Assumptions:
 *  - Source root provided via CLI: `npm run scaffold:projects -- src/image-folders`
 *  - Each immediate subfolder name becomes the project slug
 *  - First image encountered becomes the cover
 *  - Additional images become gallery entries
 *  - Type inferred with simple heuristics or defaults (--type override planned)
 *  - Existing markdown files are not overwritten unless --force passed
 *
 * Usage:
 *  node scripts/scaffold-projects.mjs ./incoming-project-images [--type=creative|technical] [--force]
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/scaffold-projects.mjs <imageRoot> [--type=creative|technical] [--force]');
  process.exit(1);
}

const imageRoot = path.resolve(process.cwd(), args[0]);
const force = args.includes('--force');
const typeArg = args.find(a => a.startsWith('--type='));
const explicitType = typeArg ? typeArg.split('=')[1] : undefined;

const PROJECTS_MD_DIR = path.resolve('src/content/projects');

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function guessTypeFromName(name) {
  if (explicitType) return explicitType;
  const creativeKeywords = ['art', 'design', 'viz', 'visual', 'creative', 'illustration', 'gallery'];
  return creativeKeywords.some(k => name.toLowerCase().includes(k)) ? 'creative' : 'technical';
}

async function readDirEntries(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter(e => e.isFile() || e.isDirectory());
}

function isImageFile(file) {
  return /\.(jpe?g|png|gif|webp|avif)$/i.test(file);
}

function titleCase(slug) {
  return slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

async function scaffoldFolder(folderPath) {
  const folderName = path.basename(folderPath);
  const slug = slugify(folderName);
  const outFile = path.join(PROJECTS_MD_DIR, `${slug}.md`);

  try {
    await fs.access(outFile);
    if (!force) {
      console.log(`Skipping existing: ${outFile}`);
      return;
    }
  } catch {}

  const entries = await readDirEntries(folderPath);
  const imageFiles = entries.filter(e => e.isFile() && isImageFile(e.name)).map(e => e.name).sort();
  if (imageFiles.length === 0) {
    console.warn(`No images in ${folderName}, skipping.`);
    return;
  }
  const coverFile = imageFiles[0];
  const coverPath = `/images/projects/${slug}/${coverFile}`;

  // Additional gallery images
  const gallery = imageFiles.slice(1).map(name => ({ src: `/images/projects/${slug}/${name}`, alt: `${titleCase(slug)} – ${name.replace(/\.[^.]+$/, '').replace(/[-_]/g,' ')}` }));

  const year = new Date().getFullYear();
  const type = guessTypeFromName(folderName);

  const frontmatter = {
    title: titleCase(slug),
    type,
    year,
    summary: `TODO: Add a concise summary for ${titleCase(slug)} (≤ 180 chars).`,
    stack: ["TODO"],
    role: "TODO",
    tags: [],
    cover: coverPath,
    coverAlt: `${titleCase(slug)} cover image`,
    gallery: gallery.length ? gallery : undefined,
    draft: true,
    order: undefined,
  };

  // Serialize frontmatter (omit undefined keys)
  const fmLines = Object.entries(frontmatter)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length === 0) return `${k}: []`;
        if (k === 'gallery') {
          return `${k}:\n${v.map(item => `  - src: "${item.src}"\n    alt: "${item.alt}"`).join('\n')}`;
        }
        return `${k}: [${v.map(x => JSON.stringify(x)).join(', ')}]`;
      }
      if (typeof v === 'string') return `${k}: ${JSON.stringify(v)}`;
      if (typeof v === 'number') return `${k}: ${v}`;
      if (typeof v === 'boolean') return `${k}: ${v}`;
      return `${k}: ${JSON.stringify(v)}`;
    })
    .join('\n');

  const body = `---\n${fmLines}\n---\n\n## Overview\n\nAdd detailed content here. Replace placeholders above.\n`;
  await ensureDir(PROJECTS_MD_DIR);
  await fs.writeFile(outFile, body, 'utf8');
  console.log(`Created ${outFile}`);
}

async function main() {
  const rootEntries = await readDirEntries(imageRoot);
  for (const entry of rootEntries) {
    if (entry.isDirectory()) {
      const folderPath = path.join(imageRoot, entry.name);
      await scaffoldFolder(folderPath);
    }
  }
  console.log('Scaffolding complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
