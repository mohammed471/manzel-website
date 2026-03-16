# Tasks: Premium Splash Screen

**Input**: Design documents from `/specs/001-premium-splash-screen/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted. Verification is via Build-Test-Verify cycle (constitution requirement).

**Organization**: Tasks grouped by user story. US1 and US2 share implementation (session check and splash display are the same component logic) so they are combined in Phase 2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add theme tokens and translations that the splash component depends on

- [x] T001 [P] Add `--color-splash-bg: #1B4F72` and `--color-splash-gold: #D4AF37` to `@theme` block in `src/app/globals.css`
- [x] T002 [P] Add `splash` namespace with keys `brand_name`, `tagline`, `skip_hint` to `src/messages/ar.json` — values: `"منزل"`, `"شريكك في البناء والتصميم"`, `"اضغط للتخطي"`
- [x] T003 [P] Add `splash` namespace with keys `brand_name`, `tagline`, `skip_hint` to `src/messages/en.json` — values: `"منزل"`, `"Your Partner in Construction & Design"`, `"Tap to skip"`

**Checkpoint**: Theme tokens available as Tailwind utilities (`bg-splash-bg`, `text-splash-gold`). Translation keys accessible via `useTranslations("splash")`.

---

## Phase 2: User Story 1 + 2 — Core Splash Screen (Priority: P1) MVP

