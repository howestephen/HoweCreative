---
status: active
author: stephen+claude
level: ALL
updated: 2026-11-14
generated_by: claude
generated_at: 2026-10-30T13:55Z
generated_from: conversation
model: lifecycle
---

# LEVELS  -  App Lifecycle

Levels follow the app's life: build it, launch it with accounts and billing,
then grow it. Decided by Stephen on 30 October 2026 (`_projects-admin/DECISIONS.md`)
(`_projects-admin/specs/2026-10-30-lifecycle-levels.md`); it replaces the
eight-level maturity ladder. Do not add levels, move billing later or spread
launch work back across levels.

**Higher levels inherit all constraints from previous levels.** A project at L3 is also bound by L0 to L2; a project at L1 is not bound by anything above it.

## 0. Current Level

The active level must be declared in `ONBOARDING.md` under "Current Level".
Resolve an absent or conflicting declaration before choosing a Git workflow;
record the decision once, not at every commit. Do not silently assume L0.
The level follows the facts: real users or real payments mean L3 or above.

Git workflow: CONVENTIONS.md. Main needs Stephen's approval from L3, and from L3 a release to live also needs his approval each time; below L3 main takes merges and pushes once checks pass. Gates and milestone review apply at every level.

## 1. Level Summary

| Level | Stage | Focus | Docs activated at this level |
|---|---|---|---|
| **L0** | Explore | Talk the idea through and make things freely: sketches, throwaway prototypes, spikes. No tests, gates or pipeline. | `DISCOVERY.md` (toolkit, optional) |
| **L1** | Build | The idea is established; specs, tests, quality gates and the development pipeline apply. Stephen only, no users. Hard rules on deps and typing. Bullet-list docs. | L1 core set (see §3) |
| **L2** | Launch-ready | Tests, security basics, accounts and billing built in the payment provider's test mode. Still no real users. | +`REVIEW.md`, +`QUALITY.md`, +`METRICS`, +`RELEASE`, +`COST_CONTROLS` (tracking), +`security/` (basics), +`EVALS`, +`PROMPT_ASSETS` (if AI) |
| **L3** | Live | Real accounts, real billing, taking money. Entered by passing the launch gate (§3). | +`LEGAL`, +`COMPLIANCE`, +`INCIDENT_RESPONSE`, +`ACCESSIBILITY` (basics), +`SAFETY` and `AI_COMPLIANCE` (labelling, if AI output is shown) |
| **L4** | Grow | Analytics, scale, full accessibility, cost controls, deeper audit and compliance. | Full `security/`, full `COST_CONTROLS`, full `ACCESSIBILITY`, `SAFETY`, `AI_COMPLIANCE`, `COMPLIANCE` |
| **L5** | International | Translations, more markets, tax, data residency. | +`MARKET_MATRIX` |

Tests for changed behaviour apply from L1. How much testing and review
a change needs follows its risk, not the level: the rigour rule in
CONVENTIONS.md. The matrix scales coverage and documentation. CONVENTIONS.md states the code requirements; the kit's
RETROFIT.md holds the acceptance probes.

## 2. Dimension Matrix

Empty cells mean no **new** constraint at that level; previous constraints still apply.

| Level | Code quality | Testing | Security | Product design | Compliance | Scalability |
|---|---|---|---|---|---|---|
| **L0** |  |  |  |  |  |  |
| **L1** | Strict types, pinned deps, no `any` | Changed behaviour tested | Integration boundaries, secrets basics | Problem and user defined; design POV + primitives (bullet) | Future risks surfaced | Local only |
| **L2** | Folder audit, dedup, naming, contracts | Integration tests on critical paths (sign-up, sign-in, billing, data access) | Auth and data-access rules tested, rate limits on sign-in and payment | Component inventory, WCAG A basics | Privacy basics built (deletion, export) | Observable + metrics |
| **L3** |  | Launch-gate checks | Live-mode billing via provider, webhooks verified | Accessibility basics on main journeys | ToS, Privacy Policy, cookie consent, consumer terms | Error monitoring, uptime alert, tested restore |
| **L4** |  | Security, privacy and safety tests | IAM/RBAC, encryption, audit logs, policy-as-code | WCAG AA, safety UX | DPAs, deeper GDPR, AI transparency in full | Resilient, cost-tracked, scale tested |
| **L5** |  |  |  | Localised | Per-market matrix | Multi-region |

