"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

// Lightweight count-up that parses "+500" / "10+" style strings and
// animates the numeric part when scrolled into view. Reusable across
// the differently-styled stat sections of each preview variant.
function parse(text: string) {
  const m = text.match(/^([^\d]*)(\d+)(.*)$/);
  if (!m) return { prefix: "", target: 0, suffix: "" };
  return { prefix: m[1], target: parseInt(m[2], 10), suffix: m[3] };
}

export default function CountUp({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const { prefix, target, suffix } = parse(text);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
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
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
