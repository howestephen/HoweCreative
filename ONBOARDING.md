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

- Install with:
  - `npm install --legacy-peer-deps`
- Frontend dev:
  - `npm run dev`
- End-to-end local API testing:
  - `vercel dev`

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
