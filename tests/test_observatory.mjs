// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Alexander Stephen Donahue
/**
 * OMEGA 4-TIER OBSERVATORY v6.7.0 — Automated Verification Suite
 *
 * Covers:
 *  1. Syntax & static integrity audit (`server.mjs`, `lib/observatory_core.mjs`, `web/*.js`, `macro_wild_relay.py`)
 *  2. Contract, API & negative boundary tests (live ephemeral HTTP server, path traversal defense,
 *     CSRF/CSWSH loopback guards, invalid query params, preset validation, hardware flags, population 1..1M)
 *  3. Property-based tests (`prop_check` loop over 250 deterministic seeded randomized trials)
 *  4. Metamorphic, golden & zero-observer-interference tests (112-trait spectral delta, omnitemporal
 *     history cap <= 240, D7RO invariant, `#ifdef PICK` shader preservation, AZST binary decoder)
 *  5. Cross-language differential oracle test (Node `normalizeGenesisConfig` vs Python `macro_wild_relay.py --dry-run`)
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  OBSERVATORY_VERSION,
  MAX_OMNITEMPORAL_HISTORY,
  MAX_GENESIS_POPULATION,
  MAX_FOUNDER_SPECIES,
  LESION_MASK_23,
  GENESIS_PRESETS,
  SOLVENT_NAMES,
  createSplitMix32,
  clampInt,
  isLoopbackHost,
  isLoopbackOrigin,
  isSafeLoopbackRequest,
  resolveSafePath,
  validateCladeParam,
  validateSliceZParam,
  autoCap,
  sanitizeGridSpec,
  normalizeGenesisConfig,
  buildRelayArgs,
  shannonBits,
  rollingVariance,
  deriveDnaSeed32,
  uidToSeed32,
  sanitizeProxyHeaders,
  createInitialState,
  computeDifferentialsCore,
  decodeAzstCreaturesCore,
  sampleLocalHabitatCore
} from "../lib/observatory_core.mjs";

import {
  server,
  state as hubState,
  rawCache,
  injectMacroBioFx,
  injectMacroDecodeBioFx,
  rewriteProxyContent
} from "../server.mjs";

import {
  nameWorld,
  nameSpecies,
  nameCreature,
  nameDnaStrain,
  nameCellEmbryo
} from "../web/taxonomy.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function findPython() {
  const candidates = [
    process.env.PYTHON_BIN,
    "C:\\Users\\Alexa\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
    "C:\\Users\\Alexa\\AppData\\Local\\Programs\\Python\\Python311\\python.exe",
    "python3",
    "python"
  ].filter(Boolean);
  for (const bin of candidates) {
    if (bin.includes(path.sep) && !fs.existsSync(bin)) continue;
    const probe = spawnSync(bin, ["--version"], { encoding: "utf8" });
    if (probe.status === 0) return bin;
  }
  return null;
}

const PYTHON_BIN = findPython();

/** Deterministic seeded property-based test driver (B10 `prop_check`). */
function prop_check(name, trials, seed, generator, propertyFn) {
  const rng = createSplitMix32(seed);
  for (let i = 0; i < trials; i++) {
    const sample = generator(rng, i);
    try {
      propertyFn(sample, i);
    } catch (err) {
      err.message = `[prop_check:${name} trial=${i} seed=0x${seed.toString(16)}] ${err.message}`;
      throw err;
    }
  }
}

function rawHttpRequest(port, method, reqPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, method, path: reqPath, headers }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString("utf8")
      }));
    });
    req.on("error", reject);
    if (body !== null) req.write(body);
    req.end();
  });
}

