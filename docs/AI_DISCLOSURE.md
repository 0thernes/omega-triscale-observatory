# AI-Assistance Disclosure & CRediT Authorship (`docs/AI_DISCLOSURE.md`)

In accordance with the Defensible Independent AI Research Playbook v1.3 and transparent scholarly standards, this document discloses how human authorship and AI coding assistants contributed to `omega-triscale-observatory` v6.7.0.

## Sole Human Author & CRediT Taxonomy

- **Author:** Alexander Stephen Donahue
- **Affiliation:** Independent Researcher, Spokane, WA, USA
- **ORCID:** [`0009-0006-8168-9648`](https://orcid.org/0009-0006-8168-9648)
- **Contact:** `0_0@0thernes.art` · `https://0thernes.art`
- **CRediT Roles:** Conceptualization, Methodology, Software, Validation, Investigation, Data Curation, Writing — Original Draft, Writing — Review & Editing, Supervision.

## Transparent AI-Assistance Disclosure

- **Models / Assistants Used:** Large language model coding assistants (Antigravity / Gemini / Claude / Codex coding workflows) were utilized under direct human direction and architectural specification to:
  1. Refactor pure deterministic server helpers into `lib/observatory_core.mjs` and add `--dry-run` / `/healthz` contracts;
  2. Author Node.js (`node:test`) and Python (`unittest`) test suites, `prop_check` generators, static lint checks, and the 6-mutant surgical mutation harness;
  3. Draft AMS-LaTeX manuscript source (`paper/main.tex`), TikZ architecture diagrams, and Build Standard v1.2.0 documentation scaffolding.
- **Human Verification & Accountability:** Every claim, test pass (`12/12` Node, `5/5` Python), mutation kill (`6/6`), micro-benchmark (`results/benchmarks.json`), live citation reachability check (`16/16` URLs/DOIs reachable; the `bedau1998` DOI was later found to resolve to a different chapter, see `ERRATA.md`), Tectonic PDF build (`0` Overfull `\hbox`), and `Audit-Repo.ps1` score (`100.0%`) was executed locally against the actual committed files and reviewed by the human author, who takes full scholarly and engineering responsibility for the published artifact.
- **No Fabricated Peer Review or Credentials:** This work is published openly as an independent technical software artifact and non-peer-reviewed preprint. No external peer review, institutional affiliation, or commercial LLC entity is claimed.
- **Conflict of Interest:** None declared.
