# ADR 0001: Pure Core Extraction, Render-Only `D7RO` Observer Isolation, Zero Runtime Dependencies, and Standalone Testability

- **Date:** 2026-11-25
- **Status:** Accepted
- **Author:** Alexander Stephen Donahue

## Context

Prior to v6.7.0, `server.mjs` combined pure security/telemetry logic with unconditional child-engine spawning and port `8790` listening at module top level, while `macro_wild_relay.py` required `Asmodensius-Native/demo/viewer_server.py` on disk before resolving arguments. This made cross-platform CI (`ubuntu-latest` + `windows-latest`), automated HTTP contract testing, differential testing, and surgical mutation auditing impossible without leaving background engine daemons running.

## Decision

1. **Pure Core Extraction (`lib/observatory_core.mjs`):** Extract all security boundary checks, `resolveSafePath`, Genesis `1..1,000,000` clamping, bare-metal flag assembly, AZST binary decoding, 112-trait spectral differentials, `<= 240` ring buffer enforcement, fail-closed conservation gating, and `D7RO` coupling-matrix calculation into a pure ES module with zero external dependencies.
2. **Testable Server & Relay Contracts:** Guard `server.mjs` startup behind `isMain` + `--no-engines`, add `GET /healthz`, export `server` for ephemeral `127.0.0.1:0` integration testing, and add `macro_wild_relay.py --dry-run` for cross-language differential verification without requiring sibling repositories on disk.
3. **Permanent `D7RO` Render-Only Observer Boundary:** Hard-code `{ m: "D7RO", s: 0 }` for all T1/T2 → T3/T4 matrix entries and preserve `#ifdef PICK` in Bio-FX shader injection, checked by automated tests of the displayed matrix and mutation kill `M3_D7RO_OBSERVER_VIOLATION`; no test records the hub's traffic to `:8794`, so the absence of T1/T2 writes into Asmodensius rests on code inspection.
4. **Honest Verification Scope:** Declare `formal: false` in `repo.yaml` (0 local Lean 4 files) while clearly distinguishing this instrument's automated software/mutation tests from the `327` upstream Lean 4 theorems reported by the six formal companion repositories.

## Consequences

- **Positive:** 100% reproducible clean-clone CI across Linux and Windows in seconds with zero external dependencies, `6/6` planted mutants killed (a kill rate for six hand-written mutants in `lib/observatory_core.mjs`, not a mutation score), and zero lingering daemons after test execution.
- **Trade-off:** Full 8-endpoint visual exploration still requires cloning and building the sibling repositories locally, while standalone mode (`--no-engines`) gracefully reports `DEGRADED` rather than false-green `VERIFIED`.
