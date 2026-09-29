"use client";

import Image from "next/image";
import type { ComponentProps } from "react";
import { loaderFor } from "@/lib/imageLoader";

// next/image for any image that may come from the internal app: R2 images load straight
// from Cloudflare (thumb for small sizes), the rest keep the built-in optimizer. A client
// component so server components can use it — `loader` is a function.
export default function SiteImage(props: ComponentProps<typeof Image>) {
  const { alt, ...rest } = props;
  return <Image {...rest} alt={alt} loader={props.loader ?? loaderFor(props.src)} />;
}
