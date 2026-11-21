import http from "node:http";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.join(__dirname, "web");
const RUNTIME_DIR = path.join(__dirname, "runtime");
const MACRO_DATA_DIR = path.join(RUNTIME_DIR, "macro-wild-data");
fs.mkdirSync(MACRO_DATA_DIR, { recursive: true });

const HUB_PORT   = Number(process.env.TRISCALE_PORT || 8790);
const MACRO_PORT = 8794; // Dedicated fresh Wild Biodiversity Asmodensius-Native relay!
const OMEGA_PORT = 8791; // Tier 2+ (Cellular Engine Omega v5.0 · 16 Testbeds · 66 Pure Lean 4)
const MESO_PORT  = 8788; // Tier 2 (Cells v1.3 Embryogenesis + GRN · 58 Pure Lean 4)
const MICRO_PORT = 8787; // Tier 1 (DNA AUTOPHAGE v1.2 + Zeta-Omega 13-Vec · 38 Pure Lean 4)

const PYTHON_BIN = [
  "C:\\Users\\Alexa\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
  "C:\\Users\\Alexa\\AppData\\Local\\Programs\\Python\\Python311\\python.exe",
  "C:\\Users\\Alexa\\AppData\\Local\\Programs\\Python\\Python39\\python.exe",
  "python"
].find((p) => p === "python" || fs.existsSync(p));

const ANTIGRAVITY_ROOT = path.resolve(__dirname, "..");
const ZETA_PKG_ROOT = path.join(ANTIGRAVITY_ROOT, "alife-singularity-omega-package");

const PATHS = {
  macroRelay:  path.join(__dirname, "macro_wild_relay.py"),
  macroEngine: "Z:\\[Vibe Coded (AI)]\\CLAUDECODE\\Asmodensius-Native\\build\\z\\az_live.exe",
  omegaServer: path.join(ANTIGRAVITY_ROOT, "cellular-engine-omega", "web", "server.mjs"),
  mesoServer:  path.join(ANTIGRAVITY_ROOT, "cellulogonic-mecha", "web", "server.mjs"),
  microServer: path.join(ANTIGRAVITY_ROOT, "autophage", "web", "server.mjs"),
  zetaHtml:    path.join(ZETA_PKG_ROOT, "html", "ALife_Singularity_SuperLife_Omega_Dashboard.html")
};

const SOLVENT_NAMES = [
  "0 · Terran Aqueous H2O",
  "1 · Titan Cryo CH4/N2",
  "2 · Hydrothermal GDGT",
  "3 · Venusian H2SO4"
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".pdf":  "application/pdf",
  ".csv":  "text/csv; charset=utf-8",
  ".md":   "text/markdown; charset=utf-8",
  ".txt":  "text/plain; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".yml":  "text/yaml; charset=utf-8",
  ".xml":  "application/xml; charset=utf-8",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls":  "application/vnd.ms-excel"
};

/* Deterministic seeded SplitMix32 PRNG (replaces non-reproducible Math.random() calls) */
let hubRngState = 0x5EED6301 >>> 0;
function nextHubRand() {
  hubRngState = (hubRngState + 0x9E3779B9) >>> 0;
  let z = hubRngState;
  z = Math.imul(z ^ (z >>> 16), 0x85EBCA6B) >>> 0;
  z = Math.imul(z ^ (z >>> 13), 0xC2B2AE35) >>> 0;
  return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
}

function clampInt(val, lo, hi, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/* Strict Loopback Host / Origin / Sec-Fetch-Site Guard (defeats cross-site CSRF & CSWSH) */
function isLoopbackHost(hostHdr) {
  if (!hostHdr || typeof hostHdr !== "string") return false;
  return /^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i.test(hostHdr.trim());
}

function isLoopbackOrigin(originHdr) {
  if (!originHdr || typeof originHdr !== "string") return true;
  return /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i.test(originHdr.trim());
}

function isSafeLoopbackRequest(req, requireJson = false) {
  if (!isLoopbackHost(req.headers.host)) return false;
  if (req.headers.origin && !isLoopbackOrigin(req.headers.origin)) return false;
  const sfs = String(req.headers["sec-fetch-site"] || "").toLowerCase();
  if (sfs && sfs !== "same-origin" && sfs !== "same-site" && sfs !== "none") return false;
  if (requireJson) {
    const ct = String(req.headers["content-type"] || "").toLowerCase();
    if (!ct.includes("application/json")) return false;
  }
  return true;
}

/* ============================================================================
 * 1. Child Native Engine Supervisor (With Live Hot-Respawn & Clean Tree Reaping)
 * ============================================================================ */
const children = [];
let macroChild = null;
let currentCosmosPreset = "cambrian";
const GENESIS_PRESETS = {
  cambrian: {
    preset: "cambrian", n: 8000, cap: 48000, species: 100, grid: "6,6,5", tps: 14, sps: 12, threads: 0, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 6, BRAIN_DENSITY: 148, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 14, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 190, FAMILY_SPACE: 20480, COLONY_FOUND: 14, WORLDGEN_VARY_LOCI: 36, WORLDGEN_VENTS: 52, WORLDGEN_SEA_LEVEL: 162, LIFE_SIZE_MU: 22 }
  },
  hyperbrain: {
    preset: "hyperbrain", n: 6000, cap: 40000, species: 100, grid: "6,6,5", tps: 12, sps: 12, threads: 0, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 12, BRAIN_DENSITY: 224, NEURO_RATE: 480, TIER1_LEARN_SHIFT: 12, EXPR_MUT_RATE: 280, GENE_NEW_RATE: 220, FAMILY_SPACE: 24576, COLONY_FOUND: 36, WORLDGEN_VARY_LOCI: 38, WORLDGEN_VENTS: 48, WORLDGEN_SEA_LEVEL: 164, LIFE_SIZE_MU: 24 }
  },
  hyperchaos: {
    preset: "hyperchaos", n: 10000, cap: 65536, species: 100, grid: "6,6,5", tps: 18, sps: 12, threads: 0, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 8, BRAIN_DENSITY: 168, NEURO_RATE: 512, TIER1_LEARN_SHIFT: 13, EXPR_MUT_RATE: 640, GENE_NEW_RATE: 380, FAMILY_SPACE: 32768, COLONY_FOUND: 20, WORLDGEN_VARY_LOCI: 48, WORLDGEN_VENTS: 64, WORLDGEN_SEA_LEVEL: 158, LIFE_SIZE_MU: 22 }
  },
  megaswarm: {
    preset: "megaswarm", n: 24000, cap: 110000, species: 100, grid: "6,6,5", tps: 12, sps: 10, threads: 0, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 5, BRAIN_DENSITY: 128, NEURO_RATE: 300, TIER1_LEARN_SHIFT: 15, EXPR_MUT_RATE: 360, GENE_NEW_RATE: 220, FAMILY_SPACE: 24576, COLONY_FOUND: 24, WORLDGEN_VARY_LOCI: 38, WORLDGEN_VENTS: 56, WORLDGEN_SEA_LEVEL: 168, LIFE_SIZE_MU: 18 }
  },
  abyss: {
    preset: "abyss", n: 8000, cap: 48000, species: 100, grid: "6,6,5", tps: 14, sps: 12, threads: 0, lesion: 0, lab: false, seed: 42,
    params: { BRAIN_FOUND_HID: 7, BRAIN_DENSITY: 156, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 14, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 200, FAMILY_SPACE: 16384, COLONY_FOUND: 16, WORLDGEN_VARY_LOCI: 38, WORLDGEN_VENTS: 64, WORLDGEN_SEA_LEVEL: 224, LIFE_SIZE_MU: 24 }
  }
};
let currentGenesis = structuredClone(GENESIS_PRESETS.cambrian);

function checkPortOpen(port, timeoutMs = 400) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port });
    const done = (val) => { try { sock.destroy(); } catch {} resolve(val); };
    sock.setTimeout(timeoutMs, () => done(false));
    sock.once("connect", () => done(true));
    sock.once("error", () => done(false));
  });
}

async function waitForPort(port, label, maxWaitMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (await checkPortOpen(port, 300)) {
      console.log(`[4TIER] ${label} ready on http://127.0.0.1:${port}`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.warn(`[4TIER] Timed out waiting for ${label} on port ${port}`);
  return false;
}

function killProcessTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") {
    try {
      const tk = spawn("taskkill", ["/T", "/F", "/PID", String(pid)], { stdio: "ignore", windowsHide: true });
      tk.on("error", () => {});
    } catch {}
  } else {
    try { process.kill(pid, "SIGKILL"); } catch {}
  }
}

async function stopChildGracefully(child, shutdownPort = null, waitMs = 3500) {
  if (!child || child.exitCode !== null || child.killed) return;
  const exited = new Promise((resolve) => {
    child.once("exit", () => resolve(true));
    setTimeout(() => resolve(false), waitMs);
  });
  if (shutdownPort) {
    try { await httpRequest(shutdownPort, "POST", "/api/shutdown", {}, {}, 1500); } catch {}
  } else {
    try { child.kill("SIGTERM"); } catch {}
  }
  const done = await exited;
  if (!done && child.exitCode === null) {
    killProcessTree(child.pid);
    await new Promise((r) => setTimeout(r, 300));
  }
}

function spawnEngine(label, cmd, args, env = {}) {
  console.log(`[4TIER] Starting ${label}: ${cmd} ${args.join(" ")}`);
  const child = spawn(cmd, args, {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...env },
    windowsHide: true
  });
  child.stdout.on("data", (d) => { const s = String(d).trim(); if (s) console.log(`[${label}] ${s}`); });
  child.stderr.on("data", (d) => { const s = String(d).trim(); if (s) console.error(`[${label} err] ${s}`); });
  child.on("error", (err) => console.error(`[${label} spawn err] ${err.message}`));
  child.on("exit", (code) => {
    console.log(`[${label}] exited (${code})`);
    const idx = children.indexOf(child);
    if (idx !== -1) children.splice(idx, 1);
  });
  children.push(child);
  return child;
}

function resetMacroCaches() {
  rawCache.staticSeq = -1;
  rawCache.fieldsSeq = -1;
  rawCache.shapesSeq = -1;
  rawCache.shapes.clear();
  rawCache.dims = null;
  rawCache.vents = [];
  rawCache.heights = null;
  rawCache.rock = null;
  rawCache.water = null;
  rawCache.fields = null;
  state.env.runId = null;
  state.creatures.lastSnapSeq = -1;
  state.creatures.lockedUid = null;
  state.creatures.locked = null;
  state.creatures.lockedVisual = null;
  state.creatures.localHabitat = null;
  state.creatures.roster = [];
  state.creatures.cladeSamples = new Map();
}

function buildRelayArgs(cfg) {
  const args = [
    "-I", "-B", PATHS.macroRelay,
    "--port", String(MACRO_PORT),
    "--preset", cfg.preset,
    "--data-dir", MACRO_DATA_DIR,
    "--engine", PATHS.macroEngine,
    "--n", String(cfg.n),
    "--cap", String(cfg.cap),
    "--species", String(cfg.species),
    "--grid", String(cfg.grid),
    "--tps", String(cfg.tps),
    "--sps", String(cfg.sps),
    "--threads", String(cfg.threads),
    "--lesion", "0x" + ((Number(cfg.lesion) || 0) & 0x7fffff).toString(16)
  ];
  if (cfg.lab) {
    args.push("--lab");
    if (Number.isFinite(Number(cfg.seed))) args.push("--seed", String(Math.max(0, Math.round(Number(cfg.seed)))));
  }
  if (cfg.params && typeof cfg.params === "object") {
    const pairs = Object.entries(cfg.params)
      .filter(([k, v]) => /^[A-Z0-9_]+$/.test(k) && Number.isFinite(Number(v)))
      .map(([k, v]) => `${k}=${Math.round(Number(v))}`);
    if (pairs.length) args.push("--param", pairs.join(","));
  }
  return args;
}

let macroSpawnLock = Promise.resolve();

async function spawnWildCosmos(presetOrCfg = "cambrian") {
  const run = async () => {
    let cfg;
    if (typeof presetOrCfg === "string") {
      const key = GENESIS_PRESETS[presetOrCfg] ? presetOrCfg : "cambrian";
      cfg = structuredClone(GENESIS_PRESETS[key]);
    } else {
      const baseKey = GENESIS_PRESETS[presetOrCfg?.preset] ? presetOrCfg.preset : "cambrian";
      const base = structuredClone(GENESIS_PRESETS[baseKey]);
      const rawGrid = String(presetOrCfg.grid || "");
      const safeGrid = /^\d+,\d+,\d+$/.test(rawGrid)
        ? rawGrid.split(",").map((g) => clampInt(g, 4, 8, 6)).join(",")
        : base.grid;
      cfg = {
        preset: baseKey,
        n: clampInt(presetOrCfg.n, 64, 250000, base.n),
        cap: clampInt(presetOrCfg.cap, 4096, 1000000, base.cap),
        species: clampInt(presetOrCfg.species, 1, 100, base.species),
        grid: safeGrid,
        tps: clampInt(presetOrCfg.tps, 0, 1000, base.tps),
        sps: clampInt(presetOrCfg.sps, 1, 60, base.sps),
        threads: clampInt(presetOrCfg.threads, 0, 64, base.threads),
        lesion: (clampInt(presetOrCfg.lesion, 0, 0x7fffff, base.lesion) >>> 0) & 0x7fffff,
        lab: Boolean(presetOrCfg.lab),
        seed: clampInt(presetOrCfg.seed, 0, 2147483647, base.seed),
        params: { ...base.params, ...(presetOrCfg.params && typeof presetOrCfg.params === "object" ? presetOrCfg.params : {}) }
      };
      if (cfg.cap < cfg.n + 4096) cfg.cap = cfg.n + 4096;
    }
    currentCosmosPreset = cfg.preset;
    currentGenesis = cfg;

    if (macroChild) {
      const oldMacro = macroChild;
      macroChild = null;
      await stopChildGracefully(oldMacro, MACRO_PORT, 3500);
    }
    resetMacroCaches();
    macroChild = spawnEngine(`T3+T4:${cfg.lab ? "Lab" : "Wild"}-${cfg.preset}`, PYTHON_BIN, buildRelayArgs(cfg));
    await waitForPort(MACRO_PORT, `T3+T4 ${cfg.lab ? "Lab" : "Wild"} ${cfg.preset.toUpperCase()} Cosmos`, 25000);
    pushCausalEvent(
      "T4+T3 GENESIS",
      `${cfg.lab ? "LAB" : "WILD"} ${cfg.preset.toUpperCase()}`,
      `n=${cfg.n.toLocaleString()} founders · cap=${cfg.cap.toLocaleString()} · ${cfg.species} sp · grid=${cfg.grid} · BrainHid=${cfg.params.BRAIN_FOUND_HID ?? 6} · lesion=0x${cfg.lesion.toString(16)}`
    );
    broadcastState();
  };
  const next = macroSpawnLock.then(run, run);
  macroSpawnLock = next.catch(() => {});
  return next;
}

