"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
}

export default function Card3D({ children, className = "" }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasHover, setHasHover] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [transform, setTransform] = useState("");
  const [shadow, setShadow] = useState("");

  useEffect(() => {
    setHasHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize cursor position relative to center (-1 to 1)
      const normalizedX = (e.clientX - centerX) / (rect.width / 2);
      const normalizedY = (e.clientY - centerY) / (rect.height / 2);

      const maxDeg = 6;
      // rotateX is driven by vertical offset (inverted so top-tilt goes positive)
      const rotateX = -normalizedY * maxDeg;
      // rotateY is driven by horizontal offset
      const rotateY = normalizedX * maxDeg;

      setTransform(
        `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.02)`
      );

      // Shadow shifts opposite to tilt direction
      const shadowX = -normalizedX * 12;
      const shadowY = -normalizedY * 12;
      setShadow(
        `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 24px rgba(0, 0, 0, 0.15)`
      );
    },
    []
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTransform("");
    setShadow("");
  }, []);

  // No hover support (touch devices) — render children plain
  if (!hasHover) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transform || "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
        boxShadow: shadow || "0px 0px 24px rgba(0, 0, 0, 0)",
        transition: isHovering ? "none" : "transform 0.3s ease-out, box-shadow 0.3s ease-out",
        willChange: isHovering ? "transform" : "auto",
      }}
    >
      {children}
    </div>
  );
}
