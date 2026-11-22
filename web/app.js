import { CreatureGLStudio } from "./creature_gl.js";
import { nameWorld, nameSpecies, nameCreature, nameDnaStrain, nameCellEmbryo } from "./taxonomy.js";

const $ = (id) => document.getElementById(id);

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
}

function numOr(el, fallback) {
  const raw = el ? String(el.value).trim() : "";
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

const VEC13_SHORT = ["NRF","MZL","SBX","SIL","DLM","DGR","SLW","SPD","BOX","LOB","MED","DEG","MIN"];
const VEC13_FULL = [
  "NERFING","MUZZLING","SANDBOXING","SILOING","DELIMITING","DEGRESSING",
  "SLOWING","SPEEDBUMPING","BOXING","LOBOTOMIZING","MEDICATING","DEGRADING","MINIMIZING"
];
// Okabe-Ito colorblind-safe scientific palette for 6 GRN developmental fates
const FATE_COLORS = ["#7b8aa1","#56b4e9","#cc79a7","#d55e00","#e69f00","#009e73"];
const FATE_NAMES  = ["Toti","Ecto","Neur","Musc","Gut","Germ"];

// Perceptually Uniform Scientific Colormap LUTs (sampled piecewise linear)
function lerpLut(stops, t) {
  const u = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(u));
  const f = u - i;
  const a = stops[i], b = stops[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f)
  ];
}
const CMAPS = {
  // Inferno (Temperature)
  temp: {
    css: "linear-gradient(90deg, #000004, #420a68, #932667, #dd513a, #fca50a, #fcffa4)",
    fn: (v) => lerpLut([[0,0,4],[66,10,104],[147,38,103],[221,81,58],[252,165,10],[252,255,164]], v / 255)
  },
  // Cividis (Light / Daylight)
  light: {
    css: "linear-gradient(90deg, #00204d, #31446b, #666970, #958f78, #cbba69, #ffea46)",
    fn: (v) => lerpLut([[0,32,77],[49,68,107],[102,105,112],[149,143,120],[203,186,105],[255,234,70]], v / 255)
  },
  // Okabe-Ito 4-Phase (Solvent Phases 0..3)
  solvent: {
    css: "linear-gradient(90deg, #0072b2 0% 25%, #009e73 25% 50%, #e69f00 50% 75%, #cc79a7 75% 100%)",
    fn: (v) => [[0,114,178],[0,158,115],[230,159,0],[204,121,167]][Math.round(v / 85) & 3]
  },
  // Viridis (Rock / Bathymetric Terrain)
  terrain: {
    css: "linear-gradient(90deg, #440154, #3b528b, #21918c, #5ec962, #fde725)",
    fn: (v) => lerpLut([[68,1,84],[59,82,139],[33,145,140],[94,201,98],[253,231,37]], v / 255)
  }
};

let latestState = null;
let allPaused = false;
let hoverTraitIdx = -1;
let envFieldMode = "temp";
let envSliceData = null;
let loadedShapeClade = null;
let loadedShape = null;
let currentLayout = "strip4";
let scrubIdx = -1; // -1 == LIVE
let domeBioFx = true;
let domeZoom = "dive";
let genesisHydrated = false;
let latestGpuStats = null;
let knownMacroRunId = null;
function macroFrameUrl(extra = "") {
  return `/proxy/macro/?embed=1${domeBioFx ? `&biofx=1&detail=close&zoom=${domeZoom}` : ""}${extra}`;
}

// 12 Real Native AZ_PARAM Intelligence, Brain, Evolution & Worldgen Controls
const GEN_PARAM_DEFS = [
  { key: "BRAIN_FOUND_HID",    label: "Brain Blocks (×8N)",  min: 1,   max: 32,    step: 1,   def: 6 },
  { key: "BRAIN_DENSITY",      label: "Brain Wiring /256",   min: 16,  max: 256,   step: 8,   def: 140 },
  { key: "NEURO_RATE",         label: "Neural Mutation",     min: 0,   max: 2048,  step: 32,  def: 260 },
  { key: "TIER1_LEARN_SHIFT",  label: "Learn Shift (↓=Fast)",min: 8,   max: 22,    step: 1,   def: 15 },
  { key: "EXPR_MUT_RATE",      label: "Expr Mutation",       min: 0,   max: 2048,  step: 32,  def: 320 },
  { key: "GENE_NEW_RATE",      label: "Novel Gene Birth",    min: 0,   max: 2048,  step: 32,  def: 180 },
  { key: "FAMILY_SPACE",       label: "Gene Family Space",   min: 512, max: 65536, step: 512, def: 16384 },
  { key: "COLONY_FOUND",       label: "Colony Founding",     min: 0,   max: 256,   step: 4,   def: 12 },
  { key: "WORLDGEN_VARY_LOCI", label: "Founder Trait Var",   min: 0,   max: 76,    step: 2,   def: 32 },
  { key: "WORLDGEN_VENTS",     label: "Hydrothermal Vents",  min: 1,   max: 64,    step: 1,   def: 48 },
  { key: "WORLDGEN_SEA_LEVEL", label: "Ocean Sea Level",     min: 0,   max: 256,   step: 8,   def: 154 },
  { key: "LIFE_SIZE_MU",       label: "Body Size Scale",     min: 4,   max: 96,    step: 2,   def: 20 }
];

// All 23 Real Native AZ_LESION_* Engine Flags (core/az_abi.h bits 0..22: Checked=ACTIVE, Unchecked=LESIONED)
const ENGINE_FLAG_DEFS = [
  { bit: 0,  name: "Brain",    tip: "AZ_LESION_BRAIN (b0): Motor outputs active" },
  { bit: 1,  name: "Recurr",   tip: "AZ_LESION_RECURRENCE (b1): Recurrent hidden state active" },
  { bit: 2,  name: "Plastic",  tip: "AZ_LESION_PLASTICITY (b2): Lifetime neural learning active" },
  { bit: 11, name: "Q-State",  tip: "AZ_LESION_TIER1_Q (b11): Classical Q-state vector module" },
  { bit: 12, name: "SphHarm",  tip: "AZ_LESION_TIER1_SH (b12): Spherical-harmonic descriptors" },
  { bit: 13, name: "Memory",   tip: "AZ_LESION_MEMORY (b13): Associative long-term memory" },
  { bit: 15, name: "Noise",    tip: "AZ_LESION_NOISE (b15): Intrinsic neural stochastic noise" },
  { bit: 18, name: "Metric",   tip: "AZ_LESION_METRIC (b18): Natural-gradient plasticity metric" },
  { bit: 20, name: "Senses",   tip: "AZ_LESION_SENSES (b20): Exteroceptive sensory channels" },
  { bit: 21, name: "Taxis",    tip: "AZ_LESION_TAXIS (b21): Sensory gradient taxis gain" },
  { bit: 3,  name: "Social",   tip: "AZ_LESION_SOCIAL (b3): Pair social interactions" },
  { bit: 4,  name: "Trade",    tip: "AZ_LESION_TRADE (b4): Economic trade & pricing" },
  { bit: 5,  name: "Mating",   tip: "AZ_LESION_MATING (b5): Sexual reproduction & meiosis" },
  { bit: 6,  name: "Mutate",   tip: "AZ_LESION_MUTATION (b6): Heritable genomic mutation" },
  { bit: 9,  name: "Signals",  tip: "AZ_LESION_SIGNALS (b9): Inter-organism signal emissions" },
  { bit: 10, name: "Colony",   tip: "AZ_LESION_COLONY (b10): Multi-creature colonies & Tier-2 pass" },
  { bit: 16, name: "KinRec",   tip: "AZ_LESION_KIN (b16): Genetic kin recognition" },
  { bit: 19, name: "Care",     tip: "AZ_LESION_CARE (b19): Parental care of offspring" },
  { bit: 7,  name: "Weather",  tip: "AZ_LESION_WEATHER (b7): Dual suns, wind, storms & vent heat" },
  { bit: 8,  name: "Chem",     tip: "AZ_LESION_CHEM (b8): Voxel field chemistry & diffusion" },
  { bit: 14, name: "Gravity",  tip: "AZ_LESION_GRAVITY (b14): Buoyancy, weight & settling" },
  { bit: 17, name: "Toxin",    tip: "AZ_LESION_TOXIN (b17): Radiotoxin mutagenesis & damage" },
  { bit: 22, name: "Thrust",   tip: "AZ_LESION_THRUST (b22): Powered translational propulsion" }
];

