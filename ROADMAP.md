# ROADMAP

## Current design checkpoint - 16 September 2026

Current work is on `codex/creative-technologist-portfolio`. Stephen's latest direction is a full-screen particle portrait, scroll-driven evaporation through 3D space, then a separate screen of five or six icon-and-text project cards. Each opens a substantial frosted-glass case study, with particles and other projects blurred behind it. Page Down from the opening should advance to the showcase. The complete filtered archive stays directly accessible. See the [current plan and revision record](docs/reviews/2026-09-07-design-reset/plan.md) and [three-state storyboard](docs/reviews/2026-09-07-design-reset/spatial-sequence.png).

- [x] Record the confirmed portrait source, corrected sequence, card/detail distinction, depth/audio requirements and proposed six-project evidence roles.
- [x] Stephen approved building the portrait sequence as a review prototype, with final showcase content deferred.
- [x] Implement `/study`: portrait particles, scroll-driven evaporation, a separate six-card screen, a glass preview and a closing particle arc. Page Down, reverse scrolling, motion-off fallback and opt-in sound are available.
- [ ] Review the working motion and art treatment with Stephen before integrating the homepage. The glass previews and six-project selection are provisional.
- [ ] Finalise five or six primary projects after source review; keep archive coverage, discipline/software filters and private V7 requirements intact.

The current prototype runs at `/study`, separate from the existing homepage. Typecheck, 72 tests, lint and production build pass. Browser checks cover desktop and narrow phone layouts, keyboard advancement, reversible scrolling, modal focus restoration and motion/sound controls. Physical mobile-device testing and listening to the sound mix remain outstanding. The older [HTML concept board](docs/reviews/2026-09-07-design-reset/index.html) previews the previous complete image-card index. No production deployment or Figma design changed at this checkpoint. The editorial milestone below is historical.

## Current task - Figma archive and interactive showcases, 15 September 2026

Stephen requested a review of every Figma export, organised presentation copies and appropriate public/private treatment. On 16 September he limited Figma to three active files with no paid subscription, provisionally two public showcases and private V7; the final selection and split are deferred. Other projects should use screenshots/recordings, with suitable projects across the archive considered for live coded demos. The [Figma register and workflow](docs/reviews/2026-09-07-design-reset/plan.md#figma-archive-and-interactive-showcases---15-september-2026) is the single working record, including all 12 Design and 4 FigJam files, backup naming, branding/access decisions, delivery formats and verification.

- [x] Record the complete source inventory and preparation/integration workflow.
- [x] Record Stephen's correction: New Menu System is live in production. The existing public case-study status is stale and still needs updating.
- [x] Record the three-file cap, no paid Figma plan, provisional split and broader coded-demo direction. Final showcase selection remains deferred.
- [ ] Review New Menu System's live implementation and contribution credits; keep it as a showcase candidate pending the format/slot selection.
- [ ] Agree the final Figma allocation with Stephen later, then prepare the selected showcases with verified local backups. Keep temporary imports within the cap and preserve active embed targets.
- [ ] Add the reusable prototype embed component for selected Figma cases and verify actual visitor access and mobile use.
- [ ] Prepare image-rich case studies with screenshots and/or recordings for other projects, respecting their access classification.
- [ ] Assess coded-demo potential across all projects and shortlist bounded, useful live interactions before building. An NFT minter is one possible candidate, not the only option or an approved product build. Distinguish new portfolio implementation from original design/engineering credit.
- [ ] Add a protected employer area for restricted work. V7 is confirmed unlaunched and private-only, retaining its original branding. Resolve Figma access independently from the site password and keep restricted data/media out of public builds. See the private-area requirements in the register.
- [ ] Review the existing V7/launchpad screenshots and thumbnails in public assets and their delivery paths before publishing a restricted V7 case study. No protection or relocation has been implemented yet.
- [x] Structurally scan all 12 Design exports locally to prioritise inspection without using Figma API quota. Runtime verification and the four FigJam reviews remain outstanding.
- [x] On 16 September, verify Stephen's V7 reimport: all five pages, seven named desktop/mobile flows each, and creation-step links are present. The new file key and direct page links are in the register. Runtime/public-embed testing remains outstanding.
- [ ] Work through every remaining source file, updating its record. Blueprint Token Minter is the next fresh-file candidate. For V7, inspect isolated empty actions in context rather than rebuilding the main flow.

This update records the work; no Figma files have been reorganised or debranded and no embed has been implemented yet. Published embed targets must remain online. The 3D opening's sequence is recorded above; its implementation and art treatment remain separate from this preparation milestone.

## Historical editorial milestone

`3.0 Validate and ship the career-focused editorial redesign`

The earlier editorial work was developed on `claude/concept-editorial`. The
design reset checkpoint above supersedes this milestone and its next steps.

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
- ✓ Full 2005-present career history.
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
6. Remove deprecated components and dependencies only after the replacement
   design is approved, so rollback remains simple.
7. Merge the approved branch to `main` and validate the production deployment.

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
