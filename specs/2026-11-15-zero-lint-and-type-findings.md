---
status: active
author: claude
spec_stage: ACTIVE
level: L2
spec_id: P3-M02
updated: 2026-11-15
generated_by: claude/technical-documentation-specialist
generated_at: 2026-11-15T12:00Z
generated_from: conversation
---

# Spec: Zero lint and type findings

## 1. Envelope

- **Objective:** `npm run check` reports nothing under the kit's full lint and type settings, with no rule switched off and no suppression added.
- **Why this matters:** the house rule (CONVENTIONS.md, code baseline and no parked problems) is zero findings. Some of the findings are real defects (a floating promise, a misused promise, unchecked index access), and the kit's `check-code-quality.mjs` cannot replace the project's `check` script until the settings are on.
- **Acceptance criteria:**
  - The relaxations block in `eslint.config.js` is deleted; every rule it listed is on.
  - `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `skipLibCheck: false` are on in `tsconfig.json` and `tsconfig.node.json`.
  - The kit's `max-lines` rule is on (300 for source, 1,500 for tests, blanks and comments skipped).
  - No `any` in the code and no inline `eslint-disable`; `noInlineConfig` is on.
  - `npx eslint src api` and `npm run typecheck` report nothing; the full suite and the production build pass.
  - The same holds on both long-lived lines, `main` and `codex/creative-technologist-portfolio`, each fixed on its own line (they are not merged).
  - The kit's `scripts/check-code-quality.mjs` runs and replaces the project's `check` script.
- **Dependencies:** none. Runs ahead of feature work.

## 2. Scope

- **In scope:** the findings below, the config changes that turn each setting on, and tests for any behaviour a fix changes.
- **Out of scope:** coverage (`specs/2026-11-15-test-coverage-to-100.md`), visual or content changes, new features.
- **Affected areas:** `src/`, `api/`, `eslint.config.js`, `tsconfig.json`, `tsconfig.node.json`, the `check` script in `package.json`.
- **Non-negotiables:** no rule switched off, no suppression, no `any` or cast to reach zero (CONVENTIONS.md); the site's rendered output and behaviour do not change.

### Measured findings (15 November 2026)

Command for lint: `npx eslint src api` with the relaxations block removed. Command for types: `npm run typecheck` with the flag turned on.

| Setting | `main` | codex line |
|---|---|---|
| `func-style` | 80 | 43 |
| `no-non-null-assertion` | 46 | 31 |
| `no-confusing-void-expression` | 36 | 40 |
| `restrict-template-expressions` | 26 | 20 |
| `explicit-module-boundary-types` | 22 | 34 |
| `require-await` | 15 | 17 |
| `no-unsafe-member-access` | 12 | 11 |
| `no-restricted-syntax` (function expressions) | 11 | 21 |
| `no-unnecessary-condition` | 7 | 25 |
| `no-unsafe-assignment` | 7 | 8 |
| `no-base-to-string` | 6 | 6 |
| `no-unnecessary-type-assertion` | 6 | 5 |
| `unbound-method` | 1 | 10 |
| `no-floating-promises` | 1 | 5 |
| `prefer-arrow-callback` | 3 | 2 |
| One each on `main`: `no-misused-spread`, `no-deprecated`, `no-unsafe-argument`, `no-misused-promises`, `no-unnecessary-type-arguments`, `no-unsafe-enum-comparison` | 6 | 5 (no `no-unnecessary-type-arguments`) |
| One each on the codex line only: `consistent-type-imports`, `no-extraneous-class`, `no-unsafe-return` | | 3 |
| `no-new-func` and `no-implied-eval`, off for `PortraitScene.test.tsx` (a test builds a function from shader source) | | 2 |
| Lint total | about 290, 20 rules | 288, 25 rules |
| `noUncheckedIndexedAccess` | 56 | 48 |
| `exactOptionalPropertyTypes` | 1 | 21 |
| `skipLibCheck: false` | 2 | 55 |
| `max-lines` 300, source (rule absent from the config) | 3 files: `WorkIndex.tsx` 909, `PlotterMark.tsx` 423, `CV.tsx` 362 | 5 files: `PortraitExperience.tsx` 459, `QuiverCaseStudy.tsx` 447, `Project.tsx` 393, `project-stories.ts` 349, `portrait-particles.ts` 320 |
| `max-lines` 1,500, tests | none | none (largest `PortraitScene.test.tsx`, 578) |
| `any` in `api/contact.test.ts` behind an inline `eslint-disable` | 1 | 1 |

Measured read-only on 15 November 2026 (codex figures: `npx eslint .` with the relaxations block removed, and the same `max-lines` rule passed on the command line). The per-rule counts on each line are in the comments of that line's `eslint.config.js`; re-measure before starting, since the counts move with the code.

## 3. Implementation guidance

- **Inspect first:** `eslint.config.js` (relaxations block), `tsconfig.json`, `scripts/check-code-quality.mjs` (what it requires), `api/contact.test.ts`.
- **Order of work:**
  1. The `any` in `api/contact.test.ts` (typed function alias), then turn `noInlineConfig` on.
  2. The real-defect rules, by reading, each with a test: `no-floating-promises`, `no-misused-promises`, `no-unsafe-*`, `no-unnecessary-condition`, `no-non-null-assertion`, `require-await`, `restrict-template-expressions`, `no-base-to-string`.
  3. `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`: fix the types or add the check the code was missing, never a cast.
  4. `skipLibCheck: false`: fix first-party errors; a genuinely wrong third-party type takes a reasoned `@ts-expect-error` and nothing else.
  5. The mechanical rules (`func-style`, `no-restricted-syntax`, `prefer-arrow-callback`, `explicit-module-boundary-types`, `no-confusing-void-expression`) with the linter's fixer, reviewed as a diff.
  6. `max-lines`: split each over-long source file by subject, with tests moving with the code.
  7. Swap in `check-code-quality.mjs` as the `check` script.
- **Commit per rule or flag**, smallest count first inside each step, with the changed tests run before each commit.
- **Anti-patterns to avoid:** a blanket `// eslint-disable`, a cast to silence the compiler, lowering a threshold, adding a new relaxation.

