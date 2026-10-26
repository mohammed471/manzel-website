"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "@/components/SiteImage";
import { cn } from "@/lib/utils";
import { useSnapCarousel } from "@/lib/useSnapCarousel";

export interface StoryMonth {
  id: string;
  month: string;
  stage: string;
  text: string;
  /** Million IQD, as entered in the app ("21.5") */
  spent: string;
  /** Share of the total spent by the end of this month, % */
  pct: number;
  image: string | null;
}

// The open-book house month by month: one card per month that scrolls sideways (swipe on phones,
// arrows on desktop), dots underneath. Without photos the cards are text + figures only.
export default function StoryStrip({ months }: { months: StoryMonth[] }) {
  const t = useTranslations("home");
  const { listRef, current, go } = useSnapCarousel<HTMLOListElement>(months.length);

  return (
    <div className="mt-14 md:mt-20">
      <div className="flex items-end justify-between gap-4">
        <h3 className="text-2xl md:text-3xl text-white">{t("story_title")}</h3>
        <div className="hidden md:flex gap-2">
          <button type="button" onClick={() => go(current - 1)} disabled={current === 0} aria-label={t("story_prev")}
            className="w-11 h-11 rounded-full border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-primary disabled:opacity-30 disabled:pointer-events-none">
            <ChevronRight className="w-5 h-5 ltr:rotate-180" />
          </button>
          <button type="button" onClick={() => go(current + 1)} disabled={current >= months.length - 1} aria-label={t("story_next")}
            className="w-11 h-11 rounded-full border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-primary disabled:opacity-30 disabled:pointer-events-none">
            <ChevronLeft className="w-5 h-5 ltr:rotate-180" />
          </button>
        </div>
      </div>

      <ol ref={listRef} className="mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {months.map((m) => (
          <li key={m.id} className="snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31%] rounded-3xl bg-white/[0.06] border border-white/10 overflow-hidden flex flex-col">
            {m.image && (
              <div className="relative aspect-[4/3]">
                <Image src={m.image} alt={`${m.month} — ${m.stage}`} fill sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 82vw" className="object-cover" />
              </div>
            )}
            <div className="p-5 md:p-6 flex flex-col flex-1 text-white">
              <span className="text-xs font-bold text-white/60">{m.month}</span>
              <h4 className="mt-1 text-lg font-bold">{m.stage}</h4>
              {m.text && <p className="mt-2 text-sm leading-relaxed text-white/70">{m.text}</p>}
              <div className="mt-auto pt-6">
                {m.spent && (
                  <p className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tabular-nums" dir="ltr">{m.spent}</span>
                    <span className="text-sm text-white/70">{t("story_unit")}</span>
                  </p>
                )}
                <div className="mt-3 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-accent-light" style={{ width: `${m.pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-white/60">{t("story_progress", { pct: String(m.pct) })}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex justify-center gap-2">
        {months.map((m, i) => (
          <button key={m.id} type="button" onClick={() => go(i)} aria-label={t("story_go", { month: m.month })} aria-current={i === current}
            className="p-1.5">
            <span className={cn("block h-1.5 rounded-full transition-all", i === current ? "w-6 bg-white" : "w-1.5 bg-white/35")} />
          </button>
        ))}
      </div>
    </div>
  );
}
