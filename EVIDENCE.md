# Evidence Index (`EVIDENCE.md`)

Machine-verifiable evidence artifacts generated locally for `omega-triscale-observatory` v6.8.0 (zero fabricated results; every artifact corresponds to an executable script in this repository).

| Evidence Domain | Artifact Path | Producing Command | Verified Result (2026-11-26) |
|---|---|---|---|
| Node Unit, Live HTTP, Raw-Socket WS CSWSH, Live `D7RO` Wire-Spy, Offline `DEGRADED`, `250` `prop_check` & `18`-Case Raw-Input Parity | `tests/test_observatory.mjs` | `npm test` | `14/14` PASS (`0` fail, `~7.2 s`, zero lingering processes) |
| Python Relay Unit, Raw Adversarial & Property (`120` trials) Suite | `tests/test_relay.py` | `python -m unittest discover -s tests -v` | `6/6` PASS (`0.32 s`) |
| Static Syntax, Security & Hygiene Linter | `scripts/lint_check.mjs` | `npm run lint` | PASS (`9` JS/MJS + `5` Python targets, `0` errors) |
| Planted-Regression Mutation Audit (`7` core + `2` server) | `results/mutation_audit.json` | `npm run mutate` | `9/9` KILLED (default run does not dirty `results/mutation_audit.json`) |
| Telemetry & Guard Micro-Benchmarks | `results/benchmarks.json` | `npm run bench` | `computeDifferentialsCore` `0.0504 ms` mean (`p95 0.1169 ms`); `decodeAzstCreaturesCore` (10k) `3.1278 ms` mean (`p95 4.1033 ms`) |
| Live Crossref/DataCite Title+Author Citation Audit | `results/citation-audit.json` | `python scripts/check_citations.py` | `13/13` BibTeX entries verified (`10/10` DOIs title+author match, `5/5` URLs page-title match, `1` print proceedings entry without wrong DOI, `0` retractions) |
| Zero-Overflow AMS-LaTeX White Paper & Clean-Room arXiv Tarball | `dist/Donahue_2026_omega_triscale_observatory.pdf`, `dist/arxiv_submission.tar.gz` | `python scripts/build_paper.py` | `0` Overfull `\hbox`, `0` undefined refs/citations, clean-room compile PASS; committed files attested via CI SLSA |
| Dual Cryptographic Timestamps (RFC 3161 + Bitcoin OTS) | `CHECKSUMS.sha256.tsr`, `CHECKSUMS.sha256.ots` | `python scripts/stamp_timestamps.py --verify` | DigiCert RFC 3161 TSA + 3-calendar Bitcoin OpenTimestamps cryptographically bind LF-normalized `CHECKSUMS.sha256` |
| Build Standard v1.2.0 Audit | `repo.yaml`, `scripts/Audit-Repo.ps1` | `pwsh -NoProfile -File scripts/Audit-Repo.ps1 -Path .` | `100.0%` Structure / `100.0%` Completion / `100.0%` Core |
| Cryptographic SHA-256 Manifests | `CHECKSUMS.sha256`, `data/MANIFEST.sha256` | `just checksums` | Verified SHA-256 digests of core code, scripts, results, FAIR metadata, and frozen `dist/` |