function buildSyntheticAzstCreatures(creatures, opts = {}) {
  const count = creatures.length;
  const buf = Buffer.alloc(80 + count * 24);
  buf.writeUInt32LE(0x54535a41, 0); // "AZST"
  buf.writeUInt16LE(2, 4);          // type 2 = creatures
  buf.writeUInt32LE(opts.seq ?? 7, 12);
  buf.writeBigUInt64LE(BigInt(opts.tick ?? 1234), 16);
  buf.writeUInt32LE(count, 16 + 24);
  buf.writeUInt32LE(24, 16 + 28);
  buf.writeUInt8(opts.gxLog ?? 6, 16 + 32); // 64
  buf.writeUInt8(opts.gyLog ?? 6, 16 + 33); // 64
  buf.writeUInt8(opts.gzLog ?? 5, 16 + 34); // 32
  buf.writeUInt8(opts.wild === false ? 0 : 1, 16 + 35);
  buf.writeInt8(0, 16 + 44);
  buf.writeInt8(64, 16 + 45);
  buf.writeInt8(127, 16 + 46);
  buf.writeUInt32LE(opts.clades ?? 100, 16 + 48);
  buf.writeUInt32LE(opts.failures ?? 0, 16 + 52);

  for (let i = 0; i < count; i++) {
    const c = creatures[i];
    const off = 80 + i * 24;
    buf.writeUInt32LE(c.lo >>> 0, off);
    buf.writeUInt32LE(c.hi >>> 0, off + 4);
    buf.writeUInt16LE(c.x16 & 0xffff, off + 8);
    buf.writeUInt16LE(c.y16 & 0xffff, off + 10);
    buf.writeUInt16LE(c.z16 & 0xffff, off + 12);
    buf.writeUInt8(c.yaw ?? 64, off + 14);
    buf.writeUInt8(c.pitch ?? 0, off + 15);
    buf.writeUInt8(c.rByte ?? 31, off + 16);
    buf.writeUInt8(c.hueByte ?? (i * 11) % 256, off + 17);
    buf.writeUInt8(c.pattern ?? 0x45, off + 18);
    buf.writeUInt8(c.flags ?? 0, off + 19);
    buf.writeUInt32LE(c.clade >>> 0, off + 20);
  }
  return buf;
}

/* ============================================================================
 * 1. Syntax & Static Audit
 * ============================================================================ */
test("1. Syntax audit: all JS/MJS modules pass node --check and macro_wild_relay.py passes py_compile", () => {
  const jsFiles = [
    "lib/observatory_core.mjs",
    "server.mjs",
    "web/app.js",
    "web/creature_gl.js",
    "web/taxonomy.js"
  ];
  for (const rel of jsFiles) {
    const res = spawnSync(process.execPath, ["--check", path.join(ROOT, rel)], { encoding: "utf8" });
    assert.equal(res.status, 0, `node --check failed for ${rel}: ${res.stderr}`);
  }
  assert.ok(PYTHON_BIN, "Python 3 interpreter must be available for relay verification");
  const pyRes = spawnSync(PYTHON_BIN, ["-m", "py_compile", path.join(ROOT, "macro_wild_relay.py")], { encoding: "utf8" });
  assert.equal(pyRes.status, 0, `py_compile failed: ${pyRes.stderr}`);
});

test("1b. Static audit: VERSION matches OBSERVATORY_VERSION and zero banned LLC strings in active code", () => {
  const verFile = fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();
  assert.equal(verFile, OBSERVATORY_VERSION);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.version, OBSERVATORY_VERSION);

  for (const rel of ["server.mjs", "lib/observatory_core.mjs", "macro_wild_relay.py", "web/index.html", "web/app.js"]) {
    const txt = fs.readFileSync(path.join(ROOT, rel), "utf8");
    assert.equal(/0thernes\s+LLC/i.test(txt), false, `Disallowed 0thernes LLC found in ${rel}`);
  }
});

/* ============================================================================
 * 2. Genesis Population Clamping, Hardware Flags & Negative Boundary Tests
 * ============================================================================ */
test("2a. Genesis population clamping strictly bounds 1..1,000,000, species <= min(100, n), and cap >= n", () => {
  assert.equal(normalizeGenesisConfig({ n: -500 }).n, 1);
  assert.equal(normalizeGenesisConfig({ n: 0 }).n, 1);
  assert.equal(normalizeGenesisConfig({ n: 1 }).species, 1);
  assert.equal(normalizeGenesisConfig({ n: 1, species: 100 }).species, 1);
  assert.equal(normalizeGenesisConfig({ n: 50, species: 100 }).species, 50);
  assert.equal(normalizeGenesisConfig({ n: 5_000_000 }).n, MAX_GENESIS_POPULATION);
  assert.equal(normalizeGenesisConfig({ n: 5_000_000, cap: 50 }).cap, MAX_GENESIS_POPULATION);
  assert.equal(normalizeGenesisConfig({ n: 1_000_000, cap: 0 }).cap, 1_004_096);
  assert.equal(normalizeGenesisConfig({ n: "NaN", preset: "nonexistent" }).preset, "cambrian");
  assert.equal(normalizeGenesisConfig({ n: "NaN", preset: "nonexistent" }).n, 8000);
  assert.equal(normalizeGenesisConfig({ lesion: 0xffffffff }).lesion, LESION_MASK_23);
  assert.equal(normalizeGenesisConfig({ grid: "99,0,1" }).grid, "8,2,2");
  assert.equal(normalizeGenesisConfig({ grid: "AUTO" }).grid, "auto");
  assert.equal(normalizeGenesisConfig({ grid: "bad;rm -rf /" }).grid, "6,6,5");
});

