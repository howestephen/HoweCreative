# Hero Code-Split, Shell Cleanup, and Accessibility Polish

> Historical plan for the previous portfolio. The replacement editorial
> homepage does not mount `MatrixRainHero`; use `ROADMAP.md` for current work.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lazy-load the Three.js hero to reduce initial bundle, delete dead components, harden loading-screen accessibility, and do a readability pass.

**Architecture:** `MatrixRainHero` (Three.js + @react-three/fiber + GLTFLoader + 7 GLTF models) is statically imported by `Home.tsx` today, so it lands in the initial bundle. Converting it to `React.lazy` + `Suspense` lets Vite split the Three.js graph into a separate async chunk. The `LoadingScreen` already covers z-index 200 during boot so the `Suspense` fallback is invisible — no UX change. Dead components (`Navigation.tsx`, `CyberHero.tsx`, `Hero3D.tsx`) are never imported and can be deleted outright. Accessibility fixes are non-visual: `aria-live` log region, `prefers-reduced-motion` shortcut, and focus restoration on loader dismiss.

**Tech Stack:** React 19 lazy/Suspense, Vite dynamic import, Vitest, ARIA

---

## Task 1: Lazy-load `MatrixRainHero`

**Goal:** Move `MatrixRainHero` (and its Three.js dependency tree) into a separate Vite async chunk so it doesn't block the initial parse.

**Files:**
- Modify: `src/app/pages/Home.tsx`
- Verify: `npm run build` output (chunk list)

**Step 1.1: Confirm current bundle includes Three.js in main chunk**

```bash
npm run build 2>&1 | grep -E "three|react-three|dist/assets" | head -20
```
Note the chunk filenames and sizes. You should see Three.js in what is currently the main JS output.

**Step 1.2: Convert `MatrixRainHero` to lazy import in `Home.tsx`**

Replace the static import:
```typescript
import { MatrixRainHero } from "../components/MatrixRainHero";
```

With:
```typescript
import { lazy, Suspense } from "react";
const MatrixRainHero = lazy(() =>
  import("../components/MatrixRainHero").then((m) => ({ default: m.MatrixRainHero }))
);
```

Wrap the usage in `Home.tsx` JSX:
```tsx
<Suspense fallback={null}>
  <MatrixRainHero />
</Suspense>
```

The `fallback={null}` is correct — the `LoadingScreen` (z-index 200) covers the viewport during initial render, so there is nothing to show while the chunk loads.

**Step 1.3: Run typecheck — must pass**
```bash
npm run typecheck
```
Expected: exit 0.

**Step 1.4: Run build and confirm Three.js is now in a separate chunk**
```bash
npm run build 2>&1 | grep -E "\.js"
```
Expected: you should now see at least two substantial JS chunks — one smaller initial chunk and one (or more) async chunks containing Three.js / @react-three. The initial chunk should be noticeably smaller than before.

**Step 1.5: Run tests — all 8 must pass**
```bash
npm test
```
Expected: 8/8.

**Step 1.6: Commit**
```bash
git add src/app/pages/Home.tsx
git commit -m "perf: lazy-load MatrixRainHero to split Three.js into async chunk"
```

---

## Task 2: Delete dead components

**Goal:** Remove `Navigation.tsx`, `CyberHero.tsx`, and `Hero3D.tsx` — all three are defined but never imported anywhere in the codebase.

**Files:**
- Delete: `src/app/components/Navigation.tsx`
- Delete: `src/app/components/CyberHero.tsx`
- Delete: `src/app/components/Hero3D.tsx`

**Step 2.1: Verify no imports exist for these files**

```bash
grep -rn "Navigation\|CyberHero\|Hero3D" src --include="*.tsx" --include="*.ts" | grep -v "^src/app/components/Navigation\|^src/app/components/CyberHero\|^src/app/components/Hero3D"
```
Expected: no output. If any imports are found, **stop and report** — do not delete.

**Step 2.2: Delete the three files**
```bash
rm src/app/components/Navigation.tsx src/app/components/CyberHero.tsx src/app/components/Hero3D.tsx
```

