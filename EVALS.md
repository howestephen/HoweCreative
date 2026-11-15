---
status: dormant
author: stephen+claude
activates: at L2 if the project includes AI-driven behaviour (prompts, generation, extraction, ranking, retrieval, agent workflows)
level: L2 (conditional on AI)
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# EVALS

Use this file when the project includes AI behaviour that must be judged, not just code that must compile.

This file is optional for simple projects. It becomes important when prompts, model selection, retrieval, generation, ranking, extraction, classification, or agent workflows materially affect product quality.

## 0. Purpose

This document defines how the project checks whether AI-assisted behaviour is actually good enough.

Use it to make quality visible and repeatable.

Do not use it as a random log of test runs.

## 1. When To Maintain This File

Maintain this file when the project includes any of the following:

- prompt-driven features
- model-generated text, images, audio, or video
- structured extraction or transformation
- ranking, routing, or tool-choice logic
- retrieval-augmented generation
- agent workflows with multiple steps
- human-in-the-loop review gates

If the project has no meaningful AI behaviour beyond incidental helper usage, say so explicitly and keep this file short.

## 2. Evaluation Philosophy

The goal is not "perfect output."

The goal is:

- stable useful output
- acceptable failure modes
- visible regression detection
- clear judgment criteria for future agents

Prefer evaluation that is:

- concrete
- reproducible
- cheap enough to rerun
- tied to real product behaviour

Avoid vague statements like "results looked good."

## 3. System Areas To Evaluate

List the AI-facing behaviours that matter.

- Area:
- Why it matters:
- Failure mode to watch:
- How quality is judged:

Example:
- Area: lesson generation from article input
- Why it matters: this is the main user value loop
- Failure mode to watch: lessons become generic, repetitive, or factually loose
- How quality is judged: prompt output review against rubric, sample regression set, and user completion metrics

## 4. Evaluation Layers

Use only the layers that fit the project.

### 4.1 Golden Examples

Use representative examples with known-good expectations.

Track:

- input
- expected output shape
- minimum acceptable quality
- known edge cases

Good for:

- extraction
- classification
- formatting
- structured JSON output

### 4.2 Rubric Review

Use a rubric when output quality cannot be fully captured by exact matching.

Rubric dimensions may include:

- correctness
- completeness
- tone
- brand alignment
- usefulness
- faithfulness to source
- visual consistency
- safety

For each rubric dimension, define:

- what good looks like
- what unacceptable looks like

### 4.3 Regression Set

Maintain a small stable set of real examples that should be rerun after meaningful prompt, model, retrieval, or workflow changes.

Track:

- case name
- why it is included
- what tends to break
- expected acceptance threshold

### 4.4 Workflow Orchestration Checks

For multi-step AI systems, evaluate:

- tool choice
- context assembly
- ordering of steps
- retries and fallback behaviour
- failure visibility

### 4.5 Human Review Gates

Use explicit human review when:

- the consequence of bad output is high
- quality is subjective
- automation cannot yet score the result reliably

State:

- what requires review
- who reviews it
- what approval standard applies

## 5. Core Evaluation Template

Use one section per meaningful AI behaviour.

### Evaluation: Name

- Status:
- Related roadmap milestone:
- Feature or workflow:
- User-facing impact:
- Primary failure modes:
- Inputs:
- Expected output characteristics:
- Acceptance rule:
- Validation method:
- Automation level: manual / semi-automated / automated
- Related prompts or assets:
- Related model or provider assumptions:
- Notes:

## 6. Canonical Cases

Keep a compact list of the cases future agents should use first.

- Case:
- Purpose:
- Input location:
- Expected signal of success:
- Known failure pattern:

## 7. Operational Quality Signals

If the project has live usage, capture the real-world signals that help confirm whether AI behaviour is improving or degrading.

Possible signals:

- completion rate
- edit rate after generation
- human approval rate
- retry rate
- fallback rate
- time-to-useful-output
- user complaint patterns
- moderation or safety incidents

For each signal, track:

- signal name
- why it matters
- where it is observed
- what change would trigger concern
- whether it is leading or lagging

## 8. Change Triggers

Update this file when any of these change:

- canonical prompts
- model choice
- generation workflow
- retrieval source or ranking logic
- output contract
- evaluation rubric
- human review policy

If behaviour changed but this file did not, explain why.

## 9. Reporting Expectations

When an agent changes AI behaviour, the report should say:

- what AI-facing behaviour changed
- which evals or review methods were run
- what was not rerun
- whether expected quality changed
- whether new failure modes were discovered

## 10. Lightweight Starter Example

### Evaluation: article-to-lesson generation

- Status: active
- Related roadmap milestone: 1.2 learner content generation
- Feature or workflow: convert a current-events article into a leveled lesson
- User-facing impact: core product quality
- Primary failure modes: weak summaries, repetitive exercises, factual drift, tone mismatch
- Inputs: article URL, CEFR target, lesson length target
- Expected output characteristics: factually grounded summary, useful vocabulary section, coherent exercises, level-appropriate language
- Acceptance rule: passes rubric review on factuality, level fit, and usefulness; no malformed output
- Validation method: rerun regression set plus manual review of three representative outputs
- Automation level: semi-automated
- Related prompts or assets: see `PROMPT_ASSETS.md`
- Related model or provider assumptions: current primary LLM must support structured output reliably
- Notes: rerun after changes to source selection, prompt framing, or output schema
