#!/usr/bin/env node
/**
 * Portfolio Studio — a local tool for adding projects.
 *
 * Deliberately dependency-free: node:http plus sharp, which the site already
 * depends on via Astro. Anything added to package.json is installed on every
 * CI deploy, and this never runs in CI.
 *
 * It writes files and stops. Reviewing, committing and pushing stay manual.
 *
 *   npm run studio
 */

import http from 'node:http';
import { readFile, mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { processImage } from '../../scripts/lib/process-image.mjs';
import { writeProjectFile, slugify, PROJECT_TYPES } from '../../scripts/lib/project-file.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const ASSETS_ROOT = path.join(projectRoot, 'src/assets/images/projects');
const CONTENT_DIR = path.join(projectRoot, 'src/content/projects');
const PORT = Number(process.env.STUDIO_PORT || 4330);

/* ---------- input hardening ------------------------------------------------
 * Everything below comes from a browser form. It is only ever this machine's
 * browser, but these values become filesystem paths, so they get validated
 * rather than trusted.
 * ------------------------------------------------------------------------ */

function safeSlug(value) {
  const slug = slugify(value);
  if (!slug || slug.length > 80) throw new Error(`Invalid slug: ${value}`);
  return slug;
}

function safeType(value) {
  if (!PROJECT_TYPES.includes(value)) throw new Error(`Invalid type: ${value}`);
  return value;
}

/** Strip directories, keep a conservative character set, preserve extension. */
function safeFilename(value) {
  const base = path.basename(String(value));
  const ext = path.extname(base).toLowerCase();
  if (!/^\.(png|jpe?g|gif|webp|avif)$/.test(ext)) throw new Error(`Unsupported file type: ${ext || 'none'}`);
  const stem = slugify(base.slice(0, base.length - ext.length)) || 'image';
  return stem + ext;
}

/* ---------- helpers -------------------------------------------------------- */

const json = (res, status, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) });
  res.end(payload);
};