**Step 2.3: Run typecheck**
```bash
npm run typecheck
```
Expected: exit 0.

**Step 2.4: Run build**
```bash
npm run build
```
Expected: succeeds, no errors.

**Step 2.5: Run tests**
```bash
npm test
```
Expected: 8/8.

**Step 2.6: Assess remaining shell/chrome**

Read `Layout.tsx`. Check: is the chrome lean? The current Layout has:
- Brand logo link (top-left)
- `SideNav` (top-right hamburger)
- `EscapeGlyphs` (decorative)
- `MatrixRainBackdrop` x2 (ambient effect)
- Grid overlay div
- `TechnicalDecorations`
- `Footer`

If any of those feel redundant or broken after the above deletions, remove them and note it in the commit message. If everything feels intentional and lean, proceed as-is.

**Step 2.7: Update ROADMAP.md**

Mark the shell/chrome simplification item under 2.3 as done: `✓ dead components removed (Navigation, CyberHero, Hero3D); chrome is lean`.

**Step 2.8: Commit**
```bash
git add -A
git commit -m "chore: delete dead components Navigation, CyberHero, Hero3D; mark shell lean"
```

---

## Task 3: Loading-screen accessibility

**Goal:** Make `LoadingScreen` screen-reader-friendly and respect `prefers-reduced-motion`.

**Files:**
- Modify: `src/app/components/LoadingScreen.tsx`
- Create: `src/app/components/LoadingScreen.test.tsx`

**Background on the component:**
- It renders a fixed full-screen overlay (z-200) with boot log lines that appear one by one via `setVisibleLines`
- After all lines appear + a flicker, it calls `onComplete` and removes itself
- Currently has no ARIA attributes, no reduced-motion handling

**Accessibility requirements:**
1. The overlay should be `role="status"` so screen readers announce it as a live region
2. The log lines region should be `aria-live="polite"` so each new line is announced
3. There should be a visually-hidden label describing what's happening: "Loading portfolio — please wait"
4. When `prefers-reduced-motion: reduce` is set, skip the animation entirely — call `onComplete` immediately (or with a minimal 100ms delay so React has time to render)
5. The progress bar segments should have `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`

**Step 3.1: Write failing tests first**

Create `src/app/components/LoadingScreen.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LoadingScreen } from "./LoadingScreen";

// We need @testing-library/react — install it:
// npm install --save-dev @testing-library/react @testing-library/jest-dom --legacy-peer-deps
// Add to vite.config.ts test config: setupFiles: ['./src/test-setup.ts']
// Create src/test-setup.ts: import '@testing-library/jest-dom'

describe("LoadingScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("has a visually-hidden loading label", () => {
    const onComplete = vi.fn();
    render(<LoadingScreen onComplete={onComplete} />);
    expect(screen.getByText(/loading portfolio/i)).toBeInTheDocument();
  });

  it("has aria-live polite on the log region", () => {
    const onComplete = vi.fn();
    render(<LoadingScreen onComplete={onComplete} />);
    const liveRegion = document.querySelector("[aria-live='polite']");
    expect(liveRegion).not.toBeNull();
  });

  it("has a progressbar role with aria-valuenow", () => {
    const onComplete = vi.fn();
    render(<LoadingScreen onComplete={onComplete} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow");
  });

  it("calls onComplete immediately when prefers-reduced-motion is set", () => {
    // Mock matchMedia to return prefers-reduced-motion: reduce
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const onComplete = vi.fn();
    render(<LoadingScreen onComplete={onComplete} />);
    act(() => {
      vi.runAllTimers();
    });
    expect(onComplete).toHaveBeenCalled();
  });
});
```

