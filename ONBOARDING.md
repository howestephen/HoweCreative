# ONBOARDING

## Project

- Name: `HoweCreative`
- Type: Vite + React single-page portfolio with Vercel serverless contact endpoint
- Origin: initially pulled from a generic Figma export, then progressively refactored into a real production portfolio

## Current State

- Loading screen implemented and mounted in layout (`LoadingScreen.tsx` + `Layout.tsx`)
- Site copy centralized in `site-content.json` and typed via `src/app/data/portfolio.ts`
- Contact form now posts to `api/contact.ts` and reads `EMAIL_ACCESS_KEY` server-side
- Build passes with `npm run build`

## Setup

### Install

```bash
npm install
```

The root `.npmrc` sets `legacy-peer-deps=true`, which is required for React 19 compatibility with some packages in the dependency tree.

### Environment variables

The contact form API requires an `EMAIL_ACCESS_KEY` to send mail via Web3Forms.

1. Copy the key from the Vercel dashboard: **Project Settings → Environment Variables → `EMAIL_ACCESS_KEY`**
2. Create `.env.local` in the project root:

   ```
   EMAIL_ACCESS_KEY=your_key_here
   ```

3. `.env.local` is gitignored — never commit it.

The frontend Vite dev server (`npm run dev`) does **not** serve the API; `EMAIL_ACCESS_KEY` is only needed when running `vercel dev`.

### Dev commands

| Command | What it does |
|---|---|
| `npm run dev` | Frontend only — Vite dev server, no API routes |
| `vercel dev` | Full stack — frontend + API routes, reads `.env.local` |
| `npm run build` | Production build (output to `dist/`) |
| `npm run typecheck` | TypeScript strict check (no emit) |
| `npm run lint` | ESLint check across `src/` and `api/` |
| `npm test` | Run Vitest tests |

## Active Content Areas

- Noticia Lingo
- Badger Club
- UNCX Video & 3D System
- UNCX Rebrand
- UNCX Academy
- UNCX Unified Menu

## Notes

- Primary content source: `site-content.json`
- Local media source: `/public/case-studies/*`
- Deployment target: Vercel (`vercel.json` with `dist` output)
