---
status: dormant
author: stephen+claude
domain: blockchain
level: applies at L1+
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:59Z
generated_from: conversation
---

# DOMAIN_BLOCKCHAIN  -  Blockchain / Smart Contracts Addendum

## Level overrides

- `security/` activates at **L1** (not L2)  -  smart contracts are live-code-in-production from day one
- `COMPLIANCE.md` activates at **L2** (not L3)  -  securities law, MiCA, KYC/AML cannot be retrofitted

## Deltas from base

### L1 additions

- Smart contract pattern choice (proxy / upgradeable / immutable)  -  decided in L0 discovery
- Foundry / Hardhat / equivalent tooling chosen at scaffold
- Local testnet setup before any implementation
- `security/` folder with threat model stub on day one

### L2 additions

- Comprehensive test coverage (unit + invariant + fork tests)
- Gas optimisation pass before testnet deploy
- Audit contact identified (internal or external)
- External audit before mainnet deploy (non-negotiable)
- Formal verification for critical invariants (if applicable)
- Bug bounty programme specification
- Pause / emergency stop mechanism designed

### Legal / compliance (L2+)

- Howey test analysis documented
- MiCA applicability (EU) if tokens involved
- KYC/AML if user deposits or withdrawals exist
- Tax treatment per jurisdiction

## Paradigm overrides (from `ENGINEERING.md` §0A)

- Solidity / Vyper / Rust conventions apply instead of TS style rules where relevant
- Foundry test style, not Jest
- No arrow-function equivalent in Solidity

## Watchouts

- Oracle risk (Chainlink etc.)
- Cross-chain bridge risk
- Upgrade key management
- Front-running and MEV
- Protocol-level regulatory drift (CFTC, SEC, FCA, BaFin)
