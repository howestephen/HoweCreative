# Portfolio & CV Repositioning Plan

**Date:** 2026-07-09
**Goal:** Reposition howecreative.co.uk and the CV so a hiring manager at a large international firm (or a crypto company) reacts with "that's unique, book a call" instead of "dark and retro." Target roles: Creative Technologist / AI Designer / Design Engineer, permanent preferred, contract acceptable.

**Status (2026-07-17):** Implemented as a replacement editorial design on
`claude/concept-editorial`. The previous site remains on `main` until responsive,
accessibility, content, CV-export, and contact-flow QA are complete. Where the
implementation deliberately moved beyond an item below—such as replacing the
dual-theme concept with a light-first editorial system—the current roadmap in
`ROADMAP.md` is authoritative.

---

## 1. Diagnosis

### What is already strong (keep)

- **Case study skeleton.** Brief → Problem Frame → System Design → Trade-offs → Delivery → Outcome is better than 90% of design portfolios. The Trade-offs sections are unusually honest and senior-reading. Keep this structure exactly.
- **Real breadth with real depth.** Brand + 3D/motion pipeline + product design + shipped full-stack apps + AI-assisted dev is a genuinely rare stack. The content proves it; the presentation hides it.
- **Technical execution.** Working WebGL with iOS fallbacks, content model in JSON, serverless contact with rate limiting, tests. The site itself is proof of capability.
- **The "systems over surfaces" thesis.** This is the correct positioning spine for creative technologist roles. It just needs to be said in plain first-person English.

### What is costing interviews

**A. The visual language is a genre, not a brand.**
Matrix rain (1999), katakana glyphs, wireframe VHS tape, Tron "END OF LINE", "© 1984", operator dossier files, scanlines. Every reference is 25–40 years old. For an AI-era role the site should feel like 2026, not an homage. A reviewer spending 30 seconds pattern-matches this to "hobbyist hacker aesthetic" before reading a word. The user-stated fear ("dark and a bit retro") is exactly what a first-time visitor perceives.

**B. The persona conceit creates distance.**
"Operator Profile", "the operator managed…", "Site Navigation Matrix", "Selected demonstrative artefacts", "Operator interface relay active: Awaiting input". Employers hire a person. Third-person in-world voice (a) obscures ownership of achievements, (b) adds cognitive load, (c) reads as designed for the author's enjoyment rather than the reader's decision. This is the "personalised to my desires" problem, self-diagnosed correctly.

**C. The work is hidden behind the theme.**
Case study covers are uniform red/black. The actual output — colourful UNCX brand systems, light-mode product UI, 3D renders, video — only appears after two clicks. A multi-disciplinary designer currently presents as monochrome. Range is the product; the shell suppresses it.

**D. Concrete defects (fix regardless of any theming decision).**

| Defect | Where | Impact |
|---|---|---|
| Bitwise headline font renders lowercase/upper "k" as "h" | Site: "The preferred toolhit.", footer "Tools + Shills", nav "QUICH ACCESS". CV: "SHILLS", "HEY ACHIEVEMENTS" | "Shills" is catastrophic in a crypto context. Reads as typos everywhere else. |
| Wordmark overflows viewport on mobile hero | `MatrixRainHero` at 375px — "HOWE_CREATIVE" clipped both sides | First impression on phones (most recruiter first-opens) is a layout bug |
| `© 1984 Stephen Howe` | Footer | Reads as an unmaintained/broken site, not a joke |
| No meta description, no OpenGraph/Twitter card, no favicon | `index.html` | Pasting the URL in Slack/Teams/LinkedIn/X produces a blank card; Google shows junk snippet |
| `<title>HOWE_CREATIVE</title>` | `index.html` | Recruiters search "Stephen Howe"; the title should carry name + role |
| LinkedIn footer label renders "/en/howestephen" | Footer | Sloppy detail in the exact place recruiters look |
| Archive entries have empty `preview` fields and read as placeholders | `site-content.json` archive | Looks unfinished; either populate or remove section |
| Muted grey `#717182` body text on `#050505` at small mono sizes | Throughout | Borderline contrast, fatiguing; fails WCAG AA in places |

**E. The AI story is asserted, not demonstrated — and absent from the CV.**
- The site's most differentiating fact — built by a custom prompt system executing roadmap phases with build/QA loops — is buried in the footer.
- The CV contains **zero** AI keywords. No Claude, no ComfyUI, no generative pipelines, nothing. For "AI Designer" applications the primary keyword is missing from the primary screening document.
- The newest, most relevant project (Solana monitor → dataset → rendered assets → scheduled X posts with Telegram approval loop) is not in the portfolio at all.

