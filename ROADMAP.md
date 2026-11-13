---
status: active
author: stephen+claude
updated: 2026-11-13
generated_by: claude
generated_at: 2026-11-11T21:30Z
generated_from: conversation
---

# ROADMAP

## Current Milestone

`3.1 Maintain the live editorial site`

Milestone 3.0, the career-focused editorial redesign, shipped to `main` on
19 July 2026 (merge 85dd2c7). Work now goes to `main` as maintenance.
`codex/creative-technologist-portfolio` stays a separate branch for further
work; it is not merged and, since 2 November 2026, not deployed.

Open:

- **Next:** the redesign waits for Stephen's decision on a direction:
  [handoff](handoffs/2026-11-11-cv-two-pages-and-redesign.md).
- Captions for the 11 narrated videos (A1 below) wait for Stephen's proofread
  on `fix/video-captions`.
- Decide on the 15 images the September image review marked CUT.
- Send a test message through the production contact form.
- Print preview `/cv` in Chromium and Safari.
- At 320px the hCaptcha widget (a fixed 302px) makes the page scroll
  sideways; hCaptcha's compact size would fit.
- At 320px the two CV buttons (about 290px) overflow the 272px column to
  the left, as they did before. Below the masthead the CV controls are out
  of view; they no longer follow the scroll, so they never cover the dates.

## Stephen

- [S] Delete the old publication-scan token secret under Actions in the GitHub
  repository settings (the hosted publication scan no longer exists).
- [S] Complete the shared allowance record (the kit's COST_CONTROLS.md), then
  connect the project in CircleCI: GitHub App, triggers "Pushes to default
  branch" and "Pushes to open non-draft PRs", auto-cancel on.
- [S] Enable Dependabot alerts on the repository (the project is at L2).
- [S] Check the Vercel dashboard for Git settings, deploy hooks and CLI routes
  and list them in this entry.
- [S] Decide the future of `codex/creative-technologist-portfolio`: retire
  or tag it, or have its agent guidance brought up to main's.

## Accessibility and layout refinements (2026-10-13)

A review of live main at 390, 768, 834, 1024, 1280 and 1440 found one WCAG A
failure (no captions on narrated video), four tablet layout faults and eight
small refinements. Brief, measurements and log:
[handoffs/2026-10-13-a11y-and-layout-refinements.md](handoffs/2026-10-13-a11y-and-layout-refinements.md).

- ✓ 30 October 2026: A2, A3, L1 to L4 and R1 to R8 are merged to main. One
  keyboard focus ring site-wide; no on-screen text below 11px; mono text uses
  two shared styles, `label-mono` and `meta-mono` in `src/styles/theme.css`;
  the hero stats, header, What I do and work grid hold their layout from 640
  to 1279; the study banner takes its image's ratio; the CV controls sit on
  the CV column. `src/app/refinements.test.tsx` covers each item.
- [ ] A1: Whisper transcripts, corrected, for the 11 narrated videos are on
  `fix/video-captions`, waiting for Stephen's proofread. The other 11 videos
  with an audio track carry music only.

## House kit retrofit (13 November 2026)

Branch `chore/retrofit-2026-11-13`, cut from main (0e525fa), kit source commit
a82c9a8; merged to main on 13 November 2026 with Stephen's approval
(4e462b6). The earlier CI-scope and October retrofit notes are in
[_archive/2026-11-13-roadmap-ci-and-october-retrofit.md](_archive/2026-11-13-roadmap-ci-and-october-retrofit.md).

- Rules: CLAUDE.md keeps its local rules and adds the canonical autonomy lines;
  CONVENTIONS.md is the kit's current text; ONBOARDING.md declares L2 (live
  portfolio, no accounts or billing). Deliverables and `code_checks` are
  declared in `scripts/validate.config.json`.
- Code tooling: `check`, `ci:pr` and `ci:main` scripts, the kit's
  `.circleci/config.yml` unchanged, `selftest_code_quality.py` and the evidence
  gate. `.github/workflows/ci.yml` (the old GitHub Actions copy of the same
  checks) and `scripts/selftest_site_checks.py` (the old pre-push suite) are
  replaced by them and removed. Until CircleCI is connected, pull requests have no hosted
  check; the commit gate's evidence is the only automatic one.
- Vercel: main's `vercel.json` already held `git.deploymentEnabled`
  `{"**": false, "main": true}` (the only consumed config); `.vercel/` holds
  the project link only. Hosted acceptance is not observed. Dashboard, CLI and
  deploy-hook routes are not inventoried.
