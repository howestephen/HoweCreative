# Work plan: fixes from the October 2026 site audit

Fourteen self-contained work packages (WP-1 to WP-14) built from audit passes A to D. The consolidated findings are in `docs/reviews/2026-10-03-full-audit.md`. Finding IDs (A-n, B-n, C-n, D-n) refer to the pass reports, which hold the full evidence and are kept privately on Stephen's Mac at `docs/private/2026-10-03-audit/` (git-ignored). Each package repeats what a fixer needs, so it can be picked up without those reports or this conversation; where a package needs evidence, it gives the command to reproduce it.

Sensitive detail (finding B-4) is kept out of this plan, in `docs/private/2026-10-03-security-notes.md` (git-ignored, on Stephen's Mac). Read it before WP-9 starts.

Sites: `main` is production at https://howecreative.co.uk. The redesign branch `codex/creative-technologist-portfolio` is published at https://howecreative.co.uk/particle-redesign through rewrites in main's `vercel.json` to a separate Vercel project ("the particle project").

## Progress

- 3 October 2026, main: decision 2 taken as option (a). `vercel.json` redirects `/work/:slug` to `/?study=:slug` (temporary), so the CV links already sent out reach the study. WP-1 is done apart from the build check on absolute links.
- 3 October 2026, main: decision 4 taken as dark-ground and black-text variants. The UNCX Network logotype is grounded on the cards' dark colour (`uncx-rebrand/uncx-logotype.webp`) and the Academy gallery uses the black-text logotype the redesign already had. The white originals are archived. C-1 is fixed.
- 3 October 2026, main: A-9 is accepted for now. `public/robots.txt` disallows `/particle-redesign`, which also stops `/robots.txt` returning the app shell. B-1's sitemap half remains in WP-7.
- 3 October 2026: decision 1 taken as option (a), a captcha on the contact form. The free plan includes hCaptcha only (Turnstile and reCAPTCHA need Pro). Main's form now shows the hCaptcha widget and sends its token; enforcement starts when hCaptcha is switched on for the form in the Web3Forms dashboard, which Stephen does after the redesign's form sends the token too. WP-9's other steps remain, and WP-10's CSP must allow `hcaptcha.com` and `*.hcaptcha.com`.
- 3 October 2026: decision 3 taken as no change. Stephen keeps the current home page wording; WP-3 is closed and D-1 is won't-fix.
- 3 October 2026: decision 5 taken as no captions. C-6 is won't-fix; WP-13 is reduced to removing main's empty captions track.
- 3 October 2026: decision 6 done. The untracked private files are now under `docs/private/` (git-ignored) on Stephen's Mac. D-2 is fixed.
- 3 October 2026: decision 7 taken as retire now. A-8 is fixed: the 15 unmounted legacy components, `lib/device.ts`, `lib/theme.ts`, `lib/webgl.ts` and their three tests are removed.
- 5 October 2026, main: WP-2 is done and pushed. A-6: the gallery closes whenever no study is open. A-1: the archive scrolls to the top only on a fresh visit, not on Back or Forward. C-5: the nine videos without posters have the redesign's posters copied in and referenced. C-1 was already fixed. Live phone checks remain to be done after the push.
- 5 October 2026, main: WP-4 is done and pushed. C-4 (main): header, contact and footer links have a 44px minimum height, the gallery strip buttons have `p-2.5` and the lightbox arrows are 44px square. C-7: CV labels are 10px at `neutral-500`, and concept eyebrows are 11px on phones and 10px from `sm` up. C-11: the open-to-roles dot pulses only under `motion-safe`. The tests assert the classes (jsdom has no layout); the 375px bounding-box check and the reduced-motion animation count remain to be run live after the push.
- 5 October 2026, main: WP-13 is done and pushed. Main's two empty `<track kind="captions" />` elements are removed; a test asserts every rendered `track` has a `src` that exists under `public/`. The redesign half has no captions to add (decision 5).
- 5 October 2026, main: WP-11 is done and pushed. C-2: closing the gallery focuses the thumbnail that opened it. C-3: success is `role="status"`, errors `role="alert"`. C-8: fields use a `focus-visible` outline. C-9: the overlay `<header>` is a `div`, gallery scrollers are `role="region"` with `tabIndex=0` and a label, CV controls are `<nav aria-label="CV actions">`. C-10: the study dialog listens for Escape in the capture phase, and Layout has a "Skip to main content" link to `#main-content`. Tests are jsdom (`src/app/keyboard-a11y.test.tsx`); the live Playwright and axe checks remain after the push.
- 5 October 2026, main: WP-7 is done and pushed. B-1: `public/robots.txt` keeps the `/particle-redesign` disallow and names `public/sitemap.xml`, which lists `/`, `/archive`, `/cv` and each `/?study=<slug>`. B-2: `usePageMeta` (`src/app/lib/`) sets title, description, canonical and `og:*` for the archive, CV and each open study, reusing existing site wording; `vercel.json` has `"trailingSlash": false`. B-10: `apple-touch-icon.png`, `favicon-32.png`, `icon-192.png`, `icon-512.png` (rendered from `favicon.svg`) and `site.webmanifest` are linked in `index.html`. Tests are in `src/app/seo.test.tsx`. The curl and Playwright checks, including the `/archive/` redirect, remain after the push.
- 5 October 2026, main: WP-8 is done and pushed. B-6: `src/styles/fonts.css` imports Fontsource packages (`@fontsource-variable/fraunces`, `@fontsource/instrument-sans`, `@fontsource/ibm-plex-mono`, dev dependencies) for the same families, weights and axes as the old Google URL (latin subset, `font-display: swap`); Vite emits the files under `/assets` with hashes, and `index.html` preloads the Instrument Sans 400 and Fraunces upright files (Vite rewrites the hrefs). The built CSS has no `googleapis`. Woff2 files are not committed: the publication scan refuses binary blobs it cannot read as UTF-8. The redesign half is separate. Live network and screenshot checks remain after the push.
- 5 October 2026, main: WP-9 (A-5, A-7 and the subject clean-up) is done and pushed. `api/contact.ts` answers a non-string field with a 400 instead of throwing and caps the name at 200 and the brief at 5000 characters; the form's fields carry the same `maxLength`. Every request has a 15 second `AbortSignal.timeout`, and a timeout shows "That took too long. Please try again." Newlines are stripped from the name and role before they go in the subject. The captcha was done earlier; B-8 (per-deployment key) needs Stephen to set `EMAIL_ACCESS_KEY` on the particle project before the cross-deployment fallback can go.
- 5 October 2026: WP-14 is done on both branches. The two homepage screenshots that shared one alt now name the UNCX Launchpad and Token Minter sections, a test fails if any two images share an alt, `repoUrl` points at HoweCreative, and the redesign's Finder files and empty model folder are gone.

## Decisions for Stephen

Packages that depend on one of these are marked; everything else can start now.

1. **Decided: (a).** **Contact form abuse control (WP-9; findings B-4, B-8).** (a) Keep the current client transport and turn on a captcha (hCaptcha or Cloudflare Turnstile) in the Web3Forms dashboard, if the current plan allows it, plus the widget in the form. (b) Move to the server transport: the key stays server-side, the API verifies a Turnstile token, and a durable rate limit uses Vercel KV or Upstash (a new service that may cost money and needs your spend approval). Lean: (a), smallest change and no new service. Exploitable detail is in docs/private/2026-10-03-security-notes.md.
2. **Decided: (a).** **Where case-study links point until the redesign is promoted (WP-1, WP-6; findings A-10, A-9, A-3, B-7).** The three CV PDFs, including copies already sent to employers, link to `https://howecreative.co.uk/work/<slug>`, which production does not serve. (a) Add a temporary redirect on main from `/work/:slug` to `/?study=:slug`: every PDF already in circulation starts working with no regeneration, and `/work/<slug>` becomes native at cut-over. (b) Regenerate the PDFs and the redesign CV page to link to `/particle-redesign/work/<slug>` (the redesign, which is `noindex` and has A-9 and A-3 open). (c) Regenerate them to link to main's `/?study=<slug>`. Lean: (a). Separately: how and when the redesign replaces main (moving the domain to the particle project, or merging into main's project). Agents make no DNS or domain changes.
3. **Decided: no change.** **Metric wording on main's home page (WP-3; D-1).** Stephen keeps the current wording.
4. **Decided: (b).** **White logotypes on main's cream lightbox (WP-2; C-1).** (a) A dark stage behind images only in the lightbox and thumbnails (main keeps its cream page). (b) Dark-ground variants of the two logotype files. Lean: (a).
5. **Decided: no captions.** **Video captions (WP-13; C-6).** No film needs captions. Removing main's empty captions track can still go ahead.
6. **Done.** **Private files in the redesign working tree (WP-14; D-2).** Moved under `docs/private/` (git-ignored).
7. **Decided: retire now.** **Legacy components on main (WP-14; A-8).** Retire the unmounted legacy components and their three test files.
8. **HSTS scope (WP-10; B-3).** `includeSubDomains; preload` commits every subdomain of howecreative.co.uk to HTTPS and preload is slow to undo. Confirm before it is added; the other headers do not need a decision.
9. **Every push to main** in WP-1, WP-2, WP-3, WP-4, WP-6, WP-7, WP-10, WP-11 and the main halves of WP-8, WP-9, WP-13 and WP-14 needs your permission, per push.

