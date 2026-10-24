"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import Image from "@/components/SiteImage";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface DesignBuildPair {
  before: string;
  after: string;
  caption: string;
  href: string;
}

// «صمّمناه، ثم بنيناه»: the render next to the finished room, dragged apart. One pair → one big
// slider; 2–4 → the slider plus thumbnails to switch. Pairs are the projects' «قبل/بعد» in the app.
export default function RenderToReality({ pairs }: { pairs: DesignBuildPair[] }) {
  const t = useTranslations("home");
  const [active, setActive] = useState(0);
  const pair = pairs[active];

  return (
    <section className="py-[72px] md:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="reveal reveal-fadeIn text-3xl md:text-4xl text-primary leading-tight">{t("r2r_title")}</h2>
        <p className="mt-3 text-text-secondary md:text-lg">{t("r2r_desc")}</p>

        <BeforeAfterSlider
          key={pair.before}
          className="mt-8 md:mt-10 reveal reveal-clipUp"
          beforeSrc={pair.before}
          afterSrc={pair.after}
          beforeAlt={`${t("r2r_design")} — ${pair.caption}`}
          afterAlt={`${t("r2r_built")} — ${pair.caption}`}
          beforeLabel={t("r2r_design")}
          afterLabel={t("r2r_built")}
          hint={active === 0}
          sizes="(max-width: 1024px) 100vw, 64rem"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <Link href={pair.href} className="group inline-flex items-center gap-2 font-bold text-primary hover:text-accent">
            {pair.caption}
            <ArrowLeft className="arrow-nudge w-4 h-4 ltr:rotate-180" />
          </Link>
          {pairs.length > 1 && (
            <div className="flex gap-2">
              {pairs.map((p, i) => (
                <button
                  key={p.before}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={t("r2r_pair", { n: String(i + 1) })}
                  aria-pressed={i === active}
                  className={cn(
                    "relative w-16 h-10 md:w-20 md:h-12 overflow-hidden rounded-lg ring-2 transition",
                    i === active ? "ring-accent" : "ring-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <Image src={p.after} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