function readBody(req, limitBytes = 80 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (c) => {
      total += c.length;
      if (total > limitBytes) { reject(new Error('File too large (limit 80 MB)')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function existingProjects() {
  const files = await readdir(CONTENT_DIR).catch(() => []);
  const slugs = [];
  const tags = new Set();
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    slugs.push(f.replace(/\.md$/, ''));
    const raw = await readFile(path.join(CONTENT_DIR, f), 'utf8');
    const m = raw.match(/^tags:\s*\[(.*)\]\s*$/m);
    if (m) for (const t of m[1].split(',')) {
      const clean = t.trim().replace(/^["']|["']$/g, '');
      if (clean) tags.add(clean);
    }
  }
  return { slugs: slugs.sort(), tags: [...tags].sort() };
}

/* ---------- routes --------------------------------------------------------- */

/**
 * Upload one image. The browser sends raw bytes with metadata in headers,
 * which avoids needing a multipart parser for a purely local tool.
 * The file is written into the project's asset folder and re-mastered there.
 */
async function handleUpload(req, res, url) {
  const type = safeType(url.searchParams.get('type'));
  const slug = safeSlug(url.searchParams.get('slug'));
  const filename = safeFilename(url.searchParams.get('name'));

  const bytes = await readBody(req);
  if (!bytes.length) throw new Error('Empty upload');

  const destDir = path.join(ASSETS_ROOT, type, slug);
  await mkdir(destDir, { recursive: true });
  const staged = path.join(destDir, filename);
  await writeFile(staged, bytes);

  const result = await processImage(staged);
  const finalPath = result.skipped ? staged : result.output;
  const finalName = path.basename(finalPath);

  return json(res, 200, {
    name: finalName,
    src: `/images/projects/${type}/${slug}/${finalName}`,
    before: bytes.length,
    after: result.after ?? bytes.length,
    width: result.outWidth ?? result.width,
    height: result.outHeight ?? result.height,
  });
}

/** Write the markdown. Images are already in place from /api/upload. */
async function handleCreate(req, res) {
  const body = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString('utf8'));
  const type = safeType(body.type);
  const slug = safeSlug(body.slug || body.title);

  const images = Array.isArray(body.images) ? body.images : [];
  if (images.length === 0) throw new Error('Add at least one image');

  const coverName = body.coverName || images[0].name;
  const cover = images.find((i) => i.name === coverName);
  if (!cover) throw new Error('Cover image not found among uploads');

  // The cover is one of the gallery images, referenced by the same path — not
  // a second copy. Copying it is what produced 11 duplicate files historically.
  const data = {
    title: body.title,
    type,
    year: body.year,
    summary: body.summary,
    stack: (body.stack || []).filter(Boolean),
    tags: (body.tags || []).filter(Boolean),
    role: body.role,
    cover: cover.src,
    coverAlt: body.coverAlt || cover.alt,
    gallery: images.map((i) => ({ src: i.src, alt: i.alt, caption: i.caption || undefined })),
    links: { repo: body.repo, live: body.live, caseStudy: body.caseStudy },
    draft: body.draft !== false,
    order: body.order,
  };

  const file = await writeProjectFile({
    projectRoot, slug, data, body: body.content, overwrite: Boolean(body.overwrite),
  });

  return json(res, 200, {
    file: path.relative(projectRoot, file),
    slug,
    assetDir: path.relative(projectRoot, path.join(ASSETS_ROOT, type, slug)),
    imageCount: images.length,
  });
}

/** Remove a folder of uploads — for abandoning a draft without leaving litter. */
async function handleDiscard(req, res) {
  const body = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8'));
  const type = safeType(body.type);
  const slug = safeSlug(body.slug);
  const dir = path.join(ASSETS_ROOT, type, slug);
  if (!dir.startsWith(ASSETS_ROOT)) throw new Error('Refusing to delete outside the assets folder');
  await rm(dir, { recursive: true, force: true });
  return json(res, 200, { removed: path.relative(projectRoot, dir) });
}

const STATIC = { '/': 'index.html', '/app.js': 'app.js' };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === 'GET' && STATIC[url.pathname]) {
      const file = path.join(__dirname, STATIC[url.pathname]);
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] });
      return res.end(body);
    }
    // Thumbnails: serve the processed file straight off disk so the form can
    // show what was actually written, not the pre-compression original.
    if (req.method === 'GET' && url.pathname.startsWith('/preview/')) {
      const rel = decodeURIComponent(url.pathname.slice('/preview/'.length));
      const file = path.resolve(projectRoot, 'src/assets/images', rel);
      const root = path.join(projectRoot, 'src/assets/images');
      if (!file.startsWith(root + path.sep)) return json(res, 403, { error: 'Outside asset root' });
      const body = await readFile(file).catch(() => null);
      if (!body) return json(res, 404, { error: 'No such image' });
      const ext = path.extname(file).toLowerCase();
      const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
        : ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/webp';
      res.writeHead(200, { 'content-type': mime, 'cache-control': 'no-store' });
      return res.end(body);
    }
    if (req.method === 'GET' && url.pathname === '/api/config') {
      const { slugs, tags } = await existingProjects();
      return json(res, 200, { types: PROJECT_TYPES, slugs, tags, year: new Date().getFullYear() });
    }
    if (req.method === 'POST' && url.pathname === '/api/upload') return await handleUpload(req, res, url);
    if (req.method === 'POST' && url.pathname === '/api/project') return await handleCreate(req, res);
    if (req.method === 'POST' && url.pathname === '/api/discard') return await handleDiscard(req, res);
    json(res, 404, { error: 'Not found' });
  } catch (err) {
    json(res, 400, { error: err.message });
  }
});

// Bind to loopback only. This writes to the filesystem; it should not be
// reachable from the network.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Portfolio Studio  →  http://localhost:${PORT}\n`);
  console.log(`  Writes to src/assets/images/projects/ and src/content/projects/.`);
  console.log(`  Review with 'git diff' and commit yourself.\n`);
});
