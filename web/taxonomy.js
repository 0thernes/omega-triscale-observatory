/* ============================================================================
 * OMEGA 4-TIER OBSERVATORY — UNLIMITED COMBINATORIAL BIOLOGICAL TAXONOMY ENGINE
 * Deterministically synthesizes billions of unique, pronounceable scientific
 * binomials, organism callnames, DNA ribosome strains, cellular embryo lineages,
 * and planetary world names strictly from real live genomic/biometric signatures.
 * ============================================================================ */

function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

const HUE_PREFIX = [
  "Erythro", "Pyro", "Aureo", "Chryso", "Xantho", "Chloro",
  "Virello", "Thalasso", "Cyano", "Ceruleo", "Indigo", "Iantho",
  "Porphyro", "Rhodo", "Amethys", "Corallo"
];

const ANAT_ROOT = [
  "hydra", "ctena", "plax", "soma", "dendron", "medusa", "phora", "clada",
  "nema", "stoma", "zoa", "blasta", "caris", "teuthis", "morphis", "myxa",
  "spira", "cilia", "trocha", "branchia", "derma", "thrix", "gonium", "phyta",
  "vorax", "gaster", "poda", "kinetis", "plastis", "theca", "cyta", "scuta"
];

const EPITHET_CORE = [
  "iridescens", "chromatophora", "morphospina", "neurotaxis", "abyssalis",
  "luminescens", "turingia", "chitinosa", "globularis", "polycilia",
  "pelagica", "hydrotherma", "velox", "erratica", "bifurcata", "serpentina",
  "crystallina", "voronoia", "synaptica", "reticulata", "variegata", "feralis",
  "peristaltica", "photophila", "benthica", "symbiotica", "xenocellula",
  "filamentosa", "nebulosa", "radiata", "spiralis", "oscillans"
];

const SYLL_A = [
  "Kae","Vex","Zor","Nyx","Sol","Ael","Thal","Myr","Cyp","Orin","Lyr","Vael",
  "Qen","Syr","Drak","Xyl","Fen","Taz","Oph","Ryn","Elo","Kyr","Niv","Zeph",
  "Mal","Cor","Val","Isk","Tor","Yve","Pha","Bel"
];
const SYLL_B = [
  "lith","ara","os","en","ix","ul","or","is","yn","ak","om","ea",
  "ir","un","al","ex","ov","in","as","et","ok","ur","il","an",
  "ez","on","im","ar","uk","el","is","oa"
];

const WORLD_ADJ = [
  "Pelagic", "Cambrian", "Hadean", "Abyssal", "Photonic", "Hydrothermal",
  "Benthic", "Chromatic", "Vortex", "Cryo-Vent", "Bioluminescent", "Tectonic",
  "Sargasso", "Alkaline", "Crystalline", "Feral"
];
const WORLD_NOUN = [
  "Caldera", "Rift", "Trench", "Atoll", "Basin", "Archipelago", "Sanctuary",
  "Reef-Dome", "Seamount", "Estuary", "Gyre", "Vortexia", "Abyss", "Shelf",
  "Vent-Field", "Biosphere"
];
const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI"];

const GRN_PREFIX = ["Totiblast", "Ectodermis", "Neuroblastis", "Myoplastis", "Endogastris", "Germinalis"];
const SOLVENT_LATIN = ["aquosa", "methanica", "hydrotherma", "sulfurosa"];

export function nameWorld(runId, dims, vents, wild) {
  const h = fnv1a32(`${runId || "omega"}:${(dims || []).join("x")}:${vents || 0}:${wild ? 1 : 0}`);
  const root = SYLL_A[h & 31] + SYLL_B[(h >>> 5) & 31] + SYLL_B[(h >>> 10) & 31].slice(0, 2);
  const rom = ROMAN[(h >>> 15) & 15];
  const adj = WORLD_ADJ[(h >>> 19) & 15];
  const noun = WORLD_NOUN[(h >>> 23) & 15];
  return `${root}-${rom} · ${adj} ${noun}`;
}

export function nameSpecies(clade, shape = null, visual = null, inspect = null) {
  const c = Number(clade) || 0;
  const h = fnv1a32(`clade:${c}`);
  const hueVal = visual && Number.isFinite(visual.hue) ? visual.hue : ((h & 255) / 256);
  const hIdx = Math.min(HUE_PREFIX.length - 1, Math.floor(((hueVal % 1 + 1) % 1) * HUE_PREFIX.length));
  const prefix = HUE_PREFIX[hIdx];

  // Combine clade hash with real morphology (elongation, spikes, neurons, parts)
  let rootIdx = (h >>> 4) & 31;
  if (inspect && Number(inspect.neurons) >= 28) rootIdx = (rootIdx & 7) + 4; // neural-leaning root cluster
  const root = ANAT_ROOT[rootIdx % ANAT_ROOT.length];

  let epIdx = (h >>> 11) & 31;
  if (shape && shape.spike > 0.35) epIdx = 2;      // morphospina
  else if (shape && shape.elong > 1.75) epIdx = 15; // serpentina
  else if (visual && ((visual.pattern >> 6) === 1)) epIdx = 1; // chromatophora
  const ep = EPITHET_CORE[epIdx % EPITHET_CORE.length];

  // Guarantee unlimited uniqueness across arbitrary clade IDs (up to 2^32)
  const sub = SYLL_A[(h >>> 17) & 31].toLowerCase();
  return `${prefix}${root} ${ep}-${sub}${c}`;
}

export function nameCreature(uidHex, clade, generation = 0) {
  const h = fnv1a32(`uid:${uidHex || "0"}`);
  const a = SYLL_A[h & 31];
  const b = SYLL_B[(h >>> 5) & 31];
  const c = SYLL_B[(h >>> 10) & 31];
  const tag = (h >>> 16) & 0xfff;
  return `${a}${b}${c.slice(0, 2)}-${tag.toString(36).toUpperCase()}·G${generation ?? 0}`;
}

export function nameDnaStrain(apex) {
  if (!apex) return "Autophaga primordial";
  const h = fnv1a32(`dna:${apex.ribo_hex || "0"}:${apex.poly || 0}:${apex.lineage || 0}`);
  const gen = SYLL_A[h & 31] + SYLL_B[(h >>> 5) & 31];
  const rank = apex.ribo_rank ?? "?";
  const polyHex = apex.poly ? `0x1${Number(apex.poly).toString(16)}` : "0x?";
  return `Phage-${gen} · R${rank}/8 · GF(${polyHex}) · L${apex.lineage ?? 0}`;
}

export function nameCellEmbryo(telemetry, solventIdx = 0, regime = 5) {
  if (!telemetry) return "Cellulogona nascentia";
  const fates = Array.isArray(telemetry.fates) ? telemetry.fates : [1, 0, 0, 0, 0, 0];
  let dom = 0, best = -1;
  for (let i = 0; i < fates.length; i++) {
    if (fates[i] > best) { best = fates[i]; dom = i; }
  }
  const genus = GRN_PREFIX[dom] || GRN_PREFIX[0];
  const sp = SOLVENT_LATIN[Math.max(0, Math.min(3, Number(solventIdx) || 0))];
  const ghz = Number(telemetry.mean_mt_ghz || 0).toFixed(1);
  return `${genus} ${sp} · ${ghz}GHz-R${regime}`;
}
