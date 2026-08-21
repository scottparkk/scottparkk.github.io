/**
 * Image processing core.
 *
 * One function, one job: take any source image and produce a web-ready master.
 * The batch CLI (scripts/process-images.mjs) and the future local ingest tool
 * both call this, so output is identical no matter which path added the image.
 *
 * Format policy is chosen by content, not by preference — measured on this
 * project's own files:
 *   PNG  -> WebP      (flat/graphic artwork; ~97% smaller)
 *   JPEG -> mozjpeg   (already-lossy photos; beats WebP by ~25% here)
 *   GIF  -> WebP      (animated frames preserved)
 *   WebP -> WebP      (re-encoded only when oversized)
 */

import { stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Width cap. Comfortable for large desktop displays; not print resolution.
 *
 * Width, not "long edge" — capping the long edge squashes tall images. A
 * 2198x19327 full-page screenshot capped at 2560 on its long edge comes out
 * 291px wide and completely illegible.
 */
export const DEFAULT_MAX_EDGE = 2560;

/**
 * Height ceiling, set just below WebP's hard 16383px limit. Only extremely
 * tall images (full-page screenshots) ever reach it; encoding fails outright
 * above the format limit rather than degrading, so this must stay under it.
 */
export const MAX_HEIGHT = 16000;
export const DEFAULT_QUALITY = 82;
/** Animation is far more expensive per byte, so it gets its own (lower) quality. */
export const DEFAULT_ANIMATED_QUALITY = 75;

const JPEG_EXT = new Set(['.jpg', '.jpeg']);
const SUPPORTED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

export function isSupported(file) {
  return SUPPORTED.has(path.extname(file).toLowerCase());
}

/**
 * Decide the output format and extension for a source file.
 * Kept separate so callers can preview decisions without touching pixels.
 */
export function targetFormatFor(file, { animated = false } = {}) {
  const ext = path.extname(file).toLowerCase();
  if (JPEG_EXT.has(ext)) return { format: 'jpeg', ext: '.jpg' };
  if (ext === '.gif') return { format: 'webp', ext: '.webp', animated };
  return { format: 'webp', ext: '.webp', animated };
}

/**
 * Process a single image.
 *
 * @param {string} input                Absolute or cwd-relative path to the source.
 * @param {object} [opts]
 * @param {number} [opts.maxEdge]       Width cap in pixels.
 * @param {number} [opts.quality]       Encoder quality for still images.
 * @param {boolean} [opts.dryRun]       Compute the result without writing anything.
 * @param {boolean} [opts.keepOriginal] Leave the source file in place after writing.
 * @param {boolean} [opts.force]        Re-encode even if the file is already a master.
 * @returns {Promise<object>} Result describing what happened (or would happen).
 */
export async function processImage(input, opts = {}) {
  const {
    maxEdge = DEFAULT_MAX_EDGE,
    quality = DEFAULT_QUALITY,
    animatedQuality = DEFAULT_ANIMATED_QUALITY,
    dryRun = false,
    keepOriginal = false,
    force = false,
  } = opts;

  const ext = path.extname(input).toLowerCase();
  if (!SUPPORTED.has(ext)) {
    return { input, skipped: true, reason: `unsupported extension ${ext}` };
  }

  const before = (await stat(input)).size;
  const probe = await sharp(input).metadata();
  const animated = (probe.pages ?? 1) > 1;

  const target = targetFormatFor(input, { animated });
  const output = path.join(
    path.dirname(input),
    path.basename(input, path.extname(input)) + target.ext,
  );

  const needsResize = (probe.width ?? 0) > maxEdge || (probe.height ?? 0) > MAX_HEIGHT;

  // Already a master: right format, within the size caps. Re-encoding it would
  // compound lossy compression for a few kB — silent quality decay every time
  // the batch runs. Pass force:true to override (e.g. re-encoding at a higher
  // quality, which must start from the untouched original, not from this file).
  if (!force && ext === target.ext && !needsResize) {
    return {
      input, output, before, after: before, saved: 0,
      format: target.format, animated, frames: probe.pages ?? 1,
      width: probe.width, height: probe.height,
      resized: false, replacedExtension: false,
      skipped: true, reason: 'already a master (correct format, within size caps)',
    };
  }

  // Read animated sources as animations or sharp silently keeps only frame one.
  let pipeline = sharp(input, { animated });

  const willResize = needsResize;
  if (willResize) {
    pipeline = pipeline.resize({
      width: maxEdge,
      height: MAX_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (target.format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else {
    pipeline = pipeline.webp({
      quality: animated ? animatedQuality : quality,
      effort: 4,
    });
  }

  const buffer = await pipeline.toBuffer();

  const result = {
    input,
    output,
    before,
    after: buffer.length,
    saved: before - buffer.length,
    format: target.format,
    animated,
    frames: probe.pages ?? 1,
    width: probe.width,
    height: probe.height,
    resized: willResize,
    replacedExtension: output !== input,
    skipped: false,
  };

  // Never let a "optimisation" make a file bigger. Re-running the batch should
  // be a no-op rather than a slow ratchet in the wrong direction.
  if (buffer.length >= before && !willResize) {
    return { ...result, skipped: true, reason: 'already smaller than re-encode' };
  }

  if (dryRun) return result;

  const { writeFile, unlink } = await import('node:fs/promises');
  await writeFile(output, buffer);
  if (!keepOriginal && output !== input) await unlink(input);

  return result;
}