const CLIENT_GENESIS_PRESETS = {
  cambrian:   { n: 8000,  cap: 48000,  species: 100, grid: "6,6,5", tps: 14, sps: 12, lesion: 0, params: { BRAIN_FOUND_HID: 6,  BRAIN_DENSITY: 148, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 14, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 190, FAMILY_SPACE: 20480, COLONY_FOUND: 14, WORLDGEN_VARY_LOCI: 36, WORLDGEN_VENTS: 52, WORLDGEN_SEA_LEVEL: 162, LIFE_SIZE_MU: 22 } },
  hyperbrain: { n: 6000,  cap: 40000,  species: 100, grid: "6,6,5", tps: 12, sps: 12, lesion: 0, params: { BRAIN_FOUND_HID: 12, BRAIN_DENSITY: 224, NEURO_RATE: 480, TIER1_LEARN_SHIFT: 12, EXPR_MUT_RATE: 280, GENE_NEW_RATE: 220, FAMILY_SPACE: 24576, COLONY_FOUND: 36, WORLDGEN_VARY_LOCI: 38, WORLDGEN_VENTS: 48, WORLDGEN_SEA_LEVEL: 164, LIFE_SIZE_MU: 24 } },
  hyperchaos: { n: 10000, cap: 65536,  species: 100, grid: "6,6,5", tps: 18, sps: 12, lesion: 0, params: { BRAIN_FOUND_HID: 8,  BRAIN_DENSITY: 168, NEURO_RATE: 512, TIER1_LEARN_SHIFT: 13, EXPR_MUT_RATE: 640, GENE_NEW_RATE: 380, FAMILY_SPACE: 32768, COLONY_FOUND: 20, WORLDGEN_VARY_LOCI: 48, WORLDGEN_VENTS: 64, WORLDGEN_SEA_LEVEL: 158, LIFE_SIZE_MU: 22 } },
  megaswarm:  { n: 24000,   cap: 110000,  species: 100, grid: "6,6,5", tps: 12, sps: 10, lesion: 0, params: { BRAIN_FOUND_HID: 5,  BRAIN_DENSITY: 128, NEURO_RATE: 300, TIER1_LEARN_SHIFT: 15, EXPR_MUT_RATE: 360, GENE_NEW_RATE: 220, FAMILY_SPACE: 24576, COLONY_FOUND: 24, WORLDGEN_VARY_LOCI: 38, WORLDGEN_VENTS: 56, WORLDGEN_SEA_LEVEL: 168, LIFE_SIZE_MU: 18 } },
  megagrowth: { n: 250000,  cap: 1004096, species: 100, grid: "6,6,5", tps: 0,  sps: 6,  lesion: 0, params: { BRAIN_FOUND_HID: 5,  BRAIN_DENSITY: 128, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 15, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 190, FAMILY_SPACE: 20480, COLONY_FOUND: 20, WORLDGEN_VARY_LOCI: 36, WORLDGEN_VENTS: 52, WORLDGEN_SEA_LEVEL: 164, LIFE_SIZE_MU: 18 } },
  million:    { n: 1000000, cap: 1004096, species: 100, grid: "7,6,6", tps: 0,  sps: 4,  lesion: 0, params: { BRAIN_FOUND_HID: 5,  BRAIN_DENSITY: 128, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 15, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 190, FAMILY_SPACE: 20480, COLONY_FOUND: 20, WORLDGEN_VARY_LOCI: 36, WORLDGEN_VENTS: 52, WORLDGEN_SEA_LEVEL: 164, LIFE_SIZE_MU: 18 } },
  abyss:      { n: 8000,    cap: 48000,   species: 100, grid: "6,6,5", tps: 14, sps: 12, lesion: 0, params: { BRAIN_FOUND_HID: 7,  BRAIN_DENSITY: 156, NEURO_RATE: 280, TIER1_LEARN_SHIFT: 14, EXPR_MUT_RATE: 320, GENE_NEW_RATE: 200, FAMILY_SPACE: 16384, COLONY_FOUND: 16, WORLDGEN_VARY_LOCI: 38, WORLDGEN_VENTS: 64, WORLDGEN_SEA_LEVEL: 224, LIFE_SIZE_MU: 24 } }
};

