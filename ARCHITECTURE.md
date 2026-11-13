---
status: active
author: stephen+claude
updated: 2026-10-12
---

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

On `codex/creative-technologist-portfolio`, the portrait experience is the
root route; `/study` redirects to it. The Three.js portrait chunk is
lazy-loaded.

The portrait is one draw call of points sampled from
`public/portrait/portrait-source.webp`: colour on the left half, a monocular
depth estimate on the right, written by `scripts/build-portrait-depth.mjs`
from the 2x reference in the same folder. `portrait-particles.ts` holds the
sampler and the shaders. A point's whole path is a closed-form function of
scroll and time, with no simulation state: the erosion front, a five-step
walk through a divergence-free flow field, its place in a wrapped field of
two dust sheets, and the walk home at the end of the page. The scalar blocks
of the vertex shader are exported and run as JavaScript by
`PortraitScene.test.tsx`, so the tests execute the shader's own arithmetic.
`PortraitScene.tsx` owns the renderer, the lens and the frame loop;
`portrait-post.ts` draws into a half-float buffer and adds bloom, and is the
one module the scene tests replace. Without WebGL, with reduced motion or
when the glow chain cannot be built, the page shows the static portrait.

Glass panels are HTML over the canvas: a backdrop blur, a gradient rim and a
pointer-led highlight in `portrait.css`. The practice section's copy is
written out in `PortraitExperience.tsx` and held to `cv.json` by a test,
because `cv.json` carries the email address and must stay in the lazy CV
bundle (`scripts/verify-build.mjs` enforces that).

The archive and case-study routes use
HTML-first content, route-specific CSS and the same dark spatial shell. Archive
filters are stored in the URL. V7 and the mixed UNCX application concepts are
not linked from the new public archive; the existing public assets remain an
open audit item and are not protected by this UI decision.

Case-study and Earlier Work images are served responsively.
`scripts/build-thumbs.mjs` writes WebP copies at standard widths into each
folder's `thumbs/` and records every image's size in
`src/app/data/image-variants.json`. `ResponsiveImage` offers those copies as a
`srcset` and measures its own box after layout, allowing for `object-fit`, so
retina screens get enough pixels and phones fetch small copies. Re-run the
script after adding or replacing an image.

Contact delivery has two explicit modes:

- `client` (default/free): `EMAIL_ACCESS_KEY` is embedded as Web3Forms' public
  form identifier and the browser submits directly.
  A build without the key, such as the redesign in its own Vercel project,
  fetches it from the main site's `api/contact-key.ts`, which reads the same
  `EMAIL_ACCESS_KEY`.
- `server` (paid): the browser calls `api/contact.ts`, which reads only
  `WEB3FORMS_SERVER_ACCESS_KEY` and requires provider IP allowlisting.

The form carries an hCaptcha widget with Web3Forms' shared free-plan site key
(`WEB3FORMS_HCAPTCHA_SITEKEY` in `src/app/concept/contact-request.ts`), dark on
the spatial variant, and will not send until it is solved. The token goes to
Web3Forms as `h-captcha-response`; Web3Forms enforces it once hCaptcha is
switched on for the form in its dashboard. The server mode does not forward the
token yet.

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

- posting pipeline design, posting pipeline implementation and Telegram
  setup: local working notes, not in this repository

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

## Publishing under /particle-redesign

This branch deploys to its own Vercel project, and the main site proxies it at
`howecreative.co.uk/particle-redesign`. The prerender writes page links and the
canonical URL with that prefix (the home page slash-less), and
`scripts/verify-build.mjs` fails the build if a page link lacks it. The
project's `vercel.json` serves each known study from its prerendered page and
sends every other non-asset path to the app, which shows its not-found page.
When the redesign is promoted, the domain moves to this project; the main site
never proxies the whole site.
