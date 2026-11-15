---
status: dormant
author: stephen+claude
activates: when user-facing AI features, synthetic content generation, or automated decisions exist
level: L3 (labelling), L4 (full)
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:57Z
generated_from: conversation
---

# AI_COMPLIANCE  -  AI Regulatory Obligations

## Purpose (sketch)

Captures AI-specific regulatory obligations distinct from general privacy. Separate from `COMPLIANCE.md` because the obligations, regulators, and risk models differ.

## AI usage classification (declared at project start)

Pick the highest-risk bucket that applies:

- `dev-tooling-only`  -  AI used only for developer productivity; low legal burden
- `content-generation`  -  AI produces graphics/video/audio users see; labelling + IP obligations
- `user-facing-features`  -  AI features inside the product (chatbots, summarisers); disclosure obligations
- `automated-decisions`  -  AI makes consequential decisions (hiring, credit, eligibility); highest burden

## Sections to populate when activated

- **EU AI Act tier:** Prohibited / High-Risk / Limited-Risk (most consumer apps) / Minimal-Risk
- **Transparency / disclosure:** where users are told they're interacting with AI
- **Synthetic content labelling:** visible mark + C2PA metadata on AI-generated media
- **Training data provenance:** what models used, disclosed per California AB 2013 + EU AI Act
- **Automated decision-making:** GDPR Art 22 compliance, human-review path
- **Model cards / system documentation:** per active model
- **Incident reporting:** EU AI Act serious-incident reporting obligations

## Regional snapshot

- **EU AI Act:** fully in force from August 2026; penalties up to 7% global turnover
- **US:** state patchwork (California, Colorado AI Act from Feb 2026, others); FTC enforcement on deceptive AI
- **LatAm:** Brazil AI Bill (PL 2338/2023) mirrors EU risk tiers; others earlier-stage

## When to flesh out

Triggered by L3 entry (labelling of AI output shown to users); populated in full at L4, or earlier if EU users and AI features combine. Classification determines obligation depth.
