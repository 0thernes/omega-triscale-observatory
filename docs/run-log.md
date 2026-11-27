# Verification Run Log (`docs/run-log.md`)

Chronological audit trail of verified local execution runs for `omega-triscale-observatory` (`B40`).

## Run 2026-11-26 — v6.8.0 Cycle 1 Deep Hardening Verification

- **Host:** Windows 11 x64 (`Z:\[Vibe Coded (AI)]\ANTIGRAVITY\omega-triscale-observatory`)
- **Toolchains:** Node.js `v25.8.2`, Python `3.13.15`, Tectonic `0.17.0`, OpenSSL `3.5.9`, PowerShell 7

| Step | Command | Result | Key Metrics |
|---|---|---|---|
| 1 | `node --test tests/test_observatory.mjs` | **PASS** | `14/14` tests pass (`7,197 ms`), live raw-socket WS CSWSH `403`/`101`, live loopback `D7RO` wire-spy, offline-engine `DEGRADED`, `250` `prop_check`, `18` raw-input Node↔Python parity cases, `0` lingering processes |
| 2 | `python -m unittest discover -s tests -v` | **PASS** | `6/6` tests pass (`0.315 s`), `120` seeded randomized relay trials + raw adversarial clamping |
| 3 | `node scripts/lint_check.mjs` | **PASS** | `9` JS/MJS + `5` Python targets, `0` errors |
| 4 | `node scripts/run_mutation_audit.mjs` | **PASS** | `9/9` planted regression mutants killed (`7` in `lib/observatory_core.mjs`, `2` in `server.mjs`); SHA-256 of `results/mutation_audit.json` unchanged (`004B3A54...`, zero working-tree drift) |
| 5 | `node scripts/benchmark_observatory.mjs` | **PASS** | `computeDifferentialsCore` `0.0504 ms` mean (`p95 0.1169 ms`); `decodeAzstCreaturesCore` (10k) `3.1278 ms` mean (`p95 4.1033 ms`); saved to `results/benchmarks.json` |
| 6 | `python scripts/check_citations.py --write` | **PASS** | `13/13` BibTeX entries verified (`10/10` DOIs Handle + Crossref/DataCite title `1.00` + author match, `5/5` URLs HTTP 200 + page-title match, `bedau1998` wrong DOI removed, `0` retractions); saved to `results/citation-audit.json` |
| 7 | `python scripts/build_paper.py` & `--verify-only` | **PASS** | `0` Overfull `\hbox`, `0` undefined refs/citations; frozen `dist/Donahue_2026_omega_triscale_observatory.pdf` + clean-room verified `dist/arxiv_submission.tar.gz` |
| 8 | `python scripts/stamp_timestamps.py --mint` & `--verify` | **PASS** | DigiCert RFC 3161 (`CHECKSUMS.sha256.tsr`) + 3-calendar Bitcoin OpenTimestamps (`CHECKSUMS.sha256.ots`) verified |
| 9 | `pwsh -NoProfile -File scripts/Audit-Repo.ps1 -Path .` | **PASS** | `100.0%` Structure / `100.0%` Completion / `100.0%` Core (`0` fails, `0` partials, `0` unknowns, `0` placeholders) |

## Run 2026-11-25 — v6.7.0 Full Upgrade & 3-Cycle Hardening Verification

- **Host:** Windows 11 x64 (`Z:\[Vibe Coded (AI)]\ANTIGRAVITY\omega-triscale-observatory`)
- **Toolchains:** Node.js `v25.8.2`, Python `3.12.10`, Tectonic `0.17.0`, PowerShell 7

| Step | Command | Result | Key Metrics |
|---|---|---|---|
| 1 | `node --test tests/test_observatory.mjs` | **PASS** | `12/12` tests pass (`2,537 ms`), `250` `prop_check` trials, live ephemeral HTTP + Node↔Python parity, `0` lingering processes |
| 2 | `python -m unittest discover -s tests -v` | **PASS** | `5/5` tests pass (`0.312 s`), `120` seeded randomized relay trials |
| 3 | `node scripts/lint_check.mjs` | **PASS** | `9` JS/MJS + `2` Python targets, `0` errors |
| 4 | `node scripts/run_mutation_audit.mjs` | **PASS** | `6/6` planted mutants in `lib/observatory_core.mjs` killed (`M1`..`M6`), saved to `results/mutation_audit.json` |
| 5 | `node scripts/benchmark_observatory.mjs` | **PASS** | `computeDifferentialsCore` `0.0804 ms` mean; `decodeAzstCreaturesCore` (10k) `4.5210 ms` mean; saved to `results/benchmarks.json` |
| 6 | `python scripts/check_citations.py` | **PASS** | `13` BibTeX entries, `16/16` URLs & DOIs reachable (`HTTP 200` / `DOI OK (200)`); reachability only: the `bedau1998` DOI resolved to a different chapter (fixed in v6.8.0, see `ERRATA.md`) |
| 7 | `python scripts/build_paper.py` | **PASS** | `0` Overfull `\hbox`, `0` undefined refs/citations; frozen `dist/Donahue_2026_omega_triscale_observatory.pdf` + clean-room verified `dist/arxiv_submission.tar.gz` |
| 8 | `pwsh -NoProfile -File scripts/Audit-Repo.ps1` | **PASS** | `100.0%` Structure / `100.0%` Completion / `100.0%` Core (`0` fails, `0` partials, `0` unknowns, `0` placeholders) |
