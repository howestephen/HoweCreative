---
status: active
author: stephen+claude
level: ALL
updated: 2026-11-15
---

# CLAUDE.md - project rules

Read CONVENTIONS.md on every task, including documentation-only work. Its
canonical house standards and code enforcement acceptance apply at every level.

## 0. One rules file

`CLAUDE.md` governs every agent. `AGENTS.md` is a pointer, never another rules
file: separate copies drifted and misdirected a project for four months
(`_projects-admin/DECISIONS.md`, 2026-08-19).

## 0A. Autonomy

A project may tighten or loosen these defaults, never silently.

Git workflow: CONVENTIONS.md (main needs Stephen's approval from L3; paid services run inside an approved allowance). Gates and milestone
review always apply.
- Subagents run in combination, capped by tier: one top-tier, two Opus, four
  Sonnet or below. Use the cheapest tier that fits and never delegate work a
  command or direct read can do. Follow RULES 2.1 and the installed guard.
- This repository is public: before any push, run the Privacy check below.
- The folder lock is `top_dirs` in `scripts/validate.config.json`.

## 1. Start-Up Loop

Before making changes, read in this order:

1. [ONBOARDING.md](./ONBOARDING.md)
2. [CONVENTIONS.md](./CONVENTIONS.md)
3. [ROADMAP.md](./ROADMAP.md)
4. [LEVELS.md](./LEVELS.md) §0 to §5
5. [GOVERNANCE.md](./GOVERNANCE.md) §0 to §3

Read these only when the task needs them:

- The selected milestone's spec at `specs/milestones/` (depth: §1B)
- [PLAN.md](./PLAN.md) only if the milestone is part of a programme (3+ milestone cross-cutting initiative)
- [ENGINEERING.md](./ENGINEERING.md) including §0A "Paradigm Defaults"; always when touching code
- Active domain addendum(s) from `domains/DOMAIN_*.md`, declared in `ONBOARDING.md`
- The current `handoffs/` work item, when resuming previously started work
- [ARCHITECTURE.md](./ARCHITECTURE.md) when touching code
- The active plan in `docs/plans/` (local only) if the roadmap task names one
- **Level-gated conditional reads** (only if active level ≥ doc's LEVEL):
    - L1+: [DESIGN.md](./DESIGN.md) when the work touches UI/UX; when the work adds or changes an external service: services are reached by their CLI; the spend gate config (`_projects-admin/hooks/spend-gate.config.json`) lists paid and free operations
    - L2+: [QUALITY.md](./QUALITY.md); [REVIEW.md](./REVIEW.md) (and when a formal review gate applies); `METRICS.md`, `RELEASE.md`, `COST_CONTROLS.md` (tracking); `security/` folder (basics; or earlier if domain forces); [EVALS.md](./EVALS.md), [PROMPT_ASSETS.md](./PROMPT_ASSETS.md) if project uses AI
    - L3+: `LEGAL.md`, `COMPLIANCE.md`, `INCIDENT_RESPONSE.md` (launch-gate scope); `ACCESSIBILITY.md` (basics); `SAFETY.md`, `AI_COMPLIANCE.md` (labelling, if AI output is shown)
    - L4+: the full `security/`, `COST_CONTROLS.md`, `ACCESSIBILITY.md`, `SAFETY.md`, `AI_COMPLIANCE.md`, `COMPLIANCE.md`, `LEGAL.md` and `INCIDENT_RESPONSE.md`
    - L5: `MARKET_MATRIX.md`
- Skip archived docs, and dormant docs until their level activates them, except the parts other files require earlier: QUALITY.md §9 (feature triggers), COST_CONTROLS.md's shared allowance record, and every domain addendum ONBOARDING.md declares active.

Then inspect the relevant implementation, identify the smallest coherent milestone, and confirm the validation path before editing.

## 1A. Level Transition Rule

Before any roadmap task, scan it for a level trigger (`LEVELS.md` §3). If one is hit, **STOP**, propose activation as `LEVELS.md` §5 lists, wait for explicit user confirmation, then run the Level Transition Playbook in `GOVERNANCE.md` §5.

## 1B. Spec Discipline Gate

Never implement against a spec below the level's required depth (`LEVELS.md` §6, `GOVERNANCE.md` §9.4). If the spec is too shallow, **STOP** and flesh it out first as an atomic task.

## 2. Scope Control

One coherent milestone at a time, no unrelated refactors mixed in. Complete missing prerequisites as a named sub-milestone, or document the blocker and do not continue blindly.

## 3. Required Workflow Loop

Inspect, plan, implement, test and audit to the change's rigour tier
(CONVENTIONS.md: rigour follows risk), fix failures and findings, update docs
and roadmap, report. A change takes the highest tier it touches.
Every audit finding that is a bug, and every piece of Stephen's review or UI
feedback, is fixed with a real commit; a low finding that is polish is fixed
if quick. Never skip steps. Define the
task envelope before work; update `PLAN.md` first if the roadmap cannot safely
coordinate substantial work.

## 4. Implementation Rules

- Follow the Paradigm Defaults in `ENGINEERING.md` §0A; domain overrides apply per `domains/DOMAIN_*.md` (e.g. Solidity for blockchain, class-based ECS for games, Pydantic for Python services).
- Keep modules small, domain logic out of presentation components, service/query boundaries explicit rather than duplicated ad hoc calls; choose structure per product (feature-first by default).
- Default stack: TypeScript + React + Tailwind with Next.js or Vite, plus Python where JS is not the best fit, hosted on Cloudflare with Neon Postgres (CONVENTIONS.md, product platform); other choices need a project-specific reason.

## 4A. Sandbox, Approvals, And Services

Prefer lower-risk Codex operating modes: `workspace-write` plus `on-request` for normal local implementation, `read-only` plus `on-request` for audit or research, `workspace-write` plus `untrusted` when stricter auto-read is needed. Avoid `danger-full-access` plus `never` unless the task truly requires it and the risk is understood.

Reach external services through their CLI: command allowlists, the spend gate and release approval cover CLI commands, and nothing is designed around MCP tool permissions. MCP servers are not used for now; the trust matrix is archived at `_projects-admin/templates/ai-product-base/_archive/MCP_TRUST_MATRIX.md` and comes back, project-scoped, scoped or read-only, if a project brings one back.

## 4B. Skills To Reach For

These skills are installed for every project. Claude Code drops skill descriptions from its listing when there are many, least-used first, so agents miss them unless reminded: before design, UI or motion work, name the skill you will use and invoke it (the `/name` ones only run when called).

- Design foundation (DESIGN.md "Library layers"): `/pick-ui-library` for the library per layer, `frontend-design` for visual direction, `/prototype` for several genuinely different directions behind a picker (it asks how many).
- Interaction and motion: `emil-design-eng` (polish), `animate` (one animation), `choreograph` (several elements together), `gestures` (drag, swipe, sheets), `animation-performance` (jank), `animation-vocabulary` (naming an effect).
- Motion review: `/review-animations` (one change), `find-animation-opportunities` and `improve-animations` (read-only surveys), `remove-animations` (cuts motion after approval).
- States and phones: `break-ui` (worst-case data behind a dev toggle), `mobile-native` (mobile web fixes).
- Taste: `/learn-taste` turns design corrections into neutral rules in DESIGN.md.

## 5. Validation Requirements

Use the repository's actual validation commands at the rigour tier and timing
CONVENTIONS.md sets (changed tests while working, the complete suite before a
merge to main or on CI). Report omitted checks and why; retain verifiable
evidence, not claims.

## 6. Testing Requirements

- Add or update unit tests for pure logic, integration tests for service and data boundaries, and e2e tests when user-visible flows change.
- Significant behaviour changes need a test delta unless truly non-behavioural.
- Note any missing test layer; update any eval or grading layer when behaviour meaningfully changes.

## 6A. Post-Task Governance Loop

Runs after **every** substantive task: follow `GOVERNANCE.md` §3 (target <5 min; consistently longer is a governance concern: the system is too heavy).

## 7. Documentation Requirements

When a change affects behaviour, architecture, workflow, or priorities, update [ROADMAP.md](./ROADMAP.md), [ONBOARDING.md](./ONBOARDING.md) if project understanding changes, and any other relevant project docs. Never spread the same content across docs: `ONBOARDING.md` stable context; `ROADMAP.md` execution state; `PLAN.md` large-work planning; `QUALITY.md` quality bar, evidence, release gates; `ENGINEERING.md` default stack plus cross-stack typing, boundary, security and validation rules; `REVIEW.md` findings and accepted risks; `EVALS.md` AI quality checks; `PROMPT_ASSETS.md` prompts and AI context.

## 8. Stop-And-Fix Behaviour

Stop and fix on: failing validation caused by your changes, contradictory roadmap assumptions, unclear data model or security rules, missing environment requirements that invalidate the task, or hidden coupling that makes the change unsafe.

Never hack around a problem (CONVENTIONS.md). A TODO is allowed only when Stephen explicitly accepts the risk, with a roadmap reference on the same line. A missing tool, approval or sandbox limit is recorded, not improvised around.

## 9. Definition Of Done

Done requires implementation complete, tests added or updated, validation run, docs and roadmap updated, remaining risks documented. Substantial tasks also: linked `PLAN.md` content updated or marked obsolete; any required review outcome current, any accepted risk explicit.

## 10. Roadmap Update Rules

Every substantial task leaves the roadmap accurate to the actual outcome: status, scope, why it matters, the path, validation, risks, deferred work, next step. Every task, ad-hoc work included, ends by bringing the `## Stephen` list of `[S]` owner actions up to date in the same change (what only he can now do added, done items removed); the Dashboard reads it. Improve thin items; never reduce rich entries to shallow status bullets. Stable context goes in `ONBOARDING.md`; a validation, trust, or tool change updates both.

## 11. Publication Safety

Everything tracked must be suitable for disclosure: record conversational
input as neutral decisions, requirements, constraints or technical rationale;
never quote private comments, preserve abusive language, describe the user's
emotional delivery, or commit personal contact details or machine paths.
Credentials never enter Git, including comments, tests and fixtures labelled
fake or example. Private transcripts stay outside the repository; ignoring a
tracked file does not remove it or its history.

## 12. Subagents And Parallel Work

Subagents follow the caps in §0A. The main agent keeps requirements, decisions, and final outputs; subagents return summaries, not transcript dumps.

## 13. Final Reporting Format

Report briefly: what changed, what ran and what did not, remaining risks. Anything Stephen must answer or do goes last, on its own (CONVENTIONS.md, reply ending).

## Project rules (Howe Creative)

These apply on top of the sections above. Where one tightens a house default,
it says so.

### Hosting

Vercel is this project's deliberate host: it is the portfolio, so CONVENTIONS.md's
product-platform rule (Cloudflare and Neon) does not apply, and
`scripts/vercel-main-only.json` stays. The default stack in §4 otherwise holds.

### Copy

- **Never use em-dashes (—) or en-dashes (–)** in site copy, UI strings, the CV,
  or any user-facing text. Use a plain hyphen "-" instead. No exceptions, ever.
- Never describe Solana Diary (or similar work) as "autonomous" or as "an AI
  system". It was an automated media pipeline with human Telegram approval,
  built *with* AI tools. Grok was an optional, button-triggered assist.
- Never invent or aggregate metrics without attribution. Every stat must name
  the job or project it came from (e.g. "30 games shipped at Switch Studios").
- Do not claim audience/follower numbers for Solana Diary; the reason is in
  `CLAUDE.local.md`.

### Assets

- **Never delete project images, screenshots, or media.** If an asset is no
  longer used on the site, move it to `assets-archive/` (git-ignored, stays on
  Stephen's machine) so future redesigns can reuse it. All project screenshots
  live in this repo.

### Privacy

- Stephen's email address and phone number must not appear in page copy,
  metadata, or structured data. Contact goes through the form. The `/cv` page
  is the one deliberate exception (email only).
- `docs/private/` is git-ignored source material. Never commit or publish it.
- The GitHub repository is public and holds the website only. Internal
  working notes stay local and git-ignored (Stephen, 13 November 2026):
  handoffs (all but `handoffs/TEMPLATE.md`), `docs/plans/`, `docs/reviews/`,
  `_archive/` and setup notes for other systems. Never commit or push them;
  check `gh repo view --json visibility` before any push.

### Branches

- Keep exactly two long-lived branches: `main` and the single active redesign
  branch. Retire merged or superseded branches immediately; tag anything worth
  keeping instead of leaving a branch.
- Exception, 13 November 2026, until Stephen decides the redesign direction:
  `fix/video-captions` waits for his proofread, and two concept branches
  stay local only, never pushed: `claude/showreel-redesign` (rejected
  11 November) and `claude/brief-machine` (the paused blank-page concepts).
  Retiring or tagging them is his call.
- Only `main` is live. `codex/creative-technologist-portfolio` is kept for
  further work but not deployed: the `howecreative-particle` Vercel project is
  disconnected from Git (2 November 2026), and main does not route any path to
  it. Reconnecting it is Stephen's call.
- Both branches carry the same agent guidance (this file, CONVENTIONS.md,
  AGENTS.md, the kit documents, `handoffs/TEMPLATE.md`, `scripts/validate*`,
  `.claude/launch.json`). Change it on both in the same task.

### Verification

- Before a merge to main: `npm run ci:pr` (typecheck, lint, all tests and
  the production build), as CONVENTIONS.md sets for the complete suite.
- The commit gate reads evidence for the `code_checks` in
  `scripts/validate.config.json` (typecheck and lint, tests). Run
  `python3.13 scripts/selftest_code_quality.py --evidence` before committing
  code; matching evidence is reused. CircleCI runs `npm run ci:pr` on pull
  requests and `npm run ci:main` on main once Stephen connects it (ROADMAP).
- The preview runs through the house preview controller (`vite preview` of
  `dist` on port 5175): `python3.13 <repos>/_projects-admin/scripts/project_control.py start`
  from this repository, after `npm run build`. Share the Tailscale link its
  `status` reports. `.claude/launch.json` only attaches to that server; never start a
  second one on a guessed port.

## CI and publication checks

For every task, including documentation-only work, read CONVENTIONS.md's CI and
publication rules before validation or pushing; they apply at every level.

## Cross-tool handoffs

Codex sessions start from a copy of `.codex/config.example.toml`.

Between tools or sessions, use a work-item
file in `handoffs/` named `YYYY-MM-DD-topic.md`, copied from
`handoffs/TEMPLATE.md`. The `owner` field is whose turn it is; the receiver
acts on the file alone, writes back, flips `owner`, bumps `round`. `state` is one of: needs-work | in-progress | blocked | done. Round 3
escalates to Stephen. Automation over this is optional, later.
