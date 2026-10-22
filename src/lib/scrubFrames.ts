import type { DeviceProfile } from "@/lib/device";

// The furniture section scrubs still frames drawn on a canvas, not a video: iOS seeks
// stuttered the scroll and need a playing video (Low Power Mode refuses), and at the same
// quality WebP stills are half the size of an all-intra video (1440: 1.9 MB vs 4 MB — the
// old 960px desktop video looked blurry). Frames are every 2nd frame of the original from
// frame 4 (the first 4 are blank white), square WebP in one folder per size: 1080 for
// phones/tablets (sharp on a 3× phone; square so tablets' square box isn't cropped), 1440
// (the original's size) for desktop. Regenerate with the command in CLAUDE.md.
export const SCRUB_FRAME_COUNT = 59;
export const SCRUB_FRAME_SIZES = [1080, 1440] as const;
export type ScrubFrameSize = (typeof SCRUB_FRAME_SIZES)[number];

// The finished room (last frame). Shown before JavaScript, while frames load, and to
// phones that get no frames — never the blank first frame.
export const SCRUB_POSTER_URL = "/images/furniture-poster.jpg";

export type ScrubMode = "pending" | "frames" | "poster";

export function scrubFrameUrl(index: number, size: ScrubFrameSize): string {
  return `/scrub-frames/${size}/${String(index).padStart(3, "0")}.webp`;
}

export function scrubFrameSize(device: DeviceProfile | null): ScrubFrameSize {
  return device?.kind === "desktop" ? 1440 : 1080;
}

export function frameForProgress(progress: number, count: number): number {
  if (!Number.isFinite(progress)) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  return Math.round(clamped * (count - 1));
}

/** Every `step`th frame and the last one first, then the rest in order. */
export function frameLoadOrder(count: number, step = 8): number[] {
  const coarse: number[] = [];
  for (let i = 0; i < count; i += step) coarse.push(i);
  if (coarse[coarse.length - 1] !== count - 1) coarse.push(count - 1);
  const coarseSet = new Set(coarse);
  const rest = Array.from({ length: count }, (_, i) => i).filter((i) => !coarseSet.has(i));
  return [...coarse, ...rest];
}

/** Closest loaded frame to `target` (the earlier one on a tie), or -1 if none has loaded. */
export function nearestLoadedFrame(target: number, loaded: readonly boolean[]): number {
  for (let d = 0; d < loaded.length; d++) {
    if (loaded[target - d]) return target - d;
    if (loaded[target + d]) return target + d;
  }
  return -1;
}

export function scrubMode(device: DeviceProfile | null): ScrubMode {
  if (!device) return "pending";
  // A low-memory desktop still has the bandwidth and memory for frames; phones don't
  if (device.kind === "desktop") return "frames";
  return device.constrained ? "poster" : "frames";
}
