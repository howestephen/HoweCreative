---
status: active
author: claude
spec_stage: ACTIVE
level: L2
spec_id: P3-M03
updated: 2026-11-15
generated_by: claude/technical-documentation-specialist
generated_at: 2026-11-15T12:00Z
generated_from: conversation
---

# Spec: 100% test coverage, enforced

## 1. Envelope

- **Objective:** every shipped source file is measured, covered 100% by tests of behaviour, and the gate fails below 100%.
- **Why this matters:** the house rule (CONVENTIONS.md, code baseline) is that every function and feature is covered by tests, enforced by a coverage check that is never lowered. Today coverage cannot be measured at all, so nothing prevents it falling.
- **Acceptance criteria:**
  - A coverage provider is installed and `vitest.config.ts` has a coverage block whose `include` lists every shipped source file under `src/` and `api/`, so an untested file shows as 0%.
  - The coverage run is part of `ci:pr` and of the commit evidence check.
  - The gate fails below 100% lines, functions, branches and statements.
  - The suite passes; no threshold is lowered and no file is excluded to pass.
  - Done on both long-lived lines, each on its own (they are not merged).
- **Dependencies:** best after `specs/2026-11-15-zero-lint-and-type-findings.md`, since its file splits and fixes change what needs testing; the measuring step (below) can start first.

## 2. Scope

- **In scope:** the coverage tooling and gate, the missing tests, deletion of dead code the report exposes.
- **Out of scope:** changes to behaviour or visuals; generated files and static assets.
- **Affected areas:** `package.json`, `vitest.config.ts`, the commit and CI gate scripts, test files beside `src/` and `api/`.
- **Non-negotiables:** tests assert behaviour, not lines executed; dead code is deleted, never tested or excluded.

### Measured state (15 November 2026)

- Not measurable: no coverage provider (`@vitest/coverage-v8`) is installed, `vitest.config.ts` has no coverage block, and no gate runs coverage.
- Shipped source under `src/` and `api/`: 26 `.ts` and `.tsx` files on `main` and 31 on the codex line, with 19 test files on each. Which files no test imports, and the lowest-covered ones, are unknown until the first run; record them in this spec's section 10 when measured.

## 3. Implementation guidance

- **Inspect first:** `vitest.config.ts`, `package.json` scripts, the gate scripts that read test evidence, `src/test-setup.ts`.
- **Order of work:**
  1. Install the provider; add the coverage block with `include` set to every shipped file; run it and record the per-file figures (the measure).
  2. Put the run in `ci:pr` and the commit evidence check with thresholds at the measured figures, so coverage cannot fall.
  3. Write the missing tests, unmeasured and lowest-covered files first; raise the thresholds with each commit until they read 100.
  4. Delete dead code the report shows; do not test it.
- **Anti-patterns to avoid:** an `exclude` or `/* v8 ignore */` to reach 100, asserting that a function was called instead of what it did, snapshotting whole components.

## 4. Validation

- The coverage run reports 100 for lines, functions, branches and statements across the `include` set, and fails when a test is removed (mutation check on the gate itself).
- `npm test` and `npm run ci:pr` pass.
- Hosted CI stays free-tier: read the house CI rules before editing `.circleci/config.yml`.

## 5. Context

- **Related roadmap phase:** 3.1, second open item.
- **Related quality docs:** CONVENTIONS.md (code baseline), QUALITY.md section 7.

## 6. Risks and follow-ups

- **Risks:** tests written only to touch lines - mitigation: the audit checks each new test fails when the behaviour is broken. Branch coverage of the animated components needs care with jsdom - mitigation: test the logic, extract it from the component first if needed.
- **Model rule (house):** planned and audited on the most capable model; the serious audit is run by the other model family; the auditing agent only finds, and a different agent fixes.

## 7. Security and threat model

- **Attack surface introduced:** none. The contact API (`api/contact.ts`) gets forbidden-twin tests for its rejection paths.

## 10. Implementation notes

- 2026-11-15  -  written from the measurement above; nothing fixed yet.

## Status transition log

- DRAFT → ACTIVE: 2026-11-15
