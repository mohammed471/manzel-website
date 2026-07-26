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
  const [isMobile, setIsMobile] = useState(false);

  // Smooth scrubbing refs (desktop only)
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastSeekRef = useRef(0);
  const pendingDrawRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const animateFnRef = useRef<() => void>(() => {});

  // Detect mobile (touch device or narrow screen)
  useEffect(() => {
    // rAF-throttled — iOS fires resize continuously while the URL bar collapses during scroll
    let raf = 0;
    const check = () => {
      const narrow = window.innerWidth < 768;
      const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(narrow || touch);
    };
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

  // ── Desktop: pause video once decodable so the scrub loop owns playback ──
  useEffect(() => {
    if (isMobile) return;

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
  }, [isMobile]);

  // ── Mobile: lazy-load — start fetching/playing only when the section nears the viewport,
  //    so it never competes with the hero video for bandwidth ──
  useEffect(() => {
    if (!isMobile) return;

    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [isMobile]);

  // ── Draw frame on `seeked` event — only draws when frame is actually decoded (desktop only) ──
  useEffect(() => {
    if (!videoReady || isMobile) return;

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
    const rvfc = (video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number })
      .requestVideoFrameCallback;
    if (rvfc) {
      const onVideoFrame = () => {
        drawFrame();
        rvfc.call(video, onVideoFrame);
      };
      rvfc.call(video, onVideoFrame);
    } else {
      // Fallback: draw on seeked event
      video.addEventListener("seeked", drawFrame);
    }

    // Draw the initial frame
    drawFrame();

    return () => {
      video.removeEventListener("seeked", drawFrame);
    };
  }, [videoReady, isMobile]);

  // ── On-demand smooth animation loop — desktop only; iOS can't seek without a gesture ──
  useEffect(() => {
    if (!videoReady || isMobile) return;

    const video = videoRef.current;
    if (!video) return;

    const LERP_SPEED = 0.12;
    const THRESHOLD = 0.005;
    const MIN_SEEK_INTERVAL = 40;

    const animate = () => {
      const diff = targetTimeRef.current - currentTimeRef.current;

      if (Math.abs(diff) > THRESHOLD) {
        currentTimeRef.current += diff * LERP_SPEED;

        const now = performance.now();
        if (now - lastSeekRef.current >= MIN_SEEK_INTERVAL) {
          video.currentTime = currentTimeRef.current;
          lastSeekRef.current = now;
          pendingDrawRef.current = true;
        }
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Snap to final position and stop the loop — no wasted frames on idle
        currentTimeRef.current = targetTimeRef.current;
        video.currentTime = currentTimeRef.current;
        pendingDrawRef.current = true;
        isAnimatingRef.current = false;
      }
    };

    animateFnRef.current = animate;

    return () => {
      cancelAnimationFrame(rafRef.current);
      isAnimatingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoReady, isMobile]);

  // ── On scroll → update target time and start loop if idle (desktop only) ──
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (isMobile) return;

    const video = videoRef.current;
    if (!video || !videoReady || !video.duration) return;

    targetTimeRef.current = latest * video.duration;

    // Start the animation loop only when there's something to animate
    if (!isAnimatingRef.current && animateFnRef.current) {
      isAnimatingRef.current = true;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animateFnRef.current);
    }

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

  // ── Mobile: normal-height section, lazy autoplaying loop, slides as static text ──
  if (isMobile) {
    return (
      <section ref={containerRef} className="relative bg-white py-16 overflow-hidden">
        <div className="relative w-[92%] mx-auto aspect-[3/4] max-h-[70vh]">
          {/* Edge gradients — blend video into white background */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

          {/* Small normal-GOP encode — the all-intra scrub file is desktop-only */}
          <video
            ref={videoRef}
            src="/furniture-mobile.mp4"
            muted
            playsInline
            loop
            preload="none"
            poster="/images/furniture-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="mt-12 px-6 space-y-12">
          {slides.map((slide, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px] bg-accent" />
                <span className="text-accent font-bold text-xs tracking-[0.2em] uppercase">
                  {slide.label}
                </span>
                <div className="w-8 h-[2px] bg-accent" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary leading-[1.15] font-display whitespace-pre-line">
                {slide.heading}
              </h2>
              <p className="mt-3 text-sm text-primary/80 leading-relaxed max-w-xl mx-auto">
                {slide.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative bg-white"
      style={{ height: "500vh" }}
    >
      {/* Sticky fullscreen viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Video frame — centered */}
        <div
          className="relative w-[92%] md:w-[85%] max-w-4xl aspect-[3/4] md:aspect-square max-h-[80vh]"
        >
          {/* Edge gradients — blend video into white background on all sides */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-24 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-24 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-16 sm:h-24 md:h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 md:h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

          {/* Video element — hidden, feeds the canvas; autoPlay forces data load so canplay fires, then we pause.
              furniture-scrub.mp4 MUST stay all-intra (ffmpeg -g 1) — sparse keyframes make every seek decode
              dozens of frames and the scrub stutters */}
          <video
            ref={videoRef}
            src="/furniture-scrub.mp4"
            muted
            playsInline
            autoPlay
            preload="metadata"
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
                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-primary leading-[1.1] font-display whitespace-pre-line">
                    {slide.heading}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 sm:mt-5 text-xs sm:text-sm md:text-base lg:text-lg text-primary/80 leading-relaxed max-w-xl mx-auto">
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
