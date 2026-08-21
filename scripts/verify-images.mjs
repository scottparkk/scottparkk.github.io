/**
 * Quality verification: re-mastered images vs the Desktop originals.
 *
 * Both sides are rendered to the same display width before comparison, because
 * that is what a visitor actually sees. Comparing a 2560px master against an
 * 8334px original at native size would only measure the downscale.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

const ORIGINALS = path.join(os.homedir(), 'Desktop/portfolio-image-originals/images');
const CURRENT = 'src/assets/images';
const OUT = process.argv[2] || '/tmp/qc';
const DISPLAY_W = 1600;          // generous: a large desktop viewport
const COMPOSITES = 14;           // worst-N to render side by side

fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name !== '.DS_Store' && !e.name.endsWith('.txt')) acc.push(p);
  }
  return acc;
}

/** Grayscale pixels at a fixed width, so both sides are directly comparable. */
async function gray(file, width) {
  const { data, info } = await sharp(file, { animated: false })
    .resize({ width, fit: 'inside', withoutEnlargement: false })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/** Mean SSIM over 8x8 windows. Standard constants for 8-bit data. */
function ssim(a, b, w, h) {
  const C1 = (0.01 * 255) ** 2, C2 = (0.03 * 255) ** 2;
  const W = 8;
  let total = 0, n = 0;
  for (let y = 0; y + W <= h; y += W) {
    for (let x = 0; x + W <= w; x += W) {
      let sa = 0, sb = 0;
      for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
        const k = (y + j) * w + (x + i);
        sa += a[k]; sb += b[k];
      }
      const N = W * W, ma = sa / N, mb = sb / N;
      let va = 0, vb = 0, cov = 0;
      for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
        const k = (y + j) * w + (x + i);
        const da = a[k] - ma, db = b[k] - mb;
        va += da * da; vb += db * db; cov += da * db;
      }
      va /= N - 1; vb /= N - 1; cov /= N - 1;
      total += ((2 * ma * mb + C1) * (2 * cov + C2)) /
               ((ma * ma + mb * mb + C1) * (va + vb + C2));
      n++;
    }
  }
  return n ? total / n : 1;
}

function psnr(a, b) {
  let se = 0;
  for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; se += d * d; }
  const mse = se / a.length;
  return mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);
}

const current = walk(CURRENT);
const rows = [];
let unmatched = [];

for (const cur of current) {
  const rel = path.relative(CURRENT, cur);
  const dir = path.dirname(rel);
  const base = path.basename(rel, path.extname(rel));
  const origDir = path.join(ORIGINALS, dir);
  if (!fs.existsSync(origDir)) { unmatched.push(rel); continue; }
  const match = fs.readdirSync(origDir)
    .find(f => path.basename(f, path.extname(f)) === base);
  if (!match) { unmatched.push(rel); continue; }
  const orig = path.join(origDir, match);

  try {
    const om = await sharp(orig).metadata();
    const width = Math.min(DISPLAY_W, om.width);
    const A = await gray(orig, width);
    const B = await gray(cur, width);
    if (A.w !== B.w || A.h !== B.h) { unmatched.push(rel + ' (geometry)'); continue; }
    rows.push({
      rel, orig, cur,
      ssim: ssim(A.data, B.data, A.w, A.h),
      psnr: psnr(A.data, B.data),
      beforeBytes: fs.statSync(orig).size,
      afterBytes: fs.statSync(cur).size,
      dims: `${om.width}x${om.height}`,
    });
  } catch (e) {
    unmatched.push(rel + ' (' + e.message + ')');
  }
}

rows.sort((a, b) => a.ssim - b.ssim);

// Side-by-side composites for the worst performers, at display size.
const shots = [];
for (const r of rows.slice(0, COMPOSITES)) {
  const name = r.rel.replace(/[\/\\]/g, '__').replace(/\.[a-z]+$/i, '') + '.jpg';
  const H = 900;
  const left = await sharp(r.orig, { animated: false }).resize({ height: H, fit: 'inside' }).toBuffer();
  const right = await sharp(r.cur, { animated: false }).resize({ height: H, fit: 'inside' }).toBuffer();
  const lm = await sharp(left).metadata(), rm = await sharp(right).metadata();
  await sharp({ create: { width: lm.width + rm.width + 16, height: H, channels: 3, background: '#111' } })
    .composite([{ input: left, left: 0, top: 0 }, { input: right, left: lm.width + 16, top: 0 }])
    .jpeg({ quality: 92 })
    .toFile(path.join(OUT, 'shots', name));
  shots.push({ ...r, shot: 'shots/' + name });
}

fs.writeFileSync(path.join(OUT, 'metrics.json'), JSON.stringify({ rows, shots, unmatched }, null, 1));

const fmt = n => n.toFixed(4);
const band = s => s >= 0.98 ? 'excellent' : s >= 0.95 ? 'good' : s >= 0.90 ? 'acceptable' : 'REVIEW';
console.log(`compared: ${rows.length}   unmatched: ${unmatched.length}\n`);
console.log('LOWEST SIMILARITY (worst first)');
for (const r of rows.slice(0, 14)) {
  console.log(`  SSIM ${fmt(r.ssim)}  PSNR ${r.psnr.toFixed(1)}dB  ${band(r.ssim).padEnd(10)} ${r.rel}`);
}
const counts = rows.reduce((a, r) => (a[band(r.ssim)] = (a[band(r.ssim)] || 0) + 1, a), {});
console.log('\nDISTRIBUTION');
for (const k of ['excellent', 'good', 'acceptable', 'REVIEW']) if (counts[k]) console.log(`  ${k.padEnd(11)} ${counts[k]}`);
const mean = rows.reduce((a, r) => a + r.ssim, 0) / rows.length;
console.log(`\nmean SSIM ${fmt(mean)}   median ${fmt(rows[Math.floor(rows.length / 2)].ssim)}`);
if (unmatched.length) { console.log('\nUNMATCHED (no original found):'); unmatched.slice(0, 12).forEach(u => console.log('  ' + u)); }
