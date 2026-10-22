# Manzel pre-launch fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (Native, chosen by the owner). Steps use `- [ ]`.

**Goal:** Carry out the owner's pre-launch tasks file (T00–T30) without making up content, and so that every section with no real data hides itself.

**Architecture:** The content stays **where it is today**: team, testimonials, timeline, texts, contact details and calculator prices are edited in the internal app and reach the site through `/api/public/website/content` and `/calculator-pricing`. The site side gets: hide empty sections, empty the bundled fallbacks, filter testimonials on `verified`, put real numbers in the server HTML. Any change the internal app itself needs is written as a proposal in `docs/internal-app-todo.md`. **No changes to the app or its database.**

**Tech Stack:** Next.js 16 App Router, next-intl, Tailwind v4, vitest. Commands: `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npm test`.

**Spec:** the owner's tasks file → saved at `docs/pre-launch-tasks.md` (first step of the work). This plan → `docs/superpowers/plans/2026-10-22-pre-launch-fixes.md`.

## Context

The site has not launched yet. A design review of `/ar` (2026-10-22) found placeholder content and claims that hurt credibility, sections showing "0 مشروع", counters reading "+0" in the HTML, an H1 with tatweel, and pages missing og:image. A check of the live API showed that the placeholder content comes **from the internal app's database**:
- `sections.team` = «اسم المؤسس / اسم المصمم / اسم المهندس»; `sections.testimonials` = the four quotes; `sections.timeline` = the six milestones.
- `texts.ar["home.hero_subtitle"]` = «شريـــكك في البناء والتصميم» (the tatweel lives in the app).
- The portfolio = 5 projects, **all of them** `interior-design`; one is named «غرفة أستقبال بيضاء».

## Global Constraints