test("2b. Bare-metal hardware flag assembly (--ecores, --gpu, --prefetch, --kernels, --large-pages)", () => {
  const fullOn = buildRelayArgs({
    preset: "million",
    n: 1_000_000,
    kernels: true,
    ecores: true,
    prefetch: true,
    gpu: true,
    largePages: true,
    lab: true,
    seed: 1337,
    lesion: 0x15,
    params: { BRAIN_FOUND_HID: 10, "bad-key": 99, INJECT: "1;echo" }
  });
  assert.ok(fullOn.includes("--ecores"));
  assert.ok(fullOn.includes("--large-pages"));
  assert.equal(fullOn[fullOn.indexOf("--kernels") + 1], "1");
  assert.equal(fullOn[fullOn.indexOf("--gpu") + 1], "1");
  assert.equal(fullOn[fullOn.indexOf("--prefetch") + 1], "1");
  assert.ok(fullOn.includes("--lab"));
  assert.equal(fullOn[fullOn.indexOf("--seed") + 1], "1337");
  assert.equal(fullOn[fullOn.indexOf("--lesion") + 1], "0x15");
  const paramArg = fullOn[fullOn.indexOf("--param") + 1];
  assert.ok(paramArg.includes("BRAIN_FOUND_HID=10"));
  assert.equal(paramArg.includes("bad-key"), false);
  assert.equal(paramArg.includes("INJECT"), false);

  const allOff = buildRelayArgs({
    preset: "cambrian",
    kernels: false,
    ecores: false,
    prefetch: false,
    gpu: false,
    largePages: false,
    lab: false
  });
  assert.equal(allOff.includes("--ecores"), false);
  assert.equal(allOff.includes("--large-pages"), false);
  assert.equal(allOff.includes("--lab"), false);
  assert.equal(allOff[allOff.indexOf("--kernels") + 1], "0");
  assert.equal(allOff[allOff.indexOf("--gpu") + 1], "0");
  assert.equal(allOff[allOff.indexOf("--prefetch") + 1], "0");
});

test("2c. Path traversal & loopback CSRF/CSWSH negative security tests", () => {
  const webRoot = path.join(ROOT, "web");
  assert.ok(resolveSafePath(webRoot, "index.html"));
  assert.ok(resolveSafePath(webRoot, "/app.js"));
  assert.equal(resolveSafePath(webRoot, "../server.mjs"), null);
  assert.equal(resolveSafePath(webRoot, "..\\server.mjs"), null);
  assert.equal(resolveSafePath(webRoot, "sub/../../server.mjs"), null);
  assert.equal(resolveSafePath(webRoot, "index.html\0.png"), null);
  assert.equal(resolveSafePath(webRoot, "C:/Windows/win.ini"), null);
  assert.equal(resolveSafePath(webRoot, "//evil-host/share/file"), null);

  assert.equal(isLoopbackHost("127.0.0.1:8790"), true);
  assert.equal(isLoopbackHost("localhost:8790"), true);
  assert.equal(isLoopbackHost("[::1]:8790"), true);
  assert.equal(isLoopbackHost("evil.example:8790"), false);
  assert.equal(isLoopbackHost("127.0.0.1.evil.com"), false);
  assert.equal(isLoopbackOrigin("http://127.0.0.1:8790"), true);
  assert.equal(isLoopbackOrigin("https://evil.example"), false);

  assert.equal(isSafeLoopbackRequest({ headers: { host: "127.0.0.1:8790", origin: "http://127.0.0.1:8790", "content-type": "application/json", "sec-fetch-site": "same-origin" } }, true), true);
  assert.equal(isSafeLoopbackRequest({ headers: { host: "127.0.0.1:8790", origin: "https://attacker.tld", "content-type": "application/json" } }, true), false);
  assert.equal(isSafeLoopbackRequest({ headers: { host: "127.0.0.1:8790", "sec-fetch-site": "cross-site", "content-type": "application/json" } }, true), false);
  assert.equal(isSafeLoopbackRequest({ headers: { host: "127.0.0.1:8790", "content-type": "text/plain" } }, true), false);

  assert.equal(validateCladeParam("42"), 42);
  assert.equal(validateCladeParam("-1"), null);
  assert.equal(validateCladeParam("abc"), null);
  assert.equal(validateCladeParam("12.5"), null);
  assert.equal(validateSliceZParam("12").ok, true);
  assert.equal(validateSliceZParam("12").value, 12);
  assert.equal(validateSliceZParam("-1").ok, false);
  assert.equal(validateSliceZParam("999").ok, false);
  assert.equal(validateSliceZParam("NaN").ok, false);
});

