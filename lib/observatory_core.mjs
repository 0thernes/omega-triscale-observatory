// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Alexander Stephen Donahue
/**
 * OMEGA 4-TIER OBSERVATORY — Pure Deterministic Core Logic (v6.8.0)
 *
 * Separates all security boundary guards, Genesis configuration clamping,
 * bare-metal hardware flag assembly, AZST binary telemetry decoding,
 * 112-trait spectral differentials, omnitemporal ring buffering (<= 240),
 * and D7 read-only observer-independence matrix invariants into a pure,
 * zero-dependency ES module suitable for unit, property, metamorphic,
 * contract, and mutation testing on Windows and Linux.
 */

import path from "node:path";

export const OBSERVATORY_VERSION = "6.8.0";
export const MAX_OMNITEMPORAL_HISTORY = 240;
export const MAX_GENESIS_POPULATION = 1_000_000;
export const MAX_GENESIS_CAP = 2_000_000;
export const MAX_FOUNDER_SPECIES = 100;
export const LESION_MASK_23 = 0x7fffff;

export const SOLVENT_NAMES = Object.freeze([
  "0 · Terran Aqueous H2O",
  "1 · Titan Cryo CH4/N2",
  "2 · Hydrothermal GDGT",
  "3 · Venusian H2SO4"
]);

export const GENESIS_PRESETS = Object.freeze({
  cambrian: {
    preset: "cambrian", n: 8000, cap: 48000, species: 100, grid: "6,6,5", tps: 14, sps: 12, threads: 0,
    kernels: true, ecores: true, prefetch: true, gpu: false, largePages: false, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 6, BRAIN_DENSITY: 148, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 14, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 190, FAMILY_SPACE: 20480, COLONY_FOUND: 14, WORLDGEN_VARY_LOCI: 36, WORLDGEN_VENTS: 52, WORLDGEN_SEA_LEVEL: 162, LIFE_SIZE_MU: 22 }
  },
  hyperbrain: {
    preset: "hyperbrain", n: 6000, cap: 40000, species: 100, grid: "6,6,5", tps: 12, sps: 12, threads: 0,
    kernels: true, ecores: true, prefetch: true, gpu: false, largePages: false, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 12, BRAIN_DENSITY: 224, NEURO_RATE: 480, TIER1_LEARN_SHIFT: 12, EXPR_MUT_RATE: 280, GENE_NEW_RATE: 220, FAMILY_SPACE: 24576, COLONY_FOUND: 36, WORLDGEN_VARY_LOCI: 38, WORLDGEN_VENTS: 48, WORLDGEN_SEA_LEVEL: 164, LIFE_SIZE_MU: 24 }
  },
  hyperchaos: {
    preset: "hyperchaos", n: 10000, cap: 65536, species: 100, grid: "6,6,5", tps: 18, sps: 12, threads: 0,
    kernels: true, ecores: true, prefetch: true, gpu: false, largePages: false, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 8, BRAIN_DENSITY: 168, NEURO_RATE: 512, TIER1_LEARN_SHIFT: 13, EXPR_MUT_RATE: 640, GENE_NEW_RATE: 380, FAMILY_SPACE: 32768, COLONY_FOUND: 20, WORLDGEN_VARY_LOCI: 48, WORLDGEN_VENTS: 64, WORLDGEN_SEA_LEVEL: 158, LIFE_SIZE_MU: 22 }
  },
  megaswarm: {
    preset: "megaswarm", n: 24000, cap: 110000, species: 100, grid: "6,6,5", tps: 12, sps: 10, threads: 0,
    kernels: true, ecores: true, prefetch: true, gpu: false, largePages: false, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 5, BRAIN_DENSITY: 128, NEURO_RATE: 300, TIER1_LEARN_SHIFT: 15, EXPR_MUT_RATE: 360, GENE_NEW_RATE: 220, FAMILY_SPACE: 24576, COLONY_FOUND: 24, WORLDGEN_VARY_LOCI: 38, WORLDGEN_VENTS: 56, WORLDGEN_SEA_LEVEL: 168, LIFE_SIZE_MU: 18 }
  },
  abyss: {
    preset: "abyss", n: 8000, cap: 48000, species: 100, grid: "6,6,5", tps: 14, sps: 12, threads: 0,
    kernels: true, ecores: true, prefetch: true, gpu: false, largePages: false, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 7, BRAIN_DENSITY: 156, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 14, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 200, FAMILY_SPACE: 16384, COLONY_FOUND: 16, WORLDGEN_VARY_LOCI: 38, WORLDGEN_VENTS: 64, WORLDGEN_SEA_LEVEL: 224, LIFE_SIZE_MU: 24 }
  },
  megagrowth: {
    preset: "megagrowth", n: 250000, cap: 1004096, species: 100, grid: "6,6,5", tps: 0, sps: 6, threads: 0,
    kernels: true, ecores: true, prefetch: true, gpu: false, largePages: false, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 5, BRAIN_DENSITY: 128, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 15, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 190, FAMILY_SPACE: 20480, COLONY_FOUND: 20, WORLDGEN_VARY_LOCI: 36, WORLDGEN_VENTS: 52, WORLDGEN_SEA_LEVEL: 164, LIFE_SIZE_MU: 18 }
  },
  million: {
    preset: "million", n: 1000000, cap: 1004096, species: 100, grid: "7,6,6", tps: 0, sps: 4, threads: 0,
    kernels: true, ecores: true, prefetch: true, gpu: false, largePages: false, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 5, BRAIN_DENSITY: 128, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 15, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 190, FAMILY_SPACE: 20480, COLONY_FOUND: 20, WORLDGEN_VARY_LOCI: 36, WORLDGEN_VENTS: 52, WORLDGEN_SEA_LEVEL: 164, LIFE_SIZE_MU: 18 }
  }
});

