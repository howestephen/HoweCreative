# Loading Screen Design

**Date:** 2026-03-23
**Status:** Approved

## Overview

A full-screen boot sequence loading screen that matches the site's operator/terminal aesthetic. Black background, `#ff003c` red, mono font, scan-line overlay. Shown once per page load, dismissed automatically after ~2.2s.

## Visual Structure

```
┌─────────────────────────────────────────┐
│  [top-left]  HOWE_CREATIVE / v2.0       │  ← mono, dim red
│                                         │
│   > INITIALIZING OPERATOR PROFILE...   │
│   > LOADING ASSET MANIFEST...          │  ← lines stagger in
│   > ESTABLISHING SECURE CHANNEL...     │     one every ~300ms
│   > MOUNTING INTERFACE MODULES...      │
│   > SYSTEM READY                       │  ← flickers before done
│                                         │
│  ████████████████████░░░░░░  87%       │  ← segmented red bar
│                                         │
│  [bottom-right]  EST. 2018 / SYD AU    │  ← mono, dim
└─────────────────────────────────────────┘
```

## Components

- **`src/app/components/LoadingScreen.tsx`** — standalone component
- Mounted in `App.tsx`, conditionally rendered via `useState(true)` until dismissed

## Behaviour

- **Duration:** ~2.2s total
- **Log lines:** 5 lines stagger in, one every ~300ms
- **Progress bar:** Segmented `█` blocks, fills proportionally with each line, glows red
- **Exit:** Framer Motion `opacity: 0` + `y: -8` over 0.4s, then `onAnimationComplete` sets `show = false`
- **One-shot:** Component state only — no localStorage

## Visual Flare

- Scan-line overlay (same `repeating-linear-gradient` pattern used site-wide)
- Faint `#ff003c` radial glow centered low on screen
- `>` prefix on each log line in red, body text in `zinc-400`
- `SYSTEM READY` line flickers 2–3 times before bar completes
- Blinking cursor `_` appended to the active line

## Log Lines Copy

```
> INITIALIZING OPERATOR PROFILE...
> LOADING ASSET MANIFEST...
> ESTABLISHING SECURE CHANNEL...
> MOUNTING INTERFACE MODULES...
> SYSTEM READY
```

## Exit Sequence

1. Bar reaches 100%
2. `SYSTEM READY` flickers 2–3×
3. 300ms pause
4. Full overlay fades out (`opacity: 0`, `y: -8`, 400ms)
5. Component unmounts
