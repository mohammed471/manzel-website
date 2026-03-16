import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Category } from "@/lib/api";

const categoryIcons: Record<string, string> = {
  default: "🏗️",
};

const categoryGradients = [
  "from-primary to-primary-dark",
  "from-primary-light to-primary",
  "from-accent to-amber-600",
  "from-emerald-600 to-emerald-800",
  "from-slate-600 to-slate-800",
  "from-rose-600 to-rose-800",
];

export default async function CategoryCard({
  category,
  index = 0,
}: {
  category: Category;
  index?: number;
}) {
  const t = await getTranslations("products");
  const gradient = categoryGradients[index % categoryGradients.length];

  return (
    <Link
      href={`/products?category=${category.id}`}
      className="group relative block rounded-xl overflow-hidden aspect-[4/3] transition-transform duration-300 hover:-translate-y-1"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity group-hover:opacity-90`}
      />
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white/30 rounded-full" />
        <div className="absolute bottom-4 right-4 w-32 h-32 border border-white/20 rounded-full" />
      </div>
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center text-white">
        <span className="text-4xl mb-3">
          {categoryIcons[category.name] || categoryIcons.default}
        </span>
        <h3 className="font-bold text-lg mb-1">{category.name}</h3>
        <p className="text-white/70 text-sm">
          {t("product_count", { count: category.product_count })}
        </p>
      </div>
    </Link>
  );
}