/* ============================================================================
 * 3. Live Ephemeral HTTP Server Contract & Negative Tests (Zero Daemons Left!)
 * ============================================================================ */
test("3. Live HTTP contract tests on ephemeral loopback port (healthz, static, traversal, CSRF, query params)", async (t) => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  // 3.1 /healthz returns 200 with exact v6.7.0 contract
  const hRes = await rawHttpRequest(port, "GET", "/healthz", { Host: `127.0.0.1:${port}` });
  assert.equal(hRes.status, 200);
  const hJson = JSON.parse(hRes.body);
  assert.equal(hJson.ok, true);
  assert.equal(hJson.version, OBSERVATORY_VERSION);
  assert.equal(hJson.service, "omega-triscale-observatory");

  // 3.2 Static root & nosniff header
  const idxRes = await rawHttpRequest(port, "GET", "/", { Host: `127.0.0.1:${port}` });
  assert.equal(idxRes.status, 200);
  assert.equal(idxRes.headers["x-content-type-options"], "nosniff");
  assert.ok(idxRes.body.includes(`v${OBSERVATORY_VERSION}`));

  // 3.3 Path traversal attempts must be blocked with 403 or 400 (never leak server.mjs!)
  for (const badPath of ["/%2e%2e/server.mjs", "/..%5cserver.mjs", "/%2e%2e%2fpackage.json", "/index.html%00.js", "/zeta-omega/%2e%2e/server.mjs"]) {
    const tRes = await rawHttpRequest(port, "GET", badPath, { Host: `127.0.0.1:${port}` });
    assert.ok(tRes.status === 403 || tRes.status === 400 || tRes.status === 404, `Expected rejection for ${badPath}, got ${tRes.status}`);
    assert.equal(tRes.body.includes("OBSERVATORY_VERSION"), false, `Leaked source on ${badPath}`);
  }

  // 3.4 Invalid API query / path params -> 400
  const badClade = await rawHttpRequest(port, "GET", "/api/stack/shape/not-a-number", { Host: `127.0.0.1:${port}` });
  assert.equal(badClade.status, 400);

  const missingClade = await rawHttpRequest(port, "GET", "/api/stack/shape/999999", { Host: `127.0.0.1:${port}` });
  assert.equal(missingClade.status, 404);

  const badZ = await rawHttpRequest(port, "GET", "/api/stack/env-slice?z=invalid", { Host: `127.0.0.1:${port}` });
  assert.equal(badZ.status, 400);

  const emptySlice = await rawHttpRequest(port, "GET", "/api/stack/env-slice?z=4", { Host: `127.0.0.1:${port}` });
  assert.equal(emptySlice.status, 204);

  // 3.5 Cross-origin POST CSRF rejection -> 403
  const csrfRes = await rawHttpRequest(
    port, "POST", "/api/stack/action",
    { Host: `127.0.0.1:${port}`, Origin: "https://evil.example", "Content-Type": "application/json" },
    JSON.stringify({ op: "toggle_auto", value: false })
  );
  assert.equal(csrfRes.status, 403);

  // 3.6 Missing JSON Content-Type -> 403
  const plainRes = await rawHttpRequest(
    port, "POST", "/api/stack/action",
    { Host: `127.0.0.1:${port}`, Origin: `http://127.0.0.1:${port}`, "Content-Type": "text/plain" },
    JSON.stringify({ op: "toggle_auto", value: false })
  );
  assert.equal(plainRes.status, 403);

  // 3.7 Valid loopback JSON POST action succeeds, unknown op -> 400
  const okPost = await rawHttpRequest(
    port, "POST", "/api/stack/action",
    { Host: `127.0.0.1:${port}`, Origin: `http://127.0.0.1:${port}`, "Content-Type": "application/json" },
    JSON.stringify({ op: "toggle_anti_mono", value: true })
  );
  assert.equal(okPost.status, 200);
  assert.equal(JSON.parse(okPost.body).ok, true);

  const unkPost = await rawHttpRequest(
    port, "POST", "/api/stack/action",
    { Host: `127.0.0.1:${port}`, Origin: `http://127.0.0.1:${port}`, "Content-Type": "application/json" },
    JSON.stringify({ op: "no_such_op" })
  );
  assert.equal(unkPost.status, 400);

  // 3.8 Non-loopback Host on SSE stream rejected -> 403
  const sseBad = await rawHttpRequest(port, "GET", "/api/stack/events", { Host: "evil.example:8790" });
  assert.equal(sseBad.status, 403);

  // 3.9 Proxy redirect contract
  const redir = await rawHttpRequest(port, "GET", "/proxy/macro", { Host: `127.0.0.1:${port}` });
  assert.equal(redir.status, 302);
  assert.equal(redir.headers.location, "/proxy/macro/");
});

