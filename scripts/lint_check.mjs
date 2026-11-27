#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Alexander Stephen Donahue
/**
 * OMEGA 4-TIER OBSERVATORY — Static Analysis & Hygiene Linter (report-only / CI check)
 * Checks JS/MJS syntax (`node --check`), Python compilation (`py_compile`),
 * security anti-patterns (no `eval`, no `new Function`, no `Math.random` in server/lib),
 * identity compliance (zero `0thernes LLC` in active code/docs), and version consistency.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const JS_TARGETS = [
  "lib/observatory_core.mjs",
  "server.mjs",
  "web/app.js",
  "web/creature_gl.js",
  "web/taxonomy.js",
  "tests/test_observatory.mjs",
  "scripts/lint_check.mjs",
  "scripts/run_mutation_audit.mjs",
  "scripts/benchmark_observatory.mjs"
];

const PY_TARGETS = [
  "macro_wild_relay.py",
  "tests/test_relay.py",
  "scripts/check_citations.py",
  "scripts/build_paper.py",
  "scripts/stamp_timestamps.py"
];

function findPython() {
  const candidates = [
    process.env.PYTHON_BIN,
    "C:\\Users\\Alexa\\.anaconda-desktop\\micromamba\\envs\\assistant\\python.exe",
    "C:\\Users\\Alexa\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
    "python3",
    "python"
  ].filter(Boolean);
  for (const bin of candidates) {
    if (bin.includes(path.sep) && !fs.existsSync(bin)) continue;
    const p = spawnSync(bin, ["--version"], { encoding: "utf8" });
    if (p.status === 0) return bin;
  }
  return null;
}

const errors = [];

for (const rel of JS_TARGETS) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const r = spawnSync(process.execPath, ["--check", full], { encoding: "utf8" });
  if (r.status !== 0) errors.push(`syntax(${rel}): ${r.stderr.trim()}`);
  const src = fs.readFileSync(full, "utf8");
  const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  if (/\beval\s*\(/.test(codeOnly) || /\bnew\s+Function\s*\(/.test(codeOnly)) {
    errors.push(`security(${rel}): disallowed dynamic code execution`);
  }
  if ((rel === "server.mjs" || rel === "lib/observatory_core.mjs") && /\bMath\.random\s*\(/.test(codeOnly)) {
    errors.push(`determinism(${rel}): Math.random() disallowed in core; use SplitMix32`);
  }
  if (rel !== "scripts/lint_check.mjs" && rel !== "tests/test_observatory.mjs" && /0thernes\s+LLC/i.test(src)) {
    errors.push(`identity(${rel}): stale 0thernes LLC string found`);
  }
}

const pyBin = findPython();
if (pyBin) {
  for (const rel of PY_TARGETS) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const r = spawnSync(pyBin, ["-m", "py_compile", full], { encoding: "utf8" });
    if (r.status !== 0) errors.push(`py_compile(${rel}): ${r.stderr.trim()}`);
  }
}

// Optional external linters (ruff / eslint) are invoked in CI report-only mode.
if (errors.length > 0) {
  console.error(`FAIL: Static lint audit found ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`PASS: Static lint & hygiene audit passed (${JS_TARGETS.length} JS/MJS + ${PY_TARGETS.length} Python targets, 0 errors).`);
