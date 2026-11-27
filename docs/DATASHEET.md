<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# Datasheet for `omega-triscale-observatory` Verification & Telemetry Artifacts (`v6.8.0`)

> Structured according to Gebru et al. (2021), *"Datasheets for Datasets"*, Communications of the ACM 64(12).

---

## 1. Motivation

- **For what purpose were these artifacts created?** `omega-triscale-observatory` v6.8.0 is a zero-dependency Node.js ESM, Python 3, and WebGL 2.0 multi-scale Artificial Life cockpit supervising eight local endpoints across seven public repositories on `127.0.0.1:8790`. Its structured machine-readable artifacts (`results/mutation_audit.json`, `results/benchmarks.json`, `results/citation-audit.json`, `CHECKSUMS.sha256`, `data/MANIFEST.sha256`) document reproducible software verification, planted-mutant kill receipts, latency micro-benchmarks, and live Crossref/DataCite citation audits.
- **Who created and funded this artifact?** Independent researcher **Alexander Stephen Donahue** (`Independent Researcher, Spokane, WA, USA`; ORCID [`0009-0006-8168-9648`](https://orcid.org/0009-0006-8168-9648); `0_0@0thernes.art`), self-funded with zero external corporate or government sponsorship, with disclosed AI coding assistance under direct human direction and verification (`docs/AI_DISCLOSURE.md`).

## 2. Composition

- **What do the machine-readable artifacts contain?**
  1. `results/mutation_audit.json` — Deterministic audit receipt of **9 hand-planted regression mutants** (`M1`–`M9`: 7 in `lib/observatory_core.mjs`, 2 in `server.mjs`), each recording `id`, `file`, `description`, and `killed: true` (omitting volatile wall-clock timings so `npm run mutate` never dirties the working tree).
  2. `results/benchmarks.json` — Measured Node.js `v25.8.2` (`win32-x64`) latency distributions (`iterations`, `mean_ms`, `p50_ms`, `p95_ms`, `p99_ms`) across four deterministic core workloads (`computeDifferentialsCore`, `decodeAzstCreaturesCore` on 10,000 synthetic `AZST` creatures, `normalizeGenesisConfig + buildRelayArgs` for 1M bare-metal config, and `resolveSafePath`).
  3. `results/citation-audit.json` — Live verification audit of all **13 BibTeX entries** in `paper/refs.bib` (`10/10` DOIs verified for Handle reachability plus Crossref/DataCite title & author match with `0` retractions, `5/5` URLs verified HTTP 200 + page-title match, and `bedau1998` recorded cleanly as a print MIT Press proceedings chapter without a wrong DOI).
  4. `data/MANIFEST.sha256` & `CHECKSUMS.sha256` — LF-normalized SHA-256 integrity manifests covering core source files, tests, results, metadata, frozen PDF (`dist/Donahue_2026_omega_triscale_observatory.pdf`), and deterministic clean-room arXiv tarball (`dist/arxiv_submission.tar.gz`), dual-timestamped via DigiCert RFC 3161 (`CHECKSUMS.sha256.tsr`) and 3-calendar Bitcoin OpenTimestamps (`CHECKSUMS.sha256.ots`).
- **Does this repository contain personal, confidential, or sensitive data?** **No.** All data is synthetic/deterministic telemetry or public bibliographic metadata (`personal_data: false`).

## 3. Collection, Generation & Verification Process

- **How are artifacts produced?** Every JSON artifact is generated directly from executable zero-dependency scripts in `scripts/`:
  - `node scripts/run_mutation_audit.mjs --write` → `results/mutation_audit.json`
  - `node scripts/benchmark_observatory.mjs` → `results/benchmarks.json`
  - `python scripts/check_citations.py --write` → `results/citation-audit.json`
  - `python scripts/build_paper.py` → `dist/Donahue_2026_omega_triscale_observatory.pdf` + `dist/arxiv_submission.tar.gz`
  - `python scripts/stamp_timestamps.py --mint` → `CHECKSUMS.sha256.tsr` + `CHECKSUMS.sha256.ots`
- **Automated Verification Suites:** `14/14` Node.js `node:test` tests (including live raw-socket WebSocket `Upgrade` CSWSH `403`/`101`, live loopback `D7RO` wire-spy recording every request to mock Asmodensius, offline-engine `DEGRADED` conservation gate, `250` seeded `prop_check` trials, and `18` raw unnormalized Node↔Python differential parity cases) and `6/6` Python `unittest` tests (`120` seeded randomized trials).

## 4. Uses & Out-of-Scope Warnings

- **Recommended Uses:** Reproducible verification of multi-scale Artificial Life reverse-proxy supervision, security boundary auditing (CSRF/CSWSH/path-traversal), cross-language CLI normalization parity, and educational study of render-only observer conventions.
- **Explicit Out-of-Scope / Prohibited Misuses:**
  - Do **NOT** deploy `server.mjs` directly on public or untrusted networks; it is strictly a single-user loopback (`127.0.0.1:8790`) instrument.
  - Do **NOT** treat `differential.chaosLyapunov` as a mathematical maximal Lyapunov exponent or Tier 3 count-driven organ projections as physical anatomical coordinates (`LIMITATIONS.md`).
  - Do **NOT** represent the `9/9` planted-mutant audit as an exhaustive repo-wide mutation score or as formal proof (`0` local Lean 4 files; `0 / 1,900` Mega-Atlas open problems retired; preprint is **not peer-reviewed**).

## 5. Distribution & Maintenance

- **Distribution:** GitHub (`https://github.com/0thernes/omega-triscale-observatory`), GitHub Pages (`https://0thernes.github.io/omega-triscale-observatory/`), Software Heritage (`swh:1:snp:045edd61e0805b3778e40f5230062e8cc245bb60`), FAIR metadata (`croissant.json`, `ro-crate-metadata.json`, `codemeta.json`, `.zenodo.json`), and SLSA/Rekor build provenance via GitHub Actions.
- **Licensing:** Dual open license — **Apache-2.0** (`LICENSE`, `LICENSES/Apache-2.0.txt`) for code, scripts, JSON manifests, and CI; **CC-BY-4.0** (`LICENSE-DOCS`, `LICENSES/CC-BY-4.0.txt`) for white paper, PDFs, diagrams, and documentation (`REUSE.toml`).
- **Maintenance:** Actively maintained by Alexander Stephen Donahue (`0_0@0thernes.art`) via SemVer (`CHANGELOG.md`) and 10-class GitHub Issue forms.
