# Feature Specification: Premium Splash Screen

**Feature Branch**: `001-premium-splash-screen`
**Created**: 2026-03-16
**Status**: Draft
**Input**: User description: "Add a premium splash/loading screen with animated brand reveal that displays on first visit per browser session, featuring logo animation, tagline reveal, loading indicator, and an impressive exit transition."

## Clarifications

### Session 2026-03-16

- Q: Should the splash tagline adapt to the visitor's locale or remain Arabic-only? → A: Localized — show English tagline for `/en` visitors, Arabic tagline for `/ar` visitors.
- Q: Should visitors be able to skip the splash animation? → A: Yes — tap/click anywhere immediately triggers the exit animation and marks session as shown.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time Session Brand Introduction (Priority: P1)

A visitor opens the Manzel website for the first time in their browser session. Before the main content appears, they are greeted with a premium full-screen brand introduction that showcases the Manzel identity through an animated sequence: the logo reveals itself with a subtle glow effect, followed by the company tagline appearing, a brief loading indicator, and then an impressive transition that unveils the website content beneath.

**Why this priority**: This is the core feature — the splash screen itself. Without it, nothing else in this specification matters. It establishes brand presence and creates a premium first impression that differentiates Manzel from competitors.

**Independent Test**: Can be fully tested by opening the website in a fresh browser session and observing the animated brand introduction sequence from start to finish.

**Acceptance Scenarios**:

1. **Given** a visitor has not seen the splash screen in their current browser session, **When** they navigate to any page on the website, **Then** a full-screen branded overlay appears covering the entire viewport with an animated sequence lasting approximately 3 seconds.
2. **Given** the splash screen is displaying, **When** the animation sequence completes all phases (logo reveal, tagline, loading indicator, exit), **Then** the overlay transitions away to reveal the fully loaded page content underneath without any layout shift.
3. **Given** the splash screen is visible, **When** the visitor tries to scroll, **Then** scrolling is prevented until the splash screen completes and exits.
4. **Given** the splash screen is visible during any animation phase, **When** the visitor taps or clicks anywhere on the overlay, **Then** the exit animation triggers immediately, the session state is recorded as shown, and the page content is revealed.

---

### User Story 2 - Returning Session Visitor Bypass (Priority: P1)

A visitor who has already seen the splash screen during their current browser session navigates to another page or refreshes the current page. They should NOT see the splash screen again — they go directly to the page content with zero delay.

**Why this priority**: Equal priority to the splash itself — showing the splash on every page load or refresh would be extremely annoying and drive users away. Session-scoped display is essential for usability.

**Independent Test**: Can be tested by loading the site (seeing the splash), then refreshing or navigating to another page and confirming no splash appears.

**Acceptance Scenarios**:

1. **Given** a visitor has already seen the splash screen in their current session, **When** they refresh the page, **Then** the page loads normally without any splash overlay.
2. **Given** a visitor has already seen the splash screen in their current session, **When** they navigate to a different page on the website, **Then** no splash screen appears.
3. **Given** a visitor closes their browser and reopens it (new session), **When** they visit the website, **Then** the splash screen appears again.

---

### User Story 3 - Accessibility: Reduced Motion Support (Priority: P2)

A visitor who has enabled "reduce motion" in their operating system or browser preferences visits the website for the first time in their session. Instead of seeing the full animated sequence, the splash screen is either skipped entirely or shown very briefly without animations, respecting their accessibility preferences.

**Why this priority**: Important for accessibility compliance and inclusive design. Users who enable reduced motion often have vestibular disorders or motion sensitivity — animated sequences can cause discomfort or nausea.

**Independent Test**: Can be tested by enabling "prefers-reduced-motion: reduce" in OS settings or browser dev tools and loading the site in a new session.

**Acceptance Scenarios**:

1. **Given** a visitor has "prefers-reduced-motion: reduce" enabled, **When** they visit the website for the first time in their session, **Then** the splash screen is either skipped entirely or displays a static version briefly (under 0.5 seconds) before revealing the page.
2. **Given** a visitor has reduced motion enabled, **When** the page loads, **Then** no scaling, sliding, particle, or shimmer animations are played.

---

### User Story 4 - Mobile Responsive Experience (Priority: P2)

A visitor accesses the website on a mobile device or narrow viewport. The splash screen adapts to the smaller screen, with appropriately sized text, centered elements, and animations that perform smoothly without jank on mobile hardware.

**Why this priority**: A significant portion of the target audience (Karbala, Iraq region) accesses the web primarily via mobile devices. A splash screen that looks broken or stutters on mobile would create a negative first impression.

**Independent Test**: Can be tested by loading the site on a mobile device or using browser responsive mode at various viewport sizes (320px, 375px, 768px).

