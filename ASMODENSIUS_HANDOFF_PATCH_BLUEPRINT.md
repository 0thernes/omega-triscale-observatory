# Asmodensius-Native Handoff Patch Blueprint (Respecting Active `WRITER.lock`)

> **Lock Status Verified (`2026-11-20`):** `Z:\[Vibe Coded (AI)]\CLAUDECODE\Asmodensius-Native\build\work\WRITER.lock` is held by **live process `PID 40064` (`codex`)**. Per `Asmodensius-Native/AGENTS.md` Session Start Rule #2 (*"a live writer = read-only"*), **0 bytes were modified inside `Asmodensius-Native`**.

When PID `40064` releases `WRITER.lock`, apply these 5 surgical, Law-compliant (ASCII, LF, freestanding C23, zero float, `<=2048B` stack frame, `D7` intact) patches inside `Asmodensius-Native` and verify with `ctest` (`build/z`) + `check_text.py`:

## 1. `REP-01` — Initialize First Git Commit (Zero Risk of Data Loss)
```powershell
Set-Location -LiteralPath 'Z:\[Vibe Coded (AI)]\CLAUDECODE\Asmodensius-Native'
git status
git add .gitignore AGENTS.md CMakeLists.txt THIRD_PARTY_NOTICES.md core/ demo/ docs/ gpu/ kernels/ platform/ tests/ tools/ view/
git commit -m "Baseline: 22-module freestanding C23 engine (76/76 ctest green)"
```

## 2. `RF-12` — Eliminate UID Collision After 65,535 Births (`core/az_worldgen.c:83,853,869`)
- Currently `#define WG_SEED_BASE 0x10000u` (`65536`), colliding with creature `uid`s after 65,535 births and corrupting `parent_uid` lineage trees.
- **Fix:** Move `WG_SEED_BASE` to a disjoint high-bit `u64` namespace (`#define WG_SEED_BASE (1ULL << 62)`) and update `az_clade_found` / `az_found` seed parameters to `u64`, with a regression unit test in `tests/`.

## 3. `DEMO-16` — Remove Silent `WG_MAX_SPECIES = 100` Clamp (`core/az_worldgen.c:84,851,904`)
- Currently `x.nsp = w->cfg.n_species > WG_MAX_SPECIES ? WG_MAX_SPECIES : w->cfg.n_species;` silently clamps `--species > 100` to `100` (violating Law 7: *"refusals recorded, never a crash or silent clamp"*).
- **Fix:** Emit an explicit `AZ_EV_REFUSED` event when `w->cfg.n_species > WG_MAX_SPECIES` AND report the actual effective `n_species` in `start` JSON events (`tools/az_stream_loop.h`), or move `proto[]`/`clade_of[]` out of the 2048B stack frame into arena scratch to raise the cap cleanly to `1024`.

## 4. `demo/Start-Viewer.cmd:4` — Point From Stale `build\zv` to Current `build\z`
- Replace `set "VIEWER_BUILD=%~dp0..\build\zv"` (stale 2026-11-18 399 KB binary) with `set "VIEWER_BUILD=%~dp0..\build\z"` (current 22-module 471 KB binary).

## 5. `demo/viewer_gl.js:77,131` — Native Multi-Color Overview Shader (Eliminates All-Red Creatures)
- In `bodyVert`/`bodyFrag` (Overview/Far pass), apply gamma `sqrt(...)` and fall back to clade hue/hash when `look.y == 0u` so Overview mode matches Close-Up mode's multi-color fidelity (currently solved visually at the `:8790` Hub proxy without touching `Asmodensius-Native`).

## 6. Optional `t = 0` Founder 112-Trait Seed Interface (`docs/Genetic Engine 0.1.md`, `tools/az_live.c`)
- To preserve strict `D7` observer isolation during ticks while closing the 1-way 112-trait ABI gap, accept an optional `--traits-hex <224-hex-chars>` CLI argument applied **strictly at `t = 0` inside `az_worldgen` founder gene-fitting** (zero mid-tick mutation; `az_state_hash` 100% deterministic under `--lab`).
