# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Manzel (منزل) — Bilingual (Arabic RTL + English LTR) public website for a construction, interior design, and building materials company based in Kirkuk, Iraq. Displays products catalog (from Flask API) and project portfolio (file-based, from `src/data/projects.json`).

**Two-system architecture:**
- **Internal app** (Flask + SQLite): `C:\Users\msi-pc\Desktop\APP TEST\manzel_split\mobile_web` — manages products, invoices, customers (private)
- **This project** (Next.js): Public-facing website — products via Flask API, portfolio via local JSON data

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 (CSS-first config via `@theme` in globals.css)
- next-intl (i18n — URL-prefix routing `/ar/...`, `/en/...`)
- Framer Motion (scroll animations)
- yet-another-react-lightbox (project gallery)
- lucide-react (category icons)
- Fonts: Khalid Art Bold (Arabic headings, local), Tajawal (Arabic body, Google), Poppins (English, Google)

## Commands

```bash
npm run dev      # Dev server on localhost:3000
npm run build    # Production build — MUST pass with 0 errors
npm run start    # Production server
npm run lint     # ESLint check
```

## Build-Test-Verify Cycle

**CRITICAL: Follow this cycle for every change. Never skip step 2.**

1. **BUILD**: Write/modify code
2. **TEST**: Run `npm run build` — must complete with 0 errors
3. **VERIFY**: Open in browser, confirm page renders correctly in both `/ar` and `/en`

A feature is NOT complete until all 3 steps pass. Do not mark tasks as done based on code alone.

## Architecture

### i18n (Internationalization)

**Locales:** Arabic (`ar`, default, RTL) and English (`en`, LTR)
**Library:** `next-intl` with URL-prefix routing

```
/ar/...          → Arabic (RTL)
/en/...          → English (LTR)
/                → Redirects based on browser language (default: ar)
```

**Key i18n files:**
| File | Purpose |
|------|---------|
| `src/i18n/routing.ts` | Locale definitions (`['ar', 'en']`, defaultLocale: `'ar'`) |
| `src/i18n/request.ts` | Server-side getRequestConfig, loads messages |
| `src/i18n/navigation.ts` | Locale-aware `Link`, `redirect`, `usePathname`, `useRouter` |
| `src/middleware.ts` | Locale detection and redirect |
| `src/messages/ar.json` | Arabic translations |
| `src/messages/en.json` | English translations |

**Translation usage:**
- Server components: `const t = await getTranslations("namespace")` from `next-intl/server`
- Client components: `const t = useTranslations("namespace")` from `next-intl`
- Metadata: `getTranslations` in `generateMetadata()`
- Links: ALWAYS use `Link` from `@/i18n/navigation`, NOT from `next/link`

### File Structure