/** Deterministic SplitMix32 PRNG factory (zero dependency on Math.random). */
export function createSplitMix32(seed = 0x5EED6301) {
  let state = seed >>> 0;
  return function nextRand() {
    state = (state + 0x9E3779B9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x85EBCA6B) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xC2B2AE35) >>> 0;
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };
}

export function clampInt(val, lo, hi, fallback) {
  if (val === null || val === undefined || val === "") return fallback;
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export function parseBoolFlag(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return Number.isFinite(val) ? val !== 0 : fallback;
  const s = String(val).trim().toLowerCase();
  if (s === "") return fallback;
  if (s === "0" || s === "false" || s === "no" || s === "off" || s === "f" || s === "n") return false;
  if (s === "1" || s === "true" || s === "yes" || s === "on" || s === "t" || s === "y") return true;
  const n = Number(s);
  if (Number.isFinite(n)) return n !== 0;
  return fallback;
}

export function isLoopbackHost(hostHdr) {
  if (!hostHdr || typeof hostHdr !== "string") return false;
  return /^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i.test(hostHdr.trim());
}

export function isLoopbackOrigin(originHdr) {
  if (!originHdr || typeof originHdr !== "string") return true;
  return /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i.test(originHdr.trim());
}

export function isSafeLoopbackRequest(req, requireJson = false) {
  const headers = req?.headers || {};
  if (!isLoopbackHost(headers.host)) return false;
  if (headers.origin && !isLoopbackOrigin(headers.origin)) return false;
  const sfs = String(headers["sec-fetch-site"] || "").toLowerCase();
  if (sfs && sfs !== "same-origin" && sfs !== "same-site" && sfs !== "none") return false;
  if (requireJson) {
    const ct = String(headers["content-type"] || "").toLowerCase();
    if (!ct.includes("application/json")) return false;
  }
  return true;
}

/**
 * Resolve a relative asset path strictly inside `baseDir`.
 * Rejects null bytes, drive prefixes, backslashes escaping root, and `..` traversal.
 */
export function resolveSafePath(baseDir, rawRelPath) {
  if (typeof rawRelPath !== "string") return null;
  if (rawRelPath.includes("\0")) return null;
  const normalized = rawRelPath.replace(/\\/g, "/");
  // Reject explicit drive-letter or UNC prefixes like "C:/..." or "//server/..."
  if (/^[A-Za-z]:/.test(normalized) || normalized.startsWith("//")) return null;
  const stripped = normalized.replace(/^\/+/, "");
  const root = path.resolve(baseDir);
  const candidate = path.resolve(root, stripped);
  const rel = path.relative(root, candidate);
  if (!rel || rel === ".") return root;
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return candidate;
}

export function validateCladeParam(rawStr) {
  if (typeof rawStr !== "string" || !/^\d{1,10}$/.test(rawStr.trim())) return null;
  const n = Number(rawStr.trim());
  if (!Number.isSafeInteger(n) || n < 0 || n > 0xffffffff) return null;
  return n;
}

export function validateSliceZParam(rawStr) {
  if (rawStr === null || rawStr === undefined) return { ok: true, value: null };
  if (typeof rawStr !== "string" || !/^-?\d{1,4}$/.test(rawStr.trim())) return { ok: false, value: null };
  const n = Number(rawStr.trim());
  if (!Number.isSafeInteger(n) || n < 0 || n > 255) return { ok: false, value: null };
  return { ok: true, value: n };
}

export function autoCap(n) {
  const safeN = clampInt(n, 1, MAX_GENESIS_POPULATION, 8000);
  return safeN <= 250000
    ? Math.min(1004096, safeN * 4 + 4096)
    : Math.max(safeN + 4096, 1004096);
}

export function sanitizeGridSpec(rawGrid, fallback = "6,6,5") {
  if (rawGrid === null || rawGrid === undefined || rawGrid === "") return fallback;
  const s = String(rawGrid).trim();
  if (s.toLowerCase() === "auto") return "auto";
  if (/^\d+,\d+,\d+$/.test(s)) {
    return s.split(",").map((g) => clampInt(g, 2, 8, 6)).join(",");
  }
  return fallback;
}

export function sanitizeParamsObject(rawParams) {
  const out = {};
  if (!rawParams || typeof rawParams !== "object" || Array.isArray(rawParams)) return out;
  for (const [k, v] of Object.entries(rawParams)) {
    if (/^[A-Z0-9_]+$/.test(k) && v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v))) {
      out[k] = Math.round(Number(v));
    }
  }
  return out;
}

