# Threat Model (`docs/threat-model.md`)

STRIDE threat analysis for `omega-triscale-observatory` v6.8.0 (`B36`).

## Trust Boundary

- **Intended Deployment:** Single-user local workstation bound strictly to `127.0.0.1:8790`.
- **Untrusted Adversaries Considered:**
  1. Malicious web pages open in the same browser attempting cross-origin CSRF, DNS-rebinding, or cross-site WebSocket hijacking (CSWSH) against `http://127.0.0.1:8790`.
  2. Malformed URLs, path-traversal payloads, or oversized HTTP bodies targeting static file routes or proxy endpoints.
  3. Malformed/injected Genesis `AZ_PARAM` strings or adversarial CLI arguments attempting command-line injection into `macro_wild_relay.py` / `az_live.exe`.
  4. Corrupted or truncated binary `AZST` packets from upstream engines.

## STRIDE Matrix & Verified Mitigations

| Category | Concrete Threat | Mitigation Implemented | Verification Evidence |
|---|---|---|---|
| **Spoofing** | Cross-site page forging `POST /api/stack/action` or WebSocket `/proxy/macro/ws` upgrade (CSRF / CSWSH / DNS rebinding). | `isLoopbackHost`, `isLoopbackOrigin`, `Sec-Fetch-Site` check, and required `Content-Type: application/json` (`isSafeLoopbackRequest`), plus `server.on("upgrade")` Host/Origin guard. Absent `Origin` with loopback `Host` is admitted for non-browser loopback CLI clients (browsers always attach `Origin` on WS upgrades). | `tests/test_observatory.mjs` (`Tests 2c, 3.5, 3.6, 3.8`, live raw-socket TCP WS `Upgrade` `403`/`101` `Test 3b`) + Mutants `M5_CSRF_ORIGIN_BYPASS`, `M7_WS_UPGRADE_CSWSH_BYPASS` |
| **Tampering** | Directory traversal (`../`, `..\`, `%2e%2e`, NUL bytes, Windows drive prefixes) leaking files outside `web/` or `ZETA_PKG_ROOT`. | Canonical `path.relative` containment in `resolveSafePath` rejecting NUL bytes, drive prefixes, UNC paths, and `..`. | `tests/test_observatory.mjs` (`Tests 2c, 3.3`) + Mutant `M1_PATH_TRAVERSAL_BYPASS` |
| **Tampering** | Command/argument injection via Genesis `params`, `grid`, or `lesion` fields passed to `spawn()`. | `spawn()` uses `shell: false` (argument array only); `params` keys strictly whitelisted to `^[A-Z0-9_]+$` with finite integer values; `grid` whitelisted to `auto` or clamped `2..8` triples; `lesion` clamped to `[0, 0x7fffff]`. | `tests/test_observatory.mjs` (`Tests 2a, 2b, 4 [250]`, `6 [18 raw]`) + `tests/test_relay.py` (`120` trials + raw adversarial) |
| **Tampering (Scientific)** | Observer interference mutating `Asmodensius-Native` state or breaking GPU picking. | Fixed `D7RO` (`s: 0`) display cells in `computeDifferentialsCore`; `#ifdef PICK` preserved untouched in `injectMacroBioFx`; zero T1/T2 write paths to `PORTS.macro`. | `tests/test_observatory.mjs` (`Tests 5b, 5c`, live loopback wire-spy `Test 5e`) + Mutants `M3_D7RO_OBSERVER_VIOLATION`, `M9_D7RO_WIRE_LEAK_SERVER` |
| **Information Disclosure** | XSS in UI telemetry rendering from upstream engine strings. | All dynamic DOM interpolations in `web/app.js` escape HTML entities via `esc()` (`&`, `<`, `>`, `"`, `'`); responses emit `X-Content-Type-Options: nosniff`. | `web/app.js`, `tests/test_observatory.mjs` (`Test 3.2`) |
| **Denial of Service** | Memory exhaustion via unbounded history growth, oversized proxy payloads, or SSE connection floods. | Omnitemporal ring capped `<= 240`; causal log `<= 80`; SSE clients `<= 32` (`429`); request cap `2 MiB` (`413`); proxy response cap `16 MiB` (`502`); JSON body cap `256 KiB`; `az_live` run dirs pruned to `5`. | `tests/test_observatory.mjs` (`Test 5b`) + Mutant `M4_OMNITEMPORAL_CAP_LEAK` |
| **Elevation of Privilege** | Exposing local supervisor over LAN/WAN. | Hard-bound strictly to `127.0.0.1` (`server.listen(HUB_PORT, "127.0.0.1")`); documented explicitly in `SECURITY.md` and `LIMITATIONS.md`. | `server.mjs`, `SECURITY.md` |
