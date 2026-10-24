import Image from "next/image";

interface LogoProps {
  variant: "dark" | "light";
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({ variant, width = 120, height = 48, className, priority = false }: LogoProps) {
  const src = variant === "dark" ? "/images/logo-dark.png" : "/images/logo-light.png";

  return (
    <Image
      src={src}
      alt="Manzel"
      width={width}
      height={height}
      className={className}
      priority={priority}
      // A 20–40 KB PNG served as the static file: /_next/image on Render resizes on first request and
      // isn't edge-cached, which made this header logo the page's slowest LCP element
      unoptimized
    />
  );
}
