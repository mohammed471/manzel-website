"use client";

import { useState } from "react";
import Image from "@/components/SiteImage";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { cn } from "@/lib/utils";

interface ProjectGalleryProps {
  images: { src: string; alt: string }[];
}

// Editorial rhythm: a wide photo, then two side by side, then wide again… Every photo is in the
// server HTML (no hidden-until-JS entrance); a tap opens the full-screen viewer (swipe, arrows, Esc).
export default function ProjectGallery({ images }: ProjectGalleryProps) {
  const [index, setIndex] = useState(-1);
  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {images.map((img, i) => {
          // Wide every third photo, and the last one when it would sit alone
          const wide = i % 3 === 0 || (i === images.length - 1 && i % 3 === 1);
          return (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-secondary cursor-zoom-in focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent",
                wide ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]",
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={wide ? "(max-width: 1152px) 100vw, 1152px" : "(max-width: 1152px) 50vw, 576px"}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </button>
          );
        })}
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={Math.max(index, 0)}
        slides={images.map((img) => ({ src: img.src, alt: img.alt }))}
      />
    </>
  );
}
