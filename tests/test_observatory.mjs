// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Alexander Stephen Donahue
/**
 * OMEGA 4-TIER OBSERVATORY v6.8.0 — Automated Verification Suite
 *
 * Covers:
 *  1. Syntax & static integrity audit (`server.mjs`, `lib/observatory_core.mjs`, `web/*.js`, `macro_wild_relay.py`, UI honesty pill)
 *  2. Contract, API & negative boundary tests (live ephemeral HTTP server, path traversal defense,
 *     CSRF/CSWSH loopback guards, live raw-socket WebSocket Upgrade 403 CSWSH tests, invalid query params,
 *     preset validation, hardware flags, population 1..1M)
 *  3. Property-based tests (`prop_check` loop over 250 deterministic seeded randomized trials)
 *  4. Metamorphic, golden & zero-observer-interference tests (112-trait spectral delta, omnitemporal
 *     history cap <= 240, offline-engine DEGRADED conservation gate, D7RO matrix + live loopback wire-spy
 *     recording every request sent to mock Asmodensius during T1/T2 updates, `#ifdef PICK` shader preservation,
 *     AZST binary decoder)
 *  5. Cross-language raw-input differential oracle test (raw unnormalized adversarial inputs passed directly
 *     to BOTH Node `normalizeGenesisConfig` and Python `macro_wild_relay.py --dry-run`)
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
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
  parseBoolFlag,
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
  PORTS,
  state as hubState,
  rawCache,
  resetMacroCaches,
  pollAsmodensiusSnapOnce,
  pollAsmodensiusFieldsOnce,
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
    "C:\\Users\\Alexa\\.anaconda-desktop\\micromamba\\envs\\assistant\\python.exe",
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

function rawTcpUpgrade(port, rawRequest, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection({ host: "127.0.0.1", port });
    const chunks = [];
    let closed = false;
    let settled = false;
    const finish = (err = null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve({ raw: Buffer.concat(chunks).toString("utf8"), closed });
    };
    const timer = setTimeout(() => {
      try { sock.destroy(); } catch {}
      finish();
    }, timeoutMs);

    sock.on("connect", () => sock.write(rawRequest));
    sock.on("data", (c) => {
      chunks.push(c);
      const soFar = Buffer.concat(chunks).toString("utf8");
      if (soFar.includes("\r\n\r\n") && soFar.startsWith("HTTP/1.1 101")) {
        try { sock.end(); } catch {}
      }
    });
    sock.on("close", () => { closed = true; finish(); });
    sock.on("error", (err) => {
      if (chunks.length > 0) { closed = true; finish(); }
      else finish(err);
    });
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

function buildSyntheticAzstStatic(gx = 4, gy = 4, gz = 2) {
  const cells = gx * gy * gz;
  const nv = 1;
  const base = 32 + 4 * nv;
  const buf = Buffer.alloc(16 + base + cells + 4 * gx * gy);
  buf.writeUInt32LE(0x54535a41, 0);
  buf.writeUInt16LE(3, 4);
  buf.writeUInt32LE(1, 12);
  buf.writeUInt32LE(gx, 16);
  buf.writeUInt32LE(gy, 20);
  buf.writeUInt32LE(gz, 24);
  buf.writeUInt32LE(cells, 28);
  buf.writeUInt32LE(nv, 32);
  buf.writeUInt32LE(100, 36);
  buf.writeUInt32LE(400, 40);
  buf.writeUInt32LE(5, 48); // vent idx
  return buf;
}

function buildSyntheticAzstFields(gx = 4, gy = 4, gz = 2) {
  const n = gx * gy;
  const waterBytes = 4 * n;
  const cellBytes = 4 * n * gz;
  const buf = Buffer.alloc(48 + waterBytes + cellBytes);
  buf.writeUInt32LE(0x54535a41, 0);
  buf.writeUInt16LE(4, 4);
  buf.writeUInt32LE(2, 12);
  buf.writeBigUInt64LE(1234n, 16);
  buf.writeUInt32LE(gx, 24);
  buf.writeUInt32LE(gy, 28);
  buf.writeUInt32LE(gz, 32);
  buf.writeUInt32LE(3, 36); // water + cells
  return buf;
}

function buildSyntheticAzstShapes() {
  const buf = Buffer.alloc(20);
  buf.writeUInt32LE(0x54535a41, 0);
  buf.writeUInt16LE(5, 4);
  buf.writeUInt32LE(1, 12);
  buf.writeUInt32LE(0, 16); // 0 shapes
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

test("1b. Static audit: VERSION matches OBSERVATORY_VERSION, honest status pill title, and zero banned LLC strings", () => {
  const verFile = fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();
  assert.equal(verFile, OBSERVATORY_VERSION);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.version, OBSERVATORY_VERSION);

  const indexHtml = fs.readFileSync(path.join(ROOT, "web/index.html"), "utf8");
  assert.ok(indexHtml.includes('title="Upstream-reported residual and freshness gate"'), "web/index.html status pill must have honest title");
  assert.equal(/Live thermodynamic &amp;? observer-independence invariant verification/i.test(indexHtml), false);

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
  assert.equal(normalizeGenesisConfig({ lesion: -5 }).lesion, 0);
  assert.equal(normalizeGenesisConfig({ grid: "99,0,1" }).grid, "8,2,2");
  assert.equal(normalizeGenesisConfig({ grid: "AUTO" }).grid, "auto");
  assert.equal(normalizeGenesisConfig({ grid: "bad;rm -rf /" }).grid, "6,6,5");
  assert.equal(parseBoolFlag("false", true), false);
  assert.equal(parseBoolFlag("yes", false), true);
  assert.equal(parseBoolFlag("2", false), true);
  assert.equal(parseBoolFlag("banana", true), true);
  assert.equal(parseBoolFlag("banana", false), false);
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
 * 3. Live Ephemeral HTTP & Raw-Socket WebSocket CSWSH Contract Tests
 * ============================================================================ */