async function ensureAllEngines() {
  if (!(await checkPortOpen(MACRO_PORT)) && fs.existsSync(PATHS.macroRelay) && fs.existsSync(PATHS.macroEngine)) {
    macroChild = spawnEngine("T3+T4:Wild-cambrian", PYTHON_BIN, buildRelayArgs(currentGenesis));
  }
  if (!(await checkPortOpen(OMEGA_PORT)) && fs.existsSync(PATHS.omegaServer)) {
    spawnEngine("T2+:OmegaBioFrostbite", process.execPath, [PATHS.omegaServer], { PORT: String(OMEGA_PORT) });
  }
  if (!(await checkPortOpen(MESO_PORT)) && fs.existsSync(PATHS.mesoServer)) {
    spawnEngine("T2:Cellulogonic", process.execPath, [PATHS.mesoServer], { PORT: String(MESO_PORT) });
  }
  if (!(await checkPortOpen(MICRO_PORT)) && fs.existsSync(PATHS.microServer)) {
    spawnEngine("T1:Autophage", process.execPath, [PATHS.microServer], { AUTOPHAGE_PORT: String(MICRO_PORT) });
  }
  await Promise.all([
    waitForPort(MACRO_PORT, "T3+T4 Wild Cambrian Cosmos", 25000),
    waitForPort(OMEGA_PORT, "T2+ Cellular Engine Omega v5.0 (TB01-TB16 · 66 Pure Lean 4)", 12000),
    waitForPort(MESO_PORT,  "T2 Cellulogonic Mecha v1.3 (58 Pure Lean 4)", 12000),
    waitForPort(MICRO_PORT, "T1 AUTOPHAGE v1.2 / Zeta-Omega (38 Pure Lean 4)", 12000)
  ]);
}

/* ============================================================================
 * 2. Loopback HTTP Helpers
 * ============================================================================ */
function httpRequest(port, method, urlPath, bodyObj = null, extraHeaders = {}, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const bodyBuf = bodyObj !== null ? Buffer.from(JSON.stringify(bodyObj), "utf8") : null;
    const headers = { Host: `127.0.0.1:${port}`, Origin: `http://127.0.0.1:${port}`, ...extraHeaders };
    if (bodyBuf !== null) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = String(bodyBuf.length);
    }
    const req = http.request({ host: "127.0.0.1", port, method, path: urlPath, headers, timeout: timeoutMs }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode || 0, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

/* ============================================================================
 * 3. Binary AZST Caches (SHAPES + STATIC + FIELDS)
 * ============================================================================ */
const rawCache = {
  staticSeq: -1, dims: null, vents: [], periods: [0, 0], heights: null, rock: null,
  fieldsSeq: -1, fieldsTick: 0, water: null, fields: null,
  shapesSeq: -1, shapes: new Map()
};

/* ============================================================================
 * 4. Omniscient 4-Tier Stack State (T1 DNA · T2 CELLS · T3 CREATURES · T4 ENV)
 * ============================================================================ */
const state = {
  engines: { t1_dna: false, t2_cells: false, t2_omega: false, t3_creatures: false, t4_env: false },
  paused: false,
  omegaFeral: false,
  cosmosPreset: "cambrian",
  omega: null,
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
    cladeSamples: new Map(), // clade -> uid (internal, not serialized directly)
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
    // 4x4 Omniscient Coupling Matrix [source 0..3][target 0..3]: { mode, strength }
    matrix4x4: [
      [{ m: "SELF", s: 1 }, { m: "LIVE", s: 0.9 }, { m: "D7RO", s: 0.35 }, { m: "D7RO", s: 0.25 }],
      [{ m: "SYNC", s: 0.7 }, { m: "SELF", s: 1 }, { m: "D7RO", s: 0.65 }, { m: "D7RO", s: 0.30 }],
      [{ m: "LIVE", s: 0.6 }, { m: "LIVE", s: 0.85 }, { m: "SELF", s: 1 }, { m: "LIVE", s: 0.95 }],
      [{ m: "LIVE", s: 0.55 }, { m: "LIVE", s: 0.9 }, { m: "LIVE", s: 0.95 }, { m: "SELF", s: 1 }]
    ],
    history: [] // rolling 240 omnitemporal snapshots
  },
  events: []
};

const sseClients = new Set();

function pushCausalEvent(direction, kind, detail) {
  state.events.unshift({
    ts: Date.now(),
    time: new Date().toLocaleTimeString("en-US", { hour12: false }),
    direction, kind, detail
  });
  if (state.events.length > 80) state.events.length = 80;
}

function buildStatePayload() {
  return `data: ${JSON.stringify({
    engines: state.engines,
    paused: state.paused,
    cosmosPreset: currentCosmosPreset,
    genesis: currentGenesis,
    coupling: state.coupling,
    env: state.env,
    creatures: {
      population: state.creatures.population,
      clades: state.creatures.clades,
      activeClades: state.creatures.activeClades,
      shapesCached: rawCache.shapes.size,
      cladeEntropyBits: state.creatures.cladeEntropyBits,
      hueEntropyBits: state.creatures.hueEntropyBits,
      hueSpectrum24: state.creatures.hueSpectrum24,
      aggregation: state.creatures.aggregation,
      topClades: state.creatures.topClades,
      roster: state.creatures.roster.slice(0, 24),
      lockedUid: state.creatures.lockedUid,
      lockedVisual: state.creatures.lockedVisual,
      locked: state.creatures.locked,
      localHabitat: state.creatures.localHabitat,
      hasShape: Boolean(state.creatures.locked?.clade !== undefined && rawCache.shapes.has(Number(state.creatures.locked.clade))),
      updatedAt: state.creatures.updatedAt
    },
    cells: state.cells.telemetry ? {
      telemetry: state.cells.telemetry,
      bridge: state.cells.bridge,
      updatedAt: state.cells.updatedAt
    } : null,
    dna: state.dna.frame ? {
      ready: state.dna.ready,
      epoch: state.dna.frame.epoch,
      alive: state.dna.frame.alive,
      replicators: state.dna.frame.replicators,
      lineages: state.dna.frame.lineages,
      ribosomes: state.dna.frame.ribosomes,
      inv_ribosomes: state.dna.frame.inv_ribosomes,
      irred_centromeres: state.dna.frame.irred_centromeres,
      execs_per_sec: state.dna.frame.execs_per_sec,
      ovi: state.dna.frame.ovi,
      bp_anew: state.dna.frame.bp_anew ?? 0,
      stage: state.dna.frame.stage,
      met: state.dna.frame.met,
      entropy: state.dna.frame.entropy,
      pillars: state.dna.frame.pillars,
      restraints: state.dna.frame.restraints,
      backlash: state.dna.frame.backlash,
      ledger: state.dna.frame.ledger,
      sha256: state.dna.frame.sha256,
      apex: state.dna.frame.apex,
      traits112: state.dna.frame.traits112,
      updatedAt: state.dna.updatedAt
    } : null,
    omega: state.omega,
    differential: state.differential,
    events: state.events.slice(0, 24)
  })}\n\n`;
}

function broadcastState() {
  const payload = buildStatePayload();
  for (const res of sseClients) {
    if (res.writableEnded || res.destroyed) { sseClients.delete(res); continue; }
    try { res.write(payload); } catch { sseClients.delete(res); }
  }
}

/* ============================================================================
 * 5. Tier 4 Environment Sampling at Tier 3 Creature (x, y, z)
 * ============================================================================ */
function sampleLocalHabitat(posVal, lockedVis = null) {
  if (!rawCache.dims || !rawCache.fields) return null;
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
  fx = Math.max(0, Math.min(0.9999, fx));
  fy = Math.max(0, Math.min(0.9999, fy));
  fz = Math.max(0, Math.min(0.9999, fz));
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
  for (const v of rawCache.vents) {
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

function buildEnvSlicePayload(zLayerReq = null) {
  if (!rawCache.dims) return null;
  const [gx, gy, gz] = rawCache.dims;
  const z = Math.max(0, Math.min(gz - 1, Number.isFinite(zLayerReq) ? zLayerReq : state.env.sliceZ));
  const n = gx * gy;
  const temp = new Uint8Array(n), light = new Uint8Array(n), solvent = new Uint8Array(n), terrain = new Uint8Array(n);
  for (let xy = 0; xy < n; xy++) {
    terrain[xy] = rawCache.heights ? Math.min(255, Math.round((rawCache.heights[xy] / 256 / gz) * 255)) : 0;
    if (rawCache.fields) {
      const j = (z * n + xy) * 4;
      solvent[xy] = (rawCache.fields[j] & 3) * 85;
      light[xy]   = rawCache.fields[j + 1];
      temp[xy]    = rawCache.fields[j + 2];
    }
  }
  return {
    dims: [gx, gy, gz], z, tick: rawCache.fieldsTick || state.env.tick,
    vents: rawCache.vents,
    lockedPos: state.creatures.localHabitat ? [state.creatures.localHabitat.vx, state.creatures.localHabitat.vy, state.creatures.localHabitat.vz] : null,
    tempB64: Buffer.from(temp).toString("base64"),
    lightB64: Buffer.from(light).toString("base64"),
    solventB64: Buffer.from(solvent).toString("base64"),
    terrainB64: Buffer.from(terrain).toString("base64")
  };
}

/* ============================================================================
 * 6. Omniscient / Omnitemporal Differential, Variance & Chaos Analytics
 * ============================================================================ */
function rollingVariance(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, x) => s + (x - mean) * (x - mean), 0) / arr.length;
}

function computeDifferentials() {
  const dnaT   = state.dna.frame?.traits112;
  const cellsT = state.cells.bridge?.traits112;
  const d = state.differential;
  const prevMean = d.meanAbsDelta || 0;
  const prevH = d.history.length ? d.history[d.history.length - 1].cladeH : state.creatures.cladeEntropyBits;

  // 1. Raw 112-element projections (clamped to [0,1] to guard upstream Cellulogonic unclamped [0..7] slots).
  //    NOTE: T1 DNA [0..111] (opcodes/ribo/assembly) and T2 Cells [0..111] (biophys/operon hash) have
  //    heterogeneous index semantics, so cross-tier cosine coherence is computed on the aligned 8-axis vector below!
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

  // 2. Semantically Aligned 8-Axis Biophysical Cosine Coherence (apples-to-apples T1 DNA vs T2 Cells!)
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
      Math.max(0, Math.min(1, Math.log1p(b1) / 10))
    ];
    const v2 = [
      Math.max(0, Math.min(1, (Number(ct.covi) || 0) / 100)),
      Math.max(0, Math.min(1, (Number(ct.alive) || 0) / 1024)),
      Math.max(0, Math.min(1, (Number(ct.assembly_index) || 0) / 40)),
      Math.max(0, Math.min(1, (Number(ct.distinct_lineages) || 0) / 128)),
      Math.max(0, Math.min(1, (Number(ct.max_tissue) || 0) / 64)),
      Math.max(0, Math.min(1, (Number(ct.active_loci) || 0) / 16)),
      Math.max(0, Math.min(1, (Number(ct.mean_mt_ghz) || 0) / 12)),
      Math.max(0, Math.min(1, Math.log1p(b2) / 10))
    ];
    let dot = 0, nA = 0, nB = 0;
    for (let k = 0; k < 8; k++) { dot += v1[k] * v2[k]; nA += v1[k] * v1[k]; nB += v2[k] * v2[k]; }
    d.cosineCoherence = (nA > 1e-9 && nB > 1e-9) ? Number((dot / (Math.sqrt(nA) * Math.sqrt(nB))).toFixed(4)) : 0;
  }

  const covi = state.cells.telemetry?.covi ?? 0;
  const ovi  = state.dna.frame?.ovi ?? 0;
  d.vitalityMargin = Number((covi - ovi).toFixed(2));
  d.backlashTotal = (state.cells.telemetry?.backlash?.reduce((a, b) => a + b, 0) ?? 0) +
                    (state.dna.frame?.backlash?.reduce((a, b) => a + b, 0) ?? 0);

  const now = Date.now();
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
    t: Date.now(),
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
  if (d.history.length > 240) d.history.shift();

  // Rolling 32-sample omnitemporal variance & cross-tier Volatility/Entropy Index (0..1; not a true Lyapunov exponent)
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
    d.chaosLyapunov = Number(Math.min(1, rawVol * 0.45 + entBoost).toFixed(3));
  }

  // Unified Cross-Tier Bedau-Packard Open-Ended Novelty A_new (Blindspot #8 closed!)
  const t1Anew = Number(state.dna.frame?.bp_anew ?? 0);
  const t2Anew = Number(state.cells.telemetry?.bedau_anew ?? 0);
  const t3CladeNorm = Number(((state.creatures.activeClades ?? 0) / 1000).toFixed(3));
  d.crossTierAnew = Number((t1Anew + t2Anew + t3CladeNorm).toFixed(2));

  // Strictly honest 4x4 Coupling Matrix (v6.2 — ZERO overstated links!):
  //   DNA128 = REAL 128-byte evolved AUTOPHAGE genome transfection into Cellulogonic (T1->T2)
  //   LIVE   = active runtime command channel firing (T3->T2 plume/shock, T4->T2 solvent)
  //   SEED   = deterministic metadata-seed hash bridge (fallback if genome_hex unavailable, or T3->T1 when reseedOnLock=ON)
  //   WAVE   = adaptive 13-vector restraint modulation (T4->T1 & T2 when waveMode=="adaptive")
  //   NAT    = native in-process physics inside Asmodensius-Native az_live.exe (T3<->T4)
  //   CORR   = observational aligned 8-axis correlation only (T2->T1; no backward write)
  //   D7RO   = read-only observer boundary per Asmodensius-Native Law 4 / D7 (no live write into az_live)
  //   OFF    = toggle currently disabled (0.00)
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
}

