# Roadmap (`ROADMAP.md`)

## Current Release — v6.8.0 (Active)
- Pure zero-dependency `lib/observatory_core.mjs` + port-configurable `server.mjs` (`--no-engines`, `/healthz`, single-tick pollers) + raw-input parity `macro_wild_relay.py --dry-run`.
- Complete automated Node (`14/14`: live raw-socket WS CSWSH `403`/`101`, live loopback `D7RO` wire-spy, offline-engine `DEGRADED` gate, `250` `prop_check`, `18` raw-input differential parity) + Python (`6/6`, `120` trials) + static lint + `9/9` planted-regression mutation audit (`7` core, `2` server, non-dirty working tree).
- Zero-overflow AMS-LaTeX architecture white paper (`dist/Donahue_2026_omega_triscale_observatory.pdf`) + clean-room arXiv tarball (`dist/arxiv_submission.tar.gz`) + `13/13` Crossref/DataCite title+author verified bibliography (`0` retractions).
- Static WCAG 2.2 AA GitHub Pages showcase (`docs/index.html`), FAIR metadata (`croissant.json`, `ro-crate-metadata.json`, `codemeta.json`), `REUSE.toml`, `docs/DATASHEET.md`, `SUBMISSION_READINESS.md`, SLSA provenance on committed `dist/` files, and dual DigiCert RFC 3161 + Bitcoin OpenTimestamps proofs.
- 100.0% Build Standard for LLMs v1.2.0 compliance.

## Planned (v6.9.x)
- Optional Playwright headless WebGL2 smoke check script (manual local opt-in, preserving zero-dependency default runtime).
- Structured JSONL telemetry session recorder and deterministic replay driver (`--replay <session.jsonl>`) for offline Omnitemporal Phase scrubbing without live engines.
- Automated differential check between `web/taxonomy.js` and a Python reference hash oracle.

## Not Planned
- **Public multi-tenant cloud hosting or internet exposure:** The observatory is intentionally designed as a single-user loopback (`127.0.0.1`) research instrument.
- **Live T1/T2 writeback into `Asmodensius-Native`:** Violating the `D7RO` read-only observer convention is explicitly out of scope and permanently guarded by live wire-spy `Test 5e` and planted mutants `M3` & `M9`.
- **Bundling third-party frontend frameworks or npm runtime dependencies:** Keeping runtime dependencies at zero is a core reliability and supply-chain invariant.
