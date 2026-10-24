"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, MessageCircle, ZoomIn } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { getProductImageUrl, type Product } from "@/lib/api";
import { cn } from "@/lib/utils";
import { productTitle } from "@/lib/catalog";
import ProductImage from "@/components/products/ProductImage";
import SaveButton from "@/components/board/SaveButton";


// Product media + colour picker + inquiry. Selecting a colour swaps the photo
// (when that colour has one), shows its availability, and puts the colour in
// the WhatsApp message.
export default function ProductDetailView({ product }: { product: Product }) {
  const t = useTranslations("products");
  const { title, code } = productTitle(product);
  const tSite = useTranslations("site");
  const { colors } = product;
  const [selectedId, setSelectedId] = useState<number | null>(
    (colors.find((c) => c.available) ?? colors[0])?.id ?? null,
  );
  const selected = colors.find((c) => c.id === selectedId) ?? null;
  // A thumbnail picked by hand wins until another colour is chosen
  const [picked, setPicked] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Every distinct photo: the product's own, then each colour's (V22)
  const images = [...new Set([product.image, ...colors.map((c) => c.image)].filter((x): x is string => !!x))];
  const image = picked || selected?.image || product.image || colors.find((c) => c.image)?.image || null;
  const pickImage = (img: string) => {
    const colour = colors.find((c) => c.image === img);
    if (colour) setSelectedId(colour.id);
    setPicked(img);
  };
  const message = selected
    ? t("whatsapp_message_color", { name: product.name, color: selected.name })
    : t("whatsapp_message", { name: product.name });
  const whatsappUrl = `https://wa.me/${tSite("whatsapp")}?text=${encodeURIComponent(message)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
      {/* Media — large 1:1 photo (tap / click to zoom), thumbnails when there is more than one */}
      <div className="min-w-0">
      <button
        type="button"
        onClick={() => image && setZoomOpen(true)}
        disabled={!image}
        aria-label={t("zoom")}
        className="group relative block w-full aspect-square overflow-hidden rounded-3xl bg-white border border-secondary-dark/40 cursor-zoom-in disabled:cursor-default focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ProductImage
          image={image}
          alt={selected ? `${title} — ${selected.name}` : title}
          category={product.category}
          categoryLabel={product.category}
          priority
          large
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6 animate-[fade-in_0.3s_ease-out] transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
        />
        {image && (
          <span aria-hidden="true" className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm">
            <ZoomIn className="h-4 w-4" />
          </span>
        )}
      </button>
      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => pickImage(img)}
              aria-label={t("photo_n", { n: String(i + 1) })}
              aria-pressed={img === image}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-xl border bg-white transition",
                img === image ? "border-primary ring-2 ring-primary/30" : "border-secondary-dark/50 opacity-75 hover:opacity-100",
              )}
            >
              <ProductImage image={img} alt="" category={product.category} categoryLabel={product.category} sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
      <Lightbox
        open={zoomOpen}
        close={() => setZoomOpen(false)}
        index={Math.max(0, images.indexOf(image ?? ""))}
        slides={images.map((img) => ({ src: getProductImageUrl(img), alt: title }))}
        plugins={[Zoom]}
      />
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {product.category && (
            <span className="inline-flex items-center rounded-full bg-primary/[0.07] px-3.5 py-1 text-xs font-bold text-primary">
              {product.category}
            </span>
          )}
          {product.subcategory && (
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent">
              {product.subcategory}
            </span>
          )}
        </div>

        <h1
          dir="auto"
          className="mt-4 text-2xl md:text-4xl font-bold leading-tight text-primary [overflow-wrap:anywhere]"
          style={{ fontFamily: "var(--font-arabic-body), var(--font-english), sans-serif" }}
        >
          {title}
        </h1>
        {code && (
          <p dir="ltr" className="mt-2 text-sm font-medium text-text-secondary text-start">
            {code}
          </p>
        )}
        {/* Price policy is the owner's call (T18): off until NEXT_PUBLIC_SHOW_PRICES=true */}
        {process.env.NEXT_PUBLIC_SHOW_PRICES === "true" && product.price && product.currency && (
          <p className="mt-3 text-xl font-bold text-accent tabular-nums">
            {t(`price_${product.currency}`, { amount: product.price.toLocaleString("en-US") })}
            {product.priceUnit && <span className="text-sm font-medium text-text-secondary"> / {t(`unit_${product.priceUnit}`)}</span>}
          </p>
        )}

        {colors.length > 0 && (
          <fieldset className="mt-7">
            <legend className="flex w-full items-baseline justify-between gap-3 text-sm">
              <span className="font-bold text-text-primary">
                {t("color_label")}
                {selected && <span className="font-medium text-text-secondary">: {selected.name}</span>}
              </span>
              {selected && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-bold",
                    selected.available ? "text-success" : "text-accent",
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full", selected.available ? "bg-success" : "bg-accent")} />
                  {selected.available ? t("available") : t("unavailable")}
                </span>
              )}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2.5" role="radiogroup" aria-label={t("choose_color")}>
              {colors.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={c.available ? c.name : `${c.name} — ${t("unavailable")}`}
                    title={c.name}
                    onClick={() => {
                      setSelectedId(c.id);
                      setPicked(null);
                    }}
                    className={cn(
                      "group relative flex h-12 items-center gap-2 rounded-full border ps-1.5 pe-4 text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      isSelected ? "border-primary bg-primary/[0.05] font-bold text-primary" : "border-secondary-dark/60 bg-white text-text-primary hover:border-primary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "relative flex w-9 h-9 items-center justify-center rounded-full ring-1 ring-inset ring-black/15",
                        !c.available && "opacity-45",
                      )}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-white mix-blend-difference" strokeWidth={3} />
                      )}
                      {!c.available && (
                        <span aria-hidden="true" className="absolute inset-0 m-auto h-px w-10 -rotate-45 bg-text-primary/70" />
                      )}
                    </span>
                    <span className={cn(!c.available && "text-text-secondary line-through decoration-1")}>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {product.details && (
          <div className="mt-8">
            <h2 className="text-base font-bold text-text-primary" style={{ fontFamily: "inherit" }}>
              {t("details")}
            </h2>
            <p dir="auto" className="mt-2 text-text-secondary leading-relaxed whitespace-pre-line">
              {product.details}
            </p>
          </div>
        )}

        <div className="mt-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full h-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-8 text-base font-bold text-white transition-colors hover:bg-[#20BD5A]"
          >
            <MessageCircle className="w-5 h-5" />
            {t("whatsapp_inquiry")}
          </a>
          {/* «لوحتي» — in the colour selected when the heart is pressed */}
          <SaveButton
            variant="inline"
            entry={selected ? `p${product.id}.${selected.id}` : `p${product.id}`}
            className="mt-3 inline-flex w-full h-14 gap-2.5 rounded-full px-8 text-base"
          />
          <p className="mt-3 text-center text-xs text-text-secondary">{t("inquiry_hint")}</p>
        </div>
      </div>
    </div>
  );
}