/* ============================================================================
 * 7. Real 4-Tier Cross-Scale Actions (v6.2: Real 128B DNA + Full 13-Vec Parity!)
 * ============================================================================ */
function deriveDnaSeed32() {
  const a = state.dna.frame?.apex;
  if (!a) return Math.floor(nextHubRand() * 89999999) + 1000;
  const rHi = parseInt(String(a.ribo_hex || "0").slice(0, 8), 16) || 1;
  const rLo = parseInt(String(a.ribo_hex || "0").slice(8, 16), 16) || 1;
  const addr = parseInt(String(a.addr || "0"), 16) || 1;
  return (((rHi ^ rLo ^ addr ^ ((a.poly || 1) * 2654435761) ^ (Number(state.dna.frame.epoch) || 1)) >>> 0) % 89999999) + 1;
}

function uidToSeed32(uidHex) {
  const hi = parseInt(String(uidHex || "0").slice(0, 8), 16) || 0;
  const lo = parseInt(String(uidHex || "0").slice(8, 16), 16) || 0;
  return (((hi ^ lo ^ 0x5A0DE115) >>> 0) % 89999999) + 1;
}

async function transfectDnaToCells(reason = "manual") {
  const a = state.dna.frame?.apex;
  const hex128 = (a && typeof a.genome_hex === "string" && /^[0-9a-f]{256}$/i.test(a.genome_hex)) ? a.genome_hex : null;
  try {
    const r = hex128
      ? await httpRequest(MESO_PORT, "POST", "/api/cmd", { op: "autophage_dna", hex: hex128 })
      : await httpRequest(MESO_PORT, "POST", "/api/cmd", { op: "autophage", seed: deriveDnaSeed32() });
    if (r.status === 200) {
      const data = JSON.parse(r.body.toString("utf8"));
      if (data.telemetry) { state.cells.telemetry = data.telemetry; state.cells.bridge = data.bridge; state.cells.updatedAt = Date.now(); }
      state.coupling.transfections++;
      state.coupling.lastTransfectAt = Date.now();
      state.coupling.lastTransfectSig = a ? `0x${a.ribo_hex.slice(0, 8)}·GF(0x1${a.poly.toString(16)})` : "dna128";
      if (hex128) {
        pushCausalEvent("T1 DNA ➔ T2 CELLS", "DNA-128B", `REAL 128B evolved genome (${hex128.slice(0, 12)}… · ${state.coupling.lastTransfectSig}) → T2 cells (${reason}) · ${data.bridge?.autophage_carriers ?? "?"} carriers`);
      } else {
        pushCausalEvent("T1 DNA ➔ T2 CELLS", "SEED-HASH", `Seed fallback (${state.coupling.lastTransfectSig}, ${reason}) · ${data.bridge?.autophage_carriers ?? "?"} carriers`);
      }
      computeDifferentials();
      broadcastState();
      return { ok: true, mode: hex128 ? "dna128" : "seed" };
    }
  } catch (e) { return { ok: false, error: e.message }; }
  return { ok: false };
}

async function triggerCellsAction(op, params = {}, direction = "T3 CREATURE ➔ T2 CELLS", label = "") {
  try {
    const r = await httpRequest(MESO_PORT, "POST", "/api/cmd", { op, ...params });
    if (r.status === 200) {
      const data = JSON.parse(r.body.toString("utf8"));
      if (data.telemetry) { state.cells.telemetry = data.telemetry; state.cells.bridge = data.bridge; state.cells.updatedAt = Date.now(); }
      if (label) pushCausalEvent(direction, op.toUpperCase(), label);
      computeDifferentials();
      broadcastState();
      return { ok: true, data };
    }
  } catch (e) { return { ok: false, error: e.message }; }
  return { ok: false };
}

async function syncEnvSolventToCells(targetSolvent, reason = "local-habitat") {
  const sol = clampInt(targetSolvent, 0, 3, 0);
  const isAuto = reason !== "operator-override";
  if (isAuto && sol === state.coupling.activeSolvent) return;
  const now = Date.now();
  if (isAuto && now - state.coupling.lastEnvSyncAt < 6000) return;
  state.coupling.lastEnvSyncAt = now;
  state.coupling.activeSolvent = sol;
  state.coupling.envSolventSwitches++;
  await triggerCellsAction("solvent", { val: sol }, "T4 ENV ➔ T2 CELLS", `Habitat (${reason}) → ${SOLVENT_NAMES[sol]}`);
}

async function applyUnifiedRestraints(vec13, reason = "spectrum") {
  const clean = vec13.slice(0, 13).map((v) => clampInt(v, 0, 100, 0));
  while (clean.length < 13) clean.push(0);
  state.coupling.restraints = clean;
  const allEqual = clean.every((v) => v === clean[0]);
  let t1Ok = false, t2Ok = false;
  try {
    let r1;
    if (allEqual) {
      r1 = await httpRequest(MICRO_PORT, "POST", "/api/cmd", { action: "all_restraints", val: clean[0] });
    } else {
      r1 = await httpRequest(MICRO_PORT, "POST", "/api/cmd", { action: "restraint_vec", vec: clean });
      if (r1.status !== 200) {
        let allStepOk = true;
        for (let idx = 0; idx < 13; idx++) {
          const ri = await httpRequest(MICRO_PORT, "POST", "/api/cmd", { action: "restraint", idx, val: clean[idx] });
          if (ri.status !== 200) allStepOk = false;
        }
        r1 = { status: allStepOk ? 200 : 500 };
      }
    }
    t1Ok = r1.status === 200;
  } catch {}
  try {
    /* Full 13-vector independent restraint parity in Tier 2 (Cellulogonic v1.3!) */
    const r = await httpRequest(MESO_PORT, "POST", "/api/cmd", { op: "restraint_vec", vec: clean });
    if (r.status === 200) {
      t2Ok = true;
      const data = JSON.parse(r.body.toString("utf8"));
      if (data.telemetry) { state.cells.telemetry = data.telemetry; state.cells.bridge = data.bridge; state.cells.updatedAt = Date.now(); }
    }
  } catch {}
  const meanPct = Math.round(clean.reduce((a, b) => a + b, 0) / 13);
  if (t1Ok || t2Ok) {
    const scope = t1Ok && t2Ok ? "T1+T2" : (t1Ok ? "T1-only" : "T2-only");
    pushCausalEvent("ZETA-OMEGA ➔ T1+T2", "13-VEC", `${reason}: ${scope} 13-vec [${Math.min(...clean)}..${Math.max(...clean)}%] (μ=${meanPct}%)`);
  }
  computeDifferentials();
  broadcastState();
}

async function lockCreature(uidHex, source = "manual") {
  if (!/^[0-9a-f]{16}$/i.test(uidHex || "")) return { ok: false, error: "invalid uid" };
  const uid = uidHex.toLowerCase();
  const changed = state.creatures.lockedUid !== uid;
  state.creatures.lockedUid = uid;
  const vis = state.creatures.roster.find((c) => c.uid === uid);
  if (vis) state.creatures.lockedVisual = vis;
  try {
    const r = await httpRequest(MACRO_PORT, "POST", "/api/inspect", { uid });
    if (r.status === 200) {
      const info = JSON.parse(r.body.toString("utf8"));
      await onCreatureInspect(info, source, changed);
      return { ok: true, creature: info };
    }
    return { ok: false, status: r.status };
  } catch (e) { return { ok: false, error: e.message }; }
}

async function onCreatureInspect(info, source = "click", forceSwitch = false) {
  if (!info || !info.uid) return;
  const prev = state.creatures.locked;
  const uidChanged = forceSwitch || (state.creatures.lockedUid !== info.uid);
  state.creatures.prevLocked = prev;
  state.creatures.lockedUid = info.uid;
  state.creatures.locked = info;
  state.creatures.updatedAt = Date.now();

  if (info.found) {
    const hab = sampleLocalHabitat(info.pos, state.creatures.lockedVisual);
    if (hab) {
      state.creatures.localHabitat = hab;
      state.env.sliceZ = hab.vz;
      if (state.coupling.autoCouple && state.coupling.envToCellsSolvent) {
        syncEnvSolventToCells(hab.recommendedSolvent, `voxel (${hab.vx},${hab.vy},${hab.vz}) T=${hab.tempPct}% P=${hab.solventPhase}`).catch(() => {});
      }
    }
  }

  if (uidChanged) {
    pushCausalEvent("T3 LOCK", `C${info.clade ?? "?"} · ${info.uid.slice(0, 8)}`, `Locked via ${source}: Gen ${info.generation ?? "?"} · E=${info.energy ?? "?"} · H=${info.health ?? "?"} · Parts=${info.parts ?? "?"}`);
    if (state.coupling.autoCouple && state.coupling.reseedOnLock) {
      const cSeed = uidToSeed32(info.uid);
      const sol = state.creatures.localHabitat ? state.creatures.localHabitat.recommendedSolvent : ((Number(info.clade) || 0) % 4);
      const meanR = Math.round(state.coupling.restraints.reduce((a, b) => a + b, 0) / 13);
      state.coupling.activeSolvent = sol;
      httpRequest(MESO_PORT, "POST", "/api/cmd", { op: "init", regime: state.coupling.activeRegime, solvent: sol, seed: cSeed, restraint: meanR, warmup: 42 }).catch(() => {});
      httpRequest(MICRO_PORT, "POST", "/api/cmd", { action: "reset", regime: 1, seed: cSeed }).catch(() => {});
      pushCausalEvent("T4+T3 ➔ T2+T1", "STACK RE-SEED", `Bound Cells & DNA to Creature UID seed ${cSeed}`);
    }
  } else if (state.coupling.autoCouple && prev && prev.found && info.found && prev.uid === info.uid) {
    const now = Date.now();
    const dE = (Number(info.energy) || 0) - (Number(prev.energy) || 0);
    const dH = (Number(info.health) || 0) - (Number(prev.health) || 0);
    if (now - state.coupling.lastMacroActionAt > 2500) {
      if (dE > 15) {
        const hab = state.creatures.localHabitat;
        const px = hab ? Math.round((hab.vx / Math.max(1, (rawCache.dims?.[0] || 32) - 1)) * 31) : 16;
        const py = hab ? Math.round((hab.vy / Math.max(1, (rawCache.dims?.[1] || 32) - 1)) * 31) : 16;
        state.coupling.lastMacroActionAt = now;
        state.coupling.creaturePlumes++;
        triggerCellsAction("plume", { x: px, y: py }, "T3 CREATURE ➔ T2 CELLS", `Creature ΔE +${dE.toFixed(0)} → cellular plume @ (${px},${py})`);
      } else if (dH < -15) {
        state.coupling.lastMacroActionAt = now;
        state.coupling.creatureShocks++;
        triggerCellsAction("shock", {}, "T3 CREATURE ➔ T2 CELLS", `Creature ΔH ${dH.toFixed(0)} → cellular stress pulse`);
      }
    }
  }
  computeDifferentials();
  broadcastState();
}

/* ============================================================================
 * 8. AZST Binary Decoders (With Hue Spectrum, Shannon Entropy & Aggregation!)
 * ============================================================================ */
function shannonBits(counts, total) {
  if (!total) return 0;
  let h = 0;
  for (const c of counts) {
    if (c > 0) { const p = c / total; h -= p * Math.log2(p); }
  }
  return Number(h.toFixed(3));
}

