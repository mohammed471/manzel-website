# Implementation Plan: Google Analytics 4 & Facebook Pixel Integration

**Branch**: `002-ga4-fb-pixel` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ga4-fb-pixel/spec.md`

## Summary

Add Google Analytics 4 and Facebook Pixel tracking to the Manzel website. The integration is environment-variable-driven (no scripts load if IDs are missing), uses `next/script` with `afterInteractive` strategy for performance, and fires custom events on 4 key business actions (contact form submit, WhatsApp click, calculator completion, booking submit). A centralized analytics utility module provides guarded helper functions so all event calls are safe even when scripts are blocked by ad blockers.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16 (App Router)
**Primary Dependencies**: `next/script` (built-in), GA4 gtag.js, Facebook Pixel base code
**Storage**: N/A (no server-side storage — all tracking is client-side via third-party scripts)
**Testing**: `npm run build` (zero errors), `npm run lint`, manual browser verification (Network tab, console)
**Target Platform**: Web (desktop + mobile), bilingual (Arabic RTL / English LTR)
**Project Type**: Web application (public-facing Next.js site)
**Performance Goals**: LCP < 2.5s, scripts load after interactive (no render blocking)
**Constraints**: Scripts must not load without valid env vars; event calls must not throw if scripts are blocked
**Scale/Scope**: ~10 pages, 4 custom events, 5 components modified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality & Type Safety | PASS | New component is server-rendered (`Analytics.tsx`); utility module (`analytics.ts`) is imported only in existing client components. No new `"use client"` components needed. Logical CSS properties N/A (no layout changes). |
| II. Testing Standards | PASS | Build-Test-Verify cycle will be followed. No new translation keys needed (analytics is invisible to users). |
| III. User Experience Consistency | PASS | No visual changes. No UI elements added. Both locales tracked equally. |
| IV. Performance Requirements | PASS | `afterInteractive` strategy ensures scripts load after page is interactive. No impact on LCP/CLS/INP. No client-side data fetching added. |
| V. Bilingual Integrity | PASS | No user-facing strings. Analytics fires on both `/ar` and `/en` pages identically. |
| Dev Constraints: Stack | PASS | Uses only built-in Next.js features (`next/script`). No new dependencies. |
| Dev Constraints: File structure | PASS | New files in `src/components/` and `src/lib/` per convention. |
| Dev Constraints: API security | PASS | No API data exposed. Calculator estimate is a client-side computed value, not from Flask API. |

**Gate result: ALL PASS — no violations.**

## Project Structure

### Documentation (this feature)

```text
specs/002-ga4-fb-pixel/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Analytics.tsx         # NEW — GA4 + FB Pixel script injection (server component)
├── lib/
│   └── analytics.ts          # NEW — event helper functions (gtag, fbq wrappers)
├── components/
│   ├── ContactForm.tsx       # MODIFIED — add contact_submit + Contact events
│   ├── WhatsAppButton.tsx    # MODIFIED — add onClick handler for whatsapp_click event
│   ├── Calculator.tsx        # MODIFIED — add calculator_complete event on result step
│   └── BookingForm.tsx       # MODIFIED — add booking_submit + Lead events
└── app/
    └── [locale]/
        └── layout.tsx        # MODIFIED — import and render <Analytics />
```

**Structure Decision**: Follows existing project conventions. `Analytics.tsx` is a server component placed in `src/components/`. `analytics.ts` is a utility module in `src/lib/` providing type-safe, guarded event helper functions imported by the 4 client components that need tracking.

## Design Decisions

### D1: Analytics Component Architecture

**Decision**: Create a server component `Analytics.tsx` that conditionally renders `<Script>` tags based on environment variables.

**Rationale**: Server components can read environment variables at render time without hydration cost. The `next/script` component with `strategy="afterInteractive"` ensures scripts load after the page is interactive, meeting performance requirements (FR-010, Constitution IV).

**Alternatives rejected**:
- Client component with `useEffect`: Adds unnecessary hydration cost and client bundle size.
- Inline scripts in `layout.tsx`: Clutters the layout; harder to maintain and test independently.

### D2: Centralized Event Helper Module

**Decision**: Create `src/lib/analytics.ts` with guarded helper functions (`trackGA4Event`, `trackFBEvent`) that check for global `gtag`/`fbq` existence before calling.

**Rationale**: Guards prevent runtime errors when ad blockers prevent script loading (FR-009). Centralizing event logic avoids duplicating guard checks across 4+ components. Type-safe function signatures prevent typos in event names/parameters.

**Alternatives rejected**:
- Inline `window.gtag?.()` calls in each component: Error-prone, repetitive, harder to maintain.
- React context provider: Overkill for fire-and-forget event calls with no state management needs.

### D3: WhatsApp Button Click Tracking

**Decision**: Add an `onClick` handler to the existing `<motion.a>` element that fires the tracking event synchronously before the browser navigates to the WhatsApp URL.

**Rationale**: The WhatsApp link opens in a new tab (`target="_blank"`), so the current page stays alive and the tracking request completes. No need for `navigator.sendBeacon` or `e.preventDefault()`.

**Alternatives rejected**:
- `navigator.sendBeacon`: Unnecessary complexity since navigation doesn't destroy the page.
- `e.preventDefault()` + manual `window.open()`: Breaks the natural link behavior and accessibility.

### D4: Calculator Event Timing

**Decision**: Fire `calculator_complete` event when the calculator transitions to the `"result"` step, capturing the computed estimate total as a parameter.

**Rationale**: The result step is the definitive completion signal. The estimate value is available as client-side state at that point. No Flask API data is exposed (Constitution: API security).

### D5: No New Translation Keys

**Decision**: No translation keys needed for this feature.

**Rationale**: Analytics tracking is entirely invisible to users — no UI text, labels, or messages are added. This avoids unnecessary changes to `ar.json` and `en.json`.

## Component Interaction Flow

```text
Layout (server)
  └── <Analytics /> (server component)
        ├── [if NEXT_PUBLIC_GA_ID] → <Script> gtag.js + config
        └── [if NEXT_PUBLIC_FB_PIXEL_ID] → <Script> FB Pixel init + PageView

ContactForm (client) ──→ import { trackEvent } from '@/lib/analytics'
  └── on success: trackEvent('contact_submit') + trackFBEvent('Contact')

WhatsAppButton (client) ──→ import { trackEvent } from '@/lib/analytics'
  └── onClick: trackEvent('whatsapp_click', { page: pathname })

Calculator (client) ──→ import { trackEvent } from '@/lib/analytics'
  └── on step==="result": trackEvent('calculator_complete', { estimate: total })

BookingForm (client) ──→ import { trackEvent } from '@/lib/analytics'
  └── on success: trackEvent('booking_submit') + trackFBEvent('Lead')
```

## Environment Variables

| Variable | Format | Example | Required |
|----------|--------|---------|----------|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | `G-ABC123DEF4` | Optional |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Numeric string | `1234567890` | Optional |

Both are optional. If empty or missing, their respective scripts are not loaded and no errors occur.
