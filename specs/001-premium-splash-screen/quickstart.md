# Quickstart: Premium Splash Screen

**Feature**: 001-premium-splash-screen
**Date**: 2026-03-16

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install`)
- Flask backend running at `localhost:5000` (needed for `npm run build` — product pages fetch data at build time)

## Files to Create

| File | Type | Purpose |
|------|------|---------|
| `src/components/SplashScreen.tsx` | Client component | Full splash screen with animation phases, session check, skip handler |

## Files to Modify

| File | Change | Purpose |
|------|--------|---------|
| `src/app/globals.css` | Add `--color-splash-bg` and `--color-splash-gold` to `@theme` block | New color tokens for splash |
| `src/app/[locale]/layout.tsx` | Add `<SplashScreen />` inside `NextIntlClientProvider`, before main content | Integration point |
| `src/messages/ar.json` | Add `"splash"` namespace with `brand_name`, `tagline`, `skip_hint` | Arabic translations |
| `src/messages/en.json` | Add `"splash"` namespace with `brand_name`, `tagline`, `skip_hint` | English translations |

## Build Order

1. **Add theme tokens** in `globals.css` — no dependencies
2. **Add translations** in both `ar.json` and `en.json` — no dependencies
3. **Create `SplashScreen.tsx`** — depends on theme tokens and translations existing
4. **Integrate in `layout.tsx`** — depends on SplashScreen component existing
5. **Build gate**: `npm run build` — must pass with 0 errors
6. **Lint gate**: `npm run lint` — must pass with no new warnings
7. **Visual verification**: Check `/ar` and `/en` in browser

## Verification Checklist

- [ ] `npm run build` passes with 0 errors
- [ ] `npm run lint` passes with no new warnings
- [ ] First visit in fresh session: splash appears with full animation
- [ ] Refresh same page: no splash (session remembered)
- [ ] Navigate to different page: no splash
- [ ] New incognito window: splash appears again
- [ ] Tap/click during animation: splash exits immediately
- [ ] Test on `/ar` route: Arabic tagline shown
- [ ] Test on `/en` route: English tagline shown
- [ ] Mobile viewport (320px): content centered, no overflow
- [ ] Enable `prefers-reduced-motion`: splash skipped entirely
- [ ] No layout shift when splash exits
- [ ] Dark mode toggle after splash: no visual conflicts

## Key Design Decisions

- **Exit animation**: Circular reveal via `clip-path: circle()` — shrinks from full coverage to nothing, centered on the logo position
- **Session state**: `sessionStorage` (not localStorage) — clears on tab close
- **Reduced motion**: Skip splash entirely (most respectful approach)
- **Initial render**: `show` starts as `false`, set to `true` in useEffect after sessionStorage check (avoids hydration mismatch)
- **Layout integration**: Inside `NextIntlClientProvider` for translation access, fixed overlay with z-index 9999
