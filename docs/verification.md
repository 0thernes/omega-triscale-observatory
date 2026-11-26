# Verification Architecture (`docs/verification.md`)

`omega-triscale-observatory` v6.7.0 implements a multi-layer automated test strategy (example-based and seeded-random tests, not proofs) for its security, numeric, cross-language and display invariants, with **zero external test frameworks** (pure Node.js `node:test` + Python `unittest`).

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
   - Constant `D7RO` (`s: 0`) cells on `matrix4x4[0..1][2..3]` and `#ifdef PICK` preservation in `injectMacroBioFx` (no test records the hub's traffic to `:8794`).
   - Not tested: the `DEGRADED` result for an offline required tier, and the WebSocket `upgrade` handler wiring.
   - Deterministic `AZST` binary creature decoding and deterministic `web/taxonomy.js` outputs.
5. **Cross-Language Differential Oracle (`B11`/`B12`):**
   - Normalizes 3 extreme and nominal configurations with Node `normalizeGenesisConfig`, passes `buildRelayArgs(norm)` to `python macro_wild_relay.py --dry-run`, and checks that both sides agree on every field and hardware flag for those 3 cases. Because Python receives already-normalized inputs, raw-input clamping is not compared across the two languages.
6. **Surgical Mutation Testing (`scripts/run_mutation_audit.mjs` — `B13`):**
   - Copies the repo into an isolated `os.tmpdir()` directory, plants 6 hand-written logic regressions (`M1`..`M6`, all in `lib/observatory_core.mjs`), executes the full Node test suite against each mutant, checks that **6/6** are killed, and removes the temporary directory. This is a kill rate for these six mutants, not a mutation score for `server.mjs` or the metric arithmetic.
7. **Live Citation & Clean-Room White Paper Verification:**
   - `scripts/check_citations.py`: live HTTP/DOI Handle REST reachability check of all 16 URLs/DOIs in `paper/refs.bib`. Reachability does not show that a DOI names the cited work: on 2026-11-26 a Crossref check found that the `bedau1998` DOI (`10.7551/mitpress/1428.003.0028`) resolves to a different chapter (see `ERRATA.md`).
   - `scripts/build_paper.py`: Tectonic compilation failing on ANY Overfull `\hbox`, undefined ref/citation, or missing character, followed by deterministic `arxiv_submission.tar.gz` clean-room rebuild.
