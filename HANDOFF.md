# HANDOFF.md — OMEGA 4-Tier Multi-Scale Observatory (v6.8.0)

**Status:** Verified green on Windows 11 x64 (`Node v25.8.2`, `Python 3.13.15`, `Tectonic 0.17.0`, `OpenSSL 3.5.9`) and cross-platform CI (`ubuntu-latest` + `windows-latest`) + GitHub Pages, synced on `main`.
**Repo Scope:** Zero-dependency Node.js ESM + Python 3 + WebGL 2.0 cockpit supervising **8 live local endpoints across 7 public repositories** (`:8787`, `:8788`, `:8791`, `:8795`, `:8794`, `:8796`, `:8790`, `:8790/zeta-omega/`).

## Verified v6.8.0 Local Baseline (This Repository)
- **Node Verification Suite (`npm test`):** `14/14` PASS (syntax audit, `VERSION`/UI-honesty/identity check, `1..1,000,000` clamping, bare-metal hardware flags, path-traversal + CSRF/CSWSH unit guards, live ephemeral HTTP contract tests including `/healthz`, live raw-socket WebSocket `Upgrade` `403`/`101` CSWSH test `3b`, `250` seeded `prop_check` trials, metamorphic 112-trait spectral invariance, `<= 240` omnitemporal cap, offline-engine `DEGRADED` conservation gate `5b`, `#ifdef PICK` shader preservation, binary AZST decode, live loopback `D7RO` wire-spy test `5e`, and `18`-case raw unnormalized Node↔Python `--dry-run` differential parity `6`).
- **Python Relay Suite (`python -m unittest discover -s tests -v`):** `6/6` PASS (`120` seeded randomized trials + raw adversarial clamping + subprocess `--dry-run`).
- **Static Lint & Hygiene (`npm run lint`):** `0` errors across `9` JS/MJS + `5` Python targets.
- **Planted-Regression Mutation Audit (`npm run mutate`):** `9/9` killed (`7` in `lib/observatory_core.mjs`, `2` in `server.mjs`) in an isolated temp workspace without dirtying `results/mutation_audit.json`.
- **White Paper & Bibliography:** `13/13` BibTeX entries verified in `results/citation-audit.json` (`10/10` DOIs Handle + Crossref/DataCite title/author match, `5/5` URLs page-title match, `bedau1998` wrong DOI removed, `0` retractions); Tectonic AMS-LaTeX PDF (`dist/Donahue_2026_omega_triscale_observatory.pdf`) with `0` Overfull `\hbox`, `0` undefined refs/citations, clean-room verified `dist/arxiv_submission.tar.gz`, and CI `--verify-only` SLSA attestation covering both committed `dist/` files.
- **Archival & FAIR:** GitHub Pages showcase (`docs/index.html`), `croissant.json`, `ro-crate-metadata.json`, `codemeta.json`, `docs/DATASHEET.md`, `SUBMISSION_READINESS.md`, `REUSE.toml`, `LICENSES/`, `data/MANIFEST.sha256`, SWHID `swh:1:snp:045edd61e0805b3778e40f5230062e8cc245bb60`, DigiCert RFC 3161 (`CHECKSUMS.sha256.tsr`), and 3-calendar Bitcoin OpenTimestamps (`CHECKSUMS.sha256.ots`).
- **Build Standard v1.2.0 (`scripts/Audit-Repo.ps1 -Path .`):** `100.0%` Structure / `100.0%` Completion / `100.0%` Core.

## Honest Epistemic Boundaries
- **0 local Lean 4 files:** This repository is strictly a visualization, reverse-proxy, and orchestration instrument. The `327` combined upstream 6-kernel Lean 4.35.0 proofs (`48` `autophage` + `70` `cellulogonic-mecha` + `89` `cellular-engine-omega` + `54` `noetic-organism-omega` + `30` `asmodensius-native` + `36` `alife-singularity-omega-package`) live in and are audited by their respective sibling repositories.
- **Preprint Status & Mega-Atlas Non-Retirement:** Not externally peer-reviewed; `0 / 1,900` overarching open problems in `0thernes/unsolved-problems-mega-atlas` are solved or retired (`docs/MEGA_ATLAS_CROSSCHECK.md`).
- **PowerShell Rule:** Always pass `-LiteralPath` on `Z:\[Vibe Coded (AI)]\...` paths.
- **Daemon Hygiene:** Never leave `server.mjs` running after automated tests.