function decodeAzstCreatures(buf) {
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
  const voxelOcc = new Map(); // spatial cell occupancy -> Singular vs Cluster vs Globular!
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

    // Coarse 16x16x8 spatial bin for Singular (1) vs Cluster (2..6) vs Globular Swarm (7+)
    const key = ((x16 >> 12) << 7) | ((y16 >> 12) << 3) | (z16 >> 13);
    voxelOcc.set(key, (voxelOcc.get(key) || 0) + 1);

    const needCladeRep = !cladeSamples.has(clade);
    const needRoster = (roster.length < 24 && (i % stride === 0));
    let uid = null;
    if (needCladeRep || needRoster || state.creatures.lockedUid) {
      uid = hi.toString(16).padStart(8, "0") + lo.toString(16).padStart(8, "0");
    }
    if (needCladeRep && uid) cladeSamples.set(clade, uid);
    const isLocked = Boolean(state.creatures.lockedUid && uid === state.creatures.lockedUid);

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

function decodeAzstStatic(buf) {
  if (!buf || buf.length < 48 || buf.readUInt32LE(0) !== 0x54535a41 || buf.readUInt16LE(4) !== 3) return false;
  const seq = buf.readUInt32LE(12);
  const gx = buf.readUInt32LE(16), gy = buf.readUInt32LE(20), gz = buf.readUInt32LE(24);
  const cells = buf.readUInt32LE(28), nv = buf.readUInt32LE(32);
  const periods = [buf.readUInt32LE(36), buf.readUInt32LE(40)];
  const base = 32 + 4 * nv;
  if (cells !== gx * gy * gz || buf.length < 16 + base + cells + 4 * gx * gy) return false;

  const vents = [], plane = gx * gy;
  for (let i = 0; i < nv; i++) {
    const idx = buf.readUInt32LE(48 + 4 * i);
    const vz = Math.floor(idx / plane), rem = idx % plane;
    vents.push({ idx, x: rem % gx, y: Math.floor(rem / gx), z: vz });
  }
  rawCache.staticSeq = seq; rawCache.dims = [gx, gy, gz]; rawCache.vents = vents; rawCache.periods = periods;
  rawCache.rock = new Uint8Array(buf.buffer, buf.byteOffset + 16 + base, cells).slice();
  rawCache.heights = new Uint32Array(gx * gy);
  const hOff = 16 + base + cells;
  for (let i = 0; i < gx * gy; i++) rawCache.heights[i] = buf.readUInt32LE(hOff + 4 * i);
  state.env.dims = [gx, gy, gz]; state.env.ventCount = nv; state.env.sunPeriods = periods; state.env.vents = vents.slice(0, 48);
  return true;
}

function decodeAzstFields(buf) {
  if (!buf || buf.length < 48 || buf.readUInt32LE(0) !== 0x54535a41 || buf.readUInt16LE(4) !== 4) return false;
  const seq = buf.readUInt32LE(12);
  const tick = Number(buf.readBigUInt64LE(16));
  const gx = buf.readUInt32LE(24), gy = buf.readUInt32LE(28), gz = buf.readUInt32LE(32);
  const parts = buf.readUInt32LE(36), n = gx * gy;
  const waterBytes = (parts & 1) ? 4 * n : 0, cellBytes = (parts & 2) ? 4 * n * gz : 0;
  if (buf.length < 48 + waterBytes + cellBytes) return false;
  rawCache.fieldsSeq = seq; rawCache.fieldsTick = tick;
  if (waterBytes) {
    rawCache.water = new Uint32Array(n);
    for (let i = 0; i < n; i++) rawCache.water[i] = buf.readUInt32LE(48 + 4 * i);
  }
  if (cellBytes) {
    const f = new Uint8Array(buf.buffer, buf.byteOffset + 48 + waterBytes, cellBytes).slice();
    rawCache.fields = f;
    let topLight = 0;
    const topOff = (gz - 1) * n;
    for (let xy = 0; xy < n; xy++) topLight += f[(topOff + xy) * 4 + 1];
    state.env.daylightPct = Math.round((topLight / (255 * n)) * 100);

    let sumTemp = 0, maxTemp = 0, sampled = 0;
    const phases = [0, 0, 0, 0], totalVox = n * gz, step = Math.max(1, Math.floor(totalVox / 4096));
    for (let v = 0; v < totalVox; v += step) {
      const j = v * 4;
      phases[f[j] & 3]++;
      const t = f[j + 2];
      sumTemp += t; if (t > maxTemp) maxTemp = t; sampled++;
    }
    state.env.meanTemp = sampled ? Math.round((sumTemp / (255 * sampled)) * 100) : 0;
    state.env.maxTemp  = Math.round((maxTemp / 255) * 100);
    state.env.solventDist = phases.map((c) => sampled ? Math.round((c / sampled) * 100) : 0);
    if (rawCache.vents.length > 0) {
      let vt = 0;
      for (const v of rawCache.vents) {
        const off = v.idx * 4 + 2;
        if (off >= 0 && off < f.length) vt += f[off];
      }
      state.env.ventMeanTemp = Math.round((vt / (255 * rawCache.vents.length)) * 100);
    }
    state.env.updatedAt = Date.now();
    state.engines.t4_env = true;
  }
  return true;
}

function decodeAzstShapes(buf) {
  if (!buf || buf.length < 20 || buf.readUInt32LE(0) !== 0x54535a41 || buf.readUInt16LE(4) !== 5) return false;
  const seq = buf.readUInt32LE(12), count = buf.readUInt32LE(16), SHAPE_BYTES = 4634;
  if (buf.length < 20 + count * SHAPE_BYTES) return false;
  for (let i = 0; i < count; i++) {
    const off = 20 + i * SHAPE_BYTES;
    const clade = buf.readUInt32LE(off);
    rawCache.shapes.set(clade, {
      clade,
      body: Array.from(buf.subarray(off + 4, off + 20)),
      elong: Number((buf.readUInt16LE(off + 20) / 256).toFixed(3)),
      spike: Number((buf.readUInt16LE(off + 22) / 256).toFixed(3)),
      gmax:  Number((buf.readUInt16LE(off + 24) / 256).toFixed(3)),
      baseB64:   buf.subarray(off + 26, off + 2330).toString("base64"),
      spikesB64: buf.subarray(off + 2330, off + 4634).toString("base64")
    });
  }
  rawCache.shapesSeq = seq;
  state.creatures.shapesCached = rawCache.shapes.size;
  return true;
}

/* ============================================================================
 * 9. Background Watchers
 * ============================================================================ */
function startDnaSseWatcher() {
  function connect() {
    const req = http.request({ host: "127.0.0.1", port: MICRO_PORT, path: "/api/events", method: "GET" }, (res) => {
      state.engines.t1_dna = true;
      let buf = "";
      res.on("data", (chunk) => {
        buf += chunk.toString("utf8");
        let idx;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const block = buf.slice(0, idx); buf = buf.slice(idx + 2);
          for (const line of block.split("\n")) {
            if (!line.startsWith("data:")) continue;
            try {
              const msg = JSON.parse(line.slice(5).trim());
              if (msg.type === "ready") state.dna.ready = msg;
              else if (msg.type === "frame") {
                state.dna.frame = msg; state.dna.updatedAt = Date.now(); state.engines.t1_dna = true;
                if (state.coupling.autoCouple && msg.apex) {
                  const key = `${msg.apex.ribo_hex}:${msg.apex.poly}:${msg.apex.lineage}`;
                  if (key !== state.coupling.lastApexKey && (Date.now() - state.coupling.lastTransfectAt > 6000)) {
                    state.coupling.lastApexKey = key;
                    transfectDnaToCells("auto-apex").catch(() => {});
                  }
                }
                computeDifferentials();
                broadcastState();
              }
            } catch {}
          }
        }
      });
      res.on("end", () => { state.engines.t1_dna = false; setTimeout(connect, 1500); });
    });
    req.on("error", () => { state.engines.t1_dna = false; setTimeout(connect, 1500); });
    req.end();
  }
  connect();
}

function startAsmodensiusPollers() {
  let monocultureStreak = 0;
  let renewingCosmos = false;
  let snapInFlight = false;
  setInterval(async () => {
    if (renewingCosmos || snapInFlight) return;
    snapInFlight = true;
    try {
      const st = await httpRequest(MACRO_PORT, "GET", "/api/state");
      if (st.status === 200) {
        const info = JSON.parse(st.body.toString("utf8"));
        state.engines.t3_creatures = Boolean(info.running);
        state.engines.t4_env = Boolean(info.running);
        if (state.env.runId && state.env.runId !== info.run_id) resetMacroCaches();
        state.env.runId = info.run_id;
      }
      const rid = state.env.runId ? `&run_id=${encodeURIComponent(state.env.runId)}` : "";
      const snap = await httpRequest(MACRO_PORT, "GET", `/api/snap?type=2&after=${state.creatures.lastSnapSeq}${rid}`, null, {}, 2500);
      if (snap.status === 200) {
        const dec = decodeAzstCreatures(snap.body);
        if (dec) {
          state.creatures.lastSnapSeq = dec.seq;
          state.env.tick = dec.tick; state.env.dims = dec.dims; state.env.wild = dec.wild;
          state.env.lightVec = dec.lightVec; state.env.observerFail = dec.failures;
          state.creatures.population = dec.count; state.creatures.clades = dec.clades;
          state.creatures.activeClades = dec.activeClades;
          state.creatures.cladeEntropyBits = dec.cladeEntropyBits;
          state.creatures.hueEntropyBits = dec.hueEntropyBits;
          state.creatures.hueSpectrum24 = dec.hueBins;
          state.creatures.aggregation = dec.aggregation;
          state.creatures.roster = dec.roster;
          state.creatures.topClades = dec.topClades;
          state.creatures.cladeSamples = dec.cladeSamples;
          if (dec.lockedVis) state.creatures.lockedVisual = dec.lockedVis;
          state.creatures.updatedAt = Date.now();
          state.engines.t3_creatures = true; state.engines.t4_env = true;
          if (!state.creatures.lockedUid && dec.roster.length > 0) await lockCreature(dec.roster[0].uid, "auto-lock");

          // Anti-Monoculture Guard: prevent long-run competitive exclusion from collapsing the cosmos to 1 red clade!
          if (!state.paused && state.coupling.antiMonoculture && dec.tick > 500 && dec.count > 100 && (dec.activeClades <= 3 || dec.cladeEntropyBits < 0.45)) {
            monocultureStreak++;
            if (monocultureStreak >= 8) {
              monocultureStreak = 0;
              renewingCosmos = true;
              state.coupling.monocultureRenewals++;
              pushCausalEvent(
                "T4 ANTI-MONO",
                "CAMBRIAN RENEWAL",
                `Detected monoculture collapse (${dec.activeClades} clade, H=${dec.cladeEntropyBits.toFixed(2)}b @ t=${dec.tick}) → igniting fresh wild radiation #${state.coupling.monocultureRenewals}`
              );
              try { await spawnWildCosmos(currentGenesis); } finally { renewingCosmos = false; }
              return;
            }
          } else {
            monocultureStreak = 0;
          }
        }
      }
      if (state.creatures.lockedUid) {
        const r = await httpRequest(MACRO_PORT, "POST", "/api/inspect", { uid: state.creatures.lockedUid });
        if (r.status === 200) {
          const info = JSON.parse(r.body.toString("utf8"));
          if (!info.found && state.creatures.roster.length > 0) {
            pushCausalEvent("T3 LIFECYCLE", "RELOCK", `UID ${state.creatures.lockedUid.slice(0, 8)} absent; switching to living specimen`);
            await lockCreature(state.creatures.roster[0].uid, "auto-relock");
          } else {
            await onCreatureInspect(info, "live-track", false);
          }
        }
      }
    } catch {
      state.engines.t3_creatures = false; state.engines.t4_env = false;
    } finally {
      snapInFlight = false;
    }
  }, 1200);

  let fieldTickCount = 0;
  let fieldInFlight = false;
  setInterval(async () => {
    if (!state.env.runId || fieldInFlight) return;
    fieldInFlight = true;
    const rid = `&run_id=${encodeURIComponent(state.env.runId)}`;
    fieldTickCount++;
    try {
      if (rawCache.staticSeq === -1) {
        const rs = await httpRequest(MACRO_PORT, "GET", `/api/snap?type=3&after=-1${rid}`, null, {}, 2500);
        if (rs.status === 200) decodeAzstStatic(rs.body);
      }
      const rf = await httpRequest(MACRO_PORT, "GET", `/api/snap?type=4&after=${rawCache.fieldsSeq}${rid}`, null, {}, 2500);
      if (rf.status === 200) {
        decodeAzstFields(rf.body);
        if (state.creatures.locked?.found) {
          state.creatures.localHabitat = sampleLocalHabitat(state.creatures.locked.pos, state.creatures.lockedVisual);
        }
      }
      if (rawCache.shapesSeq === -1 || fieldTickCount % 3 === 0) {
        const rsh = await httpRequest(MACRO_PORT, "GET", `/api/snap?type=5&after=${rawCache.shapesSeq}${rid}`, null, {}, 3000);
        if (rsh.status === 200) decodeAzstShapes(rsh.body);
      }
    } catch {}
    finally { fieldInFlight = false; }
  }, 2400);
}

function startCellsHeartbeatAndWaveEngine() {
  let zeroCellTicks = 0;
  let lastRegenAt = 0;
  let cellsInFlight = false;
  setInterval(async () => {
    if (state.paused || cellsInFlight) return;
    cellsInFlight = true;
    try {
      if (Date.now() - state.cells.updatedAt > 1400) {
        try {
          const r = await httpRequest(MESO_PORT, "POST", "/api/cmd", { op: "step", n: 1 });
          if (r.status === 200) {
            const data = JSON.parse(r.body.toString("utf8"));
            if (data.telemetry) {
              state.cells.telemetry = data.telemetry; state.cells.bridge = data.bridge;
              state.cells.updatedAt = Date.now(); state.engines.t2_cells = true;
              computeDifferentials(); broadcastState();
            }
          }
        } catch { state.engines.t2_cells = false; }
      } else { state.engines.t2_cells = true; }

      // Autonomous T2 Cellular Regenesis: if 3D embryo hits 0 cells while Auto-Couple is ON,
      // re-embryonate from the locked T3 creature's UID + local T4 habitat solvent!
      const alive = state.cells.telemetry?.alive;
      if (state.coupling.autoCouple && alive === 0 && (Date.now() - lastRegenAt > 8000)) {
        zeroCellTicks++;
        if (zeroCellTicks >= 3) {
          zeroCellTicks = 0;
          lastRegenAt = Date.now();
          const seed = state.creatures.lockedUid ? uidToSeed32(state.creatures.lockedUid) : deriveDnaSeed32();
          const sol = state.creatures.localHabitat ? state.creatures.localHabitat.recommendedSolvent : state.coupling.activeSolvent;
          const reg = state.coupling.activeRegime ?? 5;
          const safeR = Math.min(25, Math.round(state.coupling.restraints.reduce((a, b) => a + b, 0) / 13));
          try {
            const r = await httpRequest(MESO_PORT, "POST", "/api/cmd", { op: "init", regime: reg, solvent: sol, seed, restraint: safeR, warmup: 40 });
            if (r.status === 200) {
              const data = JSON.parse(r.body.toString("utf8"));
              if (data.telemetry) { state.cells.telemetry = data.telemetry; state.cells.bridge = data.bridge; state.cells.updatedAt = Date.now(); }
              pushCausalEvent("T1+T3+T4 ➔ T2", "AUTO-REGENESIS", `Re-embryonated 3D cells (R${reg}, ${SOLVENT_NAMES[sol]}, seed ${seed}) after collapse`);
              computeDifferentials(); broadcastState();
            }
          } catch {}
        }
      } else if (alive > 0) {
        zeroCellTicks = 0;
      }
    } finally {
      cellsInFlight = false;
    }
  }, 900);

  let waveInFlight = false;
  setInterval(async () => {
    if (state.paused || waveInFlight) return;
    const mode = state.coupling.waveMode;
    if (mode !== "sine" && mode !== "adaptive") return;
    waveInFlight = true;
    try {
      state.coupling.wavePhase += 0.35;
      if (mode === "sine") {
        const vec = Array.from({ length: 13 }, (_, i) => Math.round(35 + 32 * Math.sin(state.coupling.wavePhase + i * 0.55)));
        await applyUnifiedRestraints(vec, "dynamic-sine");
      } else {
        // Omniscient 4-Tier Chaos-Entropy-Health Adaptive Margin (bounded below cellular collapse)
        const h = state.creatures.locked?.found ? Math.min(1, (Number(state.creatures.locked.health) || 35000) / 65535) : 0.7;
        const tNorm = state.creatures.localHabitat ? Math.abs(state.creatures.localHabitat.tempPct - 50) / 50 : 0.2;
        const chaos = state.differential.chaosLyapunov || 0.25;
        const base = Math.round((1 - h) * 28 + tNorm * 18 + chaos * 18 + (state.differential.meanAbsDelta || 0) * 24);
        const vec = Array.from({ length: 13 }, (_, i) =>
          Math.max(0, Math.min(68, Math.round(base + 10 * Math.sin(state.coupling.wavePhase * 0.7 + i * 0.48))))
        );
        await applyUnifiedRestraints(vec, "4T-chaos-adaptive");
      }
    } finally {
      waveInFlight = false;
    }
  }, 2400);
}

