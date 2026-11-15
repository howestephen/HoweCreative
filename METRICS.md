---
status: dormant
author: stephen+claude
activates: at L2  -  when commercial thinking starts and the project needs defined success signals + operational SLOs
level: L2
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# METRICS  -  Product and Operational Signals

Defines what "working" means for this project  -  for users and for operators.

## 0. Purpose

Two distinct measurement surfaces:

- **Product metrics**  -  is the product working for users?
- **Operational metrics**  -  is the system working under load, in production?

Both get declared here. Related roadmap milestones reference specific metrics from this file.

## 1. North Star

- Metric name:
- Why this is the North Star:
- Where it's observed:
- Target:
- Review cadence:

## 2. Product Metrics (HEART)

Record only the dimensions that matter for this product.

### Happiness
- Signal:
- Measurement:
- Target:

### Engagement
- Signal:
- Measurement:
- Target:

### Adoption
- Signal:
- Measurement:
- Target:

### Retention
- Signal:
- Measurement:
- Target:

### Task success
- Signal:
- Measurement:
- Target:

## 3. Operational Metrics (SLOs)

One block per service or surface.

### SLO: <name>
- Indicator (SLI):
- Target (SLO):
- Error budget:
- Alerting threshold:
- Owner:

## 4. Funnel and activation events

Named events the product emits. One row per event.

| Event | Fires when | Attributes | Used for |
|---|---|---|---|
| (name) | (trigger) | (key props) | (which metric) |

Naming convention: `<subject>.<verb>` (e.g. `user.signed_up`, `lesson.completed`).

## 5. AI quality signals (if applicable)

If the project uses AI features, track at least one quality signal per feature. See `EVALS.md` for detail.

- Signal:
- Where observed:
- What change would trigger concern:

## 6. Review cadence

- Weekly: product metrics snapshot
- Monthly: SLO compliance review
- Per release: funnel diff, new events declared

## 7. Change triggers

Update this file when:
- a new user-facing workflow ships
- the business model or pricing changes
- a target fails for two consecutive review periods
- a new service is introduced with its own SLO
