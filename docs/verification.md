# Verification Architecture (`docs/verification.md`)

`omega-triscale-observatory` v6.7.0 implements a multi-layer automated verification strategy covering every critical security, numeric, cross-language, and observer-isolation invariant with **zero external test frameworks** (pure Node.js `node:test` + Python `unittest`).

## Verification Layers

1. **Syntax & Static Hygiene (`npm run lint` — `B17`/`B18`):**
   - Executes `node --check` on all 9 JS/MJS files and `python -m py_compile` on Python targets.
   - Rejects `eval`, `new Function`, `Math.random()` inside server/core logic, and stale `0thernes LLC` affiliation strings.
   - Paired with `jsconfig.json` (`"checkJs": true`, `"strict": true`) and CI report-only `ruff` + `mypy`.
2. **Contract, Negative & Live HTTP Integration Tests (`tests/test_observatory.mjs` — `B06`/`B09`):**
   - Binds `server.mjs` to ephemeral loopback port `127.0.0.1:0` (closing cleanly in `t.after()` — zero lingering daemons).
   - Verifies `/healthz`, static `nosniff`, 5 distinct path-traversal payloads, HTTP `400` on invalid `clade` and `z`, HTTP `403` on cross-origin CSRF, non-JSON POST, and non-loopback SSE `Host`.
3. **Property-Based Testing (`prop_check` — `B10`):**
   - `250` deterministic seeded randomized trials in Node (`tests/test_observatory.mjs`) + `120` seeded randomized trials in Python (`tests/test_relay.py`) asserting `1 <= n <= 1_000_000`, `n <= cap <= 2_000_000`, `1 <= species <= min(100, n)`, `2 <= grid <= 8`, 23-bit lesion masking, and exact hardware flag serialization.
4. **Metamorphic, Golden & Observer-Isolation Tests (`B08`/`B14`):**
   - 112-trait spectral delta swap antisymmetry (`dna <-> cells`), constant-shift invariance inside `[0, 1]`, and clamping against unclamped `[0..7]` inputs.
   - Omnitemporal ring cap `<= 240` across `320` consecutive pushes; fail-closed conservation gate (`VERIFIED` / `ALERT` / `DEGRADED`).
   - Unconditional `D7RO` (`s: 0`) enforcement on `matrix4x4[0..1][2..3]` and `#ifdef PICK` preservation in `injectMacroBioFx`.
   - Deterministic `AZST` binary creature decoding and deterministic `web/taxonomy.js` outputs.
5. **Cross-Language Differential Oracle (`B11`/`B12`):**
   - Feeds identical extreme & nominal configurations through Node `normalizeGenesisConfig` + `buildRelayArgs` and invokes `python macro_wild_relay.py --dry-run` as an independent cross-language oracle, verifying 100% agreement across every clamped field and hardware flag.
6. **Surgical Mutation Testing (`scripts/run_mutation_audit.mjs` — `B13`):**
   - Copies the repo into an isolated `os.tmpdir()` directory, plants 6 targeted logic regressions (`M1`..`M6`), executes the full Node test suite against each mutant, verifies **6/6 (100.0%)** killed, and removes the temporary directory cleanly.
7. **Live Citation & Clean-Room White Paper Verification:**
   - `scripts/check_citations.py`: live HTTP/DOI Handle REST verification of all 16 URLs/DOIs in `paper/refs.bib`.
   - `scripts/build_paper.py`: Tectonic compilation failing on ANY Overfull `\hbox`, undefined ref/citation, or missing character, followed by deterministic `arxiv_submission.tar.gz` clean-room rebuild.
