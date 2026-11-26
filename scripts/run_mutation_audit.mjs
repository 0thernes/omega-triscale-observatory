#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Alexander Stephen Donahue
/**
 * OMEGA 4-TIER OBSERVATORY — Surgical Mutation Audit Harness (B13)
 *
 * Plants 6 targeted logic regressions (mutants) into an isolated temporary
 * workspace copy (never leaving the repository working tree dirty), runs the
 * full `node --test tests/test_observatory.mjs` suite against each mutant,
 * and asserts 100% mutant kill coverage (6/6).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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
    description: "Violate Asmodensius D7RO read-only observer boundary on T1->T3"
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
const report = { version: "6.7.0", total: MUTANTS.length, killed: 0, survived: 0, results: [] };

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
    report.results.push({ id: m.id, description: m.description, killed, elapsed_ms: elapsedMs });
    console.log(`  [${killed ? "KILLED  " : "SURVIVED"}] ${m.id} (${elapsedMs} ms) — ${m.description}`);
  }
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

const outDir = path.join(ROOT, "results");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "mutation_audit.json"), JSON.stringify(report, null, 2) + "\n", "utf8");

if (report.survived > 0) {
  console.error(`\nFAIL: ${report.killed}/${report.total} mutants killed (${report.survived} survived).`);
  process.exit(1);
}
console.log(`\nPASS: ${report.killed}/${report.total} (100.0%) planted mutants killed!`);