## Rules for every package

- Read `CLAUDE.md`, `AGENTS.md`, `ARCHITECTURE.md`, `ONBOARDING.md` and `ROADMAP.md` in the checkout first; they override this plan where they differ.
- **main:** work in a separate worktree of `main` (for example `git worktree add <path> main`). Never switch branches in the primary checkout: it holds untracked work. Commit locally; pushing `main` needs Stephen's permission for each push. Do not push a new branch unless Stephen asks (each pushed branch builds a preview); delete any short-lived branch at merge.
- **redesign:** work on `codex/creative-technologist-portfolio` in the primary checkout. Commit and push without asking. Never merge it into `main`. Stage only the files you changed (`git add <paths>`, never `git add -A` or `git add .`): the checkout has untracked work in progress that must not be committed. Run `git status` before every commit.
- Before every commit: `npm run typecheck && npm test && npm run lint && npm run build`. Never bypass a hook or gate; if one is wrong, stop and tell Stephen.
- Test first: write the test listed in the package, run it, and see it fail on the current code before changing anything. A test that passes before the fix is not evidence.
- No DNS or domain changes. No writes to Vercel settings or environment variables; Stephen sets those. Deploys happen from pushes, not deploy commands.
- Never POST to the live contact endpoints (`/api/contact`, `/api/contact-key`); they send real email.
- Media is never deleted: move anything retired to `assets-archive/` (git-ignored).
- Copy: British English, no em or en dashes, every metric names the job or project it came from.
- Sensitive detail lives only in `docs/private/2026-10-03-security-notes.md` (git-ignored). Never copy it into a commit message, pull request, test name or tracked file.
- Update `ROADMAP.md` and any affected doc in the same commit as the code.
- Before verifying a main fix live, check production is at `origin/main`: the audit found the live bundle (`index-Bw3y_Jd9.js`) differs from a fresh build of `origin/main` at `8a5cbf4` (`index-CphMwQ9O.js`). Compare the deployment's commit in Vercel (read-only) with `git rev-parse origin/main`.

## Order

Impact on a hiring manager on a phone first, then SEO and sharing, then hardening, then accessibility and polish.

