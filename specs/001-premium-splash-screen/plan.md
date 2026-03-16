# Implementation Plan: Premium Splash Screen

**Branch**: `001-premium-splash-screen` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-premium-splash-screen/spec.md`

## Summary

Add a premium animated splash screen that displays once per browser session on the visitor's first page load. The splash presents the Manzel brand identity through a phased animation sequence (logo reveal → localized tagline → progress bar → circular-reveal exit). Uses Framer Motion for all animations, sessionStorage for session-scoped state, and next-intl for bilingual tagline. Visitors can tap/click anywhere to skip. Respects `prefers-reduced-motion`.

## Technical Context

**Language/Version**: TypeScript, Next.js 16 (App Router)
**Primary Dependencies**: Framer Motion ^12.36.0 (pre-approved), next-intl (existing), Tailwind CSS v4 (existing)
**Storage**: Browser sessionStorage (session-scoped boolean flag)
**Testing**: `npm run build` (zero errors), `npm run lint`, visual verification in `/ar` and `/en`
**Target Platform**: Web browsers (responsive 320px–2560px)
**Project Type**: Web application (Next.js SSR/SSG with client-side interactivity)
**Performance Goals**: 30fps+ animations on mid-range mobile, CLS impact 0, splash exits within 3.5s
**Constraints**: RTL/LTR support via logical properties, prefers-reduced-motion respect, Framer Motion only (no new animation libraries), no client-side data fetching
**Scale/Scope**: 1 new client component, 1 layout integration point, 1 new translation namespace, 2 new theme colors in globals.css

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality & Type Safety | PASS | SplashScreen requires `"use client"` (justified: useState, useEffect, sessionStorage, Framer Motion). Logical properties used. New colors (#1B4F72, #D4AF37) added to `@theme` in globals.css. All text via translation keys. |
| II. Testing Standards | PASS | Build-Test-Verify cycle required. New `splash` namespace added to both ar.json and en.json. No images to verify (text-based logo). |
| III. User Experience Consistency | PASS | Visual parity: tagline localized per locale. Dark mode: splash has own fixed background (#1B4F72), independent of dark mode toggle. Responsive: 320px–2560px. Font consistency: automatic via `[lang]` CSS selectors. |
| IV. Performance Requirements | PASS | No data fetching. Framer Motion pre-approved. No new libraries. CLS target 0 (fixed overlay removed cleanly). No ISR needed. |
| V. Bilingual Integrity | PASS | New `splash` namespace with brand name + tagline in both locales. Brand name "منزل" stays Arabic in both. Locale accessed via next-intl inside NextIntlClientProvider. |
| Development Constraints | PASS | All within approved stack. Component in `src/components/`. Translations in `src/messages/`. Theme in `globals.css`. |

**Gate result: ALL PASS — no violations.**

## Project Structure

### Documentation (this feature)

```text
specs/001-premium-splash-screen/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: data model (minimal — sessionStorage only)
├── quickstart.md        # Phase 1: developer quickstart
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css                     # MODIFY: add splash color tokens + keyframes to @theme
│   └── [locale]/
│       └── layout.tsx                  # MODIFY: integrate SplashScreen inside NextIntlClientProvider
├── components/
│   └── SplashScreen.tsx                # CREATE: client component — full splash screen
└── messages/
    ├── ar.json                         # MODIFY: add "splash" namespace
    └── en.json                         # MODIFY: add "splash" namespace
```

**Structure Decision**: Single new component (`SplashScreen.tsx`) integrated into the existing root layout. No new directories or architectural changes needed. The splash renders inside `NextIntlClientProvider` to access locale translations, positioned as a fixed overlay with z-index 9999.

## Complexity Tracking

> No constitution violations detected. No justifications needed.
