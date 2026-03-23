# ROADMAP

## Current Milestone

`2.0 Stabilize portfolio system`

## Milestones

- `2.1` Security and reliability hardening
  - keep contact secrets server-side only
  - ✓ add explicit rate limiting and anti-spam controls on `/api/contact` (IP-based, 5 req/15 min, Vitest-tested)
  - maintain dependency audit hygiene
- `2.2` Dependency and bundle optimization
  - remove unused generated UI primitives/dependencies
  - split heavy visuals where possible
  - reduce initial bundle size and warning surface

- `2.3` UX and architecture refinement
  - continue simplifying shell/chrome where it does not add value
  - tune loading sequence timing and accessibility behavior
  - improve section readability and content hierarchy

- `2.4` Developer workflow
  - add lint/typecheck scripts
  - wire CI checks on PRs
  - document local API testing (`vercel dev`) and env handling

## Current Next Step

- Complete 2.1: maintain dependency audit hygiene (unused UI primitives/packages trim).
- Then move to 2.2: dependency and bundle optimization.
