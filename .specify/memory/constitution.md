<!--
  Sync Impact Report
  Version change: 0.0.0 → 1.0.0 (initial ratification)
  Added principles:
    - I. Code Quality & Type Safety
    - II. Testing Standards (NON-NEGOTIABLE)
    - III. User Experience Consistency
    - IV. Performance Requirements
    - V. Bilingual Integrity
  Added sections:
    - Development Constraints
    - Development Workflow & Quality Gates
    - Governance
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ aligned (Constitution Check section exists)
    - .specify/templates/spec-template.md ✅ aligned (Success Criteria supports performance metrics)
    - .specify/templates/tasks-template.md ✅ aligned (phase structure supports build-test-verify)
  Follow-up TODOs: none
-->

# Manzel Website Constitution

## Core Principles

### I. Code Quality & Type Safety

Every component, utility, and page MUST adhere to strict TypeScript conventions and Next.js App Router patterns:

- **Server components by default.** The `"use client"` directive MUST only be added when the component requires browser APIs, React hooks (`useState`, `useEffect`), or event handlers. Adding `"use client"` without justification is a violation.
- **Logical CSS properties only.** All spacing and alignment MUST use Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`, `text-start`, `text-end`). Physical properties (`pl-`, `pr-`, `ml-`, `mr-`) are prohibited — they break RTL layout.
- **CSS-first theming.** All color tokens and font variables MUST be defined via `@theme` in `globals.css`. The `tailwind.config.ts` file MUST NOT contain color or font definitions.
- **No hardcoded strings.** Every user-facing string MUST use translation keys via `next-intl`. Hardcoded Arabic or English text in components is a build-blocking violation.
- **Import discipline.** Navigation links MUST use `Link` from `@/i18n/navigation`, never from `next/link`. API URLs MUST use `NEXT_PUBLIC_API_URL`, never hardcoded hostnames.
- **Graceful degradation.** API failures MUST render fallback UI (empty states, placeholders), never crash the page or show raw errors to users.

### II. Testing Standards (NON-NEGOTIABLE)

No feature, fix, or refactor is considered complete until it passes the full Build-Test-Verify cycle:

1. **BUILD**: Write or modify code.
2. **TEST**: Run `npm run build` — MUST complete with **zero errors**. A feature that does not build is not a feature.
3. **VERIFY**: Open the affected pages in a browser and confirm correct rendering in **both `/ar` and `/en`** locales.

Additional testing rules:

- `npm run lint` MUST pass with no new warnings or errors before any work is declared done.
- Translation completeness: every key added to `ar.json` MUST have a corresponding entry in `en.json`, and vice versa. Missing keys cause build failures or blank UI — both are unacceptable.
- Image references MUST be verified: product images via `getProductImageUrl()`, portfolio images via `getProjectImageUrl()`. Broken images MUST show a placeholder, not a broken icon.

### III. User Experience Consistency

The Manzel website serves users in Arabic (RTL) and English (LTR). Both experiences MUST be equally polished:

- **Visual parity.** Every page MUST be visually reviewed in both locales. Layout shifts, overlapping text, or misaligned elements in either direction are bugs.
- **Dark mode parity.** All new components MUST support dark mode using the `.dark` CSS custom property overrides. Cards use `dark:bg-[#1E293B]`, page backgrounds use `dark:bg-[#0F172A]`.
- **Loading states.** Pages that fetch data MUST show route-specific loading skeletons (using the `.skeleton` CSS class), not blank screens or generic spinners, unless a spinner is explicitly the language-agnostic choice.
- **Empty states.** When data is unavailable (no products, no projects, API down), pages MUST display a translated "no results" message — never a blank page.
- **Font consistency.** Arabic headings use Khalid Art Bold, Arabic body uses Tajawal, English uses Poppins. Font selection is automatic via CSS `[lang]` selectors and MUST NOT be overridden inline.
- **Responsive design.** All pages MUST be functional and visually acceptable on mobile (320px), tablet (768px), and desktop (1280px+) viewports.

### IV. Performance Requirements

The website MUST deliver fast, smooth experiences on Iraqi network conditions:

- **ISR (Incremental Static Regeneration).** All product data fetches MUST include `revalidate: 3600` to enable caching. Removing or reducing revalidation without justification is prohibited.
- **Image optimization.** All images MUST use `next/image` with appropriate `width`, `height`, and `alt` attributes. Unoptimized `<img>` tags are prohibited.
- **Bundle discipline.** Client components MUST be kept minimal. Large libraries MUST NOT be imported in client components without evaluating bundle impact. Framer Motion usage is pre-approved; new animation libraries require justification.
- **Core Web Vitals targets:**
  - Largest Contentful Paint (LCP): < 2.5 seconds
  - Cumulative Layout Shift (CLS): < 0.1
  - Interaction to Next Paint (INP): < 200ms
- **No client-side data fetching.** Data MUST be fetched in server components and passed as props. Client components MUST NOT call APIs directly.

### V. Bilingual Integrity

Arabic and English are equal citizens in this codebase. Neither locale is an afterthought:

- **Translation namespace discipline.** Each feature area has a defined namespace (`nav`, `home`, `products`, `portfolio`, `contact`, `form`, `footer`, `common`, `errors`, `whatsapp`, `metadata`, `testimonials`, `calculator`, `booking`, `faq`, `share`). New features MUST define and document their namespace.
- **Locale-aware routing.** All internal links MUST be locale-prefixed automatically via `@/i18n/navigation`. Manual locale prefixing in hrefs is prohibited.
- **Data language.** Product names, project names, and other business data remain in Arabic regardless of the active locale. UI chrome (labels, buttons, headings) MUST be translated.
- **Metadata completeness.** Every page MUST have `generateMetadata()` with OpenGraph tags in the correct locale. SEO metadata MUST be translated.

## Development Constraints

Technology and architecture boundaries that MUST NOT be violated:

- **Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, next-intl, Framer Motion. No framework substitutions without constitution amendment.
- **Data sources:** Products come from the Flask API (`NEXT_PUBLIC_API_URL`). Portfolio comes from `src/data/projects.json`. These boundaries MUST NOT be mixed — portfolio pages MUST NOT call the Flask API, and product pages MUST NOT read from local JSON.
- **API security:** The public website MUST NEVER expose `price_cost`, `price_wholesale`, `quantity`, `min_quantity`, `customer_phone`, `contract_value`, or any financial data from the Flask backend.
- **File structure:** New pages go under `src/app/[locale]/`. New components go in `src/components/`. New data helpers go in `src/lib/`. Translations go in `src/messages/`. Deviation requires justification.
- **Font files:** Local fonts reside in `src/fonts/`. Google Fonts are loaded via `next/font/google` in the layout. No CDN font links in HTML.

## Development Workflow & Quality Gates

Every change, from a one-line fix to a multi-page feature, MUST follow this workflow:

1. **Understand before modifying.** Read existing code before proposing changes. Never modify code you haven't read.
2. **Implement.** Make the minimal changes needed. Do not refactor surrounding code, add unnecessary abstractions, or introduce features beyond the request.
3. **Build gate.** Run `npm run build`. If it fails, fix errors before proceeding. This is non-negotiable.
4. **Lint gate.** Run `npm run lint`. Fix any new warnings or errors.
5. **Visual verification.** Open the affected pages in both `/ar` and `/en`. Confirm layout, dark mode, and responsive behavior.
6. **Translation audit.** Verify all new keys exist in both `ar.json` and `en.json`. Verify no hardcoded strings were introduced.
7. **Commit.** Only after gates 3–6 pass. Commit messages MUST describe the "why", not just the "what".

**Quality gates are sequential.** A failing build blocks linting. A failing lint blocks visual verification. No gate may be skipped.

## Governance

This constitution is the authoritative source of project standards for the Manzel public website. It supersedes informal conventions, ad-hoc decisions, and prior habits.

- **Amendments** require documentation of what changed, why, and a version bump following semantic versioning (MAJOR: principle removal/redefinition, MINOR: new principle or material expansion, PATCH: clarification or wording).
- **Compliance** is verified at every build-test-verify cycle. Violations discovered in review MUST be fixed before merge.
- **CLAUDE.md alignment.** The project's `CLAUDE.md` file provides operational guidance consistent with this constitution. If a conflict arises, this constitution takes precedence and `CLAUDE.md` MUST be updated.
- **Cascade updates.** When principles change, all dependent templates (spec, plan, tasks) and guidance files MUST be reviewed for alignment.

**Version**: 1.0.0 | **Ratified**: 2026-03-16 | **Last Amended**: 2026-03-16
