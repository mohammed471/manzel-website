import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnimationVariant = "fadeUp" | "fadeIn" | "scaleIn" | "slideRight";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Stagger — shifts where the reveal starts along the scroll (≈ the old seconds × 400px). */
  delay?: number;
  variant?: AnimationVariant;
}

// Scroll-driven reveal in pure CSS (`.reveal` in globals.css, animation-timeline: view()).
// Content is visible in the server HTML and never waits for JavaScript — the old
// framer-motion version shipped `opacity:0` and kept text hidden until hydration
// (≈5s LCP on a slow phone). Browsers without scroll timelines simply show it.
export default function AnimatedSection({
  children,
  className,
  delay = 0,
  variant = "fadeUp",
}: AnimatedSectionProps) {
  const style = delay ? ({ "--reveal-shift": `${Math.round(delay * 400)}px` } as CSSProperties) : undefined;
  return (
    <div className={cn("reveal", `reveal-${variant}`, className)} style={style}>
      {children}
    </div>
  );
}