test("3. Live HTTP contract tests on ephemeral loopback port (healthz, static, traversal, CSRF, query params)", async (t) => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  // 3.1 /healthz returns 200 with exact v6.8.0 contract
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

test("3b. Live raw-socket WebSocket Upgrade CSWSH guard rejects foreign Origin & bad Host with 403 and destroys socket", async (t) => {
  const origMacroPort = PORTS.macro;
  const mockWsUpstream = net.createServer((sock) => {
    sock.once("data", () => {
      sock.write(
        "HTTP/1.1 101 Switching Protocols\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n\r\n"
      );
      sock.end();
    });
  });

  await new Promise((resolve) => mockWsUpstream.listen(0, "127.0.0.1", resolve));
  PORTS.macro = mockWsUpstream.address().port;
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  t.after(async () => {
    PORTS.macro = origMacroPort;
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => mockWsUpstream.close(resolve));
  });

  // 3b.1 Foreign Origin on GET /ws Upgrade -> 403 Forbidden & socket destroyed
  const evilOriginWs = await rawTcpUpgrade(
    port,
    `GET /ws HTTP/1.1\r\n` +
    `Host: 127.0.0.1:${port}\r\n` +
    `Origin: https://evil.example\r\n` +
    `Upgrade: websocket\r\n` +
    `Connection: Upgrade\r\n` +
    `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n` +
    `Sec-WebSocket-Version: 13\r\n\r\n`
  );
  assert.ok(evilOriginWs.raw.startsWith("HTTP/1.1 403 Forbidden"), `Expected 403 for foreign Origin on /ws, got: ${JSON.stringify(evilOriginWs.raw)}`);
  assert.equal(evilOriginWs.closed, true);

  // 3b.2 Foreign Origin on /proxy/macro/ws Upgrade -> 403 Forbidden & socket destroyed
  const evilOriginProxy = await rawTcpUpgrade(
    port,
    `GET /proxy/macro/ws HTTP/1.1\r\n` +
    `Host: 127.0.0.1:${port}\r\n` +
    `Origin: https://evil.example\r\n` +
    `Upgrade: websocket\r\n` +
    `Connection: Upgrade\r\n` +
    `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n` +
    `Sec-WebSocket-Version: 13\r\n\r\n`
  );
  assert.ok(evilOriginProxy.raw.startsWith("HTTP/1.1 403 Forbidden"), `Expected 403 for foreign Origin on /proxy/macro/ws, got: ${JSON.stringify(evilOriginProxy.raw)}`);
  assert.equal(evilOriginProxy.closed, true);

  // 3b.3 Non-loopback Host header on Upgrade -> 403 Forbidden & socket destroyed
  const evilHost = await rawTcpUpgrade(
    port,
    `GET /proxy/macro/ws HTTP/1.1\r\n` +
    `Host: evil.example:8790\r\n` +
    `Origin: http://127.0.0.1:${port}\r\n` +
    `Upgrade: websocket\r\n` +
    `Connection: Upgrade\r\n` +
    `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n` +
    `Sec-WebSocket-Version: 13\r\n\r\n`
  );
  assert.ok(evilHost.raw.startsWith("HTTP/1.1 403 Forbidden"), `Expected 403 for bad Host, got: ${JSON.stringify(evilHost.raw)}`);
  assert.equal(evilHost.closed, true);

  // 3b.4 Positive control: valid loopback Host + Origin on /proxy/macro/ws upgrades cleanly (101)
  const validWs = await rawTcpUpgrade(
    port,
    `GET /proxy/macro/ws HTTP/1.1\r\n` +
    `Host: 127.0.0.1:${port}\r\n` +
    `Origin: http://127.0.0.1:${port}\r\n` +
    `Upgrade: websocket\r\n` +
    `Connection: Upgrade\r\n` +
    `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n` +
    `Sec-WebSocket-Version: 13\r\n\r\n`
  );
  assert.ok(validWs.raw.startsWith("HTTP/1.1 101 Switching Protocols"), `Expected 101 for valid loopback Upgrade, got: ${JSON.stringify(validWs.raw)}`);

  // 3b.5 Documented loopback CLI behavior: absent Origin with valid loopback Host is admitted (101)
  const cliNoOriginWs = await rawTcpUpgrade(
    port,
    `GET /proxy/macro/ws HTTP/1.1\r\n` +
    `Host: 127.0.0.1:${port}\r\n` +
    `Upgrade: websocket\r\n` +
    `Connection: Upgrade\r\n` +
    `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n` +
    `Sec-WebSocket-Version: 13\r\n\r\n`
  );
  assert.ok(cliNoOriginWs.raw.startsWith("HTTP/1.1 101 Switching Protocols"), `Expected 101 for absent-Origin loopback CLI Upgrade, got: ${JSON.stringify(cliNoOriginWs.raw)}`);
});

