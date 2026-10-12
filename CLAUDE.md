---
status: active
author: stephen+claude
updated: 2026-10-12
---

# Project rules for AI agents

These are standing instructions from Stephen. They are not suggestions.

Read [CONVENTIONS.md](CONVENTIONS.md) on every task: it holds the house
standards from the `ai-product-base` kit (Git, clean-up, audit, code
baseline). This file wins where they differ. No level is declared, so every
main merge or push needs Stephen's approval.

## Autonomy

The house defaults (commits, folders, deletion, subagents) are in
CONVENTIONS.md. These lines tighten them here:

- Main: no level is declared, so every main merge or push needs Stephen's
  approval, per instance. Work on a feature branch and push it immediately.
- The folder lock is `top_dirs` in `scripts/validate.config.json`.
- Media is archived, never deleted (see Assets).

## Read in this order

1. This file, then [CONVENTIONS.md](CONVENTIONS.md)
2. [ONBOARDING.md](ONBOARDING.md) for project context and setup
3. [ROADMAP.md](ROADMAP.md) for the current task
4. [ARCHITECTURE.md](ARCHITECTURE.md) when touching code
5. The active plan in `docs/plans/` if the roadmap task names one

## Done means audited

Before a task is called done, an independent agent audits the change
adversarially for bugs, broken code and overclaims; fix its findings and
re-audit.

## Handoffs

Between tools or sessions, copy [handoffs/TEMPLATE.md](handoffs/TEMPLATE.md)
to `handoffs/YYYY-MM-DD-topic.md`. The `owner` field is whose turn it is; the
receiver acts on the file alone, writes back, flips `owner` and bumps `round`.
Round 3 escalates to Stephen.

## Copy

- **Never use em-dashes (—) or en-dashes (–)** in site copy, UI strings, the CV,
  or any user-facing text. Use a plain hyphen "-" instead. No exceptions, ever.
- Never describe Solana Diary (or similar work) as "autonomous" or as "an AI
  system". It was an automated media pipeline with human Telegram approval,
  built *with* AI tools. Grok was an optional, button-triggered assist.
- Never invent or aggregate metrics without attribution. Every stat must name
  the job or project it came from (e.g. "30 games shipped at Switch Studios").
- Do not claim audience/follower numbers for Solana Diary - the account was
  purchased with existing followers.

## Assets

- **Never delete project images, screenshots, or media.** If an asset is no
  longer used on the site, move it to `assets-archive/` (git-ignored, stays on
  Stephen's machine) so future redesigns can reuse it. All project screenshots
  live in this repo.

## Privacy

- Stephen's email address and phone number must not appear in page copy,
  metadata, or structured data. Contact goes through the form. The `/cv` page
  is the one deliberate exception (email only).
- `docs/private/` is git-ignored source material. Never commit or publish it.

## Branches

- Keep exactly two long-lived branches: `main` and the single active redesign
  branch. Retire merged or superseded branches immediately; tag anything worth
  keeping instead of leaving a branch.
- Both stay live. `codex/creative-technologist-portfolio` is the demonstration
  site (`howecreative-particle`) and builds on every push: the one exception to
  the Vercel build policy in CONVENTIONS.md. Never give it main's `git`
  build setting.
- Both branches carry the same agent guidance (this file, CONVENTIONS.md,
  AGENTS.md, handoffs/TEMPLATE.md, `scripts/validate*`, `.claude/launch.json`).
  Change it on both in the same task.

## Verification

- Before any commit: `npm run typecheck && npm test && npm run lint && npm run build`.
- The preview runs through the house preview controller (`vite preview` of
  `dist` on port 5175): `python3.13 <repos>/_projects-admin/scripts/project_control.py start`
  from this repository, after `npm run build`. Share the Tailscale link its
  `status` reports. `.claude/launch.json` only attaches to that server; never start a
  second one on a guessed port.
