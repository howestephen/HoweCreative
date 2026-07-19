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
