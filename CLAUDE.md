# CLAUDE.md

Read and follow `AGENTS.md` and `HANDOFF.md` in this repository root.
All 6 connected Artificial Life repositories live in `Z:\[Vibe Coded (AI)]\ANTIGRAVITY\` and are shared across Claude Code, Codex, and Antigravity via git commits (never create persistent `WRITER.lock` files).

## Quick Verification Commands (`noetic-organism-omega`)
- Full Win64 build + M7 mutants + M8 E1/E2/E3 + 24 Pure Lean 4 audit: `pwsh -NoProfile -ExecutionPolicy Bypass -File .\build.ps1`
- Linux GCC `-Werror` parity check: `wsl -e bash -lc "cd '/mnt/z/[Vibe Coded (AI)]/ANTIGRAVITY/noetic-organism-omega' && ./build_linux.sh"`
- Zero-Theater audit & M8 825-Row Trace Matrix: `node scripts/audit_zero_theater.mjs && node scripts/build_m8_e2_825_trace.mjs`
- M9 G1 6-Repo Foundation Gate: `node scripts/run_g1_6repo_gate.mjs`
- Standalone Observatory (`:8795`): `node web/server.mjs`
