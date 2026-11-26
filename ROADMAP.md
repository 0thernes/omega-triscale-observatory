# Roadmap (`ROADMAP.md`)

## Current Release — v6.7.0 (Active)
- Pure zero-dependency `lib/observatory_core.mjs` + testable `server.mjs` (`--no-engines`, `/healthz`) + `macro_wild_relay.py --dry-run`.
- Complete automated Node (`12/12`, 250 `prop_check`) + Python (`5/5`, 120 trials) + differential + surgical mutation (`6/6`) verification suite.
- Publication-grade zero-overflow AMS-LaTeX architecture white paper + clean-room arXiv tarball + 16/16 live-verified citations.
- 100.0% Build Standard for LLMs v1.2.0 compliance.

## Planned (v6.8.x)
- Optional Playwright headless WebGL2 smoke check script (manual local opt-in, preserving zero-dependency default runtime).
- Structured JSONL telemetry session recorder and deterministic replay driver (`--replay <session.jsonl>`) for offline Omnitemporal Phase scrubbing without live engines.
- Automated differential check between `web/taxonomy.js` and a Python reference hash oracle.

## Not Planned
- **Public multi-tenant cloud hosting or internet exposure:** The observatory is intentionally designed as a single-user loopback (`127.0.0.1`) research instrument.
- **Live T1/T2 writeback into `Asmodensius-Native`:** Violating the `D7RO` read-only observer boundary is explicitly out of scope and permanently guarded by automated tests and mutation kill `M3`.
- **Bundling third-party frontend frameworks or npm runtime dependencies:** Keeping runtime dependencies at zero is a core reliability and supply-chain invariant.
