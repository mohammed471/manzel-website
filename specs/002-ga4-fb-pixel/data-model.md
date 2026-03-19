# Data Model: Google Analytics 4 & Facebook Pixel Integration

**Branch**: `002-ga4-fb-pixel` | **Date**: 2026-03-19

## Overview

This feature has no persistent data model — all tracking data is fire-and-forget, sent to external services (GA4 and Facebook Pixel). This document defines the event schemas and configuration entities.

## Entities

### Tracking Configuration

Environment-variable-driven. Read at server render time by the `Analytics` component.

| Attribute | Type | Source | Required |
|-----------|------|--------|----------|
| GA4 Measurement ID | String (`G-XXXXXXXXXX`) | `NEXT_PUBLIC_GA_ID` env var | Optional |
| Facebook Pixel ID | Numeric string | `NEXT_PUBLIC_FB_PIXEL_ID` env var | Optional |

**Rules**:
- If value is empty string, `undefined`, or missing → corresponding script is NOT rendered
- No format validation at application level (provider handles silently)

### GA4 Custom Events

Events sent via `window.gtag('event', eventName, params)`.

| Event Name | Parameters | Trigger Point | Component |
|------------|-----------|---------------|-----------|
| `contact_submit` | None | Contact form success | ContactForm.tsx |
| `whatsapp_click` | `{ page: string }` | WhatsApp button click | WhatsAppButton.tsx |
| `calculator_complete` | `{ estimate: number }` | Calculator reaches result step | Calculator.tsx |
| `booking_submit` | None | Booking form success | BookingForm.tsx |

### Facebook Pixel Events

Events sent via `window.fbq('track', eventName)` or `window.fbq('trackCustom', eventName)`.

| Event Name | Type | Trigger Point | Component |
|------------|------|---------------|-----------|
| `PageView` | Standard | Automatic on script init | Analytics.tsx |
| `Contact` | Standard | Contact form success | ContactForm.tsx |
| `Lead` | Standard | Booking form success | BookingForm.tsx |

**Note**: `whatsapp_click` and `calculator_complete` are GA4-only events. Facebook Pixel does not have corresponding standard events for these actions, and custom events are not needed for the initial implementation.

## State Transitions

No stateful entities. All events are fire-and-forget:

```
User Action → Helper Function → Guard Check → Send to Provider (or no-op if blocked)
```

## Relationships

```
Analytics Component (server)
  ├── reads → NEXT_PUBLIC_GA_ID
  ├── reads → NEXT_PUBLIC_FB_PIXEL_ID
  └── renders → <Script> tags (conditional)

Analytics Utility (lib)
  ├── exports → trackGA4Event()
  ├── exports → trackFBEvent()
  └── guards → window.gtag / window.fbq existence

Client Components (4)
  └── import → Analytics Utility → call helpers on user actions
```
