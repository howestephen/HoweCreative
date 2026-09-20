# Project rules for AI agents

These are standing instructions from Stephen. They are not suggestions.

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

## Verification

- Before any commit: `npm run typecheck && npm test && npm run lint && npm run build`.
- The dev server runs on port 5174 (5173 belongs to another project).

## Autonomy

House defaults, merged in by scripts/retrofit-check.py.
This project's own rules above take precedence where they conflict; say so
explicitly rather than silently.

- Default branch is always `main`, never `master`
- Commit without asking: yes
- Create new top-level folders: no
- Delete files: never without listing what changes and what references it
- One subagent at a time, never at your own tier or above
- **Global rules and machine profiles are read-only here.** `~/.claude/*.md`, the Codex aliases and `_projects-admin/machines/` belong to `_projects-admin`. Append what belongs there, with evidence, to `_projects-admin/REQUESTS.md`. Do not reach for a shell to do what the editor refused: redirects, `sed -i`, `tee`, `cp`, `mv` and `rm` are covered too
- **Spending money needs approval, per service, per session.** Paid APIs, image and video generation, hosted inference and purchases all prompt first. Never route around a prompt with another tool or an unlisted endpoint
- Push without asking: yes on a branch, never on main. A main push needs Stephen's permission, per instance. A creative project has no maturity level to declare, so the early-stage exemption that product projects get does not apply here and never will

The hook kit enforces these; they refuse rather than warn. A refusal is the answer, not an obstacle to route around. If a gate is genuinely wrong, say so and stop: the bypass is Stephen's.
