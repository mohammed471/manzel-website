import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function SectionHeader({
  badge,
  title,
  description,
  action,
  align = "start",
  tone = "light",
  className,
}: {
  badge?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "start" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-10 md:mb-14 flex flex-col gap-6",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {badge && (
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold tracking-wide",
              tone === "dark" ? "bg-white/10 text-secondary" : "bg-accent/10 text-accent",
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {badge}
          </span>
        )}
        <h2
          className={cn(
            "mt-4 text-3xl md:text-4xl lg:text-5xl leading-tight text-balance",
            tone === "dark" ? "text-white" : "text-primary",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 text-base md:text-lg leading-relaxed",
              tone === "dark" ? "text-white/70" : "text-text-secondary",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
