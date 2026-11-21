#!/usr/bin/env python3
"""
OMEGA 4-TIER OBSERVATORY — Dedicated Wild Hyper-Diverse Asmodensius-Native Relay (:8794)
Imports the verified viewer_server.py from Asmodensius-Native READ-ONLY (zero edits to
Asmodensius-Native) and launches a configurable Wild (or Lab-seeded) cosmos with strong
environmental niche partitioning (thermal/depth/vent/reef/toxin gradients) so hundreds of
clades coexist across all 3D habitats without rapid monoculture collapse.
"""
import argparse
import importlib.util
import re
from pathlib import Path

ASMO_DEMO = Path(r"Z:\[Vibe Coded (AI)]\CLAUDECODE\Asmodensius-Native\demo")
ASMO_ENGINE = Path(r"Z:\[Vibe Coded (AI)]\CLAUDECODE\Asmodensius-Native\build\z\az_live.exe")

spec = importlib.util.spec_from_file_location("az_viewer_server", str(ASMO_DEMO / "viewer_server.py"))
vs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vs)

NICHE_BASE = {
    # Strong environmental niche partitioning to break competitive exclusion:
    "WORLDGEN_TEMP_DEPTH": 3200,
    "WORLDGEN_TEMP_POLE": 2400,
    "WORLDGEN_TEMP_VENT": 4200,
    "WORLDGEN_W_HABITAT": 220,
    "WORLDGEN_W_STYLE": 144,
    "WORLDGEN_PATCHINESS": 248,
    "LIFE_REPRO_EU": 160,
    "LIFE_HAZARD": 2048,
    "LIFE_DISPERSAL_SCALE": 12,
}

