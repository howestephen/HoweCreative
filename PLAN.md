---
status: dormant
author: stephen+claude
activates: only when 3+ milestones form a cross-cutting programme needing unified design
level: L2+
updated: 2026-04-18
---

# PLAN  -  Programme Spec

Use this file **only** when 3+ roadmap milestones form a cross-cutting programme that needs unified design. Most projects never need this file.

For individual milestones, use per-milestone specs under `specs/milestones/` instead. `PLAN.md` is the index + cross-cutting design for a programme, not the detailed spec for any single milestone.

Examples of programme-scale work:
- "Payments programme" spanning checkout, billing, refunds, dunning, taxes
- "Multi-tenancy programme" spanning auth, data partitioning, billing, admin
- "Internationalisation programme" spanning locale, currency, tax, legal copy, payments

For single milestones, do not create a `PLAN.md`. The milestone spec is enough.

## Programme

- Name:
- Owner:
- Date:
- Constituent milestone specs (links to `specs/milestones/`):
  - `specs/milestones/P{phase}-M{NN}-{name}.md`
  - `specs/milestones/P{phase}-M{NN}-{name}.md`
  - `specs/milestones/P{phase}-M{NN}-{name}.md`
- Status:

## Codex Execution Setup

Only fill in what matters for this initiative.

- Recommended Codex surface:
- Relevant skills:
- Relevant MCP servers:
- Sandbox / approval expectation:
- Special constraints:

## Objective

What outcome should exist when this work is complete?

## Current Problem

What is wrong, missing, or too fragile today?

## Proposed Approach

Describe the intended design at a practical level.

Include:
- data flow
- key modules
- migration impact
- testing impact
- expected repo areas affected

## Non-Goals

State what this initiative will deliberately not do.

- Non-goal:
- Why excluded:

## Milestones

### Milestone 1

- Outcome:
- Implementation notes:
- Validation:

### Milestone 2

- Outcome:
- Implementation notes:
- Validation:

## Risks

- Risk:
- Why it matters:
- Mitigation:

## Dependencies

- Dependency:
- Why needed:
- Owner or source:

## Validation Checklist

- [ ] project-specific lint or static checks
- [ ] type or compile validation if relevant
- [ ] unit tests if relevant
- [ ] integration tests if relevant
- [ ] e2e or workflow tests if relevant
- [ ] build or packaging validation if relevant
- [ ] docs updated
- [ ] roadmap updated

## Verification Artifacts

List the concrete evidence that should exist when this initiative is complete.

- Artifact:
- Where to inspect it:
- Why it proves progress:

## Definition Of Done

Use this section to state the initiative-specific completion bar.

This should be consistent with the global definition of done in `CLAUDE.md` (rules; `AGENTS.md` is a pointer), while adding any initiative-specific requirements that must also be true before the work is considered complete.

The initiative is complete only when:
- implementation is merged or ready
- validation passes
- docs are current
- roadmap is current
- remaining risks are explicit

## Post-Completion Note

When this initiative is complete:

- update the linked roadmap item
- remove stale assumptions from this file
- either refresh this file for the next initiative or mark it clearly as completed
