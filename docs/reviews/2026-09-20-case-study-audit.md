# Case study, card and disclosure audit - 20 September 2026

Branch `codex/creative-technologist-portfolio`, audited at commit `5e9812f`. The
subject is every public case study, the selected-work cards, the preview card
and the material each page actually serves. This record exists so the work can
be picked up without the conversation that produced it.

## Method

- Built the site (`npm run build`) and served `dist` at `127.0.0.1:5175`.
- Captured all ten `/work/:slug` routes full page at 1440x900 and 390x844 with
  headless Chromium, recording per page: image count, broken images, console
  errors, horizontal overflow and document height.
- Measured the selected-work cards and every preview dialog at 1440x900,
  1280x800, 390x844 and 390x740, recording card height spread, dialog fit
  against the viewport and internal scroll overflow in pixels.
- Measured initial transfer weight and lazy-loading coverage per page.
- Cross-checked every filename in `site-content.json` and
  `src/app/data/project-stories.ts` against the verdicts in the
  [image review](2026-09-18-case-study-image-review.md).
- Opened the flagged images directly rather than relying on the earlier report.
- Traced every numeric and status claim in the copy back to a source.
- A separate agent reviewed the 26 desktop captures adversarially against the
  Quiver benchmark. Its conclusions were spot-checked before being recorded
  here; one was corrected (see Academy below) and one was wrong on a fact it
  could not see (see finding 3).

## Severity 1 - disclosure and accuracy

### 1. The restricted V7 case study is publicly delivered and indexed

`uncx-app-concepts` was removed from `/study` and `/archive` only. The build
still prerenders `dist/work/uncx-app-concepts/index.html`, the route returns
200, its 19 images ship at 4.4MB under `dist/case-studies/uncx-app-concepts/`,
the URL is listed in `dist/sitemap.xml`, `robots.txt` allows it, and the live
root homepage links to it as "UNCX App Prototyping" via
`href="/work/uncx-app-concepts"`. Excluding it from two index arrays did not
restrict it. This is the deployment blocker already recorded in the Figma
backlog, now confirmed as active exposure rather than a pending review.

### 2. A client roster is published with no context

`public/case-studies/uncx-video-system/c4d-ui-takes.webp` is a Cinema 4D Take
Manager panel listing thirteen named commercial partners: Kleros, Solscan,
Infinity, Vertai, Vitreus, Edel Finance, Taobot, SQD, Meteora, 9BIT and others.
The image review marked it CUT and flagged the confidentiality question; it is
still served in the collection grid. It carries no portfolio value.

`public/case-studies/badger-club/resend-email-setup.webp` shows a Resend
dashboard with the sending domain, its registrar and DNS verification
timestamps. The domain is Stephen's own and publicly registered, so this is a
quality problem rather than a disclosure one, but it has the same zero value.

### 2b. Agent hook logs were shipping in the build

Four `.claude/hooks-state/hook-log.jsonl` files had been created inside `public/`
by an agent's working directory changes, so `vite` copied them into `dist` at
`dist/.claude/`, `dist/case-studies/.claude/`,
`dist/case-studies/uncx-app-concepts/.claude/` and
`dist/case-studies/noticia-lingo/.claude/`. They contain session identifiers,
tool names and timestamps rather than secrets, but they are machine artefacts
with no place in published output. Removed from `public/` and `dist/` during this
audit. Anything written into `public/` is published, so agents must not use it as
a working directory.

### 3. The Unified Menu is presented as shelved work

The menu is live in production, confirmed on 15 September and recorded at
`docs/reviews/2026-09-07-design-reset/plan.md:176`. The public case study still
says status "Design Complete", "The project is on hold due to a shift in
development priorities" and the outcome heading "Design complete. Implementation
on hold." The status string is also hard coded at `src/app/pages/Project.tsx:246`
and reaches the homepage card and the archive row. The stale copy was logged for
correction on 15 September and has not been corrected. The adversarial reviewer,
working from the captures alone, praised the line as honest, which is how a
reader will take it.

### 4. The page counter advertises the excluded project

`src/app/pages/Project.tsx:264` counts `projects` (10, including
`uncx-app-concepts`) while `next` at line 237 uses `publicProjects` (9). Every
public case study therefore reads "N / 10" against nine findable projects, and
the indices skip. Combined with finding 1, this tells a reader a tenth project
exists and the sitemap tells them where it is.

## Severity 2 - evidence quality

### 5. The image review's cuts were never applied to what is served

`src/app/pages/Project.tsx:239` builds "The complete collection" from the whole
`project.media` array, so every image the review marked CUT is still published
below the curated story. Fifteen remain:

| Project | Still published |
|---|---|
| uncx-video-system | youtube-thumbnails, c4d-ui-layers, c4d-ui-rigging, c4d-ui-takes, ae-files-1, ae-files-2 |
| uncx-rebrand | brand-designs, rebrand-designs, rebrand-concepts |
| uncx-menu | research, contents-concept, variables-setup |
| badger-club | database-schema, resend-email-setup |
| noticia-lingo | database-schema |