## 3. Level Definitions and Triggers

### L0: Explore

- **Work:** Stephen and the agent talk the idea through and make things freely: sketches, throwaway prototypes and spikes, on Vercel (CONVENTIONS.md, product platform).
- **No constraints from testing or gates:** no required tests, coverage, evidence records, CI or decision records. The secret and publication scans still run.
- **Write things down:** the agent encourages a light spec or notes of what was learned and decided as the idea firms up. Encouraged, not a gate. `DISCOVERY.md` is a toolkit the agent offers when it helps or when asked.
- **Trigger to leave L0:** Stephen decides to build. The agent writes a short note of what was learned and the direction chosen, plus a first spec if none exists.

### L1: Build

- **Entry:** everything becomes formal. Specs, tests, quality gates and the development pipeline apply; populate `ONBOARDING.md` (snapshot, primary user, target markets, active domains).
- **Once code exists:** apply the executable baseline in ENGINEERING (§3.8 for TypeScript, §4 for Python) and QUALITY §9. Feature triggers apply at introduction.
- **Constraints:** strict typing, runtime validation at boundaries, small modules, no secrets in code, basic lint/typecheck/build, external services reached by CLI (an MCP server, if one returns, is recorded in the archived `_archive/MCP_TRUST_MATRIX.md`). Docs per `GOVERNANCE.md` §7.
- **Dependabot alerts:** on from L2 (Stephen, 2026-11-09; `_projects-admin/RULES.md` 2.14), so they work before the serious work of L3; a project below L2 keeps whatever it has. Alerts only; update pull requests are a separate decision.
- **Trigger to leave L1:** work on accounts, billing or launch begins, or drift starts to hurt.

### L2: Launch-ready

- **Constraints:** folder, dependency, naming, duplication and dead-code audits; formal review records; unit and integration tests on the critical paths; API contracts and migration safety; structured logging; authentication and data-access rules (for example Row Level Security) tested; secrets out of code; rate limits on sign-in and payment routes; accounts and billing built against the payment provider's test mode; account deletion and data export working; metrics declared; cost tracking begins.
- **Trigger to leave L2:** the first real user account or real payment. Pass the launch gate first.

### L3: Live

- **Launch gate (cleared before the first real user or payment):**
  - Legal: Terms of Service, Privacy Policy, cookie consent when non-essential cookies are used, consumer terms for paid plans (cancellation and refunds).
  - Privacy: lawful basis recorded, in-app account deletion working and reaching every processor, self-serve export where personal data goes beyond sign-in, the withdrawal function, marketing consent opt-in, retention stated, processors listed (CONVENTIONS.md, email, billing and account lifecycle).
  - Security: the L2 auth, data-access and rate-limit checks pass against production configuration.
  - Billing: through a payment provider in live mode, so no card data passes through the app; webhooks verified.
  - Accessibility: basic WCAG A checks pass on the main journeys.
  - Operations: error monitoring, uptime alert, backups with one tested restore, an incident contact.
  - AI output shown to users is labelled.
