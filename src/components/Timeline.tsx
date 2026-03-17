"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

function TimelineMilestone({
  item,
  index,
  isRTL,
  skipAnimations,
}: {
  item: TimelineItem;
  index: number;
  isRTL: boolean;
  skipAnimations: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const isEven = index % 2 === 0;

  // On desktop, even items have the card on the END side, odd on the START side.
  // The x offset for the slide-in animation should come from the direction the card is on.
  // In LTR: end = right (positive x), start = left (negative x)
  // In RTL: end = left (negative x), start = right (positive x)
  const getCardOffset = (): number => {
    if (isEven) {
      // Card on END side
      return isRTL ? -60 : 60;
    }
    // Card on START side
    return isRTL ? 60 : -60;
  };

  // On mobile, all cards are on the end side
  const getMobileOffset = (): number => {
    return isRTL ? -40 : 40;
  };

  const desktopOffset = getCardOffset();
  const mobileOffset = getMobileOffset();
  const delay = index * 0.15;

  if (skipAnimations) {
    return (
      <div ref={ref} className="relative">
        {/* Desktop layout (md+) */}
        <div className="hidden md:flex items-center">
          {/* START side */}
          <div className="w-[45%] flex justify-end">
            {!isEven && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-dark/30 hover:shadow-md transition-shadow max-w-md w-full">
                <h3 className="font-bold text-lg text-text-primary">{item.title}</h3>
                <p className="text-text-secondary text-sm mt-1">{item.description}</p>
              </div>
            )}
          </div>

          {/* Center: year circle on vertical line */}
          <div className="w-[10%] flex justify-center relative">
            <div className="w-12 h-12 rounded-full bg-accent text-white font-bold flex items-center justify-center z-10 text-sm">
              {item.year}
            </div>
          </div>

          {/* END side */}
          <div className="w-[45%] flex justify-start">
            {isEven && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-dark/30 hover:shadow-md transition-shadow max-w-md w-full">
                <h3 className="font-bold text-lg text-text-primary">{item.title}</h3>
                <p className="text-text-secondary text-sm mt-1">{item.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex md:hidden items-center gap-4">
          <div className="flex-shrink-0 relative flex justify-center" style={{ width: "3rem" }}>
            <div className="w-12 h-12 rounded-full bg-accent text-white font-bold flex items-center justify-center z-10 text-sm">
              {item.year}
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-secondary-dark/30 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg text-text-primary">{item.title}</h3>
            <p className="text-text-secondary text-sm mt-1">{item.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Desktop layout (md+) */}
      <div className="hidden md:flex items-center">
        {/* START side */}
        <div className="w-[45%] flex justify-end">
          {!isEven && (
            <motion.div
              initial={{ opacity: 0, x: desktopOffset }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: desktopOffset }}
              transition={{ duration: 0.6, ease: "easeOut", delay }}
              className="bg-white rounded-xl p-6 shadow-sm border border-secondary-dark/30 hover:shadow-md transition-shadow max-w-md w-full"
            >
              <h3 className="font-bold text-lg text-text-primary">{item.title}</h3>
              <p className="text-text-secondary text-sm mt-1">{item.description}</p>
            </motion.div>
          )}
        </div>

        {/* Center: year circle on vertical line */}
        <div className="w-[10%] flex justify-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay }}
            className="w-12 h-12 rounded-full bg-accent text-white font-bold flex items-center justify-center z-10 text-sm"
          >
            {item.year}
          </motion.div>
        </div>

        {/* END side */}
        <div className="w-[45%] flex justify-start">
          {isEven && (
            <motion.div
              initial={{ opacity: 0, x: desktopOffset }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: desktopOffset }}
              transition={{ duration: 0.6, ease: "easeOut", delay }}
              className="bg-white rounded-xl p-6 shadow-sm border border-secondary-dark/30 hover:shadow-md transition-shadow max-w-md w-full"
            >
              <h3 className="font-bold text-lg text-text-primary">{item.title}</h3>
              <p className="text-text-secondary text-sm mt-1">{item.description}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden items-center gap-4">
        <div className="flex-shrink-0 relative flex justify-center" style={{ width: "3rem" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay }}
            className="w-12 h-12 rounded-full bg-accent text-white font-bold flex items-center justify-center z-10 text-sm"
          >
            {item.year}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: mobileOffset }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: mobileOffset }}
          transition={{ duration: 0.6, ease: "easeOut", delay }}
          className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-secondary-dark/30 hover:shadow-md transition-shadow"
        >
          <h3 className="font-bold text-lg text-text-primary">{item.title}</h3>
          <p className="text-text-secondary text-sm mt-1">{item.description}</p>
        </motion.div>
      </div>
    </div>
  );
}

export default function Timeline({ items }: TimelineProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsRTL(document.documentElement.dir === "rtl");
  }, []);

  const skipAnimations = !!prefersReducedMotion;

  return (
    <div className="relative w-full">
      {/* Desktop vertical center line */}
      <div
        className="hidden md:block absolute top-0 bottom-0 w-0.5 bg-secondary-dark"
        style={{ left: "50%", transform: "translateX(-50%)" }}
      />

      {/* Mobile vertical start-edge line */}
      <div
        className="md:hidden absolute top-0 bottom-0 w-0.5 bg-secondary-dark"
        style={{ insetInlineStart: "1.5rem", transform: "translateX(-50%)" }}
      />

      <div className="flex flex-col gap-8 md:gap-12 relative">
        {items.map((item, index) => (
          <TimelineMilestone
            key={index}
            item={item}
            index={index}
            isRTL={isRTL}
            skipAnimations={skipAnimations}
          />
        ))}
      </div>
    </div>
  );
}
