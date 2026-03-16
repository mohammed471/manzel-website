# Research: Premium Splash Screen

**Feature**: 001-premium-splash-screen
**Date**: 2026-03-16

## R-001: Exit Animation Approach

**Decision**: Circular reveal via CSS `clip-path: circle()` animated by Framer Motion.

**Rationale**: Of the three candidates (curtain split, circular reveal, particle dissolve), circular reveal is the most visually premium and performant:
- Framer Motion 12 supports animating the `clipPath` CSS property as a string value, enabling smooth interpolation from `circle(150% at 50% 40%)` (fully visible) to `circle(0% at 50% 40%)` (gone).
- The circle origin point is centered horizontally and positioned at ~40% vertically (where the logo sits), creating an elegant shrinking effect that draws attention to the brand as it exits.
- Single DOM element animation — no extra children or particles needed.
- GPU-accelerated via composite layers on modern browsers.
- Works identically in RTL and LTR (no directional bias).

**Alternatives considered**:
- **Curtain split** (two halves slide apart): Simpler to implement but visually generic — common in basic templates. Requires managing two separate animated elements.
- **Particle dissolve** (break into scattered squares): Most visually complex but requires spawning 50–100+ DOM elements, risking jank on mid-range mobile devices (violates SC-007 30fps target). Also adds significant bundle complexity.
- **Slide-up with fade** (fallback): Clean and reliable but not "premium" — standard loading screen pattern. Reserved as a fallback if clip-path support is insufficient.

## R-002: Layout Integration Strategy

**Decision**: Render `SplashScreen` inside `NextIntlClientProvider` in the root layout, as a sibling before the main content wrapper.

**Rationale**:
- The splash needs `useTranslations("splash")` for the localized tagline, which requires being inside `NextIntlClientProvider`.
- Rendering as a fixed overlay (position: fixed, inset: 0, z-index: 9999) means it visually covers everything without disrupting the DOM flow of page content beneath.
- Using `AnimatePresence` with a conditional render (`show` state) ensures clean mount/unmount with exit animations.
- The page content loads and renders behind the overlay simultaneously — no blocking. When the splash exits, the fully rendered page is already there.
- Session check happens in `useEffect` on mount — during SSR, the splash component renders nothing (avoids hydration mismatch with sessionStorage).

**Alternatives considered**:
- **Outside NextIntlClientProvider**: Simpler but splash cannot access translations. Would require hardcoding Arabic text or passing translations as props from the server layout.
- **Separate layout wrapper component**: Over-engineering — adds an unnecessary abstraction layer for a single conditional component.
- **Portal to document.body**: Unnecessary complexity since the component is already at the root layout level.

## R-003: Background Decoration Approach

**Decision**: Floating geometric shapes using absolute-positioned SVG elements with slow Framer Motion rotation/drift animations.

**Rationale**:
- 4–6 simple geometric shapes (hexagons, diamonds, circles) at very low opacity (0.05–0.1) positioned around the edges of the splash screen.
- Each shape gets a slow, independent rotation and subtle translate animation (Framer Motion `animate` with `repeat: Infinity`).
- SVG elements are lightweight (no image downloads), scale perfectly at any resolution, and are GPU-composited.
- Keeping count low (4–6 shapes) and opacity minimal ensures the brand content (logo + tagline) remains the clear focal point.
- The existing `.bg-geometric` CSS class in globals.css uses a similar pattern (SVG data URI as background-image) — the splash approach is consistent with established project aesthetics.

**Alternatives considered**:
- **CSS-only pseudo-elements**: Limited to 2 elements per parent (::before, ::after). Not enough for 4–6 independent shapes.
- **Canvas/WebGL particles**: Overkill for subtle decoration. Adds significant bundle size and complexity. Performance risk on mobile.
- **CSS background-image pattern** (like existing `.bg-geometric`): Static only — no floating/drifting animation possible. Less premium feel.

## R-004: Session State Management

**Decision**: Use `sessionStorage.getItem('splashShown')` / `sessionStorage.setItem('splashShown', 'true')` with a try-catch for graceful degradation.

**Rationale**:
- `sessionStorage` is the correct scope — persists across page navigations within the same tab/window but clears on tab close (exactly matches spec's session definition).
- The check runs inside `useEffect` (client-side only) to avoid SSR/hydration issues.
- Try-catch handles browsers where sessionStorage is unavailable (some privacy modes) — on failure, splash simply shows every time (graceful degradation per edge case in spec).
- Initial `show` state is `false` (not `true`) to prevent flash-of-splash during hydration. The `useEffect` sets it to `true` only after confirming sessionStorage doesn't have the flag.

**Alternatives considered**:
- **localStorage**: Wrong scope — persists across sessions permanently. User would never see splash again after first visit.
- **Cookie**: Overly complex for a simple boolean flag. Requires server-side parsing if needed. Session cookies would work but add HTTP overhead.
- **React context/state only**: Loses state on page refresh within the same session (client-side navigation would work but hard refresh would replay splash).

## R-005: Reduced Motion Handling

**Decision**: When `prefers-reduced-motion: reduce` is active, skip the splash entirely — set session flag and don't render.

**Rationale**:
- The splash is purely decorative/branding — it contains no functional content the user needs.
- Showing a static version for 0.5s (as spec allows) adds little value and still briefly blocks content access.
- Skipping entirely is the most respectful approach for users who've explicitly opted out of motion.
- Detection via `window.matchMedia('(prefers-reduced-motion: reduce)')` in useEffect.
- Session flag is still set so the logic is consistent.

**Alternatives considered**:
- **Static splash for 0.5s**: Technically compliant with spec but delivers minimal brand value while still blocking content. The 0.5s delay feels arbitrary to users who want reduced motion.
- **Instant fade only**: A compromise, but even a simple fade is still an animation the user opted out of.

## R-006: New Color Tokens

**Decision**: Add `--color-splash-bg: #1B4F72` and `--color-splash-gold: #D4AF37` to the `@theme` block in globals.css.

**Rationale**:
- The spec explicitly requires #1B4F72 as the splash background (differs from project primary #153C38) and #D4AF37 as gold accent.
- Adding them as named tokens in `@theme` follows the CSS-first theming convention (Constitution Principle I).
- Tokens are scoped with `splash-` prefix to avoid confusion with existing brand colors.
- Enables Tailwind utility classes: `bg-splash-bg`, `text-splash-gold`, etc.

**Alternatives considered**:
- **Inline hex values**: Works but violates CSS-first theming convention. Harder to maintain if colors change.
- **Override existing tokens**: Dangerous — #1B4F72 is visually different from #153C38. Changing `primary` would break the entire site.

## R-007: Translation Namespace Design

**Decision**: New `splash` namespace with keys: `brand_name`, `tagline`, `skip_hint`.

**Rationale**:
- Follows the project convention of one namespace per feature area.
- `brand_name`: "منزل" (Arabic in both locales — brand identity stays Arabic per clarification, but having it as a translation key allows future flexibility).
- `tagline`: "شريكك في البناء والتصميم" (ar) / "Your Partner in Construction & Design" (en) — localized per clarification.
- `skip_hint`: Not displayed visually but available for screen readers as an aria-label on the overlay.
- Minimal keys — splash is a simple component with very little text.

**Alternatives considered**:
- **Reuse `brand` namespace**: The existing `brand` namespace has `name` and `tagline` keys but the splash tagline may differ from the general brand tagline. Separate namespace avoids coupling.
- **No translations (hardcoded)**: Violates Constitution Principle I (no hardcoded strings) and Principle V (bilingual integrity).
