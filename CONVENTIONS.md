---
status: active
author: stephen+claude
created: 2026-10-12
updated: 2026-11-13
---

# CONVENTIONS

Project gotchas and hard-won facts agents must not rediscover. One bullet
each, added the moment something bites twice. (Proven pattern: Blender
gotchas recurred in 6 of 28 sessions until written down - zero after.)

- `.npmrc` sets `legacy-peer-deps=true`, which React 19 peer ranges need; CI installs with it too.
- Adding a study to `site-content.json` also needs a `sitemap.xml` entry; a test checks.

## Preservation review

When a commit removes a large share of a document, or an open roadmap task
disappears, the pre-commit preservation check refuses it until a separate
reviewing agent, never the editor, has compared the before and after
versions. Run `preservation_check.py review-brief` from the machine's hook
kit: it prints both hashes, the views to compare and the exact `record`
command. The reviewer checks that meaning, requirements, decisions and open
work survive, and that every change serves the recorded request, then
records `preserved` or `lost`. A loss needs a recorded owner decision. Any
later edit voids the record.

## Canonical house standards

House defaults from the `ai-product-base` kit, verbatim for `retrofit-check.py`.
CLAUDE.md's own rules win where they differ, stated explicitly.

- **Free-only CI policy.** Read `_projects-admin/RULES.md` section 2.14 before changing CI; shared gates enforce it. Local first: where a project declares `code_checks`, lint, typecheck and the affected tests need passing evidence at commit; CI runs the full suite on a ready pull request, and nothing repeats the local suite at push. Code projects run their full, integration and browser suites on CircleCI from the house config, copied unchanged except the `cimg/node` version, adapting through `ci:pr` and `ci:main` scripts. Publication and secret checks run once, at local commit; nothing is rescanned on GitHub. Any GitHub Actions workflow keeps main/PR/manual triggers only, read-only tokens, job timeouts within 10 combined minutes, no schedules, matrices, services, artifact uploads or paid capacity, reviewed setup actions only, and Stop usage: Yes. Mutation checks stay local. At 80% of either shared allowance, stop adding hosted work and report.

- **CI budget and pushes.** Local validation runs at commit through the machine's shared hooks, never project copies. Automatic CI runs on PRs to main and pushes to main only. Batch finished work into planned pushes after the first branch backup, and re-run only failed jobs after diagnosis. Never silently disable CI or bypass a gate.

- **Publication false positives.** Stop and file the rule, path and a safe description in `_projects-admin/REQUESTS.md`, never the suspected secret; never rename code to dodge a heuristic. No blanket email-domain or dotted-string exemptions and no agent-approved exceptions.

- **Global rules and machine profiles are read-only here.** `~/.claude/*.md`, the Codex aliases and `_projects-admin/machines/` belong to `_projects-admin`; propose changes in its REQUESTS.md. Never write them by shell instead (redirects, `sed -i`, `tee`, `cp`, `mv` and `rm` included).

- **Spending money needs approval, as an allowance for the job.** Agree the budget with Stephen, then open the allowance with the command the spend gate prints, which he approves; paid operations inside it run without further prompts. When it is used up, stop and report; do not keep retrying poor results. Free services with limits never ask. Never route around the gate with another tool or an unlisted endpoint.

- Push without asking: yes on a branch. Below L3, merge and push to main without asking once the project's checks pass. From L3 (Live), every push or merge into main needs Stephen's approval, given through the client's own approve prompt, and every release to live needs its own approval. Where no prompt can appear, ask him in the conversation and stop. Forced pushes, and deleting or overwriting main, are refused at every level.

- **Gate refusals.** Installed gates refuse rather than warn. Take the way through the refusal names; if the refusal is wrong for this input, carry on with other work and report it with its reproduction to _projects-admin's inbox (`<python> "<repos>/_projects-admin/scripts/file_request.py"`). Never disable or route around a gate; a bypass is Stephen's. Verify enforcement per client and machine; documentation is not proof.

- Default branch is always `main`, never `master`

