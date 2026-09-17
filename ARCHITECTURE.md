# ARCHITECTURE

## Current Repo

`HoweCreative` is currently:

- a Vite + React single-page portfolio
- deployed to Vercel
- using Web3Forms for contact delivery
- carrying a Vercel serverless contact fallback for paid-plan use

Current runtime boundaries:

- active homepage: `src/app/concept/`
- branch review experience: `src/app/experience/PortraitExperience.tsx` at `/study`
- branch work archive: `src/app/pages/Archive.tsx` at `/archive`
- shared public case-study template: `src/app/pages/Project.tsx`
- standalone printable CV: `src/app/pages/CV.tsx`
- typed content adapter: `src/app/data/portfolio.ts`
- primary content model: `site-content.json`
- optional contact API fallback: `api/contact.ts`
- deployment target: Vercel

The CV route is lazy-loaded so its long career-history module does not block the
homepage. The active editorial homepage uses Canvas 2D for its generative mark.
The previous WebGL/dossier components are retained but not mounted while the
replacement design is reviewed.

On `codex/creative-technologist-portfolio`, the review experience is kept at
`/study` so it can be tested without changing the production root route. The
Three.js portrait chunk is lazy-loaded. The archive and case-study routes use
HTML-first content, route-specific CSS and the same dark spatial shell. Archive
filters are stored in the URL. V7 and the mixed UNCX application concepts are
not linked from the new public archive; the existing public assets remain an
open audit item and are not protected by this UI decision.

Contact delivery has two explicit modes:

- `client` (default/free): `EMAIL_ACCESS_KEY` is embedded as Web3Forms' public
  form identifier and the browser submits directly.
- `server` (paid): the browser calls `api/contact.ts`, which reads only
  `WEB3FORMS_SERVER_ACCESS_KEY` and requires provider IP allowlisting.

Career facts have multiple audience-specific presentations. Structured project
facts live in `site-content.json`; homepage career summaries live in
`Method.tsx`; the complete application document lives in `CV.tsx`. Repeated
dates, titles, and metrics must be audited as one content change.

There is no Solana monitor, Telegram bot, Postgres pipeline, or Railway worker
runtime code in this repo.

## Adjacent Planned System

This repo also holds planning docs and portfolio media for an adjacent service:

- `solana-diary-poster`

That planned service is intended to run separately on Railway and integrate with:

- shared Postgres
- Telegram
- X
- an upstream monitor/render pipeline that already produces dataset payloads and rendered assets

Relevant historical planning docs:

- [posting pipeline design](docs/plans/2026-03-24-posting-pipeline-design.md)
- [posting pipeline implementation](docs/plans/2026-03-24-posting-pipeline-impl.md)
- [Telegram setup](docs/telegram-bot-setup.md)

## Architectural Boundary

The planned poster service should be treated as:

- a separate deployable
- a separate Railway service
- a consumer of shared DB state rather than a direct caller of monitor internals

It should share:

- Postgres
- environment secrets
- internal auth conventions

It should not share:

- runtime imports from this Vite site
- deployment process with the Vercel portfolio app

## Why This Matters

These boundaries keep:

- the public portfolio simple
- the posting pipeline independently deployable
- operational failures isolated between site and worker systems
