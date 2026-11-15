---
status: dormant
author: stephen+claude
domain: games
level: applies at L1+
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T14:00Z
generated_from: conversation
---

# DOMAIN_GAMES  -  Games / Interactive Entertainment Addendum

## Level overrides

- `SAFETY.md` activates at **L2** (not L3) for age rating considerations
- Platform cert work surfaces at L2

## Deltas from base

### L1 additions

- Engine / stack choice (Unity, Unreal, Godot, web-native) documented
- Asset pipeline shape chosen (source control for binaries, compression, CDN)
- Target platforms declared (Steam, Apple, Google, consoles, web)

### L2 additions

- Playtesting protocol
- Build / cook / package pipeline formalised
- Asset size budgets
- Age rating application (PEGI, ESRB, IARC)  -  drives content rules
- Platform cert requirements (TRC for Nintendo, TCR for Xbox, TRC for PlayStation)
- Save / progression data strategy

### L3 additions

- Live ops infrastructure if multiplayer or service games
- IAP / monetisation compliance per platform
- Cheat / anti-fraud systems
- Privacy for in-game telemetry

## Paradigm overrides

- Class-based ECS patterns acceptable
- Frame-rate-aware code paths expected
- Different testing approach for gameplay vs systems code

## Watchouts

- Loot boxes: varying legal status (banned in some EU markets)
- Children's data: COPPA, UK AADC strict
- Platform revenue share and store policies
- Online safety duties under UK OSA for social features
