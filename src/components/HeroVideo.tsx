"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
export default function HeroVideo() {
  const device = useDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const useVideo = device !== null && !device.constrained && !failed;

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
        src="/images/hero-poster.jpg"
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
          poster="/images/hero-poster.jpg"
          src="/hero_video.mp4"
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/55 via-primary-dark/35 to-primary-dark/80" />
    </div>
  );
}
