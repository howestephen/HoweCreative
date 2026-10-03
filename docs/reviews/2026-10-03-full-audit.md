# Consolidated audit findings (passes A to D)

Date: 3 October 2026. Targets: `main` (production, https://howecreative.co.uk, audited at `origin/main` `8a5cbf4`) and the redesign branch `codex/creative-technologist-portfolio` (https://howecreative.co.uk/particle-redesign, audited at `d531010`). Passes: A code correctness, B live site and security, C accessibility, responsive layout and performance, D content and copy. The pass reports with full evidence are kept privately at `docs/private/2026-10-03-audit/` (git-ignored). Fixes are packaged in [the audit work plan](../plans/2026-10-03-audit-work-plan.md).

## Summary

| Severity | Count | IDs |
| --- | --- | --- |
| P0 | 0 | none |
| P1 | 3 | A-9, A-10, C-1 |
| P2 | 12 | A-1, A-2, A-3, A-6, B-1, B-2, B-3, B-4, C-2, C-3, C-4, D-1 |
| P3 | 24 | A-4, A-5, A-7, A-8, A-11 + A-14, A-12, A-13, B-5, B-6, B-7, B-8, B-9, B-10, B-11, C-5, C-6, C-7, C-8, C-9, C-10, C-11, C-12, D-2, D-3 |
| Total | 39 | from 40 original findings; A-11 and A-14 merged |

Deduplication notes:
- A-11 (redesign) and A-14 (main) are one problem, unknown URLs, seen from each side; merged.
- Pass C's font measurement (176 kB of Google Fonts, 37% of main's home payload) is added to B-6, not filed separately.
- B-4, B-8, A-5 and A-7 all touch the contact form but are distinct defects; kept separate and fixed together (WP-9).
- A-10 (CV links broken) and B-7 (CV PDFs carry `noindex`) concern the same files but are distinct; cross-referenced.
- A-3, A-9, A-11, A-12 and B-7 share one root cause (the redesign served through rewrites under `/particle-redesign`) but each has its own fix; grouped in WP-6.

Re-verification: every P1 and P2 was re-checked on 3 October with one curl, grep or file read each, and all 15 still reproduce. A-9, A-10 and B-1 were checked again live by a second agent the same day.

Sensitive findings: B-4 only. Its exploitable detail is withheld here; details in `docs/private/2026-10-03-security-notes.md`.

## P1

