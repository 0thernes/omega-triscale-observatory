# Third-Party Notices and Attribution

`omega-triscale-observatory` v6.8.0 ships **zero third-party runtime npm or PyPI dependencies**. All server, telemetry, verification, and relay logic runs exclusively on built-in Node.js (>=22 ESM) and Python (>=3.12 stdlib) modules, plus standard browser WebGL 2.0 and HTML5 Canvas APIs.

## Runtime & Build Toolchains (Not Bundled)

| Component | Role | License | Reference |
|---|---|---|---|
| Node.js (>=22) | HTTP/WebSocket hub, `node:test`, lint, mutation harness | MIT | https://nodejs.org/ |
| Python (>=3.12) | `macro_wild_relay.py`, citation & paper build scripts | PSF-2.0 | https://www.python.org/ |
| Tectonic (>=0.15) | Self-contained XeTeX/BibTeX AMS-LaTeX PDF compiler | MIT | https://tectonic-typesetting.github.io/ |
| Contributor Covenant v2.1 | Adapted in `CODE_OF_CONDUCT.md` | CC-BY-4.0 | https://www.contributor-covenant.org/ |

## Supervised Companion Repositories (External Processes, Not Vendored)

When launched locally in full 8-endpoint mode, `server.mjs` optionally launches and proxies companion repositories published by Alexander Stephen Donahue (`https://github.com/0thernes`):
- `0thernes/autophage` (`:8787`)
- `0thernes/cellulogonic-mecha` (`:8788`)
- `0thernes/cellular-engine-omega` (`:8791`)
- `0thernes/noetic-organism-omega` (`:8795`)
- `0thernes/asmodensius-native` (`:8794` & `:8796`, read-only D7 observer boundary)
- `0thernes/alife-singularity-omega-package` (`/zeta-omega/` static archive)

No source files from those sibling repositories are vendored into this repository; all tests and CI runs pass cleanly without any sibling repository present on disk.