- Commit without asking: yes

- Create new top-level folders: no

- **Clean up after yourself: mess is yours, whoever made it.** Remove scratch files, temporary scripts, logs, failed output, duplicate checkouts and stray artefacts without asking, even another session's, but never uncommitted or unpushed work. Ask before removing anything published, supplied by Stephen, installed, roadmap-linked or tracked outside your change; archive media; list files before bulk changes. Finish with a clean `git status`.

- **Commit only this project's own work.** The kit's procedure (`RETROFIT.md`), global rules and other repositories' files are read where they live, never copied or committed here. Stage named paths when untracked files are not yours.

- Follow the subagent tier caps and installed guard guidance in CLAUDE.md.

- **Never hack around a problem.** `any`, a cast, a suppression, a TODO, a second tool or a quieter check that hides a failure is cheating; if the real fix is blocked, stop and say so.

- **Rigour follows risk.** Code that can block work, delete, publish, push or deploy, or that handles secrets, sign-in, payments, personal data or migrations gets focused tests with a forbidden twin, a mutation check of the new tests and one independent adversarial audit. Ordinary code gets tests for the changed behaviour, and an independent audit only past about 300 changed lines or on request. Text and configuration get neither; the structural gates still run. An audit is one round: fix every bug it finds, fix low polish if quick, and re-audit only the fix of a high finding. A defect met on the way in code this project owns is fixed in the same work, never filed or left; a defect in the house hooks or kit is reported to admin.

- When work passes between tools or sessions, use a work-item file in `handoffs/` copied from `handoffs/TEMPLATE.md`. The `owner` field is whose turn it is.

- **Owner-action list.** `ROADMAP.md` carries a `## Stephen` list of `[S]` items: actions only the owner can take: any merge or push into main, a release to live, an allowance for a paid service, connecting a service or account, a login, a purchase, an approval the rules reserve to him. At the end of every task, milestone or piece of ad-hoc work, add what he must now do and remove what is done, in the same change as the work; the Dashboard reads these lines.

- **End replies where Stephen will see them.** Short replies; anything he must answer or do goes last, on its own, and nothing is repeated: the Stop hook already shows what is still running under every reply, so do not add a line for it. Never claim work is under way that nothing is running.

- **Keep the machine responsive, and yourself.** Run tests, builds, installs and any command that can take more than a few seconds in the background, and answer a message from Stephen before waiting on any of them: never sit blocked on a run. Tests, builds, coverage and mutation runs go through `<python> "<repos>/_projects-admin/scripts/heavy.py" run -- <command>`: three slots per machine, one or two workers each, niced; one long job (`--long`, past 20 minutes) at a time; lint and typecheck need no slot. For application work, run the tests for the files changed while working; passing evidence for lint, typecheck and the affected tests before a commit, reused while its inputs are unchanged; and the complete suite once before a merge to main or on CI, never per commit. Hook maintenance is individual: audit, test and install only the changed hook on the receiving machine; preserve completed installs. Full hook suites require an explicit owner request. One checkout per repository unless the desktop app or Stephen made the worktree.

- **Do it yourself; research before asking.** Run what you can instead of handing it to Stephen, and validate any command you give him. Check docs, records and earlier decisions first, and ask only for decisions genuinely his. A request to fix or pick up work is a request to do it.

- **Shared server controller.** Previews start, stop and report only through `<python> "<repos>/_projects-admin/scripts/project_control.py" status|start|stop` (append the project ID outside its checkout); start reuses the running server and never picks another port. Never launch dev servers, kill listeners or edit Tailscale routes yourself, or add project hooks. Register a new preview's unique ports through the admin workflow first.

- **One live address.** Give Stephen only this project's registered Tailscale link, never localhost or a port you picked; never start a second server or move ports. A server already on the registered port is the live one: use it or restart it on the same port. Creating a project does not register it.

- **Product platform.** A product hosts on Cloudflare (Workers, R2, Hyperdrive) and keeps its data in Neon Postgres, both on paid plans. Vercel and Supabase are not used for products: they stay only for the portfolio and non-commercial tools (Stephen, 13 November 2026).