- Justified exceptions: the project keeps its own `tsconfig.json`,
  `eslint.config.js` and dependency ranges. The kit's compiler and lint
  settings (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `skipLibCheck: false`, `strictTypeChecked`, arrow-only functions) were tried
  on a disposable copy and the code raises 74 compiler errors and about 300
  lint errors (non-null assertions, `func-style`, unsafe `any` from JSON), so
  `check` runs the project's own typecheck and lint; no existing check was
  weakened; `no-explicit-any` is now an error (it was a warning, and the
  code has no violations).
- [ ] Bring the code to the kit's strict settings and swap the kit's
  `tsconfig.json`, `eslint.config.mjs` and `check-code-quality.mjs` in.
- [ ] Heavy media (rule 5a, no file over 5 MB under `public/`): 19 tracked
  files, about 300 MB, all MP4s under `public/case-studies/` (uncx-academy 8,
  uncx-video-system 6, quiver 4, uncx-rebrand 1; largest 31 MB). Move them to
  object storage or a media host and reference by URL; never delete them.
- [ ] Open from before: CI runtime headroom and hosted acceptance are not
  recorded; Codex and Cursor wiring and which agent-host events fire are
  unverified.
- Live branches merged with main on 13 November 2026 and validated:
  `claude/brief-machine`, `claude/showreel-redesign` (both local only) and
  `fix/video-captions`. Not merged: `codex/creative-technologist-portfolio`
  is a separate site (142 commits ahead, 161 behind) and the merge raises
  40 conflicts, most in site source; it waits for Stephen's redesign
  decision.

## Goal

- Make Stephen’s value legible to a hiring manager or client in seconds.
- Lead with outcomes, career evidence, and systems thinking rather than theme.
- Support Creative Technologist, AI Designer, and Design Engineer applications.
- Provide an ATS-readable, printable CV that any visitor can save as a PDF.
- Keep the work visually distinctive through a restrained editorial system and
  the generative plotter mark.

## Completed in the editorial redesign

- ✓ Employer-focused positioning and light-first editorial art direction.
- ✓ Outcome-first index for nine case studies.
- ✓ Solana Diary and agentic portfolio case studies.
- ✓ Full 2005-present career history.
- ✓ Standalone `/cv` route with print / save-as-PDF control.
- ✓ Contact form replacing the public email address.
- ✓ SEO, social metadata, favicon, and structured person data.
- ✓ Browser-compatible Web3Forms free-plan submission.
- ✓ Lazy-load the standalone CV route.

## Redesign launch checks

1. ✓ Responsive and accessibility QA of the editorial homepage (a11y audit
   clean; no overflow at 375/768/1280; reduced-motion honoured site-wide via
   `MotionConfig`; work rows keyboard-operable with `aria-expanded`).
2. ✓ `/cv` print contract verified in code (`@page` margins, `.no-print`
   controls, forced white background; lazy chunk + fallback confirmed).
   Remaining: a manual print preview in Chromium and Safari before merge.
3. ✓ Career claims, dates, and metrics reviewed for consistency across
   `site-content.json`, `Method.tsx`, `Masthead.tsx`, and `CV.tsx`.
4. Test the production contact flow on the next Vercel deploy (the build now
   embeds `EMAIL_ACCESS_KEY`, already present in all Vercel environments;
   requires an SSO-authenticated visit to a preview, or production after merge).
5. ✓ Bundle composition reviewed: 162 kB gzip main chunk, icons split, CV in
   its own lazy chunk, three.js absent from the editorial build.
6. ✓ Deprecated components removed, 3 October 2026: 15 unmounted legacy
   components, three helpers and their three tests, then the three.js and
   React Three Fiber packages only they used. The built JavaScript is
   unchanged apart from file hashes; the CSS drops only their unused utilities.
7. ✓ Merged to `main` on 19 July 2026 (85dd2c7).

## Production Maintenance

- [x] Website positioning, 10 November 2026 (`codex/creative-positioning`):
  homepage and search descriptions lead with creative briefs, concepts and
  prototypes. Systems and automation support that work. Badger Club and
  Noticia Lingo are labelled personal projects in development in cards and
  studies; the UNCX app claim distinguishes 10+ concepts from 3-4 shipped
  apps, matching the CV. Delivered UNCX videos remain separate from the
  unfinished automation successor. Design, project order and CV unchanged.
  Rebrand ownership credits the outside studio; the video metric names UNCX.
  Verified: 157 tests, typecheck, lint and production build pass; independent
  audit and re-audit complete. Browser visual review not run. Merged to main
  on 11 November 2026 at Stephen's request.

- [x] Vercel storage, 2 November 2026: the team hit its 10 GB deployment
  storage limit. Each deployment carries about 415 MB of case-study media, and
  every old one was kept. The redesign's site is taken offline (all its
  deployments removed, project disconnected from Git), main keeps only its live
  deployment (both checked with `vercel list`), and main's `vercel.json` no
  longer routes any path to the redesign's project; a test keeps rewrites
  local.

