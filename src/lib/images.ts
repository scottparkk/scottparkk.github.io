/**
 * Image resolution.
 *
 * Content stores images as plain strings ("/images/projects/…"), the same way
 * it always has. This maps those strings onto the real assets in src/assets so
 * Astro can process them at build time.
 *
 * Deliberately NOT using Astro's `image()` schema helper: that only works
 * inside a content-collection Zod schema and resolves paths relative to each
 * markdown file. Keeping plain strings means the storage layer (markdown today,
 * JSON or a database later) can change without touching how images render.
 */

import { getImage } from 'astro:assets';

/** Eagerly collected so lookups are synchronous and build-time verifiable. */
const assets = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{png,jpg,jpeg,webp,gif,avif}',
  { eager: true },
);

const ASSET_PREFIX = '/src/assets/images';
const PUBLIC_PREFIX = '/images';

/** Widths generated for responsive srcset. Capped by the master's own width. */
export const RESPONSIVE_WIDTHS = [400, 800, 1200, 1600, 2560];

function keyFor(publicPath: string): string {
  // Content may carry encoded spaces; glob keys are literal file paths.
  const clean = decodeURIComponent(publicPath.split('?')[0]);
  return ASSET_PREFIX + clean.slice(PUBLIC_PREFIX.length);
}

/**
 * Look up the processed asset for a content path.
 * Throws rather than returning undefined: a typo'd image path should fail the
 * build, not silently render a broken img at runtime.
 */
export function resolveImage(publicPath: string): ImageMetadata {
  const found = assets[keyFor(publicPath)];
  if (!found) {
    throw new Error(
      `Image not found in src/assets: "${publicPath}" (looked for "${keyFor(publicPath)}"). ` +
      `Add the file or fix the path in the content frontmatter.`,
    );
  }
  return found.default;
}

/** Same lookup, but tolerant — for optional fields where absence is valid. */
export function tryResolveImage(publicPath?: string | null): ImageMetadata | undefined {
  if (!publicPath) return undefined;
  return assets[keyFor(publicPath)]?.default;
}

/**
 * A single processed URL, for places that need a plain string rather than an
 * element: og:image tags and the lightbox, which passes URLs into client JS.
 */
export async function imageUrl(
  publicPath: string,
  { width = 2000, format = 'webp' as const } = {},
): Promise<string> {
  const src = resolveImage(publicPath);
  const out = await getImage({
    src,
    width: Math.min(width, src.width),
    format,
  });
  return out.src;
}

/** Absolute URL, required by og:image — scrapers reject relative paths. */
export async function absoluteImageUrl(
  publicPath: string,
  site: URL | undefined,
  opts?: { width?: number },
): Promise<string> {
  const rel = await imageUrl(publicPath, opts);
  return new URL(rel, site ?? 'https://scottparkk.github.io').toString();
}