## 4. Validation

- `npx eslint src api`, `npm run typecheck`, `npm test`, `npm run build` all clean, with the config free of `off` entries for kit rules.
- A grep for `eslint-disable`, `@ts-ignore`, `@ts-nocheck` and `: any` finds nothing in tracked source.
- Browser check of the homepage, a study overlay and `/cv` after the file splits (rendering unchanged).
- Per the rigour tier, the real-defect fixes in `api/contact.*` (personal data, a public form) get focused tests with a forbidden twin and one independent audit.

## 5. Context

- **Related roadmap phase:** 3.1, first open item.
- **Related quality docs:** CONVENTIONS.md (code baseline), QUALITY.md section 8.

## 6. Risks and follow-ups

- **Risks:** a fix that changes behaviour unseen - mitigation: tests before the fix where none exist, and the rendered-output check above. Splitting the largest source file (`WorkIndex.tsx` on `main`, `PortraitExperience.tsx` on the codex line) is the largest change - mitigation: split by subject with no logic change, one commit.
- **Known unknowns:** the counts on the codex line move with that line's code; re-measure first.
- **Model rule (house):** planned and audited on the most capable model; the serious audit is run by the other model family; the auditing agent only finds, and a different agent fixes. Mechanical fixing goes to cheaper agents on a written brief.

## 7. Security and threat model

- **Attack surface introduced:** none. The contact form and its API are touched only to fix typed findings; their tests must show validation and error paths unchanged.
- **Residual risk:** none expected once the floating and misused promises are fixed.

## Status transition log

- DRAFT → ACTIVE: 2026-11-15
