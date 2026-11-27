# Operations, Health, Backups & Offsite Mirror (`docs/operations.md`)

## 1. Local Startup & Clean Shutdown

### Standalone Mode (No Sibling Engines)
```bash
node server.mjs --no-engines
# or:
OBSERVATORY_NO_ENGINES=1 node server.mjs
```

### Full 4-Tier 8-Endpoint Mode
```bash
node server.mjs
# Windows shortcut: Start-TriScale.cmd
```

### Clean Process-Tree Reaping
Sending `SIGINT` (`Ctrl+C`) or `SIGTERM` triggers `shutdown()` in `server.mjs`, which closes all active SSE streams, posts `/api/shutdown` to `:8794`, and reaps child process trees cleanly (`taskkill /T /F` on Windows, `SIGKILL` fallback on POSIX). Never leave background test servers running.

## 2. Observability & Health Monitoring (`A34`)

- **Health Endpoint:** `GET http://127.0.0.1:8790/healthz` (alias `/api/health`) returns HTTP `200` JSON:
  ```json
  {
    "ok": true,
    "service": "omega-triscale-observatory",
    "version": "6.8.0",
    "uptime_s": 12.34,
    "engines": { "t1_dna": false, "t2_cells": false, "t2_omega": false, "t3_noetic": false, "t3_creatures": false, "t4_env": false },
    "conservationState": "DEGRADED",
    "sseClients": 0
  }
  ```
- **Structured Console Logging:** All child engine lifecycle events (`[4TIER]`), Bio-FX shader hook counts (`[T4:Proxy Bio-FX ULTRA v5]`), and error events write cleanly to `stdout`/`stderr`.
- **Runtime Disk Hygiene:** `macro_wild_relay.py` automatically prunes stale run directories inside `runtime/macro-wild-data/runs/` keeping only the latest `MAX_RETAINED_RUNS = 5` runs.

## 3. Data, Backups & Offsite Repository Mirror (`A35`)

- **Ephemeral Runtime Data:** `runtime/` is git-ignored and safely deletable at any time; no persistent user database or schema migration is required.
- **Primary Remote & Master Archive Mirror:**
  - Primary GitHub remote: `https://github.com/0thernes/omega-triscale-observatory`
  - Offsite research archive & mirror registration: `https://github.com/0thernes/0thernes-research-archive` (plus Software Heritage snapshot and local ReFS Dev Drive / external `I:` backup).
- **Offline Git Bundle Backup:** Create a full self-contained offline backup bundle at any time:
  ```bash
  git bundle create omega-triscale-observatory-v6.8.0.bundle --all
  git bundle verify omega-triscale-observatory-v6.8.0.bundle
  ```
- **Local Rollback:** Revert to any prior tagged release cleanly via `git checkout v6.6.0` (or restore from the verified `.bundle` archive).