export function normalizeGenesisConfig(presetOrCfg = "cambrian") {
  if (typeof presetOrCfg === "string") {
    const key = Object.prototype.hasOwnProperty.call(GENESIS_PRESETS, presetOrCfg)
      ? presetOrCfg
      : "cambrian";
    return structuredClone(GENESIS_PRESETS[key]);
  }
  const src = (presetOrCfg && typeof presetOrCfg === "object") ? presetOrCfg : {};
  const baseKey = Object.prototype.hasOwnProperty.call(GENESIS_PRESETS, src.preset)
    ? src.preset
    : "cambrian";
  const base = structuredClone(GENESIS_PRESETS[baseKey]);
  const nVal = clampInt(src.n, 1, MAX_GENESIS_POPULATION, base.n);
  const rawCap = clampInt(src.cap, 0, MAX_GENESIS_CAP, 0);
  const capVal = rawCap > 0 ? Math.max(nVal, rawCap) : autoCap(nVal);
  const spVal = Math.min(clampInt(src.species, 1, MAX_FOUNDER_SPECIES, base.species), nVal);
  const lesionVal = (clampInt(src.lesion, 0, LESION_MASK_23, base.lesion) >>> 0) & LESION_MASK_23;

  return {
    preset: baseKey,
    n: nVal,
    cap: capVal,
    species: spVal,
    grid: sanitizeGridSpec(src.grid, base.grid),
    tps: clampInt(src.tps, 0, 1000, base.tps),
    sps: clampInt(src.sps, 1, 60, base.sps),
    threads: clampInt(src.threads, 0, 64, base.threads),
    kernels: parseBoolFlag(src.kernels, base.kernels),
    ecores: parseBoolFlag(src.ecores, base.ecores),
    prefetch: parseBoolFlag(src.prefetch, base.prefetch),
    gpu: parseBoolFlag(src.gpu, base.gpu),
    largePages: parseBoolFlag(src.largePages, base.largePages),
    lesion: lesionVal,
    lab: parseBoolFlag(src.lab, base.lab),
    seed: clampInt(src.seed, 0, 2147483647, base.seed),
    params: { ...base.params, ...sanitizeParamsObject(src.params) }
  };
}

export function buildRelayArgs(cfgInput, opts = {}) {
  const cfg = normalizeGenesisConfig(cfgInput);
  const macroRelay = opts.macroRelay || "macro_wild_relay.py";
  const macroPort = opts.macroPort ?? 8794;
  const macroDataDir = opts.macroDataDir || "runtime/macro-wild-data";
  const macroEngine = opts.macroEngine || "az_live.exe";

  const args = [
    "-I", "-B", macroRelay,
    "--port", String(macroPort),
    "--preset", cfg.preset,
    "--data-dir", macroDataDir,
    "--engine", macroEngine,
    "--n", String(cfg.n),
    "--cap", String(cfg.cap),
    "--species", String(cfg.species),
    "--grid", String(cfg.grid || "auto"),
    "--tps", String(cfg.tps),
    "--sps", String(cfg.sps),
    "--threads", String(cfg.threads),
    "--kernels", String(cfg.kernels ? 1 : 0),
    "--gpu", String(cfg.gpu ? 1 : 0),
    "--prefetch", String(cfg.prefetch ? 1 : 0),
    "--lesion", "0x" + ((Number(cfg.lesion) || 0) & LESION_MASK_23).toString(16)
  ];
  if (cfg.ecores) args.push("--ecores");
  if (cfg.largePages) args.push("--large-pages");
  if (cfg.lab) {
    args.push("--lab");
    if (Number.isFinite(Number(cfg.seed))) {
      args.push("--seed", String(Math.max(0, Math.round(Number(cfg.seed)))));
    }
  }
  const cleanParams = sanitizeParamsObject(cfg.params);
  const pairs = Object.entries(cleanParams).map(([k, v]) => `${k}=${v}`);
  if (pairs.length) args.push("--param", pairs.join(","));
  return args;
}

export function shannonBits(counts, total) {
  if (!total || total <= 0) return 0;
  let h = 0;
  for (const c of counts) {
    if (c > 0) {
      const p = c / total;
      h -= p * Math.log2(p);
    }
  }
  return Number(h.toFixed(3));
}

