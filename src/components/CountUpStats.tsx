"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

interface Stat {
  numberText: string;
  label: string;
}

interface CountUpStatsProps {
  stats: Stat[];
}

function parseStat(numberText: string) {
  const match = numberText.match(/^([^\d]*)(\d+)(.*)$/);
  if (!match) {
    return { prefix: "", target: 0, suffix: "" };
  }
  return {
    prefix: match[1],
    target: parseInt(match[2], 10),
    suffix: match[3],
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function CountUpNumber({
  target,
  prefix,
  suffix,
  delay,
  inView,
}: {
  target: number;
  prefix: string;
  suffix: string;
  delay: number;
  inView: boolean;
}) {
  const [currentValue, setCurrentValue] = useState(0);
  const hasAnimated = useRef(false);
  const animationRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const value = Math.round(easedProgress * target);

      setCurrentValue(value);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  }, [target]);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;

    const timeout = setTimeout(() => {
      animate();
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [inView, delay, animate]);

  const formatted = formatNumber(currentValue);

  return (
    <>
      {prefix}
      {formatted}
      {suffix}
    </>
  );
}

export default function CountUpStats({ stats }: CountUpStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  return (
    <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => {
        const { prefix, target, suffix } = parseStat(stat.numberText);
        const delayMs = index * 200;
        const delaySec = index * 0.2;

        return (
          <motion.div
            key={index}
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
              delay: delaySec,
            }}
          >
            <p className="text-4xl md:text-5xl font-extrabold text-secondary">
              <CountUpNumber
                target={target}
                prefix={prefix}
                suffix={suffix}
                delay={delayMs}
                inView={isInView}
              />
            </p>
            <p className="text-white/80 mt-2 font-medium">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
