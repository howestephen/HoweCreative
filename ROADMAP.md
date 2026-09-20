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
- [x] Sequence the opening as Stephen intended: columns separate, the portrait turns to show the gaps between them, the columns then atomise, and the particles flow down the page. The turn rotates the portrait in place rather than moving the camera.
- [x] Close the vertical seams by reordering the pillar depths into a monotonic back-to-front sweep, cutting the largest step between neighbouring pillars from 0.58 to 0.105. Every other part of the effect is unchanged, and the sweep cannot bulge the face.
- [x] Strip the archive's discipline and software filters, whose sticky panel covered the work on a phone and repeated the grouping the selected-work screen already provides, and rebuild current work as drop-down rows in the earlier-work form.
- [x] Swap Badger Club for Noticia Lingo in selected work, on Stephen's read that Noticia Lingo's design is resolved and showable while Badger Club still has design problems. Both keep their case studies and archive rows.
- [x] Replace the pillar model with a per-pixel depth map generated by `scripts/build-portrait-depth.mjs` (Depth Anything V2 small, run locally, output `public/portrait/portrait-source.png`). There are no columns. Separation starts on the first scroll and runs through almost the whole passage: the head yaws so its relief reads as parallax while it comes apart continuously, hair and the back of the head travelling first and furthest and the features last but still travelling, streaming left of camera and towards the viewer as the outer edges pull outward. As points release the image thins to a stipple in which about a fifth survive, weighted toward the brighter ones, the survivors growing to hold the coverage. The camera dollies into the cloud after the face has already pulled apart, with near points swelling into large soft blobs and fading at the lens, then the existing flow into the field carries on unchanged.
- [x] Make that separation visible earlier in the scroll by removing the obsolete opening hold and the second eased release curve. Stabilise the first-scroll handoff: keep the loading cover through two complete WebGL frames, reveal the renderer fully opaque, and replace the fixed canvas's negative stacking level with explicit background and HTML levels.
- [ ] Recover the opening's reference recording. `ScreenRecording_09-16-2026-02-21-57_1.mov`, named in the plan as the source for the intended motion, is not in the repository or anywhere on the machine. Every change to the opening since 16 September has been made against the written description in the plan rather than the recording itself, which is why several successive attempts were reviewed and rejected. Ticked opening items above describe what was built at the time, not an accepted result. Anyone working on `src/app/experience/portrait-particles.ts` should get the recording from Stephen first.
- [ ] Stephen's live review of the softened opening at his own scroll pace, on desktop and a physical phone, plus the opt-in sound against the new timing.
- [ ] Replace the Quiver pack's silent launch master if the intended audible music mix is recovered. The supplied master contains an AAC stream at -91 dB; older cuts are audible, so the case does not currently promise sound.
- [ ] Audit every other current showcase against the same evidence standard and identify the exact source material still needed before selecting the final five or six primary projects.
- [ ] Review the integrated `/study`, `/archive` and case-study treatment with Stephen before promoting the particle experience to the root homepage. The six-project selection and remaining case-study evidence are provisional.
- [ ] Finalise five or six primary projects after source review; keep archive coverage, discipline/software filters and private V7 requirements intact.

