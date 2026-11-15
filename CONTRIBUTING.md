---
status: active
author: stephen+claude
updated: 2026-11-13
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# CONTRIBUTING

For anyone contributing work to this project - human or agent.

- **Agents:** your operating rules are in [CLAUDE.md](./CLAUDE.md). Read it in
  full first. This file adds only the contribution mechanics below.
- **Setup and orientation:** [ONBOARDING.md](./ONBOARDING.md).
- **What the project is:** [README.md](./README.md).

## Contribution mechanics

- Git workflow: CONVENTIONS.md. Branch pushes are free; below L3, main takes
  merges and pushes once checks pass; from L3 every push or merge into main
  needs Stephen's approval.
- Atomic commits: one piece of work per commit. House commit format is
  injected by the prepare-commit-msg hook.
- Every change passes the gates (hooks refuse broken structure, budgets, secrets).
- Update the relevant doc in the same commit as the change it describes.

## Compiler and lint

For JS/TS work run `npm ci --ignore-scripts` then
`<python> "<repos>/_projects-admin/scripts/heavy.py" run -- npm run check`
(`ENGINEERING.md` 3.8-3.9). Before committing, the agent records passing
evidence for lint, typecheck and the affected tests (`selftest_code_quality.py
--evidence`, QUALITY §7), and CircleCI runs the full suite on the pull request; required
branch statuses are configured separately. Passing is not independent review.
