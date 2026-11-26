# Verification Run Log (`docs/run-log.md`)

Chronological audit trail of verified local execution runs for `omega-triscale-observatory` v6.7.0 (`B40`).

## Run 2026-11-25 — v6.7.0 Full Upgrade & 3-Cycle Hardening Verification

- **Host:** Windows 11 x64 (`Z:\[Vibe Coded (AI)]\ANTIGRAVITY\omega-triscale-observatory`)
- **Toolchains:** Node.js `v25.8.2`, Python `3.12.10`, Tectonic `0.17.0`, PowerShell 7

| Step | Command | Result | Key Metrics |
|---|---|---|---|
| 1 | `node --test tests/test_observatory.mjs` | **PASS** | `12/12` tests pass (`2,537 ms`), `250` `prop_check` trials, live ephemeral HTTP + Node↔Python parity, `0` lingering processes |
| 2 | `python -m unittest discover -s tests -v` | **PASS** | `5/5` tests pass (`0.312 s`), `120` seeded randomized relay trials |
| 3 | `node scripts/lint_check.mjs` | **PASS** | `9` JS/MJS + `2` Python targets, `0` errors |
| 4 | `node scripts/run_mutation_audit.mjs` | **PASS** | `6/6` (`100.0%`) planted surgical mutants killed (`M1`..`M6`), saved to `results/mutation_audit.json` |
| 5 | `node scripts/benchmark_observatory.mjs` | **PASS** | `computeDifferentialsCore` `0.0804 ms` mean; `decodeAzstCreaturesCore` (10k) `4.5210 ms` mean; saved to `results/benchmarks.json` |
| 6 | `python scripts/check_citations.py` | **PASS** | `13` BibTeX entries, `16/16` live URLs & DOIs verified (`HTTP 200` / `DOI OK (200)`) |
| 7 | `python scripts/build_paper.py` | **PASS** | `0` Overfull `\hbox`, `0` undefined refs/citations; frozen `dist/Donahue_2026_omega_triscale_observatory.pdf` + clean-room verified `dist/arxiv_submission.tar.gz` |
| 8 | `pwsh -NoProfile -File scripts/Audit-Repo.ps1` | **PASS** | `100.0%` Structure / `100.0%` Completion / `100.0%` Core (`0` fails, `0` partials, `0` unknowns, `0` placeholders) |
