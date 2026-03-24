# ROADMAP

## Current Milestone

`2.0 Stabilize portfolio system`

## Milestones

- `2.1` Security and reliability hardening
  - keep contact secrets server-side only
  - ✓ add explicit rate limiting and anti-spam controls on `/api/contact` (IP-based, 5 req/15 min, Vitest-tested)
  - maintain dependency audit hygiene
- `2.2` Dependency and bundle optimization
  - ✓ remove unused generated UI primitives/dependencies (47 shadcn/Radix files deleted, 38 packages removed)
  - split heavy visuals where possible
  - ✓ reduce initial bundle size and warning surface (removed 115 transitive packages)

- `2.3` UX and architecture refinement
  - continue simplifying shell/chrome where it does not add value
  - tune loading sequence timing and accessibility behavior
  - improve section readability and content hierarchy

- `2.4` Developer workflow
  - ✓ add lint/typecheck scripts
  - ✓ wire CI checks on PRs
  - ✓ document local API testing (`vercel dev`) and env handling

## Current Next Step

- Complete 2.1: maintain dependency audit hygiene (ongoing).
- Continue 2.2: split heavy visuals (Three.js hero) where possible.
- Continue 2.3: UX and architecture refinement.