- [x] CV aligned across main and the redesign branch, 2 November 2026: month
  dates, the full list of earlier roles, a Selected Projects section and grouped
  skills covering local AI, testing, CI and data. Main's print CV fills two A4
  pages; the contact boxes size to their text.
- [x] CV fills two A4 pages, ordered for the target roles, 11 November 2026
  (`fix/cv-layout`). Two earlier attempts fitted two pages by removing things:
  7 November condensed the wording, and the first 11 November fix forced a
  page break that left 29mm and 55mm blank. The cause was order, not length:
  the earlier-roles block cannot split and sat on the page boundary. Now page
  one is summary, Selected Projects and Skills (the evidence for the creative
  technologist title); page two is Experience, Education and Languages. The
  full wording from before 7 November is back. Measured from a Chrome A4 PDF,
  both pages looked at: about 12mm spare at the foot of each. `@page` is A4;
  a browser that ignores it and prints US Letter would run to a third page.
  Safari's print is not checked.
- [x] CV projects and earlier roles, 7 November 2026 (`fix/cv-projects`):
  Earlier Experience is a titled entry with a dated two-column list instead of
  a grey run-on paragraph. Selected Projects is Quiver, Solana Diary and the
  AI development framework (hooks, templates, audit agents, CI), taken from
  the case studies and `_projects-admin`; the two UNCX bullets they repeated
  are removed. Dev-workflow "gates" wording now names the hooks. The skills
  list keeps Supabase, row-level security, OAuth, Sentry, Playwright and
  Next.js; the Badger Club and Noticia Lingo studies evidence them, though no
  CV project line now does. Not yet previewed or printed: Tailscale was
  stopped, so the preview controller was unreachable, and the two-page print
  length above is unconfirmed. The redesign branch's CV is not updated.
- [x] CV summary, 2 November 2026: the UNCX tenure line read "the last four
  years"; it now reads five years, matching November 2021 to November 2026. The homepage UNCX stat now
  stops at that end date and reads 5 yrs; the CV role dates read 2021 - 2026.
- ✓ UNCX Rebrand and Academy study banners, 7 October 2026: the card and
  full-width study header share an image, but browsers could keep an older
  full-size copy while fetching new thumbnails. Both image URLs now carry a
  content-hash version, including every responsive WebP candidate, so the
  current Rebrand marks and Academy corner logo appear consistently.
- [x] Fix the findings of the October 2026 full audit of both sites: 39
  findings (3 P1, 12 P2, 24 P3) in
  [the audit findings](docs/reviews/2026-10-03-full-audit.md), packaged as
  WP-1 to WP-14 in [the audit work plan](docs/plans/2026-10-03-audit-work-plan.md).
  Done for main, including the enforced CSP and HSTS headers in `vercel.json`.
  Deferred: WP-5, WP-6 and WP-12 belong to the redesign branch, which Stephen
  keeps separate (owner: Stephen). Decision 5 (no captions) was reversed on
  13 October; see A1.
- ✓ Figma source exports, 6 October 2026: 18 App Prototyping, Unified Menu
  and Solana Diary gallery images, which were canvas screenshots at mostly 0.2
  to 0.9 pixels per canvas pixel, are re-exported from Figma at their original
  framing, up to 4096px wide as WebP q85, with regenerated retina variants.
  `nft-minting-wireframes` showed the vesting flows and is now
  `vesting-flow-wireframes`. Added: the Blueprint desktop concept, the NFT
  minter trait preview and the Solana Diary layout approaches. Tests now check
  every gallery image and variant exists and that originals stay within 4096px
  wide and 1 MB. Every Figma page and frame is archived in the git-ignored
  `assets-archive/UNCX Archive/screenshots/`; replaced originals are in
  `assets-archive/replaced-by-figma-exports-2026-10-06/`.
- ✓ Study layout, 6 October 2026: on desktop the text column sets the study's
  height. Videos sit at its foot, each at its own shape, level with the end of
  the text; the gallery fills the space above as a stacked grid and only scrolls
  sideways when even small tiles would not fit. Phones keep the swipe strips.
- ✓ Media pass, 6 October 2026: nine UNCX films were H.265, which only plays
  where the device decodes it; they are re-encoded to H.264 (VMAF 97.4 to
  98.9; 268 MB to 120 MB), with a test that rejects H.265 and late indexes.
  Rebrand: the old Unicrypt banner is gone and the card shows the Unicrypt mark
  becoming the UNCX mark, both in the cut-out style; brand
  colours, YouTube cover and launch banner added. Academy: its card carries the
  UNCX corner mark, and five live-site captures sit beside their Figma designs
  in place of fifteen Figma-only page shots; three explainer films added. Video
  and 3D System: eight 3D renders (2x upscaled with UltraSharp) and three launch
  films added. Replaced files are in
  `assets-archive/replaced-2026-10-06-media-pass/`.
