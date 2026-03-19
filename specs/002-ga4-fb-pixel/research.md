# Research: Google Analytics 4 & Facebook Pixel Integration

**Branch**: `002-ga4-fb-pixel` | **Date**: 2026-03-19

## R1: GA4 Script Loading in Next.js App Router

**Decision**: Use `next/script` with `strategy="afterInteractive"` for the gtag.js loader and inline config script.

**Rationale**: `afterInteractive` loads scripts after the page becomes interactive (after hydration), ensuring no impact on LCP or INP. This is the recommended strategy for analytics scripts per Next.js documentation. The `beforeInteractive` strategy would block hydration — inappropriate for analytics. The `lazyOnload` strategy delays loading until browser idle, risking missed early page views.

**Alternatives considered**:
- `beforeInteractive`: Blocks page hydration. Violates Constitution IV (Performance Requirements).
- `lazyOnload`: May miss initial page view events if the browser doesn't reach idle quickly.
- Custom `useEffect` loading: Adds hydration cost, requires client component, more complex.

## R2: Facebook Pixel Script Loading

**Decision**: Use `next/script` with `strategy="afterInteractive"` for the Facebook Pixel base code, with `fbq('init', PIXEL_ID)` and `fbq('track', 'PageView')` in an inline script.

**Rationale**: Same performance rationale as GA4. Facebook Pixel's standard implementation uses an inline script that defines the `fbq` function, initializes with the pixel ID, and fires the initial `PageView` event. The `noscript` fallback image tag is included for non-JavaScript environments.

**Alternatives considered**:
- React-specific FB Pixel libraries (e.g., `react-facebook-pixel`): Adds a dependency for trivial functionality. The standard pixel code is ~10 lines and well-documented.

## R3: Ad Blocker Resilience Pattern

**Decision**: All event helper functions check for the existence of `window.gtag` and `window.fbq` before calling them. Use optional chaining or existence checks — never try/catch for control flow.

**Rationale**: When ad blockers prevent GA4 or Facebook Pixel scripts from loading, `window.gtag` and `window.fbq` will be `undefined`. Attempting to call them throws a `ReferenceError`. A simple existence check (`typeof window.gtag === 'function'`) is the most performant and idiomatic guard. This satisfies FR-009 (no console errors when blocked).

**Pattern**:
```typescript
export function trackGA4Event(event: string, params?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}
```

**Alternatives considered**:
- try/catch wrapper: Works but adds overhead and obscures intent.
- Global error handler: Too broad; masks real errors.

## R4: SPA (Single Page Application) Page View Tracking

**Decision**: Rely on GA4's built-in SPA page view tracking via the `gtag('config', ...)` call which automatically detects History API changes. For Facebook Pixel, the initial `fbq('track', 'PageView')` fires on first load; subsequent SPA navigations are not re-tracked by default (standard FB Pixel behavior).

**Rationale**: GA4's gtag.js library has built-in support for detecting `pushState`/`replaceState` navigation events used by Next.js App Router. Manually firing page views on route change would cause double-counting. Facebook Pixel's standard behavior is to track only the initial page load; this is sufficient for conversion attribution and audience building.

**Alternatives considered**:
- Manual route change listeners via `usePathname()`: Risks double-counting with GA4's built-in tracking. More code, more bugs.
- Facebook Pixel SPA tracking via `fbq('track', 'PageView')` on each navigation: Non-standard, inflates page view counts, complicates attribution.

## R5: TypeScript Type Declarations for gtag and fbq

**Decision**: Declare `window.gtag` and `window.fbq` types in the analytics utility module using TypeScript's `declare global` pattern.

**Rationale**: Both `gtag` and `fbq` are injected globally by their respective scripts. TypeScript doesn't know about them by default, causing type errors. Declaring them in the utility module keeps types co-located with usage and avoids a separate `.d.ts` file for two declarations.

**Pattern**:
```typescript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
```

## R6: Existing Component Modification Strategy

**Decision**: Minimal modifications to existing components — add a single import and 1-2 function calls at the appropriate event points.

**Findings from codebase analysis**:

| Component | File | Modification Point | Change |
|-----------|------|-------------------|--------|
| ContactForm | `src/components/ContactForm.tsx` | Inside `handleSubmit` success branch | Add `trackGA4Event('contact_submit')` + `trackFBEvent('Contact')` |
| WhatsAppButton | `src/components/WhatsAppButton.tsx` | Add `onClick` prop to `<motion.a>` | Add `onClick` handler calling `trackGA4Event('whatsapp_click', { page })` |
| Calculator | `src/components/Calculator.tsx` | Inside the `useEffect` that fires when `step === "result"` | Add `trackGA4Event('calculator_complete', { estimate })` |
| BookingForm | `src/components/BookingForm.tsx` | Inside `handleSubmit` success branch | Add `trackGA4Event('booking_submit')` + `trackFBEvent('Lead')` |

**Key observations**:
- All 4 components are already client components (`"use client"`), so importing the analytics utility is safe.
- WhatsApp button uses `target="_blank"`, so the current page survives navigation — no beacon needed.
- Calculator has a `useEffect` triggered on `step === "result"` which is the ideal hook point.
- Contact and Booking forms both have clear success branches in their `handleSubmit` functions.

## R7: Environment Variable Validation

**Decision**: Check for non-empty string values at render time in the `Analytics` server component. No format validation of the tracking IDs.

**Rationale**: Format validation (e.g., regex for `G-XXXXXXXXXX`) adds complexity without benefit — if the ID format is wrong, the provider's script will silently fail to track, which is acceptable behavior. The spec's edge case explicitly states: "scripts load but tracking silently fails on the provider side — no site errors should occur."

**Alternatives considered**:
- Regex validation with console warning: Helpful for debugging but adds code for a rare scenario. The GA4 debug view and FB Pixel Helper browser extension serve this purpose better.
