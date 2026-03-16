"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

interface StatsCounterProps {
  stats: StatItem[];
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function StatsCounter({ stats }: StatsCounterProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: index * 0.15 }}
          className={`text-center ${
            index < stats.length - 1
              ? "lg:border-e lg:border-secondary-dark/40"
              : ""
          }`}
        >
          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary font-display tracking-tight">
            <CountUp value={stat.value} suffix={stat.suffix} />
          </div>
          <p className="mt-2 text-sm sm:text-base text-text-secondary">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
