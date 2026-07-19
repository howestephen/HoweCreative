# Roadmap Tasks 2.1–2.4 Implementation Plan

> Historical implementation record for the previous portfolio. These tasks are
> complete; use `ROADMAP.md` for the replacement editorial design’s current
> acceptance work.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete roadmap milestones 2.1 (rate limiting), 2.2 (ui/* purge), and 2.4 (lint/typecheck/CI) in sequence.

**Architecture:**
- Rate limiting uses an in-memory sliding-window store in the Vercel serverless function (no external deps — appropriate for a low-traffic personal portfolio; resets on cold start which is acceptable).
- UI purge removes the entire `src/app/components/ui/` directory and all associated Radix/shadcn packages — nothing outside that directory imports from it.
- Lint/typecheck adds `tsconfig.json` (strict), ESLint with `@typescript-eslint`, npm scripts, and a GitHub Actions CI workflow.

**Tech Stack:** Vitest (tests), TypeScript strict (typecheck), ESLint + @typescript-eslint (lint), GitHub Actions (CI), Vercel serverless (API)

---

## Task 1: Rate Limiting on `/api/contact`

### Codebase context
- API handler: `api/contact.ts` (Vercel serverless, Node.js)
- Already has: honeypot field, email validation, `EMAIL_ACCESS_KEY` env secret
- Missing: IP-based rate limiting
- No test framework exists yet — install Vitest first

**Files:**
- Create: `api/_lib/rate-limit.ts`
- Modify: `api/contact.ts`
- Create: `api/_lib/rate-limit.test.ts`
- Modify: `package.json` (add vitest, test script)

---

### Step 1.1: Install Vitest

```bash
npm install --save-dev vitest --legacy-peer-deps
```

### Step 1.2: Add test script to `package.json`

In `package.json` scripts, add:
```json
"test": "vitest run"
```

### Step 1.3: Write the failing rate-limiter test

Create `api/_lib/rate-limit.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests under the limit", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip)).toEqual({ allowed: true });
    }
  });

  it("blocks the 6th request from the same IP", () => {
    const ip = "2.2.2.2";
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("allows requests again after the window expires", () => {
    const ip = "3.3.3.3";
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip).allowed).toBe(false);
    vi.advanceTimersByTime(15 * 60 * 1000 + 1); // 15 min + 1ms
    expect(checkRateLimit(ip).allowed).toBe(true);
  });

  it("treats different IPs independently", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("10.0.0.1");
    expect(checkRateLimit("10.0.0.1").allowed).toBe(false);
    expect(checkRateLimit("10.0.0.2").allowed).toBe(true);
  });
});
```

### Step 1.4: Run test to confirm it fails

```bash
npm test
```
Expected: FAIL — `checkRateLimit` not found.

### Step 1.5: Implement the rate limiter

Create `api/_lib/rate-limit.ts`:

```typescript
type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

const store = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count < MAX_REQUESTS) {
    entry.count++;
    return { allowed: true };
  }

  const retryAfter = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
  return { allowed: false, retryAfter };
}
```

### Step 1.6: Run test to confirm it passes

```bash
npm test
```
Expected: all 4 tests PASS.

### Step 1.7: Write failing integration tests for contact handler rate limiting

Add to `api/_lib/rate-limit.test.ts` (or create `api/contact.test.ts`):

```typescript
// api/contact.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";

// We test the rate-limit integration by mocking the module
vi.mock("./_lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

import { checkRateLimit } from "./_lib/rate-limit";
import handler from "./contact";

function makeReq(body: object = {}) {
  return { method: "POST", body, headers: { "x-forwarded-for": "1.1.1.1" } };
}
function makeRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe("contact handler rate limiting", () => {
  it("returns 429 when rate limit exceeded", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfter: 300 });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("proceeds to validation when under limit", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    const res = makeRes();
    // Missing required fields → 400, not 429
    await handler(makeReq({ name: "", email: "", brief: "" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
```

### Step 1.8: Run to confirm fails

```bash
npm test api/contact.test.ts
```
Expected: FAIL — handler doesn't call `checkRateLimit`.

### Step 1.9: Integrate rate limiting into `api/contact.ts`

Add after the `METHOD` check and before `accessKey` check:

```typescript
import { checkRateLimit } from "./_lib/rate-limit";

// Inside handler, after method check:
const ip =
  (req.headers["x-forwarded-for"] as string ?? "").split(",")[0].trim() ||
  "unknown";
const limit = checkRateLimit(ip);
if (!limit.allowed) {
  res.setHeader("Retry-After", String(limit.retryAfter));
  return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
}
```

### Step 1.10: Run all tests — confirm pass

```bash
npm test
```
Expected: all tests PASS.

### Step 1.11: Update ROADMAP.md

Mark `2.1` rate limiting item as done. Update "Current Next Step" to point to Task 2.

### Step 1.12: Commit

```bash
git add api/_lib/rate-limit.ts api/_lib/rate-limit.test.ts api/contact.ts api/contact.test.ts package.json package-lock.json ROADMAP.md
git commit -m "feat: add IP rate limiting to /api/contact with Vitest tests"
```

---

## Task 2: ui/* Component Purge

### Codebase context
- `src/app/components/ui/` contains 50 files (shadcn/Radix generated components)
- **Zero imports** from this directory exist outside of it — confirmed by grep
- `lucide-react` IS used outside ui/ — keep it
- `clsx`, `tailwind-merge`, `class-variance-authority` are ONLY used inside ui/ — remove

**Packages to remove** (all only referenced from ui/):
```
@radix-ui/react-accordion
@radix-ui/react-alert-dialog
@radix-ui/react-aspect-ratio
@radix-ui/react-avatar
@radix-ui/react-checkbox
@radix-ui/react-collapsible
@radix-ui/react-context-menu
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-hover-card
@radix-ui/react-label
@radix-ui/react-menubar
@radix-ui/react-navigation-menu
@radix-ui/react-popover
@radix-ui/react-progress
@radix-ui/react-radio-group
@radix-ui/react-scroll-area
@radix-ui/react-select
@radix-ui/react-separator
@radix-ui/react-slider
@radix-ui/react-slot
@radix-ui/react-switch
@radix-ui/react-tabs
@radix-ui/react-toggle
@radix-ui/react-toggle-group
@radix-ui/react-tooltip
class-variance-authority
clsx
tailwind-merge
cmdk
embla-carousel-react
input-otp
vaul
recharts
react-resizable-panels
sonner
next-themes
```

**Files:**
- Delete: `src/app/components/ui/` (entire directory)
- Modify: `package.json`

---

### Step 2.1: Delete the entire ui/ directory

```bash
rm -rf src/app/components/ui/
```

### Step 2.2: Remove packages from `package.json`

Edit `package.json` dependencies — remove all packages listed above.

### Step 2.3: Reinstall

```bash
npm install --legacy-peer-deps
```

### Step 2.4: Run build to confirm no breakage

```bash
npm run build
```
Expected: build succeeds with no errors referencing ui/ components.

### Step 2.5: Run tests to confirm nothing broken

```bash
npm test
```
Expected: all tests still pass.

### Step 2.6: Update ROADMAP.md

Mark `2.2` bundle optimization item as done.

### Step 2.7: Commit

```bash
git add -A
git commit -m "chore: remove all unused ui/* shadcn components and 37 related packages"
```

---

## Task 3: Lint / Typecheck Pipeline

### Codebase context
- No `tsconfig.json` — Vite infers types but there's no strict checking
- No ESLint config
- No `.github/` directory
- `ONBOARDING.md` exists — document local dev there
- `vercel.json` exists — reference it

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `eslint.config.js`
- Modify: `package.json` (add scripts + devDeps)
- Create: `.github/workflows/ci.yml`
- Modify: `ONBOARDING.md` (document vercel dev + env)
- Modify: `ROADMAP.md`

---

### Step 3.1: Install TypeScript and ESLint devDependencies

```bash
npm install --save-dev typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint globals --legacy-peer-deps
```

### Step 3.2: Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "api"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 3.3: Create `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### Step 3.4: Add `typecheck` script to `package.json`

```json
"typecheck": "tsc --noEmit"
```

### Step 3.5: Run typecheck and fix errors

```bash
npm run typecheck
```
Fix any errors reported (unused vars, implicit `any`, etc.). Common fixes:
- Replace `any` in `api/contact.ts` handler signature with proper types
- Add explicit return types where needed

### Step 3.6: Create `eslint.config.js`

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  }
);
```

### Step 3.7: Add lint script and install @eslint/js

```bash
npm install --save-dev @eslint/js --legacy-peer-deps
```

Add to `package.json` scripts:
```json
"lint": "eslint src api --ext .ts,.tsx"
```

### Step 3.8: Run lint and fix errors

```bash
npm run lint
```
Fix reported issues. Note any `no-explicit-any` warnings in api/contact.ts — replace handler `req: any, res: any` with typed interfaces.

### Step 3.9: Create `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm install --legacy-peer-deps
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### Step 3.10: Document local dev in `ONBOARDING.md`

Add a "Local Development" section covering:
- `npm run dev` for frontend
- `vercel dev` for full stack (frontend + API routes together)
- Required env vars: `EMAIL_ACCESS_KEY` — copy from Vercel dashboard or create `.env.local`
- `.env.local` format: `EMAIL_ACCESS_KEY=your_key_here`
- Note: never commit `.env.local`

### Step 3.11: Run full CI check locally

```bash
npm run typecheck && npm run lint && npm test && npm run build
```
Expected: all pass.

### Step 3.12: Update ROADMAP.md

Mark `2.4` developer workflow items as done.

### Step 3.13: Commit

```bash
git add tsconfig.json tsconfig.node.json eslint.config.js .github/workflows/ci.yml package.json package-lock.json ONBOARDING.md ROADMAP.md
git commit -m "chore: add TypeScript strict checking, ESLint, CI workflow, and dev docs"
```
