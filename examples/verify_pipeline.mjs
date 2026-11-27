#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Alexander Stephen Donahue
/**
 * Runnable Example: OMEGA 4-Tier Multi-Scale Observatory v6.8.0 Core Pipeline
 * Executes standalone with zero external dependencies and zero child processes.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  OBSERVATORY_VERSION,
  normalizeGenesisConfig,
  buildRelayArgs,
  createInitialState,
  computeDifferentialsCore,
  resolveSafePath
} from "../lib/observatory_core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(__dirname, "..", "web");

// 1. Bare-metal 1,000,000-founder Genesis normalization & CLI generation
const cfg = normalizeGenesisConfig({
  preset: "million",
  n: 1_000_000,
  cap: 0,
  species: 100,
  grid: "7,6,6",
  kernels: true,
  ecores: true,
  prefetch: true,
  gpu: true,
  largePages: true,
  lab: true,
  seed: 2026
});
const relayArgs = buildRelayArgs(cfg);

// 2. 112-trait spectral differential & D7RO zero-observer-interference verification
const state = createInitialState();
const now = Date.now();
state.engines.t1_dna = true;
state.engines.t2_cells = true;
state.engines.t4_env = true;
state.dna.updatedAt = now;
state.cells.updatedAt = now;
state.creatures.updatedAt = now;
state.dna.frame = {
  ovi: 72.5, alive: 640, lineages: 48, entropy: 5.4, backlash: [1, 0],
  ledger: { int_res: 0, second_law_v: 0 },
  apex: { assembly: 26, holobiont: 120, causal_len: 36, genome_hex: "b".repeat(256) },
  traits112: Array.from({ length: 112 }, (_, i) => Number(((i % 16) / 15).toFixed(3)))
};
state.cells.telemetry = {
  covi: 80.1, alive: 512, assembly_index: 28, distinct_lineages: 41, max_tissue: 32,
  active_loci: 10, mean_mt_ghz: 6.8, backlash: [0, 1], mass_res: 0, energy_res: 0, second_law: 0
};
state.cells.bridge = {
  traits112: Array.from({ length: 112 }, (_, i) => Number((((i + 3) % 16) / 15).toFixed(3)))
};

const diff = computeDifferentialsCore(state, now);

// 3. Static asset path-traversal check
const validAsset = resolveSafePath(WEB_DIR, "index.html");
const blockedEscape = resolveSafePath(WEB_DIR, "../server.mjs");

console.log(JSON.stringify({
  version: OBSERVATORY_VERSION,
  genesis: { n: cfg.n, cap: cfg.cap, species: cfg.species, grid: cfg.grid },
  hardware_flags: {
    ecores: relayArgs.includes("--ecores"),
    large_pages: relayArgs.includes("--large-pages"),
    gpu: relayArgs[relayArgs.indexOf("--gpu") + 1],
    kernels: relayArgs[relayArgs.indexOf("--kernels") + 1],
    prefetch: relayArgs[relayArgs.indexOf("--prefetch") + 1]
  },
  metrology: {
    cosineCoherence: diff.cosineCoherence,
    meanAbsDelta: diff.meanAbsDelta,
    conservationState: diff.conservationState,
    t1_to_t3_policy: diff.matrix4x4[0][2],
    historyLength: diff.history.length
  },
  security: {
    validAssetResolved: Boolean(validAsset),
    traversalBlocked: blockedEscape === null
  }
}, null, 2));
