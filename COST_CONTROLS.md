---
status: dormant
author: stephen+claude
activates: before metered hosted use for the allowance record, at L2 for tracking and alerts, at L4 for full FinOps
level: L2+
updated: 2026-11-15
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# COST_CONTROLS  -  Cost Tracking and FinOps

Governs spend on AI APIs, infrastructure, and third-party services. Critical for AI-heavy consumer apps where API costs can compound quickly.

## Shared allowance record (all levels)

Complete one record per metered hosted service before its first use or any
expansion, including services with zero monetary spend. This section activates
on actual use. L2 tracking and alerts and L4 full FinOps activate separately.
The spend gate applies at every level: a paid service's spending operations
run only inside an allowance Stephen approves for the job through the gate,
and free services with limits never ask (CONVENTIONS.md).

| Field | Value to record |
|---|---|
| Provider, account/pool and current plan | (service, account or organisation, plan, verified date and official or billing source) |
| Vendor allowance | (account-wide cap, native unit, period and reset date) |
| House ceiling | (maximum planned usage in the accounting unit, period start/end and reset, distinct from vendor allowance) |
| Measured usage and headroom | (dated account-wide usage, evidence source, vendor and house headroom, remaining commitments) |
| Approved project allocation | (numeric native units per period, period boundaries, approval date and DECISIONS.md link, zero until recorded) |
| Trigger and cadence | (eligible events, runs per period and expected peak) |
| Per-run limit and measured cost | (maximum units and runtime, dated observed units per run and revision or receipt) |
| What draws from the pool | (PRs, main runs, retries, failures, cancelled runs with usage, and other projects or products where applicable) |
| Owner and review | (account and project owners, review cadence and next review date) |
| Exhaustion | (when to stop optional work, local fallback, escalation and next review or reset) |
| Paid-spend backstop | (zero paid CI budget, blocking setting and verification evidence) |

Verify entitlements and rates in the actual account. Check that measured use
plus remaining commitments and the proposed allocation fit under both caps.
At each reset, reconcile account usage and allocations for the new period
before carrying commitments forward. Unverified headroom means zero new
allocation. Record Stephen's activation and allocation decision in the
project's DECISIONS.md and link it here. Any separate account or workflow
approval still applies.

Use comparable approved runs for the unit cost. A first measurement run
requires its own bounded approval and allocation. Charge actual use against
the allocation and stop optional hosted work before the first applicable
limit. If a required check cannot run, report it as blocked. Resume the
required merge or release only when the check passes or a previously
approved equivalent satisfies the applicable gate.

Read the shared CI ceilings and portfolio decisions in admin's
`specs/2026-10-31-hosted-ci-vercel-policy.md` §2.14. No repository receives
its own included pool. Visual or quality pilots need the same record
using the provider's units, such as images, builds or analysed code.
For AI and other metered tools, record every applicable unit and limit,
including calls, tokens, model-specific cost and retry usage. Use a separate
row or record for each independently capped pool.

## 0. Cost surfaces

List every meaningful spend source.

| Source | Type | Variable with usage? | Current monthly |
|---|---|---|---|
| (provider) | (AI API / infra / SaaS) | yes / no | £(amount) |

## 1. L2  -  Tracking and alerts

### 1.1 Per-source tracking

For each source, record:
- how spend is observed (dashboard URL, invoice, API)
- who reviews and when
- alert threshold (e.g. +50% week-over-week)

### 1.2 Per-feature attribution

If AI features are material to the product:
- tag AI calls by feature / user / tenant
- record unit cost per successful outcome (e.g. £0.02 per lesson generated)

### 1.3 Alerts

- Daily spend alert threshold: £(amount)
- Weekly spend alert threshold: £(amount)
- Spike alert: +X% over trailing 7-day average
- Notification channel: (where)

## 2. L4  -  Full FinOps

Activated with the L4 Grow milestone.

### 2.1 Budgets

Hard and soft caps per source.

| Source | Soft cap (alert) | Hard cap (auto-disable) |
|---|---|---|
| (source) | £(amount) | £(amount) |

Hard caps must degrade gracefully (fallback to cheaper model, throttle, queue) rather than break.

### 2.2 Per-model routing

For AI providers, codify which model runs which feature and why.

| Feature | Primary model | Fallback model | Never use |
|---|---|---|---|
| (feature) | (model) | (model) | (model, reason) |

Rule: never use premium models in autonomous loops without explicit human approval per run.

### 2.3 Cache strategy

Where calls are cacheable, record:
- cache key shape
- TTL
- hit-rate target
- cost savings measured

### 2.4 Rate limits per user

- Free tier: (limits)
- Paid tier: (limits)
- Abuse threshold: (triggers review)

### 2.5 Cost review cadence

- Weekly: spend trend review
- Monthly: per-feature unit economics
- Quarterly: provider pricing comparison, negotiate if material

## 3. Unit economics summary

Update when pricing or model selection changes.

- Cost per active user per month: £(amount)
- Cost per AI-feature call (blended): £(amount)
- Gross margin at current pricing: (%)

## 4. Change triggers

Update this file when:
- a new cost source becomes material
- a provider raises prices
- a new AI feature launches
- a spike alert fires
- gross margin drops below target
