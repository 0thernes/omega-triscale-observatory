# Changelog

All notable changes to `omega-triscale-observatory` are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [6.8.0] - 2026-11-26

### Added
- **Live Loopback `D7RO` Wire-Spy Test (`Test 5e`):** Added an ephemeral 4-server mock loopback harness (`mockMacro`, `mockMeso`, `mockMicro`, `mockNoetic`) in `tests/test_observatory.mjs` driving live `server.mjs` polling (`pollAsmodensiusSnapOnce`, `pollAsmodensiusFieldsOnce`) alongside T1/T2 state updates (`transfect`, `restraints`, `wave_mode`, `meso_pulse`, `env_solvent`, `cells_regime`, `micro_shock`, `cross_mutate_all4`) and recording every HTTP method, URL, and payload hitting mock Asmodensius — verifying zero non-`GET` T1/T2 writes and zero leaked T1/T2 bytes.
- **Live Raw-Socket WebSocket `Upgrade` CSWSH Tests (`Test 3b`):** Added raw TCP socket `Upgrade: websocket` tests verifying `HTTP/1.1 403 Forbidden` + socket destruction on foreign `Origin: https://evil.example` (`/ws` and `/proxy/macro/ws`) and non-loopback `Host: evil.example:8790`, plus positive `101 Switching Protocols` proxy verification on valid loopback `Host`/`Origin` and explicit absent-`Origin` CLI check.
- **Offline-Engine `DEGRADED` Conservation Gate Tests (`Test 5b`):** Explicitly verified `t1_dna = false`, `t2_cells = false`, and `t4_env = false` (with fresh timestamps and zero residuals) each strictly force `DEGRADED` (`conservationOk === false`), plus nonzero T1 DNA and T2 cellular residual `ALERT` checks.
- **Raw Unnormalized Adversarial Node↔Python Differential Parity (`Test 6`):** Replaced pre-normalized parity inputs with 18 raw unnormalized adversarial and seeded-random configurations (`n` in `{0, -5, 5000000, "NaN"}`, `cap = -10`, invalid presets, malformed grids, non-boolean hardware flags, negative/overflow 23-bit lesion masks) passed directly to BOTH Node `normalizeGenesisConfig` and Python `macro_wild_relay.py --dry-run`.
- **Expanded Planted-Regression Mutation Audit (`9/9`):** Added 3 mutants targeting the newly verified paths across BOTH `lib/observatory_core.mjs` (`M8_OFFLINE_CONSERVATION_FALSE_GREEN`) and `server.mjs` (`M7_WS_UPGRADE_CSWSH_BYPASS`, `M9_D7RO_WIRE_LEAK_SERVER`), bringing the deterministic audit to `9/9` killed (`7` core, `2` server).
- **Crossref/DataCite Title+Author Citation Audit (`results/citation-audit.json`):** Upgraded `scripts/check_citations.py` to check BOTH live reachability AND Crossref/DataCite title & author agreement plus retraction status across all `13/13` BibTeX entries (`10/10` DOIs + `5/5` URLs + `1` print proceedings entry, `0` retractions).
- **GitHub Pages Architecture & Verification Showcase (`docs/index.html` + `.github/workflows/pages.yml`):** Static WCAG 2.2 AA, strict-CSP, zero-CDN interactive showcase with client-side Genesis clamping sandbox, filterable Claims Ledger, and `9/9` mutation table.
- **Automated Tag Release Workflow (`.github/workflows/release.yml`):** Tag-triggered (`v*`) release packager with `SHA256SUMS` and `actions/attest-build-provenance@v2`.
- **FAIR Metadata, Datasheet, REUSE/SPDX & Dual Cryptographic Timestamps:** Added `croissant.json`, `ro-crate-metadata.json`, `codemeta.json`, `docs/DATASHEET.md`, `SUBMISSION_READINESS.md`, `REUSE.toml`, `LICENSES/Apache-2.0.txt`, `LICENSES/CC-BY-4.0.txt`, `data/MANIFEST.sha256`, `scripts/stamp_timestamps.py`, DigiCert RFC 3161 `CHECKSUMS.sha256.tsr`, and 3-calendar Bitcoin OpenTimestamps `CHECKSUMS.sha256.ots` (verified in CI).