export function rollingVariance(arr) {
  if (!Array.isArray(arr) || arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, x) => s + (x - mean) * (x - mean), 0) / arr.length;
}

export function deriveDnaSeed32(dnaFrame, fallbackRandFn) {
  const a = dnaFrame?.apex;
  if (!a) {
    const r = typeof fallbackRandFn === "function" ? fallbackRandFn() : 0.5;
    return Math.floor(r * 89999999) + 1000;
  }
  const rHi = parseInt(String(a.ribo_hex || "0").slice(0, 8), 16) || 1;
  const rLo = parseInt(String(a.ribo_hex || "0").slice(8, 16), 16) || 1;
  const addr = parseInt(String(a.addr || "0"), 16) || 1;
  return (((rHi ^ rLo ^ addr ^ ((a.poly || 1) * 2654435761) ^ (Number(dnaFrame.epoch) || 1)) >>> 0) % 89999999) + 1;
}

export function uidToSeed32(uidHex) {
  const hi = parseInt(String(uidHex || "0").slice(0, 8), 16) || 0;
  const lo = parseInt(String(uidHex || "0").slice(8, 16), 16) || 0;
  return (((hi ^ lo ^ 0x5A0DE115) >>> 0) % 89999999) + 1;
}

export function sanitizeProxyHeaders(rawHeaders) {
  const out = { ...(rawHeaders || {}) };
  for (const k of Object.keys(out)) {
    const lk = k.toLowerCase();
    if (lk === "x-frame-options") {
      out[k] = "SAMEORIGIN";
    } else if (lk === "content-security-policy" && typeof out[k] === "string") {
      out[k] = out[k].replace(/frame-ancestors\s+'none'/gi, "frame-ancestors 'self'");
    }
  }
  return out;
}

export function createInitialState() {
  return {
    engines: { t1_dna: false, t2_cells: false, t2_omega: false, t3_noetic: false, t3_creatures: false, t4_env: false },
    paused: false,
    omegaFeral: false,
    cosmosPreset: "cambrian",
    omega: null,
    noetic: null,
    coupling: {
      autoCouple: true,
      envToCellsSolvent: true,
      reseedOnLock: false,
      antiMonoculture: true,
      monocultureRenewals: 0,
      waveMode: "manual",
      wavePhase: 0,
      restraints: new Array(13).fill(0),
      activeSolvent: 0,
      activeRegime: 5,
      transfections: 0,
      envSolventSwitches: 0,
      creaturePlumes: 0,
      creatureShocks: 0,
      lastTransfectAt: 0,
      lastTransfectSig: "",
      lastMacroActionAt: 0,
      lastEnvSyncAt: 0,
      lastApexKey: ""
    },
    env: {
      runId: null, tick: 0, dims: [0, 0, 0], wild: true, observerFail: 0,
      lightVec: [0, 0, 1], daylightPct: 0, meanTemp: 0, maxTemp: 0,
      ventCount: 0, ventMeanTemp: 0, sunPeriods: [0, 0],
      solventDist: [0, 0, 0, 0], vents: [], sliceZ: 8, updatedAt: 0
    },
    creatures: {
      population: 0,
      clades: 0,
      activeClades: 0,
      shapesCached: 0,
      cladeEntropyBits: 0,
      hueEntropyBits: 0,
      hueSpectrum24: new Array(24).fill(0),
      aggregation: { singular: 0, clustered: 0, globular: 0, meanRadius: 0, stdRadius: 0 },
      topClades: [],
      roster: [],
      cladeSamples: new Map(),
      lockedUid: null,
      lockedVisual: null,
      locked: null,
      prevLocked: null,
      localHabitat: null,
      lastSnapSeq: -1,
      updatedAt: 0
    },
    cells: { telemetry: null, bridge: null, updatedAt: 0 },
    dna: { ready: null, frame: null, updatedAt: 0 },
    differential: {
      cosineCoherence: 0,
      meanAbsDelta: 0,
      rmsDelta: 0,
      maxAbsDelta: 0,
      maxDeltaIdx: 0,
      vitalityMargin: 0,
      velocityDelta: 0,
      chaosLyapunov: 0,
      crossTierAnew: 0,
      varOvi: 0,
      varCovi: 0,
      varDelta: 0,
      varCladeH: 0,
      entropyVelocity: 0,
      backlashTotal: 0,
      conservationOk: false,
      conservationState: "DEGRADED",
      signedDelta112: new Array(112).fill(0),
      gradientSlope111: new Array(111).fill(0),
      matrix4x4: [
        [{ m: "SELF", s: 1 }, { m: "OFF", s: 0 }, { m: "D7RO", s: 0 }, { m: "D7RO", s: 0 }],
        [{ m: "CORR", s: 0 }, { m: "SELF", s: 1 }, { m: "D7RO", s: 0 }, { m: "D7RO", s: 0 }],
        [{ m: "OFF", s: 0 }, { m: "OFF", s: 0 }, { m: "SELF", s: 1 }, { m: "NAT", s: 0.4 }],
        [{ m: "OFF", s: 0 }, { m: "OFF", s: 0 }, { m: "NAT", s: 0.4 }, { m: "SELF", s: 1 }]
      ],
      history: []
    },
    events: []
  };
}

