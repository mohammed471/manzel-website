"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ScrollVideoSection() {
  const t = useTranslations("scrollVideo");
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  // Smooth scrubbing refs
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastSeekRef = useRef(0);
  const pendingDrawRef = useRef(false);

  const slides = [
    {
      label: t("slide1_label"),
      heading: t("slide1_heading"),
      description: t("slide1_description"),
    },
    {
      label: t("slide2_label"),
      heading: t("slide2_heading"),
      description: t("slide2_description"),
    },
    {
      label: t("slide3_label"),
      heading: t("slide3_heading"),
      description: t("slide3_description"),
    },
  ];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // ── Video readiness ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => {
      if (video.readyState >= 2) {
        video.pause();
        setVideoReady(true);
      }
    };

    if (video.readyState >= 2) {
      markReady();
    } else {
      video.addEventListener("loadeddata", markReady);
      video.addEventListener("canplay", markReady);
    }

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
    };
  }, []);

  // ── Draw frame on `seeked` event — only draws when frame is actually decoded ──
  useEffect(() => {
    if (!videoReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Match canvas to video dimensions
    const updateSize = () => {
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
    };
    updateSize();

    const drawFrame = () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        pendingDrawRef.current = false;
      } catch {
        // Frame not ready — skip
      }
    };

    // Use requestVideoFrameCallback if available (much smoother)
    if ("requestVideoFrameCallback" in video) {
      const onVideoFrame = () => {
        drawFrame();
        // Keep requesting as long as component is mounted
        (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
          .requestVideoFrameCallback(onVideoFrame);
      };
      (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
        .requestVideoFrameCallback(onVideoFrame);
    } else {
      // Fallback: draw on seeked event
      video.addEventListener("seeked", drawFrame);
    }

    // Draw the initial frame
    drawFrame();

    return () => {
      video.removeEventListener("seeked", drawFrame);
    };
  }, [videoReady]);

  // ── Always-running smooth animation loop ──
  useEffect(() => {
    if (!videoReady) return;

    const video = videoRef.current;
    if (!video) return;

    const LERP_SPEED = 0.12;
    const THRESHOLD = 0.005;
    const MIN_SEEK_INTERVAL = 40; // ~25 seeks/sec max — prevents decoder overload

    const animate = () => {
      const diff = targetTimeRef.current - currentTimeRef.current;

      if (Math.abs(diff) > THRESHOLD) {
        // Lerp toward target
        currentTimeRef.current += diff * LERP_SPEED;

        // Throttle actual video seeks to prevent decoder overload
        const now = performance.now();
        if (now - lastSeekRef.current >= MIN_SEEK_INTERVAL) {
          video.currentTime = currentTimeRef.current;
          lastSeekRef.current = now;
          pendingDrawRef.current = true;
        }
      } else if (currentTimeRef.current !== targetTimeRef.current) {
        // Snap to final position
        currentTimeRef.current = targetTimeRef.current;
        video.currentTime = currentTimeRef.current;
        pendingDrawRef.current = true;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [videoReady]);

  // ── On scroll → update target time (the loop handles the rest) ──
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video || !videoReady || !video.duration) return;

    targetTimeRef.current = latest * video.duration;

    // Track active slide
    if (latest < 0.33) setActiveSlide(0);
    else if (latest < 0.63) setActiveSlide(1);
    else setActiveSlide(2);
  });

  // ── Text slides — appear OVER the video ──
  const slide1Opacity = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]);
  const slide1Y = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [60, 0, 0, -40]);

  const slide2Opacity = useTransform(scrollYProgress, [0.4, 0.45, 0.55, 0.6], [0, 1, 1, 0]);
  const slide2Y = useTransform(scrollYProgress, [0.4, 0.45, 0.55, 0.6], [60, 0, 0, -40]);

  const slide3Opacity = useTransform(scrollYProgress, [0.6, 0.65, 0.75, 0.8], [0, 1, 1, 0]);
  const slide3Y = useTransform(scrollYProgress, [0.6, 0.65, 0.75, 0.8], [60, 0, 0, -40]);

  const slideAnimations = [
    { opacity: slide1Opacity, y: slide1Y },
    { opacity: slide2Opacity, y: slide2Y },
    { opacity: slide3Opacity, y: slide3Y },
  ];

  // ── Scroll hint fades out ──
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  // ── Progress bar ──
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative bg-white"
      style={{ height: "500vh" }}
    >
      {/* Sticky fullscreen viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Video frame — centered with rounded corners */}
        <div
          className="relative w-[85%] max-w-4xl aspect-square max-h-[80vh]"
        >
          {/* Side gradients — blend video edges into white background */}
          <div className="absolute inset-y-0 left-0 w-24 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Hidden video source — used for frame data only */}
          <video
            ref={videoRef}
            src="/furniture-scrub.mp4"
            muted
            playsInline
            preload="auto"
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
          />

          {/* Canvas for smooth frame rendering */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Poster/placeholder while loading */}
          {!videoReady && (
            <div className="absolute inset-0 bg-secondary skeleton" />
          )}

        </div>

        {/* Text overlays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-full max-w-4xl px-6 sm:px-10">
            {slides.map((slide, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center px-6 sm:px-10"
                style={{
                  opacity: slideAnimations[i].opacity,
                  y: slideAnimations[i].y,
                }}
              >
                <div className="text-center">
                  {/* Label badge */}
                  <div className="inline-flex items-center gap-3 mb-5">
                    <div className="w-8 h-[2px] bg-accent" />
                    <span className="text-accent font-bold text-xs sm:text-sm tracking-[0.2em] uppercase">
                      {slide.label}
                    </span>
                    <div className="w-8 h-[2px] bg-accent" />
                  </div>

                  {/* Heading */}
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-primary leading-[1.1] font-display whitespace-pre-line">
                    {slide.heading}
                  </h2>

                  {/* Description */}
                  <p className="mt-5 text-sm sm:text-base md:text-lg text-primary/80 leading-relaxed max-w-xl mx-auto">
                    {slide.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 border border-primary/30 ${
                i === activeSlide
                  ? "bg-accent scale-125 shadow-[0_0_12px_rgba(147,57,40,0.6)] border-accent"
                  : "bg-primary/20"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary/10 z-20">
          <motion.div
            className="h-full bg-accent"
            style={{ width: progressWidth }}
          />
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="text-primary/60 text-xs tracking-[0.2em] uppercase">
            {t("scroll_hint")}
          </span>
          <div className="w-5 h-8 rounded-full border border-primary/30 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-2 bg-primary/50 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
