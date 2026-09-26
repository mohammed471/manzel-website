"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

// First-visit-per-session splash. Cream background + dark logo to match the
// redesign. Total ~1s; only opacity/transform animations (compositor-only,
// cheap on iOS). Skipped for reduced-motion users and on repeat visits.
export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const t = useTranslations("splash");

  const handleExitComplete = useCallback(() => {
    try {
      sessionStorage.setItem("splashShown", "true");
    } catch {
      // sessionStorage unavailable — graceful degradation
    }
    document.body.style.overflow = "";
  }, []);

  const handleSkip = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    setShow(false);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try {
        sessionStorage.setItem("splashShown", "true");
      } catch {
        // graceful degradation
      }
      return;
    }

    try {
      if (sessionStorage.getItem("splashShown")) return;
    } catch {
      // sessionStorage unavailable — show splash anyway
    }

    // rAF avoids a synchronous setState inside the effect
    const raf = requestAnimationFrame(() => {
      setShow(true);
      document.body.style.overflow = "hidden";
      timersRef.current = [setTimeout(() => setShow(false), 1000)];
    });

    return () => {
      cancelAnimationFrame(raf);
      timersRef.current.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-secondary-light cursor-pointer"
          onClick={handleSkip}
          role="status"
          aria-label={t("skip_hint")}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/images/logo-dark.png"
              alt="Manzel"
              width={180}
              height={140}
              className="w-[110px] md:w-[150px] h-auto"
              priority
            />
            <motion.p
              className="mt-5 text-sm md:text-base font-medium text-primary/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              {t("tagline")}
            </motion.p>
          </motion.div>

          <div className="absolute bottom-16 w-28 md:w-40 h-[3px] rounded-full bg-primary/10 overflow-hidden">
            <motion.div
              className="h-full w-full bg-primary rounded-full origin-[0%_50%] rtl:origin-[100%_50%]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