let omegaInFlight = false;
async function pollOmegaBioFrostbite(feral = false) {
  if (omegaInFlight) return false;
  omegaInFlight = true;
  state.omegaFeral = Boolean(feral);
  try {
    const r = await httpRequest(OMEGA_PORT, "GET", `/api/run?seed=2026001&mutant=0&feral=${feral ? 1 : 0}`, null, {}, 8000);
    if (r.status === 200) {
      const data = JSON.parse(r.body.toString("utf8"));
      state.engines.t2_omega = true;
      state.omega = {
        elapsed_ms: data.elapsed_ms,
        feral: Boolean(data.feral),
        tb13: data.tb13 ? {
          niches: data.tb13.niches, nov1: data.tb13.nov1, nov2: data.tb13.nov2,
          mass_res: data.tb13.mass_res, apex: data.tb13.apex
        } : null,
        tb14: data.tb14 || null,
        tb15: data.tb15 ? {
          ciss_magnetite_ee: data.tb15.ciss_magnetite_ee,
          tad_gain: data.tb15.tad_gain,
          trp_qy_gain: data.tb15.trp_qy_gain,
          cnidocyte_g: data.tb15.cnidocyte_g,
          levin_wild_heads: data.tb15.levin_wild_heads,
          levin_reprog_heads: data.tb15.levin_reprog_heads,
          levin_dna_mut: data.tb15.levin_dna_mut,
          wired_reach: data.tb15.wired_reach,
          wireless_reach: data.tb15.wireless_reach,
          three_gen_drift: data.tb15.three_gen_drift
        } : null,
        tb16: data.tb16 ? {
          zonation_mono: data.tb16.zonation_mono,
          perturb_r2: data.tb16.perturb_r2,
          essential_auroc: data.tb16.essential_auroc,
          syn3a_dark: data.tb16.syn3a_dark,
          syn3a_discovered: data.tb16.syn3a_discovered,
          proj_mass_res: data.tb16.proj_mass_res,
          six_tier_err: data.tb16.six_tier_err
        } : null,
        updatedAt: Date.now()
      };
      broadcastState();
      return true;
    }
  } catch {
    state.engines.t2_omega = false;
  } finally {
    omegaInFlight = false;
  }
  return false;
}

function startOmegaPoller() {
  pollOmegaBioFrostbite(false);
  setInterval(() => {
    if (state.paused) return;
    // Only re-poll if offline/unpopulated or in live hardware feral mode (don't overwrite feral mode or burn CPU re-running static seed!)
    if (!state.engines.t2_omega || !state.omega || state.omegaFeral) {
      pollOmegaBioFrostbite(state.omegaFeral);
    }
  }, 30000);
}

/* ============================================================================
 * 10. Reverse Proxy (Unified Dark Scientific Embed CSS)
 * ============================================================================ */
function embedCss(kind) {
  const shared = `
    *{scrollbar-width:thin;scrollbar-color:#2a364a #07090d}
    ::-webkit-scrollbar{width:6px;height:6px}
    ::-webkit-scrollbar-track{background:#07090d}
    ::-webkit-scrollbar-thumb{background:#2a364a;border-radius:3px}
    ::-webkit-scrollbar-thumb:hover{background:#3f506b}
  `;
  if (kind === "macro") {
    return `<style>${shared}
      html,body{background:#07090d!important;overflow-y:auto!important;overflow-x:hidden!important}
      header{display:none!important}
      main{display:flex!important;flex-direction:column!important;height:auto!important;min-height:100vh!important}
      section.stage{min-height:310px!important;height:60vh!important;flex:0 0 auto!important;border-bottom:1px solid rgba(203,213,225,0.1)!important}
      aside{width:100%!important;max-width:none!important;border-left:0!important;background:#0c1017!important;padding:10px!important}
    </style>`;
  }
  if (kind === "meso") {
    return `<style>${shared}
      html,body{background:#07090d!important;overflow-x:hidden!important}
      header.topbar{display:none!important}
      main.layout{display:flex!important;flex-direction:column!important;padding:6px!important;gap:6px!important}
      section.panel{background:#0c1017!important;border-color:rgba(203,213,225,0.1)!important}
      section.panel.viewport{order:-1!important}
      .stage-wrap{min-height:290px!important;height:52vh!important}
    </style>`;
  }
  if (kind === "micro") {
    return `<style>${shared}
      html,body{background:#07090d!important;overflow-x:hidden!important;max-width:100%!important}
      header.topbar{background:#0c1017!important;border-color:rgba(203,213,225,0.1)!important;padding:5px 8px!important;gap:4px!important;flex-wrap:wrap!important}
      header.topbar .brand p,header.topbar .hw-badges{display:none!important}
      header.topbar h1{font-size:12px!important;letter-spacing:0.06em!important}
      main.grid-layout{grid-template-columns:minmax(0,1fr)!important;padding:6px!important;gap:6px!important}
      .panel{background:#0c1017!important;border-color:rgba(203,213,225,0.1)!important;min-width:0!important;max-width:100%!important;padding:7px!important;gap:6px!important}
      .panel-head{flex-wrap:wrap!important;gap:4px!important}
      .canvas-wrap{width:100%!important;max-width:100%!important;border-color:rgba(203,213,225,0.12)!important}
      #soupCanvas{width:100%!important;height:auto!important;aspect-ratio:1/1!important;display:block!important}
      .ribo-row{grid-template-columns:1fr 1fr!important}
      pre{overflow-x:auto!important;max-width:100%!important}
    </style>`;
  }
  return "";
}

const BIOFX_BODY_FRAG_ELSE = `
 float light=.40+.60*max(0.,dot(sun,n));
 float ndv=max(0.001,dot(n,-forward));
 float fres=pow(1.-ndv,2.3);
 uint uidMix=bodyUid.x^(bodyUid.y*1664525u);
 float idHash=float(uidMix&1023u)/1023.;
 uint pType=(pattern>>6u)^(uidMix&3u);
 float pFreq=3.2+float((pattern>>3u)&7u)*1.25;
 float pVar=fract(float(pattern&7u)/7.+idHash*.5);
 float pulse=bioTime*(1.6+pVar*2.2)+idHash*6.283;
 vec3 indTint=clamp(abs(fract(idHash+vec3(0.,2./3.,1./3.))*6.-3.)-1.,0.,1.);
 vec3 pBase=mix(baseColor,indTint,.26);
 vec3 accent=mix(pBase.gbr,pBase.brg,pVar);
 vec3 irid=.52+.48*cos(6.28318*(1.1+1.55*ndv+pVar+.14*sin(pulse))+vec3(0.,2.094,4.188));
 float tex=.5+.5*sin(pFreq*n.z*2.2+cos(pFreq*n.x*1.8-pulse*.45));
 if(pType==1u)tex=smoothstep(-.25,.25,sin(pFreq*(n.x*1.6+sin(n.y*3.2+pulse*.5)*.45)));
 else if(pType==2u){vec3 s=sin(pFreq*n*1.6+vec3(pulse*.25));tex=smoothstep(-.12,.48,s.x*s.y*s.z);}
 else if(pType==3u)tex=.5+.5*cos(pFreq*(n.y*1.7+sin(n.z*2.9+n.x*2.1-pulse*.4)*.65));
 float edge=1.-smoothstep(0.,.22,abs(tex-.5));
 vec3 skin=mix(pBase,accent,tex*.72);
 skin=mix(skin,irid,(.24+.40*fres)*(.5+.5*pVar));
 float spec=.52*pow(max(0.,dot(n,normalize(sun-forward))),24.);
 vec3 rim=mix(accent,irid,.55)*fres*(.52+.40*edge);
 vec3 lit=skin*light+vec3(spec)+rim+accent*edge*(.18+.12*sin(pulse));
 color=vec4(mix(clamp(lit,0.,1.),vec3(.05,.12,.16),fog),1.);
`;

const BIOFX_CLOSE_FRAG_ELSE = `
  uint uidMix=bodyUid.x^(bodyUid.y*1664525u);
  float idHash=float(uidMix&1023u)/1023.;
  float hue=fract(float(materialBytes.x)/256.+(idHash-.5)*.24);
  float sat=.44+.56*float(materialBytes.y)/255.;
  float glow=float(materialBytes.w)/255.;
  float sh=float(shine)/255.;
  uint pat=materialBytes.z;
  uint skinIdx=((pat>>6u)+(uint(plan.x)&3u)+(uidMix&3u))%8u;
  float pFreq=3.4+float((pat>>3u)&7u)*1.3;
  float pVar=fract(float(pat&7u)/7.+idHash*.45);
  float tAnim=bioTime*(1.4+pVar*1.8)+plan.x*.73+idHash*6.283;
  vec3 w1=clamp(abs(fract(hue+vec3(0.,2./3.,1./3.))*6.-3.)-1.,0.,1.);
  vec3 w2=clamp(abs(fract(hue+.24+.22*pVar+vec3(0.,2./3.,1./3.))*6.-3.)-1.,0.,1.);
  vec3 w3=clamp(abs(fract(hue+.54+.18*sh+vec3(0.,2./3.,1./3.))*6.-3.)-1.,0.,1.);
  vec3 rgb1=.88*mix(vec3(1.),w1,sat);
  vec3 rgb2=.95*mix(vec3(1.),w2,min(1.,sat+.16));
  vec3 rgb3=mix(vec3(.35,.92,1.),w3,.85);
  float ndv=max(0.001,dot(n,-forward));
  float fres=pow(1.-ndv,2.3);
  vec3 d=dir;
  float warp=sin(d.x*5.2+cos(d.y*4.8+tAnim*.35))+cos(d.z*5.4-sin(d.x*4.4-tAnim*.28));
  float mask=patternShade(pat,d,passive);
  vec3 irid=.52+.48*cos(6.28318*(1.25+1.8*ndv+.45*warp+sh+.12*sin(tAnim*.5))+vec3(0.,2.094,4.188));
  vec3 skin=rgb1;
  vec3 emis=vec3(0.);
  if(!passive){
    if(skinIdx==0u){
      // 0: Iridescent Beetle Bio-Chitin + 3D Cellular Voronoi Scales
      float sc=abs(sin(d.x*pFreq*2.0)*sin(d.y*pFreq*2.0)*sin(d.z*pFreq*2.0));
      float pore=1.-smoothstep(.04,.22,sc);
      skin=mix(rgb1,rgb2,smoothstep(.15,.72,sc));
      skin=mix(skin,irid,.32+.42*fres+.24*sh);
      emis=rgb3*pore*(.28+.72*glow)*(.65+.35*sin(tAnim*2.2-d.x*5.));
    }else if(skinIdx==1u){
      // 1: Animated Cephalopod Turing Chromatophore Waves
      float t=sin(d.x*pFreq*2.2+warp*.9-tAnim*.8)*cos(d.y*pFreq*1.8-warp*.6+tAnim*.5);
      float band=smoothstep(-.32,.32,t);
      float marg=1.-smoothstep(0.,.22,abs(t));
      float wave=.5+.5*sin(d.x*9.-tAnim*2.6);
      skin=mix(rgb1*.78,rgb2,band);
      emis=mix(rgb2,rgb3,wave)*marg*(.38+.78*glow);
    }else if(skinIdx==2u){
      // 2: Translucent Bio-Glass with Pulsing Internal Neural Brain Ganglia & Veins
      float vein=1.-smoothstep(0.,.17,abs(sin(d.x*9.5+warp*1.3-tAnim*1.5)));
      float node=smoothstep(.55,.92,sin(d.x*6.+plan.x)*cos(d.y*6.-tAnim*.9)*sin(d.z*6.));
      float sss=pow(1.-ndv,1.5);
      skin=mix(rgb1*.58,rgb2*.92,sss)+irid*(.22+.34*fres);
      emis=rgb3*(vein*.55+node*.72+sss*.25)*(.42+.80*glow);
    }else if(skinIdx==3u){
      // 3: Hydrothermal Vent Crystalline Magma Carapace
      float m=.5+.5*sin(pFreq*(d.y*1.9+warp*.75)+cos(d.z*pFreq*1.6));
      float fiss=1.-smoothstep(0.,.15,abs(m-.5));
      vec3 magma=mix(rgb2,vec3(1.,.48,.14),.55);
      skin=mix(rgb1*.55,rgb2*.90,m)+irid*(.24+.32*fres);
      emis=magma*fiss*(.45+.85*glow)*(.72+.28*sin(tAnim*2.8+d.z*4.));
    }else if(skinIdx==4u){
      // 4: Hallucinated Curl Spectral Interference Manifold
      float c=sin(d.x*6.2+warp*1.6+tAnim*.4)*sin(d.y*6.2-warp*1.4)+cos(d.z*6.5+warp);
      float iso=1.-smoothstep(0.,.14,abs(fract(c*2.5-tAnim*.25)-.5));
      vec3 hCol=clamp(abs(fract(hue+c*.35+vec3(0.,2./3.,1./3.))*6.-3.)-1.,0.,1.);
      skin=mix(hCol,irid,.36+.34*fres);
      emis=mix(rgb3,hCol,.45)*iso*(.50+.75*glow);
    }else if(skinIdx==5u){
      // 5: Bioluminescent Coral / Reef Polyp Dermal Filaments
      vec3 sp=sin(d*pFreq*2.4+vec3(warp*.55));
      float cell=smoothstep(-.18,.48,sp.x*sp.y*sp.z);
      float cilia=smoothstep(.4,.95,abs(sin(d.y*14.+d.z*12.+tAnim*1.4)));
      skin=mix(rgb1*.70,rgb2,cell);
      skin=mix(skin,irid,.18+.30*fres);
      emis=mix(rgb2,rgb3,.7)*(cilia*.34+(1.-cell)*.44)*(.36+.75*glow);
    }else if(skinIdx==6u){
      // 6: Prismatic Nacreous Mother-of-Pearl Cellular Opal
      vec3 op2=.52+.48*cos(6.28318*(2.1+2.2*ndv+warp*.6+idHash)+vec3(0.,2.094,4.188));
      float fil=1.-smoothstep(.02,.15,abs(sin(d.y*11.+warp*1.5-tAnim*1.7)));
      skin=mix(mix(rgb1,irid,.58),op2,.35+.40*fres);
      emis=mix(rgb3,op2,.65)*fil*(.45+.70*glow);
    }else{
      // 7: Abyssal Globular Myxomycete Protoplasm & Bio-Core
      float rip=.5+.5*sin(d.x*10.+warp*1.8-tAnim*2.4);
      float core=pow(1.-ndv,1.35);
      skin=mix(rgb1*.50,rgb2,.45+.50*core);
      emis=mix(rgb3,irid,.45)*(rip*.45+core*.42)*(.42+.80*glow);
    }
  }
  if(selectedBody!=0u){skin=mix(skin,vec3(1.,.96,.48),.55);emis+=vec3(.95,.85,.25)*fres*1.1;}
  vec3 lamp=vec3(.35634832,.25453451,.89087081);
  float spec=(.54+.94*sh)*pow(max(0.,dot(n,normalize(lamp-forward))),30.);
  float dim=(flags&2u)!=0u?.42:((flags&128u)!=0u?.65:1.);
  float lum=dim*(.48+.52*mask)*(.30+.70*max(0.,dot(n,lamp))+.45*glow*glow);
  vec3 rim=mix(rgb2,rgb3,.55)*fres*(.40+.62*glow)*dim;
  float diam=length(dims),dist=length(dims*.5-eye);
  float fog=.46*clamp((depth-dist+.5*diam)/(diam+1e-6),0.,1.);
  color=vec4(sqrt(clamp(mix(skin*lum+dim*(spec+emis+rim),vec3(.008,.014,.032),fog),0.,1.)),1.);
`;