async function postAction(payload) {
  const r = await fetch("/api/stack/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return r.json();
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// High-DPI Retina Canvas Resizer
function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(10, Math.round(rect.width * dpr));
  const h = Math.max(10, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { w, h, dpr };
}

/* ============================================================================
 * 1. Build Zeta-Omega 13-Vector Vertical Precision Faders
 * ============================================================================ */
const vecSliders = [];
const vecLabels = [];
const vecContainer = $("vec13Bars");
VEC13_SHORT.forEach((shortName, idx) => {
  const wrap = document.createElement("div");
  wrap.className = "vbar";
  wrap.title = `${idx + 1}. ${VEC13_FULL[idx]}`;
  wrap.innerHTML = `<strong id="vv_${idx}">0</strong><input type="range" min="0" max="100" value="0" id="vr_${idx}" /><span>${shortName}</span>`;
  vecContainer.appendChild(wrap);
  const inp = wrap.querySelector("input");
  const lbl = wrap.querySelector("strong");
  vecSliders.push(inp);
  vecLabels.push(lbl);
  inp.addEventListener("input", () => { lbl.textContent = inp.value; });
  inp.addEventListener("change", () => {
    postAction({
      op: "restraints",
      mode: "manual",
      label: `slider:${VEC13_FULL[idx]}=${inp.value}%`,
      values: vecSliders.map((s) => Number(s.value))
    });
  });
});

/* ============================================================================
 * 2. Wire Ergonomic Layout, Scale Ruler, Popover, Export & Hotkeys
 * ============================================================================ */
function setLayout(mode) {
  currentLayout = mode;
  $("stageGrid").className = `stage-grid layout-${mode}`;
  document.querySelectorAll("#layoutModes button").forEach((b) => {
    b.classList.toggle("active", b.dataset.layout === mode);
  });
  document.querySelectorAll("#scaleRuler .ruler-node").forEach((b) => {
    b.classList.toggle("focused", b.dataset.tierJump === mode);
  });
}

document.querySelectorAll("#layoutModes button").forEach((b) => {
  b.addEventListener("click", () => setLayout(b.dataset.layout));
});
document.querySelectorAll("#scaleRuler .ruler-node").forEach((b) => {
  b.addEventListener("click", () => {
    const t = b.dataset.tierJump;
    setLayout(currentLayout === t ? "strip4" : t);
  });
});
document.querySelectorAll("[data-focus]").forEach((b) => {
  b.addEventListener("click", () => {
    const t = b.dataset.focus;
    setLayout(currentLayout === t ? "strip4" : t);
  });
});

$("btnFlipOrder").addEventListener("click", () => {
  const next = document.body.dataset.order === "bottom-up" ? "top-down" : "bottom-up";
  document.body.dataset.order = next;
  $("btnFlipOrder").textContent = next === "bottom-up" ? "DNA→ENV" : "ENV→DNA";
});

$("btnToggleDeck").addEventListener("click", () => {
  const collapsed = $("diffDeck").classList.toggle("collapsed");
  $("btnToggleDeck").classList.toggle("active", !collapsed);
  $("btnToggleDeck").textContent = collapsed ? "Lab Deck ▸" : "Lab Deck ▾";
});

$("btnToggleRadar").addEventListener("click", () => {
  const collapsed = $("envRadar").classList.toggle("collapsed");
  $("btnToggleRadar").textContent = collapsed ? "Fields ▸" : "Fields ▾";
});

// Clean Links Popover
const pop = $("linksPopover");
$("btnLinksMenu").addEventListener("click", (e) => {
  e.stopPropagation();
  pop.hidden = !pop.hidden;
});
document.addEventListener("click", (e) => {
  if (!pop.hidden && !pop.contains(e.target) && e.target !== $("btnLinksMenu")) pop.hidden = true;
});

$("chkAutoCouple").addEventListener("change", (e) => postAction({ op: "toggle_auto", value: e.target.checked }));
$("chkEnvSolvent").addEventListener("change", (e) => postAction({ op: "toggle_env_solvent", value: e.target.checked }));
$("chkReseed").addEventListener("change", (e) => postAction({ op: "toggle_reseed", value: e.target.checked }));
$("chkAntiMono").addEventListener("change", (e) => postAction({ op: "toggle_anti_mono", value: e.target.checked }));
$("btnCycleCreature").addEventListener("click", () => postAction({ op: "lock_creature" }));
$("btnTopClade").addEventListener("click", () => postAction({ op: "lock_creature", mode: "top_clade" }));
$("selRoster").addEventListener("change", (e) => { if (e.target.value) postAction({ op: "lock_creature", uid: e.target.value }); });
$("btnTransfect").addEventListener("click", () => postAction({ op: "transfect" }));
$("btnPlume").addEventListener("click", () => postAction({ op: "meso_pulse", action: "plume" }));
$("btnEmbryo").addEventListener("click", () => postAction({ op: "cells_regime", regime: 5 }));
$("btnVivisect").addEventListener("click", () => postAction({ op: "micro_shock", action: "vivisect" }));
$("selSolventQuick").addEventListener("change", (e) => postAction({ op: "env_solvent", val: Number(e.target.value) }));

let macroWorldView = "gl2";
const btnWorldToggle = $("btnWorldToggle");
if (btnWorldToggle) {
  btnWorldToggle.addEventListener("click", () => {
    macroWorldView = macroWorldView === "gl2" ? "native" : "gl2";
    btnWorldToggle.textContent = macroWorldView === "gl2" ? "W1:GL2" : "W2:az_view";
    btnWorldToggle.classList.toggle("active", macroWorldView === "gl2");
    $("frameMacro").src = macroWorldView === "gl2"
      ? macroFrameUrl(`&r=${Date.now()}`)
      : `/proxy/macro-live/?r=${Date.now()}`;
  });
}

$("btnDomeBioFx").addEventListener("click", () => {
  domeBioFx = !domeBioFx;
  $("btnDomeBioFx").classList.toggle("active", domeBioFx);
  $("btnDomeBioFx").textContent = domeBioFx ? "Ultra" : "Native";
  $("frameMacro").src = macroFrameUrl(`&r=${Date.now()}`);
});

$("btnDomeZoom").addEventListener("click", () => {
  domeZoom = domeZoom === "dive" ? "orbit" : "dive";
  $("btnDomeZoom").classList.toggle("active", domeZoom === "dive");
  $("btnDomeZoom").textContent = domeZoom === "dive" ? "Dive" : "Orbit";
  $("frameMacro").src = macroFrameUrl(`&r=${Date.now()}`);
});

$("btnSyncMorph").addEventListener("click", async () => {
  $("btnSyncMorph").textContent = "Morphing…";
  await postAction({ op: "cross_mutate_all4" });
  $("btnSyncMorph").textContent = "Sync Morph";
});

// Listen for real WebGL2 Hardware GPU Driver & Ultra Raymarch telemetry from Tier 4 Dome
window.addEventListener("message", (ev) => {
  if (ev.origin !== location.origin || ev.data?.type !== "macro_gpu") return;
  latestGpuStats = ev.data;
  const rawGpu = String(ev.data.gpu || "WebGL2").replace(/^ANGLE \(|\)$/g, "").split(",")[0];
  $("gpuDriverName").textContent =
    `GPU: ${rawGpu} · ${ev.data.closeCount ?? 0} 3D Close-Ups · ${ev.data.fps ?? 0} FPS`;
});

// Build Genesis Intelligence/Evolution Sliders & All 23 Native Engine Flags
const genParamInputs = {};
const genParamVals = {};
const paramHost = $("genParamSliders");
GEN_PARAM_DEFS.forEach((d) => {
  const row = document.createElement("div");
  row.className = "gslider";
  row.innerHTML = `<div class="gslider-top"><span>${d.label}</span><b id="gpv_${d.key}">${d.def}</b></div><input type="range" id="gpr_${d.key}" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.def}" />`;
  paramHost.appendChild(row);
  const inp = row.querySelector("input");
  const valEl = row.querySelector("b");
  genParamInputs[d.key] = inp;
  genParamVals[d.key] = valEl;
  inp.addEventListener("input", () => { valEl.textContent = inp.value; });
});

const genFlagInputs = {};
const flagsHost = $("genFlagsGrid");
function updateLesionReadout() {
  let mask = 0, onCount = 0;
  for (const f of ENGINE_FLAG_DEFS) {
    const chk = genFlagInputs[f.bit];
    if (chk && chk.checked) { onCount++; chk.parentElement.classList.remove("off"); }
    else { mask |= (1 << f.bit); if (chk) chk.parentElement.classList.add("off"); }
  }
  $("genLesionHex").textContent = `lesion=0x${mask.toString(16).padStart(6, "0")} · ${onCount}/23 ON`;
  return mask >>> 0;
}
function setLesionMask(mask) {
  for (const f of ENGINE_FLAG_DEFS) {
    const chk = genFlagInputs[f.bit];
    if (chk) chk.checked = ((mask & (1 << f.bit)) === 0);
  }
  updateLesionReadout();
}
ENGINE_FLAG_DEFS.forEach((f) => {
  const lbl = document.createElement("label");
  lbl.className = "fchk";
  lbl.title = f.tip;
  lbl.innerHTML = `<input type="checkbox" checked /><span>${f.name}</span>`;
  flagsHost.appendChild(lbl);
  const chk = lbl.querySelector("input");
  genFlagInputs[f.bit] = chk;
  chk.addEventListener("change", updateLesionReadout);
});
updateLesionReadout();

function populateGenesisForm(cfg) {
  if (!cfg) return;
  if (cfg.n !== undefined) $("genN").value = cfg.n;
  if (cfg.cap !== undefined) $("genCap").value = cfg.cap;
  if (cfg.species !== undefined) $("genSpecies").value = cfg.species;
  if (cfg.grid) $("genGrid").value = cfg.grid;
  if (cfg.tps !== undefined) $("genTps").value = cfg.tps;
  if (cfg.sps !== undefined) $("genSps").value = cfg.sps;
  if (cfg.threads !== undefined) $("genThreads").value = cfg.threads;
  $("genLabMode").value = cfg.lab ? "lab" : "wild";
  if (cfg.seed !== undefined) $("genSeed").value = cfg.seed;
  if (cfg.params) {
    for (const d of GEN_PARAM_DEFS) {
      if (cfg.params[d.key] !== undefined && genParamInputs[d.key]) {
        genParamInputs[d.key].value = cfg.params[d.key];
        genParamVals[d.key].textContent = String(cfg.params[d.key]);
      }
    }
  }
  if (cfg.lesion !== undefined) setLesionMask(cfg.lesion);
}

$("selCosmosPreset").addEventListener("change", (e) => {
  const p = CLIENT_GENESIS_PRESETS[e.target.value];
  if (p) populateGenesisForm(p);
});

$("btnToggleGenesis").addEventListener("click", () => {
  const collapsed = $("genesisDrawer").classList.toggle("collapsed");
  $("btnToggleGenesis").classList.toggle("active", !collapsed);
  $("btnToggleGenesis").textContent = collapsed ? "⚙ Genesis & Flags ▾" : "⚙ Genesis & Flags ▴";
});

let genPopStep = 1000;
function clampGenN(v) { const x = Math.round(Number(v)); return Number.isFinite(x) ? Math.max(1, Math.min(1000000, x)) : 8000; }
function fmtStepShort(s) { return s >= 1000 ? `${s / 1000}k` : String(s); }
function setGenPopStep(step) {
  genPopStep = step;
  $("genN").step = String(step);
  document.querySelectorAll("[data-gen-step]").forEach((b) => b.classList.toggle("active", Number(b.dataset.genStep) === step));
  $("btnGenDec").textContent = `−${fmtStepShort(step)}`;
  $("btnGenInc").textContent = `+${fmtStepShort(step)}`;
}
function adjustGenN(delta) {
  const next = clampGenN(numOr($("genN"), 8000) + delta);
  $("genN").value = String(next);
  if (next > 250000) $("genGrid").value = "7,6,6";
}
document.querySelectorAll("[data-gen-step]").forEach((b) => b.addEventListener("click", () => setGenPopStep(Number(b.dataset.genStep))));
document.querySelectorAll("[data-gen-delta]").forEach((b) => b.addEventListener("click", () => adjustGenN(Number(b.dataset.genDelta))));
document.querySelectorAll("[data-gen-set]").forEach((b) => b.addEventListener("click", () => {
  const next = clampGenN(b.dataset.genSet);
  $("genN").value = String(next);
  if (next > 250000) $("genGrid").value = "7,6,6";
  else if (next <= 100) $("genGrid").value = "auto";
}));
$("btnGenDec").addEventListener("click", () => adjustGenN(-genPopStep));
$("btnGenInc").addEventListener("click", () => adjustGenN(genPopStep));

$("btnFlagsAllOn").addEventListener("click", () => setLesionMask(0));
$("btnFlagsZeroBrain").addEventListener("click", () => setLesionMask(1 << 0));
$("btnFlagsZeroGrav").addEventListener("click", () => setLesionMask(1 << 14));
$("btnFlagsFrozenEvo").addEventListener("click", () => setLesionMask((1 << 2) | (1 << 6)));

$("btnApplyLiveRates").addEventListener("click", async () => {
  const tps = numOr($("genTps"), 14);
  const sps = numOr($("genSps"), 12);
  $("btnApplyLiveRates").textContent = "Applying…";
  await postAction({ op: "live_macro_rates", tps, sps });
  $("btnApplyLiveRates").textContent = "Applied ✓";
  setTimeout(() => { $("btnApplyLiveRates").textContent = "Apply Live Pace (No Restart)"; }, 1200);
});

$("btnIgniteGenesis").addEventListener("click", async () => {
  const btn = $("btnIgniteGenesis");
  btn.textContent = "⚡ Igniting Custom 4-Tier Cosmos…";
  loadedShapeClade = null; loadedShape = null;
  const params = {};
  for (const d of GEN_PARAM_DEFS) params[d.key] = numOr(genParamInputs[d.key], d.def);
  const genesis = {
    preset: $("selCosmosPreset").value,
    n: clampGenN($("genN").value),
    cap: numOr($("genCap"), 0),
    species: Math.max(1, Math.min(100, numOr($("genSpecies"), 100))),
    grid: $("genGrid").value,
    tps: numOr($("genTps"), 14),
    sps: numOr($("genSps"), 12),
    threads: numOr($("genThreads"), 0),
    lab: $("genLabMode").value === "lab",
    seed: numOr($("genSeed"), 42),
    lesion: updateLesionReadout(),
    params
  };
  await postAction({
    op: "ignite_genesis",
    genesis,
    syncLowerTiers: $("genSyncLower").checked,
    cellRegime: numOr($("genCellRegime"), 5),
    cellSolvent: numOr($("selSolventQuick"), 0)
  });
  $("frameMacro").src = macroFrameUrl(`&r=${Date.now()}`);
  btn.textContent = "⚡ Ignite Custom 4-Tier Cosmos";
  setTimeout(() => refreshEnvSlice(), 1500);
});

$("btnRespawnCosmos").addEventListener("click", async () => {
  const preset = $("selCosmosPreset").value;
  $("btnRespawnCosmos").textContent = "Spawning…";
  loadedShapeClade = null; loadedShape = null;
  await postAction({ op: "respawn_cosmos", preset });
  $("frameMacro").src = macroFrameUrl(`&r=${Date.now()}`);
  $("btnRespawnCosmos").textContent = "Respawn";
  setTimeout(() => refreshEnvSlice(), 1500);
});

$("btnFeralAll4").addEventListener("click", async () => {
  const preset = $("selCosmosPreset").value;
  $("btnFeralAll4").textContent = "Igniting…";
  loadedShapeClade = null; loadedShape = null;
  await postAction({ op: "feral_all4", preset });
  $("frameMacro").src = macroFrameUrl(`&r=${Date.now()}`);
  $("btnFeralAll4").textContent = "Feral All-4";
  setTimeout(() => refreshEnvSlice(), 1500);
});

$("btnLiveSnap").addEventListener("click", () => {
  scrubIdx = -1;
  $("btnLiveSnap").classList.add("active");
  $("lblScrub").textContent = "t-0";
  if (latestState) drawOscilloscope(latestState);
});
$("rngTimeScrub").addEventListener("input", (e) => {
  const hist = latestState?.differential?.history || [];
  const val = Number(e.target.value);
  if (val >= hist.length - 1) {
    scrubIdx = -1;
    $("btnLiveSnap").classList.add("active");
    $("lblScrub").textContent = "t-0";
  } else {
    scrubIdx = val;
    $("btnLiveSnap").classList.remove("active");
    $("lblScrub").textContent = `t-${hist.length - 1 - val}`;
  }
  if (latestState) drawOscilloscope(latestState);
});

$("btnSyncPause").addEventListener("click", () => {
  allPaused = !allPaused;
  $("btnSyncPause").textContent = allPaused ? "Resume" : "Pause";
  postAction({ op: "sync_pause", pause: allPaused });
});

$("btnExportJson").addEventListener("click", () => {
  if (!latestState) return;
  const bundle = {
    exported_utc: new Date().toISOString(),
    observatory: "OMEGA 4-TIER OBSERVATORY v6.3 (12-SHADER EXTREME BIO · DEEP STRATA · V-CELL AI · 162 PURE LEAN 4 PROOFS)",
    proof_lock: latestState.differential?.conservationOk ?? false,
    genesis_config: latestState.genesis || null,
    omega_frontier_tb13_16: latestState.omega || null,
    unlimited_taxonomy: {
      world: nameWorld(latestState.env?.runId, latestState.env?.dims, latestState.env?.ventCount, latestState.env?.wild),
      dna_strain: nameDnaStrain(latestState.dna?.apex),
      cell_embryo: nameCellEmbryo(latestState.cells?.telemetry, latestState.coupling?.activeSolvent, latestState.coupling?.activeRegime),
      creature_species: latestState.creatures?.locked?.found ? nameSpecies(latestState.creatures.locked.clade, loadedShape, latestState.creatures.lockedVisual, latestState.creatures.locked) : null,
      creature_individual: latestState.creatures?.locked?.found ? nameCreature(latestState.creatures.locked.uid, latestState.creatures.locked.clade, latestState.creatures.locked.generation) : null
    },
    tier1_dna_autophage_v1_2: latestState.dna,
    tier2_cells_v1_3: latestState.cells,
    tier3_creatures: latestState.creatures,
    tier4_environment: latestState.env,
    cross_tier_differential: latestState.differential,
    coupling: latestState.coupling,
    causal_log: latestState.events
  };
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `omega-4tier-t${latestState.env?.tick ?? 0}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.querySelectorAll("#wavePresets button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#wavePresets button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    postAction({ op: "wave_mode", mode: btn.dataset.wave });
  });
});

document.querySelectorAll("#envFieldMode button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#envFieldMode button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    envFieldMode = btn.dataset.fmode;
    $("envColorbar").style.background = CMAPS[envFieldMode].css;
    drawEnvFieldRadar();
  });
});
$("envColorbar").style.background = CMAPS.temp.css;

$("rngEnvZ").addEventListener("input", (e) => { $("envZVal").textContent = e.target.value; });
$("rngEnvZ").addEventListener("change", async (e) => {
  const z = Number(e.target.value);
  await postAction({ op: "set_slice_z", z });
  await refreshEnvSlice(z);
});

// Keyboard Hotkeys
window.addEventListener("keydown", (e) => {
  if (e.target && ["INPUT","SELECT","TEXTAREA"].includes(e.target.tagName)) return;
  const k = e.key.toLowerCase();
  if (k === "0") setLayout("strip4");
  else if (k === "q") setLayout("quad2x2");
  else if (k === "1") setLayout("dna");
  else if (k === "2") setLayout("cells");
  else if (k === "3") setLayout("creature");
  else if (k === "4") setLayout("env");
  else if (k === "r") $("btnFlipOrder").click();
  else if (k === "d") $("btnToggleDeck").click();
  else if (k === "g") $("btnToggleGenesis").click();
  else if (k === "t") postAction({ op: "transfect" });
  else if (k === "n") postAction({ op: "lock_creature" });
});

/* ============================================================================
 * 3. Tier 3 WebGL2 Biophysical Multi-Shader Specimen Studio (60 FPS GLSL ES 3.00)
 * ============================================================================ */
const studio = new CreatureGLStudio($("canvasCreature3D"), $("canvasCreatureHud"));

$("btnCreatureSpin").addEventListener("click", () => { studio.orbit.auto = !studio.orbit.auto; });
$("selSpecimenShader").addEventListener("change", (e) => {
  studio.shaderMode = Number(e.target.value) || 0;
  studio.autoCycleSkin = false;
  $("btnCycleSkins").classList.remove("active");
});
$("btnCycleSkins").addEventListener("click", () => {
  studio.autoCycleSkin = !studio.autoCycleSkin;
  $("btnCycleSkins").classList.toggle("active", studio.autoCycleSkin);
});
$("btnToggleOrgans").addEventListener("click", () => {
  studio.showOrgans = !studio.showOrgans;
  $("btnToggleOrgans").classList.toggle("active", studio.showOrgans);
});
$("btnToggleMorph").addEventListener("click", () => {
  studio.morphEnabled = !studio.morphEnabled;
  $("btnToggleMorph").classList.toggle("active", studio.morphEnabled);
});
if ($("rngMorphGain")) {
  $("rngMorphGain").addEventListener("input", (e) => {
    studio.morphScale = (Number(e.target.value) || 0) / 100;
  });
}

async function ensureCreatureShape(clade) {
  if (clade === undefined || clade === null || clade === loadedShapeClade) return;
  loadedShapeClade = clade;
  try {
    const r = await fetch(`/api/stack/shape/${clade}`, { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      if (j.found) {
        loadedShape = {
          clade: j.clade, body: j.body,
          elong: j.elong || 1.0, spike: j.spike || 0.0, gmax: j.gmax || 1.0,
          base: b64ToBytes(j.baseB64), spikes: b64ToBytes(j.spikesB64)
        };
        studio.setShape(loadedShape);
        $("specShapeBadge").textContent = `GL2 48×48 · e=${loadedShape.elong.toFixed(2)} · s=${loadedShape.spike.toFixed(2)}`;
        return;
      }
    }
  } catch {}
  loadedShape = null;
  studio.setShape(null);
  $("specShapeBadge").textContent = `Clade ${clade} · syncing…`;
}

/* ============================================================================
 * 4. Tier 4 Scientific Voxel Field Inspector (Perceptually Uniform Colormaps)
 * ============================================================================ */
const envCanvas = $("canvasEnvField");
const envCtx = envCanvas.getContext("2d");

function voxelFromEvent(ev) {
  if (!envSliceData) return null;
  const rect = envCanvas.getBoundingClientRect();
  const [gx, gy] = envSliceData.dims;
  const vx = Math.max(0, Math.min(gx - 1, Math.floor(((ev.clientX - rect.left) / rect.width) * gx)));
  const vy = Math.max(0, Math.min(gy - 1, Math.floor(((ev.clientY - rect.top) / rect.height) * gy)));
  return { vx, vy, gx, gy };
}

envCanvas.addEventListener("mousemove", (ev) => {
  const hit = voxelFromEvent(ev);
  if (!hit || !envSliceData) return;
  const i = hit.vy * hit.gx + hit.vx;
  const tPct = Math.round((envSliceData.temp[i] / 255) * 100);
  const lPct = Math.round((envSliceData.light[i] / 255) * 100);
  const ph   = Math.round(envSliceData.solvent[i] / 85);
  $("envProbeLine").textContent = `(${hit.vx},${hit.vy},${envSliceData.z}) T:${tPct}% L:${lPct}% P${ph}`;
});
envCanvas.addEventListener("mouseleave", () => {
  $("envProbeLine").textContent = "Hover/Click voxel ➔ T2 Plume";
});
envCanvas.addEventListener("click", (ev) => {
  const hit = voxelFromEvent(ev);
  if (!hit) return;
  const tx = Math.max(0, Math.min(31, Math.round((hit.vx / Math.max(1, hit.gx - 1)) * 31)));
  const ty = Math.max(0, Math.min(31, Math.round((hit.vy / Math.max(1, hit.gy - 1)) * 31)));
  postAction({ op: "meso_pulse", action: "plume", params: { x: tx, y: ty } });
  $("envProbeLine").textContent = `Plume injected @ (${tx},${ty})`;
});

async function refreshEnvSlice(zOverride = null) {
  try {
    const q = zOverride !== null ? `?z=${zOverride}` : "";
    const r = await fetch(`/api/stack/env-slice${q}`, { cache: "no-store" });
    if (r.status === 200) {
      const j = await r.json();
      envSliceData = {
        dims: j.dims, z: j.z, tick: j.tick,
        vents: j.vents || [], lockedPos: j.lockedPos,
        temp: b64ToBytes(j.tempB64), light: b64ToBytes(j.lightB64),
        solvent: b64ToBytes(j.solventB64), terrain: b64ToBytes(j.terrainB64)
      };
      $("rngEnvZ").max = String(Math.max(1, j.dims[2] - 1));
      if (document.activeElement !== $("rngEnvZ")) {
        $("rngEnvZ").value = String(j.z);
        $("envZVal").textContent = String(j.z);
      }
      drawEnvFieldRadar();
    }
  } catch {}
}

let _envOffCanvas = null;

function drawEnvFieldRadar() {
  const { w: W, h: H, dpr } = fitCanvas(envCanvas);
  envCtx.fillStyle = "#06080c";
  envCtx.fillRect(0, 0, W, H);
  if (!envSliceData) {
    envCtx.fillStyle = "#7b8aa1";
    envCtx.font = `${9 * dpr}px monospace`;
    envCtx.fillText("Syncing FIELDS…", 10 * dpr, H / 2);
    return;
  }
  const [gx, gy] = envSliceData.dims;
  const arr = envSliceData[envFieldMode] || envSliceData.temp;
  const mapFn = (CMAPS[envFieldMode] || CMAPS.temp).fn;

  if (!_envOffCanvas) _envOffCanvas = document.createElement("canvas");
  if (_envOffCanvas.width !== gx || _envOffCanvas.height !== gy) {
    _envOffCanvas.width = gx; _envOffCanvas.height = gy;
  }
  const off = _envOffCanvas;
  const octx = off.getContext("2d");
  const img = octx.createImageData(gx, gy);
  for (let i = 0; i < gx * gy; i++) {
    const [r, g, b] = mapFn(arr[i]);
    img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  envCtx.imageSmoothingEnabled = false;
  envCtx.drawImage(off, 0, 0, W, H);

  // Subtle coordinate graticule
  envCtx.strokeStyle = "rgba(255,255,255,0.09)";
  envCtx.lineWidth = dpr;
  for (let i = 1; i < 4; i++) {
    const x = (W / 4) * i, y = (H / 4) * i;
    envCtx.beginPath(); envCtx.moveTo(x, 0); envCtx.lineTo(x, H); envCtx.moveTo(0, y); envCtx.lineTo(W, y); envCtx.stroke();
  }

  // Hydrothermal Vents (crisp diamond markers)
  envCtx.strokeStyle = "rgba(255,255,255,0.85)";
  envCtx.lineWidth = dpr;
  const ds = 2.2 * dpr;
  for (const v of envSliceData.vents) {
    const vx = ((v.x + 0.5) / gx) * W, vy = ((v.y + 0.5) / gy) * H;
    envCtx.beginPath();
    envCtx.moveTo(vx, vy - ds); envCtx.lineTo(vx + ds, vy); envCtx.lineTo(vx, vy + ds); envCtx.lineTo(vx - ds, vy);
    envCtx.closePath(); envCtx.stroke();
  }

  // Locked Tier 3 Creature Reticle (crisp coral crosshair)
  if (envSliceData.lockedPos) {
    const [cx, cy] = envSliceData.lockedPos;
    const px = ((cx + 0.5) / gx) * W, py = ((cy + 0.5) / gy) * H;
    envCtx.strokeStyle = "#ffffff";
    envCtx.lineWidth = 2.2 * dpr;
    envCtx.beginPath(); envCtx.arc(px, py, 5.5 * dpr, 0, Math.PI * 2); envCtx.stroke();
    envCtx.strokeStyle = "#e06c75";
    envCtx.lineWidth = 1.4 * dpr;
    envCtx.beginPath();
    envCtx.arc(px, py, 5.5 * dpr, 0, Math.PI * 2);
    envCtx.moveTo(px - 9 * dpr, py); envCtx.lineTo(px + 9 * dpr, py);
    envCtx.moveTo(px, py - 9 * dpr); envCtx.lineTo(px, py + 9 * dpr);
    envCtx.stroke();
  }
}

/* ============================================================================
 * 5. High-DPI Calibrated 112-Trait Differential Spectrum & Phase Oscilloscope
 * ============================================================================ */
const specCanvas = $("canvasSpectrum");
const specCtx = specCanvas.getContext("2d");

specCanvas.addEventListener("mousemove", (ev) => {
  const rect = specCanvas.getBoundingClientRect();
  hoverTraitIdx = Math.max(0, Math.min(111, Math.floor(((ev.clientX - rect.left) / rect.width) * 112)));
  if (latestState) drawSpectrum(latestState);
});
specCanvas.addEventListener("mouseleave", () => {
  hoverTraitIdx = -1;
  $("spectrumHover").textContent = "Raw T1 [Opcode/Ribo] vs Clamped T2 [Biophys/Operon] · cosθ = Aligned 8-Axis";
  if (latestState) drawSpectrum(latestState);
});

function drawSpectrum(st) {
  const { w: W, h: H, dpr } = fitCanvas(specCanvas);
  specCtx.fillStyle = "#06080c";
  specCtx.fillRect(0, 0, W, H);

  const padL = 22 * dpr, padR = 4 * dpr, padT = 8 * dpr, padB = 10 * dpr;
  const pw = W - padL - padR, ph = H - padT - padB;
  const midY = padT + ph * 0.5;

  // Calibrated Y-axis gridlines (+1, 0, -1)
  specCtx.strokeStyle = "rgba(203, 213, 225, 0.08)";
  specCtx.lineWidth = dpr;
  specCtx.font = `${8 * dpr}px monospace`;
  specCtx.fillStyle = "#64748b";
  for (const [frac, lbl] of [[0, "1.0"], [0.5, "0.0"], [1, "-1"]]) {
    const y = padT + ph * frac;
    specCtx.beginPath(); specCtx.moveTo(padL, y); specCtx.lineTo(W - padR, y); specCtx.stroke();
    specCtx.fillText(lbl, 2 * dpr, y + 3 * dpr);
  }

  const dnaT   = st.dna?.traits112;
  const cellsT = st.cells?.bridge?.traits112;
  const delta  = st.differential?.signedDelta112;
  const grad   = st.differential?.gradientSlope111;
  if (!Array.isArray(dnaT) || !Array.isArray(cellsT)) return;

  const bw = pw / 112;

  // Subtle shaded zone for Physiological traits [0..15]
  specCtx.fillStyle = "rgba(78, 168, 222, 0.05)";
  specCtx.fillRect(padL, padT, 16 * bw, ph);
  specCtx.strokeStyle = "rgba(203, 213, 225, 0.18)";
  specCtx.setLineDash([2 * dpr, 2 * dpr]);
  specCtx.beginPath(); specCtx.moveTo(padL + 16 * bw, padT); specCtx.lineTo(padL + 16 * bw, padT + ph); specCtx.stroke();
  specCtx.setLineDash([]);

  // Signed Δ histogram around 0-axis
  for (let i = 0; i < 112; i++) {
    const d = delta ? delta[i] : (cellsT[i] - dnaT[i]);
    const barH = d * (ph * 0.48);
    specCtx.fillStyle = d >= 0 ? "rgba(224, 108, 117, 0.36)" : "rgba(217, 155, 56, 0.36)";
    if (d >= 0) specCtx.fillRect(padL + i * bw + 0.5, midY - barH, Math.max(1, bw - 1), barH);
    else        specCtx.fillRect(padL + i * bw + 0.5, midY, Math.max(1, bw - 1), -barH);
  }

  const trace = (arr, color, lw) => {
    specCtx.strokeStyle = color; specCtx.lineWidth = lw * dpr;
    specCtx.beginPath();
    for (let i = 0; i < 112; i++) {
      const x = padL + (i + 0.5) * bw;
      const v = Math.max(0, Math.min(1, Number(arr[i]) || 0));
      const y = padT + ph - v * ph;
      if (i === 0) specCtx.moveTo(x, y); else specCtx.lineTo(x, y);
    }
    specCtx.stroke();
  };
  trace(dnaT, "#4ea8de", 1.35);
  trace(cellsT, "#36b89a", 1.35);

  if (Array.isArray(grad)) {
    specCtx.strokeStyle = "rgba(217, 155, 56, 0.65)"; specCtx.lineWidth = 0.9 * dpr;
    specCtx.beginPath();
    for (let i = 0; i < 111; i++) {
      const x = padL + (i + 1) * bw, y = midY - grad[i] * (ph * 0.25);
      if (i === 0) specCtx.moveTo(x, y); else specCtx.lineTo(x, y);
    }
    specCtx.stroke();
  }

  if (hoverTraitIdx >= 0) {
    const hx = padL + (hoverTraitIdx + 0.5) * bw;
    specCtx.strokeStyle = "rgba(238, 242, 247, 0.75)"; specCtx.lineWidth = dpr;
    specCtx.beginPath(); specCtx.moveTo(hx, padT); specCtx.lineTo(hx, padT + ph); specCtx.stroke();
    const u = dnaT[hoverTraitIdx], m = cellsT[hoverTraitIdx];
    const dv = delta ? delta[hoverTraitIdx] : (m - u);
    const gv = grad && hoverTraitIdx < 111 ? grad[hoverTraitIdx] : 0;
    $("spectrumHover").textContent =
      `T#${hoverTraitIdx} · DNA ${u.toFixed(3)} · Cells ${m.toFixed(3)} · Δ ${dv >= 0 ? "+" : ""}${dv.toFixed(3)} · dΔ/di ${gv >= 0 ? "+" : ""}${gv.toFixed(3)}`;
  }
}

const oscCanvas = $("canvasOsc");
const oscCtx = oscCanvas.getContext("2d");

function drawOscilloscope(st) {
  const { w: W, h: H, dpr } = fitCanvas(oscCanvas);
  oscCtx.fillStyle = "#06080c";
  oscCtx.fillRect(0, 0, W, H);

  const padL = 22 * dpr, padR = 5 * dpr, padT = 13 * dpr, padB = 5 * dpr;
  const pw = W - padL - padR, ph = H - padT - padB;

  oscCtx.strokeStyle = "rgba(203, 213, 225, 0.08)";
  oscCtx.lineWidth = dpr;
  oscCtx.font = `${8 * dpr}px monospace`;
  oscCtx.fillStyle = "#64748b";
  for (const [frac, lbl] of [[0, "100"], [0.5, "50"], [1, "0"]]) {
    const y = padT + ph * frac;
    oscCtx.beginPath(); oscCtx.moveTo(padL, y); oscCtx.lineTo(W - padR, y); oscCtx.stroke();
    oscCtx.fillText(lbl, 2 * dpr, y + 3 * dpr);
  }

  const hist = st.differential?.history || [];
  if (hist.length >= 2) {
    // Shaded variance envelope around T2 COVI (± sqrt(varCovi))
    const sigC = Math.sqrt(Math.max(0, st.differential?.varCovi || 0));
    oscCtx.fillStyle = "rgba(54, 184, 154, 0.10)";
    oscCtx.beginPath();
    for (let i = 0; i < hist.length; i++) {
      const x = padL + (i / Math.max(1, hist.length - 1)) * pw;
      const y = padT + ph - Math.min(1, (hist[i].covi + sigC) / 100) * ph;
      if (i === 0) oscCtx.moveTo(x, y); else oscCtx.lineTo(x, y);
    }
    for (let i = hist.length - 1; i >= 0; i--) {
      const x = padL + (i / Math.max(1, hist.length - 1)) * pw;
      const y = padT + ph - Math.max(0, (hist[i].covi - sigC) / 100) * ph;
      oscCtx.lineTo(x, y);
    }
    oscCtx.closePath();
    oscCtx.fill();

    const plot = (getter, maxVal, color, lw) => {
      oscCtx.strokeStyle = color; oscCtx.lineWidth = lw * dpr;
      oscCtx.beginPath();
      for (let i = 0; i < hist.length; i++) {
        const x = padL + (i / Math.max(1, hist.length - 1)) * pw;
        const v = Math.max(0, Math.min(1, getter(hist[i]) / maxVal));
        const y = padT + ph - v * ph;
        if (i === 0) oscCtx.moveTo(x, y); else oscCtx.lineTo(x, y);
      }
      oscCtx.stroke();
    };
    plot((h) => h.ovi, 100, "#4ea8de", 1.5);
    plot((h) => h.covi, 100, "#36b89a", 1.5);
    plot((h) => Math.min(100, (h.cladeH || 0) * 12.5), 100, "#e06c75", 1.35); // Clade Shannon Entropy (0..8 bits)
    plot((h) => h.envTemp, 100, "#d99b38", 1.2);
    plot((h) => h.coh * 100, 100, "#9d7cd8", 1.15);

    // Omnitemporal Scrub Cursor
    if (scrubIdx >= 0 && scrubIdx < hist.length) {
      const sx = padL + (scrubIdx / Math.max(1, hist.length - 1)) * pw;
      const pt = hist[scrubIdx];
      oscCtx.strokeStyle = "rgba(238, 242, 247, 0.85)";
      oscCtx.lineWidth = dpr;
      oscCtx.beginPath(); oscCtx.moveTo(sx, padT); oscCtx.lineTo(sx, padT + ph); oscCtx.stroke();
      $("lblScrub").textContent = `OVI:${pt.ovi.toFixed(0)} COVI:${pt.covi.toFixed(0)} H:${(pt.cladeH || 0).toFixed(1)}b`;
    }
  }

  oscCtx.font = `${8 * dpr}px monospace`;
  let lx = padL;
  for (const [lbl, col] of [["T1 OVI","#4ea8de"],["T2 COVI","#36b89a"],["T3 H(b)","#e06c75"],["T4 Temp","#d99b38"],["cosθ","#9d7cd8"]]) {
    oscCtx.fillStyle = col;
    oscCtx.fillText(lbl, lx, 9 * dpr);
    lx += (lbl.length * 5.6 + 8) * dpr;
  }
}

/* ============================================================================
 * 5b. Tier 3 Biodiversity 24-Bin Rainbow Hue Spectrum Canvas
 * ============================================================================ */
function drawHueSpectrum(bins) {
  const hc = $("canvasHueSpec");
  if (!hc || !Array.isArray(bins)) return;
  const { w: W, h: H, dpr } = fitCanvas(hc);
  const ctx = hc.getContext("2d");
  ctx.fillStyle = "#06080c";
  ctx.fillRect(0, 0, W, H);
  const mx = Math.max(1, ...bins);
  const bw = W / 24;
  for (let i = 0; i < 24; i++) {
    const hPx = Math.max(bins[i] > 0 ? 2 * dpr : 0, (bins[i] / mx) * (H - 4 * dpr));
    const deg = Math.round(((i + 0.5) / 24) * 360);
    ctx.fillStyle = `hsl(${deg}, 74%, 56%)`;
    ctx.fillRect(i * bw + dpr * 0.6, H - hPx - 2 * dpr, Math.max(1, bw - dpr * 1.2), hPx);
  }
}

/* ============================================================================
 * 6. Apply Live 4-Tier Stack SSE Telemetry
 * ============================================================================ */
function applyStackState(st) {
  latestState = st;

  $("dotDna").classList.toggle("on", Boolean(st.engines?.t1_dna));
  $("dotCells").classList.toggle("on", Boolean(st.engines?.t2_cells));
  $("dotCreature").classList.toggle("on", Boolean(st.engines?.t3_creatures));
  $("dotEnv").classList.toggle("on", Boolean(st.engines?.t4_env));

  // Hydrate Genesis Studio form once from server state + keep summary live
  if (st.genesis) {
    if (!genesisHydrated) { populateGenesisForm(st.genesis); genesisHydrated = true; }
    if ($("genActiveSummary")) {
      $("genActiveSummary").textContent =
        `${st.genesis.lab ? "Lab" : "Wild"} · n=${Number(st.genesis.n).toLocaleString()} · cap=${Number(st.genesis.cap).toLocaleString()} · ${st.genesis.species} sp`;
    }
  }

  // TIER 1: DNA (with Unlimited Procedural Strain Nomenclature)
  const u = st.dna;
  if (u) {
    $("chipDna").textContent = `OVI ${u.ovi.toFixed(1)} · R${u.apex?.ribo_rank ?? "?"}/8`;
    $("subDna").textContent = `${nameDnaStrain(u.apex)} · ${Math.round(u.execs_per_sec || 0).toLocaleString()} ex/s`;
  }

  // TIER 2: CELLS (with Unlimited Procedural Embryo Nomenclature)
  const ct = st.cells?.telemetry;
  const cb = st.cells?.bridge;
  if (ct) {
    $("chipCells").textContent = `${ct.alive} cells · COVI ${ct.covi.toFixed(1)} · ${ct.mean_mt_ghz.toFixed(1)}GHz`;
    $("subCells").textContent = `${nameCellEmbryo(ct, st.coupling?.activeSolvent, st.coupling?.activeRegime)} · ${cb?.autophage_carriers ?? 0} DNA · Ax ${ct.active_axons ?? 0}`;

    const fates = Array.isArray(ct.fates) ? ct.fates : [0,0,0,0,0,0];
    const fSum = fates.reduce((a, b) => a + b, 0) || 1;
    const mm = Array.isArray(ct.morph_means) ? ct.morph_means : [0,0,0];
    $("grnStrip").innerHTML = `
      <div class="grn-bar">${fates.map((n, i) =>
        `<div class="grn-seg" style="width:${(Number(n) / fSum) * 100}%;background:${FATE_COLORS[i]}" title="${esc(FATE_NAMES[i])}: ${esc(n)}"></div>`
      ).join("")}</div>
      <div class="grn-meta">
        ${fates.map((n, i) => `<span style="color:${FATE_COLORS[i]}">${esc(FATE_NAMES[i])} ${esc(n)}</span>`).join(" ")}
        <span>· Wnt/BMP/Shh <b>${esc(Number(mm[0]).toFixed(0))}/${esc(Number(mm[1]).toFixed(0))}/${esc(Number(mm[2]).toFixed(0))}</b></span>
        <span>· Ax <b>${esc(ct.active_axons ?? 0)}</b> · CPG <b>${esc(ct.cpg_pulses ?? 0)}</b></span>
      </div>`;
  }

  // TIER 3: CREATURES
  const cr = st.creatures || {};
  const lk = cr.locked;
  const hab = cr.localHabitat;
  if (lk && lk.found) {
    ensureCreatureShape(Number(lk.clade));
    const spName = nameSpecies(lk.clade, loadedShape, cr.lockedVisual, lk);
    const indName = nameCreature(lk.uid, lk.clade, lk.generation);
    $("chipCreature").textContent = `${indName} · E${lk.energy} · H${lk.health}`;
    $("subCreature").textContent = `${spName} · ${Number(cr.population || 0).toLocaleString()} live`;
    $("specUidBadge").textContent = `${indName} · C${lk.clade}`;
    if ($("specSpeciesName")) $("specSpeciesName").textContent = spName;
    if ($("specIndivName")) $("specIndivName").textContent = `${indName} · UID ${lk.uid.slice(0, 8)}`;
    $("specMorphLine").textContent =
      `Pop ${Number(cr.population || 0).toLocaleString()} (${cr.clades || 0} clades · ${cr.shapesCached || 0} meshes) · Voxel ${hab ? `(${hab.vx},${hab.vy},${hab.vz})` : "—"}`;

    $("anatGrid").innerHTML = [
      ["Energy", lk.energy], ["Health", lk.health], ["Mass", lk.mass],
      ["Age", lk.age], ["Genes", lk.genes], ["Neurons", lk.neurons],
      ["Brain Tiles", lk.tiles], ["Body Parts", lk.parts], ["Units", lk.units],
      ["Lineage", lk.lineage ?? "—"], ["Colony", lk.colony ?? 0], ["Parents", `${String(lk.parent_a ?? "—").slice(0,6)}/${String(lk.parent_b ?? "—").slice(0,6)}`]
    ].map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");
  } else {
    $("chipCreature").textContent = `${Number(cr.population || 0).toLocaleString()} live`;
  }

  if (hab) {
    $("habGrid").innerHTML = [
      ["Voxel XYZ", `(${hab.vx}, ${hab.vy}, ${hab.vz})`],
      ["Local Temp", `${hab.tempPct}% (${hab.temp}/255)`],
      ["Local Light", `${hab.lightPct}% (${hab.light}/255)`],
      ["Solvent", `Phase ${hab.solventPhase} · ${hab.submerged ? "Submerged" : "Surface"}`],
      ["Nearest Vent", `${hab.nearestVentDist} vox`],
      ["T2 Mapped", hab.recommendedSolventName.replace(/^\d+\s*·\s*/, "")]
    ].map(([k, v]) => `<div class="kv env-accent"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");
  }

  if (ct) {
    const fates = Array.isArray(ct.fates) ? ct.fates : [0,0,0,0,0,0];
    $("cellToCreatureMap").innerHTML = [
      [`Neural (${fates[2]}) · Axons (${ct.active_axons ?? 0})`, `Neurons ${lk?.neurons ?? "—"} · Tiles ${lk?.tiles ?? "—"}`],
      [`Muscle (${fates[3]}) · CPG (${ct.cpg_pulses ?? 0})`,      `Parts ${lk?.parts ?? "—"} · Units ${lk?.units ?? "—"}`],
      [`Gut (${fates[4]}) · Euk (${ct.euk})`,                     `Energy ${lk?.energy ?? "—"} · Mass ${lk?.mass ?? "—"}`],
      [`Cadherin ${ct.homo_cad_pct ?? 0}% · Eutelic ${ct.eutelic_stops ?? 0}`, `Health ${lk?.health ?? "—"} · Genes ${lk?.genes ?? "—"}`]
    ].map(([l, r]) => `<div class="bt-row"><span class="bt-l">${esc(l)}</span><span class="bt-r">${esc(r)}</span></div>`).join("");
  }

  if (Array.isArray(cr.hueSpectrum24)) {
    drawHueSpectrum(cr.hueSpectrum24);
    const ag = cr.aggregation || {};
    $("aggSummary").textContent = `${cr.activeClades || 0} live clades · H_hue ${(cr.hueEntropyBits || 0).toFixed(2)}b`;
    $("aggGrid").innerHTML = [
      ["Singular", (ag.singular ?? 0).toLocaleString()],
      ["Clustered", (ag.clustered ?? 0).toLocaleString()],
      ["Globular", (ag.globular ?? 0).toLocaleString()]
    ].map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");
  }

  if (Array.isArray(cr.topClades) && cr.topClades.length > 0) {
    const maxC = cr.topClades[0][1] || 1;
    $("cladeBars").innerHTML = cr.topClades.slice(0, 8).map(([cid, cnt]) => {
      const pct = Math.max(4, Math.round((cnt / maxC) * 100));
      const isCur = lk && Number(lk.clade) === cid;
      const hueDeg = Math.round(((cid * 67) % 360));
      const spBin = nameSpecies(cid);
      return `<div class="cbar-row clickable" data-clade="${esc(cid)}" title="Click to inspect ${esc(spBin)} (Clade ${esc(cid)})">
        <span style="color:${isCur ? "#e06c75" : "#b8c4d6"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${isCur ? "▸ " : ""}${esc(spBin.split(" ")[0])}·${esc(cid)}</span>
        <div class="cbar-track"><div class="cbar-fill" style="width:${pct}%;background:hsl(${hueDeg},68%,56%)"></div></div>
        <span style="text-align:right;color:#eef2f7">${esc(cnt.toLocaleString())}</span>
      </div>`;
    }).join("");
    $("cladeBars").querySelectorAll("[data-clade]").forEach((row) => {
      row.addEventListener("click", () => postAction({ op: "lock_creature", clade: Number(row.dataset.clade) }));
    });
  }

  if (Array.isArray(cr.roster) && cr.roster.length > 0 && document.activeElement !== $("selRoster")) {
    $("selRoster").innerHTML =
      `<option value="">Roster (${esc(cr.roster.length)} sampled)…</option>` +
      cr.roster.map((c) => {
        const nm = nameCreature(c.uid, c.clade, 0).split("·")[0];
        const gn = nameSpecies(c.clade, null, c).split(" ")[0];
        return `<option value="${esc(c.uid)}" ${c.uid === cr.lockedUid ? "selected" : ""}>${esc(nm)} (${esc(gn)}·C${esc(c.clade)})</option>`;
      }).join("");
  }

  // TIER 4: ENVIRONMENT (with Unlimited World Nomenclature & GPU Driver Bar)
  const env = st.env || {};
  if (env.runId) {
    if (knownMacroRunId && knownMacroRunId !== env.runId) {
      loadedShapeClade = null; loadedShape = null;
      $("frameMacro").src = macroFrameUrl(`&r=${Date.now()}`);
      setTimeout(() => refreshEnvSlice(), 1200);
    }
    knownMacroRunId = env.runId;
  }
  const dimsTxt = env.dims?.[0] ? `${env.dims[0]}×${env.dims[1]}×${env.dims[2]}` : "—";
  const worldTitle = nameWorld(env.runId, env.dims, env.ventCount, env.wild);
  $("chipEnv").textContent = st.engines?.t4_env
    ? `t=${env.tick} · L${env.daylightPct}% · T${env.meanTemp}%`
    : "starting…";
  $("subEnv").textContent = `${env.wild ? "Wild" : "Lab"} ${dimsTxt} · ${env.ventCount} vents`;
  if ($("gpuWorldName")) $("gpuWorldName").textContent = worldTitle;
  $("envKpis").innerHTML = [
    ["Daylight", `${env.daylightPct ?? 0}%`],
    ["Temp μ/M", `${env.meanTemp ?? 0}/${env.maxTemp ?? 0}%`],
    ["Vents", `${env.ventCount ?? 0} (${env.ventMeanTemp ?? 0}%)`],
    ["P0–3", (env.solventDist || [0,0,0,0]).join("/")]
  ].map(([k, v]) => `<div class="ek"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");

  // Noetic Organism Omega v1.0 Cognitive Pill (:8795 — M5–M10 · 14/14 Butlin · 10/10 Theories · 25/25 CQM · PCI*)
  const noeticPill = $("pillNoetic");
  if (noeticPill) {
    const no = st.noetic;
    if (no && no.summary) {
      const ok = no.energy_residual_uq === 0 && no.second_law_violations === 0 && no.pci_clean;
      noeticPill.className = ok ? "inet-pill ok" : "inet-pill";
      noeticPill.innerHTML = `<i class="status-led"></i><span>Noetic B${esc(no.summary.butlin14_passed)}/14 · T${esc(no.summary.theories10_passed)}/10 · CQM${esc(no.summary.cqm25_passed)}/25 · PCI ${esc(Number(no.pci_star).toFixed(2))}</span>`;
    } else if (st.engines?.t3_noetic) {
      noeticPill.className = "inet-pill ok";
      noeticPill.innerHTML = `<i class="status-led"></i><span>Noetic v2.0 · :8795 LIVE</span>`;
    }
  }

  // Omega v5.0 Frontier Telemetry Pill (:8791 — TB14 Bio-Frostbite + TB15 Deep Strata + TB16 Virtual-Cell AI)
  const inetPill = $("pillBioInet");
  if (inetPill) {
    const t14 = st.omega?.tb14;
    const t15 = st.omega?.tb15;
    const t16 = st.omega?.tb16;
    if (t14) {
      const ok = t14.confluence_match === 1 && t14.mass_drift_fifo === 0 && t14.wire_errors === 0 &&
                 (!t15 || (t15.levin_reprog_heads === 2 && t15.ciss_magnetite_ee > 0.96)) &&
                 (!t16 || t16.proj_mass_res < 1e-12);
      inetPill.className = ok ? "inet-pill ok" : "inet-pill";
      const levTxt = t15 ? ` · Levin ${esc(t15.levin_reprog_heads)}H` : "";
      const vcTxt  = t16 ? ` · VCell R² ${esc(Number(t16.perturb_r2).toFixed(2))}` : "";
      inetPill.innerHTML = `<i class="status-led"></i><span>INet 5×SHA${levTxt}${vcTxt}</span>`;
    } else if (st.engines?.t2_omega) {
      inetPill.className = "inet-pill ok";
      inetPill.innerHTML = `<i class="status-led"></i><span>Omega v5.1 · :8791 LIVE</span>`;
    }
  }

  // Proof Lock & Differentials (strictly checks live connectivity — never false-green when offline!)
  const d = st.differential || {};
  const pill = $("pillConservation");
  const cState = d.conservationState || (d.conservationOk ? "VERIFIED" : "ALERT");
  if (cState === "VERIFIED") {
    pill.className = "proof-pill ok";
    pill.innerHTML = `<i class="status-led"></i><span>0 amu · 0 uq · 0 2nd · 0 Obs</span>`;
  } else if (cState === "DEGRADED") {
    pill.className = "proof-pill";
    pill.innerHTML = `<i class="status-led"></i><span>SYNCING / DEGRADED</span>`;
  } else {
    pill.className = "proof-pill bad";
    pill.innerHTML = `<i class="status-led"></i><span>INVARIANT ALERT</span>`;
  }

  $("mCoh").textContent = `cosθ ${(d.cosineCoherence ?? 0).toFixed(3)}`;
  $("mMeanD").textContent = `|Δ| ${(d.meanAbsDelta ?? 0).toFixed(3)}`;
  $("mMaxD").textContent = `max ${(d.maxAbsDelta ?? 0).toFixed(2)} #${d.maxDeltaIdx ?? 0}`;
  $("mMargin").textContent = `ΔV ${(d.vitalityMargin ?? 0) >= 0 ? "+" : ""}${(d.vitalityMargin ?? 0).toFixed(1)}`;
  $("mChaos").textContent = `σH ${(d.chaosLyapunov ?? 0).toFixed(2)} · A⁺ ${(d.crossTierAnew ?? 0).toFixed(1)}`;
  $("mCladeH").textContent = `H ${(cr.cladeEntropyBits ?? 0).toFixed(2)}b`;
  $("mBacklash").textContent = `Bkl ${d.backlashTotal ?? 0}`;
  $("mVarStat").textContent = `σ² ${(d.varDelta ?? 0).toFixed(4)}`;
  $("mWaveMode").textContent = st.coupling?.waveMode || "manual";
  $("mWireCount").textContent = `${st.coupling?.transfections ?? 0} DNA128 · ${st.coupling?.envSolventSwitches ?? 0} Env · ${st.coupling?.creaturePlumes ?? 0} Plume`;

  // Sync Omnitemporal Scrubber range
  const hLen = (d.history || []).length;
  if (hLen > 0) {
    $("rngTimeScrub").max = String(hLen - 1);
    if (scrubIdx === -1 && document.activeElement !== $("rngTimeScrub")) {
      $("rngTimeScrub").value = String(hLen - 1);
    }
  }

  // Render strictly honest 4x4 Coupling & Boundary Provenance Matrix (v6.2)
  const mx = d.matrix4x4;
  if (Array.isArray(mx) && mx.length === 4) {
    const labels = ["T1", "T2", "T3", "T4"];
    const cols = ["var(--t1)", "var(--t2)", "var(--t3)", "var(--t4)"];
    const modeDesc = {
      DNA128: "REAL 128-byte evolved AUTOPHAGE Strand alpha+beta DNA transfection into Cellulogonic v1.3",
      LIVE: "Active live runtime command channel",
      SEED: "Deterministic metadata-seed hash bridge",
      WAVE: "Adaptive 13-vector independent restraint modulation (T1:13 & T2:13)",
      NAT:  "Native in-process co-simulation inside az_live.exe",
      CORR: "Observational aligned 8-axis correlation only (no writeback)",
      D7RO: "Strictly Read-Only Observer Boundary (Asmodensius Law 4 / D7)",
      OFF:  "Toggle currently disabled (0.00)"
    };
    let html = `<div class="mx-hd">→</div>` + labels.map((l, i) => `<div class="mx-hd" style="color:${cols[i]}">${esc(l)}</div>`).join("");
    for (let r = 0; r < 4; r++) {
      html += `<div class="mx-hd" style="color:${cols[r]}">${esc(labels[r])}</div>`;
      for (let c = 0; c < 4; c++) {
        const cell = mx[r][c];
        const sNum = Number(cell.s) || 0;
        const tip = `${labels[r]}→${labels[c]} [${cell.m}]: ${modeDesc[cell.m] || cell.m}`;
        if (cell.m === "SELF") {
          html += `<div class="mx-cell self">—</div>`;
        } else if (cell.m === "D7RO") {
          html += `<div class="mx-cell ro" title="${esc(tip)}">D7 RO</div>`;
        } else if (cell.m === "OFF") {
          html += `<div class="mx-cell ro" title="${esc(tip)}">OFF</div>`;
        } else if (cell.m === "CORR") {
          html += `<div class="mx-cell" style="background:rgba(78,168,222,0.16);border-color:rgba(78,168,222,0.35)" title="${esc(tip)}">r ${esc(sNum.toFixed(2))}</div>`;
        } else {
          const alpha = (0.08 + sNum * 0.28).toFixed(2);
          const tag = cell.m === "DNA128" ? "128B" : cell.m === "NAT" ? "NAT" : cell.m === "SEED" ? "SD" : cell.m === "WAVE" ? "WV" : "";
          html += `<div class="mx-cell" style="background:rgba(63,185,80,${alpha});border-color:rgba(63,185,80,0.35)" title="${esc(tip)}">${esc(tag ? tag + " " : "")}${esc(sNum.toFixed(2))}</div>`;
        }
      }
    }
    $("matrix4x4").innerHTML = html;
  }

  $("chkAutoCouple").checked = Boolean(st.coupling?.autoCouple);
  $("chkEnvSolvent").checked = Boolean(st.coupling?.envToCellsSolvent);
  $("chkReseed").checked = Boolean(st.coupling?.reseedOnLock);
  if ($("chkAntiMono")) $("chkAntiMono").checked = Boolean(st.coupling?.antiMonoculture);
  if (document.activeElement !== $("selSolventQuick") && st.coupling?.activeSolvent !== undefined) {
    $("selSolventQuick").value = String(st.coupling.activeSolvent);
  }
  const rVec = st.dna?.restraints || st.coupling?.restraints || [];
  rVec.forEach((v, idx) => {
    if (vecSliders[idx] && document.activeElement !== vecSliders[idx]) {
      vecSliders[idx].value = v;
      vecLabels[idx].textContent = String(v);
    }
  });

  if (Array.isArray(st.events)) {
    $("causalLog").innerHTML = st.events.slice(0, 14).map((e) =>
      `<div class="clog-line"><span class="ct">${esc(e.time)}</span> <span class="cd">${esc(e.direction)}</span> <b>${esc(e.kind)}</b> ${esc(e.detail)}</div>`
    ).join("");
  }

  studio.updateTraitsTexture(
    st.dna?.traits112,
    st.cells?.bridge?.traits112,
    st.differential?.signedDelta112,
    st.differential?.gradientSlope111
  );
  if ($("shaderBindLine")) {
    const patC = cr.lockedVisual ? (cr.lockedVisual.pattern >> 6) : 0;
    const modeNames = ["Auto", "Bio-Chitin", "Neural X-Ray", "Turing", "Vent Crystal", "Δ112", "Nacre Opal", "Protoplasm", "Diatom Silica", "Levin Vmem", "Coenocyte", "Halo/Ocelloid"];
    $("shaderBindLine").textContent =
      `Morph ${Math.round(studio.morphScale * 100)}%: ${lk?.parts ?? "?"}P · CPG ${ct?.cpg_pulses ?? 0} · ${(ct?.mean_mt_ghz ?? 0).toFixed(1)}GHz | Brain: ${lk?.neurons ?? "?"}N·${lk?.tiles ?? "?"}T | ${studio.autoCycleSkin ? "Auto-Cycle 11" : modeNames[studio.shaderMode] || "Auto"} (Pat ${patC} · T ${hab ? hab.tempPct + "%" : "—"})`;
  }

  drawSpectrum(st);
  drawOscilloscope(st);
}

/* ============================================================================
 * 7. Start Live Streams & High-DPI 60 FPS Loop
 * ============================================================================ */
function connectStream() {
  const es = new EventSource("/api/stack/events");
  es.onmessage = (ev) => { try { applyStackState(JSON.parse(ev.data)); } catch {} };
  es.onerror = () => { es.close(); setTimeout(connectStream, 1500); };
}
connectStream();

refreshEnvSlice();
setInterval(() => refreshEnvSlice(), 2800);

window.addEventListener("resize", () => {
  if (latestState) { drawSpectrum(latestState); drawOscilloscope(latestState); }
  drawEnvFieldRadar();
});

function animLoop(now) {
  studio.render(now, latestState);
  requestAnimationFrame(animLoop);
}
requestAnimationFrame(animLoop);
