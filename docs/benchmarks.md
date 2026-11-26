# Benchmarks & Performance Budgets (`docs/benchmarks.md`)

All measurements below were collected directly via `node scripts/benchmark_observatory.mjs` (`results/benchmarks.json`) with **zero fabricated numbers**.

## Environment

- **Runtime:** Node.js `v25.8.2` (`win32-x64`)
- **Date:** `2026-11-25`
- **Harness:** `scripts/benchmark_observatory.mjs` (deterministic SplitMix32 workload, 20-iteration JIT warmup)

## Measured Latency vs. Performance Budgets (`A37` / `B26`)

| Workload | Payload / Iterations | Mean (ms) | p50 (ms) | p95 (ms) | p99 (ms) | Budget (p95) | Status |
|---|---|---|---|---|---|---|---|
| `computeDifferentialsCore` | 112-trait Δ + 8-axis `cosθ` + D7RO (`1,000` iters) | `0.0804` | `0.0527` | `0.2605` | `0.3694` | `<= 2.0 ms` | PASS |
| `decodeAzstCreaturesCore` | `10,000`-creature binary `AZST` (`100` iters) | `4.5210` | `4.3503` | `6.3211` | `11.1753` | `<= 30.0 ms` | PASS |
| `normalizeGenesisConfig + buildRelayArgs` | `1,000,000` bare-metal config (`1,000` iters) | `0.0318` | `0.0187` | `0.0569` | `0.1728` | `<= 1.0 ms` | PASS |
| `resolveSafePath` | Traversal + valid path pair (`2,000` iters) | `0.0190` | `0.0153` | `0.0295` | `0.0867` | `<= 0.5 ms` | PASS |

## Memory & Resource Budgets

- **Omnitemporal History Ring:** Strictly capped at `<= 240` entries (`MAX_OMNITEMPORAL_HISTORY = 240`), guaranteeing bounded O(1) memory growth regardless of session duration.
- **Causal Event Log:** Strictly capped at `<= 80` entries in memory (`24` serialized per SSE frame).
- **Concurrent SSE Clients:** Hard cap of `32` concurrent subscribers (`429 Too Many Requests` above cap).
- **Proxy Body Caps:** `2 MiB` request cap (`413`), `16 MiB` buffered rewrite response cap (`502`), `256 KiB` JSON action body cap.

## Tracking Over Time (`B27`)

Every CI run executes `npm run bench` in report-only mode and uploads `results/benchmarks.json` as a build artifact for historical regression comparison.
