---
status: dormant
author: stephen+claude
activates: when commercial availability is approaching or real incidents could happen
level: L3 (launch-gate scope), L4 (full)
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# INCIDENT_RESPONSE  -  Detection, Playbooks, Breach Handling

## Purpose (sketch)

Defines how the project detects, responds to, communicates, and learns from incidents.

## Sections to populate when activated

- **Severity ladder:** SEV1 to SEV4 definitions
- **Detection sources:** alerts, monitoring, user reports
- **On-call expectations:** (if solo, state "no on-call" explicitly)
- **Playbooks:**
  - service down
  - data breach
  - credential compromise
  - third-party provider outage
  - AI provider outage / rate-limit
- **Communication templates:** status page, customer email, regulator notification (if applicable)
- **Breach notification timeframes:** per regulation (GDPR 72h, etc.)
- **Post-mortem template:** blameless, lessons, follow-ups
- **Incident log:** index of past incidents (link to `security/_archive/` post-mortems)

## When to flesh out

Triggered by L3 entry (launch-gate scope: error monitoring, uptime alert, incident contact); populated in full at L4. Prioritise the playbooks for the 3 to 5 most plausible incidents first.
