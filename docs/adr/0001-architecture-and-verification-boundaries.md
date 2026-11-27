# ADR 0001: Pure Core Extraction, Render-Only `D7RO` Observer Isolation, Zero Runtime Dependencies, and Standalone Testability

- **Date:** 2026-11-25 (amended 2026-11-26 for v6.8.0)
- **Status:** Accepted
- **Author:** Alexander Stephen Donahue

## Context

Prior to v6.7.0, `server.mjs` combined pure security/telemetry logic with unconditional child-engine spawning and port `8790` listening at module top level, while `macro_wild_relay.py` required `Asmodensius-Native/demo/viewer_server.py` on disk before resolving arguments. This made cross-platform CI (`ubuntu-latest` + `windows-latest`), automated HTTP/WS contract testing, differential testing, and planted-mutant auditing impossible without leaving background engine daemons running. In v6.8.0 (following the 2026-11-26 independent statement audit), `server.mjs` was further refined to expose configurable `PORTS` and single-tick Asmodensius pollers so live loopback wire-spy and raw-socket WebSocket CSWSH tests execute directly against the server without sibling binaries.

## Decision

1. **Pure Core Extraction (`lib/observatory_core.mjs`):** Extract all security boundary checks, `resolveSafePath`, Genesis `1..1,000,000` clamping + `parseBoolFlag`, bare-metal flag assembly, AZST binary decoding, 112-trait spectral differentials, `<= 240` ring buffer enforcement, fail-closed conservation gating, and `D7RO` coupling-matrix calculation into a pure ES module with zero external dependencies.
2. **Testable Server & Relay Contracts:** Guard `server.mjs` startup behind `isMain` + `--no-engines`, add `GET /healthz`, export `server`, configurable `PORTS`, and single-tick pollers (`pollAsmodensiusSnapOnce`, `pollAsmodensiusFieldsOnce`) for ephemeral `127.0.0.1:0` HTTP, raw-socket WS `Upgrade`, and live loopback wire-spy testing; add raw-input parity (`clamp_int_raw`, `parse_bool_flag`) and `--dry-run` to `macro_wild_relay.py`.
3. **Permanent `D7RO` Render-Only Observer Boundary:** Fix `{ m: "D7RO", s: 0 }` for all displayed T1/T2 → T3/T4 matrix entries (`Test 5b`, `M3`), preserve `#ifdef PICK` in Bio-FX shader injection (`Test 5c`), and verify on the live loopback wire (`Test 5e`, `M9`) that polling and T1/T2 coupling actions emit zero non-`GET` writes and zero T1/T2 bytes to mock Asmodensius (strictly read-only `POST /api/inspect {"uid":...}` on specimen lock; operator cadence/pause/relaunch commands remain separate out-of-band operator paths).
4. **Honest Verification Scope:** Declare `formal: false` in `repo.yaml` (0 local Lean 4 files) while clearly distinguishing this instrument's automated software tests and `9/9` planted-mutant kill rate from formal proofs and from the `327` upstream Lean 4 theorems reported by the six formal companion repositories.

## Consequences

- **Positive:** 100% reproducible clean-clone CI across Linux and Windows in seconds with zero external dependencies, `14/14` Node + `6/6` Python tests, `9/9` planted mutants killed (`7` in `lib/observatory_core.mjs`, `2` in `server.mjs` — a kill rate for nine hand-written regression mutants, not an automated repo-wide mutation score), and zero lingering daemons after test execution.
- **Trade-off:** Full 8-endpoint visual exploration still requires cloning and building the sibling repositories locally, while standalone mode (`--no-engines`) gracefully reports `DEGRADED` rather than false-green `VERIFIED` (tested directly for offline `t1_dna`, `t2_cells`, and `t4_env` in `Test 5b` and mutant `M8`).
