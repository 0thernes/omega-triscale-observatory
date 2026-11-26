# Frequently Asked Questions (`docs/faq.md`)

### 1. Can I run and test `omega-triscale-observatory` without cloning the 6 sibling repositories?
Yes. Every automated test (`npm test`, `python -m unittest discover -s tests -v`, `npm run lint`, `npm run mutate`, `npm run bench`) and standalone server mode (`npm run start:standalone` or `node server.mjs --no-engines`) runs cleanly from a standalone clone with zero sibling repositories on disk and zero npm/pip installs.

### 2. Does this repository contain Lean 4 formal proofs?
No. `omega-triscale-observatory` contains **0 local Lean 4 files**. It is strictly a visualization, reverse-proxy, metrology, and orchestration hub. The `244` combined upstream Lean 4 proofs displayed in the ecosystem summary (`42 + 62 + 72 + 48 + 20`) live in and are formally checked inside their five respective sibling repositories.

### 3. Does the Hub mutate `Asmodensius-Native` while observing it?
No. All live cross-tier links from Tier 1 / Tier 2 into `Asmodensius-Native` (`:8794` / `:8796`) are permanently enforced as read-only (`{ m: "D7RO", s: 0 }`), and client-side WebGL2 Bio-FX shader injection strictly leaves `#ifdef PICK` intact. This invariant is verified by automated tests and surgical mutant `M3_D7RO_OBSERVER_VIOLATION`.

### 4. Does this observatory solve any open problems in the Unsolved Problems Mega-Atlas?
No. **`0 / 1,900` overarching Mega-Atlas open problems are solved or retired.** The observatory is an empirical telemetry and orchestration instrument supporting exploration related to `AI-045`, `SYS-009`, and `SYS-050`, each of which remains strictly **OPEN** (`docs/MEGA_ATLAS_CROSSCHECK.md`).

### 5. Is `differential.chaosLyapunov` a real Lyapunov exponent?
No. It is a bounded `[0, 1]` heuristic combining rolling telemetry step deltas and Shannon entropies for UI trend monitoring (`LIMITATIONS.md`).

### 6. Why does `server.mjs` reject requests from non-loopback hosts or external browser tabs?
To prevent cross-site request forgery (CSRF) and cross-site WebSocket hijacking (CSWSH) against local simulation controls (`docs/threat-model.md`). Always access the Hub via `http://127.0.0.1:8790/` or `http://localhost:8790/`.