/* ============================================================================
 * 4. Property-Based Tests (250+ Deterministic Seeded Randomized Trials)
 * ============================================================================ */
test("4. Property-based tests (prop_check): 250 randomized Genesis configs, grids & hardware flags", () => {
  const presetKeys = [...Object.keys(GENESIS_PRESETS), "unknown_preset", ""];
  prop_check(
    "genesis_invariants",
    250,
    0x20260680,
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
 * 5. Metamorphic, Golden, Offline Conservation & Live Wire-Spy D7RO Tests
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

test("5b. Omnitemporal history cap <= 240, offline-engine DEGRADED conservation gate, ALERT, and D7RO cells", () => {
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

  // Offline Engine DEGRADED Conservation Gate tests (fresh timestamps, zero residuals, required tier offline -> NEVER false-green!)
  const freshNow = t0 + 3210;
  st.dna.updatedAt = freshNow;
  st.cells.updatedAt = freshNow;
  st.creatures.updatedAt = freshNow;

  st.engines.t1_dna = false;
  computeDifferentialsCore(st, freshNow);
  assert.equal(st.differential.conservationState, "DEGRADED", "Offline t1_dna must force DEGRADED");
  assert.equal(st.differential.conservationOk, false);
  st.engines.t1_dna = true;

  st.engines.t2_cells = false;
  computeDifferentialsCore(st, freshNow + 10);
  assert.equal(st.differential.conservationState, "DEGRADED", "Offline t2_cells must force DEGRADED");
  assert.equal(st.differential.conservationOk, false);
  st.engines.t2_cells = true;

  st.engines.t4_env = false;
  computeDifferentialsCore(st, freshNow + 20);
  assert.equal(st.differential.conservationState, "DEGRADED", "Offline t4_env must force DEGRADED");
  assert.equal(st.differential.conservationOk, false);
  st.engines.t4_env = true;

  // All tiers back online & fresh -> VERIFIED
  computeDifferentialsCore(st, freshNow + 30);
  assert.equal(st.differential.conservationState, "VERIFIED");
  assert.equal(st.differential.conservationOk, true);

  // Conservation fail-closed: nonzero DNA residual, Cells residual, or observerFail immediately forces ALERT
  st.dna.frame.ledger.int_res = 1;
  computeDifferentialsCore(st, freshNow + 40);
  assert.equal(st.differential.conservationState, "ALERT");
  assert.equal(st.differential.conservationOk, false);
  st.dna.frame.ledger.int_res = 0;

  st.cells.telemetry.mass_res = 2;
  computeDifferentialsCore(st, freshNow + 50);
  assert.equal(st.differential.conservationState, "ALERT");
  assert.equal(st.differential.conservationOk, false);
  st.cells.telemetry.mass_res = 0;

  st.env.observerFail = 1;
  computeDifferentialsCore(st, freshNow + 60);
  assert.equal(st.differential.conservationState, "ALERT");
  assert.equal(st.differential.conservationOk, false);

  // Stale telemetry (>15s) forces DEGRADED (never false-green!)
  st.env.observerFail = 0;
  computeDifferentialsCore(st, freshNow + 60_000);
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

test("5e. Live loopback D7RO wire-spy test: records every HTTP method/path/body on mock Asmodensius during T1/T2 updates", async (t) => {
  const origPorts = { ...PORTS };
  const macroWireLog = [];
  const mesoWireLog = [];
  const microWireLog = [];
  const noeticWireLog = [];
  let servePopulatedCreatures = false;

  const SENTINEL_DNA_HEX = "cafe0123".repeat(32); // 256 hex chars (128 bytes)
  const staticBuf = buildSyntheticAzstStatic(4, 4, 2);
  const fieldsBuf = buildSyntheticAzstFields(4, 4, 2);
  const shapesBuf = buildSyntheticAzstShapes();
  const emptyCreaturesBuf = buildSyntheticAzstCreatures([], { seq: 1, tick: 100 });
  const populatedCreaturesBuf = buildSyntheticAzstCreatures([
    { lo: 1, hi: 0, x16: 1000, y16: 1000, z16: 1000, clade: 10 },
    { lo: 2, hi: 0, x16: 2000, y16: 2000, z16: 1000, clade: 20 }
  ], { seq: 2, tick: 120 });

  function readReqBody(req) {
    return new Promise((resolve) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
  }

  const mockMacro = http.createServer(async (req, res) => {
    const body = await readReqBody(req);
    macroWireLog.push({ method: req.method, url: req.url, body });
    if (req.method === "GET" && req.url === "/api/state") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ running: true, run_id: "wire-spy-run-1" }));
      return;
    }
    if (req.method === "GET" && req.url.startsWith("/api/snap?type=2")) {
      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.end(servePopulatedCreatures ? populatedCreaturesBuf : emptyCreaturesBuf);
      return;
    }
    if (req.method === "GET" && req.url.startsWith("/api/snap?type=3")) {
      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.end(staticBuf);
      return;
    }
    if (req.method === "GET" && req.url.startsWith("/api/snap?type=4")) {
      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.end(fieldsBuf);
      return;
    }
    if (req.method === "GET" && req.url.startsWith("/api/snap?type=5")) {
      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.end(shapesBuf);
      return;
    }
    if (req.method === "POST" && req.url === "/api/inspect") {
      const parsed = JSON.parse(body || "{}");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ found: true, uid: parsed.uid, clade: 10, generation: 2, energy: 200, health: 40000, parts: 6, pos: [1, 1, 0] }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  });

  const mockMeso = http.createServer(async (req, res) => {
    const body = await readReqBody(req);
    mesoWireLog.push({ method: req.method, url: req.url, body });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      telemetry: { covi: 75, alive: 256, mass_res: 0, energy_res: 0, second_law: 0, backlash: [0] },
      bridge: { traits112: new Array(112).fill(0.42), autophage_carriers: 12 }
    }));
  });

  const mockMicro = http.createServer(async (req, res) => {
    const body = await readReqBody(req);
    microWireLog.push({ method: req.method, url: req.url, body });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  });

  const mockNoetic = http.createServer(async (req, res) => {
    const body = await readReqBody(req);
    noeticWireLog.push({ method: req.method, url: req.url, body });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  });

  await Promise.all([
    new Promise((r) => mockMacro.listen(0, "127.0.0.1", r)),
    new Promise((r) => mockMeso.listen(0, "127.0.0.1", r)),
    new Promise((r) => mockMicro.listen(0, "127.0.0.1", r)),
    new Promise((r) => mockNoetic.listen(0, "127.0.0.1", r)),
    new Promise((r) => server.listen(0, "127.0.0.1", r))
  ]);

  PORTS.macro = mockMacro.address().port;
  PORTS.meso = mockMeso.address().port;
  PORTS.micro = mockMicro.address().port;
  PORTS.noetic = mockNoetic.address().port;
  const hubPort = server.address().port;

  resetMacroCaches();
  hubState.dna.frame = {
    ovi: 88.5, alive: 512, lineages: 32, entropy: 6.1, backlash: [1, 0],
    ledger: { int_res: 0, second_law_v: 0 },
    apex: { ribo_hex: "deadbeef12345678", poly: 0x1d, lineage: 7, genome_hex: SENTINEL_DNA_HEX },
    traits112: new Array(112).fill(0.77)
  };
  hubState.dna.updatedAt = Date.now();
  hubState.engines.t1_dna = true;

  t.after(async () => {
    Object.assign(PORTS, origPorts);
    resetMacroCaches();
    hubState.dna.frame = null;
    hubState.engines.t1_dna = false;
    hubState.engines.t2_cells = false;
    hubState.engines.t3_creatures = false;
    hubState.engines.t4_env = false;
    await Promise.all([
      new Promise((r) => server.close(r)),
      new Promise((r) => mockMacro.close(r)),
      new Promise((r) => mockMeso.close(r)),
      new Promise((r) => mockMicro.close(r)),
      new Promise((r) => mockNoetic.close(r))
    ]);
  });

  const postAction = (payload) => rawHttpRequest(
    hubPort,
    "POST",
    "/api/stack/action",
    { Host: `127.0.0.1:${hubPort}`, Origin: `http://127.0.0.1:${hubPort}`, "Content-Type": "application/json" },
    JSON.stringify(payload)
  );

  // Phase A: Live polling + all T1/T2 state writes & coupling actions -> ONLY read-only GETs may hit mock Asmodensius!
  await pollAsmodensiusSnapOnce();
  await pollAsmodensiusFieldsOnce(true);

  const actions = [
    { op: "transfect" },
    { op: "restraints", mode: "manual", values: [10, 20, 30, 40, 50, 0, 15, 25, 35, 45, 5, 12, 18] },
    { op: "wave_mode", mode: "constitutional" },
    { op: "meso_pulse", action: "plume", params: { x: 8, y: 12 } },
    { op: "env_solvent", val: 2 },
    { op: "cells_regime", regime: 5, solvent: 2 },
    { op: "micro_shock", action: "vivisect" },
    { op: "toggle_auto", value: true }
  ];
  for (const act of actions) {
    const r = await postAction(act);
    assert.equal(r.status, 200, `Action ${act.op} failed: ${r.body}`);
  }
  await pollAsmodensiusSnapOnce();
  await pollAsmodensiusFieldsOnce(true);

  // Confirm live T1/T2 wire traffic genuinely occurred on mock T1/T2/Noetic ports
  assert.ok(mesoWireLog.some((e) => e.method === "POST" && e.body.includes(SENTINEL_DNA_HEX)), "Expected T1 DNA transfection POST on mock T2 port");
  assert.ok(noeticWireLog.some((e) => e.method === "POST" && e.body.includes(SENTINEL_DNA_HEX)), "Expected T1 DNA POST on mock Noetic port");
  assert.ok(microWireLog.some((e) => e.method === "POST" && e.body.includes("vivisect")), "Expected T1 shock POST on mock T1 port");

  // Phase A D7RO Wire-Spy Assertion: ZERO non-GET requests and ZERO T1/T2 bytes on mock Asmodensius port!
  assert.ok(macroWireLog.length >= 5, `Expected live GET polling traffic on mock Asmodensius, saw ${macroWireLog.length}`);
  const phaseANonGets = macroWireLog.filter((e) => e.method !== "GET");
  assert.deepEqual(phaseANonGets, [], `D7RO wire violation in Phase A: non-GET request(s) sent to Asmodensius: ${JSON.stringify(phaseANonGets)}`);
  const forbiddenTokens = [SENTINEL_DNA_HEX, "cafe0123", "autophage", "restraint", "plume", "solvent", "vivisect"];
  for (const req of macroWireLog) {
    const hay = `${req.url} ${req.body}`.toLowerCase();
    for (const tok of forbiddenTokens) {
      assert.equal(hay.includes(tok), false, `D7RO wire violation: T1/T2 token '${tok}' leaked to Asmodensius on ${req.method} ${req.url}`);
    }
  }

  // Phase B: Populated creature snapshot + cross_mutate_all4 -> ONLY GETs or read-only POST /api/inspect {"uid":...}
  const phaseACount = macroWireLog.length;
  servePopulatedCreatures = true;
  await pollAsmodensiusSnapOnce();
  const cmRes = await postAction({ op: "cross_mutate_all4" });
  assert.equal(cmRes.status, 200);

  const phaseBReqs = macroWireLog.slice(phaseACount);
  assert.ok(phaseBReqs.length >= 2);
  for (const req of phaseBReqs) {
    assert.ok(req.method === "GET" || (req.method === "POST" && req.url === "/api/inspect"),
      `D7RO wire violation in Phase B: unexpected ${req.method} ${req.url} to Asmodensius`);
    if (req.method === "POST") {
      const parsed = JSON.parse(req.body);
      assert.deepEqual(Object.keys(parsed), ["uid"], `POST /api/inspect must carry strictly {uid}, got: ${req.body}`);
      assert.match(parsed.uid, /^[0-9a-f]{16}$/);
    }
    const hay = `${req.url} ${req.body}`.toLowerCase();
    for (const tok of forbiddenTokens) {
      assert.equal(hay.includes(tok), false, `D7RO wire violation in Phase B: T1/T2 token '${tok}' leaked to Asmodensius`);
    }
  }
});

