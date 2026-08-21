#!/usr/bin/env node
/**
 * Batch image re-mastering.
 *
 * Walks a directory, runs each image through scripts/lib/process-image.mjs, and
 * rewrites any references to renamed files in the content collections.
 *
 * Usage:
 *   npm run images:plan                  # dry run over src/assets/images, writes nothing
 *   npm run images:process               # actually re-master
 *   node scripts/process-images.mjs src/assets/images/projects/creative --dry-run
 *   node scripts/process-images.mjs --max-edge=2048 --quality=78
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  processImage,
  isSupported,
  DEFAULT_MAX_EDGE,
  DEFAULT_QUALITY,
} from './lib/process-image.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);

const colors = {
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  blue: '\x1b[34m', dim: '\x1b[2m', reset: '\x1b[0m', bold: '\x1b[1m',
};
const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const flag = (name, fallback) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : fallback;
};
const maxEdge = flag('max-edge', DEFAULT_MAX_EDGE);
const quality = flag('quality', DEFAULT_QUALITY);
const targets = args.filter(a => !a.startsWith('--'));
const roots = targets.length ? targets : ['src/assets/images'];

const mb = bytes => (bytes / 1048576).toFixed(2);
const pct = (before, after) => `${(100 - (after / before) * 100).toFixed(0)}%`;

async function walk(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, acc);
    else if (entry.name !== '.DS_Store' && isSupported(entry.name)) acc.push(full);
  }
  return acc;
}

/**
 * Rewrite `/images/...` references whose extension changed.
 * Must cover all of src/, not just content collections — pages and components
 * (e.g. about.astro's photo grid) hardcode image paths too.
 */
async function rewriteReferences(renames) {
  if (!renames.size) return 0;
  const files = [];
  await walk2(path.join(projectRoot, 'src'), files);
  let touched = 0;
  for (const file of files) {
    const original = await readFile(file, 'utf8');
    let next = original;
    for (const [from, to] of renames) next = next.split(from).join(to);
    if (next !== original) {
      if (!dryRun) await writeFile(file, next);
      touched++;
    }
  }
  return touched;
}

async function walk2(dir, acc) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk2(full, acc);
    else if (/\.(md|mdx|astro|ts|js)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const files = [];
for (const root of roots) {
  const abs = path.isAbsolute(root) ? root : path.join(projectRoot, root);
  if (!(await stat(abs).catch(() => null))) {
    log(`No such path: ${root}`, 'red');
    process.exit(1);
  }
  await walk(abs, files);
}

log(`\n${dryRun ? 'PLAN' : 'PROCESS'}  ${files.length} images  ·  max edge ${maxEdge}px  ·  quality ${quality}\n`, 'bold');

let totalBefore = 0, totalAfter = 0, skipped = 0, failed = 0;
const renames = new Map();
const results = [];

for (const file of files) {
  try {
    const r = await processImage(file, { maxEdge, quality, dryRun });
    if (r.skipped) {
      skipped++;
      totalBefore += r.before ?? 0;
      totalAfter += r.before ?? 0;
      continue;
    }
    totalBefore += r.before;
    totalAfter += r.after;
    results.push(r);
    if (r.replacedExtension) {
      // Content references images as "/images/...", which maps to
      // src/assets/images/... on disk. Strip that prefix to get the web path.
      const toWebPath = (p) =>
        p.replace(path.join(projectRoot, 'src', 'assets'), '');
      renames.set(toWebPath(r.input), toWebPath(r.output));
    }
  } catch (err) {
    failed++;
    log(`  FAILED  ${path.relative(projectRoot, file)} — ${err.message}`, 'red');
  }
}

results.sort((a, b) => b.saved - a.saved);
for (const r of results.slice(0, 15)) {
  const name = path.relative(path.join(projectRoot, 'src/assets/images'), r.input);
  log(
    `  ${mb(r.before).padStart(7)} MB -> ${mb(r.after).padStart(6)} MB  ${pct(r.before, r.after).padStart(4)}  ` +
    `${colors.dim}${r.width}x${r.height}${r.animated ? ` ${r.frames}f` : ''} ${r.format}${colors.reset}  ${name}`,
  );
}
if (results.length > 15) log(`  ${colors.dim}… and ${results.length - 15} more${colors.reset}`);

const touched = await rewriteReferences(renames);

log(`\n${'-'.repeat(60)}`);
log(`  before      ${mb(totalBefore).padStart(9)} MB`);
log(`  after       ${mb(totalAfter).padStart(9)} MB`, 'green');
log(`  saved       ${mb(totalBefore - totalAfter).padStart(9)} MB  (${pct(totalBefore, totalAfter)})`, 'green');
log(`  processed   ${String(results.length).padStart(9)}`);
if (skipped) log(`  skipped     ${String(skipped).padStart(9)}  ${colors.dim}(already optimal)${colors.reset}`);
if (failed) log(`  failed      ${String(failed).padStart(9)}`, 'red');
log(`  renamed     ${String(renames.size).padStart(9)}  ${colors.dim}content files updated: ${touched}${colors.reset}`);

if (dryRun) log(`\n  Dry run — nothing was written. Re-run without --dry-run to apply.\n`, 'yellow');
else log(`\n  Done. Verify with: npm run check\n`, 'green');
