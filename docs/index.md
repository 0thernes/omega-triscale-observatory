# Documentation Index (`docs/index.md`)

Complete technical documentation for **OMEGA 4-Tier Multi-Scale Observatory v6.7.0**.

## Architecture & Design
- [System Architecture](architecture.md) — 4-tier, 8-endpoint topology, loopback reverse proxy, SSE/WebSocket fan-out, and `D7RO` render-only isolation.
- [Architecture Decision Records](adr/README.md) — [ADR 0001: Architecture & Verification Boundaries](adr/0001-architecture-and-verification-boundaries.md).
- [Configuration Reference](configuration.md) — Environment variables, ports, Genesis Studio bare-metal flags (`1..1,000,000`), and `macro_wild_relay.py` CLI options.
- [Threat Model (STRIDE)](threat-model.md) — Loopback CSRF/CSWSH defenses, canonical path containment, and bounded resource caps.

## Verification, Metrology & Audits
- [Verification Strategy](verification.md) — Node/Python test suites, `prop_check`, metamorphic/golden tests, Node↔Python differential parity, and `6/6` surgical mutation audit.
- [Benchmarks & Performance Budgets](benchmarks.md) — Real measured telemetry & guard latencies (`results/benchmarks.json`).
- [Statement Fidelity Audit](statement-fidelity.md) — Exact mapping from claims and white-paper equations to code symbols and automated tests.
- [Mega-Atlas Non-Retirement Cross-Check](MEGA_ATLAS_CROSSCHECK.md) — Explicit `0 / 1,900` non-retirement accounting (`AI-045`, `SYS-009`, `SYS-050`).
- [10-Pass Red-Team Audit & 3-Cycle Hardening Review](reviews/2026-11-25-10-pass-red-team-audit.md).
- [Verification Run Log](run-log.md) — Timestamped local execution audit trail.

## Operations, Governance & Reference
- [Operations, Backups & Offsite Mirror](operations.md) — Startup, clean process-tree reaping, git bundle backups, and mirror sync.
- [AI-Assistance Disclosure & CRediT](AI_DISCLOSURE.md) — Transparent disclosure of AI tool usage and human verification accountability.
- [FAQ](faq.md) — Common questions on standalone mode, `D7RO`, Lean counts, and bare-metal toggles.
- [Glossary](glossary.md) — Definitions of all 10 Build Standard finding classes and observatory domain terms.
