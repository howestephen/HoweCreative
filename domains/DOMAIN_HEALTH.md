---
status: dormant
author: stephen+claude
domain: health
level: applies at L1+
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T14:00Z
generated_from: conversation
---

# DOMAIN_HEALTH  -  Health / Clinical-Adjacent Addendum

## Level overrides

- `security/` at **L1** (health data is always sensitive)
- `COMPLIANCE.md` at **L1 to L2** (HIPAA, UK DSPT, LGPD health category)
- `SAFETY.md` at **L2** (clinical safety obligations surface early)

## Deltas from base

### L1 additions

- Classification decided **before** coding: wellness app vs clinical tool vs medical device
- Medical Device Regulation (MDR, EU) classification if clinical
- HIPAA scope (if US)  -  are you a Covered Entity or Business Associate?
- UK DSPT (Data Security and Protection Toolkit) applicability if NHS-adjacent

### L2 additions

- Encryption at rest from day one for all health data
- Access logs immutable from day one
- BAAs (Business Associate Agreements) for any US sub-processor handling PHI
- Clinical safety case (DCB0129 / DCB0160) if UK NHS deployment
- Safety hazard log
- Human-in-the-loop for any AI-driven clinical insight

### L3 additions

- Medical device certification if product crosses into regulated territory
- Post-market surveillance
- Adverse event reporting
- Clinical evidence generation

## Watchouts

- Classification drift: "wellness tool" can become "medical device" with feature changes
- HIPAA breach notification (60 days)
- GDPR special-category data (Article 9) processing basis
- FDA (US) / MHRA (UK) / EMA (EU) oversight thresholds
- **Do not launch health products without legal + clinical review.** Non-negotiable.
