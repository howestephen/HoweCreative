---
status: dormant
author: stephen+claude
domain: marketplace
level: applies at L1+
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T14:00Z
generated_from: conversation
---

# DOMAIN_MARKETPLACE  -  Two-Sided Marketplace Addendum

## Level overrides

- `COMPLIANCE.md` activates at **L2** (KYC both sides, payout compliance)
- `LEGAL.md` activates at **L2** (terms for both sides, dispute handling)

## Deltas from base

### L1 additions

- Two-sided identity model (buyer vs seller, may be same user)
- Listing / product data model
- Discovery / search primitive

### L2 additions

- KYC for sellers (and buyers in high-risk categories)
- Escrow / held-funds pattern if applicable
- Payout infrastructure (Stripe Connect, etc.)
- Both-sides ToS drafts
- Dispute resolution workflow
- Trust signals (reviews, verification badges)
- Fraud monitoring
- Tax handling (marketplace facilitator rules in some US states)

### L3 additions

- DSA obligations (EU): content moderation, transparency reporting
- Consumer Rights Directive compliance (EU)
- Product liability flow-through

## Watchouts

- Marketplace tax facilitator rules vary wildly by jurisdiction
- Platform-to-Business Regulation (EU) if operators sell to other businesses
- Safe-harbour limits (Section 230 US, E-Commerce Directive EU)
- Anti-manipulation of reviews and rankings
