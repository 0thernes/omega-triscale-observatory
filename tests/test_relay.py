#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2026 Alexander Stephen Donahue
"""Unit & property tests for `macro_wild_relay.py` (Python stdlib unittest)."""

from __future__ import annotations

import json
import random
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import macro_wild_relay as relay  # noqa: E402


class TestMacroWildRelay(unittest.TestCase):
    def test_auto_cap_boundaries(self) -> None:
        self.assertEqual(relay.auto_cap(1), 4100)
        self.assertEqual(relay.auto_cap(8000), 36096)
        self.assertEqual(relay.auto_cap(250000), 1004096)
        self.assertEqual(relay.auto_cap(1000000), 1004096)

    def test_sanitize_grid(self) -> None:
        self.assertIsNone(relay.sanitize_grid("auto", "6,6,5"))
        self.assertEqual(relay.sanitize_grid("99,0,1", "6,6,5"), "8,2,2")
        self.assertEqual(relay.sanitize_grid("invalid", "6,6,5"), "6,6,5")
        self.assertEqual(relay.sanitize_grid("7,6,6", "6,6,5"), "7,6,6")

    def test_parse_param_string_sanitizes_injection(self) -> None:
        parsed = relay.parse_param_string("BRAIN_FOUND_HID=12,bad_key=5,INJECT=1;rm,LIFE_SIZE_MU=-4")
        self.assertEqual(parsed, {"BRAIN_FOUND_HID": "12", "LIFE_SIZE_MU": "-4"})

    def test_dry_run_cli_all_hardware_flags(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            proc = subprocess.run(
                [
                    sys.executable, "-I", "-B", str(ROOT / "macro_wild_relay.py"),
                    "--preset", "million",
                    "--data-dir", tmp,
                    "--n", "1000000",
                    "--cap", "0",
                    "--species", "150",
                    "--kernels", "1",
                    "--ecores",
                    "--gpu", "1",
                    "--prefetch", "1",
                    "--large-pages",
                    "--lesion", "0xffffff",
                    "--lab", "--seed", "42",
                    "--dry-run",
                ],
                capture_output=True,
                text=True,
                check=True,
            )
            data = json.loads(proc.stdout)
            cfg = data["config"]
            opts = data["options"]
            self.assertEqual(cfg["version"], "6.7.0")
            self.assertEqual(cfg["n"], 1000000)
            self.assertEqual(cfg["cap"], 1004096)
            self.assertEqual(cfg["species"], 100)
            self.assertEqual(cfg["lesion"], 0x7FFFFF)
            self.assertIn("--ecores", opts)
            self.assertIn("--large-pages", opts)
            self.assertIn("--lab", opts)
            self.assertEqual(opts[opts.index("--gpu") + 1], "1")
            self.assertEqual(opts[opts.index("--kernels") + 1], "1")
            self.assertEqual(opts[opts.index("--prefetch") + 1], "1")

    def test_prop_check_randomized_relay_configs(self) -> None:
        rng = random.Random(20260670)
        parser = relay.build_parser()
        presets = list(relay.PRESETS.keys())
        for _ in range(120):
            preset = rng.choice(presets)
            n = rng.randint(-100, 1_500_000)
            cap = rng.choice([0, rng.randint(-10, 2_500_000)])
            sp = rng.randint(-5, 250)
            argv = [
                "--preset", preset,
                "--data-dir", ".",
                "--n", str(n),
                "--cap", str(cap),
                "--species", str(sp),
                "--tps", str(rng.randint(-5, 1200)),
                "--sps", str(rng.randint(-5, 90)),
                "--threads", str(rng.randint(-5, 96)),
                "--kernels", str(rng.choice([0, 1])),
                "--gpu", str(rng.choice([0, 1])),
                "--prefetch", str(rng.choice([0, 1])),
                "--lesion", hex(rng.randint(0, 0xFFFFFFF)),
            ]
            if rng.random() > 0.5:
                argv.append("--ecores")
            if rng.random() > 0.5:
                argv.append("--large-pages")
            ns = parser.parse_args(argv)
            cfg, opts = relay.resolve_relay_options(ns)
            self.assertTrue(1 <= cfg["n"] <= 1_000_000)
            self.assertTrue(cfg["n"] <= cfg["cap"] <= 2_000_000)
            self.assertTrue(1 <= cfg["species"] <= min(100, cfg["n"]))
            self.assertEqual(cfg["lesion"] & ~0x7FFFFF, 0)
            self.assertIn("--observer-ms", opts)


if __name__ == "__main__":
    unittest.main()
