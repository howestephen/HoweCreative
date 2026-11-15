---
status: dormant
author: stephen+claude
activates: when L2 consolidation begins or formal review is needed
level: L2
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# REVIEW

Use this file to define how important work is reviewed and how review outcomes are recorded.

This file is about decision-making and findings, not the permanent quality bar itself.

## 0. Purpose

Use this file to answer:

- which kinds of changes require formal review
- what each review is trying to prove
- who should review or approve the work
- where findings, decisions, and accepted risks should be recorded

If `QUALITY.md` says what standard must be met, `REVIEW.md` says how the project checks and records whether that happened.

## 1. When To Maintain This File

Maintain this file when any of the following are true:

- multiple people or agents contribute to the project
- architecture or workflow decisions need explicit approval
- the project has risky areas such as auth, billing, migrations, or write-capable integrations
- AI output requires subjective or policy-based review before release
- releases need an explicit readiness decision rather than an informal merge habit

For very small solo experiments, this file can remain minimal. Once review decisions matter, document them here instead of leaving them implicit in chat history.

## 2. Review Types

Use only the review types that fit the project.

### Design Review

Use before major changes to architecture, data model, system boundaries, or long-lived workflow design.

### Implementation Review

Use before merge for behaviour changes, refactors with risk, migrations, or infrastructure work.

### AI Behaviour Review

Use when outputs need judgment that is not captured by automated checks alone.

### Security Or Trust Review

Use when access boundaries, secrets, auth, payments, destructive actions, or MCP capabilities change.

### Privacy Review

Use when PII classification changes, retention policies are set, consent flows are added, or data processing scope expands. Required at L3+.

### Compliance Review

Use when new regulatory obligations apply, market expansion introduces new jurisdictions, or audit-evidence obligations change. Required at L3+.

### Safety Review

Use when abuse surfaces change, AI output reaches users, content moderation rules change, or age-gating logic changes. Required at L3+.

### Release Review

Use before shipping meaningful user-visible changes, risky backend changes, or irreversible data operations.

## 3. Review Status Language

Use clear status labels:

- `not_needed`
- `pending`
- `approved`
- `approved_with_followups`
- `changes_required`
- `blocked`

Do not treat vague verbal agreement as durable review state.

## 4. Review Record Template

Use one section per formal review that matters.

### Review: Name

- Status:
- Review type:
- Date:
- Scope:
- Trigger:
- Reviewer or approver:
- Related roadmap milestone:
- Related quality areas:
- Related evals:
- Related trust-boundary docs:
- Material inspected:
- Questions this review must answer:
- Findings:
- Required changes:
- Accepted risks:
- Evidence checked:
- Decision:
- Follow-up owner:
- Follow-up due or trigger:
- Notes:

## 5. Review Checklist

At minimum, important reviews should confirm:

- the scope still matches the roadmap or plan
- the implementation solves the stated problem
- the validation run matches the actual risk
- docs are current where behaviour or architecture changed
- unresolved findings are explicit
- accepted risks are named rather than implied

When relevant, also confirm:

- migrations are reversible or safely staged
- auth, privacy, or permissions were reviewed
- MCP or external integration boundaries were rechecked
- AI evals or rubric reviews were rerun
- rollout, monitoring, or rollback plans exist

## 6. Where Findings Belong

Keep different kinds of review output in the right places:

- code-specific defects: code review, inline comments, or PR discussion
- cross-cutting quality bar: `QUALITY.md`
- AI grading logic and canonical cases: `EVALS.md`
- milestone execution state: `ROADMAP.md`
- live integration trust decisions: the spend gate config for CLIs (an MCP server, if one returns: `_archive/MCP_TRUST_MATRIX.md`)
- formal review outcome, decision, and accepted risk: `REVIEW.md`

Do not force all review context into a roadmap item if it is really a broader decision record.

## 7. Merge And Release Rules

State the project's actual rules here instead of relying on habit.

Common examples:

- substantial work should not merge while review status is `changes_required` or `blocked`
- risky migrations should not ship without a release review
- auth, billing, or destructive actions should not ship without trust-boundary review
- major prompt, model, or workflow changes should not ship without eval evidence and output review

If exceptions are allowed, document:

- who can approve the exception
- what risk is being accepted
- what follow-up is required

## 8. Review Triggers

Update this file when:

- the team changes how approvals work
- a new review type becomes necessary
- repeated failures show current review depth is too weak
- a regulator, customer, or internal policy adds review requirements
- the project starts using new high-trust integrations or MCP servers

## 9. Reporting Expectations

When substantial work is reported, include:

- which review was completed, skipped, or still open
- the decision state
- the main findings or required follow-ups
- any accepted risks that remain

## 10. Lightweight Starter Example

### Review: lesson generation release review

- Status: `pending`
- Review type: release review
- Date:
- Scope: changes to lesson generation prompt, schema, and pipeline behaviour
- Trigger: planned rollout to a broader learner cohort
- Reviewer or approver: product owner plus content reviewer
- Related roadmap milestone: 1.2 learner content generation quality improvements
- Related quality areas: lesson generation workflow, reviewer workload
- Related evals: article-to-lesson generation rubric and regression cases
- Related trust-boundary docs:
- Material inspected: prompt asset, eval results, representative outputs, release notes
- Questions this review must answer: are outputs stable enough for broader rollout, and are failure modes visible?
- Findings:
- Required changes:
- Accepted risks:
- Evidence checked: regression rerun plus manual review of representative samples
- Decision:
- Follow-up owner:
- Follow-up due or trigger:
- Notes: do not approve rollout if only short-form cases were reviewed