```
src/
├── app/
│   ├── globals.css                     (Tailwind @theme, fonts, utilities)
│   └── [locale]/
│       ├── layout.tsx                  (locale-aware root: dir, lang, fonts, NextIntlClientProvider)
│       ├── page.tsx                    (Home)
│       ├── not-found.tsx, error.tsx, loading.tsx
│       ├── products/page.tsx           (Products listing)
│       ├── products/[id]/page.tsx      (Product detail)
│       ├── portfolio/page.tsx                    (Portfolio — 5 category cards)
│       ├── portfolio/[category]/page.tsx          (Category — projects grid)
│       ├── portfolio/[category]/[project]/page.tsx (Project detail — gallery, videos)
│       ├── contact/page.tsx                       (Contact)
│       ├── booking/page.tsx                       (Booking consultation)
│       ├── calculator/page.tsx                    (Cost calculator)
│       ├── testimonials/page.tsx                  (Client testimonials)
│       └── about/page.tsx                         (About Us — story, timeline, team, values)
├── app/
│   ├── sitemap.ts                                 (Auto-generated sitemap — all routes, both locales)
│   └── robots.ts                                  (Robots.txt — allow all crawlers)
├── components/
│   ├── SiteHeader.tsx      (client — fixed header: links, Tools dropdown, search, language, booking CTA;
│   │                        transparent only over a `data-header-overlay` hero, solid otherwise)
│   ├── MobileBottomNav.tsx (client — app-style bottom tab bar on < lg + "More" sheet with tools/about/booking)
│   ├── ui/                 (design-system primitives for the 2026 redesign)
│   │   ├── PageHero.tsx     (server — rounded green top panel for every inner page; optional photo/breadcrumb)
│   │   ├── SectionHeader.tsx (server — badge + title + description + optional action)
│   │   ├── Button.tsx       (ButtonLink / buttonClasses — rounded-full primary|accent|outline|light…)
│   │   └── Surface.tsx      (surfaceClasses — rounded-3xl white/cream card with hover lift)
│   ├── home/               (homepage sections — also reused on inner pages)
│   │   ├── homeData.ts      (getHomeData: services, featured projects, testimonials, stats, FAQ)
│   │   ├── HomeHero.tsx, QuickAccessBar.tsx, ServicesBento.tsx, ImageTile.tsx, ProjectsShowcase.tsx
│   │   ├── TrustSection.tsx (green stats + testimonials band — pass testimonials=[] for stats only)
│   │   ├── ToolsGrid.tsx, VisitSection.tsx (FAQ + map), ClosingCTA.tsx (accepts title/description)
│   │   └── CountUp.tsx      (client — animated "+500" style counters)
│   ├── GlobalSearch.tsx    (client — Ctrl+K search overlay, products/portfolio/pages search)
│   ├── GlobalSearchLazy.tsx (client — lazy loader: imports GlobalSearch only on first open intent)
│   ├── Footer.tsx          (server — translated links, contact info)
│   ├── Logo.tsx            (server — dark/light logo variants)
│   ├── LanguageToggle.tsx  (client — AR/EN switch)
│   ├── AnimatedSection.tsx (client — Framer Motion scroll animations)
│   ├── FAQ.tsx             (client — accordion component, Framer Motion expand/collapse)
│   ├── ShareButtons.tsx    (client — social sharing: WhatsApp, Facebook, Telegram, copy link)
│   ├── ContactForm.tsx     (client — form with translated labels)
│   ├── MasonryProductCard.tsx / MasonryProjectCard.tsx (server — grid cards, overlay always visible on touch)
│   ├── ProductsFilter.tsx  (client — translated search/filter UI)
│   ├── ProjectGallery.tsx  (client — lightbox)
│   ├── VideoSection.tsx    (client — YouTube/local video embeds)
│   ├── ScrollToTop.tsx     (client — scroll-to-top button, appears after 400px)
│   ├── WhatsAppButton.tsx  (client)
│   └── Timeline.tsx        (client — interactive scroll-animated vertical timeline)
├── fonts/
│   └── khalid-art-bold.ttf (local Arabic display font)
├── i18n/                   (next-intl config)
├── data/
│   ├── projects.json       (Portfolio categories + projects — file-based, no API)
│   └── about.json          (About page data — timeline, team, values)
├── lib/
│   ├── api.ts              (Flask API calls for products, categories, contact, client-side search)
│   ├── portfolio.ts        (Portfolio data helpers — reads from projects.json)
│   ├── about.ts            (getAboutContent(locale) — internal app, fallback about.json)
│   └── utils.ts            (formatPrice, cn)
├── messages/
│   ├── ar.json             (Arabic translations)
│   └── en.json             (English translations)
└── middleware.ts            (next-intl locale routing)
```

### Server vs Client Components

