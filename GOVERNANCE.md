---
status: active
author: stephen+claude
level: ALL
updated: 2026-11-14
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# GOVERNANCE  -  Documentation Lifecycle and Self-Governance

## 0. Instruction Priority

1. User's explicit instructions (`CLAUDE.md` (rules; `AGENTS.md` is a pointer), direct requests): highest
2. Level-specific constraints (`LEVELS.md`)
3. Domain-specific addenda (`domains/`)
4. Default rules below

Lower layers never override higher layers.

## 1. Status Header Convention

Every doc, `README.md` included (the structure gate requires it; only an in-flight `_MIGRATION_MAP.md` is exempt), starts with the house frontmatter:

```yaml
---
status: active | draft | dormant | superseded | archived
author: stephen | claude | codex | stephen+claude
level: L0 | L1 | L2 | L3 | L4 | L5 | ALL   # omit if not level-gated
domain: consumer | blockchain | ...                   # omit if not domain-specific
updated: YYYY-MM-DD
---
```

Status meanings (house vocabulary; `dormant` is this template's level-gating extension). Agents check status before ingesting content. `active`: in use; the only status agents may take instruction from. `draft`: work in progress, not yet authoritative. `dormant`: present but not yet activated at the current level. `superseded`: a newer doc won; add `superseded_by:`. `archived`: complete or retired; never live context unless explicitly asked.

## 2. Doc Lifecycle

### 2.1 Create

Before creating a new doc, check:

1. **Domain-specific?** Extend the relevant `domains/DOMAIN_*.md`
2. **Level-specific?** Extend the relevant level doc
3. **Cross-cutting AND persistent AND would a second project need it?** Only then create a new top-level doc

### 2.2 Update

Update a doc when its level activates or deactivates, a roadmap task changes its subject, a consistency check reveals drift, or a user confirms a new decision; bump `updated` each time.

### 2.3 Archive

When a spec, plan, or requirement doc is complete or superseded:

1. Change `status: active` to `status: archived` and add `note: [reason] - [date]`
2. Move the file to the nearest `_archive/` folder
3. Do not read archived docs as live context unless explicitly asked

### 2.4 Delete

Never delete archived material without listing it and getting Stephen's go-ahead; creative and media assets are archived, never deleted. Do not delete live docs.

## 3. Post-Task Governance Loop

Runs after **every** substantive task.

1. Reconcile `ONBOARDING.md`, `ROADMAP.md`, and any changed doc for consistency; flag contradictions as "governance findings" in the task report
2. Update `updated` on touched docs
3. If the task fired a level trigger, invoke the Level Transition Playbook (§5)
4. If a spec changed stage (§9.3), update it and the roadmap row
5. If any doc is now `status: dormant` or `status: archived`, confirm the transition is recorded

Target cost: **<5 minutes per task**. If it consistently exceeds 5 min, the system is too heavy and needs simplification.

## 4. Archive Protocol

See §2.3. Archive folders are `_archive/` at any level of the tree; the nearest one to the original file is the target. Examples: `/specs/milestones/2026-04-18-p1-m02-login.md` to `/specs/_archive/2026-04-18-p1-m02-login.md`; `/security/audits/2026-04-18-claude.md` to `/security/_archive/2026-04-18-claude.md`.

## 5. Level Transition Playbook

Runs when a trigger fires and user has confirmed activation (trigger rules: `LEVELS.md` §5). Steps for L(n) to L(n+1):

1. **Seed new docs** from this project's active template documents
2. **Pre-populate with project-specific context**; never leave an empty template in an active project
3. **Audit previous-level docs**: update any items that now need the new doc's discipline
4. **Update `ONBOARDING.md`** Current Level (keep the `- **Current Level:** L<n>` shape; the hooks read it to tell a live project); main needs Stephen's approval from L3 (CONVENTIONS.md), and from L3 each release to live also needs his approval, so make the L2 to L3 transition change itself on a feature branch before launch work
5. **Update `ROADMAP.md`**: phase header, active level, expected tier activations
6. **Write the transition note in the current `handoffs/` work item**: one paragraph on trigger, activations, next changes
7. **Log transition in `LEVELS.md` §7 Level Change Log**
8. **Stop and request review** before resuming implementation work

Never run multiple level transitions in one task.

## 6. L1 to L2 Launch-ready Playbook

Each step is an atomic sub-task:

1. **Folder structure audit**: list drift from intended pattern; produce move list
2. **Dependency audit**: remove unused, flag duplicates and unmaintained
3. **Naming audit**: flag inconsistent casing, abbreviations, pluralisation
4. **Duplication audit**: flag copy-pasted blocks over ~20 lines
5. **Dead-code audit**: flag unused exports, unreachable branches
6. **Doc expansion**: rewrite L1 bullet docs as L2 prose where concepts have stabilised
7. **Seed `QUALITY.md` and `REVIEW.md`** with real project context
8. **Write a "What L1 established" note** in the current `handoffs/` work item

Each is a separate commit or task envelope, approved as a batch.

## 7. Doc Verbosity Scaling

Verbosity scales with level; pre-emptive verbosity is a governance violation. **L0 docs:** optional light notes or a light spec of what was learned and decided. **L1 docs:** bullets only, no long prose, examples, philosophy or premature architecture, ~1 page max per doc. **L2 docs:** prose allowed where stable, examples added, template sections filled with real context. **L3+ docs:** full narrative where useful; cross-references active.

If the project seems to need more than the level allows, **propose a level transition**; do not write at a higher level.

## 8. Extension Protocol

See §2.1. New domain addenda are added as stubs first; promote to full `DOMAIN_*.md` only when a second project needs the same concern.

## 9. Progressive Spec System

See `LEVELS.md` §6 for level-by-level spec requirements. This section defines lifecycle mechanics.

### 9.1 Two artifacts

`ROADMAP.md` is the execution map (milestone rows: status, why-1-liner, spec link, dependencies); `specs/` holds one file per milestone or decision.

### 9.2 Folder structure

```
specs/
├── 2026-01-01-template.md   # spec skeleton
├── decisions/               # decision records (ADR-style)
├── milestones/              # YYYY-MM-DD-p{phase}-m{nn}-{name}.md
└── _archive/                # completed + obsolete
```

Create `specs/milestones/` with the first milestone spec.

### 9.3 Stage lifecycle (`spec_stage:`)

`STUB`: title, objective, acceptance criteria, dependencies. `DRAFT`: full task envelope, reviewed. `ACTIVE`: implementation in progress. `COMPLETE`: outcome + lessons recorded; move to `_archive/`. `OBSOLETE`: superseded; move to `_archive/`.

### 9.4 Hard rule

Never execute against a spec below the level's required depth. L3 cannot implement from a STUB.

### 9.5 Spec optimisation

Specs are working documents, not historical records: rewrite them as implementation reveals the actual shape. Archive captures snapshots; live specs stay current.

### 9.6 Record-keeping cadence

**L1+:** touch the spec whenever the milestone is touched. **L2+:** weekly spec audit of DRAFT/ACTIVE specs for staleness, updating `updated`. **Level transitions:** audit all DRAFT specs: do any now need the new level's depth? **On completion:** spec must contain a retrospective section (planned vs actual, lessons, follow-ups) before archiving.

## 10. Reading Order

### 10.1 For agents

Task-conditional, defined in `CLAUDE.md` §1; skip docs whose `level:` exceeds the project's active level.

### 10.2 For humans

**5 minutes:** `ONBOARDING.md`, `ROADMAP.md`, the current `handoffs/` work item. **20 minutes:** add `DESIGN.md`, `QUALITY.md`. **60 minutes:** add the active-level doc(s) + active domain(s) + open specs. **Full context:** all active docs in order of `LEVELS.md` summary.

## 11. Public vs Private Doc Split

Operating docs, specs and engineering records are tracked, not private by default; the template ignore file excludes secrets and generated junk, not these docs. Disclosure rules: `CLAUDE.md` §11 (a private repository exempts nothing). Check the actual index and ignore rules; a section titled "private" protects nothing. Security documentation describes controls without publishing secrets.

## 12. Anti-Bloat Rules

Keep each doc within the validator's word budget (`scripts/validate.config.json`: warn 2000, fail 3000 words); trim or split before it warns. No cross-doc duplication: cite, don't copy. No running logs: time-bound info lives in the current `handoffs/` work item. Examples are illustrative, not the template; delete them when real content exists. No speculative sections: add content when needed, not when imagined. Audit at every level transition, splitting or trimming docs over the limit.

## 13. Paradigm Defaults

See `ENGINEERING.md` §0A "Paradigm Defaults" for coding style, structure and conventions.

## 14. When the System Itself Needs Updating

This file, `LEVELS.md`, and `TAXONOMY.md` are themselves subject to governance. Update when rules fail in practice, a new domain is needed, verbosity scaling is wrong, or spec lifecycle mechanics need refinement. Record reason and date. The level set itself is Stephen's decision (`_projects-admin/specs/2026-10-30-lifecycle-levels.md`): agents never add, split or reorder levels. If changes affect active projects, cascade: update `updated` on all affected docs.
