"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, MessageCircle } from "lucide-react";
import type { Product } from "@/lib/api";
import { cn } from "@/lib/utils";
import ProductImage from "@/components/products/ProductImage";


// Product media + colour picker + inquiry. Selecting a colour swaps the photo
// (when that colour has one), shows its availability, and puts the colour in
// the WhatsApp message.
export default function ProductDetailView({ product }: { product: Product }) {
  const t = useTranslations("products");
  const tSite = useTranslations("site");
  const { colors } = product;
  const [selectedId, setSelectedId] = useState<number | null>(
    (colors.find((c) => c.available) ?? colors[0])?.id ?? null,
  );
  const selected = colors.find((c) => c.id === selectedId) ?? null;

  const image = selected?.image || product.image || colors.find((c) => c.image)?.image || null;
  const message = selected
    ? t("whatsapp_message_color", { name: product.name, color: selected.name })
    : t("whatsapp_message", { name: product.name });
  const whatsappUrl = `https://wa.me/${tSite("whatsapp")}?text=${encodeURIComponent(message)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
      {/* Media */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-white border border-secondary-dark/40">
        <ProductImage
          image={image}
          alt={selected ? `${product.name} — ${selected.name}` : product.name}
          category={product.category}
          categoryLabel={product.category}
          priority
          large
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6 animate-[fade-in_0.3s_ease-out]"
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
          {product.name}
        </h1>

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
                    onClick={() => setSelectedId(c.id)}
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
          <p className="mt-3 text-center text-xs text-text-secondary">{t("inquiry_hint")}</p>
        </div>
      </div>
    </div>
  );
}
