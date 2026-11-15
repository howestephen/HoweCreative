---
status: active
author: claude
spec_stage: ACTIVE
level: L2
spec_id: P3-M04
updated: 2026-11-15
generated_by: claude/technical-documentation-specialist
generated_at: 2026-11-15T21:00Z
generated_from: conversation
---

# Spec: Testing, security and quality programme

## 1. Envelope

- **Objective:** this public portfolio carries the same strict testing, security and quality set-up as the other projects going to market, sized to what it is: a static Vite and React site plus one serverless contact endpoint.
- **Why this matters:** the owner approved a programme on 29 October 2026 (the admin repository's `specs/2026-10-26-testing-security-assurance-plan.md`, sections 5, 7, 9, 10 and 11, with its "Owner decisions, 29 October 2026"). Its project work named three other projects; this one was not covered, so its checklist is derived here from the plan's levels (section 5) and capability table (section 7) and the site's real shape.
- **Acceptance criteria:**
  - Every capability row in section 4 is either installed with a recorded passing run and an acceptance check, or marked not applicable with its reason.
  - Measuring comes before enforcing: each tool first runs report-only, its figures are recorded in section 10, then it becomes a gate.
  - Each kit document in section 7 holds real content, then its `status` is flipped from `dormant` in the same change.
  - Done on both long-lived lines, `main` and `codex/creative-technologist-portfolio`, each on its own (they are not merged).
- **Dependencies:** `specs/2026-11-15-zero-lint-and-type-findings.md` and `specs/2026-11-15-test-coverage-to-100.md` come first; this spec refers to them and does not repeat them. The "owner decisions" below bind it.

## 2. Scope

- **In scope:** tooling, configuration, tests and kit documents that measure and enforce quality on both lines.
- **Out of scope:** application behaviour and visuals; the two specs above; the heavy-media move (its own roadmap item); any change to a live deployment.
- **Site shape that decides applicability:**
  - Public, L2, no accounts, no database, no billing, no AI, no personal data stored. The one input is the contact form (`api/contact.ts` forwards to Web3Forms, with `api/_lib/rate-limit.ts` and hCaptcha). Hosting is Vercel (`vercel.json` sets the security headers and CSP); CI is CircleCI under trial.
  - `main` is the editorial site: 26 shipped `.ts` and `.tsx` files, 19 test files, build is `vite build`.
  - The codex line adds a WebGL particle home page (`three`, `@react-three/fiber`, `drei`), `@huggingface/transformers` for the portrait depth script, `scripts/prerender.mjs` and `scripts/verify-build.mjs` in `build`, and 31 shipped files.
- **Non-negotiables:** deterministic checks first (hooks, scripts, CI); agents act only on findings that need judgement; lean by design (few checks, each at the cheapest trigger that catches its risk, hosted budgets measured); an audit only finds and a different agent fixes; planned and audited on the most capable model, with serious audits by the other model family; no `any`, no suppression, no lowered threshold, no scanner failure recorded as clean.

### Measured state (15 November 2026, this machine)

- `npm test` through the heavy runner: codex line 19 files, 164 tests passed, 4.4 s. `main` 19 files, 155 passed and 2 failed (of 157), 2.4 s. The two failures are in `src/app/fonts.test.ts`: the shared `node_modules` was installed from the codex line and lacks `@fontsource-variable/fraunces`, which `main` depends on. It is an install mismatch, not a code defect; a clean `npm ci` on `main` is the check (step 0 below).
- Installed in the project: Vitest, Testing Library, jsdom, ESLint with typescript-eslint, TypeScript. Not installed: any coverage provider, Playwright, axe, fast-check, Stryker, Knip, Lighthouse CI.
- On this machine and not project dependencies: `gitleaks`, `semgrep` and `osv-scanner` (Homebrew). `opengrep` is absent.
- No `.github/` directory; the old workflow was removed in the kit alignment. CircleCI is not yet connected (owner step).

## 3. Owner decisions that bind this work

Deterministic first; lean by design; CircleCI is the choice and under trial (measure monthly usage before expanding, Buildkite and Azure Pipelines only as a later fallback); Qlty is the preferred hosted-quality pilot (SonarQube Cloud is ruled out); Local Playwright comparisons are the visual baseline and Argos is the one hosted visual service; Semgrep CE or Opengrep by matched comparison; Gitleaks beside the house publication scanner; Knip report-only first, no automatic deletion; ZAP local only, never against production; Stryker for pure logic with scoped budgets (changed code by default) and hand-made mutants only for critical boundaries; one pass or fail summary, not a report per tool; an SBOM per release; Cosign needs its own owner discussion and is out of this spec.

## 4. Capability map

"Gate" means the record the commit gate or CircleCI requires; "periodic" means run locally on a milestone or after a dependency change. Acceptance for every row also needs the run recorded in section 10 and the command added to `QUALITY.md` section 7.

| Capability | Today | Missing | Tool and where it runs | Acceptance |
|---|---|---|---|---|
| Static baseline | `npm run check` (`tsc --noEmit`, `eslint src api`) in the commit gate and `ci:pr`; relaxed rules and about 290 lint findings | Kit strictness, zero findings, `check-code-quality.mjs` as the gate | TypeScript and ESLint; commit evidence and CI. Delivered by `specs/2026-11-15-zero-lint-and-type-findings.md` | That spec's acceptance |
| Unit and component | Vitest and Testing Library, jsdom; 19 files; `npm test` in both gates | Behaviour tests for contact error paths and the contact form's states; the failing `main` install check | Vitest; commit evidence (changed tests) and CI (full) | `npm ci` then `npm test` green on each line; forbidden-twin tests for `api/contact.ts` rejection paths |
| Coverage | None measurable | Provider, `include` of every shipped file, thresholds | `@vitest/coverage-v8`; commit evidence and CI. Delivered by `specs/2026-11-15-test-coverage-to-100.md` | That spec's acceptance |
| Generated and stateful | None | Properties for the contact handler's field trimming, length caps and email check; the rate limiter's window and `contact-key` | `fast-check`, 100 examples, bounded sizes, seed kept; focused tests, in `npm test` | Failing seed reproduces; properties catch a seeded off-by-one in the limiter |
| Mutation | None | Mutants for the pure logic only | `@stryker-mutator/core` with the Vitest runner on `api/contact.ts`, `api/_lib/rate-limit.ts`, `api/contact-key.ts`, `src/app/lib/responsive-image.ts`, `src/app/routes.ts`, `src/app/cv-route.ts`; local, 15 to 30 minutes a scope, milestones only | Compatibility spike passes; survivors analysed; score recorded; hand-made mutants on the contact boundary (skip the honeypot, drop the rate check, widen a length cap) are killed |
| Browser and API | No real browser run; the contact API is tested with stubs | Production-build journeys; the endpoint against a stub of Web3Forms | `@playwright/test` against `vite preview` of the production build; two workers; CircleCI main job (browsers image) once measured; endpoint through the handler with a local fake of the upstream, never the real service | Journeys pass on the built site: routes and 404, case study pages, CV, contact submit with honeypot, rate limit and failure states, no real email sent |
| Visual and accessibility | jsdom checks only (`keyboard-a11y`, `tap-targets`, `refinements` tests) | Real-browser a11y and layout at 320, 390, 768, 1024, 1440; reduced motion | `@axe-core/playwright` and Playwright screenshots, local first; Argos only after fonts and media render stably; human keyboard, focus, zoom and screen-reader review recorded | Zero serious axe findings on every route and breakpoint; baselines reviewed by hand; the open 320 px hCaptcha and CV-button overflows have tests |
| SAST | None | Scanner and reviewed rules | Semgrep CE (`semgrep` is installed) compared with Opengrep on this repository; changed source on a ready PR, full baseline on rule updates; 2 to 5 minutes | Seeded detections found (an unsanitised `dangerouslySetInnerHTML`, an `eval`); confirmed high findings block; triage recorded |
| Dependencies | None (no audit step; Dependabot alerts not enabled) | Audit that runs, advisory refresh | `npm audit --omit=dev` plus `osv-scanner` on `package-lock.json` (installed); lockfile changes, PR and main, plus a periodic refresh; compare parity before dropping either | A seeded vulnerable version fails the run; tool errors are reported separately from findings |
| Secrets | House publication scanner at commit | Gitleaks beside it; a one-off history audit | `gitleaks` (installed), staged changes at commit, history once; never full history per edit | Seeded fake key in staged text is blocked; history audit recorded; the server transport confirmed to leave the server-side Web3Forms key out of the built bundle |
| Architecture and dead code | None | Unused files, exports and dependencies | Knip, report-only first; Madge or dependency-cruiser only if a boundary needs it; consolidation changes only | Report reviewed; confirmed dead code deleted by the coverage spec's rule, never excluded |
| Database | Not applicable: no database | n/a | n/a | n/a |
| Schema and contracts | Contact payload checked by hand-written guards in `api/contact.ts` | A typed schema shared by form and handler | Zod only if the guards grow; otherwise the handler tests are the contract. No Schemathesis or Pact: one internal endpoint, no OpenAPI | Form and handler agree on field names and length caps (`MAX_NAME`, `MAX_BRIEF`) by a test that reads both |
| DAST | None | Header and CSP check of the deployed policy | ZAP automation config, checked in, run locally against `vite preview` or a preview build only; before a release | No high alerts; `vercel.json` headers and CSP (including the hCaptcha and Web3Forms allowances) confirmed present on the built output |
| Frontend performance | None; media is heavy (19 files over 5 MB on `main`) | Budgets | `@lhci/cli` on the production build, comparable samples, three to five minutes; bundle size report. On the codex line, frame rate and point-count checks for the WebGL scene on a real phone | Budget regression compared with noise, not a single score; heavy-media item closed or its pages budgeted |
| Load and resilience | None | The endpoint's failure and limit behaviour | No k6: a rate-limited form on a serverless host has no capacity risk worth a load tool. Instead, handler tests for upstream timeout, upstream error, missing key (500) and burst from one address | Each failure returns the documented status and message and sends no email |
| AI evals | Not applicable: no model, prompt or generated content at runtime (the transformers package builds a static depth plate offline) | n/a | n/a. `EVALS.md` stays dormant | n/a |
| Python | Not applicable as a product component: `scripts/validate.py` and the selftests are kit machinery, covered by the kit | n/a | n/a | n/a |

## 5. Plan sections 5 and 10 applied

- **Feature triggers (section 5):** accounts, tenants, personal data, billing, jobs, AI and microphone do not exist here. The one trigger that does is the public input (contact form): rate-limit and abuse bypass, injection into the forwarded email, honeypot skip, log leaks. These are the tests in the table above.
- **Threat model before security-sensitive work:** a short `security/threat-models/` note for the contact flow (assets: the mailbox and access keys; trust boundary: browser to `api/contact.ts` to Web3Forms; abuse: spam, header or body injection, key exposure in the bundle, limiter bypass by spoofed `x-forwarded-for`). It is the requirement map for the SAST, DAST and handler tests.
- **Recovery (section 10):** there is no data to recover. The equivalent is rebuild and rollback: a clean checkout rebuilds each line from the lockfile (`npm ci`, then the production build) and a Vercel rollback to the previous deployment is documented in `RELEASE.md`. Record both once, with dates.
- **Evidence:** each lane records commit, dirty state, command, tool versions, scope, duration and outcome as passed, failed, blocked, not-run or not-applicable, in `QUALITY.md`, using the tools' native JUnit, JSON and LCOV output. Nothing else is retained; CircleCI artefact storage stays off (current house policy).

## 6. Order of work (each step is one piece of work for a cheaper agent)

1. **Step 0, measure.** `npm ci` then `npm test` on each line, recording files and tests (resolves the two `main` failures in section 2). Record in section 10.
2. **Step 1.** The two specs dated today (lint and types, then coverage). Nothing below starts before the first is done; the coverage measurement may start early.
3. **Step 2, report-only scans.** `osv-scanner` and `npm audit`, `gitleaks` over history and staged text, Semgrep and Opengrep on both lines, Knip. Record counts and triage; no gate yet. Owner: connect the allowance record and CircleCI first so the runs can be budgeted.
4. **Step 3, make scans gates.** Deterministic local script feeding the one summary; the commit gate and CI call it. Seeded failures prove each one.
5. **Step 4, contact boundary tests.** Forbidden-twin and property tests, upstream-failure and burst tests, the form and handler agreement test, the threat model note.
6. **Step 5, browser, accessibility and visual.** Playwright and axe on the production build, local first; then the CircleCI main job if it fits the measured budget. Then Argos if the owner approves the account.
7. **Step 6, performance and DAST.** Lighthouse CI, bundle report, ZAP against the local preview.
8. **Step 7, mutation.** Stryker spike and scoped runs, then the hand-made contact mutants.
9. **Step 8, kit documents and SBOM.** Fill the documents in section 7, generate one SBOM per release, flip statuses.
10. **Step 9, independent audit.** One round by the other model family, read-only; a different agent fixes; re-audit only the fix of a high finding. Then carry the whole to the other line by hand.

## 7. Kit documents this work completes

Each stays `status: dormant` until the named step writes real content from a recorded run; none is filled with invented text and none is flipped empty.

| Document | State today | Filled by |
|---|---|---|
| `QUALITY.md` | Active template; no project quality areas or recorded gates | Steps 2 to 8: one quality area per surface (contact boundary, accessibility and layout, performance, security headers), commands, evidence and thresholds |
| `REVIEW.md` | Dormant | Step 9: the audit method, severity tags, and the closed first audit |
| `RELEASE.md` | Dormant | Step 8: environments (preview, production on `main`), deploy route, Vercel rollback, rebuild check, SBOM per release |
| `METRICS.md` | Dormant | Step 6: the performance and accessibility signals with their measured budgets; no product analytics, none exist |
| `COST_CONTROLS.md` | Dormant | Owner step (allowance record) then Step 2: CircleCI minutes per run, Argos and any hosted service quota, with the 80% headroom rule |
| `security/SECURITY.md` | Dormant | Step 4: the contact flow's threat model, secrets handling, headers and CSP, rate limiting |
| `EVALS.md` | Dormant | Not applicable: no AI at runtime. Stays dormant with the reason in `ONBOARDING.md` |

## 8. Owner steps (`[S]`)

- Complete the shared allowance record, then connect the project in CircleCI (already on the roadmap).
- Enable Dependabot alerts on the repository (already on the roadmap).
- Approve the Argos account and its GitHub App access before step 5's visual service, and the Qlty pilot if wanted; revoke a rejected pilot's access.
- Approve any paid plan (none is expected); free tiers need no approval.
- Approve the merge of this programme's work into `main`, as the roadmap already asks for the kit alignment.

## 9. Validation

- Every capability row has either a recorded passing run or a stated reason for not applying.
- Each gate fails on a seeded fault and passes on the clean tree (test the gate itself).
- `npm run ci:pr` passes on each line; the CircleCI jobs stay inside the house time envelope (PR about 10 minutes, main about 20).
- Hosted CI stays free-tier: read the house CI rules before editing `.circleci/config.yml`; it changes in the admin repository, never here.
- Not covered by this programme: independent skilled penetration testing and legal compliance remain a separate, budgeted owner decision.

## 10. Implementation notes

- 2026-11-15  -  written from the plan and the repository as it stands; nothing installed or fixed yet. Unit suite figures are in section 2.

## Status transition log

- DRAFT → ACTIVE: 2026-11-15
