# Data Model: Premium Splash Screen

**Feature**: 001-premium-splash-screen
**Date**: 2026-03-16

## Overview

This feature has a minimal data model — no server-side entities, no database, no API. All state is client-side and ephemeral.

## Entities

### SplashSessionState

**Storage**: Browser `sessionStorage`
**Key**: `splashShown`
**Value**: `"true"` (string) when splash has been displayed, absent when not yet shown.
**Lifecycle**: Created when splash animation completes or is skipped. Cleared automatically when browser tab/window closes (sessionStorage scope).

| Attribute | Type | Description |
|-----------|------|-------------|
| splashShown | string ("true") or absent | Whether the splash has been shown this session |

**State transitions**:
```
[absent] → "true"    (splash completes animation OR user skips)
"true" → [absent]    (browser session ends — tab/window closed)
```

**Access pattern**: Read once on component mount (useEffect). Write once on splash exit. No subsequent reads within the same component lifecycle.

### AnimationPhase (component state)

**Storage**: React useState (in-memory, not persisted)
**Lifecycle**: Exists only while `SplashScreen` component is mounted. Advances through phases via setTimeout timers.

| Phase | Value | Duration | Content Shown |
|-------|-------|----------|---------------|
| logo | 0 | 0–1s | Logo fades in with scale + glow |
| tagline | 1 | 1–1.8s | Tagline appears word-by-word |
| loading | 2 | 1.8–2.5s | Gold progress bar animates |
| exit | 3 | 2.5–3.2s | Circular clip-path reveal shrinks |

**State transitions**:
```
logo (0) → tagline (1) → loading (2) → exit (3) → [unmounted]
                                                      ↑
Any phase ──────────────────── (user tap/click) ──────┘
```

## Translations (static data)

**Namespace**: `splash`
**Files**: `src/messages/ar.json`, `src/messages/en.json`

| Key | ar.json | en.json |
|-----|---------|---------|
| brand_name | منزل | منزل |
| tagline | شريكك في البناء والتصميم | Your Partner in Construction & Design |
| skip_hint | اضغط للتخطي | Tap to skip |

## Theme Tokens (static data)

**File**: `src/app/globals.css` (`@theme` block)

| Token | Value | Usage |
|-------|-------|-------|
| --color-splash-bg | #1B4F72 | Splash background |
| --color-splash-gold | #D4AF37 | Gold accents, progress bar, logo glow |
