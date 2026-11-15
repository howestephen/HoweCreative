---
status: active
author: stephen+claude
domain: consumer
level: L1+
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T14:00Z
generated_from: conversation
---

# DOMAIN_CONSUMER  -  Consumer App Addendum

Default domain for most projects. Uses the base level map  -  no overrides.

## Deltas from base

### L1 additions

- Mobile-first considered from day one (even if desktop is primary surface)
- Anonymous analytics from first usable build (wrapped in consent at L3)
- Feature-flag infrastructure chosen before first public build

### L2 additions

- Onboarding flow specified as its own milestone
- Retention signals instrumented early (not after launch)
- Growth loops documented in `DESIGN.md` when present
- Push notification infrastructure (if applicable)
- Mobile performance budgets (bundle size, time-to-interactive)
- Core Web Vitals tracked for web

### L3 additions

- Cookie banner + consent stack for EU users
- Standard consumer ToS / PP patterns
- Child protection if users may be under 18 (even occasionally)

## Watchouts

- App store terms if native apps shipped (Apple / Google)
- Push notification abuse and user-fatigue patterns
- Dark pattern avoidance  -  FTC, EU DSA obligations on deceptive design