**F. The CV likely fails automated screening — this is probably the "fast rejections."**
Fast rejections (hours–days) at larger firms usually mean ATS/recruiter-screen failure, not considered human judgement. The current CV:
- Uses letter-spaced display text that extracts as broken tokens ("ST EPH EN_HOW E", "C R E A T I V E T E C H N O L O G I S T") — keyword matching on "Creative Technologist" fails.
- Uses a pixel font that renders "SKILLS" as "SHILLS" to human eyes.
- Is dark-themed: prints black, photocopies illegibly, and re-renders unpredictably in ATS viewers.
- Has strong numbers (30 games, 140+ videos, two rebrands) but no AI/2026-relevant capabilities.
- Conclusion: **the CV is the highest-leverage fix, before the website.**

**G. No conversion path or social proof.**
No "Download CV", no direct email link, no client logos, no testimonials, no link to the live X feed the pipeline posts to. The contact form is the only action, labelled in-world.

---

## 2. Positioning strategy

### The spine (one sentence, used everywhere)

> **Stephen Howe — Creative Technologist. I design brand, product, and 3D systems — and build the AI pipelines that produce them at scale.**

Supporting proof points, in order:
1. 20+ years across brand, motion, 3D, product UI, and front-end code.
2. 4+ years as the sole designer at a multi-chain DeFi protocol (rare crypto-native design leadership).
3. Ships production code (React/TS/Three.js) and runs agentic AI build pipelines (spec → roadmap phases → build/QA loop).
4. Builds autonomous creative systems: generative asset pipeline publishing to X on a schedule with human-in-the-loop approval.

### Audience mapping

| Audience | What they must see in 10 seconds | Primary artefact |
|---|---|---|
| Recruiter/ATS at international firm | Name, title keywords, employers, metrics, AI skills | ATS-clean CV + LinkedIn |
| Design/creative-tech hiring manager | Range + craft + systems thinking + AI fluency | Site: hero → flagship case study |
| Crypto company | DeFi-native experience, shipped token/launchpad UX, security-aware | Site: crypto-tagged work + UNCX studies |
| Freelance/contract client | Services, availability, day-rate signal, fast contact | Site: services block + contact |

### Role-title targeting (use these words verbatim on site, CV, LinkedIn)

Creative Technologist · Design Engineer · AI Product Designer · Creative Developer · Design Systems · Generative/AI pipelines · Rapid Prototyping. For crypto variants add: Web3, DeFi, token launch, launchpad, wallet UX, multi-chain.

### The honest reframe on "personalisation"

The instinct to make it personal isn't wrong — generic portfolios die too. The fix is aiming the personality at the *reader's* question ("what can this person do for us?") instead of the author's fiction. Keep the personality in: the systems thesis, the trade-offs candour, the live generative demos. Take it out of: navigation labels, third-person persona voice, genre cosplay.

---

## 3. Design direction

### Recommended: "AI studio, 2026" — evolved dark + light dual theme

Keep the technical identity, replace the 1999 references with 2026 ones:

- **Base:** deep neutral (e.g. `#0B0D10` family), not pure black; generous whitespace; remove scanline/noise overlays from text areas.
- **Accent:** keep a red as heritage but desaturate/duotone it (or shift to a signal orange/coral); introduce a second neutral accent so covers aren't monochrome.
- **Type:** modern grotesk for headlines (e.g. Space Grotesk / General Sans class); IBM Plex Mono demoted to labels/metadata only. **Delete Bitwise entirely** (the k→h font).
- **Hero:** replace matrix rain + stock wireframes with **your own generated assets** — a rotating showcase of pieces from the Solana pipeline / C4D work, ideally seeded so each visit renders a different variation. "The hero is generated" *is* the wow.
- **Light theme with toggle, defaulting to system preference.** You ship dark/light products (Badger Club) — demonstrating it on your own site is proof of product maturity, and light-mode screenshots of your colourful work will finally read.
- **Keep, translated to plain language:** the dossier/file structure becomes simple numbered sections; "Operator Profile" → "About"; "Site Navigation Matrix" → "Menu"; "Selected demonstrative artefacts" → "Selected work"; contact status line → "Replies within 24h".

### Alternative (bolder): "precision instrument" light-first

Off-white/paper base, engineering-drawing grid, one accent, dark mode as the secondary "workbench". Most distinctive option in a sea of dark AI portfolios, and best for showing colourful work — but a bigger break from current identity. Choose this only if the evolved-dark mock doesn't feel differentiated enough.