Four are also still inside the curated chapters: `youtube-thumbnails.webp` and
`after-effects-ui.webp` (video system), `research.webp` and
`variables-setup.webp` (menu), `database-schema.webp` (badger club and noticia
lingo).

### 6. A caption misdescribes its image

`src/app/data/project-stories.ts:58` captions `youtube-thumbnails.webp` as
"Published output across launches, explainers and tutorials in one visual
language." The file is an asset-browser panel of unreadable icons. The claim is
not supported by the image beneath it.

### 7. The AI portfolio case study has no evidence images

`/work/ai-portfolio-system` renders zero images: no lead, no chapter frames, no
collection. The two-column chapter layout collapses into an off-centre text
column with large empty areas, so the omission reads as a layout failure as well
as a content gap. Its heading claims a build process with judgement built in and
shows no scoped task, no review, no diff and no before and after.

### 8. UNCX Video and 3D has no finished output

Unchanged from the image review. One rendered asset, and otherwise After Effects
UI, Cinema 4D outliners and file trees at 8 to 10px type across both the chapters
and the collection. The case needs three or four real outcome frames.

### 9. Noticia Lingo's light screens fight the dark system

Seven bright white app captures on `#060707` with no frame treatment, so they
read as pasted in rather than staged. The product is genuinely light mode, so the
fix is a framing device, not a recapture.

### 10. The Academy video-lesson tile reads as a failed export

`video-page-hero.webp` has a header and title, but the lower two thirds is an
unloaded video player. At collection thumbnail size the tile is largely empty
black beside fully designed neighbours. Replace it with a frame that has visible
content.

## Severity 3 - craft

### 11. The preview card clips its call to action on a short phone

At 390x740 the dialog fits the viewport, but its body scrolls: Quiver overflows
by 46px and UNCX Company Rebrand by 16px. On Quiver the "Read the full case
study" button, the only route onward, is cut in half with its label invisible.
The previous record described this as the last few pixels of the longest cards.

### 12. The menu preview image is cut mid-sentence

The `uncx-menu` preview crops through "Reward your community with cross-chain
token distribution", leaving a partial row below it. The crop is anchored to the
top as intended but its bottom edge is arbitrary.

### 13. Status vocabulary is inconsistent across the six cards

Complete, Design Complete, Archived, Live, Complete, In Development. Some
describe the design, some the deployment, some the archive state. Needs one
vocabulary.

### 14. Solana Diary loads 5.3MB of imagery

Against 0.29MB to 1.40MB on every other case study. 37 of its 41 images are
lazy, so the weight is in what loads immediately.

### 15. The 200-plus video claim has no source

`src/app/data/project-stories.ts:68` states "200+ videos produced at UNCX
Network." The claim is attributed, which satisfies the naming rule, but no
source exists in the repository. The Quiver case deliberately makes no clip
count claim because its manifests do not reconcile.

## What passed

No broken images, no console errors and no horizontal overflow on any of the ten
routes at either width. All 142 media entries resolve on disk and carry alt text.
Every image referenced by `project-stories.ts` resolves to a media entry. Card
heights are identical at all four measured widths, spread 0px. Preview dialogs
fit inside the viewport at all four widths. `npm run typecheck`, `npm test` (83
tests, 16 files) and `npm run build` all pass. No em-dashes or en-dashes in site
copy. No email address, phone number or follower claim in page copy.

## Not checked

Colour contrast ratios, keyboard and screen-reader paths, the films themselves,
audio, and any physical device. No test covers `src/app/pages/Project.tsx` or the
preview card, so nothing in the suite would catch a regression in any finding
above. `src/app/pages/QuiverCaseStudy.test.tsx` covers Quiver only.

## Opening sequence, context for whoever picks it up

Outside the scope of this audit and currently with another agent, which replaced
the pillar model with a per-pixel depth map at `c389617` and `f40ea5c` while this
audit was running. Recorded here only because one fact travels with the file.

The reference recording named in the plan,
`ScreenRecording_09-16-2026-02-21-57_1.mov`, is not present in the repository or
anywhere on the machine. Every change made to
`src/app/experience/portrait-particles.ts` between 16 and 19 September was made
against the written description in `plan.md` rather than the recording, and a
sequence of attempts at the vertical line artefact were reviewed and rejected in
turn: a continuous sine depth field, a revert, a monotonic pillar reordering
combined with a camera orbit, and a phase resequence. Measurement during the last
of those put the artefact at roughly 2 to 4px spacing, matching the sample grid
rather than the thirteen pillars, visible only during separation and absent at
rest. The cause was not isolated before the model was replaced. Ticked opening
items on the roadmap describe what was built at each point, not an accepted
result.
