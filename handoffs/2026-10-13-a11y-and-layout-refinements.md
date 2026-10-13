---
status: active
author: stephen+claude
type: handoff
task: Fix the accessibility and layout findings from the 13 October review of the main site
owner: claude
state: needs-work
round: 1
created: 2026-10-13
updated: 2026-10-13
generated_by: claude
generated_at: 2026-10-13T16:21Z
generated_from: conversation
---

# Accessibility and layout refinements on main

Cross-tool work item. The two tools never talk directly - they read and write
THIS file. Whoever is `owner` acts, writes back, flips `owner`, and increments
`round`. At round 3, escalate to Stephen with both positions rather than
looping.

## Context

A review on 13 October 2026 checked the live production site
(howecreative.co.uk, branch `main`, commit 5b57066) at phone 390, tablet 768,
834 and 1024, and desktop 1280 and 1440. Stephen approved fixing every item
below. Read CLAUDE.md and CONVENTIONS.md first; these points matter most here:

- **Scope is refinement, not redesign.** A returning visitor should notice small
  improvements only. No new colours, fonts, sections, copy or imagery. Change
  only what an item names.
- **Main only.** Do not touch `codex/creative-technologist-portfolio`; it stays
  as it is as the live demonstration site.
- Create `fix/a11y-layout-refinements` from `main`, work there and push it. Merging or
  pushing to `main` needs Stephen's approval at that moment.
- Never delete or overwrite media; archive under `assets-archive/` if anything
  is replaced. No em-dashes or en-dashes in site copy.
- Gates before every commit: `npm run typecheck && npm test && npm run lint && npm run build`.
  Write adversarial tests for each fix (see `src/app/tap-targets.test.tsx` and
  `src/app/concept/WorkIndex.test.tsx` for the existing style), then an
  independent audit before calling it done.

Baseline that already passes, and must still pass afterwards: axe-core 4.10.2
(WCAG 2.0 to 2.2 A/AA plus best practice) found 0 violations on `/`,
`/?study=quiver`, `/?study=uncx-rebrand`, `/cv` and `/archive` at 390 and
1440. Keyboard checks passed: skip link, one `h1`, `main` landmark, `lang`,
every control reachable, the study dialog traps focus, Esc closes it and focus
returns to the card. No horizontal scroll at 390 to 1280.

How it was measured: Playwright with `@axe-core/playwright` against the live
site, scrolling the whole page before full-page captures (sections reveal on
scroll and capture blank otherwise; the hCaptcha box also only loads in a real
browser). The site's CSP blocks injecting axe into the page, so run it from
Playwright. Keep such scripts in `scratch/` or a temp folder, never commit them.

## Outstanding

### Accessibility

- **A1. Captions for narrated video (WCAG 1.2.2, Level A).** No `<video>` has a
  caption track (`WorkIndex.tsx` lines ~317 and ~365 render them). 22 published
  videos have an audio stream:
  - `case-studies/uncx-academy/`: blockchains-explained-ethereum, chain-spotlight-sei,
    flash-loans-defi, impermanent-loss, promo-video, slippage-in-defi, tutorial-lp-locking
  - `case-studies/uncx-video-system/`: avalanche-summit, ethcc-2025, hyperswap-integration,
    lock-announcement-rise, meteora-launch, robinhood-chain-launch, solana-locks-launch,
    token-minter-launch, vesting-app-release
  - `case-studies/uncx-rebrand/brand-launch-video.mp4`
  - `case-studies/quiver/`: basic, advanced, basic-with-phone, advanced-with-phone
  - `earlier-work/chalet-chardons/chef-training.mp4`

  Speech was confirmed in impermanent-loss, promo-video and meteora-launch.
  Music only in quiver/basic and ethcc-2025. Check every file. Transcribe
  locally and free with `whisper-cli -m ~/.cache/whisper.cpp/ggml-base.en.bin`
  (whisper.cpp is installed on the Mac). Music-only files need no captions.
  For each narrated file:
  - Write a WebVTT file next to the video.
  - Carry it in the media data in `site-content.json`.
  - Render it as `<track kind="captions" srclang="en" default>`.

  **Stephen proofreads every caption file before it is published.** Hand the
  files back for review before merge, and list any names or terms Whisper
  misheard.
- **A2. Visible focus ring.** Interactive elements use the browser default
  1px outline (the base layer in `src/styles/theme.css` ~line 88 sets
  `outline-ring/50`). Add one site-wide `:focus-visible` style: 2px solid
  ring in the ink colour with a 2px offset. Inputs in `ContactFoot.tsx` already
  use an accent outline; keep them consistent with the new rule. Mouse focus
  must show nothing new.
- **A3. Minimum label size 11px.** Mono labels are `text-[11px] sm:text-[10px]`
  across the site, so they shrink to 10px from 640px up. Remove the
  `sm:text-[10px]` downshift and the bare `text-[10px]` uses, so labels stay 11px.
  Contrast already passes.

### Layout faults (mainly tablet)

- **L1. Hero stats collide at 1024.** "4 yrs 10 mos" overflows its cell by
  18px into "30" (`Masthead.tsx` ~line 102: `grid-cols-2 ... sm:grid-cols-4`
  inside the `lg:grid-cols-12` hero). Use 2 columns in the `lg` band and
  4 columns again from `xl`, or whatever keeps every value inside its cell from
  1024 to 1279.
