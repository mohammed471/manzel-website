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
    />
  );
}
