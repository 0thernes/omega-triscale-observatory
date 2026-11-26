#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Alexander Stephen Donahue
/**
 * OMEGA 4-TIER OBSERVATORY — Deterministic Micro-Benchmark Harness (B26/B27)
 * Measures real execution latency of the core telemetry pipelines:
 *  - 112-trait spectral differential + 8-axis cosine + D7RO matrix update
 *  - AZST binary creature snapshot decoding (10,000 creatures)
 *  - Genesis normalization + bare-metal relay CLI generation
 *  - Safe-path resolution & loopback CSRF guard
 */

import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import {
  OBSERVATORY_VERSION,
  createInitialState,
  computeDifferentialsCore,
  decodeAzstCreaturesCore,
  normalizeGenesisConfig,
  buildRelayArgs,
  resolveSafePath,
  createSplitMix32
} from "../lib/observatory_core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function bench(name, iterations, fn) {
  // Warmup
  for (let i = 0; i < Math.min(20, iterations); i++) fn(i);
  const samples = new Float64Array(iterations);
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    fn(i);
    samples[i] = performance.now() - t0;
  }
  const sorted = Array.from(samples).sort((a, b) => a - b);
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  return {
    name,
    iterations,
    mean_ms: Number(mean.toFixed(4)),
    p50_ms: Number(p50.toFixed(4)),
    p95_ms: Number(p95.toFixed(4)),
    p99_ms: Number(p99.toFixed(4))
  };
}

// Prepare deterministic 10,000-creature AZST binary buffer
const N_CREATURES = 10_000;
const azstBuf = Buffer.alloc(80 + N_CREATURES * 24);
azstBuf.writeUInt32LE(0x54535a41, 0);
azstBuf.writeUInt16LE(2, 4);
azstBuf.writeUInt32LE(1, 12);
azstBuf.writeBigUInt64LE(500n, 16);
azstBuf.writeUInt32LE(N_CREATURES, 40);
azstBuf.writeUInt32LE(24, 44);
azstBuf.writeUInt8(6, 48);
azstBuf.writeUInt8(6, 49);
azstBuf.writeUInt8(5, 50);
azstBuf.writeUInt8(1, 51);
const rng = createSplitMix32(0x12345678);
for (let i = 0; i < N_CREATURES; i++) {
  const off = 80 + i * 24;
  azstBuf.writeUInt32LE(i + 1, off);
  azstBuf.writeUInt32LE(0, off + 4);
  azstBuf.writeUInt16LE(Math.floor(rng() * 65535), off + 8);
  azstBuf.writeUInt16LE(Math.floor(rng() * 65535), off + 10);
  azstBuf.writeUInt16LE(Math.floor(rng() * 65535), off + 12);
  azstBuf.writeUInt8(Math.floor(rng() * 255), off + 16);
  azstBuf.writeUInt8(Math.floor(rng() * 255), off + 17);
  azstBuf.writeUInt32LE(i % 100, off + 20);
}

const st = createInitialState();
const t0 = 1_700_000_000_000;
st.engines.t1_dna = true;
st.engines.t2_cells = true;
st.engines.t4_env = true;
st.dna.frame = {
  ovi: 71.2, alive: 512, lineages: 44, entropy: 5.8, backlash: [2, 1],
  ledger: { int_res: 0, second_law_v: 0 },
  apex: { assembly: 24, holobiont: 100, causal_len: 32, genome_hex: "f".repeat(256) },
  traits112: Array.from({ length: 112 }, (_, k) => (k % 17) / 16)
};
st.cells.telemetry = {
  covi: 79.4, alive: 410, assembly_index: 25, distinct_lineages: 39, max_tissue: 30,
  active_loci: 10, mean_mt_ghz: 6.2, backlash: [1, 0], mass_res: 0, energy_res: 0, second_law: 0
};
st.cells.bridge = { traits112: Array.from({ length: 112 }, (_, k) => ((k + 5) % 17) / 16) };

const results = {
  version: OBSERVATORY_VERSION,
  node: process.version,
  platform: `${process.platform}-${process.arch}`,
  timestamp_utc: new Date().toISOString(),
  benchmarks: [
    bench("computeDifferentialsCore (112-trait + 8-axis + D7RO)", 1000, (i) => {
      const now = t0 + i * 10;
      st.dna.updatedAt = now;
      st.cells.updatedAt = now;
      st.creatures.updatedAt = now;
      computeDifferentialsCore(st, now);
    }),
    bench("decodeAzstCreaturesCore (10,000 creatures binary AZST)", 100, () => {
      decodeAzstCreaturesCore(azstBuf, "0000000000000100");
    }),
    bench("normalizeGenesisConfig + buildRelayArgs (1M bare-metal)", 1000, () => {
      buildRelayArgs(normalizeGenesisConfig({
        preset: "million", n: 1_000_000, ecores: true, gpu: true, prefetch: true, kernels: true, largePages: true
      }));
    }),
    bench("resolveSafePath traversal guard", 2000, () => {
      resolveSafePath(path.join(ROOT, "web"), "../server.mjs");
      resolveSafePath(path.join(ROOT, "web"), "index.html");
    })
  ]
};

const outDir = path.join(ROOT, "results");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "benchmarks.json"), JSON.stringify(results, null, 2) + "\n", "utf8");
for (const b of results.benchmarks) {
  console.log(`  ${b.name.padEnd(58)} mean=${b.mean_ms.toFixed(4)}ms  p50=${b.p50_ms.toFixed(4)}ms  p95=${b.p95_ms.toFixed(4)}ms`);
}