PRESETS = {
    "cambrian": {
        "n": 8000,
        "cap": 48000,
        "grid": "6,6,5",
        "species": 320,
        "tps": 14,
        "sps": 12,
        "threads": 0,
        "lesion": 0,
        "params": {
            **NICHE_BASE,
            "BRAIN_FOUND_HID": 6,
            "BRAIN_DENSITY": 148,
            "NEURO_RATE": 280,
            "TIER1_LEARN_SHIFT": 14,
            "EXPR_MUT_RATE": 320,
            "GENE_NEW_RATE": 190,
            "GENE_DUP_RATE": 160,
            "GENE_DEL_RATE": 120,
            "FAMILY_SPACE": 20480,
            "COLONY_FOUND": 14,
            "COLONY_CULTURE_RATE": 112,
            "LIFE_SIZE_MU": 22,
            "WORLDGEN_STYLES": 16,
            "WORLDGEN_VARY_LOCI": 36,
            "WORLDGEN_VARY_SIZE": 210,
            "WORLDGEN_VENTS": 52,
            "WORLDGEN_TOX_SPOTS": 44,
            "WORLDGEN_REEF_SITES": 48,
            "WORLDGEN_PATCHES": 10,
            "WORLDGEN_SEA_LEVEL": 162,
        },
    },
    "hyperbrain": {
        "n": 6000,
        "cap": 40000,
        "grid": "6,6,5",
        "species": 220,
        "tps": 12,
        "sps": 12,
        "threads": 0,
        "lesion": 0,
        "params": {
            **NICHE_BASE,
            "BRAIN_FOUND_HID": 12,
            "BRAIN_DENSITY": 224,
            "NEURO_RATE": 480,
            "TIER1_LEARN_SHIFT": 12,
            "TIER1_HOP_TEMP": 48,
            "EXPR_MUT_RATE": 280,
            "GENE_NEW_RATE": 220,
            "GENE_DUP_RATE": 180,
            "GENE_DEL_RATE": 100,
            "FAMILY_SPACE": 24576,
            "COLONY_FOUND": 36,
            "COLONY_CULTURE_RATE": 168,
            "MATE_SHOW_GAIN": 384,
            "LIFE_SIZE_MU": 24,
            "WORLDGEN_STYLES": 16,
            "WORLDGEN_VARY_LOCI": 38,
            "WORLDGEN_VARY_SIZE": 215,
            "WORLDGEN_VENTS": 48,
            "WORLDGEN_REEF_SITES": 52,
            "WORLDGEN_PATCHES": 10,
            "WORLDGEN_SEA_LEVEL": 164,
        },
    },
    "hyperchaos": {
        "n": 10000,
        "cap": 65536,
        "grid": "6,6,5",
        "species": 512,
        "tps": 18,
        "sps": 12,
        "threads": 0,
        "lesion": 0,
        "params": {
            **NICHE_BASE,
            "BRAIN_FOUND_HID": 8,
            "BRAIN_DENSITY": 168,
            "NEURO_RATE": 512,
            "TIER1_LEARN_SHIFT": 13,
            "EXPR_MUT_RATE": 640,
            "GENE_NEW_RATE": 380,
            "GENE_DUP_RATE": 280,
            "GENE_DEL_RATE": 220,
            "FAMILY_SPACE": 32768,
            "COLONY_FOUND": 20,
            "COLONY_CULTURE_RATE": 128,
            "LIFE_SIZE_MU": 22,
            "WORLDGEN_STYLES": 16,
            "WORLDGEN_PATCHINESS": 252,
            "WORLDGEN_VARY_LOCI": 48,
            "WORLDGEN_VARY_SIZE": 245,
            "WORLDGEN_VENTS": 64,
            "WORLDGEN_TOX_SPOTS": 64,
            "WORLDGEN_REEF_SITES": 64,
            "WORLDGEN_PATCHES": 12,
            "WORLDGEN_SEA_LEVEL": 158,
        },
    },
    "megaswarm": {
        "n": 24000,
        "cap": 110000,
        "grid": "6,6,5",
        "species": 512,
        "tps": 12,
        "sps": 10,
        "threads": 0,
        "lesion": 0,
        "params": {
            **NICHE_BASE,
            "BRAIN_FOUND_HID": 5,
            "BRAIN_DENSITY": 128,
            "NEURO_RATE": 300,
            "TIER1_LEARN_SHIFT": 15,
            "EXPR_MUT_RATE": 360,
            "GENE_NEW_RATE": 220,
            "GENE_DUP_RATE": 160,
            "GENE_DEL_RATE": 120,
            "FAMILY_SPACE": 24576,
            "COLONY_FOUND": 24,
            "LIFE_SIZE_MU": 18,
            "WORLDGEN_STYLES": 16,
            "WORLDGEN_VARY_LOCI": 38,
            "WORLDGEN_VARY_SIZE": 220,
            "WORLDGEN_VENTS": 56,
            "WORLDGEN_REEF_SITES": 56,
            "WORLDGEN_PATCHES": 12,
            "WORLDGEN_SEA_LEVEL": 168,
        },
    },
    "abyss": {
        "n": 8000,
        "cap": 48000,
        "grid": "6,6,5",
        "species": 256,
        "tps": 14,
        "sps": 12,
        "threads": 0,
        "lesion": 0,
        "params": {
            **NICHE_BASE,
            "BRAIN_FOUND_HID": 7,
            "BRAIN_DENSITY": 156,
            "NEURO_RATE": 280,
            "TIER1_LEARN_SHIFT": 14,
            "EXPR_MUT_RATE": 320,
            "GENE_NEW_RATE": 200,
            "GENE_DUP_RATE": 150,
            "GENE_DEL_RATE": 120,
            "FAMILY_SPACE": 16384,
            "COLONY_FOUND": 16,
            "LIFE_SIZE_MU": 24,
            "WORLDGEN_SEA_LEVEL": 224,
            "WORLDGEN_VENTS": 64,
            "WORLDGEN_TEMP_VENT": 5200,
            "WORLDGEN_STYLES": 16,
            "WORLDGEN_VARY_LOCI": 38,
            "WORLDGEN_VARY_SIZE": 215,
            "WORLDGEN_PATCHES": 10,
        },
    },
}


