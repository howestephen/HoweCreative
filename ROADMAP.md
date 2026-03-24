# ROADMAP

## Current Milestone

`2.0 Stabilize portfolio system`

## Milestones

- `2.1` Security and reliability hardening
  - keep contact secrets server-side only
  - ✓ add explicit rate limiting and anti-spam controls on `/api/contact` (IP-based, 5 req/15 min, Vitest-tested)
  - dependency audit hygiene — ongoing practice, not a sprint item
- `2.2` Dependency and bundle optimization
  - ✓ remove unused generated UI primitives/dependencies (47 shadcn/Radix files deleted, 38 packages removed)
  - ✓ reduce initial bundle size and warning surface (removed 115 transitive packages)
  - lazy-load Three.js hero via dynamic import to reduce initial bundle — **next priority**

- `2.3` UX and architecture refinement
  - ✓ shell/chrome simplification — dead components removed (Navigation, CyberHero, Hero3D); remaining chrome is intentional
  - ✓ loading sequence accessibility — aria-live, progressbar role, reduced-motion skip added
  - improve section readability and content hierarchy — opportunistic/ongoing

- `2.4` Developer workflow
  - ✓ add lint/typecheck scripts
  - ✓ wire CI checks on PRs
  - ✓ document local API testing (`vercel dev`) and env handling

## Current Next Step

- 2.2: Lazy-load `MatrixRainHero` via `React.lazy` + dynamic import (Vite code-split).
- 2.3: Accessibility polish on loading sequence.
- 2.3: Section readability pass (opportunistic).
