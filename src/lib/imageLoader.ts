import type { ImageLoader } from "next/image";

// Images uploaded from the internal app live on Cloudflare R2. Every one has a 640px
// `<stem>.thumb.webp` next to it (written first by mobile_web/core/image_store.py, so
// it exists whenever the full image does). Serving those straight from Cloudflare's edge
// skips /_next/image on Render, which Cloudflare doesn't cache and which resizes each
// image on first request (0.4–0.7s each, and its cache is wiped on every deploy).
export const R2_IMAGE_ORIGIN = "https://img.manzel360.com/";
export const R2_THUMB_WIDTH = 640;

const THUMB_SUFFIX = ".thumb.webp";
// Same extensions the app uploads (ALLOWED_IMAGE_TYPES in the app); anything else has no thumb
const THUMBABLE = /\.(jpe?g|png|webp|gif)$/i;

export function isR2Image(src: unknown): src is string {
  return typeof src === "string" && src.startsWith(R2_IMAGE_ORIGIN);
}

/** The thumb next to an R2 image, or the URL unchanged if it has none (mirrors `thumb_url`). */
export function r2ThumbUrl(src: string): string {
  if (!isR2Image(src) || src.endsWith(THUMB_SUFFIX) || !THUMBABLE.test(src)) return src;
  return src.replace(THUMBABLE, THUMB_SUFFIX);
}

// The browser picks a width from srcset (sizes × device pixel ratio): grids and cards get
// the thumb, large views get the full image.
export const r2Loader: ImageLoader = ({ src, width }) =>
  width <= R2_THUMB_WIDTH ? r2ThumbUrl(src) : src;

/** `loader` for next/image: R2 images bypass the optimizer; everything else keeps it. */
export function loaderFor(src: unknown): ImageLoader | undefined {
  return isR2Image(src) ? r2Loader : undefined;
}
