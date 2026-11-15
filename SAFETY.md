---
status: dormant
author: stephen+claude
activates: when user content, AI output to users, or external abuse surface exists
level: L3 (labelling), L4 (full)
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# SAFETY  -  Abuse Prevention and Content Safety

## Purpose (sketch)

Defines how the product prevents misuse, protects users from harm, and handles adversarial behaviour.

## Sections to populate when activated

- **Abuse surfaces:** list of actions users can take that could be misused
- **Content safety:** moderation approach, prohibited categories, action ladder (warn / mute / ban)
- **AI output safety:** content constraints on generated output, refusal patterns, unsafe-output detection
- **Rate and behaviour anomaly detection:** signals, thresholds, actions
- **Age gating:** if applicable (COPPA, UK AADC, EU AI Act minors)
- **Reporting mechanisms:** how users report, SLAs for response
- **Trust and safety runbook:** mirrors `INCIDENT_RESPONSE.md` for safety-specific incidents

## When to flesh out

Triggered by L3 entry (basics, including labelling of AI output shown to users); populated in full at L4. For games domain, may activate earlier (L2) for age rating obligations.