- **L2. Header brand wraps at 768 to 834.** The "- Creative Technologist"
  suffix (`src/app/components/Layout.tsx` ~line 57, `hidden sm:inline`)
  pushes the brand onto two lines, so the header is 88px tall instead of 44px.
  Show the suffix only from `lg`, and check that the header stays one line at
  1024.
- **L3. "What I do" cramped at 768 to 834.** `Capabilities.tsx` ~line 51 is
  `md:grid-cols-3`. That gives three 240px cards: headings break to three lines
  and the `whitespace-nowrap` tool line (~line 80) runs past the card edge under
  the next card. Keep one column until `lg`. Check that the tool line never
  overflows at any width.
- **L4. Orphan card in the 2-column work grid.** Between 640 and 1023 the
  grid is 2 columns. Quiver spans both, which leaves nine cards, so card 10
  ("This Site") sits alone beside an empty slot. Make the last card span both
  columns in that band only, laid out horizontally like the featured card. The
  3-column desktop grid (3 by 3) must not change.

### Refinements (all sizes, subtle)

- **R1. Two mono label styles, not nine.** There are 10 and 11px variants with
  tracking from 0.14 to 0.22em, for example in `Capabilities.tsx`,
  `WorkIndex.tsx`, `Method.tsx` and `Layout.tsx`. Settle on one label style
  (section tags, card categories) and one meta style (dates, counts). Define
  them once (a utility class or theme token), not as repeated arbitrary values.
  The visible change should be near zero.
- **R2. One intro-to-content gap.** The gap below the section intro is `mb-10`
  in `WorkIndex.tsx` (~line 984) and `mb-12` in `Capabilities.tsx` (~line 46).
  Use one value for every section intro.
- **R3. Body line-height.** In `Method.tsx`, the Education institution lines
  ("University of Portsmouth", "Tech Educators...") render at 14px/20px. Other
  14px body text is 14px/22.75px (`leading-relaxed`). Match them.
- **R4. Balanced headings on phone.** At 390 the hero headline ends on "work."
  alone, and the "Open to roles" tag drops "UK" onto its own line. Add
  `text-wrap: balance` to `h1`/`h2`. Stop the tag orphaning, for example by
  tightening its tracking on phone or not wrapping the place name. The wording
  stays the same.
- **R5. Link rows on phone.** The LinkedIn and GitHub text links
  (`Masthead.tsx` ~lines 88 to 96) sit 8px in from the column edge because
  of their tap padding. Align their text to the edge while keeping the 44px
  tap target (the tap-target test must still pass). In `ContactFoot.tsx`
  (~line 111), "Dribbble" wraps alone onto a second line at 390 and 1024.
  Keep the text links together as one row under "View CV".
- **R6. "What I do" heading gap on phone.** `Capabilities.tsx` ~line 66 sets
  `min-h-[2.75em]` on the card heading, which leaves a gap under one-line
  headings when cards stack. Apply the min height only when the cards sit side
  by side.
- **R7. Case-study banner badge position.** The study lead banner
  (`WorkIndex.tsx` ~lines 355 to 360: `aspect-[16/10] sm:aspect-[5/2] lg:aspect-[3/1]`
  with `object-contain`) letterboxes the card image. The small UNCX corner
  badge inside the image therefore floats mid-banner instead of sitting in a
  corner. It shows on desktop and tablet, for example `/?study=uncx-rebrand`.
  Size the banner to the image's own ratio when the lead is the card image, so
  the badge sits in the corner as it does on the grid card. Do not edit or
  re-export any image.
- **R8. CV action buttons.** On `/cv`, "Print / Save as PDF" and "Back to
  portfolio" are `fixed right-4 top-4` (`CV.tsx` ~line 129). On wide screens
  that leaves them far from the centred CV column. Align them to the CV
  column's right edge on screen. Print output must not change.

## Done

- Review completed and findings recorded here (13 October 2026).

## Acceptance

- Each item A1 to A3, L1 to L4 and R1 to R8 is fixed as described and named in
  the commit or PR notes. Anything not done is listed with the reason.
- Re-measured at 390, 768, 834, 1024, 1280 and 1440 after scrolling the full
  page:
  - L1: every hero stat value lies inside its cell at 1024 to 1279.
  - L2: the header is one line (44px) at every width.
  - L3: the Capabilities tool line stays inside its card at every width.
  - L4: no grid row has an empty slot from 640 to 1023.
- axe-core on the five baseline pages at 390 and 1440 still reports 0
  violations, and the keyboard checks above still pass. Focus is visibly
  ringed on every interactive element.
- A1: every narrated video has a caption track with Stephen's proofread
  approval recorded in the Log. Music-only videos are listed as checked.
- Before/after screenshots at each width show no change beyond the listed
  items.
- The gates pass, new adversarial tests fail against the old code, and an
  independent audit finds no open issue.
- `ROADMAP.md` updated; `main` merged only with Stephen's approval.

## Log
- 2026-10-13 claude: reviewed live main at six widths with axe-core, keyboard
  checks and measured layout. Recorded 15 approved items with source locations
  and handed over on `main`; implementation goes on `fix/a11y-layout-refinements`.
