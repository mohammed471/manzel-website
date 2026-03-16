# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Manzel (منزل) — Bilingual (Arabic RTL + English LTR) public website for a construction, interior design, and building materials company based in Karbala, Iraq. Displays products catalog (from Flask API) and project portfolio (file-based, from `src/data/projects.json`).

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
│       └── testimonials/page.tsx                  (Client testimonials)
├── app/
│   ├── sitemap.ts                                 (Auto-generated sitemap — all routes, both locales)
│   └── robots.ts                                  (Robots.txt — allow all crawlers)
├── components/
│   ├── Navbar.tsx          (client — scroll detection, mobile menu, LanguageToggle, DarkModeToggle)
│   ├── Footer.tsx          (server — translated links, contact info)
│   ├── Logo.tsx            (server — dark/light logo variants)
│   ├── LanguageToggle.tsx  (client — AR/EN switch)
│   ├── DarkModeToggle.tsx  (client — dark/light mode switch, localStorage + OS preference)
│   ├── AnimatedSection.tsx (client — Framer Motion scroll animations)
│   ├── FAQ.tsx             (client — accordion component, Framer Motion expand/collapse)
│   ├── ShareButtons.tsx    (client — social sharing: WhatsApp, Facebook, Telegram, copy link)
│   ├── ContactForm.tsx     (client — form with translated labels)
│   ├── ProductCard.tsx     (server)
│   ├── ProductsFilter.tsx  (client — translated search/filter UI)
│   ├── ProjectCard.tsx     (server — portfolio project card)
│   ├── ProjectGallery.tsx  (client — lightbox)
│   ├── VideoSection.tsx    (client — YouTube/local video embeds)
│   ├── CategoryCard.tsx    (server)
│   ├── ScrollToTop.tsx     (client — scroll-to-top button, appears after 400px)
│   └── WhatsAppButton.tsx  (client)
├── fonts/
│   └── khalid-art-bold.ttf (local Arabic display font)
├── i18n/                   (next-intl config)
├── data/
│   └── projects.json       (Portfolio categories + projects — file-based, no API)
├── lib/
│   ├── api.ts              (Flask API calls for products, categories, contact)
│   ├── portfolio.ts        (Portfolio data helpers — reads from projects.json)
│   └── utils.ts            (formatPrice, cn)
├── messages/
│   ├── ar.json             (Arabic translations)
│   └── en.json             (English translations)
└── middleware.ts            (next-intl locale routing)
```

### Server vs Client Components

**Server Components by default.** Use `"use client"` ONLY for:
- `Navbar` — scroll detection, mobile menu toggle, `useTranslations`
- `AnimatedSection` — Framer Motion intersection observer
- `ProductsFilter` — URL param updates via `useRouter()`
- `ContactForm` — form state, submission, validation, `useTranslations`
- `ProjectGallery` — lightbox interaction
- `WhatsAppButton` — client-side interaction, `useTranslations`
- `LanguageToggle` — locale switching
- `DarkModeToggle` — theme switching, localStorage, `useTranslations`
- `FAQ` — accordion expand/collapse state, Framer Motion
- `ShareButtons` — Web Share API detection, clipboard, `useTranslations`
- `ScrollToTop` — scroll detection, Framer Motion

### Data Flow

**Products (Flask API):**
```
Flask API (localhost:5000) → src/lib/api.ts → Server Component → props → Client Component
```

**Portfolio (File-based):**
```
src/data/projects.json → src/lib/portfolio.ts → Server Component → props → Client Component
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
| `src/app/globals.css` | Tailwind v4 `@theme` color/font definitions, dark mode overrides, custom CSS utilities |
| `src/app/[locale]/layout.tsx` | Root layout: locale, dir, fonts, NextIntlClientProvider, dark mode anti-flash |
| `src/app/sitemap.ts` | Auto-generated sitemap with all routes and both locales |
| `src/app/robots.ts` | Robots.txt configuration |
| `next.config.ts` | next-intl plugin + remote image patterns |
| `.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:5000` |

## API Contract (Flask Backend)

All endpoints under `NEXT_PUBLIC_API_URL/api/public/` — used for **products only** (portfolio is file-based):

| Method | Path | Returns |
|--------|------|---------|
| GET | `/products` | Product[] (supports ?category_id, ?subcategory_id, ?search) |
| GET | `/products/<id>` | Product |
| GET | `/products/images/<path>` | Image file |
| GET | `/categories` | Category[] with nested subcategories |
| POST | `/contact` | {success: boolean} — accepts {name, phone, email, message} |

**NEVER exposed by API:** price_cost, price_wholesale, quantity, min_quantity, customer_phone, contract_value, financial data.

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

### Dark Mode

Dark mode uses CSS custom property overrides on the `.dark` class (added to `<html>`):
- Enabled via `@custom-variant dark (&:where(.dark, .dark *));` in globals.css
- Theme colors (secondary, surface, text) are overridden in `.dark { }` block
- Background: `#0F172A`, Surface: `#1E293B`
- Toggle in Navbar via `DarkModeToggle` component
- Preference saved to localStorage, respects OS `prefers-color-scheme`
- Anti-flash `<script>` in layout.tsx applies `.dark` before React hydrates
- Use `dark:bg-[#0F172A]` for `bg-white` sections, `dark:bg-[#1E293B]` for cards
- Images get `brightness(0.9)` filter globally in dark mode

### Custom CSS Classes

- `.bg-geometric` — subtle geometric pattern overlay (has dark mode override)
- `.accent-shimmer` / `.gold-shimmer` — animated accent gradient effect
- `.noise-overlay` — texture via `::before` pseudo-element
- `.skeleton` — loading shimmer animation (has dark mode override)

### Logo Component

- `<Logo variant="dark" />` — dark green logo for light backgrounds
- `<Logo variant="light" />` — cream/light logo for dark backgrounds
- Logo files in `public/images/logo-dark.png` and `public/images/logo-light.png`

## SEO & Structured Data

- All pages have `generateMetadata()` with OpenGraph tags
- `metadataBase` set in layout.tsx (currently `https://example.com` — update for production)
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
- Route-specific `loading.tsx` for: products, portfolio, category, project detail
- Uses `.skeleton` CSS class for shimmer animation

## Conventions

### Translations
- ALL UI text must use translation keys — NEVER hardcode Arabic or English strings
- Server components: `const t = await getTranslations("namespace")`
- Client components: `const t = useTranslations("namespace")`
- Add new keys to BOTH `src/messages/ar.json` and `src/messages/en.json`
- Translation namespaces: `nav`, `brand`, `home`, `stats`, `products`, `portfolio`, `contact`, `form`, `footer`, `common`, `errors`, `whatsapp`, `metadata`, `testimonials`, `calculator`, `booking`, `faq`, `share`

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

Portfolio pages do NOT depend on Flask — data is in `src/data/projects.json`, images in `public/portfolio/`.

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
