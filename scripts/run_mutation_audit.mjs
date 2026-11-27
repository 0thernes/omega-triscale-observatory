#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Alexander Stephen Donahue
/**
 * OMEGA 4-TIER OBSERVATORY — Surgical Mutation Audit Harness (B13)
 *
 * Plants 9 targeted logic regressions (7 in `lib/observatory_core.mjs`, 2 in `server.mjs`)
 * into an isolated temporary workspace copy (never leaving the repository working tree dirty),
 * runs the full `node --test tests/test_observatory.mjs` suite against each mutant,
 * and asserts 9/9 (100.0%) planted-mutant kill coverage.
 *
 * Usage:
 *   node scripts/run_mutation_audit.mjs           # Read-only verification (never dirties working tree)
 *   node scripts/run_mutation_audit.mjs --write   # Write deterministic results/mutation_audit.json (no volatile elapsed_ms)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { OBSERVATORY_VERSION } from "../lib/observatory_core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WRITE_REPORT = process.argv.includes("--write");

const MUTANTS = [
  {
    id: "M1_PATH_TRAVERSAL_BYPASS",
    file: "lib/observatory_core.mjs",
    target: '  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;',
    replacement: "  if (false && (rel.startsWith('..') || path.isAbsolute(rel))) return null;",
    description: "Disable directory-escape check in resolveSafePath"
  },
  {
    id: "M2_POPULATION_CLAMP_UNBOUNDED",
    file: "lib/observatory_core.mjs",
    target: "  const nVal = clampInt(src.n, 1, MAX_GENESIS_POPULATION, base.n);",
    replacement: "  const nVal = Number(src.n ?? base.n);",
    description: "Remove 1..1,000,000 Genesis founder population clamping"
  },
  {
    id: "M3_D7RO_OBSERVER_VIOLATION",
    file: "lib/observatory_core.mjs",
    target: '    [{ m: "SELF", s: 1 }, { m: c12 > 0 ? (hasReal128 ? "DNA128" : "SEED") : "OFF", s: Number(c12.toFixed(2)) }, { m: "D7RO", s: 0 }, { m: "D7RO", s: 0 }],',
    replacement: '    [{ m: "SELF", s: 1 }, { m: c12 > 0 ? (hasReal128 ? "DNA128" : "SEED") : "OFF", s: Number(c12.toFixed(2)) }, { m: "LIVE", s: 0.9 }, { m: "D7RO", s: 0 }],',
    description: "Violate Asmodensius D7RO read-only observer boundary on T1->T3 display matrix"
  },
  {
    id: "M4_OMNITEMPORAL_CAP_LEAK",
    file: "lib/observatory_core.mjs",
    target: "  while (d.history.length > MAX_OMNITEMPORAL_HISTORY) d.history.shift();",
    replacement: "  while (d.history.length > MAX_OMNITEMPORAL_HISTORY + 500) d.history.shift();",
    description: "Break <= 240 omnitemporal rolling history memory cap"
  },
  {
    id: "M5_CSRF_ORIGIN_BYPASS",
    file: "lib/observatory_core.mjs",
    target: "  if (headers.origin && !isLoopbackOrigin(headers.origin)) return false;",
    replacement: "  if (false && headers.origin && !isLoopbackOrigin(headers.origin)) return false;",
    description: "Disable loopback Origin check in isSafeLoopbackRequest"
  },
  {
    id: "M6_ECORES_FLAG_DROPPED",
    file: "lib/observatory_core.mjs",
    target: '  if (cfg.ecores) args.push("--ecores");',
    replacement: '  if (false && cfg.ecores) args.push("--ecores");',
    description: "Drop --ecores bare-metal 24C P+E scheduling flag in buildRelayArgs"
  },
  {
    id: "M7_WS_UPGRADE_CSWSH_BYPASS",
    file: "server.mjs",
    target: "  if (!isLoopbackHost(req.headers.host) || !isLoopbackOrigin(req.headers.origin)) {",
    replacement: "  if (false && (!isLoopbackHost(req.headers.host) || !isLoopbackOrigin(req.headers.origin))) {",
    description: "Disable Host/Origin CSWSH rejection in server.mjs WebSocket upgrade handler"
  },
  {
    id: "M8_OFFLINE_CONSERVATION_FALSE_GREEN",
    file: "lib/observatory_core.mjs",
    target: "  const hasDna   = Boolean(state.engines.t1_dna && state.dna.frame?.ledger && (now - state.dna.updatedAt < 15000));",
    replacement: "  const hasDna   = Boolean(state.dna.frame?.ledger && (now - state.dna.updatedAt < 15000));",
    description: "Allow offline T1 DNA engine to render false-green VERIFIED conservation status"
  },
  {
    id: "M9_D7RO_WIRE_LEAK_SERVER",
    file: "server.mjs",
    target: '        httpRequest(PORTS.noetic, "POST", "/api/cmd", { op: "dna", hex: hex128 }).catch(() => {});',
    replacement: '        httpRequest(PORTS.noetic, "POST", "/api/cmd", { op: "dna", hex: hex128 }).catch(() => {});\n        await httpRequest(PORTS.macro, "POST", "/api/cmd", { op: "autophage_dna", hex: hex128 }).catch(() => {});',
    description: "Leak T1 128B DNA write to Asmodensius port inside server.mjs transfectDnaToCells"
  }
];

function copyTree(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyTree(s, d);
    else fs.copyFileSync(s, d);
  }
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "omega_obs_mut_"));
const report = {
  version: OBSERVATORY_VERSION,
  scope: "9 hand-planted regression mutants (7 in lib/observatory_core.mjs, 2 in server.mjs); deterministic schema without volatile timing fields",
  total: MUTANTS.length,
  killed: 0,
  survived: 0,
  results: []
};

try {
  for (const item of ["VERSION", "package.json", "server.mjs", "macro_wild_relay.py"]) {
    fs.copyFileSync(path.join(ROOT, item), path.join(tmpRoot, item));
  }
  for (const dir of ["lib", "web", "tests"]) {
    copyTree(path.join(ROOT, dir), path.join(tmpRoot, dir));
  }

  // Baseline sanity run inside isolated copy
  const baseRun = spawnSync(process.execPath, ["--test", path.join(tmpRoot, "tests/test_observatory.mjs")], {
    cwd: tmpRoot,
    encoding: "utf8"
  });
  if (baseRun.status !== 0) {
    console.error("FAIL: Baseline test suite failed in isolated workspace before mutation!");
    console.error(baseRun.stdout, baseRun.stderr);
    process.exit(1);
  }

  for (const m of MUTANTS) {
    const filePath = path.join(tmpRoot, m.file);
    const original = fs.readFileSync(filePath, "utf8");
    if (!original.includes(m.target)) {
      console.error(`FAIL: Mutant ${m.id} target not found in ${m.file}`);
      process.exit(1);
    }
    const mutated = original.replace(m.target, m.replacement);
    fs.writeFileSync(filePath, mutated, "utf8");

    const t0 = Date.now();
    const res = spawnSync(process.execPath, ["--test", path.join(tmpRoot, "tests/test_observatory.mjs")], {
      cwd: tmpRoot,
      encoding: "utf8"
    });
    const elapsedMs = Date.now() - t0;
    fs.writeFileSync(filePath, original, "utf8");

    const killed = res.status !== 0;
    if (killed) report.killed++;
    else report.survived++;
    report.results.push({ id: m.id, file: m.file, description: m.description, killed });
    console.log(`  [${killed ? "KILLED  " : "SURVIVED"}] ${m.id} (${m.file}, ${elapsedMs} ms) — ${m.description}`);
  }
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

if (WRITE_REPORT) {
  const outDir = path.join(ROOT, "results");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "mutation_audit.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(`Wrote deterministic results/mutation_audit.json (${report.killed}/${report.total} killed).`);
}

if (report.survived > 0) {
  console.error(`\nFAIL: ${report.killed}/${report.total} mutants killed (${report.survived} survived).`);
  process.exit(1);
}
console.log(`\nPASS: ${report.killed}/${report.total} (100.0%) planted mutants killed (working tree untouched)!`);