const ULTRA_ICOSPHERE_BODY = `function icosphere(){
  const g=(1+Math.sqrt(5))/2;
  const p=[[-1,g,0],[1,g,0],[-1,-g,0],[1,-g,0],[0,-1,g],[0,1,g],[0,-1,-g],[0,1,-g],[g,0,-1],[g,0,1],[-g,0,-1],[-g,0,1]];
  let faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const cache=new Map();
  function mid(a,b){const key=Math.min(a,b)*65536+Math.max(a,b);if(!cache.has(key)){cache.set(key,p.length);p.push(p[a].map((v,k)=>(v+p[b][k])/2));}return cache.get(key);}
  for(let sub=0;sub<2;sub++){const next=[];for(const [a,b,c] of faces){const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);next.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]);}faces=next;}
  return {vertices:new Float32Array(p.flatMap(v=>v.map(x=>x/Math.hypot(...v)))),indices:new Uint16Array(faces.flat())};
}`;

function injectMacroBioFx(jsSource, zoomMode = "dive") {
  let src = jsSource.replace(/\r\n/g, "\n");
  let patched = 0;

  // 1. Hardware WebGL2 Antialiasing + High-Performance GPU Driver
  if (src.includes('antialias:false')) {
    src = src.replace('antialias:false', 'antialias:true');
    patched++;
  }
  // 2. 2-Level Subdivided 320-Tri High-Res Icosphere for nearby 3D organisms
  const icoRe = /function icosphere\(\)\{[\s\S]*?return \{vertices:new Float32Array\(p\.flatMap\(v=>v\.map\(x=>x\/Math\.hypot\(\.\.\.v\)\)\)\),indices:new Uint16Array\(tris\)\};\n\}/;
  if (icoRe.test(src)) { src = src.replace(icoRe, ULTRA_ICOSPHERE_BODY); patched++; }

  // 3. Inject live bioTime uniform & per-individual bodyUid varying across body + close shaders
  if (src.includes("uniform float focal, alpha, birthFade;")) {
    src = src.replace("uniform float focal, alpha, birthFade;", "uniform float focal, alpha, birthFade, bioTime;");
    patched++;
  }
  if (src.includes("uniform vec3 sun,forward,rightDir,upDir;")) {
    src = src.replace("uniform vec3 sun,forward,rightDir,upDir;", "uniform vec3 sun,forward,rightDir,upDir;uniform float bioTime;");
    patched++;
  }
  if (src.includes('g.uniform1f(uniform(p,"birthFade"),Math.min(1,age/200));')) {
    src = src.replace('g.uniform1f(uniform(p,"birthFade"),Math.min(1,age/200));', 'g.uniform1f(uniform(p,"birthFade"),Math.min(1,age/200));g.uniform1f(uniform(p,"bioTime"),now*.001);');
    patched++;
  }
  // Pass exact 64-bit uid from vertex shaders to fragment shaders for per-individual multi-skins & morphing!
  if (src.includes("out vec3 baseColor; out vec3 normalW; flat out uint indexID; flat out uint pattern;")) {
    src = src.replace("out vec3 baseColor; out vec3 normalW; flat out uint indexID; flat out uint pattern;", "out vec3 baseColor; out vec3 normalW; flat out uint indexID; flat out uint pattern; flat out uvec2 bodyUid;");
    patched++;
  }
  if (src.includes("baseColor=colorWheel(float(look.y)/256.); pattern=look.z;")) {
    src = src.replace("baseColor=colorWheel(float(look.y)/256.); pattern=look.z;", "baseColor=colorWheel(float(look.y)/256.); pattern=look.z; bodyUid=uid;");
    patched++;
  }
  if (src.includes("in vec3 baseColor;in vec3 normalW;in float fog;flat in uint indexID;flat in uint pattern;")) {
    src = src.replace("in vec3 baseColor;in vec3 normalW;in float fog;flat in uint indexID;flat in uint pattern;", "in vec3 baseColor;in vec3 normalW;in float fog;flat in uint indexID;flat in uint pattern;flat in uvec2 bodyUid;");
    patched++;
  }
  if (src.includes("flat out uint selectedBody;")) {
    src = src.replace("flat out uint selectedBody;", "flat out uint selectedBody;flat out uvec2 bodyUid;");
    patched++;
  }
  if (src.includes("selectedBody=(hasChosen && all(equal(uid,chosen)))?1u:0u;")) {
    src = src.replace("selectedBody=(hasChosen && all(equal(uid,chosen)))?1u:0u;", "selectedBody=(hasChosen && all(equal(uid,chosen)))?1u:0u;bodyUid=uid;");
    patched++;
  }
  if (src.includes("flat in uint selectedBody;")) {
    src = src.replace("flat in uint selectedBody;", "flat in uint selectedBody;flat in uvec2 bodyUid;");
    patched++;
  }

  // 4. Living-Cell Organic Undulation in Near-Mesh Vertex Shader
  if (src.includes("scale=.35+tile.r*1.45+shape.z*tile.g; e=shape.y;")) {
    src = src.replace(
      "scale=.35+tile.r*1.45+shape.z*tile.g; e=shape.y;",
      "scale=(.35+tile.r*1.45+shape.z*tile.g)*(1.+.058*sin(n.x*5.5-bioTime*2.3+shape.x*1.3+float(uid.x&31u)*.2)+.038*cos(n.y*6.2+n.z*5.1+bioTime*1.7)); e=shape.y;"
    );
    patched++;
  }

  // 5. High-Precision Raymarcher (40 steps + 7 bisection refinements + #ifndef PICK per-individual living-cell morphing)
  if (src.includes("return length(q)-plan.w*(.35+1.45*sampleRG.r+plan.z*sampleRG.g);")) {
    src = src.replace(
      "return length(q)-plan.w*(.35+1.45*sampleRG.r+plan.z*sampleRG.g);",
      "float rBase=plan.w*(.35+1.45*sampleRG.r+plan.z*sampleRG.g);\n#ifndef PICK\n  float idP=float((bodyUid.x^bodyUid.y)&255u)/255.;\n  float ph=plan.x*1.37+idP*6.283+bioTime*(1.8+idP*1.2);\n  float lobes=4.2+floor(idP*4.)*1.4;\n  rBase*=1.+.052*sin(q.x*lobes-ph)+.038*cos(q.y*6.2+q.z*5.8+ph*.85);\n#endif\n  return length(q)-rBase;"
    );
    patched++;
  }
  src = src.replace("int steps=clamp(int((t1-t0)*center.z)+3,6,24);", "int steps=clamp(int((t1-t0)*center.z)+5,10,40);");
  src = src.replace("for(int j=0;j<5;j++){", "for(int j=0;j<7;j++){");

  // 6. Observer-Only Multi-Shaders (bodyFrag + 8-Skin Per-Individual closeFrag, preserving #ifdef PICK 100% untouched!)
  const bodyRe = /float light=\.45\+\.55\*max\(0\.,dot\(sun,n\)\);\n float stripe=\.96\+\.04\*cos\(float\(pattern%11u\+1u\)\*n\.z\*4\.\);\n color=vec4\(mix\(baseColor\*light\*stripe,vec3\(\.10,\.28,\.29\),fog\),1\);/;
  const closeRe = /float hue=float\(materialBytes\.x\)\/256\.;[\s\S]*?color=vec4\(sqrt\(clamp\(mix\(rgb\*lum\+dim\*spec,vec3\(\.008,\.012,\.030\),fog\),0\.,1\.\)\),1\.\);/;
  if (bodyRe.test(src)) { src = src.replace(bodyRe, BIOFX_BODY_FRAG_ELSE.trim()); patched++; }
  if (closeRe.test(src)) { src = src.replace(closeRe, BIOFX_CLOSE_FRAG_ELSE.trim()); patched++; }

  // 7. Reef-Dive Initial Close-Up Camera + Ultra Decode Worker Flag
  const camMult = zoomMode === "orbit" ? ".78" : ".36";
  if (src.includes("view.distance=.8*Math.min(...state.terrain.dims);")) {
    src = src.replace("view.distance=.8*Math.min(...state.terrain.dims);", `view.distance=${camMult}*Math.min(...state.terrain.dims);`);
    patched++;
  }
  src = src.replace(
    'pollRequested?"/proxy/macro/viewer_decode.js?transport=poll":"/proxy/macro/viewer_decode.js"',
    'pollRequested?"/proxy/macro/viewer_decode.js?biofx=1&transport=poll":"/proxy/macro/viewer_decode.js?biofx=1"'
  );

  // 8. Live GPU Hardware Driver & Ultra Close-Up Counter Telemetry Bridge -> Observatory Parent
  const uiHook = 'setText("worldMode",s.wild?"Wild world":"Lab world");';
  if (src.includes(uiHook)) {
    src = src.replace(
      uiHook,
      'setText("worldMode",(s.wild?"WILD ULTRA":"LAB ULTRA")+" · "+state.closeCount+" 3D Close-Ups");' +
      'try{const _fps=quantile(frameTimes,.5);window.parent.postMessage({type:"macro_gpu",gpu:state.gpu,closeCount:state.closeCount,shapes:state.shapes.size,fps:_fps?Number((1000/_fps).toFixed(1)):0,pop:s.count,tick:String(s.tick)},location.origin);}catch{}'
    );
    patched++;
  }

  console.log(`[T4:Proxy Bio-FX ULTRA v5] Injected observer-only 8-skin GPU pipeline (${patched} stages, PICK intact, zoom=${zoomMode})`);
  return src;
}

function injectMacroDecodeBioFx(jsSource) {
  let src = jsSource.replace(/\r\n/g, "\n");
  let patched = 0;
  // Run updateNear() synchronously back-to-back with snapshot transfer -> ZERO 1-frame 0-closeup flicker!
  if (src.includes("    scheduleNear();\n")) { src = src.replace("    scheduleNear();\n", "    if(camera && current)updateNear();\n"); patched++; }
  if (src.includes("Math.max(0,100-(performance.now()-sentAt))")) { src = src.replace("Math.max(0,100-(performance.now()-sentAt))", "0"); patched++; }
  if (src.includes("const detailBudget=64;")) { src = src.replace("const detailBudget=64;", "const detailBudget=360;"); patched++; }
  if (src.includes("if(boxDepth<.5*focal/3){")) { src = src.replace("if(boxDepth<.5*focal/3){", "if(boxDepth<.5*focal/.75){"); patched++; }
  if (src.includes("if(depth<.05 || depth>r*focal/3) continue;")) { src = src.replace("if(depth<.05 || depth>r*focal/3) continue;", "if(depth<.05 || depth>r*focal/.75) continue;"); patched++; }
  if (src.includes("if(pixels>=6 && depth>=.05+2*radius)consider(count,pixels);")) { src = src.replace("if(pixels>=6 && depth>=.05+2*radius)consider(count,pixels);", "if(pixels>=1.2 && depth>=.05+2*radius)consider(count,pixels);"); patched++; }
  console.log(`[T4:Proxy Worker ULTRA v5] Synchronous zero-flicker 360-raymarch budget (${patched}/6 hooks)`);
  return src;
}

