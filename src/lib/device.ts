"use client";

import { useSyncExternalStore } from "react";

// Device profile used to adapt media/effects per platform.
//  - desktop: full experience (scroll-scrubbed video, hover effects)
//  - ios:     strictest media budget — one video decoding at a time, poster
//             fallback when autoplay is refused (Low Power Mode), no seeking
//  - android: autoplay loops, but skip video on Save-Data / low-end devices
export type DeviceKind = "desktop" | "ios" | "android" | "mobile";

export interface DeviceProfile {
  kind: DeviceKind;
  isTouch: boolean;
  /** Save-Data header / low memory / few cores — prefer posters over video */
  constrained: boolean;
}

const SERVER_PROFILE: DeviceProfile = { kind: "desktop", isTouch: false, constrained: false };

let cached: DeviceProfile | null = null;

export function detectDevice(): DeviceProfile {
  if (typeof window === "undefined") return SERVER_PROFILE;
  if (cached) return cached;

  const ua = navigator.userAgent;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  // iPadOS 13+ reports itself as "Macintosh" — detect via touch support
  const isIOS = /iP(hone|od|ad)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const narrow = window.matchMedia("(max-width: 767px)").matches;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const constrained =
    nav.connection?.saveData === true ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) ||
    (isAndroid && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);

  const kind: DeviceKind = isIOS
    ? "ios"
    : isAndroid
      ? "android"
      : isTouch && narrow
        ? "mobile"
        : "desktop";

  cached = { kind, isTouch, constrained };
  return cached;
}

const noopSubscribe = () => () => {};

/**
 * Returns the device profile after hydration, and `null` during SSR / the
 * first client render so server and client markup match.
 */
export function useDevice(): DeviceProfile | null {
  return useSyncExternalStore<DeviceProfile | null>(noopSubscribe, detectDevice, () => null);
}
