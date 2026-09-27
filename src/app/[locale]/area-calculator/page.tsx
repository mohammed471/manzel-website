import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHero from "@/components/ui/PageHero";
import AreaCalculator, { type MaterialLinks } from "@/components/AreaCalculator";
import ClosingCTA from "@/components/home/ClosingCTA";
import { catalogHref } from "@/components/products/catalogHref";
import { getCalculatorPricing, getCategories, type Category } from "@/lib/api";
import { TILE_SIZES, type TileSize } from "@/lib/calculator";

// "60 في 120 سم" / "60*60" → "60x120" / "60x60" (smaller side first)
function sizeKey(name: string): string | null {
  const nums = name.match(/\d+/g)?.map(Number);
  if (!nums || nums.length < 2) return null;
  const [a, b] = nums.slice(0, 2).sort((x, y) => x - y);
  return `${a}x${b}`;
}

// Link each material to its place in the catalogue: the porcelain category
// (or its size subcategory when one exists), the adhesives subcategory, and a
// search for paint. Category names come from the internal app, so match loosely.
function materialLinks(categories: Category[]): MaterialLinks {
  const porcelain = categories.find((c) => /بورسلين|سيراميك|porcelain|tile/i.test(c.name));
  const catHref = porcelain ? catalogHref({ category: String(porcelain.id) }, { anchor: true }) : catalogHref({ search: "بورسلين" }, { anchor: true });
  const tiles = Object.fromEntries(
    TILE_SIZES.map((size) => {
      const sub = porcelain?.subcategories.find((s) => sizeKey(s.name) === size);
      return [size, sub ? catalogHref({ category: String(porcelain!.id), subcategory: String(sub.id) }, { anchor: true }) : catHref];
    }),
  ) as Record<TileSize, MaterialLinks["adhesive"]>;
  let adhesive = catalogHref({ search: "لاصق" }, { anchor: true });
  for (const c of categories) {
    const sub = c.subcategories.find((s) => /لاصق|adhesive/i.test(s.name));
    if (sub) {
      adhesive = catalogHref({ category: String(c.id), subcategory: String(sub.id) }, { anchor: true });
      break;
    }
  }
  return { tiles, adhesive, paint: catalogHref({ search: "صبغ" }, { anchor: true }) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("area_calculator_title"),
    description: t("area_calculator_description"),
    openGraph: {
      title: t("area_calculator_title"),
      description: t("area_calculator_description"),
      type: "website",
    },
  };
}

export default async function AreaCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, pricing, categories] = await Promise.all([
    getTranslations("area_calculator"),
    getCalculatorPricing(),
    getCategories(),
  ]);

  return (
    <>
      <PageHero badge={t("hero_label")} title={t("title")} description={t("description")} />

      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AreaCalculator factors={pricing.area} links={materialLinks(categories)} />
        </div>
      </section>

      <ClosingCTA />
    </>
  );
}