/**
 * Pure in-place update of 112-trait spectral differentials, 8-axis biophysical cosine
 * coherence, thermodynamic/observer conservation gate, omnitemporal history ring
 * (capped strictly <= 240), and honest D7RO-enforcing 4x4 coupling matrix.
 */
export function computeDifferentialsCore(state, now = Date.now()) {
  const dnaT   = state.dna.frame?.traits112;
  const cellsT = state.cells.bridge?.traits112;
  const d = state.differential;
  const prevMean = d.meanAbsDelta || 0;
  const prevH = d.history.length ? d.history[d.history.length - 1].cladeH : state.creatures.cladeEntropyBits;

  // 1. Raw 112-element projections clamped strictly to [0, 1]
  if (Array.isArray(dnaT) && dnaT.length === 112 && Array.isArray(cellsT) && cellsT.length === 112) {
    let sumAbs = 0, sumSq = 0, maxAbs = 0, maxIdx = 0;
    const signed = new Array(112);
    for (let i = 0; i < 112; i++) {
      const a = Math.max(0, Math.min(1, Number(dnaT[i]) || 0));
      const b = Math.max(0, Math.min(1, Number(cellsT[i]) || 0));
      const diff = b - a, ad = Math.abs(diff);
      signed[i] = Number(diff.toFixed(4));
      sumAbs += ad; sumSq += diff * diff;
      if (ad > maxAbs) { maxAbs = ad; maxIdx = i; }
    }
    const grad = new Array(111);
    for (let i = 0; i < 111; i++) grad[i] = Number((signed[i + 1] - signed[i]).toFixed(4));
    d.meanAbsDelta = Number((sumAbs / 112).toFixed(4));
    d.rmsDelta = Number(Math.sqrt(sumSq / 112).toFixed(4));
    d.maxAbsDelta = Number(maxAbs.toFixed(4));
    d.maxDeltaIdx = maxIdx;
    d.velocityDelta = Number((d.meanAbsDelta - prevMean).toFixed(4));
    d.signedDelta112 = signed;
    d.gradientSlope111 = grad;
  }

  // 2. Semantically Aligned 8-Axis Biophysical Cosine Coherence
  const f1 = state.dna.frame;
  const ct = state.cells.telemetry;
  if (f1 && ct) {
    const b1 = Array.isArray(f1.backlash) ? f1.backlash.reduce((x, y) => x + y, 0) : 0;
    const b2 = Array.isArray(ct.backlash) ? ct.backlash.reduce((x, y) => x + y, 0) : 0;
    const v1 = [
      Math.max(0, Math.min(1, (Number(f1.ovi) || 0) / 100)),
      Math.max(0, Math.min(1, (Number(f1.alive) || 0) / 1024)),
      Math.max(0, Math.min(1, (Number(f1.apex?.assembly) || 0) / 40)),
      Math.max(0, Math.min(1, (Number(f1.lineages) || 0) / 128)),
      Math.max(0, Math.min(1, (Number(f1.apex?.holobiont) || 0) / 256)),
      Math.max(0, Math.min(1, (Number(f1.apex?.causal_len) || 0) / 64)),
      Math.max(0, Math.min(1, (Number(f1.entropy) || 0) / 8)),
      Math.max(0, Math.min(1, Math.log1p(Math.max(0, b1)) / 10))
    ];
    const v2 = [
      Math.max(0, Math.min(1, (Number(ct.covi) || 0) / 100)),
      Math.max(0, Math.min(1, (Number(ct.alive) || 0) / 1024)),
      Math.max(0, Math.min(1, (Number(ct.assembly_index) || 0) / 40)),
      Math.max(0, Math.min(1, (Number(ct.distinct_lineages) || 0) / 128)),
      Math.max(0, Math.min(1, (Number(ct.max_tissue) || 0) / 64)),
      Math.max(0, Math.min(1, (Number(ct.active_loci) || 0) / 16)),
      Math.max(0, Math.min(1, (Number(ct.mean_mt_ghz) || 0) / 12)),
      Math.max(0, Math.min(1, Math.log1p(Math.max(0, b2)) / 10))
    ];
    let dot = 0, nA = 0, nB = 0;
    for (let k = 0; k < 8; k++) { dot += v1[k] * v2[k]; nA += v1[k] * v1[k]; nB += v2[k] * v2[k]; }
    d.cosineCoherence = (nA > 1e-9 && nB > 1e-9)
      ? Number(Math.max(0, Math.min(1, dot / (Math.sqrt(nA) * Math.sqrt(nB)))).toFixed(4))
      : 0;
  }

  const covi = state.cells.telemetry?.covi ?? 0;
  const ovi  = state.dna.frame?.ovi ?? 0;
  d.vitalityMargin = Number((covi - ovi).toFixed(2));
  d.backlashTotal = (state.cells.telemetry?.backlash?.reduce((a, b) => a + b, 0) ?? 0) +
                    (state.dna.frame?.backlash?.reduce((a, b) => a + b, 0) ?? 0);

  const hasDna   = Boolean(state.engines.t1_dna && state.dna.frame?.ledger && (now - state.dna.updatedAt < 15000));
  const hasCells = Boolean(state.engines.t2_cells && state.cells.telemetry && (now - state.cells.updatedAt < 15000));
  const hasMacro = Boolean(state.engines.t4_env && (now - state.creatures.updatedAt < 15000));
  const cellsAlert = Boolean(state.cells.telemetry && (state.cells.telemetry.mass_res !== 0 || state.cells.telemetry.energy_res !== 0 || state.cells.telemetry.second_law !== 0));
  const dnaAlert   = Boolean(state.dna.frame?.ledger && (state.dna.frame.ledger.int_res !== 0 || state.dna.frame.ledger.second_law_v !== 0));
  const obsAlert   = state.env.observerFail !== 0;

  if (cellsAlert || dnaAlert || obsAlert) {
    d.conservationState = "ALERT";
    d.conservationOk = false;
  } else if (hasDna && hasCells && hasMacro) {
    d.conservationState = "VERIFIED";
    d.conservationOk = true;
  } else {
    d.conservationState = "DEGRADED";
    d.conservationOk = false;
  }

  const lk = state.creatures.locked;
  const hab = state.creatures.localHabitat;
  d.entropyVelocity = Number((state.creatures.cladeEntropyBits - prevH).toFixed(4));

  d.history.push({
    t: now,
    ovi, covi,
    coh: d.cosineCoherence,
    delta: d.meanAbsDelta,
    ghz: state.cells.telemetry?.mean_mt_ghz ?? 0,
    cEnergy: lk?.found ? Number(lk.energy) || 0 : 0,
    cHealth: lk?.found ? Number(lk.health) || 0 : 0,
    envTemp: hab ? hab.tempPct : state.env.meanTemp,
    envLight: hab ? hab.lightPct : state.env.daylightPct,
    cladeH: state.creatures.cladeEntropyBits,
    hueH: state.creatures.hueEntropyBits,
    activeClades: state.creatures.activeClades,
    backlash: d.backlashTotal
  });
  while (d.history.length > MAX_OMNITEMPORAL_HISTORY) d.history.shift();

  const win = d.history.slice(-32);
  d.varOvi    = Number(rollingVariance(win.map((x) => x.ovi)).toFixed(2));
  d.varCovi   = Number(rollingVariance(win.map((x) => x.covi)).toFixed(2));
  d.varDelta  = Number(rollingVariance(win.map((x) => x.delta)).toFixed(5));
  d.varCladeH = Number(rollingVariance(win.map((x) => x.cladeH)).toFixed(4));

  if (win.length >= 4) {
    let jumps = 0;
    for (let i = 1; i < win.length; i++) {
      jumps += Math.abs(win[i].delta - win[i - 1].delta) * 6 +
               Math.abs(win[i].ovi - win[i - 1].ovi) / 40 +
               Math.abs(win[i].covi - win[i - 1].covi) / 40 +
               Math.abs(win[i].envTemp - win[i - 1].envTemp) / 80;
    }
    const rawVol = jumps / (win.length - 1);
    const entBoost = (state.creatures.hueEntropyBits / 4.58) * 0.45 + (state.dna.frame?.entropy ? (state.dna.frame.entropy / 8) * 0.25 : 0);
    d.chaosLyapunov = Number(Math.max(0, Math.min(1, rawVol * 0.45 + entBoost)).toFixed(3));
  }

  const t1Anew = Number(state.dna.frame?.bp_anew ?? 0);
  const t2Anew = Number(state.cells.telemetry?.bedau_anew ?? 0);
  const t3CladeNorm = Number(((state.creatures.activeClades ?? 0) / 1000).toFixed(3));
  d.crossTierAnew = Number((t1Anew + t2Anew + t3CladeNorm).toFixed(2));

  // Strictly honest 4x4 Coupling Matrix enforcing Asmodensius D7 Read-Only Observer Boundary:
  const hasReal128 = Boolean(state.dna.frame?.apex?.genome_hex && state.dna.frame.apex.genome_hex.length === 256);
  const c12 = state.coupling.autoCouple ? Math.min(1, 0.35 + d.cosineCoherence * 0.45 + Math.min(0.20, state.coupling.transfections * 0.02)) : 0;
  const c42 = (state.coupling.autoCouple && state.coupling.envToCellsSolvent) ? Math.min(1, 0.55 + (state.env.maxTemp / 250)) : 0;
  const c32 = (state.coupling.autoCouple && lk?.found) ? Math.min(1, 0.50 + Math.min(0.50, (state.coupling.creaturePlumes + state.coupling.creatureShocks) * 0.05)) : 0;
  const c43 = hab ? Math.min(1, 0.75 + (1 - Math.min(1, hab.nearestVentDist / 30)) * 0.25) : 0.40;
  const c31 = (state.coupling.autoCouple && state.coupling.reseedOnLock) ? 0.85 : 0;
  const c41 = (state.coupling.waveMode === "adaptive") ? 0.88 : 0;
  d.matrix4x4 = [
    [{ m: "SELF", s: 1 }, { m: c12 > 0 ? (hasReal128 ? "DNA128" : "SEED") : "OFF", s: Number(c12.toFixed(2)) }, { m: "D7RO", s: 0 }, { m: "D7RO", s: 0 }],
    [{ m: "CORR", s: Number(d.cosineCoherence.toFixed(2)) }, { m: "SELF", s: 1 }, { m: "D7RO", s: 0 }, { m: "D7RO", s: 0 }],
    [{ m: c31 > 0 ? "SEED" : "OFF", s: Number(c31.toFixed(2)) }, { m: c32 > 0 ? "LIVE" : "OFF", s: Number(c32.toFixed(2)) }, { m: "SELF", s: 1 }, { m: "NAT", s: Number(c43.toFixed(2)) }],
    [{ m: c41 > 0 ? "WAVE" : "OFF", s: Number(c41.toFixed(2)) }, { m: c42 > 0 ? "LIVE" : "OFF", s: Number(c42.toFixed(2)) }, { m: "NAT", s: Number(c43.toFixed(2)) }, { m: "SELF", s: 1 }]
  ];
  return d;
}

