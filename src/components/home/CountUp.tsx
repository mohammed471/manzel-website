"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { formatStat, parseStat } from "@/lib/stats";

// Count-up for "+500" / "10+" style strings. The server HTML carries the final
// number (crawlers and link previews read it); the count from 0 is decoration
// that runs once in view, and not at all under prefers-reduced-motion.
export default function CountUp({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const parsed = parseStat(text);
  const target = parsed?.target ?? 0;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!inView || !target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf: number;
    let start: number | null = null;
    const timer = setTimeout(() => {
      const step = (t: number) => {
        if (start === null) start = t;
        const p = Math.min((t - start) / 1800, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(eased * target));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [inView, target, delay]);

  return (
    <span ref={ref} className={className}>
      {parsed ? formatStat(parsed, value) : text}
    </span>
  );
}