The integrated review version runs at `/study`, separate from the existing root homepage. `/archive` carries the filterable work index and earlier-work timeline; the selected cards now open evidence-based previews and link to full cases. The Quiver evidence-led case study is available at `/work/quiver`; the remaining public cases use the shared spatial template and still need project-by-project evidence review before their content is considered final. Browser checks cover desktop and mobile archive, selected work, glass preview and a representative case study. Physical mobile-device testing and listening to the sound mix remain outstanding. V7 remains excluded from the new public archive while the existing mixed prototype material is audited; no protected employer area exists yet. No production deployment or Figma design changed at this checkpoint. The [agent handoff](docs/reviews/2026-09-07-design-reset/plan.md#agent-handoff---17-september-2026) records the branch, preview routes, code map, verification and exact next task. The editorial milestone below is historical.

## Case study and disclosure audit - 20 September 2026

An audit of all ten `/work/:slug` routes, the selected-work cards and the preview card, covering delivered material, layout, copy claims and public exposure. Method, evidence and per-finding detail are in the [audit record](docs/reviews/2026-09-20-case-study-audit.md); each item below names the file to change. Severity 1 is publication-blocking and should be cleared before the site is shown to anyone. The items are independent of each other and can be taken in any order within a severity band. Verified as passing at the time of the audit, so treat a regression in any of these as a new fault: no broken images, no console errors, no horizontal overflow on any route at 1440px or 390px; all 142 media entries resolving with alt text; uniform card heights at every width; preview dialogs inside the viewport at every width; typecheck, 83 tests and build all green.

Severity 1, disclosure and accuracy:

- [ ] Stop delivering the restricted V7 case study. `uncx-app-concepts` is excluded from the `/study` and `/archive` arrays only: the build still prerenders `dist/work/uncx-app-concepts/`, the route returns 200, 19 images ship under `dist/case-studies/uncx-app-concepts/`, the URL is in `dist/sitemap.xml`, `robots.txt` allows it, and the live root homepage links to it as "UNCX App Prototyping". Remove it from the prerender list, the sitemap and the root homepage, and move its assets out of `public/` into `assets-archive/` under the existing no-delete rule. Do not describe a later password gate as retroactively restricting material already delivered.
- [ ] Remove `public/case-studies/uncx-video-system/c4d-ui-takes.webp` from the site. It is a Cinema 4D Take Manager panel naming thirteen commercial partners, published in the collection grid with no context and no portfolio value. Archive it rather than deleting it. Remove `public/case-studies/badger-club/resend-email-setup.webp` on the same pass: it exposes sending-domain configuration and has the same zero value.
- [ ] Correct the Unified Menu status. The menu is live in production, recorded on 15 September at `docs/reviews/2026-09-07-design-reset/plan.md:176`, but the case study still reads "Design Complete", "The project is on hold due to a shift in development priorities" and "Design complete. Implementation on hold." Fix the copy in `site-content.json`, the outcome in `src/app/data/project-stories.ts`, and the hard-coded override at `src/app/pages/Project.tsx:246`, which also feeds the homepage card and the archive row.
- [ ] Fix the project counter at `src/app/pages/Project.tsx:264`, which counts all ten projects while navigation at line 237 uses the nine public ones. Every case study reads "N / 10" against nine findable projects and the indices skip, which advertises the excluded project.

Severity 2, evidence quality:

- [ ] Apply the [image review](docs/reviews/2026-09-18-case-study-image-review.md) verdicts to what is actually served. `src/app/pages/Project.tsx:239` builds "The complete collection" from the whole `project.media` array, so fifteen images marked CUT are still published: six on UNCX Video, three on Rebrand, three on Menu, two on Badger Club, one on Noticia Lingo. Four are also still inside curated chapters: `youtube-thumbnails.webp`, `after-effects-ui.webp`, `research.webp`, `variables-setup.webp` and `database-schema.webp` (used twice). Curate the collection rather than rendering every file.
- [ ] Correct or remove the caption at `src/app/data/project-stories.ts:58`, which describes `youtube-thumbnails.webp` as published output in one visual language. The file is an asset-browser panel of unreadable icons.
- [ ] Give `/work/ai-portfolio-system` visual evidence. It renders zero images, so the two-column chapter layout collapses into an off-centre text column, and its heading claims a demonstrable process with nothing beneath it. At minimum: a scoped task or spec, a review or diff, and a before and after.
- [ ] Source three or four finished output frames for UNCX Video and 3D. One rendered asset exists; everything else is software chrome. Until then the case cannot carry its own page.
- [ ] Resolve Noticia Lingo's light screens against the dark system. Seven white captures on `#060707` with no framing device read as pasted in. The product is genuinely light mode, so this is a frame or card treatment, not a recapture.
- [ ] Replace the Academy `video-page-hero.webp` tile. Its lower two thirds is an unloaded video player, so at thumbnail size it reads as a failed export.
- [ ] Recapture the evidence carried over from the image review: a Solana Diary post in real feed context with no follower count visible.

Severity 3, craft:

- [ ] Fit the preview card at 390x740. The dialog fits the viewport, but the body scrolls: Quiver overflows by 46px and UNCX Company Rebrand by 16px, and on Quiver the "Read the full case study" button is cut in half with its label invisible. This supersedes the earlier note describing it as the last few pixels.
- [ ] Fix the `uncx-menu` preview crop, which cuts mid-sentence through "Reward your community with cross-chain token distribution" and leaves a partial row below.
- [ ] Settle one status vocabulary across the cards. They currently mix Complete, Design Complete, Archived, Live, Complete and In Development, describing the design, the deployment and the archive state interchangeably.
- [ ] Reduce the Solana Diary page weight. It loads 5.3MB against 0.29MB to 1.40MB elsewhere, with the weight in what loads immediately rather than the 37 lazy images.
- [ ] Source or remove the claim at `src/app/data/project-stories.ts:68`, "200+ videos produced at UNCX Network." It is attributed but unsourced, and the Quiver case deliberately makes no clip count claim because its manifests do not reconcile.
- [ ] Add test coverage for `src/app/pages/Project.tsx` and the preview card. `src/app/pages/QuiverCaseStudy.test.tsx` covers Quiver only, so nothing in the suite would catch a regression in any finding above.

Not covered by this audit and still open: colour contrast ratios, keyboard and screen-reader paths, the films and audio, and any physical device.

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
