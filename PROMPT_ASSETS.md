---
status: dormant
author: stephen+claude
activates: at L2 if the project uses canonical prompts, prompt templates, or reusable AI-facing assets
level: L2 (conditional on AI)
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# PROMPT_ASSETS

Use this file to track the reusable prompts, context blocks, schemas, and AI-facing assets that shape project behaviour.

This is not a dumping ground for every experimental prompt. It is the inventory of prompts and related assets that matter to the system.

## 0. Purpose

Prompt systems are part of the product.

This file exists to answer:

- which prompts are canonical
- what each one is for
- which inputs it expects
- what output contract it should satisfy
- what evals or review standards apply

If prompts are scattered and undocumented, future agents will break behaviour by accident.

## 1. What Counts As A Prompt Asset

Include:

- system prompts
- reusable task prompts
- prompt templates
- schema definitions tied to prompts
- reusable context builders
- style guides for generation
- retrieval context assembly rules
- agent role instructions that materially affect output

Exclude:

- one-off throwaway experiments that are not part of the intended system

## 2. Asset Template

Use one section per meaningful asset.

### Prompt Asset: Name

- Status:
- Canonicality: canonical / experimental / deprecated
- Purpose:
- Location:
- Owner:
- Used by:
- Required inputs:
- Optional inputs:
- Output contract:
- Model assumptions:
- Safety constraints:
- Related evals:
- Related roadmap milestone:
- Notes:

## 3. Prompt Design Rules

Prefer prompts that are:

- explicit about task and output shape
- grounded in available context
- separated from volatile data
- easy to test against examples
- easy to update without hidden coupling

Avoid:

- giant monolithic prompts that do multiple jobs
- undocumented prompt dependencies
- silent schema drift
- prompts whose success depends on hidden tribal knowledge

## 4. Versioning Guidance

If prompt behaviour changes in a meaningful way, record:

- what changed
- why it changed
- what eval or review should be rerun
- whether downstream output expectations changed

If the project uses prompt files in code, prefer linking to them here rather than pasting the full text unless the prompt is short and stable.

When an asset becomes obsolete, mark it as `deprecated` instead of silently removing its existence from project memory if downstream systems may still reference it.

## 5. Related Assets

Prompt behaviour may depend on more than prompt text.

Track related assets such as:

- JSON schemas
- formatting examples
- brand/style rules
- allowed tool lists
- retrieval source lists
- output examples

## 6. Starter Example

### Prompt Asset: lesson-generation core prompt

- Status: active
- Canonicality: canonical
- Purpose: transform a source article into a leveled lesson draft
- Location: `prompts/lesson-generation.md`
- Owner: product + content workflow
- Used by: lesson generation pipeline
- Required inputs: article content, target level, lesson length target
- Optional inputs: topic focus, vocabulary target, learner interests
- Output contract: structured lesson draft with summary, vocabulary, exercises, and review section
- Model assumptions: primary model supports consistent structured output
- Safety constraints: must stay faithful to source content and avoid unsupported claims
- Related evals: article-to-lesson generation rubric in `EVALS.md`
- Related roadmap milestone: 1.2 learner content generation
- Notes: rerun regression set after changing schema or output section order
