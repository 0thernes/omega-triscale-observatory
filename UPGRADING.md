# Upgrading & Deprecation Policy (`UPGRADING.md`)

## Semantic Versioning Policy

`omega-triscale-observatory` follows [SemVer 2.0.0](https://semver.org/):
- **Patch (`6.7.x`):** Bug fixes, security hardening, test additions, and documentation corrections with full backward compatibility on HTTP routes and CLI flags.
- **Minor (`6.x.0`):** Backward-compatible new endpoints (e.g., `/healthz`), new bare-metal flags, or new verification scripts.
- **Major (`x.0.0`):** Breaking changes to `/api/stack/*` JSON payload schemas, SSE event structure, or `macro_wild_relay.py` CLI contracts.

## Upgrading from `v6.6.0` to `v6.7.0`

1. **Pure Core Module Extraction:** Pure helper functions now reside in `lib/observatory_core.mjs` and are imported by `server.mjs`. Existing `node server.mjs` invocations continue to work identically.
2. **Strict Parameter Validation:**
   - `GET /api/stack/shape/:clade` now returns `400 Bad Request` on non-integer or negative clade IDs (previously returned `404` with `clade: null`).
   - `GET /api/stack/env-slice?z=` now returns `400 Bad Request` on invalid non-integer `z` values outside `[0, 255]` (previously silently fell back to `state.env.sliceZ`).
3. **Standalone & Dry-Run Modes:**
   - Launch Hub without spawning sibling engines via `node server.mjs --no-engines` (or `OBSERVATORY_NO_ENGINES=1`).
   - Probe relay CLI resolution without `Asmodensius-Native` on disk via `python macro_wild_relay.py --data-dir . --dry-run`.
4. **JSON Export Keys:** In `web/app.js` exported forensic snapshots, keys `tier1_dna_autophage_v1_2` and `tier2_cells_v1_3` were updated to `tier1_dna_autophage_v1_3` and `tier2_cells_v1_4` to reflect the supervised engine versions accurately.
5. **Legacy Endpoint Alias Deprecation:** `/api/triscale/events` and `/api/triscale/action` remain supported as aliases for `/api/stack/events` and `/api/stack/action` through `v6.x` and are scheduled for removal no earlier than `v7.0.0`.
