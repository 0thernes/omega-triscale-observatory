# Examples (`examples/`)

Self-contained, runnable examples demonstrating `omega-triscale-observatory` v6.7.0 without requiring any sibling simulation binaries or npm dependencies.

## Available Examples

1. **`verify_pipeline.mjs`** — Demonstrates programmatic Genesis configuration clamping (`1..1,000,000`), bare-metal hardware flag assembly (`--ecores`, `--gpu`, `--prefetch`, `--kernels`, `--large-pages`), 112-trait spectral differential + 8-axis cosine coherence + `D7RO` matrix verification, and canonical path-traversal defense.

### Run

```bash
node examples/verify_pipeline.mjs
```
