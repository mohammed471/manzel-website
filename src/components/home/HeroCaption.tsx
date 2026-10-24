import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

export interface HeroSlide {
  image: string;
  caption: string;
  kind: "built" | "design";
  href: string | null;
}

// Bottom-corner label of the hero photo: project name, built/design badge, link to the project.
export default function HeroCaption({ slide }: { slide: HeroSlide }) {
  const tPortfolio = useTranslations("portfolio");
  const t = useTranslations("home");
  return (
    <div className="absolute z-20 bottom-[10.5rem] md:bottom-48 end-4 md:end-8 max-w-[70%] flex flex-wrap items-center justify-end gap-2 text-white text-xs md:text-sm">
      <span className="rounded-full bg-white/15 border border-white/25 px-2.5 py-0.5 font-bold">
        {tPortfolio(slide.kind === "built" ? "kind_built" : "kind_design")}
      </span>
      {slide.caption && <span className="text-white/90 drop-shadow">{slide.caption}</span>}
      {slide.href && (
        <Link href={slide.href} className="inline-flex items-center gap-1 font-bold underline underline-offset-4 decoration-white/40 hover:decoration-white">
          {t("hero_see_project")}
          <ArrowLeft className="w-3.5 h-3.5 ltr:rotate-180" />
        </Link>
      )}
    </div>
  );
}
