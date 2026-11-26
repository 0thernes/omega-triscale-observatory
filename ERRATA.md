# Errata (`ERRATA.md`)

Published corrections to earlier versions of `omega-triscale-observatory`.

| Date | Affected Version(s) | Finding Class | Issue Identified | Resolution in v6.7.0 |
|---|---|---|---|---|
| 2026-11-25 | `v6.2.0` – `v6.6.0` | `error` | `HANDOFF.md` stated *"Verified green on Win64 Clang (`-Wall -Wextra -Werror`) and Linux GCC (`-Wall -Wextra -Werror`)"* — copy-pasted from sibling C11 engine repositories; this repo has zero C files. | Replaced with exact Node.js v25.8.2 + Python 3.12.10 + Tectonic 0.17.0 verification record in `HANDOFF.md`, `EVIDENCE.md`, and `REPLICATION.md`. |
| 2026-11-25 | `v6.3.0` – `v6.6.0` | `error` | Stale version & proof-count drift across `web/app.js` Export JSON (`v6.3`, `162 PURE LEAN 4`), `web/index.html` (`16 Lean`, `AUTOPHAGE v1.2`, `Cellulogonic v1.3`), `CLAUDE.md` (`v6.5.0`), `README.md` (`240`), and GitHub About (`v6.2`, `150`). | Unified all active code, UI, docs, metadata, and GitHub About strictly to `v6.7.0` and clearly distinguished `0` local Lean files vs. `244` upstream companion theorems. |
| 2026-11-25 | `v6.6.0` | `bug` | `populateGenesisForm(cfg)` in `web/app.js` did not hydrate the four bare-metal hardware checkboxes (`genKernels`, `genEcores`, `genPrefetch`, `genGpu`) from server state. | Added checkbox synchronization in `web/app.js`. |
| 2026-11-25 | `v6.6.0` | `hole` | Static asset containment relied on string `startsWith` without explicit NUL-byte / UNC / drive-letter rejection, and `/api/stack/shape/:clade` + `/api/stack/env-slice?z=` lacked strict `400` validation on malformed inputs. | Centralized canonical `resolveSafePath`, `validateCladeParam`, and `validateSliceZParam` in `lib/observatory_core.mjs` with negative tests and mutation kill `M1`. |