| Package | Branch | Findings | Theme | Needs decision |
| --- | --- | --- | --- | --- |
| WP-1 | main | A-10 | Phone: CV links that work | settled |
| WP-2 | main | C-1, A-6, A-1, C-5 | Phone: study viewer | settled |
| WP-3 | main | D-1 | Phone: home page claims | closed, no change |
| WP-4 | main | C-4 (main), C-7, C-11 | Phone: tap targets and small text | none |
| WP-5 | redesign | A-2, C-4 (redesign), C-12 | Phone: redesign navigation and weight | none |
| WP-6 | main and redesign | A-9, A-3, A-11 + A-14, A-12, B-7 | SEO and sharing: redesign URLs and the proxy | settled |
| WP-7 | main | B-1, B-2, B-10 | SEO and sharing: metadata, robots, sitemap, icons | none |
| WP-8 | main and redesign | B-6 | Hardening: self-hosted fonts | none |
| WP-9 | main and redesign | B-4, B-8, A-5, A-7 | Hardening: contact form | settled |
| WP-10 | main and redesign | B-3, B-5 | Hardening: security and cache headers | 8 |
| WP-11 | main | C-2 (main), C-3, C-8, C-9 (main), C-10 | Accessibility: keyboard and screen reader | none |
| WP-12 | redesign | C-2 (redesign), C-9 (redesign), A-13, A-4 | Accessibility and audio | none |
| WP-13 | main | C-6 | Remove main's empty captions track | settled |
| WP-14 | main and redesign | D-3, B-9, B-11, D-2, A-8 | Polish: content and repo hygiene | settled |

---

## WP-1: CV links that work (main)

