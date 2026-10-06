# ROADMAP

## Current Milestone

`3.0 Validate and ship the career-focused editorial redesign`

The work is happening on `claude/concept-editorial`. This branch is intended to
replace the current production design on `main` once its content, CV, responsive
behaviour, and conversion paths are approved.

## Goal

- Make Stephen’s value legible to a hiring manager or client in seconds.
- Lead with outcomes, career evidence, and systems thinking rather than theme.
- Support Creative Technologist, AI Designer, and Design Engineer applications.
- Provide an ATS-readable, printable CV that any visitor can save as a PDF.
- Keep the work visually distinctive through a restrained editorial system and
  the generative plotter mark.

## Completed on the redesign branch

- ✓ Employer-focused positioning and light-first editorial art direction.
- ✓ Outcome-first index for nine case studies.
- ✓ Solana Diary and agentic portfolio case studies.
- ✓ Full 2005–present career history.
- ✓ Standalone `/cv` route with print / save-as-PDF control.
- ✓ Contact form replacing the public email address.
- ✓ SEO, social metadata, favicon, and structured person data.
- ✓ Browser-compatible Web3Forms free-plan submission.
- ✓ Lazy-load the standalone CV route.

## Current Next Steps

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
7. Merge the approved branch to `main` and validate the production deployment.

## Production Maintenance

- [ ] Fix the findings of the October 2026 full audit of both sites: 39
  findings (3 P1, 12 P2, 24 P3) in
  [the audit findings](docs/reviews/2026-10-03-full-audit.md), packaged as
  WP-1 to WP-14 in [the audit work plan](docs/plans/2026-10-03-audit-work-plan.md).
  Decisions 1 to 7 were settled on 3 October (captcha on the contact form,
  home page wording kept, no captions, legacy components retired); only the
  HSTS scope (decision 8) is open.
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
- [ ] Recapture the screenshots taken at 1x at 2x: Badger Club and Noticia
  Lingo (1920px), the UNCX website sections and Academy pages (1440px). They
  are the images still below retina resolution when shown large.
- [ ] Decide on the 15 images the September image review marked CUT, listed
  under the case study audit.
- ✓ Added Google Search Console HTML ownership verification to the canonical
  production homepage.
- Branch `feat/quiver-and-work-cards` (awaiting approval): the Quiver launch
  film case study is ported from the redesign branch as the featured first
  study, and Selected work becomes a card grid (three wide on desktop, compact
  cards on phones) whose studies open in an overlay. The open study is kept in
  the URL (`/?study=quiver`) so it can be shared directly. Close and Escape
  always return to the grid; Back does too when the study was opened from it.

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
