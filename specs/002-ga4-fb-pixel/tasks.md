# Tasks: Google Analytics 4 & Facebook Pixel Integration

**Input**: Design documents from `/specs/002-ga4-fb-pixel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested. Build-Test-Verify cycle per Constitution II is the validation method.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the analytics utility module and environment variable configuration that all user stories depend on.

- [x] T001 [P] Create analytics event helper module with TypeScript type declarations and guarded `trackGA4Event` / `trackFBEvent` functions in `src/lib/analytics.ts`
- [x] T002 [P] Add `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_FB_PIXEL_ID` to `.env.local` (empty values for dev)

---

## Phase 2: User Story 1 + User Story 2 — Automatic Page View Tracking & Conditional Script Loading (Priority: P1) MVP

**Goal**: GA4 and Facebook Pixel scripts load conditionally based on environment variables, automatically track page views on every page in both locales.

**Independent Test**: Visit any page → check Network tab → GA4 and FB Pixel requests appear when env vars are set. Remove env vars → no scripts loaded, no errors. Run `npm run build` → zero errors in both cases.

### Implementation

- [x] T003 [US1] Create `Analytics` server component that conditionally renders GA4 `<Script>` tags (gtag.js loader + config) when `NEXT_PUBLIC_GA_ID` is set in `src/components/Analytics.tsx`
- [x] T004 [US1] Add Facebook Pixel `<Script>` tags (base code + init + PageView) to `Analytics` component when `NEXT_PUBLIC_FB_PIXEL_ID` is set in `src/components/Analytics.tsx`
- [x] T005 [US2] Import and render `<Analytics />` component in the root layout in `src/app/[locale]/layout.tsx`
- [x] T006 [US1] Run `npm run build` to verify zero errors with env vars set and with env vars empty
- [x] T007 [US1] Verify in browser: visit `/ar` and `/en`, confirm GA4 and FB Pixel scripts load in Network tab (when env vars set) and do not load (when env vars empty)

**Checkpoint**: Page views are automatically tracked. Scripts load conditionally. Build passes. MVP complete.

---

## Phase 3: User Story 3 — Custom Event Tracking (Priority: P2)

**Goal**: Key business actions fire custom events to GA4 and Facebook Pixel.

**Independent Test**: Perform each action (contact submit, WhatsApp click, calculator complete, booking submit) → verify corresponding events appear in GA4 DebugView / FB Pixel Helper.

### Implementation

- [x] T008 [P] [US3] Add `trackGA4Event('contact_submit')` and `trackFBEvent('Contact')` on successful form submission in `src/components/ContactForm.tsx`
- [x] T009 [P] [US3] Add `onClick` handler to WhatsApp `<motion.a>` that calls `trackGA4Event('whatsapp_click', { page: pathname })` in `src/components/WhatsAppButton.tsx`
- [x] T010 [P] [US3] Add `trackGA4Event('calculator_complete', { estimate: total })` when step transitions to `"result"` in `src/components/Calculator.tsx`
- [x] T011 [P] [US3] Add `trackGA4Event('booking_submit')` and `trackFBEvent('Lead')` on successful form submission in `src/components/BookingForm.tsx`
- [x] T012 [US3] Run `npm run build` to verify zero errors after all event integrations
- [x] T013 [US3] Verify in browser: perform each tracked action, confirm events fire in Network tab / console

**Checkpoint**: All 4 custom events fire correctly. Build passes.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across both locales and edge cases.

- [x] T014 Verify both `/ar` and `/en` locales track page views and custom events identically
- [x] T015 Verify site works with no console errors when an ad blocker is active
- [x] T016 Run `npm run lint` and fix any new warnings or errors
- [x] T017 Final `npm run build` — confirm zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **User Story 1+2 (Phase 2)**: Depends on T001 (analytics utility) — T002 can run in parallel
- **User Story 3 (Phase 3)**: Depends on Phase 2 completion (scripts must be loading for events to work)
- **Polish (Phase 4)**: Depends on Phase 3 completion

### User Story Dependencies

- **User Story 1 (P1) — Page View Tracking**: Depends on T001 (analytics utility). Core MVP.
- **User Story 2 (P1) — Conditional Loading**: Implemented together with US1 in the same component. Same priority.
- **User Story 3 (P2) — Custom Events**: Depends on US1/US2 (scripts must be loaded for events to fire). All 4 event tasks (T008-T011) are independent of each other.

### Within Each Phase

- T001 and T002 are independent → parallel
- T003 and T004 are sequential (same file) → T003 first, then T004
- T005 depends on T003/T004 (component must exist before importing)
- T008, T009, T010, T011 are independent (different files) → all parallel

### Parallel Opportunities

```
Phase 1: T001 ║ T002                    (2 parallel)
Phase 2: T003 → T004 → T005 → T006     (sequential, same file dependencies)
Phase 3: T008 ║ T009 ║ T010 ║ T011     (4 parallel — different files)
Phase 4: T014 → T015 → T016 → T017     (sequential verification)
```

---

## Parallel Example: User Story 3

```bash
# Launch all custom event tasks together (different files, no dependencies):
Task: T008 "Add contact_submit + Contact events in src/components/ContactForm.tsx"
Task: T009 "Add whatsapp_click event in src/components/WhatsAppButton.tsx"
Task: T010 "Add calculator_complete event in src/components/Calculator.tsx"
Task: T011 "Add booking_submit + Lead events in src/components/BookingForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: US1+US2 (T003-T007)
3. **STOP and VALIDATE**: Page views tracked, scripts conditional, build passes
4. Deploy if ready — site now has basic analytics

### Full Delivery

1. Complete MVP above
2. Complete Phase 3: US3 (T008-T013) — custom events
3. Complete Phase 4: Polish (T014-T017) — cross-locale and edge case verification
4. All success criteria met

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are implemented together (same component, same priority)
- All Phase 3 event tasks can run as parallel agents (4 different component files)
- No new translation keys needed — analytics is invisible to users
- No new npm dependencies — uses built-in `next/script`
- Build verification (T006, T012, T017) must pass at each checkpoint per Constitution II
