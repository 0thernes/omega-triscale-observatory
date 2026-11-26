# Limitations, Threats to Validity, and Real-vs-Metaphor Boundary

This document explicitly delineates what `omega-triscale-observatory` v6.7.0 **does** and **does not** establish (Build Standard `B41` and Playbook v1.3).

## 1. Real vs. Metaphor Boundary

| Element in UI / Code | What Is Computationally Real | What Is Strictly Visual Metaphor or Heuristic Indicator |
|---|---|---|
| `differential.chaosLyapunov` | Bounded `[0, 1]` sum of rolling telemetry step differences and Shannon entropies. | **NOT** a maximal Lyapunov exponent, phase-space divergence proof, or formal proof of mathematical chaos. |
| Tier 3 Internal Organs (`web/creature_gl.js`) | Synthesized deterministically from live integer counts (`parts`, `neurons`, `tiles`, `T2 active_axons`, `CPG`). | **NOT** physical 3D organ coordinates exported from `az_live.exe` (which `/api/inspect` does not provide). |
| Tier 4 Bio-FX ULTRA Shaders (`server.mjs`) | Real GLSL ES 3.00 fragment/vertex shaders injected client-side outside `#ifdef PICK`. | **NOT** physical biochemical skin membranes, iridescence physics, or state changes inside `Asmodensius-Native`. |
| Binomial Taxonomy (`web/taxonomy.js`) | Deterministic FNV-1a procedural Latinate labels derived from clade IDs, UIDs, and morphology ratios. | **NOT** phylogenetic cladistics or biological taxonomy recognized by ICZN/ICN. |
| Noetic Header Pill (`B14/14 · T10/10 · CQM25/25`) | Real HTTP JSON telemetry proxied from local `:8795`. | Strictly **indicator-only** computational diagnostics; **NOT** evidence of phenomenal consciousness or sentience. |
| Ecosystem Lean 4 Count (`327` upstream) | Sum of 6-kernel Lean 4.35.0 theorem counts reported by six formal sibling repositories (not audited in this repository). | **NOT** formally verifying `server.mjs`, `web/app.js`, or `macro_wild_relay.py` (this repo contains **0** Lean 4 files). |

## 2. Engineering & Experimental Limitations

1. **Local-Only Loopback Scope:** `server.mjs` binds strictly to `127.0.0.1` without TLS, user accounts, or rate-limiting middleware suitable for public internet exposure. Exposing port `8790` beyond loopback breaks the threat model (`docs/threat-model.md`).
2. **Sibling Engine Availability:** Full 8-endpoint live supervision requires the 6 companion repositories built locally on disk. In standalone CI (`ubuntu-latest` / `windows-latest`) or clean-clone tests, tests verify the Hub HTTP/core/relay contracts directly without launching external C/CUDA binaries.
3. **Headless WebGL2 Rendering Not Automated in CI:** `web/app.js` and `web/creature_gl.js` are verified via Node syntax checks (`node --check`), static lint, and shader-injection string/contract tests (`#ifdef PICK` preservation), not via headless Chromium GPU pixel-diffing in CI.
4. **Windows Bare-Metal Hardware Paths:** Flags such as `--ecores`, `--gpu 1` (RTX 5070 Ti CUDA PTX), and `--large-pages` are validated end-to-end as CLI contracts between Node and Python (`--dry-run`), while actual multi-core/GPU throughput depends on the host OS, privileges (`SeLockMemoryPrivilege` for large pages), and `az_live.exe`.
5. **Non-Peer-Reviewed Status:** Neither this repository nor its accompanying white paper (`dist/Donahue_2026_omega_triscale_observatory.pdf`) has undergone external peer review.
6. **Zero Mega-Atlas Retirements:** `0 / 1,900` overarching open problems in `0thernes/unsolved-problems-mega-atlas` are retired by this instrument (`docs/MEGA_ATLAS_CROSSCHECK.md`).
7. **Tests, Not Proofs:** Every `program-audited` claim rests on example-based and seeded-random tests plus a 6-mutant planted-regression audit. They cover only the sampled and hand-written cases. This repository contains no Lean or other machine-checked proof of its own behaviour.

## 3. Test-Coverage Gaps Found by the 2026-11-26 Statement Audit

An independent statement audit ([log](https://github.com/0thernes/0thernes-research-archive/blob/main/docs/reviews/2026-11-26-statement-audit.md)) re-ran all suites at commit `bbe4da9` and found them passing, with these gaps:

1. **`D7RO` is checked as a display constant.** The four T1/T2-to-T3/T4 coupling cells are literals in `computeDifferentialsCore` (`lib/observatory_core.mjs`); test 5b and mutant `M3` check that literal. No test records what `server.mjs` sends to the Asmodensius port (`:8794`). By inspection the hub sends only rate, pause/run, inspect and relaunch commands and proxies browser traffic there, but this is not automated.
2. **WebSocket `upgrade` wiring is untested.** The `isLoopbackHost` / `isLoopbackOrigin` predicates are unit-tested, including a foreign-origin rejection, but no test sends an `Upgrade` request. `isLoopbackOrigin` admits a request with no `Origin` header.
3. **`DEGRADED`-on-offline is untested.** Test 5b covers `ALERT` and stale data (`DEGRADED`), not an offline required tier.
4. **Node↔Python parity uses normalized inputs.** Test 6 normalizes 3 configurations in Node and passes the result to `macro_wild_relay.py --dry-run`; raw-input clamping is not compared across languages.
5. **Mutation scope.** All 6 planted mutants are in `lib/observatory_core.mjs`; none touches `server.mjs` or the metric arithmetic.
6. **Paper provenance.** The CI SLSA attestation covers the CI-rebuilt PDF and the arXiv tarball; the committed PDF bytes (`66470ab3...`) differ from the CI-built PDF, so only the tarball hash matches an attested artifact.
