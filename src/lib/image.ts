// Image utility centralizing responsive sizing & defaults for project/media assets.
// Phase 3 Core: Keep it minimal; expand with blur placeholders or dominant color later.

import type { HTMLAttributes } from 'astro/types';
import { getImage } from 'astro:assets';

// Standard content widths; adjust if max layout width changes.
export const IMAGE_WIDTHS = [320, 480, 640, 800, 1024, 1280];
export const HERO_WIDTHS = [480, 800, 1200, 1600, 2000];
export const FORMATS = ['avif', 'webp', 'jpeg'] as const;

export type KnownFormat = typeof FORMATS[number];

export interface BuildImageSetOptions {
  // Using string for now (public path). Later we can accept imported ImageMetadata.
  src: string;
  alt: string;
  widths?: number[];
  formats?: KnownFormat[];
  sizes?: string; // CSS sizes attribute
  loading?: 'lazy' | 'eager';
  priority?: boolean; // Convenience flag to force eager loading
  class?: string;
  decoding?: 'async' | 'sync' | 'auto';
}

export function defaultSizes(maxContentWidth = 800) {
  return `(max-width: ${maxContentWidth}px) 100vw, ${maxContentWidth}px`;
}

// For now this returns a normalized object the consuming component can spread onto <img>.
// When we migrate to astro:assets <Image />, we will add width/format generation there.
export async function buildImageSet(opts: BuildImageSetOptions) {
  const {
    src,
    alt,
    widths = IMAGE_WIDTHS,
    formats = FORMATS,
    sizes = defaultSizes(),
    loading = 'lazy',
    priority = false,
    class: className = '',
    decoding = 'async',
  } = opts;

  // Attempt to use astro:assets pipeline ONLY for local images (start with /images/) and common raster formats
  let transformed: any = null;
  if (/^\/(images|fonts)\//.test(src) && /\.(png|jpe?g|webp)$/i.test(src)) {
    try {
      // Generate a largest image to act as base; browsers will downscale; we still pass sizes
      const largestWidth = Math.max(...widths);
      transformed = await getImage({ src, width: largestWidth, alt, format: 'webp' });
    } catch (e) {
      // silently fallback
    }
  }
  return {
    src: transformed?.src || src,
    alt,
    sizes,
    loading: priority ? 'eager' : loading,
    decoding,
    class: className,
    _meta: { widths, formats, priority, optimized: Boolean(transformed) },
  } satisfies HTMLAttributes<'img'> & { _meta: any };
}

// Decide if an image should be prioritized (eager) based on route or index position.
export function shouldPriorityLoad(index: number, pathname: string) {
  // Example heuristic: first 2 project cards on the homepage.
  if (pathname === '/' && index < 2) return true;
  return false;
}
