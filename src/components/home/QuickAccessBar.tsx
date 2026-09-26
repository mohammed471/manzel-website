import { getTranslations } from "next-intl/server";
import {
  Package,
  Sofa,
  Building2,
  HardHat,
  Calculator,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Model A: floating white bar that overlaps the bottom edge of the hero and
// gives one-tap access to every main area of the site.
export default async function QuickAccessBar() {
  const tNav = await getTranslations("nav");
  const tPortfolio = await getTranslations("portfolio");
  const t = await getTranslations("home");

  const items: { href: string; label: string; icon: LucideIcon; accent?: boolean }[] = [
    { href: "/products", label: tNav("products"), icon: Package },
    { href: "/portfolio/interior-design", label: tPortfolio("cat_interior_design"), icon: Sofa },
    { href: "/portfolio/exterior-design", label: tPortfolio("cat_exterior_design"), icon: Building2 },
    { href: "/portfolio/execution", label: tPortfolio("cat_execution"), icon: HardHat },
    { href: "/calculator", label: tNav("calculator"), icon: Calculator },
    { href: "/booking", label: tNav("booking"), icon: CalendarCheck, accent: true },
  ];

  return (
    <div className="relative z-20 -mt-24 md:-mt-20 px-4 sm:px-6 lg:px-8">
      <nav
        aria-label={t("quick_access")}
        className="max-w-6xl mx-auto bg-white rounded-3xl shadow-[0_24px_60px_-20px_rgba(14,42,39,0.35)] border border-secondary-dark/40 p-2 md:p-3"
      >
        <ul className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2">
          {items.map(({ href, label, icon: Icon, accent }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "group flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-4 md:py-5 text-center transition-colors h-full",
                  accent ? "bg-accent text-white hover:bg-accent-light" : "hover:bg-secondary-light",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-2xl transition-colors",
                    accent
                      ? "bg-white/15"
                      : "bg-primary/[0.07] text-primary group-hover:bg-primary group-hover:text-white",
                  )}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.75} />
                </span>
                <span
                  className={cn(
                    "text-xs md:text-sm font-bold leading-tight",
                    accent ? "text-white" : "text-text-primary",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