| ID | Branch | Status | Where | Problem | Fix |
| --- | --- | --- | --- | --- | --- |
| A-9 | redesign (fix in main's `vercel.json`) | Confirmed | redesign `index.html:12,18`, `scripts/prerender.mjs:30`; main `vercel.json:7-14` | The redesign's canonical and `og:url`, `/particle-redesign/` (with slash), serves the main site, so shared and canonical links show the wrong site. | Add an explicit `/particle-redesign/` rewrite in main's `vercel.json` and make the canonical the slash-less form main forwards. |
| A-10 | redesign (PDFs served live) | Confirmed | `src/app/pages/CV.tsx:99-104`, `src/app/data/cv.json`, `scripts/build-cv.py:56-58`, `public/cv/*.pdf` | All three CV PDFs and the redesign CV page link to `howecreative.co.uk/work/<slug>`, which production does not serve. | A temporary `/work/:slug` to `/?study=:slug` redirect on main, or regenerate the links (decision 2); add a build check on every absolute link. |
| C-1 | main | Confirmed | `src/app/concept/WorkIndex.tsx:453` (lightbox `bg-background`), `src/app/pages/Archive.tsx:38-50`, `site-content.json` (`uncx-rebrand/uncx-logotype.svg`, `uncx-academy/logotype.webp`) | White logotypes are invisible on the cream lightbox and archive thumbnails; the UNCX Rebrand gallery opens on a blank slide. | Dark ground for the lightbox stage and thumbnails, or dark-ground variants of the two logotypes (decision 4). |

## P2

| ID | Branch | Status | Where | Problem | Fix |
| --- | --- | --- | --- | --- | --- |
| A-1 | main | Confirmed | `src/app/pages/Archive.tsx:86-93`, `WorkIndex.tsx:771-783` | Closing a study opened from the archive returns the visitor to the top of the archive. | Scroll to top only on PUSH navigation, or use `<ScrollRestoration />`. |
| A-2 | redesign | Confirmed | `src/app/components/Layout.tsx:11-19` | Every route change scrolls to top, so Back never returns to the previous position. | Gate the scroll on `useNavigationType() !== "POP"`, or `<ScrollRestoration />`. |
| A-3 | redesign | Confirmed | `src/prerender.tsx:34,42`, `scripts/prerender.mjs:30` | Prerendered (no-JS and crawler) links omit the `/particle-redesign` prefix and land on main. | Pass the public prefix into `render()`; have `verify-build.mjs` assert internal hrefs share the canonical's prefix. |
| A-6 | main | Confirmed | `src/app/concept/WorkIndex.tsx:755-763, 796-798, 868-877` | Browser Back (or the phone back gesture) with the lightbox open closes the study but leaves the lightbox on screen. | Clear the lightbox when `openProject` becomes null. |
| B-1 | main | Confirmed | main `vercel.json:39-42`, `public/` | `/robots.txt` and `/sitemap.xml` return the HTML app shell. | Add `public/robots.txt` and a generated `sitemap.xml`. |
| B-2 | main | Confirmed | main `index.html:10-37`, `Archive.tsx:87-91`, `CV.tsx:118-121`, `WorkIndex.tsx` | Every route ships the home page's title, description, canonical and OG tags; studies set no title. | Per-route metadata hook (or port the prerender), plus `trailingSlash: false`. |
| B-3 | both | Confirmed | both `vercel.json` (no `headers`), `index.html` | No CSP, nosniff, Referrer-Policy, frame protection or Permissions-Policy; main's HSTS is the weak form. | Add a `headers` block (CSP report-only first). |
| B-4 | both | Confirmed | contact form (details in `docs/private/2026-10-03-security-notes.md`) | The contact form has no abuse control beyond a honeypot; real enquiries can be crowded out. | Add a captcha or move to a server transport with durable rate limiting (decision 1). |
| C-2 | both | Confirmed | main `WorkIndex.tsx:800`; redesign `ProjectGallery.tsx:188-191, 96-99` | Closing the image lightbox drops keyboard focus to `<body>`. | Return focus to the triggering thumbnail after the dialog has closed. |
| C-3 | main | Confirmed | `src/app/concept/ContactFoot.tsx:112-125, 188-192` | Contact success and error states are not announced to screen readers. | Port `role="status"` and `role="alert"` from the redesign. |
| C-4 | both | Confirmed | main `Layout.tsx:47,60`, `WorkIndex.tsx:122-139, 494-510`, `ContactFoot.tsx:92-105`; redesign `portfolio.css:41-45`, `spatial-shell.css:21`, `cv.css:104-107` | Header, footer and CV links are 14 to 20 px tall tap targets; main's lightbox arrows and strip buttons are 24 to 38 px. | Pad links to at least 24 px (44 px on touch); enlarge main's lightbox arrows to 44 px. |
| D-1 | main | Confirmed | `src/app/concept/Masthead.tsx:18`, `Capabilities.tsx:7,9,18` | The home page shows metrics that name no job or project ("500+ videos across roles", "10+ apps", "Two full company rebrands"), against the copy rule. | Rewrite each with its source, using the redesign CV's wording (decision 3). |

## P3

| ID | Branch | Status | Where | Problem | Fix |
| --- | --- | --- | --- | --- | --- |
| A-4 | redesign | Plausible | `src/main.tsx:6`, `scripts/prerender.mjs:33-36`, `src/app/routes.ts:21-24` | Prerendered text is replaced, not hydrated: a visible content swap on cold load. | Hydrate matching markup, or hide prerendered content until JS runs. |
| A-5 | both | Confirmed | `api/contact.ts:47-52` | A non-string field throws an unhandled TypeError; no length cap. | Type-check and cap fields (name 200, brief 5000). |
| A-7 | both | Confirmed (code) | `src/app/concept/ContactFoot.tsx:45-47`, `contact-request.ts:11-48` | No submit timeout; a hung request shows "Sending..." for ever. | `AbortSignal.timeout(15000)` with a friendly error. |
| A-8 | main | Confirmed | `LoadingScreen.test.tsx`, `MediaGallery.test.tsx`, `OperatorProfilePortrait.test.tsx` | Three test files cover components no route mounts. | Remove with the legacy components (decision 7). |
| A-11 + A-14 | both | Confirmed | redesign `vercel.json:6-19`, `Project.tsx:389-397`; main `vercel.json:39-42`, `AppErrorBoundary.tsx:24-30` | Unknown URLs: the redesign returns Vercel's plain-text 404; main returns HTTP 200 with an error panel whose only control reloads the same URL. | Redesign: SPA fallback rewrite and a styled not-found page. Main: a "Back to the portfolio" link and `noindex` on 404. |
| A-12 | both | Confirmed | main `vercel.json:15-34` | Same-path files on main shadow the redesign's copies through the proxy (6 differ). | Namespace the redesign's assets (Vite `base`) or diff the two trees before each main deploy. |
| A-13 | redesign | Confirmed (code) | `PortraitExperience.tsx:318-325`, `portrait-audio.ts:77-81, 116-127` | Sound off leaves the AudioContext and scheduler running. | `suspend()` after the fade-out. |
| B-5 | both | Confirmed | both `vercel.json` | Hashed JS/CSS and all media are served `max-age=0, must-revalidate`. | `immutable` for `/assets/*`, a day plus `stale-while-revalidate` for media. |
| B-6 | both | Confirmed | `src/styles/fonts.css:1` | Google Fonts via CSS `@import`, the only third-party request; on main the fonts are 176 kB, 37% of the home payload. | Self-host the families with preloads. |
| B-7 | both | Confirmed | main `vercel.json:7-38` | Everything proxied from the particle project, including the CV PDFs and 117 images, carries `x-robots-tag: noindex`. | Serve the CV PDFs from main; document that promotion moves the domain, never proxies the whole site. |
| B-8 | redesign | Plausible | `contact-request.ts:50-67`, `ContactFoot.tsx:33-37` | The redesign's contact form depends on main's deployment for its configuration at submit time. | Give the particle project its own configuration; remove the fallback. |
| B-9 | both | Confirmed | `site-content.json:16` | `repoUrl` points at the renamed repository (301). | Use `https://github.com/howestephen/HoweCreative`. |
| B-10 | both | Confirmed | `index.html` | No apple-touch-icon, PNG favicon or web manifest. | Add the icons and a minimal manifest. |
| B-11 | redesign | Confirmed | `public/**/.DS_Store` (4 files, untracked) | Finder files are copied into every local `dist/`. | Remove the four files and the empty `public/models/hero-wire/`. |
| C-5 | main | Confirmed | `site-content.json` (9 entries), `WorkIndex.tsx:196-212` | Nine study videos have no poster and show as black rectangles until played. | Copy the poster paths (and files) the redesign already has. |
| C-6 | both | Confirmed | main `WorkIndex.tsx:208,256`; redesign `ProjectGallery.tsx:198-205`, `Project.tsx:168-175`, `QuiverCaseStudy.tsx` | No video has captions; main ships an empty captions track. | Remove the empty track; add captions or transcripts where there is speech (decision 5). |
| C-7 | main | Confirmed | `src/app/pages/CV.tsx:181`, mono eyebrows in `src/app/concept/*.tsx` | CV labels are 8 px at 2.58:1 contrast; 10 px mono labels at phone widths. | 10 px minimum at 4.5:1 for CV labels; 11 px eyebrows on phones. |
| C-8 | main | Confirmed | `src/app/concept/ContactFoot.tsx:13-14` | Form fields remove the focus outline. | `focus-visible` outline or a 2 px ring. |
| C-9 | both | Confirmed | main overlay `<header>`, `div.gallery-scroll`, CV controls; redesign `<main id="archive-projects">`, `PortraitExperience.tsx:215`, `ProjectGallery.tsx:219-233` | Duplicate banner, nested main, content outside landmarks, no h1 after the redesign intro fades, captions read twice. | Landmark and heading fixes listed in the work plan (WP-11, WP-12). |
| C-10 | main | Confirmed | `WorkIndex.tsx:679-692`, `Layout.tsx:37` | Escape is ignored inside a video's native controls (Chromium); no skip link. | Capture-phase key listener on the dialog; port the redesign's skip link. |
| C-11 | main | Confirmed | `src/app/concept/Masthead.tsx:46` | The status pulse dot ignores `prefers-reduced-motion`. | `motion-safe:animate-pulse`. |
| C-12 | redesign | Confirmed | `portrait-particles.ts:17`, `PortraitExperience.tsx:346`, `public/portrait/portrait-source.png` | The redesign home downloads 1.17 MB of images on a phone; 834 kB is a PNG only used for particle sampling. | Lossless WebP plate (482 kB measured); `srcset` with a 1x variant for the reference image; archive, do not delete, the PNG. |
| D-2 | redesign working copy | Confirmed | untracked files in the primary checkout, `.gitignore` | A CV PDF with a personal email address and application material are untracked and not ignored in a public repository's working tree. | Move under `docs/private/` or ignore them (decision 6). |
| D-3 | both | Confirmed | `site-content.json` | Two different images share one alt; five alts only restate the filename. | Distinct, descriptive alts; a content test for duplicate alts. |

## Leads carried forward (not findings)

- Production may not be at `origin/main` HEAD: the live bundle is `index-Bw3y_Jd9.js`, while a fresh local build of `8a5cbf4` gives `index-CphMwQ9O.js`. It may only be a build-environment difference; check the deployment's commit before verifying any main fix live.
- The redesign study's LCP image is the 2400 px original where the 960 variant would do.
- The redesign Quiver study starts buffering several `.mp4` files on load; `preload` values not checked.
- "Two full company rebrands, shipped end to end" may overstate the 2024 rebrand (decision 3).
- All three CV PDFs contain the CV email line (an open question from pass B, resolved in pass D).

## Not checked across all passes

- A real iPhone, a real Android device and a real screen reader. WebKit in Playwright stood in for iOS Safari.
- Lighthouse, throttled-network and CPU-throttled performance, WebGL frame cost.
- Any POST to the contact endpoints (deliberately not sent); Vercel dashboard settings, DNS and TLS beyond HSTS.
- Every caption against its image (one spot-check); the earlier-work archive against the private NDA brief.