- Branch: `main` (push needs Stephen's permission). Assumes decision 2 = (a); if Stephen picks (b) or (c), see the alternative at the end.
- Findings: A-10 (P1). All three CV PDFs (`public/cv/Stephen-Howe-Creative-Technologist.pdf`, `-Design-Engineer.pdf`, `-Product-Designer.pdf`, built by the redesign's `scripts/build-cv.py:56-58`) and the redesign's CV page (`src/app/pages/CV.tsx:99-104`, `data.website` from `src/app/data/cv.json`) link to `https://howecreative.co.uk/work/<slug>`. Production (main) has no `/work/` route: its catch-all rewrite serves the home shell and the router shows an error. A hiring manager clicking a project in the CV lands on a broken page.
- Files: main `vercel.json` (add a `redirects` entry); a new test beside the existing tests (for example `src/app/data/vercel-config.test.ts`).
- Steps:
  1. Confirm the slugs match: `git show codex/creative-technologist-portfolio:site-content.json` and main's `site-content.json` both list the same 10 project slugs (quiver, solana-diary, uncx-menu, uncx-rebrand, badger-club, uncx-video-system, uncx-academy, noticia-lingo, uncx-app-concepts, ai-portfolio-system).
  2. Add to main's `vercel.json`: `"redirects": [{ "source": "/work/:slug", "destination": "/?study=:slug", "permanent": false }]`. Temporary (307) so cut-over can replace it. Redirects run before rewrites, so the catch-all does not swallow it.
  3. Note the interim redirect in main's `ARCHITECTURE.md` and in `ROADMAP.md` as something the cut-over removes.
- Test (fails today): parse `vercel.json`, assert a redirect with `source` `/work/:slug` and destination `/?study=:slug` exists, and that every slug in `site-content.json` is a valid `?study=` target (the slug list is non-empty and each has a `title`).
- Verify live (after the permitted push and deploy): `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://howecreative.co.uk/work/quiver` prints `307 https://howecreative.co.uk/?study=quiver`. For every link in the PDFs (`strings public/cv/*.pdf | grep -o 'https://howecreative.co.uk/work/[a-z-]*' | sort -u`, run in the redesign checkout), load it in a phone-sized browser: the matching study opens.
- Depends on: decision 2. WP-6 also edits main's `vercel.json`; do them one after the other.
- Alternative for decision 2 = (b) or (c): on the redesign branch change the link base in `src/app/data/cv.json` / `CV.tsx:99-104` and `scripts/build-cv.py:56-58`, rerun `scripts/build-cv.py` to regenerate the three PDFs, and add a check to `scripts/verify-build.mjs` that every absolute `howecreative.co.uk` link in `dist/cv/index.html` uses the chosen pattern (fails today). PDFs already sent stay broken under these options.

## WP-2: Study viewer on phones (main)

- Branch: `main` (push needs permission).
- Findings:
  - C-1 (P1): white logotypes are invisible on the cream lightbox and archive thumbnails. The UNCX Company Rebrand gallery opens on `/case-studies/uncx-rebrand/uncx-logotype.svg`, which shows as a blank slide; `/case-studies/uncx-academy/logotype.webp` reads as a missing thumbnail. Lightbox root `src/app/concept/WorkIndex.tsx:453` (`bg-background`), archive thumbnails `src/app/pages/Archive.tsx:38-50`.
  - A-6 (P2): pressing Back (or the phone's back gesture) with the lightbox open closes the study but leaves the lightbox on screen. Lightbox state is local (`WorkIndex.tsx:755-763`) and only cleared in `closeStudy` (`:772`) and `closeLightbox` (`:800`).
  - A-1 (P2): closing a study opened from the archive returns the visitor to the top of the archive: `Archive.tsx:89` calls `window.scrollTo(0, 0)` on every mount, including Back.
  - C-5 (P3): nine study videos have no `poster` in main's `site-content.json` and render as black rectangles (`WorkIndex.tsx:196-212`); the redesign's `site-content.json` already has posters for the same files.
- Files: `src/app/concept/WorkIndex.tsx`, `src/app/pages/Archive.tsx`, `site-content.json`, poster files under `public/case-studies/` (copied, never moved, from the redesign branch), new or extended tests under `src/app/concept/` and `src/app/data/`.
- Steps:
  1. A-6: in `WorkIndex`, add `useEffect(() => { if (!openProject) setLightbox(null); }, [openProject]);`.
  2. A-1: in `Archive.tsx`, run the scroll-to-top only when `useNavigationType() === "PUSH"` (or replace it with react-router's `<ScrollRestoration />` in `Layout`).
  3. C-1 (decision 4, default (a)): give the lightbox media stage (the `figure` around the image, not the whole panel) and the archive and strip thumbnail buttons a dark ground, reusing `bg-[#0a0c10]` already used at `WorkIndex.tsx:230`.
  4. C-5: list videos without posters (`node -e` over `site-content.json` for `type: "video"` without `poster`); copy each poster path from the redesign's `site-content.json` and the file itself with `git show codex/creative-technologist-portfolio:public/<path> > public/<path>`.
- Tests (each fails today):
  - jsdom: render the router at `/?study=quiver`, open a gallery image, call `router.navigate(-1)`, assert no dialog named "Quiver gallery" remains.
  - jsdom: `createMemoryRouter` at `/archive`, push `/?study=quiver`, go back; a spy on `window.scrollTo` must not be called on the POP.
  - content test: every `type: "video"` entry in `site-content.json` has a `poster` whose file exists under `public/`.
  - unit test: the lightbox `figure` carries the dark background class.
- Verify live (phone emulation 375x812, Chromium and WebKit): open UNCX Company Rebrand, open the gallery: the "UNCX NETWORK" wordmark is visible on slide 1. With the lightbox open, press Back: both lightbox and study are closed. On `/archive`, scroll about 2000 px, open a study, close it: `scrollY` stays above 1000. Videos in Quiver and UNCX Academy show a poster frame before play.
- Depends on: decision 4 (default (a) can proceed). WP-4 and WP-11 edit the same files; do WP-2 first.

## WP-3: Home page claims name their source (main)

Closed on 3 October 2026: Stephen keeps the current wording (decision 3). Kept for the record; do not action.

- Branch: `main` (push needs permission).
- Findings: D-1 (P2). `src/app/concept/Masthead.tsx:18` shows "500+ videos across roles" in the stat row under the hero; `src/app/concept/Capabilities.tsx:7` "Two full company rebrands, shipped end to end", `:9` "Product UI from wireframe to production across 10+ apps", `:18` "500+ videos across launches, tutorials, games, and education". The project rule: every stat names the job or project it came from. The 500+ figure adds counts from several jobs.
- Files: `src/app/concept/Masthead.tsx`, `src/app/concept/Capabilities.tsx`, a new test `src/app/concept/copy-rules.test.tsx`.
- Steps: replace the four lines with Stephen's approved wording (decision 3). Suggested starting points from the redesign's `src/app/data/cv.json:69-71`: "200+ videos at UNCX Network"; "UI concepts for 10+ UNCX applications, 3-4 shipped"; "Two UNCX rebrands: 2022 in-house, 2024 directing an outside studio".
- Test (fails today): render `Masthead` and `Capabilities`; for every text node matching `/\d[\d,]*\+/`, assert the same item also contains a source name (`UNCX`, `Switch Studios`, `Quiver`, or an agreed client descriptor). Today "500+ videos across roles" fails it.
- Verify live: find the current bundle name with `curl -s https://howecreative.co.uk/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js'`, then `curl -s <that URL> | grep -cE 'videos across roles|across 10\+ apps'` prints 0. Check the stat row on a 375 px screen.
- Depends on: decision 3.

## WP-4: Tap targets and small text on phones (main)

- Branch: `main` (push needs permission).
- Findings: C-4 main part (P2): header, footer and contact links are 14 to 20 px tall (`src/app/components/Layout.tsx:47,60`, 11 px mono text with no padding; `src/app/concept/ContactFoot.tsx:92-105`); gallery strip buttons (`WorkIndex.tsx:122-139`, `p-1`) and lightbox arrows (`:494-510`) are 24 to 38 px. C-7 (P3): CV labels are 8 px at 2.58:1 contrast (`src/app/pages/CV.tsx:181`, `text-[8px] text-neutral-400`); 10 px mono eyebrows across `src/app/concept/*.tsx`. C-11 (P3): the "open to roles" dot keeps pulsing under reduced motion (`src/app/concept/Masthead.tsx:46`, `animate-pulse`).
- Files: `Layout.tsx`, `WorkIndex.tsx`, `ContactFoot.tsx`, `CV.tsx`, `Masthead.tsx`, other `src/app/concept/*.tsx` that use `font-mono text-[10px]`.
- Steps: add vertical padding with matching negative margin (for example `py-3 -my-3`) to header, footer and social links so each box is at least 44 px tall on touch widths without moving the layout; `p-2.5` on strip buttons; 44 px lightbox arrows; CV labels `text-[10px] text-neutral-500` or larger; `sm:text-[10px] text-[11px]` for eyebrows; `motion-safe:animate-pulse` on the dot.
- Tests (fail today): unit tests asserting the header link class includes the padding utility, the lightbox arrow buttons have `h-11 w-11` (or equivalent), the CV label is not `text-[8px]`, and the pulse dot uses `motion-safe:animate-pulse`. Plus a Playwright check kept outside the repo: at 375x812, every visible `a` and `button` in the header, footer, contact block and lightbox has a bounding box at least 24 px tall (target 44).
- Verify live: the same Playwright check against https://howecreative.co.uk/, `/cv` and an open study; with `prefers-reduced-motion: reduce` emulated, `document.getAnimations().filter(a => a.playState === "running").length` is 0 on `/`.
- Depends on: none; run after WP-2 to avoid conflicts in `WorkIndex.tsx`.

## WP-5: Redesign on phones (redesign)

- Branch: `codex/creative-technologist-portfolio` (commit and push allowed; never merge).
- Findings:
  - A-2 (P2): `src/app/components/Layout.tsx:11-19` scrolls to top on every route change, including Back, so returning from a case study loses the visitor's place.
  - C-4 redesign part (P2): `.site-header nav a` has no padding (`src/styles/portfolio.css:41-45`), `.nav-contact` padding is removed again in `src/styles/spatial-shell.css:21`, CV contact links in `src/styles/cv.css:104-107`; links are 14 to 20 px tall on phones.
  - C-12 (P3): the home page downloads 1.17 MB of images on a phone: `public/portrait/portrait-source.png` (852,974 bytes, 1400x650), which is only read by the particle sampler (`src/app/experience/portrait-particles.ts:17`), and the `portrait-reference-2x` WebP (341 kB, no `srcset`, `src/app/experience/PortraitExperience.tsx:346`). A lossless WebP of the PNG measured 482,416 bytes.
- Files: `src/app/components/Layout.tsx`, `src/styles/portfolio.css`, `src/styles/spatial-shell.css`, `src/styles/cv.css`, `src/app/experience/portrait-particles.ts`, `src/app/experience/PortraitExperience.tsx`, `src/app/experience/PortraitScene.test.tsx` (lines 580-581 read the PNG), new `public/portrait/portrait-source.webp`, a 1x reference image beside the 2x one.
- Steps:
  1. A-2: gate the scroll on `useNavigationType() !== "POP"`, or use `<ScrollRestoration />`.
  2. C-4: `padding: 12px 0` (or a `min-height: 44px` inline-flex box) on `.site-header nav a` and `.cv-contact a`; keep the `.nav-contact` padding.
  3. C-12: `cwebp -lossless -exact -z 9 public/portrait/portrait-source.png -o public/portrait/portrait-source.webp` (`-exact` keeps RGB under transparent pixels, so sampling is unchanged); point `PORTRAIT_POINTS_SOURCE` at the WebP; update `PortraitScene.test.tsx`. Once nothing references the PNG, move it to `assets-archive/portrait/` (never delete). Add a 1x reference variant and a `srcset` (`1x, 2x`) to the reference `img`.
- Tests (fail today): jsdom `createMemoryRouter` `/archive` then `/work/quiver` then back: `window.scrollTo` called once (the PUSH), not twice. Unit test: `PORTRAIT_POINTS_SOURCE` ends in `.webp` and the file exists in `public/`. Unit test: the reference `img` has a `srcset`. A pixel test that decodes PNG and WebP and compares the sampled region (should pass after the change and guards the visual).
- Verify live (after the particle project deploys the push): at 375x812 with a cold cache, total image transfer on https://howecreative.co.uk/particle-redesign is under 700 kB (Chrome DevTools or a Playwright script summing CDP `Network.loadingFinished` `encodedDataLength`); the particle likeness looks unchanged against a before screenshot; on `/particle-redesign/archive`, scroll, open a study, go Back: position restored; header links measure at least 44 px tall.
- Depends on: none.

## WP-6: Redesign URLs and the proxy (main and redesign)

- Branches: redesign (commit and push allowed) and `main` (push needs permission).
- Findings:
  - A-9 (P1): the redesign's canonical and `og:url`, `https://howecreative.co.uk/particle-redesign/` (with slash; redesign `index.html:12,18`, `scripts/prerender.mjs:30`), serves the main site, because main's `vercel.json:7-14` only forwards the slash-less path. Shared links and search engines get the wrong site.
  - A-3 (P2): prerendered static links omit the prefix (`src/prerender.tsx:34,42`): `href="/work/quiver"` and `href="/archive"` in the served HTML lead no-JS visitors and crawlers to main.
  - A-11 + A-14 (P3): unknown URLs on the redesign return Vercel's plain-text 404 (redesign `vercel.json:6-19` has no SPA fallback; `src/app/pages/Project.tsx:389-397` not-found branch never reached); on main they return HTTP 200 with an error panel whose only button reloads the same URL (main `vercel.json:39-42`, `src/app/components/AppErrorBoundary.tsx:24-30`).
  - A-12 (P3): files present at the same path in both `public/` trees but with different content are served from main, so the redesign shows main's copy (6 differ).
  - B-7 (P3): everything proxied from the particle project, including the CV PDFs, carries `x-robots-tag: noindex`.
- Files: main `vercel.json`, main `src/app/components/AppErrorBoundary.tsx`, main `public/cv/` (copies of the three PDFs if decision 2 keeps them on main), redesign `index.html`, `scripts/prerender.mjs`, `src/prerender.tsx`, `scripts/verify-build.mjs`, redesign `vercel.json`, `src/app/pages/Project.tsx`, redesign `ARCHITECTURE.md`.
- Steps:
  1. A-9: in main's `vercel.json` add a rewrite for source `/particle-redesign/` ahead of the `:path*` rule; on the redesign make the canonical and `og:url` the slash-less form.
  2. A-3: pass the public prefix into `render()` from `scripts/prerender.mjs`; add a `verify-build.mjs` assertion that every internal `href` in `dist/**/*.html` starts with the canonical's prefix.
  3. A-11: add a final SPA fallback rewrite to the redesign's `vercel.json` that excludes asset folders (`assets/`, `case-studies/`, `earlier-work/`, `portrait/`, `models/`, `cv/`); give the not-found branch a `noindex` meta and a styled link home.
  4. A-14: in main's `AppErrorBoundary`, add a "Back to the portfolio" link to `/` and `noindex` for 404 route errors.
  5. A-12: list the divergent files with `git diff --stat --diff-filter=M main codex/creative-technologist-portfolio -- public/` (same path, different content); make each pair identical or rename the redesign's copy; long term, Vite `base: "/particle-redesign/"` removes the shared namespace (part of the cut-over decision).
  6. B-7: if the PDFs stay linked from production, copy them into main's `public/cv/` so they are served by main without `noindex`; record in the redesign's `ARCHITECTURE.md` that promotion moves the domain, never proxies the whole site.
- Tests (fail today): redesign `verify-build.mjs` prefix assertion (fails on the current `dist/`); a test parsing the redesign `vercel.json` for the SPA fallback; a main jsdom test rendering the router at `/nope` and finding a link named "Back to the portfolio" with `href="/"`; a main test parsing `vercel.json` for the `/particle-redesign/` rewrite.
- Verify live: `curl -s https://howecreative.co.uk/particle-redesign/ | grep -o '<title>[^<]*'` prints the redesign's title ("Stephen Howe - Creative Technologist"), not main's; `curl -s https://howecreative.co.uk/particle-redesign | grep -c 'href="/work/'` is 0; `curl -s https://howecreative.co.uk/particle-redesign/work/no-such-project | grep -c "Project not found"` is 1; `curl -sI https://howecreative.co.uk/cv/Stephen-Howe-Creative-Technologist.pdf | grep -ci x-robots` is 0 once served by main.
- Depends on: decision 2; WP-1 (same `vercel.json`, do one after the other).

## WP-7: Metadata, robots, sitemap and icons (main)

- Branch: `main` (push needs permission).
- Findings: B-1 (P2): `/robots.txt` and `/sitemap.xml` return the HTML app shell (`200 text/html`); main's `public/` has neither. B-2 (P2): every route ships the home page's title, description, canonical (`https://howecreative.co.uk/`) and OG tags (`index.html:10-37`); `/archive` and `/cv` change only `document.title` at runtime (`Archive.tsx:87-91`, `CV.tsx:118-121`); `?study=` pages set no title at all (`WorkIndex.tsx`); `/archive/` is not redirected to `/archive`. B-10 (P3): only an SVG favicon is declared; no `apple-touch-icon`, PNG fallback or web manifest (the redesign is served the same files through the proxy, so main's files cover both).
- Files: main `public/robots.txt`, `public/sitemap.xml` (or a build step), `index.html`, a small `usePageMeta` hook in the existing `src/app/lib/` folder, `src/app/pages/Archive.tsx`, `src/app/pages/CV.tsx`, `src/app/concept/WorkIndex.tsx`, `vercel.json` (`"trailingSlash": false`), `public/apple-touch-icon.png` (180x180), `public/favicon-32.png`, `public/site.webmanifest`.
- Steps: add `robots.txt` (`User-agent: *`, `Allow: /`, `Sitemap: https://howecreative.co.uk/sitemap.xml`); a sitemap listing `/`, `/archive`, `/cv` and each `/?study=<slug>` if studies are to be indexed, but no `/particle-redesign` URLs while they are `noindex`; a hook that sets title, description, canonical and `og:*` per route and per open study; `trailingSlash: false`; the icons and manifest, linked in `index.html`.
- Tests (fail today): a test that `public/robots.txt` exists and names the sitemap; a jsdom test that opening `/?study=quiver` sets `document.title` containing "Quiver" and the canonical link to `https://howecreative.co.uk/?study=quiver`; a test that `index.html` links `apple-touch-icon` and `site.webmanifest`.
- Verify live: `curl -s -o /dev/null -w "%{content_type}" https://howecreative.co.uk/robots.txt` is `text/plain`; `curl -s https://howecreative.co.uk/sitemap.xml | xmllint --noout -` exits 0; `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://howecreative.co.uk/archive/` prints `308 https://howecreative.co.uk/archive`; `curl -sI https://howecreative.co.uk/apple-touch-icon.png` is `image/png`; Playwright on `/?study=quiver` reads a title containing "Quiver".
- Depends on: WP-6 (decides which redesign URLs, if any, belong in the sitemap).

## WP-8: Self-hosted fonts (main and redesign)

- Branches: each branch separately (main push needs permission).
- Findings: B-6 (P3): `src/styles/fonts.css:1` on both branches imports Google Fonts with a CSS `@import`, the only third-party request on either site, chained behind the main stylesheet. On main the fonts are 176 kB, 37% of the home page's 480 kB at 375 px; the home page's largest paint is a text paragraph at 1.65 s on an unthrottled connection.
- Files: `src/styles/fonts.css`, `package.json` (`@fontsource-variable/fraunces` on main, `@fontsource/instrument-sans`, `@fontsource/ibm-plex-mono` on both; or woff2 files in `public/fonts/`), `index.html` (`<link rel="preload" as="font" type="font/woff2" crossorigin>` for the two body faces).
- Steps: replace the `@import` with local `@font-face` rules (`font-display: swap`), add the preloads, keep the same weights and axes as the current Google URL.
- Test (fails today): read `src/styles/fonts.css` and assert it contains no `googleapis`; after the build, `grep -c googleapis dist/assets/*.css` is 0 (add to `scripts/verify-build.mjs` on the redesign).
- Verify live: the network panel on `/` and `/particle-redesign` shows no request to `fonts.googleapis.com` or `fonts.gstatic.com`; a screenshot at 375 and 1440 matches the before shot.
- Depends on: none. Do it before WP-10 so the CSP needs no Google entries.

## WP-9: Contact form hardening (main and redesign)

- Branches: each branch (main push needs permission). Read `docs/private/2026-10-03-security-notes.md` first; keep its detail out of commits and pull requests.
- Findings: B-4 (P2, Sensitive): the form has no abuse control beyond a honeypot; details in docs/private/2026-10-03-security-notes.md. B-8 (P3): the redesign's form depends on main's deployment for its configuration at submit time (`src/app/concept/contact-request.ts:50-67`). A-5 (P3): `api/contact.ts:47-52` throws an unhandled TypeError when a field is not a string, and has no length cap. A-7 (P3): no timeout on submit (`src/app/concept/ContactFoot.tsx:45-47`, `contact-request.ts:11-48`), so a hung request shows "Sending..." for ever.
- Files: `src/app/concept/contact-request.ts`, `src/app/concept/ContactFoot.tsx`, `src/app/lib/contact-build-config.ts`, `api/contact.ts`, `api/contact.test.ts`, `api/contact-key.ts`, `api/_lib/rate-limit.ts`, `vite.config.ts`. Environment variables are set by Stephen in Vercel, not by agents.
- Steps:
  1. A-5: coerce each field with a `typeof` check and cap `name` at 200 and `brief` at 5000 characters, client and server.
  2. A-7: `signal: AbortSignal.timeout(15000)` in `createContactRequest`; map `TimeoutError` to "That took too long. Please try again."
  3. B-4: implement decision 1 as described in the private notes; strip newlines from `name` before it is used in the subject.
  4. B-8: give each deployment its own configuration (Stephen sets the variable on the particle project), then remove the cross-deployment fallback.
- Tests (fail today): `api/contact.test.ts` posting `{ name: 1 }` expects a 400 JSON response (today it throws); a 6000-character brief expects a 400; `createContactRequest` sets `init.signal`; a component test with a never-resolving `fetch` and fake timers ends in the error state after 15 s; the captcha or Turnstile token is required (decision 1).
- Verify live: no agent sends a live submission. Stephen sends one clearly labelled test message from each site after deploy. After option (b) of decision 1, `curl -s -o /dev/null -w "%{http_code}" https://howecreative.co.uk/api/contact-key` prints 404.
- Depends on: decision 1; spend approval if option (b) adds Vercel KV or Upstash. WP-10's CSP must allow the captcha's domains.

## WP-10: Security and cache headers (main and redesign)

- Branches: both `vercel.json` files. Headers set in main's `vercel.json` also apply to everything proxied under `/particle-redesign` (main push needs permission).
- Findings: B-3 (P2): no `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` or `Permissions-Policy` on either site; main's HSTS is `max-age=63072000` without `includeSubDomains`. Either site can be framed by any origin. B-5 (P3): content-hashed JS and CSS under `/assets/` and all media are served `max-age=0, must-revalidate`, so nothing is cached between visits.
- Files: main `vercel.json`, redesign `vercel.json`, a test parsing both.
- Steps:
  1. Add a `headers` block for `/(.*)`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`, and HSTS per decision 8.
  2. Ship the CSP as `Content-Security-Policy-Report-Only` for one deploy; check the console on `/`, an open study, `/particle-redesign` (WebGL, Web Audio, lazy chunks) and the contact form; then enforce. After WP-8 there are no Google entries; add the captcha domains from WP-9.
  3. Cache: `/assets/(.*)` gets `public, max-age=31536000, immutable`; `/case-studies/(.*)`, `/earlier-work/(.*)`, `/portrait/(.*)` get `public, max-age=86400, stale-while-revalidate=604800`. Leave HTML, `/api/*`, `robots.txt` and `sitemap.xml` at the default.
- Test (fails today): parse each `vercel.json`; assert the five security headers exist for `/(.*)` and `/assets/(.*)` carries `immutable`.
- Verify live: `curl -sI https://howecreative.co.uk/ | grep -ciE '^(content-security-policy|x-content-type-options|referrer-policy|x-frame-options|permissions-policy):'` prints 5, and the same for `/particle-redesign` and `/particle-redesign/work/quiver`; `curl -sI https://howecreative.co.uk/assets/<current index js> | grep -i cache-control` shows `immutable`; a test page that frames `https://howecreative.co.uk/` shows a blank frame.
- Depends on: WP-8 and WP-9 (CSP sources), decision 8.

## WP-11: Keyboard and screen-reader fixes (main)

- Branch: `main` (push needs permission).
- Findings: C-2 main part (P2): closing the image lightbox drops focus to `<body>` (`WorkIndex.tsx:800` only clears state). C-3 (P2): contact success and error are not announced (`ContactFoot.tsx:112-125, 188-192`; the redesign already uses `role="status"` and `role="alert"`). C-8 (P3): form fields remove the focus outline (`ContactFoot.tsx:13-14`). C-9 main part (P3): duplicate banner landmark from the study overlay's `<header>`, the horizontal `div.gallery-scroll` is not focusable or labelled, CV controls sit outside landmarks. C-10 (P3): Escape is ignored while focus is inside a video's native controls in Chromium (`WorkIndex.tsx:679-692`), and there is no skip link (`Layout.tsx:37`).
- Files: `src/app/concept/WorkIndex.tsx`, `src/app/concept/ContactFoot.tsx`, `src/app/components/Layout.tsx`, `src/app/pages/CV.tsx`.
- Steps: record the triggering thumbnail and focus it in `closeLightbox`; add `role="status"` to the success panel and `role="alert"` to the error; `focus-visible` outline on fields; replace the overlay `<header>` with a `div`, give `div.gallery-scroll` `tabIndex={0}` and an `aria-label`, wrap the CV controls in `<nav aria-label="CV actions">`; listen for Escape on the dialog panel in the capture phase; port the redesign's skip link (`Layout.tsx:23` on the redesign).
- Tests (fail today): jsdom: open and close the lightbox, `document.activeElement` is the thumbnail; the success panel has `role="status"`, the error `role="alert"`; the first focusable element in `Layout` is a link to `#main-content`; the study overlay renders no `header` element.
- Verify live: Playwright Chromium on `/?study=quiver`: focus the featured video, Tab once, Escape closes the study; first Tab on `/` lands on the skip link; an axe run on `/`, a study and `/cv` reports no `landmark-*` or `region` violations.
- Depends on: run after WP-2 and WP-4 (same files).

## WP-12: Keyboard, screen reader and sound (redesign)

- Branch: `codex/creative-technologist-portfolio` (commit and push allowed).
- Findings: C-2 redesign part (P2): `ProjectGallery.tsx:188-191` focuses the trigger before the native `<dialog>` closes (`:96-99`), so focus ends on `body` in Chromium. C-9 redesign part (P3): `<main id="archive-projects">` nests a second main; the only `h1` sits inside the intro that `PortraitExperience.tsx:215` makes `inert` after the first scroll; gallery buttons repeat the caption in `alt` and a visible span (`ProjectGallery.tsx:219-233`). A-13 (P3): turning sound off leaves the AudioContext, noise bed and note scheduler running (`PortraitExperience.tsx:318-325`, `portrait-audio.ts:77-81, 116-127`). A-4 (P3, Plausible): prerendered text is replaced rather than hydrated, a possible visible swap on cold load (`src/main.tsx:6`, `scripts/prerender.mjs:33-36`).
- Files: `src/app/components/ProjectGallery.tsx`, the archive page component, `src/app/experience/PortraitExperience.tsx`, `src/app/experience/portrait-audio.ts`, `src/app/experience/PortraitExperience.test.tsx`, `src/main.tsx`.
- Steps: move the focus call to after the dialog has closed; change the archive `main` to a `section`; keep an `h1` outside the inert wrapper (or apply `aria-hidden` to the visual only); set `alt=""` on gallery images that have a visible caption; `suspend()` the AudioContext after the fade on sound off. For A-4, first reproduce with throttled-network screenshots at `domcontentloaded` and `networkidle`; change nothing if no swap is visible.
- Tests (fail today): jsdom: closing the gallery dialog leaves focus on the trigger after the close effect; the archive renders one `main`; an `h1` remains outside any `inert` element after `intro < 0.05`; extend "only creates audio after the sound control" to assert the engine's `suspend` is called on the second click.
- Verify live: Playwright Chromium on `/particle-redesign/work/quiver`: open and close an image, `document.activeElement` is the thumbnail; axe on home, a study and the archive reports no `landmark-no-duplicate-main` or `page-has-heading-one`.
- Depends on: none.

## WP-13: Video captions (main and redesign)

Reduced on 3 October 2026: no film needs captions (decision 5). The only remaining step is removing main's empty `<track kind="captions" />`.

- Branches: both (main push needs permission).
- Findings: C-6 (P3): no video on either site has captions; main ships an empty `<track kind="captions" />` on every video (`WorkIndex.tsx:208, 256`); redesign players in `ProjectGallery.tsx:198-205`, `Project.tsx:168-175`, `QuiverCaseStudy.tsx:25-33, 110-117`.
- Files: those components, `site-content.json` (a `captions` path per video), `.vtt` files placed beside each video in its `public/case-studies/<slug>/` folder.
- Steps: remove main's empty tracks now; for each film Stephen lists (decision 5), add a WebVTT file and a `track` with `src`, `srclang="en"` and a label; mark music-only clips as such in the visible label.
- Test (fails today): a content test that every rendered `track` has a `src` that exists under `public/`.
- Verify live: Playwright: on a captioned film, `video.textTracks[0].mode = "showing"` and after load `video.textTracks[0].cues.length > 0`.
- Depends on: decision 5.

## WP-14: Content and repository hygiene (main and redesign)

- Branches: both (main push needs permission).
- Findings: D-3 (P3): two different images share the alt "Website homepage design (section)" (`/case-studies/uncx-rebrand/website/homepage-section-2.webp` and `-3.webp`), and five alts only restate the filename (`brand-launch-video.mp4`, `database-schema.webp`, `token-minter-prototyping.webp`, `stealth-launch-concepts.webp`, `nft-minting-wireframes.webp`; plus `uncx-academy/about-page.webp` on main); the alt is also the visible caption. B-9 (P3): `site-content.json:16` `repoUrl` points at `howestephen/Figmaportfolio2026`, which redirects to `HoweCreative`. B-11 (P3): four `.DS_Store` files in the redesign's `public/` (`public/`, `public/case-studies/`, `public/case-studies/uncx-video-system/`, `public/models/hero-wire/`) are copied into every local `dist/`; `public/models/hero-wire/` is otherwise empty and main's `/models/:path*` rewrite has no user. D-2 (P3, fixed 3 October): private files were untracked and not ignored in the redesign working tree; they now live under `docs/private/`. A-8 (P3): three test files on main exercise components no route mounts (`LoadingScreen.test.tsx`, `MediaGallery.test.tsx`, `OperatorProfilePortrait.test.tsx`).
- Files: `site-content.json` (both), `.gitignore` (redesign, only with Stephen's go-ahead), main `vercel.json`, the four `.DS_Store` files, main's three legacy tests and components (decision 7).
- Steps: write distinct, descriptive alts; set `repoUrl` to `https://github.com/howestephen/HoweCreative`; remove the four `.DS_Store` files (Finder metadata, not media; list them in the commit message) and the empty `public/models/hero-wire/`, and drop main's `/models/:path*` rewrite after confirming nothing references `/models/`; for A-8, follow decision 7.
- Tests (fail today): a content test that no two different `src` values share an alt (extend the redesign's `src/app/data/portfolio-content.test.ts`; add one on main); a test that `repoUrl` does not contain `Figmaportfolio2026`.
- Verify: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://github.com/howestephen/HoweCreative` prints `200` with no redirect; `find public -name .DS_Store` is empty.
- Depends on: nothing (decisions 6 and 7 are settled).
