---
name: systems-health
description: Audit this project's built systems (hooks, scripts, automations, docs) for health and dead weight. Use when asked to run a systems health check, pruning audit, or "is any of this still earning its keep". Report-only - recommends, never deletes.
status: active
author: stephen+claude
created: 2026-09-04
updated: 2026-11-10
---

# Systems health / pruning audit

You are auditing this project's own machinery: every hook, script,
automation, config and doc that was ever built here. The question for each
is the same: **does it still work, does it still run, and is it still worth
keeping?** (`_projects-admin/DECISIONS.md`, 2026-09-03: this audit exists because
built systems rot silently.)

## How to run it

1. **Gates first.** Run `<python> scripts/validate.py`, then the
   `scripts/selftest_*.py` suites through
   `<python> "<repos>/_projects-admin/scripts/heavy.py" run -- ...`, in the
   background. A failing gate or selftest is a FIX finding - the system is
   broken, not dead.
2. **Inventory.** List every script in `scripts/`, every scheduled/recurring
   job, every top-level doc.
3. **Evidence of life, per item** - never guess:
   - last meaningful change: `git log -1 --format=%cs -- <path>`
   - does anything reference it: grep the repo for its name
   - do logs show it firing (hook logs, job logs, if the project keeps them)
   - does its selftest exist and pass (a system without an adversarial test
     is itself a finding)
4. **Classify each item:**
   - **KEEP** - working, referenced or recently used
   - **FIX** - broken but wanted (failing test, stale doc, dead link)
   - **DECOMMISSION CANDIDATE** - nothing references it, logs show it never
     fires, or a newer system does its job (name the successor)
5. **Docs staleness:** any `status: active` doc whose `updated:` is more
   than ~90 days old gets a one-line "still true?" check against reality.

## Hard rules

- **Report-only. Never delete, disable or archive anything yourself.**
  Decommissioning is Stephen's decision; your output is the evidence-backed
  candidate list. Creative/media assets are never candidates at all.
- Every claim carries its evidence (path, date, grep count, log line).
  "Looks unused" without evidence is not a finding.
- Old and new implementations both alive is always a finding - one of them
  should win (house rule: reuse before writing new).
- Keep the report short: a table of items with class + one-line evidence,
  then a candidates section with what each candidate's removal would break.