**Server Components by default.** Use `"use client"` ONLY for:
- `SiteHeader` — scroll detection, tools dropdown, `useTranslations`
- `MobileBottomNav` — active tab, "More" sheet state
- `AnimatedSection` — Framer Motion intersection observer
- `ProductsFilter` — URL param updates via `useRouter()`
- `ContactForm` — form state, submission, validation, `useTranslations`
- `ProjectGallery` — lightbox interaction
- `WhatsAppButton` — client-side interaction, `useTranslations`
- `LanguageToggle` — locale switching
- `FAQ` — accordion expand/collapse state, Framer Motion
- `ShareButtons` — Web Share API detection, clipboard, `useTranslations`
- `ScrollToTop` — scroll detection, Framer Motion
- `Timeline` — Framer Motion scroll-triggered animations, RTL detection
- `GlobalSearch` — Ctrl+K overlay, debounced search, keyboard navigation, recent searches

### Data Flow

**Products (Flask API):**
```
Flask API (localhost:5000) → src/lib/api.ts → Server Component → props → Client Component
```

**Portfolio (internal app, «الموقع» → مشاريع المعرض):**
```
Flask /api/public/website/portfolio → src/lib/portfolio.ts (async, ISR 1h, tag site-content) → Server Component
                                   ↳ fallback: src/data/projects.json (only when the API is unreachable)
```

- Product pages call typed fetch functions from `api.ts` (ISR, `revalidate: 3600`)
- Portfolio pages use synchronous helpers from `portfolio.ts` (static JSON, no API needed)
- All fetch functions return empty arrays or null on failure (graceful degradation)
- Client components receive data as props, never fetch directly
- Data (product names, project names) stays in Arabic regardless of locale

### URL-Driven Filtering

Products pages use `searchParams` for state:
- `/ar/products?category=3&subcategory=5&search=بلاط`

Portfolio uses category-based URL segments instead of query params:
- `/ar/portfolio/interior-design` (category page)
- `/ar/portfolio/interior-design/cafeteria-karbala` (project detail)

### Portfolio Structure

5 categories with file-based project data:
- `interior-design` — التصميم الداخلي
- `exterior-design` — التصميم الخارجي
- `execution` — التنفيذ
- `Floor-plan` — الخرائط
- `finishing` — التشطيبات

Images stored in `public/portfolio/{category-id}/{project-id}/` (cover.jpg, 1.jpg, etc.)

Data managed in `src/data/projects.json`, accessed via `src/lib/portfolio.ts` helpers:
- `getCategories()`, `getCategory(id)`, `getProjects(categoryId?)`, `getProject(id)`
- `getFeaturedProjects()`, `getProjectImageUrl(cat, proj, file)`, `getProjectsByCategory()`

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Flask API calls for products, categories, contact |
| `src/lib/portfolio.ts` | Portfolio data helpers (reads from projects.json) |
| `src/data/projects.json` | Portfolio categories and projects data |
| `src/lib/utils.ts` | `formatPrice()` (Iraqi Dinar), `cn()` (classname merge) |
| `src/app/globals.css` | Tailwind v4 `@theme` color/font definitions, custom CSS utilities |
| `src/app/[locale]/layout.tsx` | Root layout: locale, dir, fonts, NextIntlClientProvider |
| `src/app/sitemap.ts` | Auto-generated sitemap with all routes and both locales |
| `src/app/robots.ts` | Robots.txt configuration |
| `next.config.ts` | next-intl plugin + remote image patterns |
| `.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:5000` |

## API Contract (Flask Backend)

All endpoints under `NEXT_PUBLIC_API_URL/api/public/` — used for **products only** (portfolio is file-based):

| Method | Path | Returns |
|--------|------|---------|
| GET | `/products` | Product[] (supports ?category_id, ?subcategory_id, ?search) — each with `colors: [{id, name, hex, image_path, available}]` |
| GET | `/products/<id>` | Product |
| GET | `/products/images/<path>` | Image file |
| GET | `/categories` | Category[] with nested subcategories |
| GET | `/calculator-pricing` | {pricing} — cost-calculator prices edited at `/admin/calculator-pricing` in the internal app |
| POST | `/contact` | 201 {ok, id} — accepts {name, phone, email, message}. `submitContact`/`submitBooking` treat HTTP 2xx as success |

