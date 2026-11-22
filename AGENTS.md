# AGENTS.md — Universal Multi-Agent / Multi-Model Operating Standard (6-Repo Unified ALife Stack)

This repository is part of **ONE unified 6-repository Artificial Life series** owned by Alexander Stephen Donahue (`0thernes LLC`, `https://github.com/0thernes`) located in `Z:\[Vibe Coded (AI)]\ANTIGRAVITY\`.

**ALL models and coding agents (Antigravity/Gemini, Claude Code, OpenAI Codex/GPT, Cursor) MUST share these exact 6 repositories cleanly** — never fork into disconnected `CLAUDECODE` folders and **never create persistent `WRITER.lock` files** that block handoff when subscription credits rotate.

## The 6 Connected Repositories (`Z:\[Vibe Coded (AI)]\ANTIGRAVITY\`)
1. `autophage` (`https://github.com/0thernes/autophage`) — Tier 1 DNA · x86-64 genetic soup · `18/18` gates · `6/6` mutants · `38` Pure Lean 4 · `:8787`
2. `cellulogonic-mecha` (`https://github.com/0thernes/cellulogonic-mecha`) — Tier 2 3D cells · 4 solvents · GRN · `24/24` gates · `8/8` mutants · `58` Pure Lean 4 · `:8788`
3. `cellular-engine-omega` (`https://github.com/0thernes/cellular-engine-omega`) — Tier 2+ Frontier 16-testbed VM · `54/54` gates · `16/16` mutants · `66` Pure Lean 4 · `:8791`
4. `noetic-organism-omega` (`https://github.com/0thernes/noetic-organism-omega`) — Tier 3/4 Whole-Organism Cognitive & Clean-Slate v3.0 Release-Gate Engine (`v1.1.0`: `13/13` CS-v3 Gates, `14/14` Butlin, `10/10` Theories, `25/25` CQM, `12/12` Ring-0 WSE-12, `5/5` Anti-LARP, `825` Honest Trace) · `32` Pure Lean 4 · `:8795`
5. `omega-triscale-observatory` (`https://github.com/0thernes/omega-triscale-observatory`) — Unified 7-Endpoint Observatory Hub (`v6.4.1`) · `:8790`
6. `alife-singularity-omega-package` (`https://github.com/0thernes/alife-singularity-omega-package`) — Master Spec, Empirical Archive (`v3.3.0-omega`, `18/18` Forensic Gates, `Z: ↔ I:` parity, Live OVBS-52 = `92.05` / `194` Pure Lean 4) · `:8790/zeta-omega/`

*(Note: `Z:\[Vibe Coded (AI)]\CLAUDECODE\Asmodensius-Native` is an external read-only macro engine consumed only via `az_live.exe` on `:8794`; do not modify it while `WRITER.lock` is active.)*

## Lock-Free Multi-Model Handoff Protocol (MANDATORY)
1. **Before editing:** Run `git status -sb` and `git log -n 3 --oneline`. If working tree has recent edits (< 15 min old) from another live session, pause or coordinate via a feature branch — never clobber uncommitted work.
2. **PowerShell Bracket-Safety (CRITICAL):** Because the path contains `[Vibe Coded (AI)]`, ALWAYS pass `-LiteralPath` to PowerShell file cmdlets (`Test-Path -LiteralPath`, `Get-ChildItem -LiteralPath`, `Get-Content -LiteralPath`).
3. **Canonical Toolchains on This Host:**
   - Win64 Clang: `$env:USERPROFILE\.elan\toolchains\leanprover--lean4---v4.35.0\bin\clang.exe`
   - Pure Lean 4: `$env:USERPROFILE\.elan\toolchains\leanprover--lean4---v4.35.0\bin\lean.exe`
   - Linux GCC: `wsl -e gcc` (`build_linux.sh`)
   - Python via uv: `C:\Users\Alexa\.local\bin\uv.exe`
   - Node.js: `node` (`v25+`)
4. **Non-Negotiable Verification Rules:**
   - Zero `sorry`, zero `admit`, zero custom axioms, zero `_native.bv_decide` in Lean 4 (strictly `{propext, Classical.choice, Quot.sound}`).
   - Zero compiler warnings (`-Wall -Wextra -Werror`).
   - Zero synthetic score fan-outs (`32 -> 825`) or hardcoded lesion score multipliers (`score *= 0.68`).
   - Epistemic honesty (ADR 0018): consciousness indicators are architectural proxies only, never claims of subjective qualia.
5. **Before switching models / ending a session:** Update `HANDOFF.md` with exact commit SHA, verification results, and next concrete steps; commit cleanly on `main` and push to `origin/main`.
