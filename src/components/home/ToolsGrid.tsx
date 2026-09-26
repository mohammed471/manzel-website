import { getTranslations } from "next-intl/server";
import { Calculator, Ruler, Palette, CalendarCheck, ArrowLeft, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import AnimatedSection from "@/components/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";
import { surfaceClasses } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";

// Interactive tools: cost calculator, area calculator, color visualizer, booking.
export default async function ToolsGrid({ tone = "white" }: { tone?: "white" | "cream" }) {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  const tools: { href: string; title: string; desc: string; icon: LucideIcon; featured?: boolean }[] = [
    { href: "/calculator", title: tNav("calculator"), desc: t("tool_calculator_desc"), icon: Calculator },
    { href: "/area-calculator", title: tNav("area_calculator"), desc: t("tool_area_desc"), icon: Ruler },
    { href: "/color-picker", title: tNav("color_picker"), desc: t("tool_colors_desc"), icon: Palette },
    { href: "/booking", title: tNav("booking"), desc: t("tool_booking_desc"), icon: CalendarCheck, featured: true },
  ];

  return (
    <section
      id="tools"
      className={cn(
        "py-20 md:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-36",
        tone === "cream" ? "bg-secondary-light" : "bg-white",
      )}
    >
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader badge={t("tools_badge")} title={t("tools_title")} description={t("tools_desc")} />
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map(({ href, title, desc, icon: Icon, featured }, i) => (
            <AnimatedSection key={href} delay={i * 0.07}>
              <Link
                href={href}
                className={cn(
                  "group flex h-full flex-col p-6 md:p-7",
                  featured
                    ? "rounded-3xl bg-accent text-white transition-colors hover:bg-accent-dark"
                    : surfaceClasses(tone === "cream" ? "white" : "cream", true),
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-2xl transition-colors",
                    featured
                      ? "bg-white/15"
                      : "bg-primary/[0.07] text-primary group-hover:bg-primary group-hover:text-white",
                  )}
                >
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </span>
                <h3 className={cn("mt-6 text-xl", featured ? "text-white" : "text-primary")}>{title}</h3>
                <p
                  className={cn(
                    "mt-2 text-sm leading-relaxed flex-1",
                    featured ? "text-white/80" : "text-text-secondary",
                  )}
                >
                  {desc}
                </p>
                <span
                  className={cn(
                    "mt-6 inline-flex items-center gap-2 text-sm font-bold",
                    featured ? "text-white" : "text-accent",
                  )}
                >
                  {t("explore")}
                  <ArrowLeft className="w-4 h-4 ltr:rotate-180 transition-transform group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
                </span>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