/* ============================================================================
 * 4. Property-Based Tests (250+ Deterministic Seeded Randomized Trials)
 * ============================================================================ */
test("4. Property-based tests (prop_check): 250 randomized Genesis configs, grids & hardware flags", () => {
  const presetKeys = [...Object.keys(GENESIS_PRESETS), "unknown_preset", ""];
  prop_check(
    "genesis_invariants",
    250,
    0x20260670,
    (rng) => ({
      preset: presetKeys[Math.floor(rng() * presetKeys.length)],
      n: Math.floor((rng() - 0.15) * 1_600_000),
      cap: rng() < 0.35 ? 0 : Math.floor((rng() - 0.1) * 2_500_000),
      species: Math.floor((rng() - 0.1) * 250),
      grid: rng() < 0.2 ? "auto" : (rng() < 0.85 ? `${Math.floor(rng() * 14)},${Math.floor(rng() * 14)},${Math.floor(rng() * 14)}` : "malformed"),
      tps: Math.floor((rng() - 0.1) * 1500),
      sps: Math.floor((rng() - 0.1) * 90),
      threads: Math.floor((rng() - 0.1) * 96),
      kernels: rng() > 0.3,
      ecores: rng() > 0.3,
      prefetch: rng() > 0.3,
      gpu: rng() > 0.5,
      largePages: rng() > 0.6,
      lesion: Math.floor(rng() * 0x4000000),
      lab: rng() > 0.5,
      seed: Math.floor((rng() - 0.1) * 3_000_000_000),
      params: { BRAIN_FOUND_HID: Math.floor(rng() * 64), "bad key": 123 }
    }),
    (rawCfg) => {
      const cfg = normalizeGenesisConfig(rawCfg);
      assert.ok(Object.prototype.hasOwnProperty.call(GENESIS_PRESETS, cfg.preset));
      assert.ok(cfg.n >= 1 && cfg.n <= MAX_GENESIS_POPULATION, `n out of bounds: ${cfg.n}`);
      assert.ok(cfg.cap >= cfg.n && cfg.cap <= 2_000_000, `cap invariant failed: cap=${cfg.cap}, n=${cfg.n}`);
      assert.ok(cfg.species >= 1 && cfg.species <= Math.min(MAX_FOUNDER_SPECIES, cfg.n), `species invariant failed: ${cfg.species} vs n=${cfg.n}`);
      assert.ok(cfg.tps >= 0 && cfg.tps <= 1000);
      assert.ok(cfg.sps >= 1 && cfg.sps <= 60);
      assert.ok(cfg.threads >= 0 && cfg.threads <= 64);
      assert.equal(cfg.lesion & ~LESION_MASK_23, 0);
      if (cfg.grid !== "auto") {
        const parts = cfg.grid.split(",").map(Number);
        assert.equal(parts.length, 3);
        for (const p of parts) assert.ok(p >= 2 && p <= 8);
      }
      const args = buildRelayArgs(cfg);
      assert.equal(args.includes("--ecores"), cfg.ecores);
      assert.equal(args.includes("--large-pages"), cfg.largePages);
      assert.equal(args.includes("--lab"), cfg.lab);
      assert.equal(args[args.indexOf("--kernels") + 1], cfg.kernels ? "1" : "0");
      assert.equal(args[args.indexOf("--gpu") + 1], cfg.gpu ? "1" : "0");
      assert.equal(args[args.indexOf("--prefetch") + 1], cfg.prefetch ? "1" : "0");
    }
  );
});

