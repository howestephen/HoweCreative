---
status: active
author: stephen+claude
activates: when L2 consolidation begins, or when the project needs a shared cross-cutting quality bar
level: L2
updated: 2026-11-14
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# QUALITY

Use this file to define the actual quality bar for the project.

This file is about what "good enough" means across the system, not just whether code compiles.

It should make quality expectations explicit before work starts, not only after something breaks.

## 0. Purpose

Use this file to answer:

- which quality dimensions matter most for this project
- what minimum bar must be met before merge or release
- what evidence should exist to prove that bar was met
- which quality risks are currently accepted and why

Do not use this file as a changelog or a dump of random test results.

## 1. When To Maintain This File

Maintain this file when any of the following are true:

- the project has multiple user-facing workflows
- the project has material reliability, security, or data integrity risk
- the project includes AI behaviour but also has non-AI quality requirements
- the team needs a shared merge or release bar
- the work spans multiple agents, contributors, or handoffs

At L0 this file is not needed. If the project is serious enough to have roadmap discipline, it usually deserves an explicit quality bar as well.

## 2. How This Differs From Other Core Docs

Which doc holds what: CLAUDE.md §7. If a quality expectation is meant to stay true across multiple milestones, it belongs here instead of being copied into every roadmap item.

## 3. Quality Philosophy

Prefer quality standards that are:

- visible
- testable
- proportional to risk
- tied to real user or operational impact
- supported by concrete evidence

Avoid vague standards like:

- "should be solid"
- "needs polish"
- "seems production-ready"

If the bar matters, define how to tell whether it was met.

## 4. Quality Areas

Use one section per area that materially matters to the project.

Common areas: functional correctness, workflow clarity, latency, reliability and failure handling, security and privacy, data integrity and migration safety, AI output quality, observability and recovery, documentation.

### Quality Area: Name

- Status:
- Why it matters:
- User or system affected:
- Minimum bar:
- Preferred target:
- Evidence required:
- Validation method:
- Release impact if this fails:
- Related roadmap milestone:
- Related review:
- Related evals:
- Notes:

## 5. Rigour And Level

- The rigour tier of a change decides how much testing and review that change needs (`CONVENTIONS.md`, "Rigour follows risk").
- The project's level (`LEVELS.md`) decides the coverage, suites and documentation the project carries, not the testing one change needs.

When the level changes, update this file.

## 6. Evidence Expectations

Quality claims should point to concrete evidence.

Good evidence may include:

- lint, typecheck, test, and build results
- screenshots or recorded user-flow checks
- migration dry runs
- load or latency measurements
- regression-set output comparisons
- eval results or rubric reviews
- dashboards, logs, alerts, or smoke checks
- runbooks or rollback notes for risky changes

Prefer evidence that the next agent or reviewer can inspect quickly.

Avoid "tested locally", "looks fine" and "manual review passed". Say what ran, on what scope, and what signal counted as success.

## 7. Quality Gates

Define the minimum gate for each stage that matters.

### House Defaults: Commit, Merge, Release

- **Commit.** The shared hook runs cheap staged checks (publication, CI
  configuration, structure, deliverables) and reads evidence; it runs no
  suite. Lint, typecheck and the tests for the affected behaviour need a
  passing record: declare the project's own commands, where its tooling
  lives, under `code_checks` in `scripts/validate.config.json`, then run
  `<python> scripts/selftest_code_quality.py --evidence` before committing.
  A record is bound to the check's files, config, lockfiles, declaration,
  runtime versions and platform (`hooks/code_evidence_check.py` lists them).
  Matching evidence is reused; a changed input reruns only the checks it
  affects; a failed or skipped required check never satisfies the commit.
- **Merge.** CircleCI runs the full unit suite and the production build on a
  ready pull request, with lint and typecheck checked again on the submitted
  revision. Run integration or browser checks before merge when the change
  relies on them. Nothing repeats the local suite at push.
- **Release.** The broader checks the release needs (cross-browser,
  performance, migration, recovery), reusing matching evidence and rerunning
  what changed; where merge deploys, they complete before merge.

A test check can name `changed_command` with a `{files}` argument (for
example `["pnpm", "exec", "vitest", "related", "--run", "{files}"]`, with
`"cwd": "apps/web"`); it receives the changed covered files, relative to
`cwd`, and the full `command` runs when config, lockfiles or the declaration
changed. A check with `"required": false` may be recorded with `--evidence
NAME --skip --why "..."`.

### Before Merge

At minimum, state:

- which validation must pass
- which docs must be updated
- which reviews are required
- which risks can be accepted temporarily

### Before Release

State only what matters for the product:

- release validation
- operational checks
- migration or data safety checks
- monitoring or rollback readiness
- approval or signoff requirements

If the project is not yet at a release stage, say so explicitly.

## 8. No Quality Debt

There is no debt register. A quality gap, bug, security issue or missing test is fixed in the same work or becomes the next ROADMAP item, with a spec where the work needs one (CONVENTIONS.md, no parked problems). Nothing is recorded here as accepted or known debt; a defect in another owner's code is reported to that owner.

## 9. Change Triggers

Update this file when:

