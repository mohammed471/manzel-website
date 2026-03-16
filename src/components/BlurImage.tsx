"use client";

import Image from "next/image";
import { type ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";

export default function BlurImage(props: ComponentProps<typeof Image>) {
  const [loaded, setLoaded] = useState(false);
  const { className, onLoad, ...rest } = props;

  return (
    <Image
      {...rest}
      className={cn(
        "transition-all duration-500 ease-out",
        loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-[1.02]",
        className
      )}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
