"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("common");

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    // Shown only while scrolling up past 400px — the moment someone wants the top;
    // hidden while reading down so it never sits over the content.
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 8) return;
      setVisible(y > 400 && y < lastY);
      lastY = y;
    };
    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-to-top"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0 })}
          aria-label={t("scroll_to_top")}
          className="floating-fab-stack fixed bottom-[4.25rem] left-[18px] lg:bottom-[5.75rem] lg:left-[30px] z-30 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 text-primary border border-secondary-dark shadow-md hover:bg-secondary-light transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