**Goal**: Display a full animated splash screen on first session visit (US1) and skip it on subsequent visits (US2). These stories are inseparable — the sessionStorage check that enables US1 (show splash) is the same logic that enables US2 (don't show splash).

**Independent Test (US1)**: Open website in fresh browser session → splash appears with logo reveal, tagline, progress bar, circular-reveal exit over ~3 seconds.

**Independent Test (US2)**: After seeing splash, refresh page or navigate to another page → no splash appears. Close browser, reopen → splash appears again.

### Implementation

- [x] T004 [US1] Create `src/components/SplashScreen.tsx` as client component with basic structure: `"use client"` directive, useState for `show` (initial: `false`) and `phase` (initial: `0`), useEffect with sessionStorage check — if `splashShown` flag exists set `show` to `false`, otherwise set `show` to `true` and start animation timers. Wrap return in Framer Motion `AnimatePresence`.
- [x] T005 [US1] Add Phase 0 (logo reveal) animation in `src/components/SplashScreen.tsx`: render brand name "منزل" using `useTranslations("splash")` `brand_name` key, centered vertically and horizontally on the splash overlay. Animate with Framer Motion `motion.div`: initial `opacity: 0, scale: 0.8`, animate to `opacity: 1, scale: 1` over 1 second with easeOut. Add gold glow effect using `box-shadow` with `splash-gold` color token, animated from `0 0 0px` to `0 0 60px 20px` splash-gold. Use Tajawal font at 64–80px size, font-weight 800, white color.
- [x] T006 [US1] Add Phase 1 (tagline reveal) animation in `src/components/SplashScreen.tsx`: below the logo, render localized tagline using `t("tagline")`. Split tagline into words and animate each word sequentially with Framer Motion staggerChildren (0.1s delay per word). Each word: initial `opacity: 0, y: 10`, animate to `opacity: 0.85, y: 0`. Font size 18–20px, font-weight 400, white color.
- [x] T007 [US1] Add Phase 2 (loading indicator) animation in `src/components/SplashScreen.tsx`: render a thin (3px) horizontal progress bar at bottom of splash, positioned with `bottom: 48px`. Gold color (`splash-gold`). Animate width from `0%` to `100%` over 0.7s with easeInOut using Framer Motion `motion.div` animate prop. Bar should be centered with max-width ~200px.
- [x] T008 [US1] Add Phase 3 (exit animation) in `src/components/SplashScreen.tsx`: when phase reaches 3, animate the entire splash overlay's `clipPath` from `circle(150% at 50% 40%)` to `circle(0% at 50% 40%)` over 0.7s with easeInOut using Framer Motion `exit` prop on the outer `motion.div`. On animation complete, call `setShow(false)`, set `sessionStorage.setItem("splashShown", "true")`, and restore `document.body.style.overflow = ""`.
- [x] T009 [US1] Add background geometric decorations in `src/components/SplashScreen.tsx`: render 4–6 absolute-positioned SVG elements (hexagons, diamonds, small circles) at low opacity (0.05–0.1) around the edges of the overlay. Each shape gets a slow independent Framer Motion `animate` with `rotate: [0, 360]` and subtle `x`/`y` drift, `repeat: Infinity`, `duration: 15–25s`. Use white or splash-gold color with `stroke` only (no fill). Keep shapes simple to ensure performance.
- [x] T010 [US1] [US2] Add tap-to-skip handler in `src/components/SplashScreen.tsx`: attach `onClick` to the splash overlay container. On click/tap, immediately set `phase` to `3` (triggers exit animation). Ensure sessionStorage flag is set and body overflow is restored on skip. Add `cursor: pointer` to the overlay and an `aria-label` using `t("skip_hint")` for accessibility.
- [x] T011 [US1] [US2] Add scroll lock in `src/components/SplashScreen.tsx`: in the useEffect that starts the animation, set `document.body.style.overflow = "hidden"`. In the cleanup function and in the exit completion handler, set `document.body.style.overflow = ""`. Wrap sessionStorage access in try-catch for graceful degradation when sessionStorage is unavailable.
- [x] T012 [US1] Integrate SplashScreen in `src/app/[locale]/layout.tsx`: import `SplashScreen` and render it inside `NextIntlClientProvider` as the first child, before the existing Navbar and content wrapper. The component is self-managing (handles its own show/hide state).

**Checkpoint**: Full splash animation works on first visit, does not appear on refresh/navigation. Tap anywhere to skip. Session state persisted. Body scroll locked during splash.

---

## Phase 3: User Story 3 — Reduced Motion Support (Priority: P2)

**Goal**: Visitors with `prefers-reduced-motion: reduce` enabled skip the splash entirely.

**Independent Test**: Enable "Reduce motion" in OS settings or browser dev tools → load site in new session → page content appears immediately with no splash, no animations.

### Implementation

- [x] T013 [US3] Add reduced motion detection in `src/components/SplashScreen.tsx`: in the main useEffect, before starting animation timers, check `window.matchMedia("(prefers-reduced-motion: reduce)").matches`. If true, immediately set `show` to `false`, set `sessionStorage.setItem("splashShown", "true")`, and return without starting any timers or setting body overflow. This ensures zero animation for reduced-motion users.

**Checkpoint**: Reduced motion users see no splash, no delay. Session flag still set correctly.

---

## Phase 4: User Story 4 — Mobile Responsive (Priority: P2)

**Goal**: Splash screen displays correctly on all viewport sizes from 320px to 2560px.

**Independent Test**: Open site in browser responsive mode at 320px, 375px, 768px, 1280px, 2560px → logo and tagline centered, no overflow or clipping, animations smooth.

### Implementation

- [x] T014 [US4] Add responsive sizing in `src/components/SplashScreen.tsx`: use Tailwind responsive classes for logo text size (`text-5xl md:text-6xl lg:text-7xl`), tagline size (`text-base md:text-lg lg:text-xl`), progress bar max-width (`max-w-[120px] md:max-w-[200px]`), and geometric shape positions. Ensure all content uses `flex items-center justify-center` for centering. Add `px-4` padding to prevent edge clipping on narrow viewports. Verify geometric shapes are positioned with percentage-based values so they scale with viewport.

**Checkpoint**: Splash renders correctly at all target viewport widths. No overflow, clipping, or misalignment.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, quality gates, and final validation

- [x] T015 Run `npm run build` — must complete with 0 errors. Fix any TypeScript, import, or translation errors discovered.
- [x] T016 Run `npm run lint` — must pass with no new warnings or errors. Fix any linting issues.
- [ ] T017 Visual verification in browser: test splash in `/ar` (Arabic tagline, RTL layout) and `/en` (English tagline, LTR layout). Confirm both locales display correctly.
- [ ] T018 Visual verification: confirm no layout shift when splash exits — page content should not jump or reflow.
- [ ] T019 Visual verification: test on mobile viewport (320px, 375px) — confirm responsive behavior.
- [ ] T020 Functional verification: confirm splash does NOT reappear on page refresh or navigation within same session.
- [ ] T021 Functional verification: open new incognito window — confirm splash appears again (new session).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately. All 3 tasks run in parallel.
- **US1+US2 (Phase 2)**: Depends on Phase 1 completion (needs theme tokens and translations).
- **US3 (Phase 3)**: Depends on Phase 2 completion (modifies the component created in Phase 2).
- **US4 (Phase 4)**: Depends on Phase 2 completion (modifies the component created in Phase 2). Can run in parallel with Phase 3.
- **Polish (Phase 5)**: Depends on all previous phases.

### User Story Dependencies

- **US1 + US2 (P1)**: Core splash. No dependencies on other stories. This IS the MVP.
- **US3 (P2)**: Adds a single early-return check in the component created by US1. Independent of US4.
- **US4 (P2)**: Adds responsive Tailwind classes to the component created by US1. Independent of US3.

### Within Phase 2 (US1+US2)

```
T004 (skeleton) → T005 (logo) → T006 (tagline) → T007 (progress bar) → T008 (exit) → T009 (decorations)
                                                                                           ↓
T010 (skip handler) depends on T008 (exit animation existing)
T011 (scroll lock) depends on T004 (base useEffect existing)
T012 (layout integration) depends on T004 (component file existing)
```

T012 (layout integration) can run as soon as T004 creates the component file — the component self-manages its rendering. However, it's most useful to integrate after T008 so the full animation is testable.

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 — all parallel (different files)
- **Phase 3 + Phase 4**: US3 (T013) and US4 (T014) can run in parallel (different concerns in the same file, but non-overlapping code regions)
- **Phase 5**: T017–T021 are sequential verification steps

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks in parallel (different files):
Task: "Add splash color tokens to src/app/globals.css"
Task: "Add splash namespace to src/messages/ar.json"
Task: "Add splash namespace to src/messages/en.json"
```

## Parallel Example: Phase 3 + 4

```bash
# These modify different sections of SplashScreen.tsx and can conceptually run in parallel:
Task: "Add reduced motion detection in src/components/SplashScreen.tsx (early return in useEffect)"
Task: "Add responsive Tailwind classes in src/components/SplashScreen.tsx (className adjustments)"
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (3 tasks, all parallel)
2. Complete Phase 2: US1+US2 Core Splash (9 tasks, mostly sequential)
3. **STOP and VALIDATE**: Run `npm run build`, test splash in both locales
4. Deploy/demo if ready — splash works with full animation and session bypass

### Incremental Delivery

1. Phase 1 + Phase 2 → Core splash working → Build gate (**MVP!**)
2. Add Phase 3 (US3) → Reduced motion support → Build gate
3. Add Phase 4 (US4) → Mobile responsive polish → Build gate
4. Phase 5 → Full verification across all scenarios

### Single Developer Flow

1. T001+T002+T003 in parallel → Setup done
2. T004 through T012 sequentially → Core splash done, test it
3. T013 → Reduced motion done
4. T014 → Responsive done
5. T015 through T021 → All gates passed

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 share implementation — the sessionStorage check serves both stories simultaneously
- No test tasks generated (not explicitly requested) — verification via Build-Test-Verify cycle per constitution
- Commit after each phase completion for clean git history
- The splash component is entirely self-contained — layout integration (T012) is a single import + render
