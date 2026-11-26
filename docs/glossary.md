# Glossary (`docs/glossary.md`)

## Observatory & Multi-Scale Domain Terms

- **AZST:** Binary streaming snapshot wire format (`magic = 0x54535a41`) emitted by `Asmodensius-Native` for creatures (`type=2`), static terrain/vents (`type=3`), dynamic voxel fields (`type=4`), and 48×48 octahedral clade meshes (`type=5`).
- **Bio-FX ULTRA:** Client-side, observer-only GLSL ES 3.00 shader injection applied by `server.mjs` to `/proxy/macro/viewer_gl.js` strictly outside `#ifdef PICK` blocks.
- **D7RO (Law 4 / D7 Read-Only):** Design rule that live T1/T2 state is not written into `Asmodensius-Native` during simulation ticks. In the hub it appears as constant coupling-matrix cells; see `CLAIMS.md` C3 for what is tested.
- **Genesis Studio:** Collapsible control drawer exposing `1..1,000,000` founder population controls, carrying capacity, 3D log2 grid geometry, 23 native lesion flags, and bare-metal Windows execution flags (`--ecores`, `--kernels`, `--prefetch`, `--gpu`, `--large-pages`).
- **Omnitemporal History Ring:** Fixed-capacity (`<= 240` samples) rolling buffer of synchronized 4-tier telemetry snapshots used for time-scrubbing and variance windows.
- **112-Trait Spectral Δ:** Elementwise clamped difference $\Delta_i = \operatorname{clip}_{[0,1]}(b_i) - \operatorname{clip}_{[0,1]}(a_i)$ between Tier 1 DNA and Tier 2 cellular 112-slot telemetry vectors, accompanied by 111 finite-difference gradient slopes.
- **8-Axis Biophysical Cosine Coherence:** Directional cosine similarity computed over 8 semantically aligned normalized metrics across Tier 1 and Tier 2.
- **SplitMix32:** Deterministic 32-bit seeded PRNG replacing `Math.random()` inside the Hub core.

## Build Standard v1.2.0 — The 10 Finding Classes (`R7`)

Every audit, review, or issue finding in this repository is classified under exactly one of these ten classes:

1. **`bug`** — Code does something different from its spec or intent (a defect in program logic).
2. **`error`** — Wrong number, claim, doc, config, version, build, or command.
3. **`issue`** — Works and is not wrong, but is unclear, inconsistent, fragile, or hard to maintain.
4. **`problem`** — External obstacle (network, account, legal/entity naming, toolchain) blocking progress or compliance.
5. **`concern`** — Risk that has not caused harm yet (security, cost, legal, reliability).
6. **`dilemma`** — Trade-off between valid options; the owner decides.
7. **`conflict`** — Two requirements or rules contradict each other.
8. **`gap`** — Something required or expected is missing; nothing present is wrong.
9. **`hole`** — Missing check or safeguard, so a defect could pass unnoticed.
10. **`blindspot`** — A user, platform, failure mode, or assumption nobody has examined yet.