/* ============================================================================
 * 6. Cross-Language Raw-Input Differential Oracle: Node vs Python --dry-run
 * ============================================================================ */
function buildRawUnnormalizedPythonArgs(rawInput) {
  const args = [
    "-I", "-B", path.join(ROOT, "macro_wild_relay.py"),
    "--port", "8794",
    "--data-dir", path.join(ROOT, "runtime", "dry-run-tmp"),
    "--engine", "az_live.exe",
    "--dry-run"
  ];
  if (rawInput.preset !== undefined) args.push("--preset", String(rawInput.preset));
  if (rawInput.n !== undefined) args.push("--n", String(rawInput.n));
  if (rawInput.cap !== undefined) args.push("--cap", String(rawInput.cap));
  if (rawInput.species !== undefined) args.push("--species", String(rawInput.species));
  if (rawInput.grid !== undefined) args.push("--grid", String(rawInput.grid));
  if (rawInput.tps !== undefined) args.push("--tps", String(rawInput.tps));
  if (rawInput.sps !== undefined) args.push("--sps", String(rawInput.sps));
  if (rawInput.threads !== undefined) args.push("--threads", String(rawInput.threads));
  if (rawInput.kernels !== undefined) args.push("--kernels", String(rawInput.kernels));
  if (rawInput.gpu !== undefined) args.push("--gpu", String(rawInput.gpu));
  if (rawInput.prefetch !== undefined) args.push("--prefetch", String(rawInput.prefetch));
  if (rawInput.lesion !== undefined) args.push("--lesion", String(rawInput.lesion));
  if (rawInput.ecores) args.push("--ecores");
  if (rawInput.largePages) args.push("--large-pages");
  if (rawInput.lab) args.push("--lab");
  if (rawInput.seed !== undefined) args.push("--seed", String(rawInput.seed));
  return args;
}

