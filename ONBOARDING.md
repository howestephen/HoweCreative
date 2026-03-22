# ONBOARDING

## Project

- Name: `Figmaportfolio2026`
- Type: Vite + React single-page portfolio
- Origin: pulled from a generic Figma export repo and now being adapted into Stephen Howe's real portfolio

## Current Direction

- Keep the exported visual language as a starting point, not as a fixed design
- Remove generic demo content and replace it with real projects, real media, and clearer structure
- Tidy the shell before attempting deeper visual invention

## Current Real Content

- Noticia Lingo
- Badger Club
- UNCX Video System

## Current Cleanup Priorities

1. Replace placeholder content with real portfolio content
2. Reduce generated/demo UI clutter
3. Make the homepage sections read more clearly
4. Decide what to keep from the current cyberpunk shell and what to simplify

## Notes

- Local media is currently sourced from `/public/case-studies/*`, copied from the earlier `portfolio-2026` repo
- This repo currently builds with `npm run build`
- Install currently relies on `npm install --legacy-peer-deps` because the Figma export brought in a broad dependency set with peer-version conflicts
