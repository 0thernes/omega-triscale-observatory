# AGENTS.md — OMEGA 4-Tier Multi-Scale Observatory (v6.7.0)

> Canonical agent instructions for `0thernes/omega-triscale-observatory` (`CLAUDE.md`, `GEMINI.md`, and `.cursor/rules/build-standard.mdc` all point here).

## Purpose & Honest Scope

`omega-triscale-observatory` is a **zero-dependency Node.js ESM, Python 3, and WebGL 2.0 multi-scale Artificial Life cockpit** supervising **8 live local endpoints across 7 public repositories** on `http://127.0.0.1:8790/`.

- **Author:** Alexander Stephen Donahue (`Independent Researcher, Spokane, WA, USA`, ORCID `0009-0006-8168-9648`, `0_0@0thernes.art`). Never attach an unformed LLC corporate suffix.
- **Dual License:** Apache-2.0 (`LICENSE`) for all code, scripts, and CI; CC-BY-4.0 (`LICENSE-DOCS`) for white paper, PDFs, diagrams, and documentation.
- **Honest Verification Boundary:** This repository is strictly a visualization, reverse-proxy, telemetry-metrology, and process-orchestration instrument. It contains **0 local Lean 4 files** (upstream formal proofs live in five sibling repositories: `42` `autophage` + `62` `cellulogonic-mecha` + `72` `cellular-engine-omega` + `48` `noetic-organism-omega` + `20` `asmodensius-native` = `244` combined upstream Lean 4 theorems) and retires **0 / 1,900** overarching open problems in `0thernes/unsolved-problems-mega-atlas`.
- **Render-Only Observer Independence (`D7RO`):** Never introduce any live T1/T2 write path into `Asmodensius-Native` (`:8794` / `:8796`), and never modify code inside `#ifdef PICK` shader blocks when injecting Bio-FX overlays.

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

- `lib/observatory_core.mjs` — Pure deterministic core: loopback CSRF/CSWSH guards, `resolveSafePath`, Genesis `1..1,000,000` clamping, bare-metal hardware flag builder, AZST binary decoder, 112-trait spectral delta, 8-axis cosine coherence, `<=240` omnitemporal ring buffer, fail-closed conservation gate, and `D7RO` 4x4 matrix.
- `server.mjs` — Loopback HTTP/1.1 + SSE + WebSocket Hub (`:8790`), `/healthz`, reverse proxy, Bio-FX shader injector, and child supervisor (`--no-engines` for standalone mode).
- `macro_wild_relay.py` — Read-only Asmodensius-Native relay (`:8794`) with `--dry-run` JSON contract output.
- `web/` — Unified dark scientific cockpit (`index.html`, `app.js`, `creature_gl.js`, `styles.css`, `taxonomy.js`).
- `tests/` — `test_observatory.mjs` (Node `node:test`, live ephemeral HTTP, 250 `prop_check` trials, metamorphic/golden, Node-vs-Python differential parity) and `test_relay.py` (Python `unittest`, 120 trials).
- `scripts/` — `lint_check.mjs`, `run_mutation_audit.mjs` (6/6 mutants), `benchmark_observatory.mjs`, `check_citations.py`, `build_paper.py`, `Audit-Repo.ps1`, `audit-repo.sh`.
- `paper/` & `dist/` — AMS-LaTeX architecture white paper (`main.tex`, `refs.bib`), frozen PDF (`dist/Donahue_2026_omega_triscale_observatory.pdf`), and clean-room arXiv tarball (`dist/arxiv_submission.tar.gz`).

## Canonical Verification Commands

```bash
npm test                                    # 12/12 Node tests (contract, HTTP, 250 prop_check, differential)
python -m unittest discover -s tests -v     # 5/5 Python relay tests (120 randomized trials)
npm run lint                                # Syntax, security, determinism, and identity lint
npm run mutate                              # 6/6 (100%) surgical mutation audit in isolated tempdir
npm run bench                               # Deterministic telemetry micro-benchmarks -> results/benchmarks.json
python scripts/check_citations.py           # Live DOI & URL verification for paper/refs.bib
python scripts/build_paper.py               # Zero-overflow Tectonic PDF + clean-room arXiv tarball
pwsh -NoProfile -File scripts/Audit-Repo.ps1  # Build Standard v1.2.0 audit (target: 100.0% / 100.0% / 100.0%)
```
