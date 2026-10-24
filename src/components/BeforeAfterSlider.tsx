"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Image from "@/components/SiteImage";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  caption?: string;
  /** Corner labels — default «قبل / بعد» (portfolio); the home page passes «التصميم / التنفيذ». */
  beforeLabel?: string;
  afterLabel?: string;
  /** Nudge the handle once (50 → 35 → 50) when it first comes into view, so it reads as draggable. */
  hint?: boolean;
  sizes?: string;
  className?: string;
}

const clamp = (n: number) => Math.min(95, Math.max(5, n));

// `position` = how much of the "before" image shows, measured from the start edge: the before
// image (render) is on the right in RTL and on the left in LTR. Drag, tap, or arrow keys.
export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  caption,
  beforeLabel,
  afterLabel,
  hint = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  // Eased movement only for the hint — while dragging the handle follows the finger directly
  const [smooth, setSmooth] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const t = useTranslations("portfolio");
  const tHome = useTranslations("home");

  const rtl = () => getComputedStyle(containerRef.current!).direction === "rtl";

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const fromLeft = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(rtl() ? 100 - fromLeft : fromLeft));
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Arrows move the handle the way they point on screen
    const step = e.shiftKey ? 20 : 5;
    const towardStart = rtl() ? "ArrowRight" : "ArrowLeft";
    const towardEnd = rtl() ? "ArrowLeft" : "ArrowRight";
    if (e.key === towardStart) setPosition((p) => clamp(p - step));
    else if (e.key === towardEnd) setPosition((p) => clamp(p + step));
    else if (e.key === "Home") setPosition(5);
    else if (e.key === "End") setPosition(95);
    else return;
    e.preventDefault();
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!hint || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || dragging.current) return;
        observer.disconnect();
        setSmooth(true);
        timers = [
          setTimeout(() => setPosition(35), 300),
          setTimeout(() => setPosition(50), 1000),
          setTimeout(() => setSmooth(false), 1600),
        ];
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [hint, beforeSrc]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    setSmooth(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  return (
    <figure className={className}>
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label={tHome("r2r_slider")}
        aria-valuemin={5}
        aria-valuemax={95}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${beforeLabel ?? t("before_label")} ${Math.round(position)}%`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => dragging.current && updatePosition(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        style={{ "--pos": `${position}%` } as CSSProperties}
        className="relative aspect-[16/9] rounded-2xl overflow-hidden touch-pan-y cursor-ew-resize select-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {/* After (built) behind, before (design) clipped from the start edge */}
        <Image src={afterSrc} alt={afterAlt} fill className="object-cover" sizes={sizes} draggable={false} />
        <div
          className={cn(
            "absolute inset-0 ltr:[clip-path:inset(0_calc(100%-var(--pos))_0_0)] rtl:[clip-path:inset(0_0_0_calc(100%-var(--pos)))]",
            smooth && "transition-[clip-path] duration-500 ease-out",
          )}
        >
          <Image src={beforeSrc} alt={beforeAlt} fill className="object-cover" sizes={sizes} draggable={false} />
        </div>

        <div
          aria-hidden="true"
          className={cn(
            "absolute top-0 h-full w-[2px] bg-white -translate-x-1/2 rtl:translate-x-1/2 pointer-events-none",
            smooth && "transition-[left,right] duration-500 ease-out",
          )}
          style={{ insetInlineStart: `${position}%` }}
        />
        <div
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rtl:translate-x-1/2 pointer-events-none",
            smooth && "transition-[left,right] duration-500 ease-out",
          )}
          style={{ insetInlineStart: `${position}%` }}
        >
          <div className="w-11 h-11 bg-white shadow-lg rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M18 8l4 4-4 4" />
              <path d="M6 8l-4 4 4 4" />
            </svg>
          </div>
        </div>

        <span className="absolute top-3 start-3 bg-black/55 text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
          {beforeLabel ?? t("before_label")}
        </span>
        <span className="absolute top-3 end-3 bg-black/55 text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
          {afterLabel ?? t("after_label")}
        </span>
      </div>

      {caption && <figcaption className="text-sm text-text-secondary mt-2 text-center">{caption}</figcaption>}
    </figure>
  );
}
