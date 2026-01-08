#!/usr/bin/env node
/**
 * Script: check-missing-images.mjs
 * Scans project content entries for declared cover/gallery image paths and verifies files exist under /public.
 * Helps catch 404s like /images/projects/climate-dashboard-cover.jpg at dev time.
 */
import { readdir, access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const contentDir = join(root, 'src', 'content', 'projects');


/** Simple frontmatter extractor (YAML) */
function extractFrontmatter(md) {
  if (!md.startsWith('---')) return {};
  const end = md.indexOf('\n---', 3);
  if (end === -1) return {};
  const yaml = md.slice(3, end).trim();
  const lines = yaml.split(/\r?\n/);
  const data = {};
  let currentKey = null;
  for (const line of lines) {
    if (/^\s{2,}/.test(line) && currentKey) {
      // part of array item or nested object; skip simplistic parse
      continue;
    }
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m) {
      currentKey = m[1];
      data[currentKey] = m[2];
    }
  }
  return data;
}

async function pathExists(relPath) {
  const p = join(publicDir, relPath.replace(/^\//, ''));
  try {
    await access(p, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // recursively collect markdown files (no external deps)
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const list = [];
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) list.push(...await walk(p));
      else if (e.isFile() && p.endsWith('.md')) list.push(p);
    }
    return list;
  }
  const files = await walk(contentDir);
  const missing = [];
  for (const full of files) {
    const f = full.replace(contentDir + '/', '');
    const raw = await readFile(full, 'utf8');
    const fm = extractFrontmatter(raw);
    if (fm.cover) {
      const coverPath = fm.cover.replace(/^['"`](.*)['"`]$/,'$1');
      const ok = await pathExists(coverPath);
      if (!ok) missing.push({ file: f, field: 'cover', path: fm.cover });
    }
    // naive gallery scan
    const galleryMatches = raw.match(/src:\s*"(\/images\/projects\/[^"]+)"/g) || [];
    for (const m of galleryMatches) {
      const path = m.match(/"(\/images\/projects\/[^"]+)"/)[1];
      const ok = await pathExists(path);
      if (!ok) missing.push({ file: f, field: 'gallery', path });
    }
  }
  if (missing.length) {
    console.log('\nMissing image assets detected (declare & add to public/images/projects):');
    for (const m of missing) {
      console.log(`- ${m.file} -> ${m.field}: ${m.path}`);
    }
    process.exitCode = 1;
  } else {
    console.log('All referenced cover/gallery images exist.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