- The exact UK legal minimum is checked against primary sources (ICO, GOV.UK, the payment provider's terms) when `LEGAL.md` and `COMPLIANCE.md` are written; the gate's list is its shape, not legal advice.
- **Trigger to leave L3:** sustained use that needs scale work, business customers asking for contracts or audits, or accessibility obligations beyond the basics.

### L4: Grow

- **Constraints:** analytics, IAM/RBAC, encryption at rest and in transit, injection/SSRF protections, audit logs (immutable where required), policy-as-code, incident detection and playbooks, full FinOps cost controls, WCAG AA, DPAs, content safety and full AI transparency.
- **Trigger to leave L4:** selling into another country's regulated market.

### L5: International

- **Constraints:** per-market compliance matrix (EU, UK, US state-by-state, LatAm per country), translations and localised legal copy, data residency, cross-border transfer mechanisms, multi-jurisdiction tax and consumer-rights handling.
- **Trigger to leave L5:** none (terminal).

### Local and hosted activation

L0 needs no checks. At L1 run the baseline locally, with affected regressions
and service integration as features require them. At L2 add critical journey,
security, accessibility and coverage evidence, with local runs as the
default (mutation checks stay with first-tier changes, QUALITY §9), and activate cost tracking and alerts. At L3 verify live release
and recovery evidence. At L4 activate full FinOps and scale checks. At L5 add
locale and market checks. Feature tests start at introduction as set out in
[QUALITY.md](QUALITY.md#application-assurance-triggers).

Any metered hosted use activates the shared allowance record in
[COST_CONTROLS.md](COST_CONTROLS.md#shared-allowance-record-all-levels), even at
zero price. New hosted checks, automatic update PRs and pilots require
verified headroom, a numerical allocation and a recorded activation decision.
Retain approved existing configurations and required security and publication
gates. See admin's `specs/2026-10-31-hosted-ci-vercel-policy.md` §2.14 for the
shared ceilings and dependency-update portfolio order.

## 4. Domain Axis

Domain is orthogonal to level. A project declares one or more domains in `ONBOARDING.md`; each active domain loads its addendum from `domains/` and may pull a document earlier. Core domains (full set in `domains/`):

- `DOMAIN_CONSUMER.md`: default for most consumer apps
- `DOMAIN_BLOCKCHAIN.md`: forces `security/` to L1, `COMPLIANCE.md` to L2
- `DOMAIN_GAMES.md`: `SAFETY.md` to L2 for age ratings
- `DOMAIN_MEDIA_PIPELINE.md`: `LEGAL.md` rights section to L2
- `DOMAIN_B2B_SAAS.md`: `security/` to L2, `COMPLIANCE.md` to L2
- `DOMAIN_MARKETPLACE.md`: `COMPLIANCE.md` and `LEGAL.md` to L2
- `DOMAIN_FINTECH.md`: `security/`, `COMPLIANCE.md`, `LEGAL.md` all to L1 to L2
- `DOMAIN_HEALTH.md`: `COMPLIANCE.md`, `security/` to L1 to L2

Domain addenda are **deltas** on the base and never restate base content. See `GOVERNANCE.md` Extension Protocol.

## 5. Level Transition Rule

Before beginning any roadmap task, read the current level from `ONBOARDING.md` and scan the task for any trigger that would cross into the next level (triggers in §3). If one is hit, **STOP**. Propose activation: the trigger, the level entered, the docs activated and the current task's initial obligations. Wait for explicit user confirmation, then run the Level Transition Playbook in `GOVERNANCE.md` §5. Entering L3 means clearing the launch gate first.

Never skip a lower-level constraint because a higher level is active. Never apply a higher-level constraint to a project below that level.

## 6. Spec Discipline by Level

| Level | Spec requirement |
|---|---|
| **L0** | None required. A light spec or notes of what was learned are encouraged as the idea firms up. |
| **L1** | STUBs for current phase. Flesh to DRAFT just-in-time. |
| **L2** | DRAFT for the current milestone before work starts; threat-model section in security-adjacent specs. |
| **L3** | DRAFT for upcoming + ACTIVE for current. |
| **L4+** | Full DRAFT + review gate before implementation. |

Hard rule: never execute against a spec below the level's required depth (`GOVERNANCE.md` §9.4; lifecycle in §9).

## 7. Level Change Log

Add one line per transition as the project moves up (L0 to L5):
`Lx entered YYYY-MM-DD: trigger; docs activated; Playbook complete`.
A project moved from the old eight-level ladder records
`Remapped to lifecycle levels YYYY-MM-DD: old Ln, now Lm; reason`.

- L0 entered: YYYY-MM-DD

## 8. Archived Specs Rule

Archive complete or superseded specs, plans and requirement docs per `GOVERNANCE.md` §2.3 and §4; never read them as live context unless asked.