### Fixed
- **Erroneous `bedau1998` DOI (`error`):** Dropped the erroneous DOI `10.7551/mitpress/1428.003.0028` (which resolved to Dellaert & Beer in *Artificial Life IV*) from `paper/refs.bib` and cited MIT Press *Artificial Life VI* (1998), edited by Adami et al., pp. 228–237, ISBN `978-0-262-51099-8`.
- **Raw-Input Node↔Python Clamping Divergences (`bug`):** Fixed three real parity bugs surfaced by raw adversarial testing in `macro_wild_relay.py` and `lib/observatory_core.mjs`: negative `--cap` (`raw_cap > 0` guard), `--lesion` clamping (`[0, 0x7FFFFF]`) vs modulo masking, and unified `parseBoolFlag`/`parse_bool_flag` + `clamp_int_raw` handling for non-boolean hardware flags, unknown presets, and malformed grids.
- **Non-Deterministic Mutation Audit Side Effect (`bug`):** Updated `scripts/run_mutation_audit.mjs` to omit volatile `elapsed_ms` from `results/mutation_audit.json` and stay strictly read-only unless `--write` is passed (`git diff --exit-code results/mutation_audit.json` enforced in CI).
- **UI Status Pill Title Overstatement (`error`):** Updated `web/index.html` line 26 `title` attribute from `"Live thermodynamic & observer-independence invariant verification across all 4 tiers"` to `"Upstream-reported residual and freshness gate"`.
- **CI SLSA Attestation Scope (`gap`):** Added `--verify-only` mode to `scripts/build_paper.py` so `.github/workflows/ci.yml` verifies zero-overflow compilation and clean-room arXiv rebuild without overwriting the committed `dist/Donahue_2026_omega_triscale_observatory.pdf`, ensuring `actions/attest-build-provenance@v2` attests BOTH the committed PDF and committed arXiv tarball.
- **Metadata & Paper Sync (`error`):** Fixed `CITATION.cff` `date-released` (`2026-11-26`), removed stale `244`/five-repo upstream Lean counts in `AGENTS.md` and `DEVIATIONS.md` (`327` across six formal sibling repos), recompiled zero-overflow v6.8.0 PDF & clean-room arXiv tarball, and updated `ERRATA.md` with full resolutions.

## [6.7.0] - 2026-11-25 (with 2026-11-26 statement audit)

### Changed (2026-11-26 statement audit documentation pass on `d2fbe46` & `1d5b54a`)
- Narrowed claims to match an independent statement audit of commit `bbe4da9` ([audit log](https://github.com/0thernes/0thernes-research-archive/blob/main/docs/reviews/2026-11-26-statement-audit.md)). `D7RO` was described as constant display cells, with the no-write-path result marked as code inspection; "100% mutation-verified metrology" was narrowed to "6/6 planted regression mutants in `lib/observatory_core.mjs` killed"; untested parts in `CLAIMS.md`, `docs/adr/0001`, and `docs/index.md` were explicitly disclosed; stale `244` figures were replaced with `327` across six; and the `bedau1998` DOI mismatch and reachability-only citation check were logged in `ERRATA.md`. (All code, test, bibliography, paper, and CI items from that audit are resolved in `v6.8.0` above.)

### Added
- Pure zero-dependency core module `lib/observatory_core.mjs` isolating all loopback CSRF/CSWSH predicates, `resolveSafePath` containment, Genesis `1..1,000,000` clamping, bare-metal relay CLI generation, AZST binary creature decoding, 112-trait spectral differentials, 8-axis cosine coherence, `<= 240` omnitemporal ring capping, fail-closed conservation gate, and `D7RO` matrix invariants.
- Full automated verification suite: `tests/test_observatory.mjs` (12 Node `node:test` suites including live ephemeral HTTP contract/traversal/CSRF tests, 250 deterministic `prop_check` trials, metamorphic 112-trait invariance, and Node↔Python differential parity), `tests/test_relay.py` (5 Python `unittest` suites including 120 randomized trials), `scripts/lint_check.mjs`, `scripts/run_mutation_audit.mjs` (6/6 planted mutants killed), and `scripts/benchmark_observatory.mjs`.
- Structured `GET /healthz` and `GET /api/health` observability endpoints on `server.mjs`, plus `--no-engines` / `OBSERVATORY_NO_ENGINES=1` standalone mode and `macro_wild_relay.py --dry-run`.
- Publication-grade AMS-LaTeX architecture white paper (`paper/main.tex`, `paper/refs.bib` with 13 primary academic references — 16/16 URLs/DOIs reachable in v6.7.0, with the `bedau1998` DOI mismatch fixed in v6.8.0 — TikZ 4-tier 8-endpoint architecture diagram, `scripts/build_paper.py`, `scripts/check_citations.py`, frozen `dist/Donahue_2026_omega_triscale_observatory.pdf`, clean-room verified `dist/arxiv_submission.tar.gz`).
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
