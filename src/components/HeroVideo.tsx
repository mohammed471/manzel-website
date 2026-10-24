"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "@/components/SiteImage";
import { useTranslations } from "next-intl";
import { useDevice } from "@/lib/device";

// Full-bleed hero background.
//
// iOS rules (see CLAUDE.md "Performance Rules"):
//  - The poster is a real <Image priority> so the hero paints instantly (LCP)
//    even before/without video. The video fades in only once it is actually
//    playing, so there is never a black box.
//  - If autoplay is refused (Low Power Mode, Data Saver) the video element is
//    dropped and the poster stays — never a broken/blank hero.
//  - The video pauses whenever the hero leaves the viewport, so it never
//    decodes at the same time as the furniture video further down the page
//    (two concurrent decodes exceed iOS Safari's media budget).
//  - Constrained devices (Save-Data, low memory, low-end Android) get the
//    poster only.
//  - The video is only attached after the window `load` event, so its download
//    never competes with the page's own scripts, fonts and images on a slow phone.
function subscribeLoad(onChange: () => void) {
  window.addEventListener("load", onChange);
  return () => window.removeEventListener("load", onChange);
}
const pageLoaded = () => document.readyState === "complete";
const notLoadedOnServer = () => false;
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";
function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCE_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const prefersReducedMotion = () => window.matchMedia(REDUCE_MOTION).matches;

/** Bottom + start-side shade keeps the white text AA over any photo. */
export function HeroShade() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/60 via-primary-dark/40 to-primary-dark/85" />
      <div className="absolute inset-0 rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-primary-dark/50 to-transparent" />
    </>
  );
}

export default function HeroVideo({ poster: posterOverride }: { poster?: string } = {}) {
  const device = useDevice();
  // Editable from the internal app («الموقع» → الصور)
  const tSite = useTranslations("site");
  // The first hero photo from «أقسام الرئيسية» when there is one, else the main image
  const poster = posterOverride || tSite("hero_image");
  // Empty = no video, the poster only (the old gym clip was removed)
  const videoSrc = tSite("hero_video");
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const loaded = useSyncExternalStore(subscribeLoad, pageLoaded, notLoadedOnServer);
  // Reduced motion → the poster only
  const reduceMotion = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => true);
  const useVideo = !!videoSrc && loaded && device !== null && !device.constrained && !failed && !reduceMotion;

  useEffect(() => {
    if (!useVideo) return;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const tryPlay = () => {
      video.play().catch(() => setFailed(true));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
        else video.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [useVideo]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-primary-dark">
      <Image
        src={poster}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {useVideo && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          src={videoSrc}
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <HeroShade />
    </div>
  );
}
