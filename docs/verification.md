# Verification Architecture (`docs/verification.md`)

`omega-triscale-observatory` v6.8.0 implements a multi-layer automated test strategy (example-based, live loopback socket, differential, and seeded-random tests — not formal proofs) for its security, numeric, cross-language, and observer-isolation invariants, with **zero external test frameworks** (pure Node.js `node:test` + Python `unittest`).

## Verification Layers

1. **Syntax & Static Hygiene (`npm run lint` — `B17`/`B18`):**
   - Executes `node --check` on all `9` JS/MJS files and `python -m py_compile` on all `5` Python targets (`macro_wild_relay.py`, `tests/test_relay.py`, `scripts/check_citations.py`, `scripts/build_paper.py`, `scripts/stamp_timestamps.py`).
   - Rejects `eval`, `new Function`, `Math.random()` inside server/core logic, and stale unformed corporate affiliation strings.
   - Paired with `jsconfig.json` (`"checkJs": true`, `"strict": true`) and CI report-only `ruff` + `mypy`.
2. **Contract, Negative, Live HTTP & Raw-Socket WebSocket CSWSH Tests (`tests/test_observatory.mjs` — `B06`/`B09`):**
   - Binds `server.mjs` to ephemeral loopback port `127.0.0.1:0` (closing cleanly in `t.after()` — zero lingering daemons).
   - Verifies `/healthz`, static `nosniff`, 5 distinct path-traversal payloads, HTTP `400` on invalid `clade` and `z`, HTTP `403` on cross-origin CSRF, non-JSON POST, and non-loopback SSE `Host`.
   - `Test 3b`: sends raw TCP `Upgrade: websocket` requests directly to the live listening socket — asserting `HTTP/1.1 403 Forbidden` + socket destruction on foreign `Origin: https://evil.example` (`/ws` and `/proxy/macro/ws`) and non-loopback `Host: evil.example:8790`, plus positive `101 Switching Protocols` control against an ephemeral mock upstream WS server and explicit absent-`Origin` CLI check.
3. **Property-Based Testing (`prop_check` — `B10`):**
   - `250` deterministic seeded randomized trials in Node (`tests/test_observatory.mjs`) + `120` seeded randomized trials in Python (`tests/test_relay.py`) asserting `1 <= n <= 1_000_000`, `n <= cap <= 2_000_000`, `1 <= species <= min(100, n)`, `2 <= grid <= 8`, 23-bit lesion clamping, and exact hardware flag serialization.
4. **Metamorphic, Golden, Offline Conservation & Live Loopback `D7RO` Wire-Spy Tests (`B08`/`B14`/`B21`):**
   - `Test 5a`: 112-trait spectral delta swap antisymmetry (`dna <-> cells`), constant-shift invariance inside `[0, 1]`, and clamping against unclamped `[0..7]` inputs.
   - `Test 5b`: omnitemporal ring cap `<= 240` across `320` consecutive pushes; fail-closed conservation gate testing ALL failure modes: offline required tiers (`t1_dna = false`, `t2_cells = false`, `t4_env = false` with fresh timestamps → `DEGRADED`), stale timestamps (`>= 15 s` → `DEGRADED`), and nonzero DNA/Cells/`observerFail` residuals (`ALERT`).
   - `Test 5c` & `Test 5e`: constant `D7RO` (`s: 0`) cells on `matrix4x4[0..1][2..3]`, `#ifdef PICK` preservation in `injectMacroBioFx`, AND a live 4-server loopback wire-spy test (`mockMacro`, `mockMeso`, `mockMicro`, `mockNoetic`) recording every HTTP method/URL/body on mock Asmodensius during live polling and T1/T2 state updates (`transfect`, `restraints`, `wave_mode`, `meso_pulse`, `env_solvent`, `cells_regime`, `micro_shock`, `cross_mutate_all4`) — asserting zero non-`GET` writes in Phase A, strictly read-only `POST /api/inspect {"uid":...}` in Phase B, and zero leaked T1/T2 payload bytes.
   - `Test 5d`: deterministic `AZST` binary creature decoding and deterministic `web/taxonomy.js` outputs.
5. **Cross-Language Raw-Input Differential Oracle (`B11`/`B12`):**
   - `Test 6`: passes `18` raw unnormalized adversarial and seeded-random configurations (`n` in `{0, -5, 5_000_000, "NaN"}`, `cap = -10`, invalid presets, malformed grids, non-boolean hardware flags `"false"`, `"yes"`, `"2"`, `"banana"`, negative/overflow 23-bit lesion masks) directly WITHOUT pre-normalization to BOTH Node `normalizeGenesisConfig` and Python `macro_wild_relay.py --dry-run`, asserting exact agreement across all `16` resolved output fields.
6. **Planted-Regression Mutation Testing (`scripts/run_mutation_audit.mjs` — `B13`):**
   - Copies the repo into an isolated `os.tmpdir()` directory, plants `9` hand-written logic regressions (`7` in `lib/observatory_core.mjs`, `2` in `server.mjs`), runs the full `14/14` Node test suite against each mutant, asserts **9/9** killed, and removes the temporary directory without dirtying `results/mutation_audit.json` (`git diff --exit-code` enforced in CI). This is a kill rate for these nine targeted mutants, not a repo-wide automated mutation score across all arithmetic or UI lines.
7. **Live Crossref/DataCite Citation, Dual Timestamp & Clean-Room White Paper Verification:**
   - `scripts/check_citations.py`: live Handle reachability + Crossref/DataCite title & author match + zero-retraction check across all `13/13` entries in `paper/refs.bib` (`10/10` DOIs, `5/5` URLs, `1` print MIT Press proceedings entry `bedau1998` with no wrong DOI), recorded in `results/citation-audit.json`.
   - `scripts/stamp_timestamps.py --verify`: verifies DigiCert RFC 3161 (`CHECKSUMS.sha256.tsr`) + 3-calendar Bitcoin OpenTimestamps (`CHECKSUMS.sha256.ots`) cryptographically bind `CHECKSUMS.sha256`.
   - `scripts/build_paper.py --verify-only`: Tectonic compilation failing on ANY Overfull `\hbox`, undefined ref/citation, or missing character + deterministic `arxiv_submission.tar.gz` clean-room rebuild without overwriting the committed PDF, so CI SLSA provenance attests BOTH committed `dist/` deliverables.
