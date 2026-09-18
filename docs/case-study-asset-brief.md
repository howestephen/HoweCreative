---
status: active
author: stephen+claude
created: 2026-09-18
note: "Hand this to the agent working on a project when that project is ready to become a case study on howe-creative. It is written to be executed without any context from the portfolio repo."
---

# Case study asset brief

You are preparing one project to be published as a case study on Stephen
Howe's portfolio. This brief is the complete request. Deliver everything in
it and nothing else; anything extra is discarded, and anything missing stops
the case study from being built.

Read the whole brief before you start. Section 9 is a checklist.

## 1. What you are delivering

One folder named after the project slug, containing:

```
<project-slug>/
  copy.md            the filled-in template from section 8
  identity.png       or identity.svg, see section 4
  lead.webp          or lead.mp4 + lead-poster.jpg
  chapter-1a.webp    chapter images, see section 5
  chapter-1b.webp
  chapter-2a.webp
  chapter-2b.webp
  gallery/           6 to 14 stills, see section 6
  video/             optional finished films, see section 7
```

Use the project's real slug in lowercase with dashes, for example
`noticia-lingo`. Keep the filenames descriptive rather than the placeholders
above: `chapter-1a-reading-flow.webp` is better than `chapter-1a.webp`.

## 2. The shape of the finished case study

Knowing the shape tells you what the images have to do. In order:

1. A full-width lead image or film.
2. A facts row: role, context, status, year.
3. The assignment, in one sentence, and what Stephen contributed.
4. Two chapters. Each is a label, a title, one or two paragraphs and two
   images that sit side by side.
5. An outcome paragraph.
6. A gallery of the rest of the work.

Everything in section 8 maps onto one of those. Nothing else is used.

## 3. The single rule about images

**Every image in one chapter is cropped to the same shape.** A row of images
at different heights reads as a collage, not a case study. Pick one shape per
chapter from this list and supply both images in it:

| Shape | Ratio | Use it for |
| --- | --- | --- |
| cinema | 16:9 | Film stills, rendered frames, anything photographic |
| screen | 16:10 | Web pages, desktop app screens, boards |
| square | 1:1 | Social posts, icons, single assets |
| tall | 4:5 | Phone screens, portrait app views |
| panorama | 21:9 | Wide banners, long strips |

If a source image is not that shape, crop it to the shape yourself. Do not
send an image expecting the site to letterbox it.

## 4. The identity image

This is the single most important file. It appears alone on a dark panel in
the card that opens from the home page, and it has to say what the project
is before anyone reads a word.

Send **one** of these, in this order of preference:

1. The project's logo or wordmark as an **SVG**, in a version that reads on a
   near-black background. A white or light version, not a black one.
2. The same as a **PNG with a transparent background**, at least 1000px on
   its long edge.
3. If the project has no mark: one **product shot with its background removed**,
   so the app or artefact floats. A phone showing the product's main screen
   works well. Transparent PNG, at least 1000px on its long edge.

Requirements:
- No background colour, no card, no drop shadow, no mockup scene.
- The whole mark, not a crop of it. Nothing cut off at any edge.
- Centred with a little space around it.

Do not send a screenshot of a page that happens to contain the logo.

## 5. Chapter images

Four images, two per chapter, all four cropped as section 3 requires.

Each chapter should answer one question about the work. Good pairs:
- The problem, then the resolution.
- The system, then what it produced.
- Two states of the same screen that show a decision.

For each image also write one short caption saying what it is, in the
template. "The reading view with the article and its lesson side by side" is
a caption. "Screenshot 3" is not.

## 6. The gallery

Between 6 and 14 finished stills. These carry the breadth of the work.

- All are cropped or composed so they read at thumbnail size.
- Each needs one line of alt text describing what it shows.
- Also supply a 640px-wide JPEG of each in a `thumbs/` subfolder, with the
  same filename and a `.jpg` extension.

## 7. Film

Optional. If the project has finished film:

