# OMEGA 4-Tier Multi-Scale Observatory v6.8.0 — Task Runner (justfile)
# Run `just --list` to see all available one-word commands.

set shell := ["bash", "-euo", "pipefail", "-c"]
set windows-shell := ["pwsh", "-NoProfile", "-Command"]

python := env_var_or_default("PYTHON_BIN", "python")

default:
    @just --list

# Clean-clone full reproducible verification pipeline (B01)
reproduce: test lint mutate bench citations timestamps paper audit
    @echo "PASS: Full clean-clone verification pipeline succeeded."

# Run all Node.js (14/14) and Python (6/6) automated tests
test:
    node --test tests/test_observatory.mjs
    {{python}} -m unittest discover -s tests -v

# Run static syntax, security, determinism, and identity lint checks
lint:
    node scripts/lint_check.mjs

# Run isolated 9-mutant planted-regression audit (7 core + 2 server; non-dirty default)
mutate:
    node scripts/run_mutation_audit.mjs

# Run deterministic telemetry and guard micro-benchmarks
bench:
    node scripts/benchmark_observatory.mjs

# Verify all paper/refs.bib DOIs (Handle + Crossref/DataCite title/author match) and URLs live
citations:
    {{python}} scripts/check_citations.py

# Verify DigiCert RFC 3161 (.tsr) and Bitcoin OpenTimestamps (.ots) proofs against CHECKSUMS.sha256
timestamps:
    {{python}} scripts/stamp_timestamps.py --verify

# Compile AMS-LaTeX white paper via Tectonic and clean-room verify arXiv tarball
paper:
    {{python}} scripts/build_paper.py --verify-only

# Run Build Standard v1.2.0 repository audit
audit:
    pwsh -NoProfile -File scripts/Audit-Repo.ps1 -Path .

# Generate LF-normalized SHA-256 checksums manifests for source, results, FAIR metadata, and frozen dist artifacts
checksums:
    node -e 'import("node:crypto").then(async ({createHash})=>{const fs=await import("node:fs");const files=["VERSION","package.json","package-lock.json","lib/observatory_core.mjs","server.mjs","macro_wild_relay.py","web/index.html","web/app.js","web/creature_gl.js","web/taxonomy.js","tests/test_observatory.mjs","tests/test_relay.py","paper/main.tex","paper/refs.bib","results/mutation_audit.json","results/benchmarks.json","results/citation-audit.json","docs/index.html","croissant.json","ro-crate-metadata.json","codemeta.json","dist/Donahue_2026_omega_triscale_observatory.pdf","dist/arxiv_submission.tar.gz"].filter(f=>fs.existsSync(f));const lines=files.map(f=>`${createHash("sha256").update(fs.readFileSync(f)).digest("hex")}  ${f}`);fs.writeFileSync("CHECKSUMS.sha256",lines.join("\n")+"\n");console.log(`Wrote ${lines.length} SHA-256 digests to CHECKSUMS.sha256`);})'

# Launch Hub standalone (no sibling engines)
start-standalone:
    node server.mjs --no-engines

# Launch full 4-tier 8-endpoint supervisor
start:
    node server.mjs
