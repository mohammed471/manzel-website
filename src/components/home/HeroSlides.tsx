"use client";

import { useEffect, useState } from "react";
import Image from "@/components/SiteImage";
import { HeroShade } from "@/components/HeroVideo";
import HeroCaption, { type HeroSlide } from "@/components/home/HeroCaption";

const INTERVAL_MS = 6000;

// Hero photos from «أقسام الرئيسية»: one → still; several → a slow cross-fade every 6 s with a
// light zoom (CSS `.hero-kenburns`). The first photo is in the server HTML (LCP); under
// prefers-reduced-motion it stays on the first photo with no zoom.
export default function HeroSlides({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-primary-dark">
      {slides.map((s, i) => (
        <div
          key={s.image}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out motion-reduce:transition-none ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt={i === 0 ? s.caption : ""}
            fill
            priority={i === 0}
            sizes="100vw"
            // Restarting the class restarts the zoom each time the slide comes back
            className={`object-cover ${i === active && slides.length > 1 ? "hero-kenburns" : ""}`}
          />
        </div>
      ))}
      <HeroShade />
      <HeroCaption slide={slides[active]} />
    </div>
  );
}
