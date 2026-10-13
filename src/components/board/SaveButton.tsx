"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { trackGA4Event } from "@/lib/analytics";
import { isSaved, type BoardEntry } from "@/lib/board";
import { toggleSaved, useBoard } from "@/lib/boardStore";
import { cn } from "@/lib/utils";

// The heart that saves a product or project to «لوحتي». `overlay` sits on a
// card's corner — beside the card's link, never inside it; `inline` is the
// labelled button on the detail pages, shaped by the caller to match the
// buttons around it.
export default function SaveButton({
  entry,
  variant = "overlay",
  className,
}: {
  entry: BoardEntry;
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const t = useTranslations("board");
  const saved = isSaved(useBoard(), entry);
  // Pop only on the visitor's own tap, not when a saved heart appears at page load
  const [popped, setPopped] = useState(false);

  const toggle = () => {
    setPopped(!saved);
    if (!saved) trackGA4Event("board_save", { item: entry });
    toggleSaved(entry);
  };

  const heart = (
    <Heart
      className={cn("w-5 h-5 shrink-0", saved && "fill-accent text-accent", saved && popped && "heart-pop")}
      strokeWidth={1.75}
    />
  );

  if (variant === "inline") {
    return (
      <button
        type="button"
        aria-pressed={saved}
        onClick={toggle}
        className={cn(
          "items-center justify-center border border-primary/25 font-bold text-primary transition-colors cursor-pointer hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          className,
        )}
      >
        {heart}
        {saved ? t("saved") : t("save")}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t("save")}
      title={saved ? t("saved") : t("save")}
      onClick={toggle}
      className={cn(
        "z-10 flex w-11 h-11 items-center justify-center rounded-full bg-white text-text-secondary shadow-[0_2px_10px_rgba(21,60,56,0.18)] transition-colors cursor-pointer hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      {heart}
    </button>
  );
}
