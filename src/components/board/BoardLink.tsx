"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { boardHref } from "@/lib/board";
import { useBoard } from "@/lib/boardStore";
import { cn } from "@/lib/utils";

// Header entry to «لوحتي»: a heart with the number of saved items. The link
// carries the board itself, so the page opens already rendered by the server.
export default function BoardLink({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const entries = useBoard();

  return (
    <Link
      href={boardHref(entries)}
      // The address changes with every save — nothing worth prefetching
      prefetch={false}
      aria-label={t("board")}
      className={cn("relative w-10 h-10 rounded-full flex items-center justify-center transition-colors", className)}
    >
      <Heart className="w-[18px] h-[18px]" />
      {entries.length > 0 && (
        <span
          // Re-mounted on every change so the count pops
          key={entries.length}
          className="heart-pop absolute -top-0.5 -end-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-white tabular-nums"
        >
          {entries.length}
        </span>
      )}
    </Link>
  );
}
