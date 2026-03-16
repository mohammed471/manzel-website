"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

interface HeroTextProps {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  browseProductsLabel: string;
  viewPortfolioLabel: string;
  bookingLabel?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const transition = (delay: number) => ({
  duration: 0.6,
  ease: "easeOut" as const,
  delay,
});

export default function HeroText({
  badge,
  title,
  subtitle,
  description,
  browseProductsLabel,
  viewPortfolioLabel,
  bookingLabel,
}: HeroTextProps) {
  const titleWords = title.split(" ");
  const subtitleWords = subtitle.split(" ");
  const subtitleStartDelay = 0.3 + titleWords.length * 0.08;
  const descriptionDelay = subtitleStartDelay + subtitleWords.length * 0.08;
  const ctaDelay = descriptionDelay + 0.6;

  return (
    <div className="relative text-center">
      {/* Badge */}
      <motion.div
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={transition(0)}
        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8"
      >
        <span className="w-2 h-2 bg-accent rounded-full" />
        <span className="text-white/80 text-sm font-medium">{badge}</span>
      </motion.div>

      {/* Title + Subtitle */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight">
        {titleWords.map((word, i) => (
          <motion.span
            key={`title-${i}`}
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={transition(0.3 + i * 0.08)}
            className="inline-block me-3"
          >
            {word}
          </motion.span>
        ))}
        <span className="block text-secondary mt-3">
          {subtitleWords.map((word, i) => (
            <motion.span
              key={`subtitle-${i}`}
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={transition(subtitleStartDelay + i * 0.08)}
              className="inline-block me-3"
            >
              {word}
            </motion.span>
          ))}
        </span>
      </h1>

      {/* Description */}
      <motion.p
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={transition(descriptionDelay)}
        className="mt-8 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
      >
        {description}
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={transition(ctaDelay)}
        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-secondary text-primary-dark font-bold px-8 py-4 rounded-xl transition-colors text-lg hover:bg-secondary-light btn-glow"
        >
          {browseProductsLabel}
          <svg
            className="w-5 h-5 rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
        <Link
          href="/portfolio"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg hover:bg-white/10"
        >
          {viewPortfolioLabel}
        </Link>
        {bookingLabel && (
          <Link
            href="/booking"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg btn-glow-accent"
          >
            {bookingLabel}
          </Link>
        )}
      </motion.div>
    </div>
  );
}
