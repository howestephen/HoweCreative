---
status: dormant
author: stephen+claude
domain: fintech
level: applies at L1+
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:59Z
generated_from: conversation
---

# DOMAIN_FINTECH  -  Fintech / Money Movement Addendum

## Level overrides

All compliance-sensitive docs activate early:

- `security/` at **L1**
- `COMPLIANCE.md` at **L1 to L2**
- `LEGAL.md` at **L1 to L2**
- `INCIDENT_RESPONSE.md` at **L2**

## Deltas from base

### L1 additions

- Regulatory permission strategy decided **before** writing code (licence-required vs BaaS partner vs agent model)
- PCI-DSS scope minimised (Stripe Checkout, not custom forms)
- KYC/AML partner selected (Onfido, Sumsub, etc.)
- Explicit "not yet a money business until [trigger]" if prototype

### L2 additions

- PSD2 / Open Banking obligations (EU/UK)
- SCA (Strong Customer Authentication) flow designed
- Transaction monitoring primitive
- Audit log immutable from day one
- Reconciliation pipeline
- Fraud rules engine
- Chargeback / dispute handling
- Financial data reporting infrastructure

### L3 additions

- Full PCI-DSS compliance if handling card data
- EMI / money-service-business licensing if applicable
- Consumer credit obligations if lending
- SAR (Suspicious Activity Report) workflow

## Watchouts

- Licensing perimeters shift by jurisdiction and product shape
- Partner risk (BaaS providers can revoke, change terms)
- Customer funds segregation (safeguarding) obligations
- Sanctions screening (OFAC, EU, UK lists)
- **Do not launch fintech without legal review.** Non-negotiable.
