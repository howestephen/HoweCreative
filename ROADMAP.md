# ROADMAP

## Current design checkpoint - 17 September 2026

Current work is on `codex/creative-technologist-portfolio`. Stephen's latest direction is a full-screen particle portrait, scroll-driven evaporation through 3D space, then a separate screen of five or six icon-and-text project cards. Each opens a substantial frosted-glass case study, with particles and other projects blurred behind it. Page Down from the opening should advance to the showcase. The complete filtered archive stays directly accessible. See the [current plan and revision record](docs/reviews/2026-09-07-design-reset/plan.md) and [three-state storyboard](docs/reviews/2026-09-07-design-reset/spatial-sequence.png).

- [x] Record the confirmed portrait source, corrected sequence, card/detail distinction, depth/audio requirements and proposed six-project evidence roles.
- [x] Stephen approved building the portrait sequence as a review prototype, with final showcase content deferred.
- [x] Implement `/study`: portrait particles, scroll-driven evaporation, a separate six-card screen, a glass preview and a closing particle arc. Page Down, reverse scrolling, motion-off fallback and opt-in sound are available.
- [x] Refine the opening after feedback: the source is a tilted 3D field of broad vertical pillars; their surfaces begin atomising while the pillars are still separating, then drift gradually into one continuous field without an abrupt plume handoff; facial detail stays rigid before it sheds; mouse movement adds colour without displacement; press-and-hold parts nearby points; the first-frame loader fully covers setup; the hero has more physical scroll range and the interruptible journey to work lasts 9 seconds.
- [x] Rebuild the Quiver case study from its curated evidence pack: lead with the 68-second launch master, prove the constrained-shot and local-inference method with source plates and clips, show a rejected direction, and distinguish generative, authored and production layers.
- [x] Extend the approved portrait direction into a reviewable site system: connect all six selected-work cards to real project data and full case studies; restyle the shared case-study template; add `/archive` with discipline/software filters, nine public current projects, an earlier-work timeline and explicit restricted-work treatment; add the contact section and route navigation in the same visual language.
- [x] Soften the opening after Stephen's 17 September review: hold the intact portrait longer, shear feathered pillars instead of slicing, dissolve in a spatial wave from the back of the head to the features, fade most released points as vapour and carry embers into a stratified depth field. Lift the type floor, unify the contact form with the dark system and remove the study label.
- [x] Reorganise the case studies so they read like Quiver: one aspect ratio per chapter with real frames, curated imagery in place of software-panel screenshots, and above-the-fold crops replacing the unreadable full-page Academy captures. See the [image review](docs/reviews/2026-09-18-case-study-image-review.md).
- [x] Audit the dark case-study routes for editorial light-theme styling still leaking through, and replace the UNCX App Concepts lead, which was a prototype screen still carrying Lorem ipsum placeholder copy.
- [x] Rebuild the selected-work preview card after Stephen's review: it now fits inside the viewport at laptop and phone sizes with no internal scrolling, leads with each project's identity artwork (wordmark, mark, rendered asset or poster) instead of a cropped screenshot, and carries a title, one-line headline, two-sentence summary, role/context/status and one link onward. The breadcrumb, tag pills, fit line and credit paragraph are gone; that detail lives in the full case study.
- [x] Second pass on the preview card after review: one fixed size for all six at every width, one plain image panel, identity artwork whole and centred (brand SVG for UNCX, crest cut out, menu as its phone view), Quiver's poster justified right. A 740px-tall phone still scrolls the last few pixels of the two longest cards.
- [x] Add a camera arc that begins on the first scroll so the opening moves straight away and its depth is visible.
- [x] Close the vertical seams by reordering the pillar depths into a monotonic back-to-front sweep, cutting the largest step between neighbouring pillars from 0.58 to 0.105. Every other part of the effect is unchanged, and the sweep cannot bulge the face.
- [x] Strip the archive's discipline and software filters, whose sticky panel covered the work on a phone and repeated the grouping the selected-work screen already provides, and rebuild current work as drop-down rows in the earlier-work form.
- [x] Swap Badger Club for Noticia Lingo in selected work, on Stephen's read that Noticia Lingo's design is resolved and showable while Badger Club still has design problems. Both keep their case studies and archive rows.
- [ ] Recapture the evidence the image review says is missing: a Solana Diary post in a real feed context with no follower count visible, and finished-craft frames for UNCX Video and 3D beyond the one rendered asset.
- [ ] Stephen's live review of the softened opening at his own scroll pace, on desktop and a physical phone, plus the opt-in sound against the new timing.
- [ ] Replace the Quiver pack's silent launch master if the intended audible music mix is recovered. The supplied master contains an AAC stream at -91 dB; older cuts are audible, so the case does not currently promise sound.
- [ ] Audit every other current showcase against the same evidence standard and identify the exact source material still needed before selecting the final five or six primary projects.
- [ ] Review the integrated `/study`, `/archive` and case-study treatment with Stephen before promoting the particle experience to the root homepage. The six-project selection and remaining case-study evidence are provisional.
- [ ] Finalise five or six primary projects after source review; keep archive coverage, discipline/software filters and private V7 requirements intact.

The integrated review version runs at `/study`, separate from the existing root homepage. `/archive` carries the filterable work index and earlier-work timeline; the selected cards now open evidence-based previews and link to full cases. The Quiver evidence-led case study is available at `/work/quiver`; the remaining public cases use the shared spatial template and still need project-by-project evidence review before their content is considered final. Browser checks cover desktop and mobile archive, selected work, glass preview and a representative case study. Physical mobile-device testing and listening to the sound mix remain outstanding. V7 remains excluded from the new public archive while the existing mixed prototype material is audited; no protected employer area exists yet. No production deployment or Figma design changed at this checkpoint. The [agent handoff](docs/reviews/2026-09-07-design-reset/plan.md#agent-handoff---17-september-2026) records the branch, preview routes, code map, verification and exact next task. The editorial milestone below is historical.

## Parallel backlog - Figma archive and interactive showcases, 15 September 2026

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
