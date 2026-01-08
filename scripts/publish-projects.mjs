#!/usr/bin/env node
/**
 * Toggle draft flag for project markdown files.
 * Usage:
 *   node scripts/publish-projects.mjs <slug|all> [--unpublish]
 * Examples:
 *   node scripts/publish-projects.mjs adventure-time-x-ucla
 *   node scripts/publish-projects.mjs all
 *   node scripts/publish-projects.mjs wild-wild-westwood --unpublish
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const CONTENT_DIR = path.resolve('src/content/projects');
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Provide a slug or "all"');
  process.exit(1);
}
const target = args[0];
const unpublish = args.includes('--unpublish');

function setDraftLine(lines, value) {
  const draftIndex = lines.findIndex(l => /^draft:\s*/i.test(l));
  if (draftIndex !== -1) {
    lines[draftIndex] = `draft: ${value}`;
  } else {
    // Insert before closing frontmatter if found
    const endIndex = lines.findIndex((l, i) => l.trim() === '---' && i !== 0);
    const insertAt = endIndex === -1 ? lines.length : endIndex;
    lines.splice(insertAt, 0, `draft: ${value}`);
  }
}

async function processFile(file) {
  const raw = await fs.readFile(file, 'utf8');
  const lines = raw.split(/\r?\n/);
  setDraftLine(lines, unpublish ? 'true' : 'false');
  await fs.writeFile(file, lines.join('\n'), 'utf8');
  console.log(`${unpublish ? 'Unpublished' : 'Published'} ${path.basename(file)}`);
}

const run = async () => {
  if (target === 'all') {
    const files = await fs.readdir(CONTENT_DIR);
    const md = files.filter(f => f.endsWith('.md'));
    for (const f of md) await processFile(path.join(CONTENT_DIR, f));
  } else {
    const file = path.join(CONTENT_DIR, `${target}.md`);
    await processFile(file);
  }
};

run().catch(err => { console.error(err.message); process.exit(1); });