def parse_param_string(raw: str) -> dict:
    out = {}
    if not raw:
        return out
    for part in raw.split(","):
        part = part.strip()
        if "=" not in part:
            continue
        k, v = part.split("=", 1)
        k = k.strip()
        v = v.strip()
        if re.fullmatch(r"[A-Z0-9_]+", k) and re.fullmatch(r"-?\d+", v):
            out[k] = v
    return out


def main():
    p = argparse.ArgumentParser(description="Omega 4-Tier Wild Biodiversity Relay for Asmodensius-Native")
    p.add_argument("--port", type=int, default=8794)
    p.add_argument("--preset", choices=list(PRESETS.keys()), default="cambrian")
    p.add_argument("--data-dir", type=Path, required=True)
    p.add_argument("--engine", type=Path, default=ASMO_ENGINE)
    p.add_argument("--n", type=int, default=None)
    p.add_argument("--cap", type=int, default=None)
    p.add_argument("--species", type=int, default=None)
    p.add_argument("--grid", type=str, default=None)
    p.add_argument("--tps", type=int, default=None)
    p.add_argument("--sps", type=int, default=None)
    p.add_argument("--threads", type=int, default=None)
    p.add_argument("--lesion", type=str, default=None)
    p.add_argument("--lab", action="store_true")
    p.add_argument("--seed", type=int, default=None)
    p.add_argument("--param", type=str, default="")
    a = p.parse_args()

    cfg = PRESETS[a.preset]
    n_val = max(64, min(250000, a.n if a.n is not None else cfg["n"]))
    cap_val = max(n_val + 4096, min(1000000, a.cap if a.cap is not None else cfg["cap"]))
    sp_val = max(1, min(65535, a.species if a.species is not None else cfg["species"]))
    grid_val = a.grid if (a.grid and re.fullmatch(r"\d+,\d+,\d+", a.grid)) else cfg["grid"]
    tps_val = max(0, min(1000, a.tps if a.tps is not None else cfg["tps"]))
    sps_val = max(1, min(60, a.sps if a.sps is not None else cfg["sps"]))
    threads_val = max(0, min(64, a.threads if a.threads is not None else cfg["threads"]))

    lesion_val = cfg["lesion"]
    if a.lesion is not None:
        try:
            lesion_val = int(a.lesion, 0) & 0x7FFFFF
        except ValueError:
            lesion_val = 0

    merged_params = {k: str(v) for k, v in cfg["params"].items()}
    merged_params.update(parse_param_string(a.param))
    param_str = ",".join(f"{k}={v}" for k, v in merged_params.items())

    options = [
        "--n", str(n_val),
        "--cap", str(cap_val),
        "--grid", grid_val,
        "--species", str(sp_val),
        "--param", param_str,
        "--sps", str(sps_val),
        "--tps", str(tps_val),
        "--threads", str(threads_val),
        "--observer-ms", "500",
    ]
    if lesion_val:
        options.extend(["--lesion", hex(lesion_val)])
    if a.lab:
        options.append("--lab")
        if a.seed is not None:
            options.extend(["--seed", str(a.seed)])

    mode_lbl = f"LAB(seed={a.seed})" if a.lab else f"WILD {a.preset.upper()}"
    app = vs.App(a.port, a.data_dir.resolve())
    with vs.ThreadingHTTPServer(("127.0.0.1", a.port), vs.handler(app)) as server:
        try:
            app.start(a.engine.resolve(), options)
            print(
                f"Serving {mode_lbl} cosmos ({sp_val} species, grid {grid_val}, "
                f"n={n_val}, cap={cap_val}, tps={tps_val}, lesion={hex(lesion_val)}) "
                f"on http://127.0.0.1:{a.port}/ (run {app.run_id})",
                flush=True,
            )
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            app.stop()


if __name__ == "__main__":
    main()
