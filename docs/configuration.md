# Configuration Reference (`docs/configuration.md`)

## Environment Variables (`.env.example`)

| Variable | Default | Description |
|---|---|---|
| `TRISCALE_PORT` | `8790` | Loopback HTTP/SSE/WebSocket bind port on `127.0.0.1`. |
| `OBSERVATORY_NO_ENGINES` | `0` | Set to `1` (or pass `--no-engines`) to serve Hub UI and `/healthz` standalone without spawning sibling engines. |
| `ASMODENSIUS_DEMO_DIR` | Auto-resolved | Optional path override for `Asmodensius-Native/demo` used by `macro_wild_relay.py`. |
| `PYTHON_BIN` | Auto-detected | Optional Python 3.12+ interpreter path used by `tests/test_observatory.mjs` and `scripts/lint_check.mjs`. |
| `TECTONIC_BIN` | Auto-detected | Optional path to Tectonic compiler binary used by `scripts/build_paper.py`. |

## Genesis Studio & Bare-Metal Hardware Parameters

| Parameter | Valid Bounds | Default (`cambrian`) | Notes |
|---|---|---|---|
| `preset` | `cambrian`, `hyperbrain`, `hyperchaos`, `megaswarm`, `abyss`, `megagrowth`, `million` | `cambrian` | Unknown presets safely fall back to `cambrian`. |
| `n` (Founders) | `1 .. 1,000,000` | `8000` | Clamped identically in Node and Python (`--n`). |
| `cap` (Carrying Capacity) | `0` (auto) or `n .. 2,000,000` | `48000` | `0` invokes `autoCap(n)`. |
| `species` | `1 .. min(100, n)` | `100` | Aligned with upstream `WG_MAX_SPECIES = 100`. |
| `grid` | `"auto"` or `"x,y,z"` with `x,y,z in [2..8]` | `"6,6,5"` | Log2 voxel dimensions (`6,6,5` = `64x64x32`; `7,6,6` = `128x64x64`). |
| `tps` / `sps` | `tps: 0..1000`, `sps: 1..60` | `14` / `12` | `tps=0` runs uncapped; updatable live without restart. |
| `threads` | `0..64` (`0` = auto) | `0` | Worker thread count passed to `az_live.exe`. |
| `kernels` (`--kernels`) | `0` or `1` | `1` | Enables AVX2/AVX-VNNI vector kernels. |
| `ecores` (`--ecores`) | boolean | `true` | Enables all 24 physical cores (8 P-cores + 16 E-cores). |
| `prefetch` (`--prefetch`) | `0` or `1` | `1` | Enables DDR5 streaming software prefetch. |
| `gpu` (`--gpu`) | `0` or `1` | `0` | Enables NVIDIA RTX 5070 Ti CUDA PTX sparse brain offload. |
| `largePages` (`--large-pages`) | boolean | `false` | Requests 2 MiB TLB large pages (requires OS privilege). |
| `lesion` | `0x000000 .. 0x7fffff` | `0` | 23-bit behavior/cognition lesion mask (`0` = all 23 active). |
| `lab` / `seed` | boolean / `0 .. 2,147,483,647` | `false` / `42` | `false` = Wild OS entropy; `true` = reproducible seeded Lab mode. |
| `params` | `^[A-Z0-9_]+$` integer map | Preset defaults | Non-whitelisted keys or non-finite values are stripped cleanly. |

## `macro_wild_relay.py` CLI Usage

```bash
# Dry-run JSON contract resolution (works on any OS without Asmodensius-Native present)
python macro_wild_relay.py --preset million --data-dir ./runtime/dry \
  --n 1000000 --cap 0 --species 100 --kernels 1 --ecores --gpu 1 --prefetch 1 --large-pages --dry-run
```
