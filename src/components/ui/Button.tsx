import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "outline-light" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-light",
  accent: "bg-accent text-white hover:bg-accent-light",
  outline:
    "border border-primary/25 text-primary hover:border-primary hover:bg-primary/5",
  "outline-light":
    "border border-white/40 text-white hover:bg-white hover:text-primary",
  ghost: "text-primary hover:bg-primary/5",
  light: "bg-white text-primary hover:bg-secondary",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-13 px-8 text-base gap-2",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(
    "inline-flex items-center justify-center rounded-full font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    variantClasses[variant],
    sizeClasses[size],
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link {...props} className={cn(buttonClasses(variant, size), className)}>
      {children}
    </Link>
  );
}
