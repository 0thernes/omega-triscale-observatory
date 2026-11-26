# Changelog

All notable changes to `omega-triscale-observatory` are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [6.7.0] - 2026-11-25

### Added
- Pure zero-dependency core module `lib/observatory_core.mjs` isolating all loopback CSRF/CSWSH predicates, `resolveSafePath` containment, Genesis `1..1,000,000` clamping, bare-metal relay CLI generation, AZST binary creature decoding, 112-trait spectral differentials, 8-axis cosine coherence, `<= 240` omnitemporal ring capping, fail-closed conservation gate, and `D7RO` matrix invariants.
- Full automated verification suite: `tests/test_observatory.mjs` (12 Node `node:test` suites including live ephemeral HTTP contract/traversal/CSRF tests, 250 deterministic `prop_check` trials, metamorphic 112-trait invariance, and Node↔Python differential parity), `tests/test_relay.py` (5 Python `unittest` suites including 120 randomized trials), `scripts/lint_check.mjs`, `scripts/run_mutation_audit.mjs` (6/6 = 100.0% surgical mutation kills), and `scripts/benchmark_observatory.mjs`.
- Structured `GET /healthz` and `GET /api/health` observability endpoints on `server.mjs`, plus `--no-engines` / `OBSERVATORY_NO_ENGINES=1` standalone mode and `macro_wild_relay.py --dry-run`.
- Publication-grade AMS-LaTeX architecture white paper (`paper/main.tex`, `paper/refs.bib` with 13 primary academic references / 16/16 live-verified URLs & DOIs, TikZ 4-tier 8-endpoint architecture diagram, `scripts/build_paper.py`, `scripts/check_citations.py`, frozen `dist/Donahue_2026_omega_triscale_observatory.pdf`, clean-room verified `dist/arxiv_submission.tar.gz`).
- Full Build Standard for LLMs v1.2.0 scaffolding: dual open licensing (`LICENSE` Apache-2.0 / `LICENSE-DOCS` CC-BY-4.0), `NOTICE`, `THIRD_PARTY_NOTICES.md`, `CITATION.cff`, `CITATION.bib`, `.zenodo.json`, `CLAIMS.md`, `LIMITATIONS.md`, `REPLICATION.md`, `DEVIATIONS.md`, `ERRATA.md`, `EVIDENCE.md`, `HARDENING_LOG.md`, `ROADMAP.md`, `SECURITY.md`, `SUPPORT.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `UPGRADING.md`, `justfile`, `repo.yaml`, `CHECKSUMS.sha256`, `.github/` issue forms & cross-platform informational CI, `docs/` suite, `examples/`, and 10-pass red-team audit.

### Fixed
- **Path Traversal & Query Validation (`hole`/`bug`):** Replaced prefix-only `startsWith` check with canonical `path.relative` + NUL-byte + drive-letter/UNC rejection in `resolveSafePath`; added strict integer validation returning HTTP `400` on invalid `/api/stack/shape/:clade` and `/api/stack/env-slice?z=`.
- **Genesis UI Hydration (`bug`):** Updated `populateGenesisForm()` in `web/app.js` to synchronize bare-metal hardware checkboxes (`genKernels`, `genEcores`, `genPrefetch`, `genGpu`) from server state.
- **Version, Proof-Count & Toolchain Drift (`error`):** Harmonized stale `v6.3` / `162` / `v1.2` / `16 Lean` / `v6.5.0` / `v6.6.0` / C11-compiler copy-paste errors across `web/app.js`, `web/index.html`, `README.md`, `AGENTS.md`, `HANDOFF.md`, `CLAUDE.md`, and `server.mjs` to `v6.7.0`.
- **Legal/Identity Hygiene (`problem`):** Standardized author affiliation strictly to `Independent Researcher, Spokane, WA, USA` with zero `0thernes LLC` occurrences across active files and metadata.

## [6.6.0] - 2026-11-22

### Added
- Bare-metal `1..1,000,000` Genesis population controls (`100`/`1k`/`10k`/`100k` step buttons), `24C (8P+16E)` `--ecores`, `AVX2/VNNI` `--kernels`, `DDR5 PF` `--prefetch`, `RTX 5070 Ti CUDA PTX` `--gpu`, and `--large-pages` relay flags.
- Dual Asmodensius visual world supervision (`:8794` WebGL2 3D + `:8796` native `az_view`) with in-hub `W1:GL2` ⇄ `W2:az_view` switcher.

## [6.5.0] - 2026-11-21

### Added
- Expanded 4-tier hub supervision to include `Noetic Organism Omega` (`:8795`) and `Cellular Engine Omega` (`:8791`) alongside `AUTOPHAGE` (`:8787`), `Cellulogonic Mecha` (`:8788`), `Asmodensius-Native` (`:8794`), and `Zeta-Omega Atlas` (`/zeta-omega/`).
