# Feature Specification: Google Analytics 4 & Facebook Pixel Integration

**Feature Branch**: `002-ga4-fb-pixel`
**Created**: 2026-03-19
**Status**: Draft
**Input**: User description: "Add Google Analytics 4 & Facebook Pixel tracking with custom events for contact, WhatsApp, calculator, and booking actions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Page View Tracking (Priority: P1)

As a marketing team member, I want every page visit on the Manzel website to be automatically tracked by both Google Analytics 4 and Facebook Pixel so that I can measure traffic volume, visitor demographics, and acquisition channels across both Arabic and English versions of the site.

**Why this priority**: Page view tracking is the foundational analytics capability. Without it, no other marketing insights are possible. This is the minimum viable analytics integration.

**Independent Test**: Can be fully tested by visiting any page on the site (e.g., `/ar`, `/en/products`) and confirming tracking requests appear in the browser Network tab for both GA4 and Facebook Pixel.

**Acceptance Scenarios**:

1. **Given** GA4 and Facebook Pixel environment variables are configured, **When** a visitor loads any page on the site, **Then** a GA4 page view event and a Facebook Pixel PageView event are sent automatically.
2. **Given** the visitor navigates between pages (e.g., from Home to Products), **When** each new page loads, **Then** a new page view event is recorded for each navigation.
3. **Given** the visitor switches between Arabic (`/ar`) and English (`/en`) versions, **When** a page loads in either locale, **Then** the page view is tracked correctly regardless of language direction.

---

### User Story 2 - Conditional Script Loading (Priority: P1)

As the site owner, I want the analytics scripts to only load when their respective environment variables are provided, so that no unnecessary scripts are loaded in development or if a tracking service is not yet configured.

**Why this priority**: Equally critical as P1 — loading third-party scripts without valid IDs causes errors and degrades performance. This safeguard ensures the integration is production-safe from day one.

**Independent Test**: Can be fully tested by removing or leaving empty the GA4/Facebook Pixel environment variables and confirming no tracking scripts appear in the page source or Network tab.

**Acceptance Scenarios**:

1. **Given** both `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_FB_PIXEL_ID` are set, **When** a page loads, **Then** both GA4 and Facebook Pixel scripts are present in the page.
2. **Given** `NEXT_PUBLIC_GA_ID` is set but `NEXT_PUBLIC_FB_PIXEL_ID` is empty or missing, **When** a page loads, **Then** only the GA4 script is present — no Facebook Pixel script or errors.
3. **Given** neither environment variable is set, **When** a page loads, **Then** no analytics scripts are loaded and no console errors occur.
4. **Given** environment variables are set, **When** the site is built (`npm run build`), **Then** the build completes with zero errors.

---

### User Story 3 - Custom Event Tracking for Key Business Actions (Priority: P2)

As a marketing team member, I want key business interactions (contact form submissions, WhatsApp clicks, calculator completions, and booking submissions) to be tracked as custom events in both GA4 and Facebook Pixel, so that I can measure conversion rates and optimize marketing campaigns.

**Why this priority**: Custom events transform raw traffic data into actionable business intelligence. They enable conversion tracking, audience building, and campaign optimization — but they depend on the base tracking (P1) being in place first.

**Independent Test**: Can be tested by performing each tracked action (submitting the contact form, clicking WhatsApp, completing the calculator, submitting a booking) and verifying the corresponding event appears in GA4 Real-Time reports and Facebook Events Manager.

**Acceptance Scenarios**:

1. **Given** a visitor is on the contact page, **When** they successfully submit the contact form, **Then** a `contact_submit` event is sent to GA4 and a `Contact` standard event is sent to Facebook Pixel.
2. **Given** a visitor is on any page, **When** they click the WhatsApp button, **Then** a `whatsapp_click` event is sent to GA4 with the current page path as a parameter.
3. **Given** a visitor has used the area calculator, **When** they complete a calculation, **Then** a `calculator_complete` event is sent to GA4 with the estimated total as a parameter.
4. **Given** a visitor is on the booking page, **When** they successfully submit the booking form, **Then** a `booking_submit` event is sent to GA4 and a `Lead` standard event is sent to Facebook Pixel.

---

### Edge Cases

- What happens when the environment variable contains an invalid/malformed tracking ID? The scripts load but tracking silently fails on the provider side — no site errors should occur.
- What happens when a visitor has an ad blocker that blocks GA4 or Facebook Pixel? The site continues to function normally with no console errors or broken UI.
- What happens when custom events fire but the base tracking script failed to load (e.g., blocked by ad blocker)? Event calls should be guarded to prevent runtime errors.
- What happens during client-side navigation (Next.js soft navigation)? Page views should still be tracked for each route change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load the GA4 tracking script when the `NEXT_PUBLIC_GA_ID` environment variable is set to a non-empty value.
- **FR-002**: System MUST load the Facebook Pixel tracking script when the `NEXT_PUBLIC_FB_PIXEL_ID` environment variable is set to a non-empty value.
- **FR-003**: System MUST NOT load any tracking scripts when their respective environment variables are empty or missing.
- **FR-004**: System MUST automatically track page views on both GA4 and Facebook Pixel for every page load.
- **FR-005**: System MUST send a `contact_submit` event to GA4 and a `Contact` event to Facebook Pixel when the contact form is successfully submitted.
- **FR-006**: System MUST send a `whatsapp_click` event to GA4 (with the current page path) when the WhatsApp button is clicked.
- **FR-007**: System MUST send a `calculator_complete` event to GA4 (with the estimate total) when a calculator result is generated.
- **FR-008**: System MUST send a `booking_submit` event to GA4 and a `Lead` event to Facebook Pixel when the booking form is successfully submitted.
- **FR-009**: System MUST NOT cause console errors or UI degradation when tracking scripts are blocked by ad blockers.
- **FR-010**: System MUST NOT affect page load performance significantly — tracking scripts should load after the page is interactive.

### Key Entities

- **Tracking Configuration**: Environment-variable-driven settings that determine which analytics services are active (GA4 ID, Facebook Pixel ID).
- **Custom Event**: A named business action (contact_submit, whatsapp_click, calculator_complete, booking_submit) with optional parameters sent to one or both analytics platforms.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Page views from both Arabic and English site versions appear in GA4 Real-Time reports and Facebook Events Manager within 30 seconds of a visit.
- **SC-002**: All four custom events (contact_submit, whatsapp_click, calculator_complete, booking_submit) register correctly in GA4 when their corresponding actions are performed.
- **SC-003**: Facebook Pixel fires `Contact` and `Lead` standard events for contact and booking submissions respectively.
- **SC-004**: The site builds successfully (`npm run build` with zero errors) with analytics environment variables both present and absent.
- **SC-005**: No analytics-related console errors appear when visiting the site with an ad blocker enabled.
- **SC-006**: Page load performance (Largest Contentful Paint) is not degraded by more than 200ms after adding tracking scripts.

## Assumptions

- GA4 measurement ID follows the format `G-XXXXXXXXXX` and will be provided by the site owner before production deployment.
- Facebook Pixel ID is a numeric string and will be provided by the site owner before production deployment.
- The site already uses Next.js App Router with client/server component architecture, and tracking scripts will integrate via the existing layout structure.
- Ad blocker resilience means graceful degradation (no errors), not circumventing ad blockers.
- Client-side navigation page view tracking is handled natively by GA4's `gtag('config', ...)` which listens for history changes in single-page applications.