### The "wow" mechanics (either direction)

1. **Generative hero** — own assets, parameterised per visit.
2. **"How this site builds itself" page** — publish the real prompt system: roadmap phases, atomised tasks, build/QA loop, with the actual diagrams. No other candidate will have this.
3. **Live X feed embed** — the autonomous pipeline posting in public, on a schedule. A portfolio section that updates itself daily is unique.
4. **Micro-interactions with restraint** — one signature motion (e.g. the file-open transition) executed perfectly beats ten ambient effects.

---

## 4. Content & copy overhaul

### Hero (above the fold answers who/what/proof/action)

- Line 1 (eyebrow): `Stephen Howe — Creative Technologist`
- Line 2 (headline): the spine sentence, first person.
- Line 3 (proof strip): `20+ yrs · Brand → 3D → Product → Code · 4 yrs DeFi · AI-pipeline builder`
- CTAs: `View work` (primary) · `Download CV` (secondary) · direct `email` link in nav.
- Brand mark `HOWE_CREATIVE` can remain as a logo; it must not replace the name.

### Voice pass (site-wide)

- First person throughout; "the operator" → "I". Every case study Outcome begins with a verb I own.
- Kill in-world labels (list in section 1B). Keep terminology a hiring manager uses.
- Fix "user-experience" → "user experience".

### Case studies

- Reorder for the target role: 1) **NEW: Autonomous asset pipeline** 2) UNCX Rebrand (visual impact) 3) Video & 3D System 4) Badger Club (full-stack proof) 5) Unified Menu 6) Academy 7) App Prototyping 8) Noticia Lingo.
- Give every study a **quantified outcome line** at the top: production time cut (%, or hrs→hrs), videos shipped, pages designed, games live. Estimate honestly where exact numbers don't exist ("~70% faster per video after templating" style).
- Replace uniform red covers with real artwork per project (you have the assets in `public/case-studies/`).
- Rename statuses: "On-Hold" → "Design complete — build paused"; "Late Stage" → "In beta"; "Various" → "2021–2026".

### New flagship case study: the Solana → X pipeline

Structure (existing skeleton fits perfectly):
- **Brief:** autonomous daily content channel from live on-chain data.
- **System:** monitor → Postgres → dataset payloads → rendered assets → scheduled slots (8:10/12:10/5:10 ET) → deterministic copy generation → Telegram approval → X publish, with retries and operator controls.
- **Media:** architecture diagram, Telegram approval UI, generated assets grid, embedded live posts.
- **Outcome:** posts/week shipped hands-off, approval latency, consistency.
- Tags: `AI Pipeline · Automation · Solana · Node/Railway · Telegram · X API · Generative assets`.
- This study answers "AI Designer" and "crypto" simultaneously — it leads every crypto application.

### New sections

- **Services/Roles block:** "I take on: Creative Technologist / Design Engineer roles (permanent) · brand & motion systems, product design sprints, AI pipeline builds (contract)." Explicit availability, timezone (UK, overlaps US-East mornings), remote track record.
- **Social proof:** UNCX + Switch Studios + client logos; 2–3 one-line testimonials (request them now — ex-colleagues, UNCX leadership, freelance clients).
- **/cv route:** clean HTML CV (printable, ATS-linkable) + PDF download.

### SEO/meta (index.html)

- Title: `Stephen Howe · Creative Technologist — AI, 3D & Design Systems`
- Meta description, OG/Twitter card with a designed 1200×630 image, favicon, canonical, JSON-LD `Person` schema.

---

## 5. CV strategy (do this first)

### Dual-CV system

1. **Primary (all applications): ATS-clean.** Single column where possible, white background, real text, standard headings (Summary, Experience, Skills, Education). System font or plain humanist sans. No letter-spacing tricks, no pixel fonts, no dark theme. Test by copy-pasting the PDF text out — every word must survive intact.
2. **Secondary (the flex): themed CV**, restyled to match the new site direction, offered on the site and to humans who are already engaged.

### Content changes (both versions)

- **Add an AI capabilities block — this is the missing keyword set:** AI-assisted development (Claude Code, Codex), agentic build pipelines (spec → phased roadmap → automated build/QA), ComfyUI / generative asset workflows, prompt systems for production, autonomous publishing pipelines (Telegram approval → X).
- Summary rewritten to the spine sentence + proof points; targeted variants: one generic international, one crypto (leads with DeFi/UNCX and on-chain pipeline).
- Keep the strong numbers; add missing ones (rebrand scope, Academy videos, pipeline throughput).
- Add "AI-accelerated" framing to UNCX bullets where true (e.g. current workflow).
- UNCX title: if defensible, "Lead Designer (sole designer, brand→product→motion)" — clarity beats modesty.

