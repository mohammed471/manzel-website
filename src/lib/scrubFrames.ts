import type { DeviceProfile } from "@/lib/device";

// Phones scrub the furniture section through still frames drawn on a canvas instead of
// seeking a video: iOS seeks stuttered the scroll and need a playing video, which Low
// Power Mode refuses. Frames are every 2nd frame of the original from frame 4 (the first
// 4 are blank white), 640px WebP — regenerate with the command in CLAUDE.md.
export const SCRUB_FRAME_COUNT = 59;

// The finished room (last frame). Shown before JavaScript, while frames load, and to
// phones that get no frames — never the blank first frame.
export const SCRUB_POSTER_URL = "/images/furniture-poster.jpg";

export type ScrubMode = "pending" | "video" | "frames" | "poster";

export function scrubFrameUrl(index: number): string {
  return `/scrub-frames/${String(index).padStart(3, "0")}.webp`;
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
  if (device.kind === "desktop") return "video";
  return device.constrained ? "poster" : "frames";
}