/* ============================================================================
 * 5. Metamorphic, Golden & Zero-Observer-Interference Contract Tests
 * ============================================================================ */
test("5a. Metamorphic & golden tests: 112-trait spectral delta antisymmetry, clamping, and shift invariance", () => {
  const rng = createSplitMix32(0xCAFEBABE);
  const dnaT = Array.from({ length: 112 }, () => Number((rng() * 0.6).toFixed(4)));
  const cellsT = Array.from({ length: 112 }, () => Number((rng() * 0.6).toFixed(4)));

  const s1 = createInitialState();
  s1.dna.frame = { traits112: dnaT, ovi: 64, alive: 500, lineages: 32, entropy: 5.2, backlash: [1, 2], apex: { assembly: 20, holobiont: 80, causal_len: 30 } };
  s1.cells.bridge = { traits112: cellsT };
  s1.cells.telemetry = { covi: 78, alive: 400, assembly_index: 22, distinct_lineages: 28, max_tissue: 24, active_loci: 8, mean_mt_ghz: 6.5, backlash: [0, 1], mass_res: 0, energy_res: 0, second_law: 0 };
  computeDifferentialsCore(s1, 1_000_000);

  // Swap DNA <-> Cells => signedDelta112 negates, magnitudes remain identical
  const sSwap = createInitialState();
  sSwap.dna.frame = { ...s1.dna.frame, traits112: cellsT };
  sSwap.cells.bridge = { traits112: dnaT };
  sSwap.cells.telemetry = { ...s1.cells.telemetry };
  computeDifferentialsCore(sSwap, 1_000_000);

  assert.equal(sSwap.differential.meanAbsDelta, s1.differential.meanAbsDelta);
  assert.equal(sSwap.differential.rmsDelta, s1.differential.rmsDelta);
  assert.equal(sSwap.differential.maxAbsDelta, s1.differential.maxAbsDelta);
  assert.equal(sSwap.differential.maxDeltaIdx, s1.differential.maxDeltaIdx);
  for (let i = 0; i < 112; i++) {
    assert.ok(Math.abs(sSwap.differential.signedDelta112[i] + s1.differential.signedDelta112[i]) <= 1e-4);
  }

  // Constant shift +0.35 within [0, 1] preserves signedDelta112 & gradientSlope111
  const sShift = createInitialState();
  sShift.dna.frame = { ...s1.dna.frame, traits112: dnaT.map((x) => x + 0.35) };
  sShift.cells.bridge = { traits112: cellsT.map((x) => x + 0.35) };
  sShift.cells.telemetry = { ...s1.cells.telemetry };
  computeDifferentialsCore(sShift, 1_000_000);
  for (let i = 0; i < 112; i++) {
    assert.ok(Math.abs(sShift.differential.signedDelta112[i] - s1.differential.signedDelta112[i]) <= 2e-4);
  }

  // Clamping guard against unclamped upstream [0..7] values
  const sWild = createInitialState();
  sWild.dna.frame = { traits112: new Array(112).fill(-5) };
  sWild.cells.bridge = { traits112: new Array(112).fill(7.5) };
  computeDifferentialsCore(sWild, 1_000_000);
  assert.equal(sWild.differential.meanAbsDelta, 1);
  assert.equal(sWild.differential.maxAbsDelta, 1);
  assert.equal(sWild.differential.gradientSlope111.length, 111);
  assert.ok(sWild.differential.gradientSlope111.every((g) => g === 0));
});