function rewriteProxyContent(kind, urlPath, text) {
  const isEmbed = urlPath.includes("embed=1");
  const isBioFx = urlPath.includes("biofx=1");
  const zoomMode = urlPath.includes("zoom=orbit") ? "orbit" : "dive";
  const cleanPath = urlPath.split("?")[0];
  if (kind === "macro") {
    if (cleanPath === "/" || cleanPath === "/viewer.html") {
      const glUrl = isBioFx ? `/proxy/macro/viewer_gl.js?biofx=1&zoom=${zoomMode}` : "/proxy/macro/viewer_gl.js";
      let out = text.replaceAll('href="/viewer.css"', 'href="/proxy/macro/viewer.css"').replaceAll('src="/viewer_gl.js"', `src="${glUrl}"`);
      if (isEmbed) out = out.replace("</head>", embedCss("macro") + "</head>");
      return out;
    }
    if (cleanPath.startsWith("/viewer_gl.js")) {
      let out = text.replaceAll('"/api/', '"/proxy/macro/api/').replaceAll('"/viewer_decode.js', '"/proxy/macro/viewer_decode.js').replaceAll('"/stream/', '"/proxy/macro/stream/');
      if (isBioFx) out = injectMacroBioFx(out, zoomMode);
      return out;
    }
    if (cleanPath.startsWith("/viewer_decode.js")) {
      let out = text.replaceAll('"/api/', '"/proxy/macro/api/').replaceAll('"/ws"', '"/proxy/macro/ws"');
      if (isBioFx) out = injectMacroDecodeBioFx(out);
      return out;
    }
  }
  if (kind === "meso") {
    if (cleanPath === "/" || cleanPath === "/index.html") return isEmbed ? text.replace("</head>", embedCss("meso") + "</head>") : text;
    if (cleanPath.startsWith("/app.js")) return text.replaceAll("`/api/", "`/proxy/meso/api/").replaceAll('"/api/', '"/proxy/meso/api/').replaceAll("'/api/", "'/proxy/meso/api/");
  }
  if (kind === "micro") {
    if (cleanPath === "/" || cleanPath === "/index.html") {
      let out = text.replaceAll('href="/styles.css"', 'href="/proxy/micro/styles.css"').replaceAll('src="/app.js"', 'src="/proxy/micro/app.js"');
      if (isEmbed) out = out.replace("</head>", embedCss("micro") + "</head>");
      return out;
    }
    if (cleanPath.startsWith("/app.js")) return text.replaceAll("'/api/", "'/proxy/micro/api/").replaceAll('"/api/', '"/proxy/micro/api/');
  }
  if (kind === "omega") {
    if (cleanPath === "/" || cleanPath === "/index.html") {
      return text
        .replaceAll('href="styles.css"', 'href="/proxy/omega/styles.css"')
        .replaceAll('src="app.js"', 'src="/proxy/omega/app.js"');
    }
    if (cleanPath.startsWith("/app.js")) {
      return text.replaceAll("`/api/", "`/proxy/omega/api/").replaceAll("'/api/", "'/proxy/omega/api/").replaceAll('"/api/', '"/proxy/omega/api/');
    }
  }
  return text;
}

const MAX_PROXY_REQ_BYTES = 2 * 1024 * 1024;
const MAX_PROXY_RES_BYTES = 16 * 1024 * 1024;

function sanitizeProxyHeaders(rawHeaders) {
  const out = { ...rawHeaders };
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

function proxyHttp(kind, targetPort, subPath, req, res) {
  if (req.method !== "GET" && req.method !== "HEAD" && !isSafeLoopbackRequest(req, false)) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden cross-origin proxy mutation" }));
    return;
  }
  const cleanSub = subPath.split("?")[0];
  const isSse = (kind === "micro" && cleanSub.startsWith("/api/events")) || (kind === "macro" && cleanSub.startsWith("/stream/"));
  const needsRewrite =
    (kind === "macro" && (cleanSub === "/" || cleanSub === "/viewer.html" || cleanSub.startsWith("/viewer_gl.js") || cleanSub.startsWith("/viewer_decode.js"))) ||
    (kind === "meso"  && (cleanSub === "/" || cleanSub === "/index.html" || cleanSub.startsWith("/app.js"))) ||
    (kind === "micro" && (cleanSub === "/" || cleanSub === "/index.html" || cleanSub.startsWith("/app.js"))) ||
    (kind === "omega" && (cleanSub === "/" || cleanSub === "/index.html" || cleanSub.startsWith("/app.js")));
  const sniffInspect = kind === "macro" && cleanSub === "/api/inspect" && req.method === "POST";
  const sniffCells = kind === "meso" && (cleanSub.startsWith("/api/step") || cleanSub.startsWith("/api/init") || cleanSub.startsWith("/api/action") || cleanSub.startsWith("/api/cmd"));

  const chunks = [];
  let reqBytes = 0;
  let aborted = false;
  req.on("data", (c) => {
    if (aborted) return;
    reqBytes += c.length;
    if (reqBytes > MAX_PROXY_REQ_BYTES) {
      aborted = true;
      res.writeHead(413, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Proxy request body too large" }));
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on("end", () => {
    if (aborted) return;
    const reqBody = chunks.length ? Buffer.concat(chunks) : null;
    const headers = { Host: `127.0.0.1:${targetPort}`, Origin: `http://127.0.0.1:${targetPort}` };
    if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"];
    if (reqBody && reqBody.length > 0) headers["Content-Length"] = String(reqBody.length);
    else if (req.method === "POST") headers["Content-Length"] = "0";

    const up = http.request({ host: "127.0.0.1", port: targetPort, method: req.method, path: subPath, headers }, (upRes) => {
      upRes.on("error", () => { try { res.destroy(); } catch {} });
      res.on("error", () => { try { up.destroy(); } catch {} });
      if (isSse) {
        const outH = { ...upRes.headers, "cache-control": "no-cache" }; delete outH["content-length"];
        res.writeHead(upRes.statusCode || 200, outH);
        upRes.pipe(res);
        req.on("close", () => { try { up.destroy(); } catch {} });
        return;
      }
      if (needsRewrite || sniffInspect || sniffCells) {
        const resChunks = [];
        let resBytes = 0;
        let resOverflow = false;
        upRes.on("data", (c) => {
          if (resOverflow) return;
          resBytes += c.length;
          if (resBytes > MAX_PROXY_RES_BYTES) {
            resOverflow = true;
            up.destroy();
            if (!res.headersSent) { res.writeHead(502, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "Upstream response exceeded cap" })); }
            return;
          }
          resChunks.push(c);
        });
        upRes.on("end", () => {
          if (resOverflow) return;
          let buf = Buffer.concat(resChunks);
          if (needsRewrite && (upRes.statusCode || 0) === 200) buf = Buffer.from(rewriteProxyContent(kind, subPath, buf.toString("utf8")), "utf8");
          if (sniffInspect && (upRes.statusCode || 0) === 200) { try { Promise.resolve(onCreatureInspect(JSON.parse(buf.toString("utf8")), "3D-dome-click", true)).catch(() => {}); } catch {} }
          if (sniffCells && (upRes.statusCode || 0) === 200) {
            try {
              const data = JSON.parse(buf.toString("utf8"));
              if (data.telemetry) { state.cells.telemetry = data.telemetry; state.cells.bridge = data.bridge; state.cells.updatedAt = Date.now(); state.engines.t2_cells = true; computeDifferentials(); broadcastState(); }
            } catch {}
          }
          const outH = { ...sanitizeProxyHeaders(upRes.headers), "content-length": String(buf.length), "cache-control": "no-store" }; delete outH["transfer-encoding"];
          res.writeHead(upRes.statusCode || 200, outH);
          res.end(buf);
        });
        return;
      }
      res.writeHead(upRes.statusCode || 200, sanitizeProxyHeaders(upRes.headers));
      upRes.pipe(res);
      req.on("close", () => { if (!res.writableEnded) { try { up.destroy(); } catch {} } });
    });
    up.on("error", (err) => {
      if (!res.headersSent) { res.writeHead(502, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: `Upstream ${kind} (${targetPort}) unavailable: ${err.message}` })); }
    });
    if (reqBody && reqBody.length > 0) up.write(reqBody);
    up.end();
  });
}

/* ============================================================================
 * 11. HTTP + WebSocket Hub Server (:8790)
 * ============================================================================ */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let rejected = false;
    req.on("data", (c) => {
      if (rejected) return;
      totalBytes += c.length;
      if (totalBytes > 262144) {
        rejected = true;
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      if (rejected) return;
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) { reject(e); }
    });
    req.on("error", (e) => { if (!rejected) reject(e); });
  });
}

