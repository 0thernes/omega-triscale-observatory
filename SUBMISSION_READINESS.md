<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# Submission Readiness Matrix — Defensible Independent AI Research Playbook v1.3

**Repository:** `0thernes/omega-triscale-observatory` (`v6.8.0`)  
**Author:** Alexander Stephen Donahue — Independent Researcher, Spokane, WA, USA · ORCID [`0009-0006-8168-9648`](https://orcid.org/0009-0006-8168-9648)  
**Assessment Date:** 2026-11-26  
**Scope Statement:** Independent systems-instrumentation software and technical architecture preprint. **Not externally peer-reviewed.** Contains **0 local Lean 4 files** (`formal: false`; `327` combined upstream 6-kernel Lean 4.35.0 proofs live in six formal sibling repositories). Zero (`0 / 1,900`) overarching [Unsolved Problems Mega-Atlas](docs/MEGA_ATLAS_CROSSCHECK.md) open problems are claimed solved or retired.

---

## Playbook v1.3 Readiness Checklist

| # | Playbook v1.3 Requirement | Status | Concrete Evidence / Artifact |
|---:|---|---|---|
| 1 | Dedicated public repository with clean git history on `main` | **DONE** | `https://github.com/0thernes/omega-triscale-observatory`, branch `main` |
| 2 | Dual open license (code + docs/preprint) & REUSE/SPDX | **DONE** | `LICENSE` (Apache-2.0), `LICENSE-DOCS` (CC-BY-4.0), `LICENSES/`, `REUSE.toml`, SPDX headers |
| 3 | Persistent author identity & ORCID (zero unformed LLC) | **DONE** | Alexander Stephen Donahue, Independent Researcher, ORCID `0009-0006-8168-9648` |
| 4 | Machine-readable citation & FAIR metadata | **DONE** | `CITATION.cff` (`v6.8.0`), `CITATION.bib`, `.zenodo.json`, `codemeta.json`, `croissant.json`, `ro-crate-metadata.json` |
| 5 | Transparent AI-assistance disclosure & CRediT | **DONE** | `docs/AI_DISCLOSURE.md`, `README.md`, `paper/main.tex` Sec. 9.3 |
| 6 | Honest claim-boundary & real-vs-metaphor limitations | **DONE** | `LIMITATIONS.md`, `CLAIMS.md` (`C1`–`C10`), `docs/statement-fidelity.md`, `ERRATA.md` |
| 7 | Explicit falsification criteria ("what would prove us wrong") | **DONE** | `CLAIMS.md` refutation column + 9 planted regression mutants (`M1`–`M9`) |
| 8 | Formal-proof scope honesty (`formal: false`) | **N/A (DISCLOSED)** | `0` local Lean 4 files declared honestly in `repo.yaml`, `DEVIATIONS.md` (`D1`), `README.md`, `paper/main.tex` |
| 9 | Pinned toolchains & zero runtime dependencies | **DONE** | `package.json`, `package-lock.json`, `requirements.txt` (zero npm/pip runtime deps) |
| 10 | Live HTTP contract & negative security tests | **DONE** | `tests/test_observatory.mjs` (`Test 2c, 3, 3b`): path traversal, CSRF, SSE Host, live raw-socket WS `Upgrade` `403`/`101` |
| 11 | Live loopback `D7RO` wire-spy test | **DONE** | `tests/test_observatory.mjs` (`Test 5e`): ephemeral mock Asmodensius socket asserts 0 T1/T2 writes |
| 12 | Offline-engine `DEGRADED` conservation gate tests | **DONE** | `tests/test_observatory.mjs` (`Test 5b`): `t1_dna`, `t2_cells`, `t4_env` offline -> `DEGRADED`, never false-green |
| 13 | Deterministic property-based testing (`prop_check`) | **DONE** | `250` seeded Node trials (`tests/test_observatory.mjs`) + `120` seeded Python trials (`tests/test_relay.py`) |
| 14 | Cross-language raw-input differential oracle | **DONE** | `tests/test_observatory.mjs` (`Test 6`): `18` raw unnormalized adversarial inputs passed directly to Node & Python `--dry-run` |
| 15 | Planted-regression mutation audit (non-dirty working tree) | **DONE** | `scripts/run_mutation_audit.mjs` — `9/9` killed (`7` in `lib/observatory_core.mjs`, `2` in `server.mjs`); `results/mutation_audit.json` deterministic |
| 16 | Metamorphic & golden invariant tests | **DONE** | `tests/test_observatory.mjs` (`Test 5a, 5c, 5d`): 112-trait antisymmetry/shift/clamp, `#ifdef PICK`, `AZST` binary decode |
| 17 | Cross-platform CI (`ubuntu-latest` + `windows-latest`) | **DONE** | `.github/workflows/ci.yml` + report-only `gitleaks`, `ruff`, `mypy`, and Build Standard v1.2.0 `100.0%` audit |
| 18 | Deterministic telemetry micro-benchmarks | **DONE** | `scripts/benchmark_observatory.mjs`, `results/benchmarks.json`, `docs/benchmarks.md` |
| 19 | Live Crossref/DataCite title+author citation & retraction audit | **DONE** | `scripts/check_citations.py` + `results/citation-audit.json` (`13/13` entries verified; `bedau1998` wrong DOI removed; `0` retractions) |
| 20 | Publication-grade AMS-LaTeX preprint PDF (`0` overfull/undef) | **DONE** | `paper/main.tex` → `dist/Donahue_2026_omega_triscale_observatory.pdf` via Tectonic (`0` warnings) |
| 21 | Deterministic clean-room arXiv tarball (`mtime=0`, USTAR) | **DONE** | `dist/arxiv_submission.tar.gz` verified via clean-room Tectonic rebuild locally and in CI |
| 22 | Static WCAG 2.2 AA Architecture & Verification Showcase (Pages) | **DONE** | `docs/index.html` (strict CSP, zero CDN) + `.github/workflows/pages.yml` (`https://0thernes.github.io/omega-triscale-observatory/`) |
| 23 | Datasheet & data checksum manifest | **DONE** | `docs/DATASHEET.md`, `data/MANIFEST.sha256`, `CHECKSUMS.sha256` |
| 24 | Dual cryptographic timestamps (RFC 3161 + Bitcoin OTS) | **DONE** | `scripts/stamp_timestamps.py`, `CHECKSUMS.sha256.tsr` (DigiCert TSA), `CHECKSUMS.sha256.ots` (3 Bitcoin OTS calendars), verified in CI |
| 25 | SLSA / Sigstore Rekor build provenance on committed PDF & tarball | **DONE** | `.github/workflows/ci.yml` (`--verify-only` preserves committed PDF) & `.github/workflows/release.yml` (`actions/attest-build-provenance@v2`) |
| 26 | Software Heritage archival snapshot | **DONE** | `swh:1:snp:045edd61e0805b3778e40f5230062e8cc245bb60` |
| 27 | Clean-clone replication protocol & dated audit trail | **DONE** | `REPLICATION.md`, `docs/run-log.md`, `HARDENING_LOG.md`, `docs/reviews/2026-11-25-10-pass-red-team-audit.md` |
| 28 | Open-problem crosswalk with explicit anti-hype discipline | **DONE** | `docs/MEGA_ATLAS_CROSSCHECK.md` (`0 / 1,900` overarching problems retired) |
| 29 | External submission gates (arXiv / Zenodo / JOSS) | **READY (MANUAL)** | arXiv tarball ready pending endorser; Zenodo deposit ready via `.zenodo.json` (human click required; zero fabricated DOIs) |
| 30 | External independent human replication | **OPEN (INVITED)** | Clean-clone protocol & SHA-256 anchors published; third-party replication openly invited via `REPLICATION.md` |