- Work on branch `pre-launch-fixes`; one commit per task, message starting `T07: ...`, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No push or deploy without asking.
- Never edit the database or call the app's write endpoints. Data problems go into a report.
- Never write placeholder text that shows on the page. A section with no data disappears entirely.
- Every UI string goes through translation keys in **both** `ar.json` and `en.json` (T30 happens inside every task, not at the end).
- Never hardcode contact details: `t("site.phone_1")`, `t("site.email")`, and so on (CLAUDE.md), including in JSON-LD.
- Logical classes `ps/pe/ms/me`; `Link` from `@/i18n/navigation`; `SiteImage` for app images; no `opacity:0` in the server HTML; no new UI libraries.
- After each phase: build + lint + tsc + test, then check `/ar` and `/en` in the browser at 375 and 1440.
- Keep the visual identity (primary #153C38, accent #933928, Thmanyah fonts).

## Review Focus

1. **The API is down at build time** → the bundled fallbacks must not bring back the placeholders (empty team, empty testimonials). Test: `getTestimonials` with `getSiteSections()=null` returns `[]`.
2. **Testimonials in the app without a `verified` field** (today's case) → hidden. Accept `true`, `1`, `"1"`, `"true"`; anything else hides. Test in T04.
3. **A category with projects in only one language/type, or one that goes from 0 → 1** → it shows up automatically with no code change. Test on `getHomeData`/the helper in T02.
4. **Counters with a value like "10+" or "+1,200" or an empty one** → the server HTML carries the number as written; empty → hidden. Test on `parse` in T03.
5. **Iraqi phone numbers with spaces or `00964`** → normalise (strip spaces and dashes) before checking; accept `07XXXXXXXXX`, `+9647XXXXXXXXX`, `9647…`, `009647…`. Test in T13.

---

## Phase 0 — Exploration (T00) then stop

### Task 0: Project map
**Files:** Create `docs/pre-launch-tasks.md` (copy of the tasks file), `docs/superpowers/plans/2026-10-22-pre-launch-fixes.md` (this plan), `docs/pre-launch-map.md`.
- [ ] `git switch -c pre-launch-fixes`
- [ ] Write the map: Next 16.1.6 App Router, next-intl (ar/en), data sources (table: products ← Flask `/products`; projects ← `/website/portfolio` + fallback `projects.json`; testimonials/team/timeline/values ← `content.sections` + fallback; texts/contact/images ← `content.texts/site`; calculator ← `/calculator-pricing` + `DEFAULT_PRICING`), and a path for each component the file names (HomeHero, ServicesBento, ScrollVideoSection, CountUp/TrustSection, testimonials, Calculator, BookingForm, about, portfolio, products/*).
- [ ] Add a section "What the live data shows" (the findings above) and "Where the tasks file differs from the code": content/*.ts → the internal app; `lib/calculator/rates.ts` → already centralised in `src/lib/calculator.ts` + the app; the home page already has `HomeAndConstructionBusiness`; the booking form goes to `POST /api/public/contact` (type booking → app contact messages).
- [ ] Check which keys the app's text catalogue contains (`core/db/website_texts_catalog.py` in the app repo — read only): `stats.*`, `home.hero_*`, `about.story_*`.
- [ ] Commit `T00: pre-launch map`. **Stop and send the summary to the owner.**

---

## Phase 1 — Credibility

### Task 1 (T01): Team
**Files:** `src/app/[locale]/about/page.tsx`, `src/data/about.json`, `src/messages/{ar,en}.json`, `src/lib/about.ts`, test `src/__tests__/about.test.ts`
- Produces: `initials(name: string): string` in `src/lib/utils.ts` (first letter of the first two words, `""` for an empty name). T04 uses it too.
- [ ] Test: `initials("محمد علي")==="مع"`, `initials("")===""`; `getAboutContent` with no API → `team: []`.
- [ ] `about.json.team = []`, delete `team_N_name/role` from both files; the about page hides the "خبراء يصنعون الفرق" section when `team.length===0`; a card with no photo shows `initials(name)`.
- [ ] Owner action (in the T00/phase reports): delete the three rows from «صفحة من نحن» in the app — until then they keep coming from the API.

### Task 2 (T02): Empty categories
**Files:** `src/lib/portfolio.ts`, `components/home/homeData.ts`, `ServicesBento.tsx`, `QuickAccessBar.tsx`, `portfolio/page.tsx`, `portfolio/[category]/page.tsx`, `PortfolioFilter.tsx`, `Footer.tsx`, `SiteHeader.tsx` (any category links), `sitemap.ts`
- Produces: `getActiveCategoryIds(): Promise<Set<string>>` in `portfolio.ts` (categories with ≥ 1 project).
- [ ] Test in `portfolio.test.ts`: only `interior-design` has projects → the set = `{interior-design}`; adding a project to `execution` adds it.
- [ ] Filter on it: the bento services, the category cards, the filter buttons, the QuickAccessBar tiles that link to a category (the `floor-plan` tile hides itself), footer/menu links, the sitemap.
- [ ] Empty category page: keep `generateStaticParams` as is; render a short "coming soon" message (`portfolio.coming_soon_*` keys) + `ButtonLink` to `/booking`; `robots: { index: false }` in `generateMetadata`.
- [ ] Check: no "0 مشروع" in `/ar/portfolio` or the home page.

### Task 3 (T03): Counters
**Files:** `components/home/CountUp.tsx`, `homeData.ts`, `about/page.tsx`, `portfolio/page.tsx` (إرثنا بالأرقام), `TrustSection.tsx`, create `src/lib/stats.ts`, test `src/__tests__/stats.test.ts`
- Produces: `getStats(kind: "home" | "about" | "portfolio"): Promise<{numberText: string; label: string}[]>` — one source. `products` = `getProducts().length` (just the number); `sections` = `getActiveCategoryIds().size`; years/projects/clients from `stats.*_count` (set to `""` in both files; the owner fills them in from the app texts — see the T00 catalogue check). An empty item drops out.
- [ ] Test: empty values are dropped; `parse("10+")`, `parse("+1,200")` keep the number; all empty → `[]`.
- [ ] CountUp: initial state = the target (so the server HTML carries the real number); animates from 0 only when in view **and** `!matchMedia("(prefers-reduced-motion: reduce)")`. The band hides when the list is empty.
- [ ] Check: view-source of `/ar` has no `>0<` in the counters.

### Task 4 (T04): Testimonials
**Files:** `src/lib/testimonials.ts`, `src/data/testimonials.json`, `TrustSection.tsx` / the carousel, `testimonials/page.tsx`, `Footer.tsx`, `MobileBottomNav.tsx` (prop `hasTestimonials` from the layout), `GlobalSearch` (same prop via `GlobalSearchLazy`), `sitemap.ts`, test `src/__tests__/testimonials.test.ts`
- Produces: `Testimonial` gains `verified: boolean`, `projectHref: string | null`; `getTestimonials()` returns only verified ones.
- [ ] Tests: no `verified` → hidden; `verified: 1`/`"true"` → shown; `getSiteSections()=null` → `[]`.
- [ ] `testimonials.json = []`; "شاهد المشروع" link when `project` is set (looked up through `getProjects()` to find the category); a missing image → `initials(name)`; check the files `public/testimonials/ahmed.jpg|sara.jpg` (the reason for the dark circles) and delete them if they are not used.
- [ ] Empty: the band hides (already respected), `/testimonials` → `robots noindex`, its link is removed from the footer/the More sheet/search/the sitemap.
- [ ] Add to `docs/internal-app-todo.md`: a «موثّق» checkbox + `project` field in the app's testimonials editor.

### Task 5 (T05+T06): Timeline and story
- [ ] The about page hides the timeline when it is empty. `// TODO(owner): verify every milestone before launch` in `about.ts` above the timeline mapping, and a `TODO(owner)` above the story keys in the docs (JSON allows no comments) — keep the texts unchanged.

### Task 6 (T07): Language mistakes and tatweel
**Files:** `src/messages/{ar,en}.json`, `HomeHero.tsx`, `src/lib/utils.ts`, test in `utils.test.ts`
- Produces: `stripTatweel(s: string): string` (removes U+0640 only when it sits between two letters for stretching, i.e. `/(?<=\p{L})ـ+(?=\p{L})/gu`; leaves «بـ«متوسط»» alone).
- [ ] Test: `stripTatweel("شريـــكك")==="شريكك"`, `stripTatweel("بـ«متوسط»")` unchanged.
- [ ] `slide2_description` → «بأجود المواد». H1: `<span aria-hidden>{raw}</span><span className="sr-only">{stripTatweel(raw)}</span>` when the two differ; metadata/alt go through `stripTatweel`.
- [ ] «أستقبال» is in the database → goes into the T16 report.

---

## Phase 2 — Positioning

### Task 7 (T08): Hero
- [ ] New texts (badge/subtitle/buttons) in `home.*` in both files, exactly as in the spec; main button `/calculator`, second `/booking`; the two old links already exist in QuickAccessBar.
- [ ] Video and poster from `t("site.hero_video")` / `t("site.hero_poster")` (new keys = the current paths + `TODO(owner): replace with real house footage`); proposal to add them to the app catalogue.
- [ ] `HeroVideo`: no attach when `prefers-reduced-motion`; keep `muted playsInline loop preload="metadata"`.
- [ ] Note: the app overrides `home.hero_subtitle` (with tatweel) — if that key turns out to be the H1, the H1 stays the app's text after T07's `stripTatweel`.

### Task 8 (T09+T10): Meta, footer, brand name
- [ ] Home title/description and footer text exactly as in the spec (ar), with natural English translations; review the `title/description` of every page; delete `keywords` from the layout + the `home_keywords` key.
- [ ] Brand: `brand.name` = «منزل» / "MANZEL", `brand.legal` = «شركة منزل للتصميم والبناء» in both files; grep «شركة منزل للبناء والتصميم» and «MANZEL | منزل» and replace them in metadata/footer/JSON-LD/`og:site_name`.

### Task 9 (T11): Open-books contract section
**Files:** create `src/data/showcase.ts`, `src/components/home/OpenBooksSection.tsx` (server), `src/app/[locale]/page.tsx`, the current section in `portfolio/page.tsx`, test `showcase.test.ts`
- Produces: `SHOWCASE = { estimateIqd: 169_024_000, actualIqd: 171_553_000, months: 7, floors: 2, plotM2: 250 }`, `diffPct(s) → 1.5` (one decimal), `PORTAL_DEMO_URL` (moved from wherever commit 6b78350 put it).
- [ ] Test: `diffPct(SHOWCASE)===1.5`.
- [ ] Section right after ServicesBento: badge/H2/text from `home.openbooks_*`, a numbers card (`formatPrice`), two CSS bars (width = value/max), `ButtonLink` to `PORTAL_DEMO_URL`. The portfolio section reads the same `SHOWCASE`.

### Task 10 (T12): "How we work" instead of the scroll section
- [ ] Remove `ScrollVideoSection` from the home page; a new server section `HowWeWork.tsx`: three cards (1 design and plans / 2 materials from our showroom / 3 building and handover) using the three corrected slide texts as-is, the text on a solid background.
- [ ] Delete what nothing uses any more: `ScrollVideoSection.tsx`, `lib/scrubFrames.ts`, `useFrameScrub`, `public/scrub-frames/`, `.scrub-section`, their tests, the "drag to explore" key; keep `furniture-poster.jpg` only if a card uses it. Update CLAUDE.md (the Performance section).

### Task 11 (T13): Booking form
**Files:** `BookingForm.tsx`, `CalendarPicker.tsx`, create `src/lib/phone.ts`, test `phone.test.ts`
- Produces: `normalizeIraqiPhone(raw: string): string | null` → `+9647XXXXXXXXX` or null.
- [ ] Tests: the five forms in Review Focus #5; `"0771234567"` (10 digits) → null; `"+9647812345678"` → itself.
- [ ] Required: name + phone (via `normalizeIraqiPhone`) + project type only; remove the `required` mark from the rest. CalendarPicker: past days disabled (`disabled` + visual), Fridays already are.
- [ ] After success: confirmation + "Continue on WhatsApp" button `wa.me/${t("site.whatsapp")}` with a pre-filled message carrying the project type.
- [ ] The phase report: the data goes to `POST /api/public/contact` (type booking) → «رسائل التواصل» in the app. The destination stays as it is.

---

## Phase 3 — Calculator

### Task 12 (T14): Calibration (structure only)
**Files:** `src/lib/calculator.ts`, `Calculator.tsx`, `src/messages/*`, `src/__tests__/calculator.test.ts`
- [ ] Do not create `rates.ts`: all the factors already live in `DEFAULT_PRICING` + the app. Add a one-line comment per group naming its source (the app/admin page/the owner's reference).
- [ ] `it.skip("TODO(owner): portal case 250 m² × 2 floors, mid, turnkey, Kirkuk → 188.7M incl. fee, 7 months", …)` with the expected values from the spec.
- [ ] Kitchen option: input `kitchen: boolean` (default true); `pricing.kitchen` (IQD per level, default 0 → "without kitchen" changes nothing in the price until the owner sets it); the «المطبخ والحمامات» line in "includes" follows the option (split into its own key `includes_kitchen`).
- [ ] `pricing.based_on_projects?: number` → the line «مبنية على كلفة {N} مشروع منفّذ في كركوك» under the result, hidden when empty.
- [ ] Prices are not changed. The proposal for the `kitchen` + `based_on_projects` fields in the app → `docs/internal-app-todo.md`.

### Task 13 (T15): Mobile bar + share link
- Produces: `estimateToQuery(input): string` / `queryToEstimate(q: URLSearchParams): Partial<Input>` in `calculator.ts` (no personal data).
- [ ] Test round-trip; unknown values are dropped.
- [ ] The WhatsApp message carries `${SITE_URL}/${locale}/calculator?${query}`; the calculator reads the query on load (through `window.location`, not `useSearchParams`, so the page stays static).
- [ ] At 375: `.calc-mobile-bar` covers no field/button (bottom padding on the page = the bar's height).

---

## Phase 4 — Products

### Task 14 (T16+T18 report): Audit script
**Files:** create `scripts/audit-products.ts` (runs with `node scripts/audit-products.ts`, Node 24 type stripping), output `reports/products-audit.csv` + `reports/products-audit-summary.md`
- [ ] Pure functions `productIssues(p, all): string[]` + a test: `.SWITCHES.HDMI.NIVA.NV5-020`/`11QA`/`10828-MW` → code-like name; `1_View01` → obviously wrong; a description with `$`/`دولار`/`بدون اي شي` → internal note/price; no image/duplicate image; duplicate names.
- [ ] Also: project names (the «أستقبال» typo), prices found in descriptions (for T18). Reads only, changes nothing.

### Task 15 (T17+T18): Card and product page
- [ ] Title = the Arabic description when present, the code as a small line underneath (check the field in `mapProduct` first); otherwise the code.
- [ ] Sort `?sort=newest|name|category` in `catalog.ts` (newest = id descending if there is no date), default `newest`; test in `catalog.test.ts`.
- [ ] `hidden` and `price/priceUnit/currency`: read them in `mapProduct` when present (hidden → filtered out, price → shown with `formatPrice`); proposal for the API.
- [ ] Product page: `description` = «{الاسم} — {القسم} | متوفر في معرض منزل، كركوك» (a translation key), `og:image` = the product image.
- [ ] The image: a 1:1 box with `object-contain` and a uniform background.
- T19: proposal only in `docs/internal-app-todo.md` (the projects data is in the app).

---

## Phase 5 — SEO

### Task 16 (T20+T21): og:image, twitter, hreflang
- Produces: `pageMeta(locale, path)` in `src/lib/siteUrl.ts` → `{ alternates: { canonical, languages: { ar, en, "x-default": "/ar…" } } }`, used by every `generateMetadata`.
- [ ] `src/app/[locale]/opengraph-image.tsx` (1200×630, green background, logo + value line, the Thmanyah font from `src/fonts`), plus one each in `calculator/` and `booking/` with their titles. `twitter: { card: "summary_large_image" }` in the layout.
- [ ] Check in the built HTML that child pages keep the og:image (an `openGraph` object in a child page replaces the parent's — add the image to it if it disappears).

### Task 17 (T22): JSON-LD
- [ ] Merge the two blocks into one `HomeAndConstructionBusiness` + `sameAs`; telephone/email from `site.*`; address «كركوك، حي روناكي، قرب جسر الولادة» from a translation key; Sat–Thu 09:00–18:00; **remove `geo`** + `TODO(owner)`; `areaServed: "Kirkuk"`.
- [ ] Project page: `CreativeWork` (name, images, locationCreated, dateCreated when present). Home page: `FAQPage` from the six `faq.qN/aN` (after checking that every answer is non-empty).

### Task 18 (T23+T24): Sitemap, robots, alt
- [ ] `robots.ts` + `metadata.robots` in the layout: when `NEXT_PUBLIC_ALLOW_INDEXING === "false"` → noindex/disallow; unset = allowed (so production never gets de-indexed by mistake).
- [ ] The sitemap excludes empty categories (T2), `/testimonials` when empty (T4), hidden products.
- [ ] `alt` on `furniture-poster.jpg` and every content image; project gallery: `{name} — صورة {n}`.

---

## Phase 6 — Quality

### Task 19 (T25): Accessibility
- [ ] Touch targets ≥ 44px on mobile (heart, search, EN, card arrows, WhatsApp); FAQ `button` + `aria-expanded` + `aria-controls`; `aria-label={t("whatsapp.aria")}`; the board counter inside the label; a global `@media (prefers-reduced-motion: reduce)` rule for `.reveal/.page-fade/.hero-rise`; check contrast (white on the hero, grey on cream, catalogue numbers) with Lighthouse.

### Task 20 (T26–T29): Portal and final check
- [ ] `docs/portal-todo.md` (the portal is in the app repo): subdomain, a "sample project" copy, monthly photos, a graphic summary, noindex.
- [ ] Screenshots at 360/375/390/768 with Playwright → `reports/mobile/` (home, products, portfolio, project, calculator, booking).
- [ ] Mobile Lighthouse for home/products/project/calculator → `reports/lighthouse.md` (targets 85/95/95).
- [ ] grep in `.next/server` for: `اسم المؤسس`, `اسم المصمم`, `اسم المهندس`, `0 مشروع`, `+0`, `أحمد محمد`, `سارة علي`, `1_View01`, `بأعلى مواد الجودة`, `أستقبال`, `شريـــكك` — anything still there that comes from the app → the owner-actions list.
- [ ] Crawl the internal links of the local server (a small script that reads every `href="/…"` from the sitemap pages and checks for a non-404 status).
- [ ] Update CLAUDE.md (new components, keys, the `NEXT_PUBLIC_ALLOW_INDEXING` variable, the scroll section removed).

---

## Owner actions (no code — gathered in the phase reports)
- Delete from the app: the three team rows, the four testimonials, review the timeline; fix «شريـــكك» in «النصوص» and «غرفة أستقبال بيضاء» in the projects.
- Fill in from the app: years/projects/clients; later the kitchen prices and the number of projects behind the calculator.
- Real data: hero video, coordinates, an optional og image, projects for the empty categories.

## Verification (each phase)
`npm run build` (0 errors) → `npm run lint` → `npx tsc --noEmit` → `npm test` → `npm run dev` and check `/ar` and `/en` at 375 and 1440 (Playwright), plus view-source for the counters and the meta.
