"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

// Geometric decoration shapes for background
function GeometricShapes() {
  const shapes = [
    // Hexagon - top left
    {
      d: "M26 2L50 15V41L26 54L2 41V15Z",
      x: "8%",
      y: "12%",
      size: 56,
      duration: 20,
      delay: 0,
      opacity: 0.07,
    },
    // Diamond - top right
    {
      d: "M20 2L38 20L20 38L2 20Z",
      x: "85%",
      y: "18%",
      size: 40,
      duration: 25,
      delay: 2,
      opacity: 0.05,
    },
    // Circle - bottom left
    {
      d: "M20 2A18 18 0 1 1 20 38A18 18 0 1 1 20 2Z",
      x: "12%",
      y: "75%",
      size: 40,
      duration: 18,
      delay: 1,
      opacity: 0.06,
    },
    // Small hexagon - bottom right
    {
      d: "M16 2L30 9.5V24.5L16 32L2 24.5V9.5Z",
      x: "88%",
      y: "70%",
      size: 32,
      duration: 22,
      delay: 3,
      opacity: 0.05,
    },
    // Diamond - center left
    {
      d: "M14 2L26 14L14 26L2 14Z",
      x: "5%",
      y: "45%",
      size: 28,
      duration: 24,
      delay: 1.5,
      opacity: 0.04,
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, i) => (
        <motion.svg
          key={i}
          className="absolute"
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
          }}
          viewBox={`0 0 ${shape.size} ${shape.size}`}
          initial={{ rotate: 0, x: 0, y: 0 }}
          animate={{
            rotate: [0, 360],
            x: [0, 10, -5, 0],
            y: [0, -8, 5, 0],
          }}
          transition={{
            rotate: {
              duration: shape.duration,
              repeat: Infinity,
              ease: "linear",
            },
            x: {
              duration: shape.duration * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: shape.delay,
            },
            y: {
              duration: shape.duration * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: shape.delay,
            },
          }}
        >
          <path
            d={shape.d}
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity={shape.opacity}
          />
        </motion.svg>
      ))}
    </div>
  );
}

// Tagline with word-by-word animation
function AnimatedTagline({ text }: { text: string }) {
  const words = text.split(" ");

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-x-2 gap-y-1 px-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="text-base md:text-lg lg:text-xl text-white/85 font-light"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 0.85, y: 0 },
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState(0);
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
    // Directly trigger AnimatePresence exit animation
    timersRef.current.forEach(clearTimeout);
    setShow(false);
  }, []);

  // Determine if splash should show on mount (client-only)
  useEffect(() => {
    // Check reduced motion preference — skip splash entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try {
        sessionStorage.setItem("splashShown", "true");
      } catch {
        // graceful degradation
      }
      return;
    }

    // Check if already shown this session
    try {
      if (sessionStorage.getItem("splashShown")) {
        return;
      }
    } catch {
      // sessionStorage unavailable — show splash anyway
    }

    // First visit in session — show splash and lock scroll
    // Use rAF to avoid synchronous setState-in-effect lint warning
    const raf = requestAnimationFrame(() => {
      setShow(true);
      document.body.style.overflow = "hidden";

      // Animation timeline — phases advance content, final timer triggers exit
      timersRef.current = [
        setTimeout(() => setPhase(1), 1000),
        setTimeout(() => setPhase(2), 1800),
        setTimeout(() => setShow(false), 2500), // Triggers AnimatePresence exit animation
      ];
    });

    return () => {
      cancelAnimationFrame(raf);
      timersRef.current.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary cursor-pointer"
          onClick={handleSkip}
          role="status"
          aria-label={t("skip_hint")}
          initial={{ clipPath: "circle(150% at 50% 40%)" }}
          exit={{ clipPath: "circle(0% at 50% 40%)" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          onAnimationComplete={(definition) => {
            // Handle exit animation complete — save session state
            if (
              typeof definition === "object" &&
              definition !== null &&
              "clipPath" in definition &&
              (definition as { clipPath: string }).clipPath ===
                "circle(0% at 50% 40%)"
            ) {
              handleExitComplete();
            }
          }}
        >
          {/* Background geometric decorations */}
          <GeometricShapes />

          {/* Logo + Brand Name */}
          <motion.div
            className="relative z-10 text-center flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Company logo */}
            <Image
              src="/images/logo-light.png"
              alt="Manzel"
              width={180}
              height={140}
              className="w-[120px] md:w-[160px] lg:w-[180px] h-auto"
              priority
            />

            {/* Bilingual company name */}
            <motion.p
              className="mt-4 md:mt-5 text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wider"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            >
              <span>{t("brand_name")}</span>
              <span className="mx-2 text-white/40">|</span>
              <span className="font-english tracking-[0.15em]">MANZEL</span>
            </motion.p>
          </motion.div>

          {/* Tagline */}
          {phase >= 1 && (
            <div className="relative z-10 mt-3 md:mt-4">
              <AnimatedTagline text={t("tagline")} />
            </div>
          )}

          {/* Progress bar */}
          {phase >= 2 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
              <div className="w-[120px] md:w-[200px] h-[3px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-splash-gold rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
