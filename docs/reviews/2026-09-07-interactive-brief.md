# Interactive portfolio: implementation and review

Built on `codex/creative-technologist-portfolio`, 7 September 2026. Local preview: port 5174. No production deployment is included.

## The recovered brief

Stephen supplied these references in the project conversation on 4 September:

- https://github.com/MengTo/threeui
- https://hishaamfataar.com/
- https://www.mikes.cv/
- https://jesperlandberg.com/

The request was for a considered Three.js experiment that demonstrates a multidisciplinary practice. Stephen's concepts included turning a head between disciplines, a bookshelf and exploratory environments. The developed head concept connected one person to different perspectives, relevant work and links directly into a discipline. On 7 September he reaffirmed Three.js and the ThreeUI reference after rejecting the first conventional portfolio rebuild.

## Implemented experience

The opening is a custom connected concertina folio using Three.js and React Three Fiber. Five physical surfaces carry actual work. Dragging moves the folds continuously; selecting a surface or a labelled discipline unfolds that perspective. The result joins five forms of practice into one object rather than treating the work as unrelated capabilities.

Each selection updates a direct link:

- `/?view=film`: Quiver and generative film direction.
- `/?view=motion`: UNCX's 3D and motion production system.
- `/?view=product`: Badger Club's product design and implementation.
- `/?view=systems`: Solana Diary's data-to-media workflow and human approval.
- `/?view=brand`: UNCX's brand direction and digital experience.

The project link, contribution and decision narrative update in readable HTML below the object. All ten projects also remain in the complete work index, followed by the practice, career history, six earlier-work collections and contact form.

The separate 3D bundle loads after an initial poster. Rendering sleeps when the scene settles, and the active film stops when paused or outside the viewport. Reduced-motion visitors receive the still presentation and the same discipline navigation. Visitors can select Still view manually. Failed rendering keeps the selected poster, links and controls available, with a recovery control. Artwork materials are recreated when their textures become available to prevent blank panels.

## Quiver

The authored Quiver page opens on the finished monochrome treatment. A single cinema player offers all four completed cuts, with manual sound/playback. Selecting another cut replaces the player so the previous film cannot continue playing. The process pairs Stephen's decisions with finished frames, prepared impact start/end images, the eye cutaway study and production structure. All 11 selected images remain available in the full-size gallery.

Stephen approved the finished films for public portfolio use. His brief was a request for a marketing video, with a supplied logo, existing product website and initial Grok ident concept. He developed the film language and script, generated images in ChatGPT, used Claude to drive ComfyUI for footage and audio, and completed animation and editing. His key judgement was planning around model failures, particularly bowstring physics, with controlled start/end moments and selection across typically 5-10 attempts.

The supplied production files substantiate AI-assisted After Effects scene construction and retiming tools. Four final cuts represent two scripts with and without product/phone imagery. The small source-image selection corresponds to used shots. Discarded guild-character experiments are not presented as finished work. Original files and private working documents remain untouched.

## Remaining project presentation

The other nine projects have authored evidence chapters alongside their original media. UNCX's motion case leads with a real film and connects it to working Cinema 4D and After Effects files. Badger Club provides three selectable product screens before explaining scope, accounts and communication. Solana Diary pairs designed outputs with the actual Telegram review interface and explains its archived status. Brand, Academy and other collaborative projects retain explicit contribution credits. Lead videos appear once; every original image stays available in the gallery.

## CV and positioning

The current white CV is the source, not the historical black PDF. Three focused versions share verified career facts: creative technologist, design engineer and product designer. Standard headings, normal text, clear employer/title/date associations and linked project evidence improve readability and extraction. Quiver is included in the current career and project evidence. Historical job titles remain unchanged. No claim is made that quick rejections establish an ATS parsing failure or that these changes guarantee interviews.

See `2026-09-07-portfolio-positioning.md` for role research, source links, evidence limits and maintenance instructions.

## Verification

- TypeScript, 49 tests across 13 files, ESLint and production build pass.
- Build prerenders 12 routes with readable content, metadata and route-specific CSS. Verification checks local media/download links and contact privacy.
- Browser review covers desktop and mobile openings, direct dragging, keyboard selection, paused motion, still presentation, Quiver film selection, Badger screen selection, project gallery stepping/dismissal and CV focus/export links.
- Regression tests cover failed 3D rendering, per-image readiness, reduced motion and changing gallery collections while a dialog is open.
- All five Quiver web videos fully decode. The 5.5-second opening loop has no audio; the four full films retain audio and their original frame counts.
- All three downloadable PDFs have two pages and more than 6,000 extracted characters each. Each was visually inspected after Quiver was added.
- The separate browser print layout also produces two A4 pages for each focus. All six printed pages were visually inspected and 44 source passages per variant were verified.
- Production contains no private source documents. Personal email appears only on the CV route and its lazy bundle.
- Existing unrelated local changes are excluded from the redesign commit. Originals and source media remain intact.

The selected Three.js direction is ready for Stephen's visual review. A successful build is not a substitute for his judgement of the art direction.
