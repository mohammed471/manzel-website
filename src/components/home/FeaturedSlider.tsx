"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSnapCarousel } from "@/lib/useSnapCarousel";

const AUTOPLAY_MS = 5000;

// Featured projects as a horizontal slider that moves by itself (owner's request 2026-10-26): one card
// every 5 s, back to the first after the last. It stops while the pointer or keyboard focus is on it,
// after a swipe, off screen, in a background tab, and entirely under prefers-reduced-motion.
// The cards are server-rendered children (`<li>`), so they are in the HTML before any JavaScript.
export default function FeaturedSlider({ children }: { children: ReactNode }) {
  const t = useTranslations("home");
  const count = Children.count(children);
  const { listRef, current, go } = useSnapCarousel<HTMLUListElement>(count);
  const [paused, setPaused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (count < 2 || paused || touched || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      const list = listRef.current;
      if (!list || document.hidden) return;
      const atEnd = Math.abs(list.scrollLeft) + list.clientWidth >= list.scrollWidth - 4;
      go(atEnd ? 0 : current + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused, touched, visible, current, go, listRef]);

  const arrow = "w-11 h-11 rounded-full border border-primary/20 bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white disabled:opacity-30 disabled:pointer-events-none";

  return (
    <div
      ref={wrapRef}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setTouched(true)}
    >
      <ul
        ref={listRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      {count > 1 && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {Array.from({ length: count }, (_, i) => (
              <button key={i} type="button" onClick={() => go(i)} aria-label={t("featured_go", { n: String(i + 1) })}
                aria-current={i === current} className="p-1.5">
                <span className={cn("block h-1.5 rounded-full transition-all", i === current ? "w-6 bg-primary" : "w-1.5 bg-primary/25")} />
              </button>
            ))}
          </div>
          <div className="hidden md:flex gap-2">
            <button type="button" onClick={() => go(current - 1)} disabled={current === 0} aria-label={t("story_prev")} className={arrow}>
              <ChevronRight className="w-5 h-5 ltr:rotate-180" />
            </button>
            <button type="button" onClick={() => go(current + 1)} disabled={current >= count - 1} aria-label={t("story_next")} className={arrow}>
              <ChevronLeft className="w-5 h-5 ltr:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
