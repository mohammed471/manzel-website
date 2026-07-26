"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function HeroVideo() {
  const [videoFailed, setVideoFailed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Throttle via rAF — iOS fires resize continuously while the URL bar collapses during scroll
    let raf = 0;
    const check = () => setIsDesktop(window.innerWidth >= 768);
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Force play on mobile — some browsers block autoPlay attribute
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay truly blocked — show fallback gradient
        setVideoFailed(true);
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    return () => video.removeEventListener("canplay", tryPlay);
  }, []);

  return (
    <>
      {/* Video or Fallback Gradient */}
      {videoFailed ? (
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark via-primary to-primary-dark" />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
          src="/hero_video.mp4"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-primary-dark/60" />

      {/* Noise Overlay — feTurbulence filter is too expensive over video on iOS, desktop only */}
      <div className="absolute inset-0 noise-overlay hidden md:block" />

      {/* Radial Glow Decorations — large-radius blur costs a GPU pass per video frame, desktop only */}
      <div className="hidden md:block absolute top-1/4 -right-32 w-[600px] h-[600px] bg-primary-light/20 rounded-full blur-[120px]" />
      <div className="hidden md:block absolute -bottom-48 -left-24 w-[500px] h-[500px] bg-primary-light/10 rounded-full blur-[100px]" />

      {/* Floating Geometric Shapes — only rendered on desktop, not just hidden */}
      {isDesktop && <div>
        {/* Circle — top-right, slow Y oscillation */}
        <motion.div
          className="absolute top-12 right-12 w-64 h-64 rounded-full border border-white/10 opacity-10 pointer-events-none"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Diamond — center-right, scale pulse */}
        <motion.div
          className="absolute top-1/2 right-24 w-16 h-16 rotate-45 border border-white/10 opacity-10 pointer-events-none"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Small square — bottom-left, slow rotation */}
        <motion.div
          className="absolute bottom-24 left-16 w-20 h-20 border border-white/10 opacity-10 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>}
    </>
  );
}
