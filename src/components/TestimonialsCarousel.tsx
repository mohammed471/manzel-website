"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  text: string;
  imageUrl: string | null;
}

interface TestimonialsCarouselProps {
  testimonials: TestimonialItem[];
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const touchStartX = useRef<number>(0);

  // Detect RTL direction
  useEffect(() => {
    setIsRTL(document.documentElement.dir === "rtl");
  }, []);

  // Responsive visibleCount based on breakpoints
  useEffect(() => {
    const mqSm = window.matchMedia("(min-width: 640px)");
    const mqLg = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      if (mqLg.matches) {
        setVisibleCount(3);
      } else if (mqSm.matches) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    update();

    mqSm.addEventListener("change", update);
    mqLg.addEventListener("change", update);

    return () => {
      mqSm.removeEventListener("change", update);
      mqLg.removeEventListener("change", update);
    };
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  // Reset currentIndex if it exceeds maxIndex after visibleCount changes
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  // Auto-scroll
  useEffect(() => {
    if (isHovered || testimonials.length <= visibleCount) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, testimonials.length, visibleCount, maxIndex]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      const threshold = 50;

      if (Math.abs(delta) < threshold) return;

      // In LTR: swipe left (negative delta) = next, swipe right = prev
      // In RTL: directions are inverted
      const isSwipeNext = isRTL ? delta > 0 : delta < 0;

      if (isSwipeNext) {
        setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    },
    [isRTL, maxIndex]
  );

  if (!testimonials || testimonials.length === 0) return null;

  const offset = -(currentIndex * (100 / visibleCount));
  const totalDots = maxIndex + 1;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Track */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${isRTL ? -offset : offset}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / visibleCount}%` }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-dark/30 h-full flex flex-col">
                {/* Decorative quote */}
                <div className="text-accent/10 text-6xl font-serif leading-none mb-2 select-none">
                  &#10077;
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating ? "text-amber-400" : "text-gray-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-text-secondary leading-relaxed mb-4 flex-1 italic">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-auto">
                  {/* Avatar */}
                  {testimonial.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{testimonial.name}</p>
                    <p className="text-text-secondary text-xs">
                      {testimonial.role} &middot; {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {totalDots > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "bg-primary w-3 h-3"
                  : "bg-secondary-dark w-2 h-2 hover:bg-primary/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