test("5b. Omnitemporal history cap <= 240, conservation fail-closed gate, and D7RO zero-observer-interference contract", () => {
  const st = createInitialState();
  const t0 = 1_700_000_000_000;
  st.engines.t1_dna = true;
  st.engines.t2_cells = true;
  st.engines.t4_env = true;
  st.dna.updatedAt = t0;
  st.cells.updatedAt = t0;
  st.creatures.updatedAt = t0;
  st.dna.frame = { ovi: 50, ledger: { int_res: 0, second_law_v: 0 }, traits112: new Array(112).fill(0.5), apex: { genome_hex: "a".repeat(256) } };
  st.cells.telemetry = { covi: 60, mass_res: 0, energy_res: 0, second_law: 0 };
  st.cells.bridge = { traits112: new Array(112).fill(0.6) };

  // Run 320 updates and verify strict <= 240 cap and D7RO cells across all modes
  for (let step = 0; step < 320; step++) {
    const now = t0 + step * 10;
    st.dna.updatedAt = now;
    st.cells.updatedAt = now;
    st.creatures.updatedAt = now;
    st.coupling.waveMode = step % 2 === 0 ? "adaptive" : "manual";
    st.coupling.reseedOnLock = step % 3 === 0;
    computeDifferentialsCore(st, now);

    assert.ok(st.differential.history.length <= MAX_OMNITEMPORAL_HISTORY);
    assert.equal(st.differential.conservationState, "VERIFIED");
    assert.equal(st.differential.conservationOk, true);

    // D7 Read-Only Observer Boundary invariant: T1/T2 NEVER write into T3/T4 (always D7RO, strength 0)
    const mx = st.differential.matrix4x4;
    for (const [r, c] of [[0, 2], [0, 3], [1, 2], [1, 3]]) {
      assert.deepEqual(mx[r][c], { m: "D7RO", s: 0 }, `D7RO violation at matrix[${r}][${c}]`);
    }
  }
  assert.equal(st.differential.history.length, MAX_OMNITEMPORAL_HISTORY);
  assert.equal(st.differential.history[0].t, t0 + (320 - 240) * 10);

  // Conservation fail-closed: observerFail > 0 immediately forces ALERT
  st.env.observerFail = 1;
  computeDifferentialsCore(st, t0 + 3210);
  assert.equal(st.differential.conservationState, "ALERT");
  assert.equal(st.differential.conservationOk, false);

  // Stale telemetry (>15s) forces DEGRADED (never false-green!)
  st.env.observerFail = 0;
  computeDifferentialsCore(st, t0 + 60_000);
  assert.equal(st.differential.conservationState, "DEGRADED");
  assert.equal(st.differential.conservationOk, false);
});

test("5c. Proxy Bio-FX injector preserves #ifdef PICK observer-only picking and rewrites API prefixes", () => {
  const sampleGl = [
    "const gl = c.getContext('webgl2',{antialias:false});",
    "const u = '/api/state'; const w = \"/viewer_decode.js\";",
    "#ifdef PICK\ncolor=vec4(pickId,1.);\n#else\nfloat light=.45+.55*max(0.,dot(sun,n));\n float stripe=.96+.04*cos(float(pattern%11u+1u)*n.z*4.);\n color=vec4(mix(baseColor*light*stripe,vec3(.10,.28,.29),fog),1);\n#endif"
  ].join("\n");
  const out = rewriteProxyContent("macro", "/viewer_gl.js?biofx=1&zoom=dive", sampleGl);
  assert.ok(out.includes("antialias:true"));
  assert.ok(out.includes('"/proxy/macro/viewer_decode.js'));
  assert.ok(out.includes("#ifdef PICK\ncolor=vec4(pickId,1.);"));
  assert.equal(out.includes("float stripe=.96+.04"), false);

  const sanitized = sanitizeProxyHeaders({
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'"
  });
  assert.equal(sanitized["X-Frame-Options"], "SAMEORIGIN");
  assert.ok(sanitized["Content-Security-Policy"].includes("frame-ancestors 'self'"));
});

