# ONBOARDING

## Project

- Name: `HoweCreative`
- Type: Vite + React single-page portfolio with Vercel serverless contact endpoint
- Origin: initially pulled from a generic Figma export, then progressively refactored into a real production portfolio

## Current State

- `Home.tsx` composes the editorial experience from `src/app/concept/`.
- Site content is sourced from `site-content.json` through `src/app/data/portfolio.ts`.
- `/cv` is a standalone, lazy-loaded, printable route.
- The contact form uses browser-side Web3Forms delivery on the free plan.
- The legacy dossier/WebGL components remain in the repository but are not mounted by the active home page.

## Setup

### Install

```bash
npm install
```

The root `.npmrc` sets `legacy-peer-deps=true`, which is required for React 19 compatibility with some packages in the dependency tree.

### Environment variables

The contact form requires an `EMAIL_ACCESS_KEY` to send mail via Web3Forms.

1. Copy the key from the Vercel dashboard: **Project Settings → Environment Variables → `EMAIL_ACCESS_KEY`**
2. Create `.env.local` in the project root:

   ```
   EMAIL_ACCESS_KEY=your_key_here
   ```

3. `.env.local` is gitignored — never commit it.

The default `CONTACT_TRANSPORT=client` flow treats this access key as a public
form identifier. `vite.config.ts` maps `EMAIL_ACCESS_KEY` into the browser
bundle because free-plan submissions must originate client-side. A legacy
`VITE_EMAIL_ACCESS_KEY` value is also accepted.

For paid-plan server submission, set `CONTACT_TRANSPORT=server` and
`WEB3FORMS_SERVER_ACCESS_KEY`, then configure Web3Forms IP allowlisting. Never
use the server-only variable in client mode.

### Dev commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite frontend, including the normal browser-side contact flow |
| `vercel dev` | Full stack, including the paid-plan serverless fallback |
| `npm run build` | Production build (output to `dist/`) |
| `npm run typecheck` | TypeScript strict check (no emit) |
| `npm run lint` | ESLint check across `src/` and `api/` |
| `npm test` | Run Vitest tests |

## Active Content Areas

- Solana Diary
- AI Portfolio System
- Noticia Lingo
- Badger Club
- UNCX Video & 3D System
- UNCX Rebrand
- UNCX Academy
- UNCX Unified Menu
- UNCX App Prototyping

## Notes

- Primary content source: `site-content.json`
- Local media source: `/public/case-studies/*`
- Deployment target: Vercel (`vercel.json` with `dist` output)
- `docs/plans/` records design history; `ROADMAP.md` is the current queue
- README documents ownership for career facts repeated across JSON, homepage, and CV copy
