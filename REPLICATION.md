# Replication Protocol (`REPLICATION.md`)

This document provides exact clean-clone instructions to independently verify all tests, live raw-socket WS CSWSH checks, live loopback `D7RO` wire-spy checks, offline-engine `DEGRADED` checks, property trials, raw-input differential Node↔Python relay contracts, planted-mutant kills, telemetry micro-benchmarks, Crossref/DataCite citation audits, dual cryptographic timestamps, and Tectonic AMS-LaTeX PDF builds for `omega-triscale-observatory` v6.8.0.

## Prerequisites

- **Node.js:** `>= 22.0.0` (tested on `v25.8.2`; zero npm packages required)
- **Python:** `>= 3.12.0` (tested on `3.12` in CI and `3.13.15` locally; zero pip packages required)
- **Tectonic (optional, for PDF rebuild):** `>= 0.15.0` (tested on `0.17.0`)
- **OpenSSL (optional, for RFC 3161 minting):** `>= 3.0` (verification uses Python stdlib only)
- **PowerShell 7+ or Bash (optional, for Build Standard audit):** `pwsh` or `bash`

## Clean-Clone Step-by-Step Protocol

```bash
git clone https://github.com/0thernes/omega-triscale-observatory.git
cd omega-triscale-observatory

# Step 1: Node.js unit, live HTTP, raw-socket WS CSWSH, live D7RO wire-spy, offline DEGRADED, 250 prop_check & 18 raw-input parity tests
npm test

# Step 2: Python macro_wild_relay.py unit, raw adversarial & 120 randomized property tests
python -m unittest discover -s tests -v

# Step 3: Static syntax, security, determinism & identity hygiene lint
npm run lint

# Step 4: Isolated 9-mutant planted-regression audit (7 core + 2 server; non-dirty working tree)
npm run mutate
git diff --exit-code results/mutation_audit.json

# Step 5: Deterministic micro-benchmarks (writes results/benchmarks.json)
npm run bench

# Step 6: Live Crossref/DataCite title+author citation & URL audit (13/13 entries, 0 retractions)
python scripts/check_citations.py

# Step 7: Verify DigiCert RFC 3161 (.tsr) + Bitcoin OpenTimestamps (.ots) cryptographic timestamps
python scripts/stamp_timestamps.py --verify

# Step 8: Zero-overflow Tectonic AMS-LaTeX PDF + clean-room arXiv tarball verification
python scripts/build_paper.py --verify-only

# Step 9: Build Standard v1.2.0 repository audit (expects 100.0% / 100.0% / 100.0%)
pwsh -NoProfile -File scripts/Audit-Repo.ps1 -Path .
```

## Expected Verification Thresholds

- `npm test`: `14/14` pass, `0` fail, `0` lingering processes on port `8790`.
- `python -m unittest discover -s tests -v`: `6/6` pass.
- `npm run lint`: `0` errors across `9` JS/MJS + `5` Python targets.
- `npm run mutate`: `9/9` planted mutants killed (`7` core + `2` server), working tree clean (`git diff` empty).
- `python scripts/check_citations.py`: `13/13` BibTeX entries verified (`10/10` DOIs title+author match, `5/5` URLs page-title match, `1` print proceedings entry, `0` retractions).
- `python scripts/stamp_timestamps.py --verify`: PASS (both `.tsr` and `.ots` cryptographically bind `CHECKSUMS.sha256`).
- `python scripts/build_paper.py --verify-only`: `0` Overfull `\hbox`, `0` undefined refs/citations, clean-room arXiv compile passes.
- `scripts/Audit-Repo.ps1 -Path .`: Structure `100.0%`, Completion `100.0%`, Core `100.0%`, `0` placeholder files.

## Independent Replication Log

| Date | Replicator | Platform & Toolchain | Outcome | Notes |
|---|---|---|---|---|
| 2026-11-26 | Alexander Stephen Donahue (Author, self-audit) | Windows 11 x64, Node v25.8.2, Python 3.13.15, Tectonic 0.17.0, OpenSSL 3.5.9 | PASS (`14/14` Node, `6/6` Py, `9/9` Mutants, `13/13` Crossref/DataCite Citations, RFC 3161 + OTS verified, `0` TeX warnings) | v6.8.0 deep-hardening clean-room verification; external independent replication is openly invited via GitHub Issues (`replication` label). |
| 2026-11-25 | Alexander Stephen Donahue (Author, self-audit) | Windows 11 x64, Node v25.8.2, Python 3.12.10, Tectonic 0.17.0 | PASS (`12/12` Node, `5/5` Py, `6/6` Mutants, `0` TeX warnings) | v6.7.0 baseline (subsequently audited on 2026-11-26; see `ERRATA.md`). |