- the project's level changes
- a new critical workflow is added
- release expectations become stricter
- the validation strategy changes materially
- AI quality requirements change in a way that affects the overall bar
- a repeated failure shows the current bar is too weak

### Application assurance triggers

Declare the active features and their evidence in the work spec when a
feature is introduced or materially changed, from L1. The project's level sets the
floor of suites and documentation. The feature sets the applicable checks
immediately. How much testing and review one change gets is its rigour tier.

| Feature | Evidence at introduction |
|---|---|
| Accounts or privileged operations | Session expiry and revocation, role and ownership denials, allowed control, final state |
| Tenants | Cross-tenant denied reads and writes through the real application and policy boundary |
| Personal data | Export completeness, deletion and retention, redacted logs, preserved neighbouring data |
| Billing | Provider test-mode entitlements, webhook replay and idempotency |
| Jobs | Retry and recovery, failure alerts, duplicate execution and final side effects |
| AI | Frozen quality cases, injection, privacy and an explicit call, token and cost budget |
| Microphone | Permission denial, interruption and resource cleanup, including a real-device check |
| Dockerfile or shipped image | Add the Trivy lane in the introducing change when the approved container rollout reaches the project |

L0 (Explore) requires no lanes, feature lanes included. From L1, run the
strict compiler or Python baseline, lint, locked dependency verification,
secrets protection, input validation and focused tests, with negative
feature tests, regressions and integration wherever a service determines
correctness. L2 builds the
L3 release evidence before live traffic. Include critical browser/API
journeys, accessibility and manual checks, selected visual comparisons,
migration and recovery checks, security scans, threat modelling,
authenticated local or staging DAST, targeted fuzzing
and measured performance where applicable. L3 adds the privacy
lifecycle and operational recovery dossier. L4 adds capacity,
accessibility and compliance evidence at scale. L5 adds locale,
Unicode, text expansion, dates, tax and residency evidence.

For every required lane record the revision, command, exit status, elapsed
time, tool versions, target environment, real or mocked boundary and
artefact. Record reasons for inapplicable cases. Required failures, crashes,
timeouts and unavailable tools block the lane. Capture denied actions
and final side effects as well as an allowed control. Inspect coverage
on critical changed code and preserve project floors.

At the assurance checkpoint, run
`<python> "<repos>/_projects-admin/scripts/heavy.py" run -- <python>
scripts/selftest_code_quality.py --assurance FILE` on a local JSON receipt. Set `level` (0 to 5), `has_code`, `revision`, `dirty` and `features` (use
`accounts`, `tenancy`, `personal-data`, `billing`, `jobs`, `ai`,
`microphone` and `container` where active). The checker lists the missing
lane keys. Put each result under its key in `lanes` with `status`,
`exit_code`, `duration_seconds`, `revision`, `dirty`, `command`, `environment`,
`scope`, `tool_versions` and the local `artefact` path. Use a reason for a
conditional level lane that is not applicable. Active features require
passing receipts. The reviewer confirms the declarations, the intended
revision, clean or dirty state and the substance of the artefacts. The
checker verifies receipt structure and coverage of the declared lanes.

The static lane uses the product kit bridge. Locked-dependency evidence
comes from the package manager's frozen install and audit. Secrets
evidence comes from the house publication scanner and the applicable
Gitleaks lane. Boundary evidence comes from the project's tests.

Affected tests are selected by the project's declared test check (§7,
`changed_command`); its evidence record is the receipt for that lane.

Mutation testing applies to changes in the first rigour tier, scoped to
the changed logic: start with one changed pure-logic scope per run and a
15 to 30 minute local Stryker budget. Record the measured score and
each meaningful survivor. Keep existing floors. For critical integration
boundaries, seed one representative fault per applicable control
(auth, ownership, billing, deletion and privacy), run a clean control and
require every meaningful seeded fault to be detected. A crash does not
count as detection. Record equivalent faults and why. Start property
tests at 100 bounded examples and retain the seed and shrink path.

At lockfile change and before release, record the project's package
audit including relevant development and build dependencies. Keep
Gitleaks alongside the publication scan, Knip report-only at first,
and one SBOM per release when the project adopts that release lane.
Keep ZAP local or staging with checked-in configuration. Keep hosted
pilots and CI activation on their separate milestones.

## 10. Reporting Expectations

When substantial work is reported, include:

- which quality areas were affected
- which evidence was gathered
- what was not checked
- whether any quality debt was created or removed
- whether a review or release gate remains open

## 11. Lightweight Starter Example

### Quality Area: lesson generation workflow

- Status: active
- Why it matters: it is the core user value path
- User or system affected: learners and content reviewers
- Minimum bar: generated lessons are structurally valid, faithful to source, and usable without heavy manual repair
- Preferred target: most outputs need only light editorial adjustment
- Evidence required: schema validation, regression examples, and rubric review
- Validation method: rerun canonical generation cases and inspect representative outputs
- Release impact if this fails: low trust in the core product experience
- Related roadmap milestone: 1.2 learner content generation quality improvements
- Related review: output quality review before release
- Related evals: article-to-lesson generation rubric in `EVALS.md`
- Notes: raise the bar before broad rollout, not after scaling reviewer load
