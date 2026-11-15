---
status: active
author: stephen+claude
level: ALL
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:59Z
generated_from: conversation
---

# TAXONOMY  -  Engineering Work Classification

This file defines the kinds of engineering work, how to classify them, and where they belong in workflows and roadmap planning.

Each category is annotated with the **level at which it becomes required**. Lower-level projects may touch categories at basic depth without full taxonomy discipline; higher levels enforce it.

## How agents should classify work

Classify every task by:

1. **Primary domain**  -  the main category below
2. **Secondary domains**  -  any affected adjacent categories
3. **Work type**  -  one of: `policy`, `refactor`, `test`, `ci`, `docs`, `security`, `migration`, `observability`, `cleanup`
4. **Scope**  -  one of: `local`, `module`, `cross-cutting`, `repo-wide`

## Part A  -  Code Health (L1 to L2)

### 1. Code Quality and Maintainability

**Level:** L1 (hard typing/style), L2 (folder audit, dedup, cross-module consistency)
**Label:** `code-quality`

**Includes:** strict TypeScript compliance, lint rule enforcement, cyclomatic complexity limits, file/module size limits, dead-code detection, unused-export detection, duplication detection, targeted refactors, removal of vestigial code paths.

**Typical outputs:** refactors, lint/config updates, quality guardrails, maintainability ADRs, code health follow-up tasks.

### 2. Testing and Verification

**Level:** L1 (smoke), L2 (unit, integration + contract)
**Label:** `testing-verification`

**Includes:** unit, integration, and contract tests; coverage thresholds; mutation testing for critical logic; property-based testing for parsers/validators/transforms; flaky test detection; regression prevention.

**Typical outputs:** tests, fixtures, test harness improvements, CI assertions, test strategy updates.

### 3. API and Contract Discipline

**Level:** L2
**Label:** `api-contracts`

**Includes:** OpenAPI generation, schema-to-contract alignment, request/response contract tests, response format guarantees, typed validation boundaries, compatibility enforcement across routes or services.

**Typical outputs:** schema updates, generated specs, contract tests, API consistency fixes, interface docs.

### 4. Data and Persistence Discipline

**Level:** L2 (basic migrations, reversibility, drift detection), L3 (retention stated)
**Label:** `data-persistence`

**Includes:** migration reversibility, down migrations, schema drift detection, retention logic, query-count budgets, DB access pattern review, persistence safety refactors.

**Typical outputs:** migration changes, database validation checks, query audits, persistence ADRs, storage safety tasks.

### 5. Security and Supply Chain Hardening

**Level:** L2 (dependency scanning, SBOM), L4 (deep integrity, lockfile verification)
**Label:** `security-supply-chain`

**Includes:** secret scanning, dependency scanning, SAST in CI, SBOM generation, integrity checks for third-party assets, lockfile verification, secure defaults in tooling and runtime paths.

**Typical outputs:** CI security checks, security policy updates, dependency hardening, remediation tasks, threat-reduction ADRs.

### 6. Build, CI, and Quality Gates

**Level:** L1 (basic), L2 (format + bundle budgets, required status checks)
**Label:** `build-ci-gates`

**Includes:** CI enforcement, build validation, format checks, bundle-size budgets, build-time budgets, required status checks, branch protection support work.

**Typical outputs:** CI config changes, gate definitions, failing-threshold policies, automation scripts, release quality controls.

### 7. Observability and Operational Reliability

**Level:** L2 (structured logging, metrics), L3 (error monitoring, uptime alert)
**Label:** `observability-reliability`

**Includes:** structured logging, typed log helpers, SLO definitions, trace correlation, consistent error reporting, error taxonomy rollout, runtime diagnostics improvements.

**Typical outputs:** logging utilities, metrics or tracing hooks, observability standards, incident-oriented follow-up tasks, reliability ADRs.

### 8. Developer Experience and Contributor Enablement

**Level:** L1+ (always)
**Label:** `developer-experience`

**Includes:** reproducible local development, seeded fixtures, local environment setup, editor settings and recommended extensions, PR templates, review checklists, Storybook and local component documentation, onboarding friction reduction.

**Typical outputs:** docs, local setup scripts, editor config, templates, onboarding guides, dev workflow improvements.

### 9. Repository Hygiene and Structure

**Level:** L2 (Launch-ready primary focus)
**Label:** `repo-hygiene`

**Includes:** moving misplaced files, directory normalisation, removing accidental artefacts, stale branch cleanup, root-level cleanup, naming consistency, archive policy enforcement.

**Typical outputs:** tree restructuring, repo housekeeping, archival changes, naming cleanups, hygiene checks.

### 10. Architecture and Cross-Cutting Standards

**Level:** L1+ (always)  -  depth scales with level
**Label:** `architecture-standards`

**Includes:** ADR creation and maintenance, error taxonomy design, shared patterns for handlers and composition, cross-route refactor programmes, global standards for validation/logging/error handling, architectural consistency work.

**Typical outputs:** ADRs, standards docs, shared utilities, cross-cutting refactor plans, rollout checklists.

