---
status: dormant
author: stephen+claude
activates: when processing personal data at scale, pre-public-launch, or domain forces earlier (fintech, health, B2B SaaS)
level: L3 (launch-gate scope), L4 (full)
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# COMPLIANCE  -  Privacy and Regulatory Obligations

## Purpose (sketch)

Captures the project's privacy and compliance controls across active markets.

## Sections to populate when activated

- **PII classification:** data categories, sensitivity tiers, who accesses what
- **Lawful basis per processing activity:** GDPR Art 6, LGPD, CCPA categories
- **Retention and deletion policies:** per data category
- **Subject access / erasure / portability workflows:** how requests are handled
- **Consent tracking:** storage, versioning, withdrawal
- **Audit logging requirements:** what must be immutable
- **Policy enforcement:** policy-as-code, CI gates, environment restrictions
- **Market-specific notes:** per active market (EU, UK, US state-by-state, LatAm)

Full per-market detail lives in `MARKET_MATRIX.md` at L5.

## When to flesh out

Triggered by L3 entry (launch-gate scope: privacy basics, lawful basis, retention, processors); populated in full at L4. Start with the markets declared in `ONBOARDING.md` → "Target Markets".
