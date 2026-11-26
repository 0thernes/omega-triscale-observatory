# Replication Protocol (`REPLICATION.md`)

This document provides exact clean-clone instructions to independently verify all tests, property checks, differential Node↔Python relay contracts, surgical mutation kills, telemetry micro-benchmarks, citation checks, and Tectonic AMS-LaTeX PDF builds for `omega-triscale-observatory` v6.7.0.

## Prerequisites

- **Node.js:** `>= 22.0.0` (tested on `v25.8.2`; zero npm packages required)
- **Python:** `>= 3.12.0` (tested on `3.12.10`; zero pip packages required)
- **Tectonic (optional, for PDF rebuild):** `>= 0.15.0` (tested on `0.17.0`)
- **PowerShell 7+ or Bash (optional, for Build Standard audit):** `pwsh` or `bash`

## Clean-Clone Step-by-Step Protocol

```bash
git clone https://github.com/0thernes/omega-triscale-observatory.git
cd omega-triscale-observatory

# Step 1: Node.js unit, live HTTP contract, 250 prop_check, metamorphic & differential tests
npm test

# Step 2: Python macro_wild_relay.py unit & 120 randomized property tests
python -m unittest discover -s tests -v

# Step 3: Static syntax, security, determinism & identity hygiene lint
npm run lint

# Step 4: Isolated 6-mutant surgical mutation audit (expects 6/6 = 100.0% killed)
npm run mutate

# Step 5: Deterministic micro-benchmarks (writes results/benchmarks.json)
npm run bench

# Step 6: Live citation DOI & URL verification (16/16 targets)
python scripts/check_citations.py

# Step 7: Zero-overflow Tectonic AMS-LaTeX PDF + clean-room arXiv tarball verification
python scripts/build_paper.py

# Step 8: Build Standard v1.2.0 repository audit (expects 100.0% / 100.0% / 100.0%)
pwsh -NoProfile -File scripts/Audit-Repo.ps1
```

## Expected Verification Thresholds

- `npm test`: `12/12` pass, `0` fail, `0` lingering processes on port `8790`.
- `python -m unittest discover -s tests -v`: `5/5` pass.
- `npm run lint`: `0` errors across 9 JS/MJS + 2 Python targets.
- `npm run mutate`: `6/6` (`100.0%`) mutants killed.
- `python scripts/check_citations.py`: `16/16` live URL/DOI checks OK.
- `python scripts/build_paper.py`: `0` Overfull `\hbox`, `0` undefined refs/citations, clean-room arXiv compile passes.
- `scripts/Audit-Repo.ps1`: Structure `100.0%`, Completion `100.0%`, Core `100.0%`, `0` placeholder files.

## Independent Replication Log

| Date | Replicator | Platform & Toolchain | Outcome | Notes |
|---|---|---|---|---|
| 2026-11-25 | Alexander Stephen Donahue (Author, self-audit) | Windows 11 x64, Node v25.8.2, Python 3.12.10, Tectonic 0.17.0 | PASS (12/12 Node, 5/5 Py, 6/6 Mutants, 16/16 Citations, 0 TeX warnings) | Author clean-room local verification; external independent replication is invited via GitHub Issues (`replication` label). |
