"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  caption?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  caption,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const t = useTranslations("portfolio");

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(95, Math.max(5, x));
    setPosition(clamped);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isDragging.current = true;
      e.preventDefault();
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handlePointerLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-[16/9] rounded-2xl overflow-hidden touch-none cursor-ew-resize"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {/* After image (behind) */}
        <Image
          src={afterSrc}
          alt={afterAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Before image (clipped) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={beforeSrc}
            alt={beforeAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Vertical divider */}
        <div
          className="absolute top-0 h-full w-[2px] bg-white -translate-x-1/2 pointer-events-none"
          style={{ left: `${position}%` }}
        />

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${position}%` }}
        >
          <div className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M18 8l4 4-4 4" />
              <path d="M6 8l-4 4 4 4" />
            </svg>
          </div>
        </div>

        {/* Before label */}
        <span className="absolute bottom-3 left-3 bg-black/50 text-white text-xs font-medium px-3 py-1 rounded-full pointer-events-none">
          {t("before_label")}
        </span>

        {/* After label */}
        <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-3 py-1 rounded-full pointer-events-none">
          {t("after_label")}
        </span>
      </div>

      {caption && (
        <p className="text-sm text-text-secondary mt-2 text-center">
          {caption}
        </p>
      )}
    </div>
  );
}
