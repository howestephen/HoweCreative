---
status: dormant
author: stephen+claude
domain: b2b_saas
level: L1+
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:59Z
generated_from: conversation
---

# DOMAIN_B2B_SAAS  -  B2B SaaS Addendum

## Level overrides

- Full `security/` activates at **L2** (not L4)  -  B2B customers demand security answers early
- `COMPLIANCE.md` activates at **L2** (not L3)  -  SOC2, DPAs, customer audits come with first enterprise deals

## Deltas from base

### L1 additions

- Multi-tenancy model chosen (schema-per-tenant, row-level, separate DB)
- Admin console sketched even if primitive
- Environment isolation boundaries defined

### L2 additions

- SSO readiness (SAML, OIDC)
- RBAC beyond IAM (tenant admin vs regular user vs support staff)
- Basic audit log for tenant admin actions
- SOC2 prep (controls defined, evidence collection started)
- Customer-specific DPAs
- Data export / portability for customer data
- Service-level commitments

### L3 additions

- SOC2 audit
- ISO 27001 if demanded
- Penetration testing cadence
- Customer-facing trust page (status, subprocessors, certifications)

## Watchouts

- Customer audit obligations can dominate engineering time  -  budget accordingly
- DPAs: each enterprise deal may amend your template; track drift
- Multi-region data residency expectations from enterprise customers