test("5d. AZST binary creature decoder, local habitat sampler & deterministic taxonomy", () => {
  const buf = buildSyntheticAzstCreatures([
    { lo: 1, hi: 0, x16: 1000, y16: 1000, z16: 1000, clade: 10, hueByte: 10, rByte: 31 },
    { lo: 2, hi: 0, x16: 1020, y16: 1020, z16: 1000, clade: 10, hueByte: 90, rByte: 63 },
    { lo: 3, hi: 0, x16: 50000, y16: 50000, z16: 40000, clade: 20, hueByte: 200, rByte: 15 }
  ], { seq: 11, tick: 420, failures: 0 });
  const dec = decodeAzstCreaturesCore(buf, "0000000000000002");
  assert.ok(dec);
  assert.equal(dec.count, 3);
  assert.equal(dec.activeClades, 2);
  assert.equal(dec.aggregation.singular, 1);
  assert.equal(dec.aggregation.clustered, 2);
  assert.equal(dec.aggregation.globular, 0);
  assert.equal(dec.lockedVis?.uid, "0000000000000002");
  assert.ok(dec.cladeEntropyBits > 0.9 && dec.cladeEntropyBits < 1.0);

  // Truncated / bad magic returns null cleanly
  assert.equal(decodeAzstCreaturesCore(Buffer.alloc(20)), null);
  assert.equal(decodeAzstCreaturesCore(Buffer.alloc(100)), null);

  // Local habitat near hydrothermal vent recommends Solvent 2 (Hydrothermal GDGT)
  const dims = [8, 8, 4];
  const fields = new Uint8Array(8 * 8 * 4 * 4);
  const idx = ((1 * 64) + (2 * 8 + 2)) * 4;
  fields[idx] = 0; fields[idx + 1] = 128; fields[idx + 2] = 220; fields[idx + 3] = 50;
  const hab = sampleLocalHabitatCore({ dims, fields, vents: [{ x: 2, y: 2, z: 1 }] }, [2, 2, 1]);
  assert.equal(hab.recommendedSolvent, 2);
  assert.equal(hab.recommendedSolventName, SOLVENT_NAMES[2]);

  // Deterministic taxonomy naming
  assert.equal(nameWorld("run-42", [64, 64, 32], 52, true), nameWorld("run-42", [64, 64, 32], 52, true));
  assert.equal(nameSpecies(42), nameSpecies(42));
  assert.equal(nameCreature("0000000000000002", 42, 3), nameCreature("0000000000000002", 42, 3));
  assert.ok(nameDnaStrain({ ribo_hex: "deadbeef", poly: 0x1d, lineage: 7, ribo_rank: 8 }).includes("R8/8"));
  assert.ok(nameCellEmbryo({ fates: [1, 2, 9, 1, 1, 0], mean_mt_ghz: 5.4 }, 2, 5).includes("Neuroblastis hydrotherma"));
});

/* ============================================================================
 * 6. Cross-Language Differential Oracle: Node vs Python macro_wild_relay.py --dry-run
 * ============================================================================ */
test("6. Differential parity: Node buildRelayArgs matches Python macro_wild_relay.py --dry-run", () => {
  assert.ok(PYTHON_BIN, "Python interpreter required for differential test");
  const cases = [
    { preset: "cambrian", n: 8000, cap: 48000, species: 100, grid: "6,6,5", tps: 14, sps: 12, threads: 0, kernels: true, ecores: true, prefetch: true, gpu: false, largePages: false, lesion: 0, lab: false, seed: 42 },
    { preset: "million", n: 1_000_000, cap: 0, species: 100, grid: "7,6,6", tps: 0, sps: 4, threads: 24, kernels: true, ecores: true, prefetch: true, gpu: true, largePages: true, lesion: 0x25, lab: true, seed: 9999 },
    { preset: "hyperbrain", n: 5, cap: 2, species: 99, grid: "auto", tps: 2000, sps: 0, threads: 128, kernels: false, ecores: false, prefetch: false, gpu: false, largePages: false, lesion: 0xffffff, lab: true, seed: -7 }
  ];

  for (const input of cases) {
    const norm = normalizeGenesisConfig(input);
    const pyArgs = buildRelayArgs(norm, {
      macroRelay: path.join(ROOT, "macro_wild_relay.py"),
      macroPort: 8794,
      macroDataDir: path.join(ROOT, "runtime", "dry-run-tmp"),
      macroEngine: "az_live.exe"
    }).concat(["--dry-run"]);

    const res = spawnSync(PYTHON_BIN, pyArgs, { encoding: "utf8" });
    assert.equal(res.status, 0, `macro_wild_relay.py --dry-run failed: ${res.stderr}`);
    const pyOut = JSON.parse(res.stdout);
    const c = pyOut.config;
    assert.equal(c.n, norm.n);
    assert.equal(c.cap, norm.cap);
    assert.equal(c.species, norm.species);
    assert.equal(c.tps, norm.tps);
    assert.equal(c.sps, norm.sps);
    assert.equal(c.threads, norm.threads);
    assert.equal(c.kernels, norm.kernels ? 1 : 0);
    assert.equal(c.ecores, norm.ecores);
    assert.equal(c.gpu, norm.gpu ? 1 : 0);
    assert.equal(c.prefetch, norm.prefetch ? 1 : 0);
    assert.equal(c.large_pages, norm.largePages);
    assert.equal(c.lesion, norm.lesion);
    assert.equal(c.lab, norm.lab);
    if (norm.lab) assert.equal(c.seed, norm.seed);
  }
});
