import { cache } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Heart } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { surfaceClasses } from "@/components/ui/Surface";
import ImageTile from "@/components/home/ImageTile";
import ProductCard from "@/components/products/ProductCard";
import BoardActions from "@/components/board/BoardActions";
import SaveButton from "@/components/board/SaveButton";
import { getProducts } from "@/lib/api";
import { boardHref, boardParam, itemLabel, parseBoard, resolveBoard } from "@/lib/board";
import { getProjectImageUrl, getProjects } from "@/lib/portfolio";
import { SITE_URL } from "@/lib/siteUrl";
import { cn } from "@/lib/utils";

// «لوحتي» — the products and projects a visitor saved with the heart. The link is
// the board (`?i=p12.3~jcafeteria-karbala`, see lib/board.ts): it is rendered here
// from the same cached catalogue and portfolio requests the other pages use, so
// the visitor's own board and one somebody sent them are the same page. Dynamic
// (it reads the query), like the products pages.

interface BoardPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ i?: string | string[] }>;
}

// Shared by the metadata and the page — one lookup per request
const loadBoard = cache(async (param: string) => {
  const entries = parseBoard(param);
  const [products, projects] = await Promise.all([
    entries.some((entry) => entry.startsWith("p")) ? getProducts() : [],
    entries.some((entry) => entry.startsWith("j")) ? getProjects() : [],
  ]);
  return { entries, items: resolveBoard(entries, products, projects) };
});

const boardQuery = async (searchParams: BoardPageProps["searchParams"]) => [(await searchParams).i ?? ""].flat().join("~");

export async function generateMetadata({ params, searchParams }: BoardPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "board" });
  const { entries, items } = await loadBoard(await boardQuery(searchParams));

  return {
    title: t("meta_title"),
    description: t("meta_description"),
    // One address per board — nothing for a search engine to keep
    robots: { index: false, follow: true },
    openGraph: {
      title: items.length ? t("og_title", { count: items.length, n: String(items.length) }) : t("meta_title"),
      description: t("meta_description"),
      type: "website",
      // The picture a shared link shows in WhatsApp / Facebook
      ...(items.length
        ? { images: [{ url: `/api/board-card?i=${boardParam(entries)}`, width: 1200, height: 630 }] }
        : {}),
    },
  };
}

export default async function BoardPage({ params, searchParams }: BoardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("board");
  const tPortfolio = await getTranslations("portfolio");
  const { entries, items } = await loadBoard(await boardQuery(searchParams));
  const param = boardParam(entries);

  return (
    <>
      <PageHero
        badge={items.length ? t("count", { count: items.length, n: String(items.length) }) : undefined}
        title={t("title")}
        description={t("hero_desc")}
        compact
      />

      <section className="px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="max-w-7xl mx-auto">
          <BoardActions
            key={param}
            param={param}
            labels={items.map(itemLabel)}
            shareUrl={`${SITE_URL}/${locale}${boardHref(entries)}`}
          />

          {entries.length > 0 ? (
            // One collage: a project photo is two product cards wide, and
            // `grid-flow-dense` lets later cards fill the gaps beside it
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 grid-flow-dense">
              {items.map((item) =>
                item.kind === "product" ? (
                  <li key={item.entry}>
                    <ProductCard product={item.product} saveEntry={item.entry} />
                  </li>
                ) : (
                  <li key={item.entry} className="relative col-span-2">
                    {/* 3:2 when the photo has a row to itself; beside product cards the row is
                        theirs and the photo fills it. Not `aspect-ratio` on the <li>: stretched
                        to the row, it grows sideways into the next card. */}
                    <div aria-hidden="true" className="aspect-[3/2]" />
                    <div className="absolute inset-0">
                      <ImageTile
                        href={`/portfolio/${item.project.category}/${item.project.id}`}
                        imageUrl={
                          item.project.images[0]
                            ? getProjectImageUrl(item.project.category, item.project.id, item.project.images[0])
                            : null
                        }
                        title={item.project.name}
                        eyebrow={tPortfolio(`cat_${item.project.category.replace(/-/g, "_")}`)}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="h-full"
                      />
                    </div>
                    <SaveButton entry={item.entry} className="absolute top-3 end-3" />
                  </li>
                ),
              )}
            </ul>
          ) : (
            <div className={cn(surfaceClasses("white"), "px-6 py-16 text-center")}>
              <span className="mx-auto flex w-16 h-16 items-center justify-center rounded-2xl bg-secondary-light text-primary/40">
                <Heart className="w-8 h-8" strokeWidth={1.5} />
              </span>
              <h2 className="mt-5 text-xl text-primary">{t("empty_title")}</h2>
              <p className="mt-2 text-text-secondary max-w-sm mx-auto leading-relaxed">{t("empty_desc")}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/products">{t("browse_products")}</ButtonLink>
                <ButtonLink href="/portfolio" variant="outline">
                  {t("browse_portfolio")}
                </ButtonLink>
              </div>
            </div>
          )}

          {/* Deleted since it was saved, or the catalogue can't be reached — the visitor's own list is untouched */}
          {items.length < entries.length && (
            <p className="mt-6 text-center text-sm text-text-secondary">{t("some_unavailable")}</p>
          )}
        </div>
      </section>
    </>
  );
}
