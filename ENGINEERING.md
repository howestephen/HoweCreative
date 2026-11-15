---
status: active
author: stephen+claude
level: L1+
updated: 2026-11-14
---

# ENGINEERING

Use this file for the default engineering baseline for new projects.

It defines the preferred starting stack and the cross-stack rules for typed, secure, reviewable code. Override it only when product constraints clearly justify it.

## 0A. Paradigm Defaults

House-style preferences. Hard defaults are non-negotiable at L1. Soft defaults are strong preferences overridable per project with documented justification. Domain addenda in `domains/` may override these where the domain demands it. Python services use `pydantic` and `dataclass` models with strict `mypy` (§4). Any paradigm deviation must be declared in `ONBOARDING.md` under "Paradigm defaults" and justified in one line.

Hard defaults: CONVENTIONS.md, Code baseline.

### Soft defaults (L1 preferred, overridable)

- Functional composition over classes; classes only when they materially improve design (state machines, domain entities with invariants, framework extension points)
- Discriminated unions over boolean flags or sentinel values
- Named exports over default exports
- Colocate tests next to source (`foo.ts` + `foo.test.ts`)
- Feature-first folder organisation over type-first (`features/checkout/` over `components/` + `services/`)
- Absolute imports via path aliases (`@/lib/...`) over deep relative paths

## 2. Trust And Boundaries

### 2.1 Input Trust Model

Treat all external data as untrusted, including:

- HTTP bodies, query params, route params, headers, cookies
- local or session storage, browser messages, worker messages
- env vars, CLI args, deserialised JSON, YAML, TOML, CSV
- DB results unless already validated
- third-party API responses and webhooks
- uploaded files, blobs, and binary data

Required flow: parse -> validate -> normalise -> convert to trusted internal types -> use in domain logic.

### 2.2 Boundary Design

Keep clear layers:

- entrypoints: routes, handlers, CLI, jobs
- schemas: parsing and validation
- domain: business rules
- services: orchestration
- adapters: external APIs, SDKs, storage, browser or platform APIs
- infra: framework, persistence, queues, cloud, caching

Do not let framework objects or raw payloads leak deep into domain code.

### 2.3 Exception Policy

Weak typing is allowed only where the platform or library forces it, for example:

- blobs, files, `FormData`, drag-and-drop
- canvas or media APIs
- dynamic SDKs with weak typings
- dataframe-heavy Python code
- legacy migration seams
- reflection, metaprogramming, or generated code boundaries

When you need an escape hatch:

1. isolate the weak point
2. add a short reason comment
3. narrow or validate immediately
4. convert to safe internal types
5. do not let looseness spread

### 2.4 Secrets And Config

- Centralise config parsing and validation.
- Separate public config from server-only secrets.
- Fail fast on missing or malformed config.
- Never expose secrets to client bundles.
- Use scoped, least-privilege keys.
- Rotate secrets when compromised or shared.

### 2.5 Authentication And Authorisation

Types do not enforce security. Check explicitly:

- authentication
- role or capability
- resource ownership
- tenant boundary
- safe query scoping

Never assume internal callers are trusted unless the architecture enforces it.

### 2.6 Dependencies

- Prefer maintained libraries with strong typings and a credible security history.
- Avoid libraries that force broad `any` or `Any`, global mutable state, or unsafe HTML handling.
- Pin or constrain versions sensibly.
- Remove unused dependencies.
- Wrap weak dependencies behind typed adapters.

### 2.7 Failure Handling

Handle exceptions where a call can fail: files, network, processes, parsing,
external services. Check the result of every command and call before relying on
it. An error carries context: what was attempted, on what input, and why it
failed. Clean up what the failed step created. Report success only for what
completed. Never swallow an error silently and never wrap code in a blanket
try/catch; catch what you can handle and let the rest fail loudly. When a later
step fails, keep the independent operations that already completed and say
which did and did not.

## 3. TypeScript, React, Tailwind, Vite, Next.js

### 3.1 Required TypeScript Baseline

Use `strict: true` and keep the compiler working for you, not around you. The shipped `tsconfig.json` is the baseline.

Strict mode, `unknown`, suppression and runtime-validation rules: CONVENTIONS.md, Code baseline. Also:

- Avoid broad assertions.
- Exported functions should usually declare return types.
- Prefer discriminated unions over boolean soup.

### 3.2 Boundary Patterns

Prefer typed adapters around:

- fetch responses
- local storage
- URL and search params
- form submissions
- third-party SDK calls
- browser APIs
- file handling
- worker messages

### 3.3 Runtime Validation

Recommended libraries: `zod`, `valibot`, `arktype`, plus env validation where appropriate.

Validate:

- API request and response data
- server action input
- route params and search params
- env
- `postMessage` payloads
- storage payloads
- file metadata
- third-party API payloads

### 3.4 Framework rules

React, Tailwind, Vite and Next.js rules: `docs/web-framework-rules.md`.

### 3.8 TypeScript Tooling

The config is the rule; this section only says where it lives and what it
cannot do. The kit ships `tsconfig.json`, `eslint.config.mjs`, pinned npm
tooling and `scripts/check-code-quality.mjs`. Run `npm ci --ignore-scripts`,
then `<python> "<repos>/_projects-admin/scripts/heavy.py" run -- npm run check`
(`<python>` is `python3.13` on the Mac, `python` or `py` on the PC; see
RETROFIT.md). For an existing project, merge these into its own
tooling and never overwrite its package manifest or framework settings;
dependency versions and the lockfile are reviewed together (TypeScript stays
within the lint parser's supported range).

- Compiler: the strict baseline including indexed-access and optional-property
  checks; explicitly switching off a strict member flag is rejected.
- Lint: type-aware strict rules; no explicit or inferred-unsafe `any`; exported
  TS functions need return types; arrow functions, `const`, handled promises,
  type imports; warnings fail. `@ts-ignore` and `@ts-nocheck` fail, and
  `@ts-expect-error` needs a real explanation and must suppress something. No
  inline ESLint disable; a genuine framework or generator exception is a narrow
  reviewed change to the config.
- Every first-party JS/TS file must be covered by both compiler and lint.
  Discovery skips dependencies/builds, the two check files and generated agent
  state (`.remember/`, `.cursor/`, `.claude/hooks-state/`, `.claude/worktrees/`,
  including nested instances). Compiler exclusions match those runtime paths.
  Git ignores also keep local agent configuration out of commits. Ordinary
  first-party sources remain checked even if gitignored; project rules and shared
  agent definitions stay versioned. Symlinks need a reviewed design. JS uses
  JSDoc with `checkJs`.
- An empty scaffold reports NOT APPLICABLE, which is not an application pass.
  Missing tools with source present is a failure.
- Before committing, the agent runs `scripts/selftest_code_quality.py
  --evidence`; the commit refuses touched checks without a passing record
  bound to the staged inputs (QUALITY §7). CircleCI's `ci:pr` and `ci:main`
  repeat lint and typecheck on the submitted revision. Neither is independent
  review. Monorepos and framework setups need a reviewed adaptation covering
  every source project. Python has its own tools in §4.

### 3.9 Which layer enforces a rule

Compiler and lint own static code decisions; runtime schemas validate external
data (parameterised driver calls, allowlisted identifiers, shell-free argument
arrays; authorisation and tenant checks need negative integration tests, not
types); documentation validators check structure and links, not truth; Git
hooks and CI call shared checks and add lifecycle controls; an MCP server is
transport while the underlying service owns permissions and honest errors.
Report command, revision or dirty state, host, exit code and scope, and keep
NOT APPLICABLE, UNTESTED and REVIEW PENDING distinct from PASS. Independent
acceptance follows the change's rigour tier (CONVENTIONS.md, rigour follows risk).

## 4. Python

### 4.1 Required Baseline

Use type annotations everywhere plus runtime validation at boundaries.

Use strict mypy, Ruff and pytest. Use Pydantic v2 and pydantic-settings
where the component validates structured input or settings. Type function
signatures and avoid `Any`. Prefer TypedDict, dataclasses, Protocol or
Pydantic models. Keep casts narrow and give each
`# type: ignore[code]` a reason.

With the shipped `pyproject.toml`, run
`<python> "<repos>/_projects-admin/scripts/heavy.py" run -- <python>
scripts/selftest_code_quality.py --python-only` in the project's
locked `.venv` for the mypy, Ruff and pytest baseline. Empty scaffolds
report not applicable. Missing tools or config, failed tests and zero
collected tests block. Mixed projects omit the flag for the manual baseline.
From L1, before committing, the agent records passing evidence for the
static checks and the affected tests (QUALITY §7; L0 needs none); CI runs the full suite on the pull
request. Preserve stricter rules and justify
suppressions.
For critical-code coverage, include pytest-cov in the locked environment
and use the bridge with `--python-coverage`. Keep any project floor in
`[tool.coverage.report].fail_under` in pyproject.toml. The command applies
that floor and writes `coverage/python.json` for the review receipt.

### 4.2 Runtime Validation

Use `pydantic` for request payloads, settings, webhooks, queue payloads, structured third-party responses, and file metadata wrappers.

### 4.3 Stub Policy

When a library lacks good typing, prefer this order:

1. upgrade library
2. install official or maintained stubs
3. wrap it behind a typed adapter
4. add minimal local `.pyi` stubs
5. use narrow `cast()` or `type: ignore[...]` with a reason

Useful stubs include `types-requests`, `types-python-dateutil`, `boto3-stubs`, and `pandas-stubs`.

Local stubs must stay minimal, cover only the used surface area, and be removed if upstream improves. Do not add broad fake stubs that hide defects.

### 4.4 Python Security Notes

- Never trust deserialised input.
- Avoid unsafe YAML loaders for untrusted content.
- Never unpickle untrusted data.
- Validate paths, filenames, file sizes, and content-type hints.
- Keep subprocess calls tightly controlled and avoid shell injection.
- Centralise config and fail fast.
- Keep SDKs and raw DB result handling at the edge.

## 5. Files, Uploads, And Binary Data

Common exception area:

- browser `Blob`, `File`, `ArrayBuffer`, `FormData`
- uploads and downloads
- drag-and-drop
- object storage clients
- image, audio, or video processing
- archives and exports
- CSV, XLSX, PDF, and media pipelines

Rules:

1. keep file handling at system edges
2. validate filename, extension, MIME or content type, and size
3. do not trust MIME hints alone
4. convert raw payloads into typed internal wrappers quickly
5. do not pass raw files, blobs, or SDK objects deep into business logic
6. enforce size limits and allowlists
7. sanitise filenames and path usage
8. treat uploads as hostile

Assertions or ignores are legitimate only when platform typings are incomplete, SDK typings are wrong or missing, the runtime behaviour is known and checked, and the looseness is contained immediately. They are not a substitute for real validation.

## 6. API And Schema Discipline

- Every API boundary needs an explicit schema.
- Internal domain models should not be raw transport payloads.
- Normalise at ingress.
- Serialize deliberately at egress.
- Version external contracts where relevant.
- Prefer explicit nullable or optional semantics.
- Do not overload one shape for unrelated concerns.
- In React or Next plus Python systems, validate on both ends. Generated types help, but they do not replace runtime validation.

## 7. Testing Expectations

Typing is not a substitute for tests.

Always cover:

- boundary validation
- permission and auth checks
- adapter behaviour
- malformed input
- file or blob edge cases
- schema transforms
- regressions around previous type escapes

At minimum:

- unit tests for domain logic
- tests for parser and validator modules
- tests for auth-sensitive routes or actions
- tests for file handling and size or type enforcement

# House rules (settled 2026-08, authoritative)

- **Database and RLS:** row-level security on from day one for anything with
  users or tenants. Every table with user data has a policy and a test that
  proves a wrong user sees nothing.
- **Migrations:** never edit an applied migration; write a new one. Every
  migration is reversible and tested against a copy of real-shaped data
  before it touches production.
- **Tool constraint files:** each external tool (Blender, ComfyUI, etc.) gets
  a constraint file listing the fields that matter and their valid ranges;
  proposed settings are validated against it mechanically, never by asking an
  agent to recall the docs.
- **Dead code:** deleted, never commented out. Git history is the archive.
- **Fixtures and seed data:** projects with tests declare fixtures explicitly;
  fixtures use inert non-credential placeholders, never credentials labelled fake.
- **Idempotency and crash recovery:** every automated job skips finished
  outputs on re-run and resets anything left mid-flight at startup
  (`_projects-admin/PRINCIPLES.md`, principle 8).

# Logging

Structured logging. JSON Lines: one JSON object per line, UTF-8,
appended - greppable by any tool.

Required keys every line: `ts` (ISO-8601 UTC), `level`
(debug|info|warn|error), `event` (stable slug), `msg` (sentence). Context as flat extra keys; never nested, never a secret.

Destination `logs/<service>.jsonl`, gitignored, rotate 10MB/daily, keep
7 days, local only.

Schema: `{ts, level, event, msg, ...context}`. Context keys cannot
overwrite the four required keys. Write to the file, not stdout. Rotation
and redaction are the caller's responsibility (logrotate or size check;
never pass a secret as context).
