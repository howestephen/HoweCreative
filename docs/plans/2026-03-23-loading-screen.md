# Loading Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a full-screen boot-sequence loading screen that shows once per page load, matching the site's operator/terminal aesthetic, then fades out to reveal the app.

**Architecture:** A `LoadingScreen` component holds all state internally. It's mounted inside `Layout.tsx` and renders as a fixed full-screen overlay (`z-[200]`). It runs its own timed sequence (log lines stagger in, segmented progress bar fills, `SYSTEM READY` flickers, then Framer Motion exits). On `onAnimationComplete`, parent state is set to hide it.

**Tech Stack:** React, Framer Motion (`motion/react`), Tailwind CSS, Lucide icons (already installed)

---

### Task 1: Create `LoadingScreen.tsx`

**Files:**
- Create: `src/app/components/LoadingScreen.tsx`

**Step 1: Create the component file with static structure**

```tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TerminalSquare } from "lucide-react";

const LOG_LINES = [
  "INITIALIZING OPERATOR PROFILE...",
  "LOADING ASSET MANIFEST...",
  "ESTABLISHING SECURE CHANNEL...",
  "MOUNTING INTERFACE MODULES...",
  "SYSTEM READY",
];

const TOTAL_SEGMENTS = 24;

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [flickering, setFlickering] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Stagger log lines + progress
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOG_LINES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
          setProgress(Math.round(((i + 1) / LOG_LINES.length) * 100));
        }, 300 + i * 320),
      );
    });

    // Flicker SYSTEM READY
    const flickerStart = 300 + (LOG_LINES.length - 1) * 320 + 100;
    [0, 120, 240, 360].forEach((offset, i) => {
      timers.push(
        setTimeout(() => setFlickering(i % 2 === 0), flickerStart + offset),
      );
    });

    // Exit
    timers.push(
      setTimeout(() => setExiting(true), flickerStart + 500 + 300),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const filledSegments = Math.round((progress / 100) * TOTAL_SEGMENTS);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: "easeIn" }}
          onAnimationComplete={() => {
            if (exiting) onComplete();
          }}
          className="fixed inset-0 z-[200] flex flex-col bg-[#050505] px-8 py-8 font-mono md:px-16 md:py-12"
        >
          {/* Scan-line overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 4px)",
            }}
          />

          {/* Red radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 85%, rgba(255,0,60,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Top label */}
          <div className="relative z-10 text-[10px] uppercase tracking-[0.22em] text-[#ff003c]/60">
            HOWE_CREATIVE / v2.0
          </div>

          {/* Log lines — vertically centred */}
          <div className="relative z-10 flex flex-1 flex-col justify-center gap-3">
            {LOG_LINES.slice(0, visibleLines).map((line, i) => {
              const isLast = i === visibleLines - 1;
              const isReady = line === "SYSTEM READY";
              const dimmed = isReady && flickering;
              return (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: dimmed ? 0.2 : 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-[#ff003c]">&gt;</span>
                  <span
                    className={
                      isReady
                        ? "text-[#ff003c]"
                        : "text-zinc-400"
                    }
                  >
                    {line}
                  </span>
                  {isLast && !isReady && (
                    <span
                      className={`text-[#ff003c] ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                    >
                      _
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-[3px]">
                {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      backgroundColor:
                        i < filledSegments ? "#ff003c" : "rgba(255,0,60,0.12)",
                      boxShadow:
                        i < filledSegments
                          ? "0 0 6px rgba(255,0,60,0.7)"
                          : "none",
                    }}
                    transition={{ duration: 0.15 }}
                    className="h-3 w-3"
                  />
                ))}
              </div>
              <span className="w-10 text-right text-[11px] tabular-nums text-[#ff003c]">
                {progress}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              <TerminalSquare className="h-3 w-3 text-[#ff003c]/50" />
              <span>BOOT SEQUENCE</span>
            </div>
          </div>

          {/* Bottom label */}
          <div className="relative z-10 mt-4 text-right text-[10px] uppercase tracking-[0.18em] text-zinc-700">
            EST. 2018 / SYD AU
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

**Step 2: Verify the file was created**

```bash
ls src/app/components/LoadingScreen.tsx
```
Expected: file exists

**Step 3: Commit**

```bash
git add src/app/components/LoadingScreen.tsx
git commit -m "feat: add LoadingScreen boot sequence component"
```

---

### Task 2: Wire `LoadingScreen` into `Layout.tsx`

**Files:**
- Modify: `src/app/components/Layout.tsx`

The `LoadingScreen` overlays everything, so it mounts inside `Layout` with a `show` state gate.

**Step 1: Add state and import to `Layout.tsx`**

At the top of `Layout.tsx`, add:
```tsx
import { useState } from "react";
import { LoadingScreen } from "./LoadingScreen";
```

**Step 2: Add `show` state inside the `Layout` function**

```tsx
const [showLoader, setShowLoader] = useState(true);
```

**Step 3: Render `LoadingScreen` as the first child inside the root div**

Add immediately after the opening `<div className="relative min-h-screen ...">`:
```tsx
{showLoader && <LoadingScreen onComplete={() => setShowLoader(false)} />}
```

**Step 4: Run the dev server and confirm**

```bash
npm run dev
```

Open `http://localhost:5173`. You should see the loading screen run its full sequence (~2.2s) and then fade out to reveal the site.

**Step 5: Commit**

```bash
git add src/app/components/Layout.tsx
git commit -m "feat: mount LoadingScreen in Layout"
```

---

### Task 3: Final polish pass + push

**Step 1: Check for any console errors or layout issues**

Open browser DevTools. There should be no errors. The loader should appear full-screen with no scrollbars visible underneath it.

**Step 2: Verify on mobile viewport**

Resize to 375px wide. Log lines should be readable, progress bar should fit.

**Step 3: Commit & push**

```bash
git add -A
git push origin main
```
