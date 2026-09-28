"use client";

import { useEffect, useState, type RefObject } from "react";
import type { MotionValue } from "framer-motion";
import {
  SCRUB_FRAME_COUNT,
  frameForProgress,
  frameLoadOrder,
  nearestLoadedFrame,
  scrubFrameUrl,
} from "@/lib/scrubFrames";

const FRAME_SIZE = 640;
const CONCURRENT_LOADS = 4;

/**
 * Phone scrubbing: draws the still frame for the current scroll position on the canvas.
 * Frames start downloading when the section is one screen away, a coarse pass first, and
 * the closest loaded frame stands in until the exact one arrives. Nothing is drawn until a
 * frame has loaded (or ever, if all fail), so the poster underneath stays visible.
 * Returns true once a frame is on the canvas.
 */
export function useFrameScrub(
  enabled: boolean,
  progress: MotionValue<number>,
  sectionRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
): boolean {
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!section || !canvas || !ctx) return;
    canvas.width = FRAME_SIZE;
    canvas.height = FRAME_SIZE;

    const images: HTMLImageElement[] = [];
    const loaded: boolean[] = new Array(SCRUB_FRAME_COUNT).fill(false);
    let target = frameForProgress(progress.get(), SCRUB_FRAME_COUNT);
    let drawn = -1;
    let raf = 0;
    let cancelled = false;

    const draw = () => {
      raf = 0;
      const index = nearestLoadedFrame(target, loaded);
      if (index < 0 || index === drawn) return;
      ctx.drawImage(images[index], 0, 0, FRAME_SIZE, FRAME_SIZE);
      if (drawn < 0) setHasFrame(true);
      drawn = index;
    };
    // One draw per animation frame however many scroll events or loads arrive
    const scheduleDraw = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const unsubscribe = progress.on("change", (latest) => {
      target = frameForProgress(latest, SCRUB_FRAME_COUNT);
      scheduleDraw();
    });

    const order = frameLoadOrder(SCRUB_FRAME_COUNT);
    let next = 0;
    let active = 0;
    const loadMore = () => {
      while (!cancelled && active < CONCURRENT_LOADS && next < order.length) {
        const index = order[next++];
        const img = new Image();
        img.decoding = "async";
        img.src = scrubFrameUrl(index);
        images[index] = img;
        active++;
        img
          .decode()
          .then(() => {
            if (cancelled) return;
            loaded[index] = true;
            scheduleDraw();
          })
          .catch(() => {
            // Frame failed to download/decode — its neighbours stand in for it
          })
          .finally(() => {
            active--;
            loadMore();
          });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadMore();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [enabled, progress, sectionRef, canvasRef]);

  return hasFrame;
}
