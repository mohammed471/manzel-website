"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MasonryGridProps {
  children: ReactNode;
  className?: string;
}

export default function MasonryGrid({ children, className }: MasonryGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();

  const items = Children.toArray(children);

  // Cap stagger at first 12 items (0.6s), rest appear instantly
  const maxStagger = 12;

  return (
    <div
      ref={ref}
      className={cn("columns-1 sm:columns-2 lg:columns-3 gap-4", className)}
    >
      {items.map((child, index) =>
        prefersReducedMotion ? (
          <div key={index} className="break-inside-avoid mb-4">
            {child}
          </div>
        ) : (
          <motion.div
            key={index}
            className="break-inside-avoid mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: index < maxStagger ? index * 0.05 : 0,
            }}
          >
            {child}
          </motion.div>
        )
      )}
    </div>
  );
}
