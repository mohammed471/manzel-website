import { getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import Image from "@/components/SiteImage";
import { Link } from "@/i18n/navigation";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface MaterialShot {
  id: string;
  image: string;
  name: string;
  group: string;
  productId: string | null;
}

// «من معرضنا» — close-ups of the showroom's materials, edge to edge with hair-thin gaps.
// The name shows on hover (always on touch). No photos in the app → no section.
export default async function MaterialsSection({ materials, productCount }: { materials: MaterialShot[]; productCount: number }) {
  if (materials.length === 0) return null;
  const t = await getTranslations("home");
  const tSite = await getTranslations("site");
  const visitUrl = `https://wa.me/${tSite("whatsapp")}?text=${encodeURIComponent(t("materials_visit_msg"))}`;
  const cols = materials.length <= 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";

  return (
    <section className="py-[72px] md:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {t("materials_badge")}
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl text-primary leading-tight">{t("materials_title")}</h2>
          {productCount > 0 && (
            <p className="mt-3 text-text-secondary md:text-lg">{t("materials_count", { count: productCount.toLocaleString("en-US") })}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/products" variant="primary" size="lg">{t("materials_browse")}</ButtonLink>
          <a href={visitUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonClasses("outline", "lg"))}>
            <MessageCircle className="w-5 h-5" />
            {t("materials_visit")}
          </a>
        </div>
      </div>

      <ul className={cn("mt-10 grid gap-1", cols)}>
        {materials.map((m) => {
          const tile = (
            <>
              <Image src={m.image} alt={m.name} fill sizes="(min-width: 1024px) 17vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none" />
              <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4 bg-gradient-to-t from-primary-dark/80 to-transparent text-white transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
                {m.group && <span className="text-[11px] text-white/70">{m.group}</span>}
                <span className="text-sm md:text-base font-bold">{m.name}</span>
              </div>
            </>
          );
          return (
            <li key={m.id} className="group relative aspect-square overflow-hidden bg-secondary">
              {m.productId ? (
                <Link href={`/products/${m.productId}`} className="absolute inset-0 block">{tile}</Link>
              ) : (
                tile
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