- **Vercel build policy.** Only main builds automatically; keep the deny-all default, and previews need Stephen's explicit request per branch, never wildcards. Apply `scripts/vercel-main-only.json` before connecting or pushing, as the kit's RETROFIT.md describes, and record exceptions in DECISIONS.md. CLI, API and deploy-hook builds need separate deployment authority.

- **Publication-safe records.** Everything tracked, commit metadata included, is fit to disclose: neutral decisions, no private conversation, profanity or emotional delivery; no credentials, contact details or machine paths (fixtures too); no em-dashes in public copy.

## Declare what you deliver

The commit is checked against a declaration, never a description. `<tool>`
below is `<python> "<repos>/_projects-admin/hooks/deliverables_check.py"`.

1. Before the first commit: `<tool> declare --work "<short name>" FILE...`
   (files, folders ending `/`, or globs; `--as markdown|json|python|media|removed`
   adds a type check).
2. Commit as often as needed. Every staged file is declared (`<tool> add`) or
   matches `deliverables.always_allowed` in `scripts/validate.config.json`.
3. Before the last commit: `<tool> close --work "<short name>"`. That commit
   is refused unless every declared file is committed, and `close` refuses
   while a file the work created has no disposition: `add` it, `keep` it with
   `--why "<reason>"`, or `scratch` it (removes it).

`<tool> show` lists open declarations (per checkout and branch); `remove`
takes a file out or, with no file, drops the work. Merges and reverts are not
checked.

A request to a generative model goes through the generation pre-flight first
(`<python> "<repos>/_projects-admin/scripts/generation_preflight.py" check
<request.json>`, stating `written_for`); model names live only in the
`model_config.files` paths.

## Code baseline

- **User-facing copy checks.** Test the project's punctuation and brand rules against shipped copy and data, escaped characters included; the privacy scanner is not a typography checker.

- TypeScript runs with `strict: true` plus `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `useUnknownInCatchVariables`; never turn one off to pass.

- Python runs with `mypy` strict. Do not weaken project-wide strictness for one module.
- Apply QUALITY §9 feature triggers in the introducing change. Record the actual test boundary and failing control, and use the shared heavy runner for the required test lanes.

- Never use `any` or `Any`. Prefer `unknown` and narrow it. No `@ts-ignore`.

- Typecheck, lint and the tests for the changed behaviour must pass before that code is called done; the complete suite runs once before a merge to main or on CI. Say exactly what did not run.

- When Stephen must apply SQL by hand, hand over every pending change for the task once, as one complete, idempotent script, never a change per turn or partial snippets.

- Preferred languages: TypeScript and Python. A new source file is `.ts` or `.tsx`; another runtime needs a one-line reason. Web code uses arrow functions and functional React components with hooks; exceptions are recorded decisions.

- Runtime-validate all untrusted input at system boundaries. Do not trust an external payload because it should be correct.

- No secrets in code or client bundles, including comments, tests, and fixtures.

- Explicit auth, ownership, and tenant-scope checks on every access boundary. The UI hiding a control is not the check.

- No unsafe raw-HTML injection without sanitisation and justification.

- No `@ts-ignore`, and no suppressions without reasons: `@ts-expect-error` with an inline reason is the only one, and only when the platform types are wrong.

- Prefer small modules with explicit inputs and outputs. Treat type, schema, and security warnings as real defects.

- Fail fast on invalid config, data, auth and permissions. Least privilege for credentials, APIs, storage and deployment.

## Code enforcement acceptance

These rules are requirements, not a bundled toolchain. Record the real stack,
config paths and validation command in ONBOARDING.md; media-only projects mark
application checks N/A. One local command runs the compiler, linter and tests
and fails on any failure; the linter rejects explicit `any`/`Any`, and database
queries are parameterised. Shared Git hooks do not run application checks:
verify the route and never claim automatic enforcement. The acceptance probes
are in the kit's RETROFIT.md.