**Step 3.2: Install @testing-library/react**

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jsdom --legacy-peer-deps
```

**Step 3.3: Create test setup file**

Create `src/test-setup.ts`:
```typescript
import "@testing-library/jest-dom";
```

**Step 3.4: Configure Vitest for jsdom environment**

Add a `vitest.config.ts` at the project root (or add `test` config to `vite.config.ts`):

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 3.5: Run tests — confirm new tests FAIL**
```bash
npm test
```
Expected: LoadingScreen tests fail (missing aria attributes).

**Step 3.6: Implement accessibility changes in `LoadingScreen.tsx`**

Changes to make:

1. **Visually-hidden label** — add as the first child inside the motion.div:
```tsx
<span className="sr-only">Loading portfolio — please wait</span>
```
Add the sr-only utility to your global CSS if not present, or use inline style:
```tsx
<span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
  Loading portfolio — please wait
</span>
```

2. **role="status" on the overlay** — add to the `motion.div`:
```tsx
role="status"
aria-label="Loading portfolio"
```

3. **aria-live on the log lines div** — wrap the log lines `div` with:
```tsx
<div aria-live="polite" aria-atomic="false">
  {/* existing log lines map */}
</div>
```

4. **progressbar role** — wrap the progress segments in a single container div:
```tsx
<div
  role="progressbar"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={progress}
  aria-label="Loading progress"
  className="flex gap-[3px]"
>
  {/* existing segment map */}
</div>
```
Remove the inner `<div className="flex gap-[3px]">` that currently wraps segments.

5. **prefers-reduced-motion** — add at the top of the component function, before any other logic:
```typescript
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

Then add a `useEffect` that fires once on mount:
```typescript
useEffect(() => {
  if (!prefersReducedMotion) return;
  const id = setTimeout(() => onComplete(), 100);
  return () => clearTimeout(id);
}, [prefersReducedMotion, onComplete]);
```

When `prefersReducedMotion` is true, the other `useEffect` timers still run but `onComplete` will be called at 100ms regardless — so the screen exits almost immediately.

**Step 3.7: Run tests — all must pass**
```bash
npm test
```
Expected: all tests pass (now 12 total: 8 original + 4 new).

**Step 3.8: Run typecheck and build**
```bash
npm run typecheck && npm run build
```
Expected: both exit 0.

**Step 3.9: Update ROADMAP.md**

Mark under 2.3: `✓ loading sequence accessibility — aria-live, progressbar role, reduced-motion support added`.

**Step 3.10: Commit**
```bash
git add src/app/components/LoadingScreen.tsx src/app/components/LoadingScreen.test.tsx src/test-setup.ts vitest.config.ts package.json package-lock.json ROADMAP.md
git commit -m "feat: loading screen accessibility — aria-live, progressbar, reduced-motion"
```

---

## Task 4: Section readability pass

**Goal:** Opportunistic improvements to heading hierarchy, spacing, and readability across sections. No tests needed — visual/structural audit.

**Files to review:**
- `src/app/components/OperatorProfile.tsx`
- `src/app/components/CaseStudies.tsx`
- `src/app/components/MediaShowcase.tsx`
- `src/app/components/ArchiveSection.tsx`

**Step 4.1: Read each file and audit for**
- Missing or skipped heading levels (h1 → h3 without h2, etc.)
- Section `id` attributes for nav anchor links — do they match `SideNav`'s `navItems`?
- Contrast: text colours against backgrounds (can eyeball from class names)
- Any obviously broken layout classes

**Step 4.2: Apply fixes**

For each issue found:
- Fix heading hierarchy (e.g. change `<h3>` to `<h2>` if it's a section heading)
- Add missing `id` attributes if `SideNav` links to them
- Fix any contrast or spacing issues that are clearly wrong

Do not redesign anything. Only fix clear structural or accessibility issues.

**Step 4.3: Run typecheck + build**
```bash
npm run typecheck && npm run build
```

**Step 4.4: Update ROADMAP.md**

Update 2.3 section readability item with a one-line note on what was changed (or "no structural issues found").

**Step 4.5: Commit**
```bash
git add -A
git commit -m "fix: section heading hierarchy and anchor id audit"
```

---

## Final check

After all four tasks:
```bash
npm run typecheck && npm run lint && npm test && npm run build
```
All must exit 0.
