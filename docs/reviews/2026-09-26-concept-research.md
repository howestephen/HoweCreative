# Homepage concepts from award-winning precedents

Research date: 26 September 2026. Each concept below is derived from named
precedents whose build accounts were read directly. It lists the technique,
the problems those builders reported and how this build avoids them. It
extends the [market reset evidence](2026-09-07-market-reset-portfolios.md),
which covered Rauno Freiberg, Emil Kowalski, Matt DesLauriers, Stefan
Vitasović, Jonas Reymondin and Artem Shcherban.

## Purpose that every concept must serve

The site exists to win a Creative Technologist or AI Designer role at a larger
international firm. A Media.Monks Creative Technologist listing asks for "a
portfolio of boundary-pushing work", original R&D and the ability to turn
comps into working prototypes
([listing](https://sg.linkedin.com/jobs/view/creative-technologist-at-media-monks-2846508162)).
No creative-technology hiring source was found that states a time-to-first-work
figure, so none is claimed. The working rule is inference: the work must be
reachable from the first screen, every project must say what Stephen made, and
the experience must not fail on a phone.

## Precedents read

| Site | Recognition | What it proves | Build account |
| --- | --- | --- | --- |
| Igloo Inc (Abeto) | Awwwards Site of the Day | Each project is its own object inside one continuous scroll; particles change colour by speed and glow as they reform | [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html) |
| ZERO (BUNQ LABS) | Codrops feature | Scroll-driven WebGL narrative delivered under 10MB at 60fps on budget Android | [Codrops](https://tympanus.net/codrops/2026/07/17/zero-the-engineering-behind-a-defiant-interactive-narrative/) |
| Dennis Snellenberg | Awwwards Site of the Day, Honourable Mention | A text-led work list with a preview window that follows the cursor and slides between projects | [Awwwards](https://www.awwwards.com/sites/dennis-snellenberg-portfolio), [recreation](https://blog.olivierlarose.com/tutorials/project-gallery-mouse-hover) |
| Interactive Particles (Bruno Imbrizi) | Codrops tutorial | An image becomes one point per bright pixel; dark pixels are discarded | [Codrops](https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/) |
| Particles Morphing (Three.js Journey) | Course lesson | Morphing between shapes by sending two position attributes and one progress value | [Lesson](https://threejs-journey.com/lessons/particles-morphing-shader) |
| Joffrey Spitzer | Codrops feature | Homepage opens on a showreel; the multi-megabyte video must be preloaded | [Codrops](https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/) |
| Stefan Vitasović | Codrops feature | Consistent video treatment across projects; WebGL removed on mobile | [Codrops](https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/) |
| Goodgrowth | Codrops feature | Audio stutter fixed by scheduling on the Web Audio clock; mobile swipe fixed by snapping from the gesture's start | [Codrops](https://tympanus.net/codrops/2026/08/27/goodgrowth-boot-sequences-spinning-discs-and-the-art-of-the-portfolio/) |

Platform rule checked at source: iOS Safari autoplays a video only when it is
muted or has no audio track, starts it only when visible, pauses it when it
leaves the viewport, and needs `playsinline` to avoid fullscreen
([WebKit](https://webkit.org/blog/6784/new-video-policies-for-ios/)).

## Concept 1: the portrait becomes the work (extends /study)

**Experience.** The portrait dissolves as it does now, but instead of settling
into an abstract ring, the particles reform into each selected project's key
image in turn: Quiver's archer, the UNCX lock, the menu on a phone, and so on.
A pinned showcase holds each image for part of a viewport while its title,
role and link sit beside it in HTML. The colour arrives with the work: the
portrait is monochrome, each project image carries its own real colours, and
moving points brighten with speed as Igloo's do.

**Why it serves the purpose.** The opening effect stops being decoration and
becomes the index. One pipeline visibly represents film, product and brand
work, which is the creative-technologist claim made concrete.

**Technique.** Igloo's single continuous scroll with one object per project;
Imbrizi's one-point-per-bright-pixel sampling; the morphing lesson's second
position attribute and progress value. Every image is sampled to the same
point count so correspondence never changes, and points are paired by
brightness rank so light areas flow into light areas.

**Risks and mitigations from the precedents.**
- Upload and decode stalls: ZERO saw 50ms texture uploads. Targets are
  computed once in a worker-free idle pass from small (256px) images into
  typed arrays and uploaded as attributes before the loader clears; no
  textures are streamed during scroll.
- Mobile GPU precision: ZERO had to force `highp` on Adreno and Mali. The
  shader declares `precision highp float`.
- Frame drops on budget phones: ZERO's adaptive quality; the existing renderer
  already drops pixel ratio after sustained slow frames, and phones sample
  fewer points.

## Concept 2: the index with a live preview (extends the editorial homepage)

**Experience.** The editorial work ledger becomes the centrepiece: large
project titles in a list, and a preview window that follows the cursor and
slides between each project's image or silent motion loop as rows are hovered.
On touch screens there is no hover, so each row shows its thumbnail inline and
the preview never appears.

**Why it serves the purpose.** Every project is visible and one click away
from the first scroll, which is the recruiter's path, while the motion shows
interaction craft without GPU risk.

**Technique.** Snellenberg's pattern as documented in the recreation: a masked
window whose inner strip of images translates by index, following the cursor
with eased transforms. Implemented with CSS transforms and
`requestAnimationFrame`, not WebGL.

**Risks and mitigations.**
- Hover-only content on touch: gated behind `(hover: hover) and (pointer:
  fine)`; touch keeps the existing thumbnails.
- Janky following: transform-only animation on one composited element, no
  layout properties, as the recreation's `quickTo` approach implies.
- Motion sickness and keyboard users: disabled under reduced motion; rows are
  ordinary links, and keyboard focus moves the preview to the focused row.

## Concept 3: the reel with chapters (new route, /reel)

**Experience.** A full-bleed, muted showreel cut from Stephen's own films:
Quiver, the UNCX brand launch, the token-minter launch and the lock
announcement. A chapter rail names each project. The current chapter shows a
compact panel: what it is, what Stephen made, and a link to the case study.
Selecting a chapter jumps to it; sound is opt-in.

**Why it serves the purpose.** Motion and film are Stephen's strongest unique
evidence and the reel is the industry's expected format for them. The chapter
panel adds the attribution and route to depth that a bare reel lacks.

**Technique.** One short, compressed clip per chapter rather than one long
file, played in sequence in a single video element; the next clip is preloaded
while the current one plays. Clips are cut from the existing masters with
ffmpeg at 1280px H.264 so every browser decodes them.

**Risks and mitigations.**
- iOS autoplay: `muted`, `playsinline` and no forced unmute; sound only after a
  tap, per WebKit's policy.
- Weight: the masters are 20 to 35MB each; the chapter clips are budgeted at
  under 3MB each and only the first is loaded eagerly, as Spitzer's account
  warns.
- HEVC masters: three of the four masters are HEVC, which Firefox and some
  Android browsers cannot play; all clips are re-encoded to H.264.

## Not recommended, with reasons

- **Boot sequences and OS metaphors** (Goodgrowth, Henry Heffernan): they
  delay the work by design, and read as a younger developer's showcase rather
  than a senior practitioner's.
- **A persistent 3D world** (Active Theory, Bruno Simon): years of engine work
  behind them; the scope is out of proportion to a job search.
- **Colour tints on a random share of points**: tried and rejected on the
  study. Igloo shows colour should come from motion or from the content.

## Branches

Each concept is built on its own branch from
`codex/creative-technologist-portfolio`, at Stephen's request, which
temporarily exceeds the project's two-long-lived-branch rule until he chooses:
`concept/portrait-into-work`, `concept/index-preview`, `concept/chapter-reel`.