### The disclosure question (autism/ADHD in the About Me)

This is entirely a personal decision and there are good reasons on both sides. The pattern to weigh: fast rejections happen at the 30-second screen, where unconscious bias has the most room and context the least. Common guidance from career advisers is to keep the *strengths* ("systems thinking, pattern recognition, deep focus") on the CV without the diagnostic label, and disclose — if and when it feels right — at offer/interview stage or to filter explicitly inclusive employers. Keeping it is also legitimate: it pre-filters for cultures worth joining. Recommended experiment: run the next 10 applications with the label moved off the CV and measure whether the fast-rejection rate changes. (UK: you're never obliged to disclose; Equality Act protection doesn't depend on CV disclosure.)

---

## 6. Application targeting playbook

- **Deep-link per application.** AI role → lead with `/work/<ai-pipeline-slug>`; crypto role → crypto-tagged view; brand-heavy role → rebrand study. Add per-study URLs (already have slugs; add routes).
- **LinkedIn alignment:** headline = the spine; About = first-person summary; Featured = flagship study + X pipeline; role keywords in headline (recruiters search titles, not prose).
- **X as living portfolio:** pin a thread explaining the pipeline; the account itself becomes a demo.
- **Target categories** (verify current openings rather than assuming): exchanges and wallets; L1/L2 foundations; web3 infra; digital/creative agencies with creative-tech teams (Monks, Instrument, Active Theory class); AI product companies hiring design engineers; fintech.
- **Contract in parallel:** the services block + day-rate-ready positioning covers income risk while hunting the staff role. Rough sanity check (verify against current market): senior creative technologist perm roles in UK/EU-remote commonly land ~£70–110k+, US-remote higher; contract day rates for this stack commonly £400–650+. Lead with the AI-pipeline capability to justify the top of the band.

---

## 7. Phased roadmap (loop-compatible)

### Phase 0 — Stop the bleeding (hours)
- [x] Replace Bitwise headline font (interim: IBM Plex Mono 600; final: new grotesk) — kills "Shills/toolhit/QUICH"
- [x] Replace the overflowing wordmark hero with the responsive editorial masthead
- [x] Footer: `© 2026`, LinkedIn label, remove or populate Archive
- [x] `index.html`: title, meta description, OG/Twitter card + image, favicon
- [x] Contact: use a plain-language contact form and response expectation (public email intentionally withheld)
- Acceptance: no misrendered words anywhere; link unfurls with name+role+image; mobile hero intact at 375px.

### Phase 1 — Voice & conversion (days)
- [x] Site-wide copy pass: first person, plain labels, name in hero, spine sentence, proof strip
- [x] Outcome-first line for every case study; status renames
- [x] Printable/exportable `/cv` route; services/availability block
- Acceptance: a stranger can answer "who, what, for whom, hire how?" from the first viewport.

### Phase 2 — Proof of the AI claim (1–2 weeks)
- [x] Flagship case study: Solana → X pipeline with real production media
- [x] "How this site builds itself" represented as the AI Portfolio System case study
- [ ] Testimonials + logos (request this week)
- [x] ATS-clean HTML CV shipped; final cross-browser PDF-export QA remains
- Acceptance: an "AI Designer" JD's keywords all appear, truthfully, on site and CV.

### Phase 3 — The re-skin (2–4 weeks)
- [x] Light-first editorial palette and type ramp (dual theme intentionally superseded)
- [x] Generative plotter masthead and outcome-first project index (cover-art grid intentionally superseded)
- [ ] Contrast/a11y pass (AA), performance pass (lazy-load galleries, cap WebGL)
- Acceptance: 5-second test with 3 strangers returns "modern / technical / senior", not "dark / retro".

### Sequencing note
CV (Phase 2 item) may be pulled forward to week 1 if applications are active — it is the single highest-leverage artefact for stopping fast rejections.

---

## 8. Measurement

- Track: application → response rate before/after CV swap; time-on-site (add privacy-friendly analytics, e.g. Plausible); CV downloads; contact submissions; per-study deep-link visits.
- Review after 10 applications on the new CV: if fast rejections persist, the problem is targeting (role/level mismatch), not materials — revisit role list before touching design again.
