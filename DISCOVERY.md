---
status: active
author: stephen+claude
level: L0
updated: 2026-11-14
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# DISCOVERY  -  L0 Explore Toolkit

A toolkit for L0 (Explore), not a required sequence. At L0 Stephen and the agent talk the idea through and make things freely (LEVELS.md §3). The agent offers a section below when it would help, or uses one when asked, and suggests writing down what was learned and decided as the idea firms up.

When Stephen decides to build, the agent writes a short note of what was learned and the direction chosen (and a first spec if none exists yet). The level-activation forecast below is useful at that point.

## How to use a section

Pick the sections that help, in any order. For each, the agent asks the prompts, pushes back on vague answers (Mom Test discipline), and notes the outcome. The "Record as" lines are suggestions, not requirements.

**Mom Test discipline:**

- Ask about the user's life, not opinions about your idea
- Ask about specifics in the past, not generics about the future
- Talk less, listen more
- Refuse to let the user describe features before problems

## 1. Problem Framing (JTBD)

Frame the work as a Job-to-be-Done.

- What job is this product being hired for?
- What is the user doing today instead?
- When does the job arise? What triggers it?
- What does "getting the job done well" look like from the user's side?

Record as a decision: `specs/decisions/D001-problem-framing.md`.

## 2. User Shape

Proto-persona + Jobs Stories.

- Who specifically? Describe one concrete person, not a demographic.
- Not who? State explicitly who this product is NOT for.
- Jobs stories format: **When** [situation], **I want to** [motivation], **so I can** [outcome].

Record as: `specs/decisions/D002-target-user.md`.

## 3. Value and Differentiation

Value Proposition Canvas.

- What pains does this relieve? (Be specific; avoid generic "pain points".)
- What gains does this create? (Beyond pain relief  -  what new wins?)
- What alternatives exist today? (Including doing nothing.)
- Why this, over those alternatives? One sentence.

Record as: `specs/decisions/D003-value-proposition.md`.

## 4. Lean Canvas (one-pager)

Fill nine blocks (Ash Maurya).

1. Problem  -  top 1 to 3
2. Customer segments  -  early adopters specifically
3. Unique value proposition  -  single message
4. Solution  -  top 1 to 3 features
5. Channels  -  how users reach you
6. Revenue streams  -  how money flows
7. Cost structure  -  dominant costs
8. Key metrics  -  what you'll watch
9. Unfair advantage  -  hard to copy

Record as: `specs/decisions/D004-lean-canvas.md`.

## 5. PR-FAQ (Amazon working-backwards)

Write the launch press release you want to publish.

- Headline
- Sub-headline
- Opening paragraph (what, for whom, why it matters)
- 3 customer quotes
- 3 anticipated FAQ answers

Rule: if the release is boring, kill the idea. Refine until someone would care enough to read it.

Record as: `specs/decisions/D005-pr-faq.md`.

## 6. Future-Risk Surfacing

Pull this forward now so L2 to L5 don't surprise you later. Answer explicitly:

- **User geographies:** UK? EU? US (which states)? LatAm? APAC? Global?
- **User ages:** Any users under 18? Under 13? Implications for COPPA / UK AADC?
- **Data sensitivity:** Health? Financial? Biometric? Special-category GDPR?
- **Monetisation model:** Free? Subscription? Transactional? Marketplace? Ads? Affiliate?
- **AI usage:** Dev-only? Content generation? User-facing feature? Automated decisions?
- **Regulated domain:** Fintech, health, children, games, marketplace, adult, anything else?
- **Jurisdictions where data will be stored:** Self-hosted? US cloud? EU cloud? Multi-region?
- **Risk tolerance:** Side-project, bootstrap, venture-backed, regulated customer? Shapes how much compliance cost you can absorb.

Record as: `specs/decisions/D006-future-risk.md`.

This section drives the **level-activation forecast**  -  which levels will be forced earlier than the base map (see `LEVELS.md` §4 Domain Axis and `domains/`).

## 7. Shape the Build (Shape Up pitch)

Basecamp-style shaping.

- **Appetite:** How much time are you willing to spend? (e.g. 2 weeks, 6 weeks, one quarter)
- **Solution sketch:** Rough shape of the thing (not wireframes  -  shape).
- **Rabbit holes:** Known traps. Explicitly off-limits.
- **No-gos:** Features or directions you will not pursue even if tempting.

Record as: `specs/decisions/D007-shape.md`.

## 8. Success Definition

North Star Metric + HEART.

- **North Star:** single metric that proves the product is working for users
- **HEART dimensions:** Happiness, Engagement, Adoption, Retention, Task success  -  one tracked per dimension if useful
- **Explicit failure signal:** what would tell you to stop?

Record as: `specs/decisions/D008-success.md`.

## Leaving L0

When Stephen decides to build:

1. Populate `ONBOARDING.md`:
   - Project name, one-line description, primary user, primary problem, core promise
   - **Current Level:** L1 (Stephen has decided to build)
   - Active Domains (from §6 future-risk)
   - Target Markets (from §6)
   - Current stage: build

2. Produce a **level-activation forecast**  -  based on §6 answers, state which levels will likely be forced early:
   - "Fintech detected → `security/` and `COMPLIANCE.md` will activate at L1 to L2"
   - "EU users + AI features → `AI_COMPLIANCE.md` is worked through before the launch gate at L3, not left to L4"
   - "No regulated surface → default level map applies"

3. Hand off to L1: write the short note of what was learned and the direction chosen in the current `handoffs/` work item, plus a first spec if none exists. Start the first L1 milestone.

4. When no longer needed, mark this file `status: archived` with `note: answered - YYYY-MM-DD` and move it to `_archive/`.

## When to revisit

Decision records stay live in `specs/decisions/` until superseded. If a decision is revisited:

- The old one gets `status: superseded` + link to the new one, then moves to `specs/_archive/`
- A new decision record takes the next sequential ID
