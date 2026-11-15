---
status: dormant
author: stephen+claude
activates: when project handles PII, authenticated users, sensitive data, or public API surface
level: L2 (basics), L4 (full)
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# SECURITY  -  Internal Security Posture

This is the internal security doc. The OSS responsible-disclosure `SECURITY.md` at repo root is a different file.

## Purpose (sketch)

Defines the project's security posture: identity, secrets, data protection, runtime hardening.

## Sections to populate when activated

- **Identity and access (IAM):** auth model, RBAC/ABAC, service-to-service auth, least privilege
- **Secrets and keys:** storage, rotation, scoping, leakage prevention
- **Data at rest and in transit:** encryption, TLS, field-level encryption, backup protection
- **Runtime hardening:** rate limiting, input sanitisation beyond typing, SSRF/injection protection, sandboxing
- **Threat model:** documented in `security/threat-models/`
- **Audit log index:** inventory of audits in `security/audits/`

## When to flesh out

At L2 activation, populate the basics: auth and data-access rules tested, secrets out of code, rate limits on sign-in and payment routes. At L4 activation, run the Level Transition Playbook and populate each section above with the project's real controls. Keep each section ≤ 1 page.
