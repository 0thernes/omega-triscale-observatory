# Frequently Asked Questions (`docs/faq.md`)

### 1. Can I run and test `omega-triscale-observatory` without cloning the 6 sibling repositories?
Yes. Every automated test (`npm test`, `python -m unittest discover -s tests -v`, `npm run lint`, `npm run mutate`, `npm run bench`, `python scripts/stamp_timestamps.py --verify`) and standalone server mode (`npm run start:standalone` or `node server.mjs --no-engines`) runs cleanly from a standalone clone with zero sibling repositories on disk and zero npm/pip installs.

### 2. Does this repository contain Lean 4 formal proofs?
No. `omega-triscale-observatory` contains **0 local Lean 4 files**. It is strictly a visualization, reverse-proxy, metrology, and orchestration hub. The `327` combined upstream Lean 4.35.0 proofs displayed in the ecosystem summary (`48 + 70 + 89 + 54 + 30 + 36`) live in, and are reported as checked by, their six respective sibling repositories; they are not audited in this repository.

### 3. Does the Hub mutate `Asmodensius-Native` while observing it?
No T1/T2 state is ever written into `Asmodensius-Native` (`:8794` / `:8796`). This `D7RO` convention is verified across three automated layers in `v6.8.0`: (1) the displayed T1/T2-to-T3/T4 coupling cells are fixed at `{ m: "D7RO", s: 0 }` (`Test 5b`, `M3`), (2) client-side WebGL2 Bio-FX shader injection leaves `#ifdef PICK` intact (`Test 5c`), and (3) live loopback wire-spy `Test 5e` (guarded by `server.mjs` mutant `M9_D7RO_WIRE_LEAK_SERVER`) records every HTTP method, URL, and payload arriving on a mock Asmodensius socket during polling and T1/T2 actions, verifying zero non-`GET` writes in Phase A and strictly read-only `POST /api/inspect {"uid":...}` on specimen lock in Phase B. Out-of-band operator cadence/pause/relaunch commands (`live_macro_rates`, `sync_pause`, `respawn_cosmos`, `ignite_genesis`) and `/proxy/macro/*` iframe pass-through remain separate operator controls.

### 4. Does this observatory solve any open problems in the Unsolved Problems Mega-Atlas?
No. **`0 / 1,900` overarching Mega-Atlas open problems are solved or retired.** The observatory is an empirical telemetry and orchestration instrument supporting exploration related to `AI-045`, `SYS-009`, and `SYS-050`, each of which remains strictly **OPEN** (`docs/MEGA_ATLAS_CROSSCHECK.md`).

### 5. Is `differential.chaosLyapunov` a real Lyapunov exponent?
No. It is a bounded `[0, 1]` heuristic combining rolling telemetry step deltas and Shannon entropies for UI trend monitoring (`LIMITATIONS.md`).

### 6. Why does `server.mjs` reject requests from non-loopback hosts or external browser tabs?
To prevent cross-site request forgery (CSRF) and cross-site WebSocket hijacking (CSWSH) against local simulation controls (`docs/threat-model.md`), verified directly by live HTTP and raw-socket TCP WebSocket `Upgrade` `403` tests (`Test 3` and `Test 3b`). Always access the Hub via `http://127.0.0.1:8790/` or `http://localhost:8790/`.
