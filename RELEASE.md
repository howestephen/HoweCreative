---
status: dormant
author: stephen+claude
activates: at L2  -  when the project has staging/prod separation, non-trivial deploys, or needs feature-flag discipline
level: L2
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# RELEASE  -  Environments, Deployment, and Rollout

Defines how code moves from local to production, how releases are gated, and how rollback works.

## 0. Environments

| Environment | Purpose | URL | Data source | Who can deploy |
|---|---|---|---|---|
| local | dev iteration |  -  | dev seed | anyone |
| (staging) | pre-prod validation | (url) | (source) | (who) |
| (prod) | live | (url) | prod | (who) |

Rules:
- Never copy prod data into non-prod without anonymisation.
- Never test destructive operations against prod.

## 1. Branching and deployment flow

- Trunk-based / GitFlow / other: (pick one)
- Default branch: (main / master)
- Release branches used: yes / no
- Tags used for releases: yes / no

Deployment triggers:

- staging  -  (auto on merge to main / on tag / on manual trigger)
- prod  -  (manual / approved auto / after X time in staging)

## 2. Required checks before merge

- lint
- typecheck
- unit tests
- integration tests
- build
- (any others  -  bundle size, secret scan, SBOM)

## 3. Feature flags

- Provider:
- Naming convention:
- Max age before cleanup:
- Ownership: (who cleans stale flags)

## 4. Rollout strategy

For risky changes:

- Blue/green / canary / percentage rollout / feature flag
- Health check window:
- Rollback criteria:
- Automatic rollback triggers:

## 5. Rollback procedure

Step-by-step. Tested at least once per quarter.

1. (command or action)
2. (command or action)
3. (verify)

Time budget for rollback decision: (e.g. 5 min from alert)

## 6. Release notes / changelog

- Changelog format: Keep a Changelog / custom
- Versioning: SemVer / CalVer
- Where published: (file / release page / email)

## 7. Pre-release checklist

Only fill when a release is imminent.

- [ ] migration dry-run
- [ ] rollback tested
- [ ] monitoring in place
- [ ] on-call coverage arranged
- [ ] customer-facing changelog drafted
- [ ] roadmap and relevant specs updated

## 8. Change triggers

Update this file when:
- a new environment is added
- the branching model changes
- a rollback fails or surfaces a gap
- SLO breaches force a new gate
