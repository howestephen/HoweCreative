# Portfolio and CV review

Reviewed 7 September 2026. Branch: `codex/creative-technologist-portfolio`.

## The current CV

Stephen confirmed that the white `/cv` page with its export control is the current CV. The black PDF in `docs/` is historical reference, not the document used to judge the current application's parsing risk.

The current page was already largely single-column. Its larger weakness was positioning: the summary emphasised systems in general terms, employment bullets dominated, and the React builds and automation projects were absent as concrete evidence. It also compressed contact details into four small boxes and relied on browser print for export. No evidence establishes that an ATS caused the quick rejections. Screening questions, role fit, timing and applicant competition remain other possible explanations.

The replacement keeps standard headings, normal letter spacing, selectable text, explicit employer/title/date associations and plain contact lines. It adds directly linked projects. Three variants use one source of career facts while changing the headline, summary, project order and skill emphasis. Real employment titles are unchanged. The downloadable PDFs have been checked for chronological text extraction and rendered page layout. A parsing check is not a guarantee of a hiring-system score or an interview.

## Positioning

The strongest proposition is a creative technologist with hands-on ownership across art direction, generative media, motion, production tooling and working software. Quiver supplies the most current evidence: Stephen took an open marketing brief through script, visual treatment, image and footage generation, animation, edit and AI-generated music. His account of planning around unreliable bowstring physics shows judgement about model behaviour, not simply familiarity with a tool.

The value of this range is concrete. Stephen can assess what a model can produce, create the material, design the motion, shape the edit and build tools to keep the production manageable. Solana Diary demonstrates a different intersection of design and engineering; Badger Club demonstrates product scoping and implementation. None of this requires an unsupported claim to replace an entire team or a changed historical job title.

Quiver leads the project order and has a dedicated film and process presentation. Its four final edits and selected production stills make the work itself inspectable. Each current project retains a shareable URL, clear contribution and status, design decisions and a media gallery. Earlier work establishes continuity without presenting old work as current output. The homepage uses a custom Three.js concertina folio. Five connected surfaces carry actual work, and dragging or selecting a discipline unfolds its perspective, project link and decision narrative. Direct perspective links support applications with different creative and technical emphases.

## Target roles and evidence

| Role | Emphasis supported by the portfolio | Important evidence still to strengthen |
| --- | --- | --- |
| [Luma: Creative Technologist](https://jobs.ashbyhq.com/lumaai/3dcb1269-cc80-418c-b650-b1ad7dd4e188) | Quiver's complete generative film production, ComfyUI video and audio workflows, model-aware shot planning, selection across repeated takes, authored After Effects motion and reusable production scripts; established UNCX 3D/motion production and Solana Diary's data-to-media workflow | Quiver closes the previous gap in authored generative-media evidence. It does not establish a particular daily usage frequency, named model benchmarks or Luma endpoint experience. Add those only when Stephen can substantiate them. |
| [Duvo: Design Engineer](https://www.duvo.ai/careers/design-engineer-eu-uk-based-remote) | Badger Club's full-stack beta, leader-only account decision, React/TypeScript skills, navigation states in Figma, Telegram approval interactions | Show inspectable application code, real interaction states, accessibility/performance decisions and testing from the product itself. Do not imply that twenty years in design and technology means twenty years of React engineering. |
| [ElevenLabs: Product Designer](https://elevenlabs.io/careers/89da00ec-11b0-4359-913b-c3a89c1013bc/product-designer) | Product flows and interaction design, Academy's learning/content structure, professional video production, direct use of generative audio and video in Quiver, collaboration with developers | Stronger examples of user feedback affecting a design, alternatives considered and observed user outcomes would improve the case. Quiver establishes experience as an AI-media creator; it does not establish specialised voice-AI product design experience. |

The Luma posting was retrieved from its public Ashby job feed after the job page's JavaScript-only response. Duvo and ElevenLabs were read directly. Requirements describe those postings as retrieved on the review date and may change.

## Content corrections

- Quiver: Stephen confirmed public portfolio permission and personal ownership of the film approach, script, generated imagery/footage, animation, editing and music production. The logo, existing product interface and early Grok-generated ident concept were supplied. Music is explicitly AI-generated using ComfyUI. His description of "I2I" is represented as image-led generation rather than silently changed to a different model workflow.
- Quiver production tooling: the supplied motion-design document and actual After Effects template-builder/reflow scripts substantiate reusable scene construction, separate footage/mist/type layers, and edit reflow that preserves scene order and trims. These are described as AI-assisted production tools. Draft script durations and unused footage counts are not presented as final deliverables.
- UNCX rebrand: separates the solo 2022 work from externally supplied 2024 foundations and Stephen's in-house completion.
- UNCX Academy: credits external designers for the initial identity/components and the in-house developer for the website/CMS. Stephen's direction, page design, graphics and media remain clear.
- Badger Club: describes the leader-only beta and removes unmeasured claims that it eliminated manual overhead.
- Solana Diary: describes automated code-driven production with human Telegram approval, AI-assisted development and optional button-triggered Grok support. No audience claims.
- Video counts: uses 200+ at UNCX and a dated 140+ for the freelance corporate-learning client by January 2018. These are attributed, not added together as a headline statistic.
- Expired Scrum certification is not presented as current. Agile/Scrum working practices remain in the toolkit.

## Project and archive coverage

All ten current project collections are included. The original nine retain their existing image and video assets. Quiver adds four completed films, selected final-frame stills and a small set of relevant source plates. Stephen identified most of the separate guild-character explorations as unused; none is presented as completed Quiver work. Six earlier collections were recovered from the iCloud portfolio sources identified in the private archive notes: Chalet Chardons, Book Your Wellness, Qtac, Burger Theory, Hot Biscuit and 412 Promotions. Originals remain in place, with local archive copies and optimised display derivatives.

Restricted casino and corporate-training media is not copied into the public site. Their professional experience is included in the career history. Burger Theory carries the supplied identity credit; Chalet Chardons credits Maciek Dolasinski for recipes and operational content. Good Salon Guide and BBC remain career evidence because no appropriate visual collection was established.

## Application use

- Creative production/technology applications: `/cv?focus=creative-technologist`.
- Design and engineering applications: `/cv?focus=design-engineer`.
- Product design applications: `/cv?focus=product-designer`.
- Use the matching PDF, then link directly to two or three relevant project pages in the application.
- Confirm auto-filled employer, title, dates and contact details before submitting. Follow the employer's requested file format.
- Record the role, CV variant, portfolio links and screening answers for future applications. Compare results rather than assuming a formatting change solved the problem.

[Greenhouse's parsing guidance](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse) identifies columns, letter spacing, graphics, headers/footers and unclear sections as possible parsing problems. It describes information extraction into candidate fields, not a universal automated rejection score.

## Maintaining the redesign

Project source: `site-content.json`; presentation: `src/app/data/project-index.ts`; Quiver film/process presentation: `src/app/data/quiver-story.ts`; archive: `src/app/data/earlier-work.json`; CV: `src/app/data/cv.json`.

After changing CV content, run `scripts/build-cv.py` with Python containing ReportLab and pypdf, then render and inspect all three PDFs. The script checks that each is two pages and extracts the expected text. The page's Print / Save as PDF control is also retained.

`npm run build` creates the normal Vite output, then pre-renders the homepage, CV and all project routes with route-specific metadata. Build verification checks static content, links, media, PDF signatures and separation of personal email from non-CV pages/bundles. Existing hosting and contact transport are preserved. No production deployment is part of this branch work.