- H.264 MP4, 1920x1080, under 40MB each, no more than four of them.
- A poster frame as a JPEG for each, same filename with `.poster.jpg`.
- Confirm in the template whether each has audio. Do not claim sound the
  file does not have.

## 8. The copy template

Fill this in exactly. Keep to the stated lengths; longer copy is cut.

```
SLUG:              lowercase-with-dashes
TITLE:             the project's name as it should appear
YEAR:              2026, or a range like 2022-2024
STATUS:            Live / Complete / In Beta / In Development / Archived
ROLE:              your job on it, e.g. Product Designer / Developer
CONTEXT:           who it was for, e.g. UNCX Network, or Personal Project
DISCIPLINES:       two or three, from: Creative direction, Film and motion,
                   Product design, Brand systems, Code and systems, AI production

HEADLINE:          one line, under 10 words, says what the project achieved.
                   "Learn a language through the world around you."

SUMMARY:           two sentences, about 35 words. What it is and what you did.

ASSIGNMENT:        one sentence. The problem as it was handed to you.

CONTRIBUTION:      what you did, and plainly what anyone else did. If a team,
                   an agency or a tool did part of it, say which part.

TAGS:              5 to 10 tools, languages or skills actually used.

CHAPTER 1
  LABEL:           01 / Two or three words
  TITLE:           one line, the decision this chapter is about
  BODY:            one or two paragraphs, about 45 words each
  SHAPE:           cinema / screen / square / tall / panorama
  IMAGE A:         filename + one-line caption
  IMAGE B:         filename + one-line caption

CHAPTER 2
  (same fields)

OUTCOME
  TITLE:           one line. Where the project stands now.
  BODY:            about 40 words. What shipped and what is honestly unproven.

GALLERY:           filename + one line of alt text, for each image

FILM:              filename, one-line description, and HAS AUDIO: yes / no
```

## 9. Rules that will get work sent back

**Never send these images.** They make the work look amateur:
- Screenshots of software interfaces: Figma canvases, After Effects
  timelines, Cinema 4D panels, code editors, file browsers, vendor
  dashboards. Show what the tool made, not the tool.
- Full-page website captures. Anything taller than twice its width is
  unusable at any size. Crop to the part that carries the design.
- Any screen still showing Lorem ipsum or other placeholder copy.
- Near-duplicates of an image already in the set.
- Anything with a visible follower count, subscriber count or other audience
  number.

**Copy rules:**
- No em-dashes or en-dashes anywhere. Use a plain hyphen.
- Every number has a source. "200+ videos produced at UNCX Network" is
  allowed because it names where it came from. "Thousands of users" is not.
- Do not describe anything as autonomous, or as an AI system, when a person
  approved or triggered it. Say what the person did.
- Do not claim adoption, growth or time saved that has not been measured.
  "The next measure of success is how it performs in use" is a good sentence.
- Credit is exact. If an external team made the brand foundations and you
  finished the pages, the copy says that.

**Privacy:**
- No email addresses, phone numbers or personal contact details in any image
  or any copy.
- No customer names, real user data or private account content in screenshots.
  Use seeded or example data.
- If any part of the project is under NDA or unlaunched, flag it in the
  template rather than sending it. It will be handled separately.

## 10. Technical specification

- Images: WebP, quality 88 to 92, no more than 2400px on the long edge.
- Transparency: PNG or SVG only, never WebP, for the identity image.
- Thumbnails: JPEG, 640px wide, in `thumbs/`.
- Film: H.264 MP4 plus a JPEG poster.
- Filenames: lowercase, dashes, no spaces, descriptive.
- Colour: sRGB.

## 11. If the project has been redesigned

Say so at the top of `copy.md`, and state which of the old assets are still
accurate. Backend diagrams, data models and architecture images usually
survive a visual redesign; every screenshot of the interface does not. Send
fresh captures of every screen that changed, and mark the surviving files by
name so they are kept rather than replaced.
