# Frequently Asked Questions (`docs/faq.md`)

### 1. Can I run and test `omega-triscale-observatory` without cloning the 6 sibling repositories?
Yes. Every automated test (`npm test`, `python -m unittest discover -s tests -v`, `npm run lint`, `npm run mutate`, `npm run bench`) and standalone server mode (`npm run start:standalone` or `node server.mjs --no-engines`) runs cleanly from a standalone clone with zero sibling repositories on disk and zero npm/pip installs.

### 2. Does this repository contain Lean 4 formal proofs?
No. `omega-triscale-observatory` contains **0 local Lean 4 files**. It is strictly a visualization, reverse-proxy, metrology, and orchestration hub. The `327` combined upstream Lean 4 proofs displayed in the ecosystem summary (`48 + 70 + 89 + 54 + 30 + 36`) live in, and are reported as checked by, their six respective sibling repositories; they are not audited in this repository.

### 3. Does the Hub mutate `Asmodensius-Native` while observing it?
Not by design, and none was found by code inspection. The displayed coupling cells from Tier 1 / Tier 2 into `Asmodensius-Native` (`:8794` / `:8796`) are constants `{ m: "D7RO", s: 0 }`, and client-side WebGL2 Bio-FX shader injection leaves `#ifdef PICK` intact; tests 5b/5c and mutant `M3_D7RO_OBSERVER_VIOLATION` check these two facts. The hub does send operator commands (rate, pause/run, inspect, relaunch) to `:8794` and proxies browser traffic to it. No automated test checks that no T1/T2-derived data reaches Asmodensius.

### 4. Does this observatory solve any open problems in the Unsolved Problems Mega-Atlas?
No. **`0 / 1,900` overarching Mega-Atlas open problems are solved or retired.** The observatory is an empirical telemetry and orchestration instrument supporting exploration related to `AI-045`, `SYS-009`, and `SYS-050`, each of which remains strictly **OPEN** (`docs/MEGA_ATLAS_CROSSCHECK.md`).

### 5. Is `differential.chaosLyapunov` a real Lyapunov exponent?
No. It is a bounded `[0, 1]` heuristic combining rolling telemetry step deltas and Shannon entropies for UI trend monitoring (`LIMITATIONS.md`).

### 6. Why does `server.mjs` reject requests from non-loopback hosts or external browser tabs?
To prevent cross-site request forgery (CSRF) and cross-site WebSocket hijacking (CSWSH) against local simulation controls (`docs/threat-model.md`). Always access the Hub via `http://127.0.0.1:8790/` or `http://localhost:8790/`.
