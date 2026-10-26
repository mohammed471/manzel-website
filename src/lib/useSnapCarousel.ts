"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A scroll-snap row of cards: which card is at the start edge (`current`) and `go(i)` to bring card i
 * there. Scrolls the row only (`scrollBy`), never the page — an autoplaying row must not pull the
 * visitor back to it. Works in RTL and LTR.
 */
export function useSnapCarousel<T extends HTMLElement>(count: number) {
  const listRef = useRef<T>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const start = list.getBoundingClientRect();
        const rtl = getComputedStyle(list).direction === "rtl";
        let best = 0;
        let bestDist = Infinity;
        [...list.children].forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const dist = Math.abs(rtl ? start.right - r.right : r.left - start.left);
          if (dist < bestDist) [best, bestDist] = [i, dist];
        });
        setCurrent(best);
      });
    };
    list.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      list.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = useCallback(
    (i: number) => {
      const list = listRef.current;
      const el = list?.children[Math.max(0, Math.min(count - 1, i))];
      if (!list || !el) return;
      const start = list.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const rtl = getComputedStyle(list).direction === "rtl";
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      list.scrollBy({ left: rtl ? r.right - start.right : r.left - start.left, behavior: smooth ? "smooth" : "auto" });
    },
    [count],
  );

  return { listRef, current, go };
}
