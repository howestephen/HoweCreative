# ARCHITECTURE

## Current Repo

`HoweCreative` is currently:

- a Vite + React single-page portfolio
- deployed to Vercel
- backed by a small Vercel serverless contact endpoint

Current runtime boundaries:

- frontend: `src/`
- contact API: `api/contact.ts`
- deployment target: Vercel

There is no Solana monitor, Telegram bot, Postgres pipeline, or Railway worker code in this repo today.

## Adjacent Planned System

This repo now also holds planning docs for a future adjacent service:

- `solana-diary-poster`

That planned service is intended to run separately on Railway and integrate with:

- shared Postgres
- Telegram
- X
- an upstream monitor/render pipeline that already produces dataset payloads and rendered assets

Relevant planning docs:

- [docs/plans/2026-03-24-posting-pipeline-design.md](/Users/stephenhowe/Repos/HoweCreative/docs/plans/2026-03-24-posting-pipeline-design.md)
- [docs/plans/2026-03-24-posting-pipeline-impl.md](/Users/stephenhowe/Repos/HoweCreative/docs/plans/2026-03-24-posting-pipeline-impl.md)
- [docs/telegram-bot-setup.md](/Users/stephenhowe/Repos/HoweCreative/docs/telegram-bot-setup.md)

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