**NEVER exposed by API:** price_cost, price_wholesale, quantity, min_quantity, customer_phone, contract_value, financial data.
Colour stock is reduced to `available: boolean` by the API (products with `track_stock=0` are always available) — never a quantity. Deployments without the colours change omit `colors`; `mapProduct` treats that as `[]`.

### Website management in the internal app («الموقع» menu, admin only)

- Sidebar group «الموقع» (`blueprints/website_admin.py`, `NAV_WEBSITE` in base.html): لوحة الموقع (site URL, publish key, «انشر الآن»), مشاريع المعرض (CRUD + images / YouTube videos / before-after pairs; tables `website_projects`, `website_project_media`), حاسبات الموقع, رسائل التواصل. Phase 2 adds النصوص والعناوين (90 marketing texts, AR+EN, catalogue generated from the translation files into `core/db/website_texts_catalog.py`), معلومات التواصل, الصور الرئيسية. Phase 3 adds آراء العملاء and صفحة من نحن (timeline / team / values) — flat items with `<field>_ar` / `<field>_en`, stored in `settings.website_sections` (`core/db/website_sections.py`, shared row editor `templates/_website_rows.html`). The About story/mission/vision and section headings are in النصوص والعناوين.
- Portfolio functions in `src/lib/portfolio.ts` are **async** (`getProjects`, `getProject`, `getFeaturedProjects`, `getProjectsByCategory`); categories stay static. Images are full URLs (ImgBB / `/api/public/website/media/…`) or `/portfolio/…` site paths — `getProjectImageUrl` passes both through. An empty list from a healthy API is respected (no fallback resurrection).
- «انشر الآن» → `POST {site}/api/revalidate` with header `x-revalidate-secret` (= env `REVALIDATE_SECRET` on the website host = «مفتاح النشر» in the app) → `revalidateTag(SITE_CONTENT_TAG)` + `revalidatePath("/", "layout")`. All API fetches carry the `site-content` tag (`src/lib/cacheTags.ts` — kept separate so client bundles don't pull portfolio data).
- **Texts / contact / images overrides:** `src/lib/siteContent.ts` fetches `/api/public/website/content` (`{texts:{ar,en}:{"ns.key": text}, site:{…}}`, ISR 1h, tag site-content) and `getSiteMessages(locale)` merges it over the bundled translation files — used by BOTH `src/i18n/request.ts` and `[locale]/layout.tsx`. Only existing string keys are overridden. Contact details and main images live in the `site` namespace (`site.phone_1`, `site.whatsapp`, `site.email`, `site.facebook`, `site.instagram`, `site.map_url`, `site.map_embed`, `site.hero_image`, `site.products_image`) — **never hardcode them**; use `t("site.…")` / `telHref()`.
- **Testimonials / About lists** arrive in the same content response as `sections: {testimonials, timeline, team, values}`. `getTestimonials(locale)` (`src/lib/testimonials.ts`) and `getAboutContent(locale)` (`src/lib/about.ts`) are **async** and localize with `localized(item, field, locale)` (blank English → Arabic). `sections` missing (API down / older API) → `src/data/testimonials.json` / `about.json` + `about.*_N_*` translation keys. An emptied list is respected: the testimonials band / About section is hidden. Value icons: `iconMap` in the About page must match `VALUE_ICONS` in the internal app.
- GlobalSearch reads projects from `/api/portfolio-index` (cached route) instead of bundling projects.json.
- Tests: `npm test` (vitest) — `src/__tests__/portfolio.test.ts` covers API / empty-list / fallback / image URLs.

### Cost Calculator (`/calculator`)

- Prices live in the internal app (`core/db/calculator_pricing.py`, admin page `/admin/calculator-pricing`, stored as JSON in `settings.website_calculator_pricing`) and are served by `/api/public/calculator-pricing` (ISR 1h). `src/lib/calculator.ts` holds `DEFAULT_PRICING` (mirror of the Python defaults) used if the API is unreachable, and the pure `computeEstimate()`.
- Formula: built area = plot × coverage% × floors; turnkey = built × level rate — **all-inclusive** (kitchens, bathrooms, rooms; nothing is added on top); structure/finishing = share% of turnkey; plans = ($100 up to 200 m² of plot + $1 per m² above) × usd_rate; interior design = built × $/m² × usd_rate; exterior (facade) = facade length (linear m) × IQD/m. `usd_rate` is the internal app's exchange-rate setting (fallback 1500). Surcharges (renovation 15% / outside Kirkuk 10% / commercial 15%) multiply every line and are not shown as a note. Company/supervision fee (`company_fee`, 10%) is added as its own line on the execution cost only (turnkey/structure/finishing, after surcharges) — not on plans/design. Lines ≥5M round to 100k, smaller to 5k; totals in millions, small lines in thousands, Western digits.
- Single page, live update: sticky result card on lg, fixed `.calc-mobile-bar` above `MobileBottomNav` on mobile (globals.css lifts the floating buttons). "Accurate quote" form posts to `/contact`, landing in the internal app's contact messages.

### Area Calculator (`/area-calculator`)

- Factors (pieces per box per tile size, waste %, adhesive/grout kg per m² and bag sizes, silicone per wet room, paint coverage/coats, door/window m², bathroom/kitchen tiling heights) live under `area` in the same internal-app pricing JSON / admin page and `/api/public/calculator-pricing`; defaults mirrored in `DEFAULT_PRICING.area`.
- `src/lib/areaCalculator.ts` `computeArea()`: rooms (type room/bathroom/kitchen, L×W, doors, windows) → floor tiles (all floors), wall tiles (bathroom: perimeter × tile height − openings; kitchen: perimeter × backsplash height), adhesive/grout bags on tiled area, silicone per wet room, paint = ceilings + untiled walls − openings. Zero divisors fall back to defaults.
- Each material links to the catalogue: the page matches the porcelain category and its size subcategory ("60*60", "60 في 120 سم" → `60x60`, `60x120`) and the adhesives subcategory by name; paint links to a search. Shared UI (`Section`, `Segmented`, `OptionCard`, `OfferForm`) is in `src/components/calc/CalcUI.tsx`.

### Products Catalogue (`/products`)

- The page fetches **all** products once (`getProducts()`, ISR-cached, ~200 KB) and filters / searches / paginates in `src/lib/catalog.ts` — no per-filter API calls, so filters never wait on Render's cold start.
- URL state: `?category=<id>&subcategory=<id>&search=<q>&page=<n>` (24 per page). `catalogHref()` builds links; `{ anchor: true }` jumps to `#catalog`.
- Order: photographed products first, then products with colours, then name. Empty categories/subcategories are hidden.
- Search is Arabic-normalised (diacritics, alef/ya/ta-marbuta variants) across name, details, category and colour names; every word must match.
- Components in `src/components/products/`: `CategoryNav` (sidebar on lg, chips below), `CatalogSearch`, `ProductCard`, `ProductImage` (falls back to a category placeholder if the file 404s), `ColorDots`, `CatalogPagination`, `ProductDetailView` (colour picker swaps photo + WhatsApp text), `categoryIcon`.
- Product images use optimized `next/image` (not `BlurImage`, which downloads originals).

## Styling Rules

### Color Palette

Config is CSS-first via `@theme` block in `globals.css` — NOT in `tailwind.config.ts`.

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | #153C38 | Dark green (main brand), buttons, links |
| `primary-light` | #1E5650 | Hover states, secondary green |
| `primary-dark` | #0E2A27 | Footer bg, hero gradient dark end |
| `secondary` | #F1E9E8 | Cream backgrounds |
| `secondary-light` | #F7F2F1 | Very light cream |
| `secondary-dark` | #E0D3D1 | Cream borders |
| `accent` | #933928 | Red/brown accent, CTAs, highlights |
| `accent-light` | #B04A38 | Hover on accent |
| `accent-dark` | #7A2E20 | Darker accent |
| `surface` | #F7F2F1 | Page surface backgrounds |

### Fonts

- **Arabic headings:** Khalid Art Bold (local font, `--font-arabic`)
- **Arabic body:** Tajawal (Google Fonts, `--font-arabic-body`)
- **English:** Poppins (Google Fonts, `--font-english`)

Font selection is automatic via `[lang="ar"]` and `[lang="en"]` CSS selectors in globals.css.

### RTL/LTR Layout

- `<html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>` set dynamically in layout
- Use Tailwind logical properties: `ps-` `pe-` `ms-` `me-` instead of `pl-` `pr-` `ml-` `mr-`
- Arrow icons: `rotate-180` only needed in RTL mode
- Text alignment: default is already right in RTL, use `text-start` / `text-end`

### Custom CSS Classes

- `.bg-geometric` — subtle geometric pattern overlay
- `.accent-shimmer` / `.gold-shimmer` — animated accent gradient effect
- `.noise-overlay` — texture via `::before` pseudo-element
- `.skeleton` — loading shimmer animation

### Logo Component

- `<Logo variant="dark" />` — dark green logo for light backgrounds
- `<Logo variant="light" />` — cream/light logo for dark backgrounds
- Logo files in `public/images/logo-dark.png` and `public/images/logo-light.png`

## SEO & Structured Data

- All pages have `generateMetadata()` with OpenGraph tags
- Site address `https://www.manzel360.com` lives in `src/lib/siteUrl.ts` (`SITE_URL`) — used by `metadataBase`, sitemap, robots, JSON-LD and share links. Never hardcode the domain.
- Home page includes JSON-LD: Organization + LocalBusiness (HomeAndConstructionBusiness)
- `/sitemap.xml` auto-generated from portfolio data + static routes (both locales, hreflang)
- `/robots.txt` allows all crawlers
- Project detail pages use `openGraph.type: "article"` with cover image

## Marketing Features

### FAQ Section (Home Page)
- Accordion component (`FAQ.tsx`) after Testimonials, before CTA
- 6 Q&A items from `faq` translation namespace
- One item open at a time, Framer Motion animations

### Social Sharing (Project Detail Page)
- `ShareButtons.tsx` in project info sidebar
- WhatsApp, Facebook, Telegram, Copy Link buttons
- Uses Web Share API on mobile, fallback buttons on desktop
- Translation namespace: `share`

### Loading Skeletons
- Only `products/loading.tsx` (live Flask data). Do NOT add `loading.tsx` to statically generated routes (or `[locale]/`): it wraps the page in a Suspense boundary, so the first HTML shows the spinner and the real content stays hidden until the whole document has streamed — it cost ~2s LCP on mobile.
- Uses `.skeleton` CSS class for shimmer animation

## Conventions

### Translations
- ALL UI text must use translation keys — NEVER hardcode Arabic or English strings
- Server components: `const t = await getTranslations("namespace")`
- Client components: `const t = useTranslations("namespace")`
- Add new keys to BOTH `src/messages/ar.json` and `src/messages/en.json`
- Translation namespaces: `nav`, `brand`, `home`, `stats`, `products`, `portfolio`, `contact`, `form`, `footer`, `common`, `errors`, `whatsapp`, `metadata`, `testimonials`, `calculator`, `booking`, `faq`, `share`, `about`, `search`

### Links
- ALWAYS use `Link` from `@/i18n/navigation`, NOT from `next/link`
- This ensures locale prefix is automatically added to all links

### Prices
- Format as Iraqi Dinar: `formatPrice(price)` → `"٢٥٠,٠٠٠ د.ع"`
- Never show cost or wholesale prices

### Next.js Patterns
- Page props use async params: `params: Promise<{ locale: string; id: string }>` and `searchParams: Promise<{...}>`
- Images via `next/image` with `getProductImageUrl()` (products) / `getProjectImageUrl()` (portfolio) helpers
- Handle missing images: always show a placeholder/fallback

### Error Handling
- API failures: show fallback UI, never crash the page
- Empty data: show translated "no results" message, not a blank page
- Loading states: use spinner (language-agnostic)

## Design System (September 2026 redesign — "Model A")

- Cream page (`body` = `surface`), white rounded-3xl cards, green (`primary`) bands as inset rounded panels, accent for CTAs. Soft rounded corners everywhere.
- Every inner page starts with `<PageHero badge title description [imageUrl] [breadcrumb] />`. Pages without a dark hero (product detail, project detail) start with a breadcrumb at `pt-24 md:pt-28` — SiteHeader then stays solid automatically.
- Any new dark top section must carry `data-header-overlay`, otherwise the header renders solid white over it.
- Reuse `SectionHeader`, `ButtonLink`, `ImageTile`, `TrustSection`, `ClosingCTA` instead of hand-rolling section headers/CTA bands.
- Hover-only UI must also work on touch: show overlays by default and hide them only under `[@media(hover:hover)]`.

## Performance Rules (iOS Safari)

Hard-won rules from the July 2026 iPhone performance fix — do not regress these:

- **Device detection:** `src/lib/device.ts` (`useDevice()` → `desktop | ios | android | mobile` + `constrained` for Save-Data/low-memory) and `src/lib/deviceScript.ts` (inline head script setting `html[data-device]` before paint). Gate platform-specific CSS with `html[data-device=…]` — width queries miss iPad Pro. Touch devices get no `backdrop-filter` and no `.noise-overlay`.
- **HeroVideo:** poster is a real `<Image priority>`; the video fades in only on `playing`, is dropped if autoplay is refused (iOS Low Power Mode → poster stays), is skipped on `constrained` devices, and pauses when the hero leaves the viewport so it never decodes alongside the furniture video.
- **Horizontal overflow:** `body { overflow-x: clip }` plus `overflow-x-clip` on components with sideways entrance animations (Timeline). Overflow makes iOS zoom the whole page out. Use `clip`, never `hidden` (breaks `position: sticky`).

- **Media budgets:** videos in `public/` ≤ 1.5 MB (H.264, CRF 28, no audio, `+faststart`); images ≤ 300 KB. Originals are backed up in `_media-originals/` (gitignored). Compress with `ffmpeg-static` + `sharp` (devDependencies).
- **Videos:** always `preload="metadata"` (or `"none"` + IntersectionObserver) with a `poster` image — NEVER `preload="auto"`. Two videos decoding at once exceed iOS Safari's media memory budget and one silently fails to render (this was the original "video not showing" bug).
- **Video scrubbing** (`ScrollVideoSection`): desktop-only. `isMobile` starts `null` and the scrub video gets its `src` only once the client confirms desktop — the server HTML must never carry `furniture-scrub.mp4` (with `autoPlay` phones downloaded the 1MB before hydration). HeroVideo attaches its video only after the window `load` event. iOS can't seek programmatically without a user gesture — on mobile/touch the component renders a normal-height section with a lazy autoplaying loop instead.
- **Scrub video encoding:** `furniture-scrub.mp4` (desktop) MUST be all-intra (`ffmpeg -g 1`) — with sparse keyframes every seek decodes dozens of frames and scrubbing stutters. The mobile loop uses the separate normal-GOP `furniture-mobile.mp4` (3× smaller).
- **Expensive effects are desktop-only:** large-radius `blur-[100px+]` layers, `.noise-overlay` (feTurbulence), `backdrop-blur` on fixed elements, and infinite `background-position` shimmers are all gated behind `md:` / `@media (hover: hover)` / `html[data-device]`. Do not add new ones over video or fixed elements on mobile. SiteHeader and MobileBottomNav use solid backgrounds.
- **Scroll/resize listeners:** rAF-throttle them (see `SiteHeader.tsx`, `ScrollVideoSection.tsx`). iOS fires `resize` continuously while the URL bar collapses during scroll. Prefer IntersectionObserver where possible.
- **API fetches:** every fetch in `api.ts` has `AbortSignal.timeout(...)` (5s reads / 30s writes). The Flask API on Render free tier cold-starts for 30-60s — never let a fetch block without a timeout.
- **Static rendering:** `[locale]/layout.tsx` has `generateStaticParams` + `setRequestLocale(locale)` (also in the home page). Call `setRequestLocale` in new pages that should prerender; without it the page renders dynamically on every request.
- **GlobalSearch** is mounted via `GlobalSearchLazy` — its bundle (projects.json + framer + icons) loads only on first open (Ctrl+K or navbar button event `open-global-search`). Don't import `GlobalSearch` directly in the layout.
- **SplashScreen** is a server component + pure CSS (`.splash` in globals.css), ~1s, painted with the first frame. `SPLASH_BOOT_SCRIPT` (`deviceScript.ts`, in `<head>`) adds `html.no-splash` on repeat visits and lets a tap skip it. Never make it client-mounted again: appearing after hydration pushed LCP to ~5s.
- **Nothing visible may ship `opacity:0` in the server HTML.** framer-motion `initial={{opacity:0}}` keeps content hidden until JavaScript loads (~4–5s on a slow phone). `AnimatedSection` is a CSS scroll-driven reveal (`.reveal`, `animation-timeline: view()`, visible where unsupported), `PageTransition` is a CSS fade (`.page-fade`), `.hero-rise` is CSS. Use these instead of framer entrance animations for content.
- **Fonts:** Playfair (English `.font-display` only) has `preload: false`; Tajawal loads `arabic` + `latin` (digits inside Arabic text) in weights 400/500/700.
- **Lighthouse (mobile, Sept 2026):** perf 76–87, accessibility 95–100, best practices 96–100, SEO 100. Measure with `npx lighthouse@12 <url> --throttling-method=devtools` too — the default simulated mode over-weights JS.
- **Static rendering:** all pages except `/products` and `/products/[id]` (live Flask data) are SSG — keep `setRequestLocale(locale)` in new pages.

## Common Pitfalls — Do NOT

- Do NOT use `pl-` `pr-` `ml-` `mr-` — use logical `ps-` `pe-` `ms-` `me-` for RTL
- Do NOT use `Link` from `next/link` — use `Link` from `@/i18n/navigation`
- Do NOT hardcode Arabic or English text — use translation keys
- Do NOT fetch data in client components — fetch in server components, pass as props
- Do NOT hardcode `localhost:5000` — always use `NEXT_PUBLIC_API_URL`
- Do NOT skip `npm run build` test before considering a feature done
- Do NOT show products/projects without images as broken — show placeholder
- Do NOT use `tailwind.config.ts` for colors — use `@theme` in `globals.css`
- Do NOT forget `revalidate: 3600` on fetch calls (ISR)
- Do NOT use dynamic `import()` with template literals for messages — use static imports with a map

## Dependencies on Flask Backend

The Flask app MUST be running for:
- `npm run build` (fetches product/category data at build time)
- `npm run dev` (fetches product/category data on each request)
- Product images (served from Flask)

Portfolio pages read from Flask but fall back to `src/data/projects.json` (images of the original projects stay in `public/portfolio/`).

If Flask is down, product pages render with empty/fallback content (no crash). Portfolio pages work normally.

## Maintenance

After major changes, update this CLAUDE.md file to reflect:
- New pages or components added
- API contract changes
- New conventions or patterns
- New translation namespaces or keys
- Resolved pitfalls worth documenting

## Important Note

After major changes, please update this file (CLAUDE.md) — keep this file up-to-date with project status.
