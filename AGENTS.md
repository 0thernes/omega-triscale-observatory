# AGENTS.md — OMEGA 4-Tier Multi-Scale Observatory (v6.8.0)

> Canonical agent instructions for `0thernes/omega-triscale-observatory` (`CLAUDE.md`, `GEMINI.md`, and `.cursor/rules/build-standard.mdc` all point here).

## Purpose & Honest Scope

`omega-triscale-observatory` is a **zero-dependency Node.js ESM, Python 3, and WebGL 2.0 multi-scale Artificial Life cockpit** supervising **8 live local endpoints across 7 public repositories** on `http://127.0.0.1:8790/`.

- **Author:** Alexander Stephen Donahue (`Independent Researcher, Spokane, WA, USA`, ORCID `0009-0006-8168-9648`, `0_0@0thernes.art`). Never attach an unformed LLC corporate suffix.
- **Dual License:** Apache-2.0 (`LICENSE`, `LICENSES/Apache-2.0.txt`) for all code, scripts, and CI; CC-BY-4.0 (`LICENSE-DOCS`, `LICENSES/CC-BY-4.0.txt`) for white paper, PDFs, diagrams, and documentation (`REUSE.toml`).
- **Honest Verification Boundary:** This repository is strictly a visualization, reverse-proxy, telemetry-metrology, and process-orchestration instrument. It contains **0 local Lean 4 files** (upstream formal proofs live in six formal sibling repositories: `48` `autophage` + `70` `cellulogonic-mecha` + `89` `cellular-engine-omega` + `54` `noetic-organism-omega` + `30` `asmodensius-native` + `36` `alife-singularity-omega-package` = `327` combined upstream 6-kernel Lean 4.35.0 theorems audited in their own repos) and retires **0 / 1,900** overarching open problems in `0thernes/unsolved-problems-mega-atlas`. Preprint is **not externally peer-reviewed**.
- **Render-Only Observer Independence (`D7RO`):** Never introduce any live T1/T2 write path into `Asmodensius-Native` (`:8794` / `:8796`), and never modify code inside `#ifdef PICK` shader blocks when injecting Bio-FX overlays. Guarded by live loopback wire-spy test `5e` and planted mutants `M3` & `M9`.

## Hard Rules (Build Standard v1.2.0, R1–R8)

- **R1–R2:** Commit and push directly to `main`. No pull requests, no feature branches, no git hooks, no commit/tag signing.
- **R3:** CI (`.github/workflows/ci.yml`) is informational on every push to `main` and release tag `v*`.
- **R4:** Banned files — never add `.github/dependabot.yml`, `renovate.json`, `PULL_REQUEST_TEMPLATE*`, `.github/copilot-instructions.md`, or `FUNDING.yml`.
- **R5:** Keep `AGENTS.md` under 32 KiB. Never leave template placeholder or unfilled-todo markers anywhere in tracked files.
- **R6:** Never fabricate numbers, test outcomes, citations, DOIs, or peer-review claims. Every number in docs and `paper/main.tex` must match a real command run.
- **R7:** Classify every hardening or audit finding into exactly one of the 10 classes: `bug`, `error`, `issue`, `problem`, `concern`, `dilemma`, `conflict`, `gap`, `hole`, `blindspot`.
- **R8:** On Windows paths containing brackets (`Z:\[Vibe Coded (AI)]\...`), ALWAYS pass `-LiteralPath` to PowerShell file cmdlets.
- **Daemon Hygiene:** Never leave `server.mjs` or child engines running in the background after tests. Always test against ephemeral `127.0.0.1:0` or stop processes cleanly.

## Repository Map

- `lib/observatory_core.mjs` — Pure deterministic core: loopback CSRF/CSWSH guards, `resolveSafePath`, Genesis `1..1,000,000` clamping + `parseBoolFlag`, bare-metal hardware flag builder, AZST binary decoder, 112-trait spectral delta, 8-axis cosine coherence, `<=240` omnitemporal ring buffer, fail-closed conservation gate, and `D7RO` 4x4 matrix.
- `server.mjs` — Loopback HTTP/1.1 + SSE + WebSocket Hub (`:8790`), `/healthz`, reverse proxy, Bio-FX shader injector, configurable `PORTS` + single-tick Asmodensius pollers, and child supervisor (`--no-engines` for standalone mode).
- `macro_wild_relay.py` — Read-only Asmodensius-Native relay (`:8794`) with raw-input clamping parity (`clamp_int_raw`, `parse_bool_flag`) and `--dry-run` JSON contract output.
- `web/` — Unified dark scientific cockpit (`index.html`, `app.js`, `creature_gl.js`, `styles.css`, `taxonomy.js`).
- `tests/` — `test_observatory.mjs` (14 Node `node:test` suites: live HTTP, raw-socket WS CSWSH `403`/`101`, live loopback `D7RO` wire-spy, offline-engine `DEGRADED`, 250 `prop_check` trials, metamorphic/golden, 18-case raw-input Node↔Python differential parity) and `test_relay.py` (6 Python `unittest` suites, 120 trials).
- `scripts/` — `lint_check.mjs`, `run_mutation_audit.mjs` (9/9 planted mutants, non-dirty default), `benchmark_observatory.mjs`, `check_citations.py` (Crossref/DataCite title+author match), `build_paper.py` (`--verify-only` CI mode), `stamp_timestamps.py` (DigiCert RFC 3161 + Bitcoin OTS), `Audit-Repo.ps1`, `audit-repo.sh`.
- `paper/` & `dist/` — AMS-LaTeX architecture white paper (`main.tex`, `refs.bib`), frozen PDF (`dist/Donahue_2026_omega_triscale_observatory.pdf`), and clean-room arXiv tarball (`dist/arxiv_submission.tar.gz`).
- `docs/index.html` & FAIR metadata — Static WCAG 2.2 AA GitHub Pages showcase, `docs/DATASHEET.md`, `SUBMISSION_READINESS.md`, `croissant.json`, `ro-crate-metadata.json`, `codemeta.json`, `REUSE.toml`, `data/MANIFEST.sha256`.

## Canonical Verification Commands

```bash
npm test                                    # 14/14 Node tests (WS CSWSH, D7RO wire-spy, offline DEGRADED, 250 prop_check, raw-input parity)
python -m unittest discover -s tests -v     # 6/6 Python relay tests (120 randomized trials + raw adversarial clamping)
npm run lint                                # Syntax, security, determinism, and identity lint (9 JS/MJS + 5 Python)
npm run mutate                              # 9/9 planted mutants killed (7 core + 2 server) without dirtying working tree
npm run bench                               # Deterministic telemetry micro-benchmarks -> results/benchmarks.json
python scripts/check_citations.py           # Live DOI Handle + Crossref/DataCite title/author match + URL verification
python scripts/stamp_timestamps.py --verify # Verify DigiCert RFC 3161 .tsr + Bitcoin OpenTimestamps .ots
python scripts/build_paper.py               # Zero-overflow Tectonic PDF + clean-room arXiv tarball
pwsh -NoProfile -File scripts/Audit-Repo.ps1 -Path .  # Build Standard v1.2.0 audit (target: 100.0% / 100.0% / 100.0%)
```