### 11. Performance and Efficiency Governance

**Level:** L2+
**Label:** `performance-governance`

**Includes:** query-count budgets, route efficiency checks, build-time budgets, bundle-size budgets, hot-path review, cost-aware performance constraints.

**Typical outputs:** budgets, performance checks, route audits, benchmark tasks, optimisation follow-ups.

### 12. Refactor Backlog and Technical Debt

**Level:** L2+ (surfaces at Launch-ready and after)
**Label:** `technical-debt`

Work known to be desirable but not yet fully scoped or scheduled.

**Includes:** retry-loop cleanup, taxonomy migration rollout, partial refactors not yet generalised, legacy path deletion, post-milestone cleanup, follow-up debt from earlier phases.

**Typical outputs:** backlog items, scoped refactor tasks, debt registers, phased cleanup plans.

## Part B  -  Security, Compliance, and Safety (L2 to L4)

These categories become mandatory once systems handle user data, expose APIs publicly, operate continuously in production, or require auditability or compliance guarantees.

### 13. Identity, Authentication, and Access Control (IAM)

**Level:** L2 (auth and data-access rules tested), L4 (RBAC / ABAC, full)
**Label:** `iam-access-control`
**Home doc:** `security/SECURITY.md`

Controls over who can access what, and under which conditions.

**Includes:** authentication (OAuth, sessions, tokens), RBAC / ABAC permission systems, service-to-service authentication, least-privilege enforcement, credential scoping and expiry, access boundary definition.

### 14. Secrets and Key Management

**Level:** L1 (basics: no secrets in code), L4 (full lifecycle)
**Label:** `secrets-management`
**Home doc:** `security/SECURITY.md`

Secure lifecycle management of sensitive credentials.

**Includes:** secret storage (vaults, env separation), key rotation policies, scoped credentials (per service / env), preventing secret leakage in logs/errors, encryption key lifecycle.

### 15. Data Privacy and Compliance

**Level:** L3 (launch-gate scope), L4 (full)
**Label:** `data-privacy-compliance`
**Home doc:** `COMPLIANCE.md`

Legal handling of user and sensitive data.

**Includes:** PII classification, data minimisation, retention and deletion policies, subject access / deletion workflows, consent tracking, GDPR / UK GDPR / CCPA / LGPD alignment.

### 16. Data Security (At Rest and In Transit)

**Level:** L4
**Label:** `data-security`
**Home doc:** `security/SECURITY.md`

Protection of stored and transmitted data.

**Includes:** encryption at rest, TLS enforcement, field-level encryption, secure storage patterns, backup protection.

### 17. Runtime Security and System Hardening

**Level:** L2 (rate limiting on sign-in and payment routes), L4 (full)
**Label:** `runtime-security`
**Home doc:** `security/SECURITY.md`

Protection against attacks during execution.

**Includes:** rate limiting, abuse prevention, input sanitisation beyond typing, SSRF / injection protections, sandboxing and isolation, runtime policy enforcement.

### 18. Incident Response and Security Operations

**Level:** L3 (launch-gate scope), L4 (full)
**Label:** `security-operations`
**Home doc:** `INCIDENT_RESPONSE.md`

Handling of failures, breaches, and security events.

**Includes:** incident detection workflows, alerting and thresholds, response playbooks, escalation paths, postmortems, breach handling procedures.

### 19. Auditability and Compliance Evidence

**Level:** L4
**Label:** `audit-compliance`
**Home doc:** `COMPLIANCE.md`

Ability to prove system behaviour and decisions.

**Includes:** audit logs (immutable where required), traceability (who/what/when), compliance reporting, ADR-to-behaviour linkage, reproducible system state.

### 20. Policy Enforcement and Governance

**Level:** L4
**Label:** `policy-governance`
**Home doc:** `COMPLIANCE.md`

Formal, enforceable rules across systems and workflows.

**Includes:** policy-as-code (e.g. rule engines), CI enforcement of standards, runtime guardrails, environment restrictions (dev vs prod), compliance rule validation.

### 21. Safety and Abuse Prevention

**Level:** L3 (labelling), L4 (full)
**Label:** `safety-abuse-prevention`
**Home doc:** `SAFETY.md`

Protection against misuse, harmful outputs, or adversarial behaviour.

**Includes:** abuse detection and mitigation, content or output safety constraints, rate and behaviour anomaly detection, agent action restrictions, user misuse safeguards.

## Workflow Rules for Agents

### Agents should

Classify every task before making changes; identify whether it is local or cross-cutting; check whether an ADR or repo standard already governs the area; prefer existing patterns over inventing new ones; update tests, docs, and CI rules when the change affects them; note follow-on debt when full resolution is out of scope; separate functional changes from structural cleanup where possible.

### Agents should not

Mix unrelated refactors into a targeted task; widen scope without documenting why; add new patterns where an approved repo pattern exists; close a task while leaving silent contract, test, or docs drift; treat "tests exist" as equivalent to verification quality.

## Compact labels for tickets and planning

Use each category's `Label`.
