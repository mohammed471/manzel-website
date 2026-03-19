# Quickstart: Google Analytics 4 & Facebook Pixel Integration

**Branch**: `002-ga4-fb-pixel` | **Date**: 2026-03-19

## Prerequisites

- Node.js and npm installed
- Manzel website project cloned and dependencies installed (`npm install`)
- Flask backend running (for `npm run build` to succeed on product pages)

## Setup

### 1. Environment Variables

Add to `.env.local` (create if it doesn't exist):

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=1234567890
```

Replace with your actual GA4 Measurement ID and Facebook Pixel ID. Both are optional — leave empty or omit to disable that tracking service.

### 2. Verify Integration

```bash
npm run dev
```

1. Open `http://localhost:3000/ar` in the browser
2. Open DevTools → Network tab
3. Filter by `google` and `facebook` to see script requests
4. If env vars are set, you should see:
   - `gtag/js?id=G-XXXXXXXXXX` request (GA4)
   - `tr/` requests to `facebook.com` (Pixel)

### 3. Verify Custom Events

| Action | Expected GA4 Event | Expected FB Pixel Event |
|--------|-------------------|------------------------|
| Submit contact form | `contact_submit` | `Contact` |
| Click WhatsApp button | `whatsapp_click` | — |
| Complete calculator | `calculator_complete` | — |
| Submit booking form | `booking_submit` | `Lead` |

Use GA4 DebugView (in Google Analytics dashboard) and Facebook Pixel Helper (Chrome extension) to verify events fire correctly.

### 4. Build Verification

```bash
npm run build
```

Must complete with zero errors, both with and without the env vars set.

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/components/Analytics.tsx` | Created | GA4 + FB Pixel script injection |
| `src/lib/analytics.ts` | Created | Event helper functions with guards |
| `src/app/[locale]/layout.tsx` | Modified | Import and render `<Analytics />` |
| `src/components/ContactForm.tsx` | Modified | Track contact form submission |
| `src/components/WhatsAppButton.tsx` | Modified | Track WhatsApp button clicks |
| `src/components/Calculator.tsx` | Modified | Track calculator completion |
| `src/components/BookingForm.tsx` | Modified | Track booking form submission |

## Troubleshooting

- **No scripts loading**: Check that `.env.local` has the correct variable names (must start with `NEXT_PUBLIC_`)
- **Console errors about gtag/fbq**: The analytics utility guards should prevent this. If seen, check that `src/lib/analytics.ts` has proper existence checks.
- **Events not appearing in GA4**: Use GA4 DebugView mode. Events may take up to 24 hours to appear in standard reports.
- **Events not appearing in FB Events Manager**: Use the Facebook Pixel Helper Chrome extension for real-time verification.
- **Ad blocker blocking scripts**: Expected behavior. The site should function normally with no errors.
