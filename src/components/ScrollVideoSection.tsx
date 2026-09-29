"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useTranslations } from "next-intl";
import { useDevice } from "@/lib/device";
import { SCRUB_POSTER_URL, scrubFrameSize, scrubMode } from "@/lib/scrubFrames";
import { useFrameScrub } from "@/lib/useFrameScrub";

export default function ScrollVideoSection() {
  const t = useTranslations("scrollVideo");
  // Still frames on every device (1440px desktop, 1080px phones/tablets) · Save-Data/low-end
  // phones → poster only. "pending" until hydration, so the server HTML is the same for every
  // device (poster, no frames). The section's height comes from CSS per html[data-device], so
  // nothing jumps when React takes over.
  const device = useDevice();
  const mode = scrubMode(device);
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

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

  // ── Still frames drawn on the canvas by scroll position (no video, no seeking, no autoplay) ──
  const canvasVisible = useFrameScrub(mode === "frames", scrubFrameSize(device), scrollYProgress, containerRef, canvasRef);

  // ── On scroll → track the active slide ──
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
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
    // Height from `.scrub-section` in globals.css: 500vh on desktop, 300vh on phones
    <section ref={containerRef} className="scrub-section relative bg-white">
      {/* Sticky fullscreen viewport — svh so the iOS URL bar collapsing doesn't resize it */}
      <div className="sticky top-0 h-svh w-full flex items-center justify-center overflow-hidden">
        {/* Video frame — centered */}
        <div
          className="relative w-[92%] md:w-[85%] max-w-4xl aspect-[3/4] md:aspect-square max-h-[80svh]"
        >
          {/* Edge gradients — blend video into white background on all sides */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-24 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-24 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-16 sm:h-24 md:h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 md:h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

          {/* The finished room — under the canvas, in the server HTML, so the frame is never an
              empty white box (before JS, while loading, Save-Data phones, failed downloads) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SCRUB_POSTER_URL}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Canvas the still frames are drawn on */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              canvasVisible ? "opacity-100" : "opacity-0"
            }`}
          />
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
                {/* Soft white wash on phones: the narrow frame puts the text right over the furniture */}
                <div className="text-center max-md:py-8 max-md:bg-[radial-gradient(closest-side,rgb(255_255_255/0.92)_55%,rgb(255_255_255/0))]">
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