export function decodeAzstCreaturesCore(buf, lockedUid = null) {
  if (!buf || buf.length < 80 || buf.readUInt32LE(0) !== 0x54535a41 || buf.readUInt16LE(4) !== 2) return null;
  const seq = buf.readUInt32LE(12);
  const tick = Number(buf.readBigUInt64LE(16));
  const count = buf.readUInt32LE(16 + 24);
  if (buf.readUInt32LE(16 + 28) !== 24 || buf.length < 80 + count * 24) return null;
  const dims = [1 << buf.readUInt8(16 + 32), 1 << buf.readUInt8(16 + 33), 1 << buf.readUInt8(16 + 34)];
  const wild = buf.readUInt8(16 + 35) === 1;
  const lightVec = [
    Number((buf.readInt8(16 + 44) / 127).toFixed(3)),
    Number((buf.readInt8(16 + 45) / 127).toFixed(3)),
    Number((buf.readInt8(16 + 46) / 127).toFixed(3))
  ];
  const clades = buf.readUInt32LE(16 + 48);
  const failures = buf.readUInt32LE(16 + 52);

  const cladeCounts = new Map();
  const cladeSamples = new Map();
  const hueBins = new Array(24).fill(0);
  const voxelOcc = new Map();
  const roster = [];
  const stride = Math.max(1, Math.floor(count / 24));
  let lockedVis = null;
  let sumR = 0, sumR2 = 0;

  for (let i = 0; i < count; i++) {
    const off = 80 + i * 24;
    const lo = buf.readUInt32LE(off);
    const hi = buf.readUInt32LE(off + 4);
    const x16 = buf.readUInt16LE(off + 8), y16 = buf.readUInt16LE(off + 10), z16 = buf.readUInt16LE(off + 12);
    const rByte = buf.readUInt8(off + 16);
    const hueByte = buf.readUInt8(off + 17);
    const clade = buf.readUInt32LE(off + 20);

    const rad = (rByte + 1) / 32;
    sumR += rad; sumR2 += rad * rad;
    hueBins[Math.min(23, Math.floor((hueByte / 256) * 24))]++;
    cladeCounts.set(clade, (cladeCounts.get(clade) || 0) + 1);

    const key = ((x16 >> 12) << 7) | ((y16 >> 12) << 3) | (z16 >> 13);
    voxelOcc.set(key, (voxelOcc.get(key) || 0) + 1);

    const needCladeRep = !cladeSamples.has(clade);
    const needRoster = (roster.length < 24 && (i % stride === 0));
    let uid = null;
    if (needCladeRep || needRoster || lockedUid) {
      uid = hi.toString(16).padStart(8, "0") + lo.toString(16).padStart(8, "0");
    }
    if (needCladeRep && uid) cladeSamples.set(clade, uid);
    const isLocked = Boolean(lockedUid && uid === lockedUid);

    if ((needRoster || isLocked) && uid) {
      const rec = {
        uid, clade,
        x: Number(((x16 / 65536) * dims[0]).toFixed(1)),
        y: Number(((y16 / 65536) * dims[1]).toFixed(1)),
        z: Number(((z16 / 65536) * dims[2]).toFixed(1)),
        yaw: Number(((buf.readUInt8(off + 14) * Math.PI * 2) / 256).toFixed(2)),
        pitch: Number((((buf.readUInt8(off + 15) > 127 ? buf.readUInt8(off + 15) - 256 : buf.readUInt8(off + 15)) * (Math.PI / 2)) / 127).toFixed(2)),
        radius: Number(rad.toFixed(2)),
        hue: Number((hueByte / 255).toFixed(3)),
        pattern: buf.readUInt8(off + 18),
        flags: buf.readUInt8(off + 19)
      };
      if (needRoster) roster.push(rec);
      if (isLocked) lockedVis = rec;
    }
  }

  let singular = 0, clustered = 0, globular = 0;
  for (const occ of voxelOcc.values()) {
    if (occ === 1) singular += occ;
    else if (occ <= 6) clustered += occ;
    else globular += occ;
  }

  const meanR = count ? sumR / count : 0;
  const stdR  = count ? Math.sqrt(Math.max(0, sumR2 / count - meanR * meanR)) : 0;
  const topClades = [...cladeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const cladeEntropyBits = shannonBits(cladeCounts.values(), count);
  const hueEntropyBits   = shannonBits(hueBins, count);

  return {
    seq, tick, count, dims, wild, lightVec, clades,
    activeClades: cladeCounts.size, failures, roster, topClades, cladeSamples,
    hueBins, cladeEntropyBits, hueEntropyBits,
    aggregation: { singular, clustered, globular, meanRadius: Number(meanR.toFixed(2)), stdRadius: Number(stdR.toFixed(2)) },
    lockedVis
  };
}

export function sampleLocalHabitatCore(rawCache, posVal, lockedVis = null) {
  if (!rawCache?.dims || !rawCache?.fields) return null;
  const [gx, gy, gz] = rawCache.dims;
  let fx = 0.5, fy = 0.5, fz = 0.5;
  if (Array.isArray(posVal) && posVal.length >= 3) {
    fx = Number(posVal[0]); fy = Number(posVal[1]); fz = Number(posVal[2]);
    const mx = Math.max(Math.abs(fx), Math.abs(fy), Math.abs(fz));
    if (mx > Math.max(gx, gy, gz) * 1.5) { fx /= 65536; fy /= 65536; fz /= 65536; }
    else if (mx > 1.0) { fx /= Math.max(1, gx); fy /= Math.max(1, gy); fz /= Math.max(1, gz); }
  } else if (lockedVis) {
    fx = lockedVis.x / Math.max(1, gx); fy = lockedVis.y / Math.max(1, gy); fz = lockedVis.z / Math.max(1, gz);
  }
  fx = Math.max(0, Math.min(0.9999, Number.isFinite(fx) ? fx : 0.5));
  fy = Math.max(0, Math.min(0.9999, Number.isFinite(fy) ? fy : 0.5));
  fz = Math.max(0, Math.min(0.9999, Number.isFinite(fz) ? fz : 0.5));
  const ix = Math.max(0, Math.min(gx - 1, Math.floor(fx * gx)));
  const iy = Math.max(0, Math.min(gy - 1, Math.floor(fy * gy)));
  const iz = Math.max(0, Math.min(gz - 1, Math.floor(fz * gz)));
  const n = gx * gy;
  const xy = iy * gx + ix;
  const j = (iz * n + xy) * 4;
  const f = rawCache.fields;
  if (j + 3 >= f.length) return null;

  const solventPhase = f[j] & 3;
  const light = f[j + 1];
  const temp = f[j + 2];
  const substrate = f[j + 3];
  const rockH = rawCache.heights ? Number((rawCache.heights[xy] / 256).toFixed(2)) : 0;
  const waterH = rawCache.water ? Number((rawCache.water[xy] / 256).toFixed(2)) : 0;

  let minVentDist = 999;
  for (const v of (rawCache.vents || [])) {
    const dist = Math.hypot(v.x - ix, v.y - iy, v.z - iz);
    if (dist < minVentDist) minVentDist = dist;
  }

  let recommendedSolvent = solventPhase;
  if (minVentDist < 6 || temp > 205) recommendedSolvent = 2;
  else if (temp < 45)                recommendedSolvent = 1;
  else if (solventPhase === 3)       recommendedSolvent = 3;
  else                               recommendedSolvent = 0;

  return {
    vx: ix, vy: iy, vz: iz,
    fracPos: [Number(fx.toFixed(3)), Number(fy.toFixed(3)), Number(fz.toFixed(3))],
    solventPhase, light, lightPct: Math.round((light / 255) * 100),
    temp, tempPct: Math.round((temp / 255) * 100),
    substrate, rockH, waterH, submerged: iz < waterH,
    nearestVentDist: Number(minVentDist.toFixed(1)),
    recommendedSolvent,
    recommendedSolventName: SOLVENT_NAMES[recommendedSolvent]
  };
}
