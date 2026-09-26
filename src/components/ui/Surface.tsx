import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Base rounded card used across the redesign.
export function surfaceClasses(tone: "white" | "cream" = "white", interactive = false) {
  return cn(
    "rounded-3xl border border-secondary-dark/40",
    tone === "white" ? "bg-white" : "bg-secondary-light",
    interactive &&
      "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(21,60,56,0.35)] hover:border-primary/20",
  );
}

export default function Surface({
  tone = "white",
  interactive = false,
  className,
  children,
}: {
  tone?: "white" | "cream";
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(surfaceClasses(tone, interactive), className)}>{children}</div>;
}