test("6. Raw-input differential parity: unnormalized adversarial inputs produce identical clamping in Node and Python --dry-run", () => {
  assert.ok(PYTHON_BIN, "Python interpreter required for differential test");

  // Explicitly raw, unnormalized adversarial boundary cases passed directly to BOTH Node and Python
  const rawAdversarialCases = [
    { preset: "nonexistent", n: 0, cap: -10, species: 0, grid: "99,0,1", tps: -50, sps: 0, threads: -4, kernels: "0", ecores: false, prefetch: "false", gpu: "yes", largePages: false, lesion: "-5", lab: true, seed: -99 },
    { preset: "hyperbrain", n: -5, cap: 50, species: 999, grid: "bad;rm -rf /", tps: 5000, sps: 999, threads: 128, kernels: "2", ecores: true, prefetch: "on", gpu: "off", largePages: true, lesion: "0xffffffff", lab: true, seed: 9999999999 },
    { preset: "million", n: 5_000_000, cap: 0, species: -12, grid: "AUTO", tps: 0, sps: 1, threads: 0, kernels: "no", ecores: true, prefetch: "0", gpu: "1", largePages: false, lesion: "0x1000000", lab: false },
    { preset: "cambrian", n: "NaN", cap: "abc", species: "bad", grid: "6,6,5", tps: 14, sps: 12, threads: 24, kernels: "banana", ecores: true, prefetch: "garbage", gpu: "nope_invalid", largePages: false, lesion: "not_hex", lab: true, seed: "NaN" },
    { preset: "megagrowth", n: 250000, cap: 0, species: 100, grid: "7,6,6", tps: 1000, sps: 60, threads: 64, kernels: "1", ecores: true, prefetch: "1", gpu: "0", largePages: true, lesion: "0x7fffff", lab: true, seed: 0 },
    { preset: "abyss", n: 250001, cap: 0, species: 101, grid: "2,8,5", tps: 500, sps: 30, threads: 32, kernels: "true", ecores: false, prefetch: "true", gpu: "-1", largePages: false, lesion: "0x15", lab: true, seed: 2147483647 }
  ];

  // Plus 12 deterministic seeded randomized raw inputs
  const rng = createSplitMix32(0xD1FF6800);
  const presets = [...Object.keys(GENESIS_PRESETS), "bad_preset"];
  const rawFlagValues = ["0", "1", "true", "false", "yes", "no", "2", "-1", "garbage"];
  for (let i = 0; i < 12; i++) {
    rawAdversarialCases.push({
      preset: presets[Math.floor(rng() * presets.length)],
      n: Math.floor((rng() - 0.2) * 2_000_000),
      cap: rng() < 0.3 ? 0 : Math.floor((rng() - 0.2) * 2_500_000),
      species: Math.floor((rng() - 0.2) * 250),
      grid: rng() < 0.25 ? "auto" : (rng() < 0.75 ? `${Math.floor(rng() * 12)},${Math.floor(rng() * 12)},${Math.floor(rng() * 12)}` : "malformed"),
      tps: Math.floor((rng() - 0.15) * 1500),
      sps: Math.floor((rng() - 0.15) * 90),
      threads: Math.floor((rng() - 0.15) * 96),
      kernels: rawFlagValues[Math.floor(rng() * rawFlagValues.length)],
      ecores: rng() > 0.5,
      prefetch: rawFlagValues[Math.floor(rng() * rawFlagValues.length)],
      gpu: rawFlagValues[Math.floor(rng() * rawFlagValues.length)],
      largePages: rng() > 0.5,
      lesion: rng() < 0.2 ? "-7" : "0x" + Math.floor(rng() * 0x2000000).toString(16),
      lab: rng() > 0.5,
      seed: Math.floor((rng() - 0.2) * 3_000_000_000)
    });
  }

  for (let idx = 0; idx < rawAdversarialCases.length; idx++) {
    const rawInput = rawAdversarialCases[idx];
    const norm = normalizeGenesisConfig(rawInput);
    const pyArgs = buildRawUnnormalizedPythonArgs(rawInput);

    const res = spawnSync(PYTHON_BIN, pyArgs, { encoding: "utf8" });
    assert.equal(res.status, 0, `case ${idx} macro_wild_relay.py --dry-run failed: ${res.stderr}`);
    const pyOut = JSON.parse(res.stdout);
    const c = pyOut.config;
    const expectedGrid = norm.grid === "auto" ? null : norm.grid;

    assert.equal(c.preset, norm.preset, `case ${idx} preset mismatch`);
    assert.equal(c.n, norm.n, `case ${idx} n mismatch`);
    assert.equal(c.cap, norm.cap, `case ${idx} cap mismatch`);
    assert.equal(c.species, norm.species, `case ${idx} species mismatch`);
    assert.equal(c.grid, expectedGrid, `case ${idx} grid mismatch`);
    assert.equal(c.tps, norm.tps, `case ${idx} tps mismatch`);
    assert.equal(c.sps, norm.sps, `case ${idx} sps mismatch`);
    assert.equal(c.threads, norm.threads, `case ${idx} threads mismatch`);
    assert.equal(c.kernels, norm.kernels ? 1 : 0, `case ${idx} kernels mismatch`);
    assert.equal(c.ecores, norm.ecores, `case ${idx} ecores mismatch`);
    assert.equal(c.gpu, norm.gpu ? 1 : 0, `case ${idx} gpu mismatch`);
    assert.equal(c.prefetch, norm.prefetch ? 1 : 0, `case ${idx} prefetch mismatch`);
    assert.equal(c.large_pages, norm.largePages, `case ${idx} large_pages mismatch`);
    assert.equal(c.lesion, norm.lesion, `case ${idx} lesion mismatch`);
    assert.equal(c.lab, norm.lab, `case ${idx} lab mismatch`);
    if (norm.lab) assert.equal(c.seed, norm.seed, `case ${idx} seed mismatch`);
  }
});