**Acceptance Scenarios**:

1. **Given** a visitor is on a mobile device with a viewport width of 320px or wider, **When** the splash screen displays, **Then** all content (logo, tagline, loading indicator) is fully visible, centered, and does not overflow or get clipped.
2. **Given** a visitor is on a tablet or desktop, **When** the splash screen displays, **Then** the content scales appropriately and maintains visual balance.

---

### Edge Cases

- What happens if the visitor navigates away during the splash animation? The splash state should still be recorded so it does not replay on return.
- What happens if the browser does not support sessionStorage (e.g., private browsing in some older browsers)? The splash should still display and function — it simply may replay on each page load as a graceful degradation.
- What happens if the page behind the splash takes longer than 3 seconds to load? The splash exits on its timer regardless — the page loads independently behind the overlay.
- What happens if the visitor's device has very low performance? The animation should be lightweight enough to run smoothly on mid-range mobile devices (target: 30fps minimum).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a full-screen branded overlay on the visitor's first page load within a browser session.
- **FR-002**: System MUST NOT display the splash screen on subsequent page loads or navigations within the same browser session.
- **FR-003**: System MUST remember splash display state per browser session (not permanently — a new session triggers the splash again).
- **FR-004**: The splash screen MUST present the Manzel brand identity through a multi-phase animated sequence: logo reveal with glow effect, locale-appropriate tagline appearance, loading indicator, and exit transition.
- **FR-013**: The splash screen tagline MUST be localized — Arabic tagline for `/ar` visitors, English tagline for `/en` visitors. The brand name "منزل" remains Arabic in both locales.
- **FR-014**: The splash screen MUST allow visitors to skip the animation by tapping or clicking anywhere on the overlay. Skipping immediately triggers the exit animation and records the session state as shown.
- **FR-005**: The total splash screen duration MUST be approximately 3 seconds from appearance to full exit.
- **FR-006**: The splash screen MUST prevent page scrolling while visible and restore scrolling after exit.
- **FR-007**: The splash screen exit MUST reveal the page content underneath without any visible layout shift or content jump.
- **FR-008**: System MUST respect the visitor's "prefers-reduced-motion" accessibility preference by skipping or minimizing animations.
- **FR-009**: The splash screen MUST be fully responsive, displaying correctly on viewports from 320px width to large desktop screens.
- **FR-010**: The page content MUST load behind/underneath the splash screen — the splash MUST NOT delay the actual page load.
- **FR-011**: The splash screen MUST use the Manzel brand colors: primary dark background, white text, and gold accent elements.
- **FR-012**: The splash screen MUST include subtle background decorative elements (geometric shapes or particles) that enhance the premium feel without overwhelming the brand content.

### Key Entities

- **Splash Session State**: Whether the splash has been shown in the current browser session (boolean flag, session-scoped).
- **Animation Phase**: The current phase of the splash animation sequence (logo reveal, tagline, loading, exit) — determines what content is visible and what transitions are active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of first-time session visitors see the complete splash screen animation sequence before accessing page content.
- **SC-002**: 0% of returning session visitors (same browser session) see the splash screen on subsequent page loads.
- **SC-003**: The splash screen completes its full animation and exits within 3.5 seconds on all supported devices.
- **SC-004**: No visible layout shift or content jump occurs when the splash screen exits (Cumulative Layout Shift impact: 0).
- **SC-005**: The splash screen renders correctly and remains usable on viewports from 320px to 2560px width.
- **SC-006**: Visitors with "prefers-reduced-motion" enabled experience no animated transitions — page content is accessible within 0.5 seconds.
- **SC-007**: The splash animation runs at 30fps or higher on mid-range mobile devices, with no visible jank or stutter.
- **SC-008**: The underlying page begins loading simultaneously with the splash display — splash does not add to total page load time.

## Assumptions

- The splash screen is session-scoped (not permanent) — using browser session storage is the appropriate scope. A "session" ends when the browser tab/window is closed.
- The splash displays on any page entry point, not just the home page — if a visitor's first visit in a session lands on `/products`, they still see the splash.
- The animation phases are sequential (logo first, then tagline, then loading indicator, then exit) — not simultaneous.
- The gold accent color (#D4AF37) is acceptable as a brand accent alongside the existing Manzel color palette.
- The primary background color for the splash is the brand's dark green (#153C38) or the user-specified #1B4F72 — the user explicitly specified #1B4F72 in the requirements, so that takes precedence.
- The splash screen brand name "منزل" is always in Arabic. The tagline is localized: Arabic ("شريكك في البناء والتصميم") for `/ar` visitors, English equivalent for `/en` visitors.
- Mid-range mobile devices are defined as devices from 2022 or newer with at least 3GB RAM.
