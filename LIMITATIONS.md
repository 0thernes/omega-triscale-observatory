# Limitations, Threats to Validity, and Real-vs-Metaphor Boundary

This document explicitly delineates what `omega-triscale-observatory` v6.8.0 **does** and **does not** establish (Build Standard `B41` and Playbook v1.3).

## 1. Real vs. Metaphor Boundary

| Element in UI / Code | What Is Computationally Real | What Is Strictly Visual Metaphor or Heuristic Indicator |
|---|---|---|
| `differential.chaosLyapunov` | Bounded `[0, 1]` sum of rolling telemetry step differences and Shannon entropies. | **NOT** a maximal Lyapunov exponent, phase-space divergence proof, or formal proof of mathematical chaos. |
| Tier 3 Internal Organs (`web/creature_gl.js`) | Synthesized deterministically from live integer counts (`parts`, `neurons`, `tiles`, `T2 active_axons`, `CPG`). | **NOT** physical 3D organ coordinates exported from `az_live.exe` (which `/api/inspect` does not provide). |
| Tier 4 Bio-FX ULTRA Shaders (`server.mjs`) | Real GLSL ES 3.00 fragment/vertex shaders injected client-side outside `#ifdef PICK`. | **NOT** physical biochemical skin membranes, iridescence physics, or state changes inside `Asmodensius-Native`. |
| Binomial Taxonomy (`web/taxonomy.js`) | Deterministic FNV-1a procedural Latinate labels derived from clade IDs, UIDs, and morphology ratios. | **NOT** phylogenetic cladistics or biological taxonomy recognized by ICZN/ICN. |
| Noetic Header Pill (`B14/14 · T10/10 · CQM25/25`) | Real HTTP JSON telemetry proxied from local `:8795`. | Strictly **indicator-only** computational diagnostics; **NOT** evidence of phenomenal consciousness or sentience. |
| Conservation Status Pill (`web/index.html`) | *"Upstream-reported residual and freshness gate"* checking reported residual fields are zero and fresh (`< 15 s`) with all required tiers online. | **NOT** an independent physical conservation solver inside the Hub itself. |
| Ecosystem Lean 4 Count (`327` upstream) | Sum of 6-kernel Lean 4.35.0 theorem counts reported by six formal sibling repositories (not audited in this repository). | **NOT** formally verifying `server.mjs`, `web/app.js`, or `macro_wild_relay.py` (this repo contains **0** Lean 4 files). |

## 2. Engineering & Experimental Limitations

1. **Local-Only Loopback Scope:** `server.mjs` binds strictly to `127.0.0.1` without TLS, user accounts, or rate-limiting middleware suitable for public internet exposure. Exposing port `8790` beyond loopback breaks the threat model (`docs/threat-model.md`).
2. **Absent-`Origin` CLI Behavior:** `isLoopbackOrigin` admits requests without an `Origin` header when `Host` is loopback so non-browser local CLI tools can connect; standard browsers always send `Origin` on cross-site `POST` and WebSocket `Upgrade` handshakes (tested directly in `Test 3` and `Test 3b`).
3. **Sibling Engine Availability & Mock Wire-Spy Scope:** Full 8-endpoint live supervision requires the 6 companion repositories built locally on disk. In standalone CI (`ubuntu-latest` / `windows-latest`) or clean-clone tests, `Test 5e` exercises live loopback HTTP/AZST traffic against ephemeral mock servers rather than live native `az_live.exe` binaries, and out-of-band operator controls (`live_macro_rates`, `sync_pause`, `respawn_cosmos`, `ignite_genesis`, `/proxy/macro/*`) remain separate operator-initiated channels.
4. **Headless WebGL2 Rendering Not Automated in CI:** `web/app.js` and `web/creature_gl.js` are verified via Node syntax checks (`node --check`), static lint, and shader-injection string/contract tests (`#ifdef PICK` preservation), not via headless Chromium GPU pixel-diffing in CI.
5. **Windows Bare-Metal Hardware Paths:** Flags such as `--ecores`, `--gpu 1` (RTX 5070 Ti CUDA PTX), and `--large-pages` are validated end-to-end as raw-input CLI contracts between Node and Python (`--dry-run`), while actual multi-core/GPU throughput depends on the host OS, privileges (`SeLockMemoryPrivilege` for large pages), and `az_live.exe`.
6. **Non-Peer-Reviewed Status:** Neither this repository nor its accompanying white paper (`dist/Donahue_2026_omega_triscale_observatory.pdf`) has undergone external peer review.
7. **Zero Mega-Atlas Retirements:** `0 / 1,900` overarching open problems in `0thernes/unsolved-problems-mega-atlas` are retired by this instrument (`docs/MEGA_ATLAS_CROSSCHECK.md`).
8. **Tests, Not Proofs (and Planted-Mutant Scope):** Every `program-audited` claim rests on example-based, live-socket, raw-input differential, and seeded-random tests plus a 9-mutant planted-regression audit (`7` in `lib/observatory_core.mjs`, `2` in `server.mjs`). That `9/9` result measures kill rate on nine targeted regression mutants, not an automated repo-wide mutation score over every arithmetic or UI line. This repository contains no Lean or other machine-checked proof of its own behavior.

## 3. Resolution Status of 2026-11-26 Statement Audit Gaps

All six test/code gaps and ten paper/metadata/CI items logged by the 2026-11-26 independent statement audit ([log](https://github.com/0thernes/0thernes-research-archive/blob/main/docs/reviews/2026-11-26-statement-audit.md)) were closed in `v6.8.0` (live `D7RO` wire-spy `Test 5e`, live raw-socket WS `Upgrade` `403`/`101` `Test 3b`, offline-engine `DEGRADED` `Test 5b`, 18-case raw-input Node↔Python differential parity `Test 6`, non-dirty deterministic `run_mutation_audit.mjs` with `9/9` killed across core + server, honest `web/index.html` pill title, corrected `bedau1998` + Crossref/DataCite title+author verifier, and `--verify-only` CI SLSA attestation covering the committed PDF & arXiv tarball). Full traceability is preserved in [`ERRATA.md`](ERRATA.md).
