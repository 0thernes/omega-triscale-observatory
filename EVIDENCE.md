# Evidence Index (`EVIDENCE.md`)

Machine-verifiable evidence artifacts generated locally for `omega-triscale-observatory` v6.7.0 (zero fabricated results; every artifact corresponds to an executable script in this repository).

| Evidence Domain | Artifact Path | Producing Command | Verified Result (2026-11-25) |
|---|---|---|---|
| Node Unit, Live HTTP Contract, Property (`250` trials), Metamorphic & Differential Suite | `tests/test_observatory.mjs` | `npm test` | `12/12` PASS (`0` fail, `~2.5 s`, zero lingering processes) |
| Python Relay Unit & Property (`120` trials) Suite | `tests/test_relay.py` | `python -m unittest discover -s tests -v` | `5/5` PASS (`0.31 s`) |
| Static Syntax, Security & Hygiene Linter | `scripts/lint_check.mjs` | `npm run lint` | PASS (`9` JS/MJS + `2` Python targets, `0` errors) |
| Surgical Mutation Audit (`6` Planted Regressions) | `results/mutation_audit.json` | `npm run mutate` | `6/6` (`100.0%`) KILLED |
| Telemetry & Guard Micro-Benchmarks | `results/benchmarks.json` | `npm run bench` | `computeDifferentialsCore` `0.0804 ms` mean; `decodeAzstCreaturesCore` (10k) `4.5210 ms` mean |
| Live Bibliography Citation Verification | `paper/refs.bib` | `python scripts/check_citations.py` | `16/16` live URLs & DOIs verified HTTP 200 / DOI OK (`13` entries) |
| Zero-Overflow AMS-LaTeX White Paper & Clean-Room arXiv Tarball | `dist/Donahue_2026_omega_triscale_observatory.pdf`, `dist/arxiv_submission.tar.gz` | `python scripts/build_paper.py` | `0` Overfull `\hbox`, `0` undefined refs/citations, clean-room compile PASS |
| Build Standard v1.2.0 Audit | `repo.yaml`, `scripts/Audit-Repo.ps1` | `pwsh -NoProfile -File scripts/Audit-Repo.ps1` | `100.0%` Structure / `100.0%` Completion / `100.0%` Core |
| Cryptographic SHA-256 Manifest | `CHECKSUMS.sha256` | `just checksums` | Verified SHA-256 digests of core code, scripts, results, and frozen `dist/` |
