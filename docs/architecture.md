# System Architecture (`docs/architecture.md`)

`omega-triscale-observatory` v6.7.0 is a **single-process local supervisor, loopback reverse proxy, binary telemetry decoder, and WebGL 2.0 scientific cockpit** written in zero-dependency Node.js ESM (`server.mjs`, `lib/observatory_core.mjs`) and Python 3 (`macro_wild_relay.py`).

## 1. Module Separation

| Module | Responsibility | Runtime Dependencies |
|---|---|---|
| `lib/observatory_core.mjs` | Pure deterministic core: SplitMix32 PRNG, `clampInt`, loopback CSRF/CSWSH predicates, `resolveSafePath`, `validateCladeParam`, `validateSliceZParam`, `normalizeGenesisConfig`, `buildRelayArgs`, `computeDifferentialsCore`, `decodeAzstCreaturesCore`, `sampleLocalHabitatCore`, `sanitizeProxyHeaders`. | Node.js built-ins only (`node:path`) |
| `server.mjs` | Loopback HTTP/1.1 + SSE + WebSocket Hub (`127.0.0.1:8790`), `/healthz`, reverse-proxy URL rewriting, observer-only Bio-FX GLSL injector (preserving `#ifdef PICK`), background engine polling, and child process tree supervision. | Node.js built-ins only (`node:http`, `node:net`, `node:fs`, `node:path`, `node:child_process`, `node:url`) |
| `macro_wild_relay.py` | Read-only relay (`:8794`) importing `Asmodensius-Native/demo/viewer_server.py` with bounded `1..1,000,000` Genesis presets, bare-metal flags (`--ecores`, `--gpu`, `--prefetch`, `--kernels`, `--large-pages`), run-directory pruning, and `--dry-run` JSON contract mode. | Python 3.12+ stdlib only |
| `web/` | Dark scientific UI (`index.html`, `styles.css`), SSE telemetry client & Canvas metrology (`app.js`), WebGL2 GLSL ES 3.00 12-shader specimen engine (`creature_gl.js`), and deterministic FNV-1a taxonomy generator (`taxonomy.js`). | Browser WebGL2 / Canvas 2D |

## 2. Eight Supervised Local Endpoints

1. **`:8787` — Tier 1 DNA (`AUTOPHAGE v1.3`):** Streams SSE frames containing `ovi`, `traits112`, conservation ledger, and evolved 128-byte `genome_hex`.
2. **`:8788` — Tier 2 Cells (`Cellulogonic Mecha v1.4`):** Receives real 128B DNA transfection, 13-vector restraints, solvent overrides, and nutrient plumes; returns `telemetry` and `bridge.traits112`.
3. **`:8791` — Tier 2+ Frontier VM (`Cellular Engine Omega v5.1`):** Polled via `/api/run` for `TB13`–`TB16` frontier diagnostics (75 substrates, 1,000-cell hybrid cube).
4. **`:8795` — Tier 3/4 Cognitive (`Noetic Organism Omega v2.0`):** Polled via `/api/state` and `/api/e2` for conservation checks and indicator-only cognitive readouts.
5. **`:8794` — Tier 3+4 World #1 (`Asmodensius-Native` WebGL2 via `macro_wild_relay.py`):** Binary `AZST` creature/static/field/shape snapshots and WebSocket stream under strict **`D7RO`** read-only policy.
6. **`:8796` — Tier 3+4 World #2 (`Asmodensius-Native` native `az_view`):** Proxied via `/proxy/macro-live/`, toggleable inside the Hub via `W1:GL2` ⇄ `W2:az_view`.
7. **`:8790` — Unified Hub (`server.mjs`):** Serves UI, `/healthz`, `/api/stack/events` (SSE), `/api/stack/action` (JSON POST), `/api/stack/shape/:clade`, `/api/stack/env-slice`, and `/proxy/*`.
8. **`:8790/zeta-omega/` — Singularity Atlas (`alife-singularity-omega-package`):** Static read-only archive served strictly through `resolveSafePath`.

## 3. Data Flow & Observer Independence (`D7RO`)

- **Allowed Write Paths:** T1 → T2 (`DNA-128B` transfection), T4/T3 → T2 (habitat solvent sync, nutrient plume, shock), Operator → T1+T2 (13-vector restraint parity).
- **Strictly Forbidden Write Paths (`D7RO`):** T1 → T3, T1 → T4, T2 → T3, T2 → T4. `computeDifferentialsCore` hard-codes `{ m: "D7RO", s: 0 }` for all four displayed cells; automated tests and mutation kill `M3_D7RO_OBSERVER_VIOLATION` check that constant. That the hub sends no T1/T2-derived data to `:8794` rests on code inspection; no automated test records that traffic.
- **Client-Only Bio-FX:** Proxy shader injection into `/proxy/macro/viewer_gl.js` modifies rendering strictly outside `#ifdef PICK` blocks, leaving GPU picking and engine state untouched.