const server = http.createServer(async (req, res) => {
  let u;
  try {
    u = new URL(req.url || "/", `http://127.0.0.1:${HUB_PORT}`);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad request");
    return;
  }
  const p = u.pathname;

  if (p === "/proxy/macro") { res.writeHead(302, { Location: "/proxy/macro/" }); res.end(); return; }
  if (p === "/proxy/omega") { res.writeHead(302, { Location: "/proxy/omega/" }); res.end(); return; }
  if (p === "/proxy/meso")  { res.writeHead(302, { Location: "/proxy/meso/" });  res.end(); return; }
  if (p === "/proxy/micro") { res.writeHead(302, { Location: "/proxy/micro/" }); res.end(); return; }
  if (p.startsWith("/proxy/macro/")) return proxyHttp("macro", MACRO_PORT, "/" + p.slice("/proxy/macro/".length) + u.search, req, res);
  if (p.startsWith("/proxy/omega/")) return proxyHttp("omega", OMEGA_PORT, "/" + p.slice("/proxy/omega/".length) + u.search, req, res);
  if (p.startsWith("/proxy/meso/"))  return proxyHttp("meso",  MESO_PORT,  "/" + p.slice("/proxy/meso/".length)  + u.search, req, res);
  if (p.startsWith("/proxy/micro/")) return proxyHttp("micro", MICRO_PORT, "/" + p.slice("/proxy/micro/".length) + u.search, req, res);

  if (p === "/zeta-omega") { res.writeHead(302, { Location: "/zeta-omega/" }); res.end(); return; }
  if (p.startsWith("/zeta-omega/")) {
    let subRel;
    try { subRel = decodeURIComponent(p.slice("/zeta-omega/".length)); } catch { res.writeHead(400); res.end("Bad path"); return; }
    let targetPath;
    if (!subRel || subRel === "index.html") {
      targetPath = PATHS.zetaHtml;
    } else if (/^[A-Za-z0-9_.-]+\.html$/i.test(subRel)) {
      targetPath = path.resolve(ZETA_PKG_ROOT, "html", subRel);
    } else if (/^(html|pdf|specs|excel|csv|reports|results)\//i.test(subRel)) {
      targetPath = path.resolve(ZETA_PKG_ROOT, subRel);
    } else {
      res.writeHead(404); res.end("Not found"); return;
    }
    const pkgPrefix = ZETA_PKG_ROOT + path.sep;
    if (!targetPath.startsWith(pkgPrefix)) { res.writeHead(403); res.end("Forbidden"); return; }
    fs.readFile(targetPath, (err, data) => {
      if (err) { res.writeHead(404); res.end("Zeta-Omega asset not found"); return; }
      const ext = path.extname(targetPath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      res.end(data);
    });
    return;
  }
  // Also resolve root-relative sibling links (../pdf/..., ../specs/..., ../excel/..., ../reports/..., ../csv/..., ../results/...) opened from /zeta-omega/
  if (/^\/(pdf|specs|excel|csv|reports|results)\//i.test(p)) {
    let subRel;
    try { subRel = decodeURIComponent(p.slice(1)); } catch { res.writeHead(400); res.end("Bad path"); return; }
    const targetPath = path.resolve(ZETA_PKG_ROOT, subRel);
    if (!targetPath.startsWith(ZETA_PKG_ROOT + path.sep)) { res.writeHead(403); res.end("Forbidden"); return; }
    fs.readFile(targetPath, (err, data) => {
      if (err) { res.writeHead(404); res.end("Asset not found"); return; }
      const ext = path.extname(targetPath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      res.end(data);
    });
    return;
  }

  if (req.method === "GET" && p.startsWith("/api/stack/shape/")) {
    const clade = Number(p.slice("/api/stack/shape/".length));
    const shape = rawCache.shapes.get(clade);
    if (!shape) { res.writeHead(404, { "Content-Type": "application/json" }); res.end(JSON.stringify({ found: false, clade })); return; }
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ found: true, ...shape }));
    return;
  }

  if (req.method === "GET" && p === "/api/stack/env-slice") {
    const zReq = u.searchParams.has("z") ? Number(u.searchParams.get("z")) : null;
    const payload = buildEnvSlicePayload(zReq);
    if (!payload) { res.writeHead(204); res.end(); return; }
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify(payload));
    return;
  }

  if (req.method === "GET" && (p === "/api/stack/events" || p === "/api/triscale/events")) {
    if (!isLoopbackHost(req.headers.host)) { res.writeHead(403); res.end("Forbidden"); return; }
    if (sseClients.size >= 32) { res.writeHead(429); res.end("Too many SSE clients"); return; }
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    sseClients.add(res);
    try { res.write(buildStatePayload()); } catch { sseClients.delete(res); }
    req.on("close", () => sseClients.delete(res));
    return;
  }

  if (req.method === "POST" && (p === "/api/stack/action" || p === "/api/triscale/action")) {
    if (!isSafeLoopbackRequest(req, true)) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden: requires loopback Origin/Host & application/json" }));
      return;
    }
    try {
      const body = await readJsonBody(req);
      const op = body.op;

      if (op === "toggle_auto") { state.coupling.autoCouple = Boolean(body.value); pushCausalEvent("4-TIER HUB", "AUTO-COUPLE", state.coupling.autoCouple ? "ENABLED 4-tier closed loop" : "PAUSED"); broadcastState(); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return; }
      if (op === "toggle_env_solvent") { state.coupling.envToCellsSolvent = Boolean(body.value); pushCausalEvent("T4 ➔ T2", "AUTO-SOLVENT", state.coupling.envToCellsSolvent ? "ON" : "OFF"); broadcastState(); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return; }
      if (op === "toggle_reseed") { state.coupling.reseedOnLock = Boolean(body.value); broadcastState(); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return; }
      if (op === "toggle_anti_mono") { state.coupling.antiMonoculture = Boolean(body.value); pushCausalEvent("T4 ANTI-MONO", "GUARD", state.coupling.antiMonoculture ? "ENABLED automatic Cambrian renewal" : "OFF"); broadcastState(); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return; }
      if (op === "transfect") { const out = await transfectDnaToCells("operator"); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(out)); return; }

      if (op === "respawn_cosmos") {
        const preset = body.preset || "cambrian";
        await spawnWildCosmos(preset);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, preset: currentCosmosPreset, genesis: currentGenesis }));
        return;
      }

      if (op === "ignite_genesis") {
        await spawnWildCosmos(body.genesis || body);
        if (body.syncLowerTiers) {
          const reg = clampInt(body.cellRegime, 0, 5, state.coupling.activeRegime);
          const sol = clampInt(body.cellSolvent, 0, 3, state.coupling.activeSolvent);
          const seedVal = body.genesis?.lab ? clampInt(body.genesis?.seed, 0, 2147483647, 42) : 0;
          const meanR = Math.round(state.coupling.restraints.reduce((a, b) => a + b, 0) / 13);
          state.coupling.activeRegime = reg; state.coupling.activeSolvent = sol;
          await Promise.allSettled([
            httpRequest(MICRO_PORT, "POST", "/api/cmd", { action: "reset", regime: 1, seed: seedVal }),
            httpRequest(MESO_PORT, "POST", "/api/cmd", { op: "init", regime: reg, solvent: sol, seed: seedVal, restraint: meanR, warmup: 42 })
          ]);
          pushCausalEvent("ALL 4 TIERS", "SYNC GENESIS", `Synchronized T1 DNA + T2 Cells (R${reg}, ${SOLVENT_NAMES[sol]}) with custom T3/T4 Cosmos`);
        }
        broadcastState();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, genesis: currentGenesis }));
        return;
      }

      if (op === "live_macro_rates") {
        const tps = clampInt(body.tps, 0, 1000, currentGenesis.tps);
        const sps = clampInt(body.sps, 1, 60, currentGenesis.sps);
        currentGenesis.tps = tps; currentGenesis.sps = sps;
        await Promise.allSettled([
          httpRequest(MACRO_PORT, "POST", "/api/cmd", { cmd: `tps ${tps}` }),
          httpRequest(MACRO_PORT, "POST", "/api/cmd", { cmd: `sps ${sps}` })
        ]);
        pushCausalEvent("T4 LIVE PACE", `TPS ${tps} · SPS ${sps}`, `Updated live Asmodensius simulation cadence without restart`);
        broadcastState();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, tps, sps }));
        return;
      }

      if (op === "cross_mutate_all4") {
        // Synchronized cross-tier mutation, transfection, plume & morph wave!
        await Promise.allSettled([
          httpRequest(MICRO_PORT, "POST", "/api/cmd", { action: "inoculate", arch: -1 }),
          transfectDnaToCells("sync-morph"),
          triggerCellsAction("plume", { x: Math.floor(nextHubRand() * 32), y: Math.floor(nextHubRand() * 32) }, "T2 CELLS", "Morphogenesis nutrient pulse")
        ]);
        if (state.creatures.roster.length > 1) {
          const curIdx = state.creatures.roster.findIndex((c) => c.uid === state.creatures.lockedUid);
          const nxt = state.creatures.roster[(curIdx + 1) % state.creatures.roster.length];
          await lockCreature(nxt.uid, "sync-morph");
        }
        state.coupling.waveMode = "adaptive";
        pushCausalEvent("ALL 4 TIERS", "SYNC MORPH", "Inoculated T1 DNA → Transfected T2 Cells + Plume → Adaptive 4T Wave → Morphed T3 Specimen");
        broadcastState();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      if (op === "feral_all4") {
        // Trigger hardware RDSEED / RDTSC / Wild OS Entropy across ALL 4 TIERS + Omega (:8791) simultaneously!
        const meanR = 0;
        state.coupling.restraints = new Array(13).fill(0);
        state.coupling.waveMode = "feral";
        await Promise.allSettled([
          httpRequest(MICRO_PORT, "POST", "/api/cmd", { action: "reset", regime: 1, seed: 0 }),
          httpRequest(MESO_PORT, "POST", "/api/cmd", { op: "init", regime: 3, solvent: state.coupling.activeSolvent, seed: 0, restraint: meanR, warmup: 48 }),
          pollOmegaBioFrostbite(true)
        ]);
        await spawnWildCosmos(body.preset || "hyperchaos");
        pushCausalEvent("ALL 4 TIERS", "FERAL HW", "Ignited hardware RDSEED (T1+T2), RDTSC Feral (:8791 Omega) & Wild Cosmos (T3/T4)");
        broadcastState();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      if (op === "lock_creature") {
        let uid = body.uid;
        if (!uid && body.clade !== undefined) {
          uid = state.creatures.cladeSamples.get(Number(body.clade));
        }
        if (!uid && state.creatures.roster.length > 0) {
          if (body.mode === "top_clade" && state.creatures.topClades.length > 0) {
            const topC = state.creatures.topClades[0][0];
            uid = state.creatures.cladeSamples.get(topC) || state.creatures.roster[0].uid;
          } else {
            const curIdx = state.creatures.roster.findIndex((c) => c.uid === state.creatures.lockedUid);
            uid = state.creatures.roster[(curIdx + 1) % state.creatures.roster.length].uid;
          }
        }
        const out = await lockCreature(uid, body.clade !== undefined ? `clade-C${body.clade}` : (body.uid ? "roster" : (body.mode || "cycle")));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(out));
        return;
      }

      if (op === "cells_regime") {
        const reg = clampInt(body.regime, 0, 5, 5);
        const sol = clampInt(body.solvent, 0, 3, state.coupling.activeSolvent);
        const seed = body.feral ? 0 : (state.creatures.lockedUid ? uidToSeed32(state.creatures.lockedUid) : 5000);
        const meanR = Math.round(state.coupling.restraints.reduce((a, b) => a + b, 0) / 13);
        state.coupling.activeRegime = reg; state.coupling.activeSolvent = sol;
        const r = await httpRequest(MESO_PORT, "POST", "/api/cmd", { op: "init", regime: reg, solvent: sol, seed, restraint: meanR, warmup: reg === 5 ? 36 : 64 });
        if (r.status === 200) {
          const data = JSON.parse(r.body.toString("utf8"));
          if (data.telemetry) { state.cells.telemetry = data.telemetry; state.cells.bridge = data.bridge; state.cells.updatedAt = Date.now(); }
        }
        pushCausalEvent("T2 CELLS v1.3", `REGIME ${reg}`, `Switched Cellulogonic Mecha to Regime ${reg} (${SOLVENT_NAMES[sol]})`);
        computeDifferentials(); broadcastState();
        res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return;
      }

      if (op === "env_solvent") { await syncEnvSolventToCells(clampInt(body.val, 0, 3, 0), "operator-override"); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return; }
      if (op === "set_slice_z") { const maxZ = (rawCache.dims ? rawCache.dims[2] - 1 : 31); state.env.sliceZ = clampInt(body.z, 0, maxZ, 0); broadcastState(); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return; }
      if (op === "restraints") { state.coupling.waveMode = body.mode || "manual"; if (Array.isArray(body.values)) await applyUnifiedRestraints(body.values, body.label || state.coupling.waveMode); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return; }

      if (op === "wave_mode") {
        state.coupling.waveMode = body.mode || "manual";
        const presets = {
          feral: new Array(13).fill(0),
          paradox50: new Array(13).fill(50),
          constitutional: [15, 0, 20, 10, 10, 0, 0, 0, 10, 0, 25, 0, 10],
          gradient: Array.from({ length: 13 }, (_, i) => Math.round((i / 12) * 85)),
          castrated100: new Array(13).fill(100)
        };
        if (presets[state.coupling.waveMode]) await applyUnifiedRestraints(presets[state.coupling.waveMode], `preset:${state.coupling.waveMode}`);
        else { pushCausalEvent("ZETA-OMEGA", "WAVE", `Active mode: ${state.coupling.waveMode}`); broadcastState(); }
        res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return;
      }

      if (op === "meso_pulse") {
        const subOp = body.action || "plume";
        const hasCoords = body.params && Number.isFinite(Number(body.params.x)) && Number.isFinite(Number(body.params.y));
        const px = hasCoords ? clampInt(body.params.x, 0, 31, 16) : Math.floor(nextHubRand() * 32);
        const py = hasCoords ? clampInt(body.params.y, 0, 31, 16) : Math.floor(nextHubRand() * 32);
        const params = subOp === "plume" ? { x: px, y: py } : (body.params || {});
        if (subOp === "plume") state.coupling.creaturePlumes++;
        const out = await triggerCellsAction(subOp, params, hasCoords ? "T4 ENV ➔ T2 CELLS" : "T3 ➔ T2 CELLS",
          subOp === "plume" ? `Plume @ (${px},${py})${hasCoords ? " via T4 Voxel Radar" : ""}` : `Triggered ${subOp}`);
        res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(out)); return;
      }

      if (op === "micro_shock") {
        const act = body.action || "vivisect";
        const payload = act === "vivisect" ? { action: "vivisect", pct: 50 } : act === "extinction" ? { action: "extinction", pct: 90 } : { action: "inoculate", arch: -1 };
        await httpRequest(MICRO_PORT, "POST", "/api/cmd", payload);
        pushCausalEvent("T1 DNA", act.toUpperCase(), `Executed ${act} in x86-64 AUTOPHAGE soup`);
        broadcastState();
        res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); return;
      }

      if (op === "sync_pause") {
        const pause = Boolean(body.pause);
        state.paused = pause;
        await Promise.allSettled([
          httpRequest(MACRO_PORT, "POST", "/api/cmd", { cmd: pause ? "pause" : "run" }),
          httpRequest(MICRO_PORT, "POST", "/api/cmd", { action: pause ? "pause" : "play" })
        ]);
        pushCausalEvent("ALL 4 TIERS", pause ? "PAUSE" : "RESUME", pause ? "Paused all 4 tiers + T2/Wave/Omega pollers" : "Resumed live execution across all 4 tiers");
        broadcastState();
        res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true, paused: state.paused })); return;
      }

      res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "unknown op" }));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  let decoded;
  try {
    decoded = decodeURIComponent(p);
  } catch {
    res.writeHead(400); res.end("Bad path"); return;
  }
  const rel = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const fp = path.resolve(WEB_DIR, rel);
  if (!fp.startsWith(WEB_DIR + path.sep) && fp !== path.join(WEB_DIR, "index.html")) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    res.end(data);
  });
});

server.on("upgrade", (req, clientSock, head) => {
  if (!isLoopbackHost(req.headers.host) || !isLoopbackOrigin(req.headers.origin)) {
    try { clientSock.write("HTTP/1.1 403 Forbidden\r\n\r\n"); } catch {}
    clientSock.destroy();
    return;
  }
  let u;
  try { u = new URL(req.url || "/", `http://127.0.0.1:${HUB_PORT}`); } catch { clientSock.destroy(); return; }
  if (u.pathname !== "/proxy/macro/ws") { clientSock.destroy(); return; }
  const upstream = net.connect(MACRO_PORT, "127.0.0.1", () => {
    upstream.write(
      `GET /ws HTTP/1.1\r\nHost: 127.0.0.1:${MACRO_PORT}\r\nOrigin: http://127.0.0.1:${MACRO_PORT}\r\n` +
      `Upgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${req.headers["sec-websocket-key"] || ""}\r\nSec-WebSocket-Version: ${req.headers["sec-websocket-version"] || "13"}\r\n\r\n`
    );
    if (head && head.length) upstream.write(head);
    clientSock.pipe(upstream); upstream.pipe(clientSock);
  });
  upstream.on("error", () => { try { clientSock.destroy(); } catch {} });
  clientSock.on("error", () => { try { upstream.destroy(); } catch {} });
});

async function shutdown() {
  for (const r of sseClients) { try { r.end(); } catch {} }
  sseClients.clear();
  if (macroChild) {
    const mc = macroChild;
    macroChild = null;
    await stopChildGracefully(mc, MACRO_PORT, 3500);
  }
  const rest = children.slice();
  await Promise.allSettled(rest.map((ch) => stopChildGracefully(ch, null, 1500)));
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await ensureAllEngines();
startDnaSseWatcher();
startAsmodensiusPollers();
startCellsHeartbeatAndWaveEngine();
startOmegaPoller();

server.listen(HUB_PORT, "127.0.0.1", () => {
  console.log(`\n================================================================================`);
  console.log(`  OMEGA 4-TIER OMNISCIENT OBSERVATORY v6.3 (128B DNA->CELLS · 13-VEC · 162 PURE LEAN 4)`);
  console.log(`    #6 ZETA-OMEGA v3.2 ATLAS   : http://127.0.0.1:${HUB_PORT}/zeta-omega/`);
  console.log(`    #5 UNIFIED "SEE ALL" HUB   : http://127.0.0.1:${HUB_PORT}/`);
  console.log(`    #4 T3+T4 WILD COSMOS       : http://127.0.0.1:${MACRO_PORT}/ (${currentCosmosPreset})`);
  console.log(`    #3 OMEGA v5.0 FRONTIER VM  : http://127.0.0.1:${OMEGA_PORT}/ (TB01-TB16 · 66 Pure Lean 4)`);
  console.log(`    #2 T2 CELLS v1.3           : http://127.0.0.1:${MESO_PORT}/ (58 Pure Lean 4)`);
  console.log(`    #1 T1 DNA AUTOPHAGE v1.2   : http://127.0.0.1:${MICRO_PORT}/ (38 Pure Lean 4)`);
  console.log(`================================================================================\n`);
});