- ✓ Rebrand website sections, 6 October 2026: recaptured whole from
  uncx.network at 2x, since the earlier crops were fixed slices that cut
  through sections. The agency's concept directions are removed, since not
  all were used. Replaced files are in
  `assets-archive/replaced-2026-10-06-section-recrops/`.
- ✓ Quiver, 6 October 2026: the study features the advanced film with the
  phone; the edits without the phone follow as secondary films.
- ✓ Audit fixes, 3 October 2026: `/work/<slug>` links from the CVs redirect
  to the study, crawlers are kept off `/particle-redesign` by `robots.txt`, and
  the two white logotypes are replaced by grounded and black-text versions.
  The contact form shows an hCaptcha widget and sends its token to Web3Forms.
- ✓ Audit fixes, 5 October 2026 (WP-2): Back closes an open gallery with its
  study, Back to the archive keeps the scroll position, and nine study videos
  have posters.
- ✓ Audit fixes, 5 October 2026 (WP-4): header, contact and footer links and
  the lightbox arrows reach 44px on phones, CV labels and eyebrows are larger,
  and the open-to-roles dot stops pulsing under reduced motion.
- ✓ Audit fixes, 5 October 2026 (WP-13): the empty captions tracks are
  removed from main's study videos; no film has captions.
- ✓ Audit fixes, 5 October 2026 (WP-11): closing the image gallery returns focus
  to its thumbnail, contact success and error are announced, form fields keep a
  focus outline, the study overlay no longer adds a second banner, gallery
  scrollers are focusable and labelled, the CV controls sit in a nav landmark,
  Escape works from a video's native controls, and a skip link starts the page.
- ✓ Audit fixes, 5 October 2026 (WP-7): `robots.txt` names a new `sitemap.xml`
  (home, archive, CV and each study; no redesign URLs), a `usePageMeta` hook
  gives the archive, CV and each open study their own title, description,
  canonical and Open Graph tags, `trailingSlash` is off, and an Apple touch
  icon, PNG favicon and web manifest are linked. Add a study to the sitemap
  when adding it to `site-content.json` (a test checks).
- ✓ Audit fixes, 5 October 2026 (WP-9): the contact form and API reject malformed or over-long input with a clear message, and a hung send times out after 15 seconds.
- ✓ Audit fixes, 5 October 2026 (WP-8): Fraunces, Instrument Sans and IBM Plex Mono
  are bundled from Fontsource packages instead of Google Fonts, with the body and
  headline faces preloaded; no third-party request remains.
- ✓ Retina image pass, 30 September 2026: cards, study images and gallery
  thumbnails are served through `ResponsiveImage` from generated WebP sizes,
  so every one meets retina resolution; 26 originals shrunk by the 2400px cap
  are restored. Six repeated Quiver stills leave the gallery, the test videos
  get distinct posters, and gallery thumbnails now open the image clicked.
- [x] Done: Badger Club and Noticia Lingo were recaptured at 2x on 30 September
  (commit 555c853), and the UNCX website sections and Academy pages on
  6 October. Original item: Recapture the screenshots taken at 1x at 2x: Badger Club and Noticia
  Lingo (1920px), the UNCX website sections and Academy pages (1440px). They
  are the images still below retina resolution when shown large.
- [ ] Decide on the 15 images the September image review marked CUT, listed
  under the case study audit. Stephen's decision.
- ✓ Added Google Search Console HTML ownership verification to the canonical
  production homepage.
- ✓ Quiver and the work card grid, September 2026: the Quiver launch film is
  the featured first study, and Selected work is a card grid (three wide on
  desktop, compact cards on phones) whose studies open in an overlay. The open
  study is kept in the URL (`/?study=quiver`) so it can be shared directly. Close and
  Escape always return to the grid; Back does too when the study was opened
  from it.

## Acceptance Criteria

- A first-time visitor can answer who Stephen is, what he does, what proves it,
  and how to contact him from the opening viewport.
- Case studies expose meaningful detail with keyboard and touch input.
- The page remains understandable with animation disabled.
- `/cv` is readable on screen and exports cleanly without site chrome.
- Contact submission succeeds in production and fails with a useful message.
- Tests, typecheck, lint, and production build pass.
- No redesign-specific regressions remain at common phone, tablet, and desktop
  widths before merge.

## Adjacent System Boundary

The Solana publishing pipeline is represented here as portfolio content. Its
Railway, Postgres, Telegram, and X runtime remains a separate deployable and
must not be coupled to the Vercel portfolio.
