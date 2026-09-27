import { cache } from "react";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";
import { SITE_CONTENT_TAG } from "@/lib/cacheTags";

// Texts, contact details and main images edited in the internal app
// («الموقع» → النصوص / معلومات التواصل / الصور) arrive as overrides on top of
// the bundled translation files — so every component that already uses
// `t("home.hero_subtitle")` or `t("site.whatsapp")` picks them up unchanged.
//
// API: /api/public/website/content → { texts: { ar: {"ns.key": "…"}, en: {…} },
//                                       site: {"phone_1": "…", …} }
// If the API is unreachable, the bundled files are used as-is.

export type Messages = typeof ar;
const BASE: Record<string, Messages> = { ar, en };
const API = process.env.NEXT_PUBLIC_API_URL;

interface Overrides {
  texts: Record<string, Record<string, string>>;
  site: Record<string, string>;
}

const loadOverrides = cache(async (): Promise<Overrides | null> => {
  try {
    const res = await fetch(`${API}/api/public/website/content`, {
      next: { revalidate: 3600, tags: [SITE_CONTENT_TAG] },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const body = await res.json();
    return {
      texts: body?.texts && typeof body.texts === "object" ? body.texts : {},
      site: body?.site && typeof body.site === "object" ? body.site : {},
    };
  } catch {
    return null;
  }
});

/** Only string overrides for keys that already exist in the bundled file are applied. */
export function applyOverrides(base: Messages, o: Overrides | null, locale: string): Messages {
  if (!o) return base;
  const out = structuredClone(base) as unknown as Record<string, Record<string, unknown>>;
  const set = (ns: string, key: string, value: unknown) => {
    if (typeof value !== "string" || !value.trim()) return;
    if (!out[ns] || typeof out[ns][key] !== "string") return;
    out[ns][key] = value;
  };
  for (const [path, value] of Object.entries(o.texts[locale] ?? {})) {
    const dot = path.indexOf(".");
    if (dot > 0) set(path.slice(0, dot), path.slice(dot + 1), value);
  }
  for (const [key, value] of Object.entries(o.site)) set("site", key, value);
  return out as unknown as Messages;
}

/** Translation messages for a locale with the internal app's edits applied. */
export const getSiteMessages = cache(async (locale: string): Promise<Messages> => {
  return applyOverrides(BASE[locale] ?? ar, await loadOverrides(), locale);
});

/** "0773 768 5000" → "tel:+9647737685000" (Iraqi local format to international). */
export function telHref(display: string): string {
  const digits = display.replace(/\D/g, "");
  return `tel:+${digits.startsWith("0") ? `964${digits.slice(1)}` : digits}`;
}
