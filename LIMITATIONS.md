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
| Ecosystem Lean 4 Count (`327` upstream) | Sum of audited 6-kernel Lean 4.35.0 theorems reported by six formal sibling repositories. | **NOT** formally verifying `server.mjs`, `web/app.js`, or `macro_wild_relay.py` (this repo contains **0** Lean 4 files). |

## 2. Engineering & Experimental Limitations

1. **Local-Only Loopback Scope:** `server.mjs` binds strictly to `127.0.0.1` without TLS, user accounts, or rate-limiting middleware suitable for public internet exposure. Exposing port `8790` beyond loopback breaks the threat model (`docs/threat-model.md`).
2. **Sibling Engine Availability:** Full 8-endpoint live supervision requires the 6 companion repositories built locally on disk. In standalone CI (`ubuntu-latest` / `windows-latest`) or clean-clone tests, tests verify the Hub HTTP/core/relay contracts directly without launching external C/CUDA binaries.
3. **Headless WebGL2 Rendering Not Automated in CI:** `web/app.js` and `web/creature_gl.js` are verified via Node syntax checks (`node --check`), static lint, and shader-injection string/contract tests (`#ifdef PICK` preservation), not via headless Chromium GPU pixel-diffing in CI.
4. **Windows Bare-Metal Hardware Paths:** Flags such as `--ecores`, `--gpu 1` (RTX 5070 Ti CUDA PTX), and `--large-pages` are validated end-to-end as CLI contracts between Node and Python (`--dry-run`), while actual multi-core/GPU throughput depends on the host OS, privileges (`SeLockMemoryPrivilege` for large pages), and `az_live.exe`.
5. **Non-Peer-Reviewed Status:** Neither this repository nor its accompanying white paper (`dist/Donahue_2026_omega_triscale_observatory.pdf`) has undergone external peer review.
6. **Zero Mega-Atlas Retirements:** `0 / 1,900` overarching open problems in `0thernes/unsolved-problems-mega-atlas` are retired by this instrument (`docs/MEGA_ATLAS_CROSSCHECK.md`).
