# AI-Assistance Disclosure & CRediT Authorship (`docs/AI_DISCLOSURE.md`)

In accordance with the Defensible Independent AI Research Playbook v1.3 and transparent scholarly standards, this document discloses how human authorship and AI coding assistants contributed to `omega-triscale-observatory` v6.8.0.

## Sole Human Author & CRediT Taxonomy

- **Author:** Alexander Stephen Donahue
- **Affiliation:** Independent Researcher, Spokane, WA, USA
- **ORCID:** [`0009-0006-8168-9648`](https://orcid.org/0009-0006-8168-9648)
- **Contact:** `0_0@0thernes.art` · `https://0thernes.art`
- **CRediT Roles:** Conceptualization, Methodology, Software, Validation, Investigation, Data Curation, Writing — Original Draft, Writing — Review & Editing, Supervision.

## Transparent AI-Assistance Disclosure

- **Models / Assistants Used:** Large language model coding assistants (Antigravity / Gemini / Claude / Codex coding workflows) were utilized under direct human direction and architectural specification to:
  1. Refactor pure deterministic server helpers into `lib/observatory_core.mjs`, expose configurable `PORTS` + single-tick pollers in `server.mjs`, and harden raw-input parity in `macro_wild_relay.py`;
  2. Author Node.js (`node:test`) and Python (`unittest`) test suites (including live raw-socket WS CSWSH, live loopback `D7RO` wire-spy, offline `DEGRADED`, `prop_check` generators, raw-input differential parity, static lint, and the 9-mutant planted-regression harness);
  3. Upgrade `scripts/check_citations.py` for live Crossref/DataCite title & author verification, add `scripts/stamp_timestamps.py`, draft AMS-LaTeX manuscript source (`paper/main.tex`), build the WCAG 2.2 AA GitHub Pages showcase (`docs/index.html`), and maintain Build Standard v1.2.0 / FAIR metadata.
- **Human Verification & Accountability:** Every claim, test pass (`14/14` Node, `6/6` Python), planted-mutant kill (`9/9` across `lib/observatory_core.mjs` & `server.mjs`), micro-benchmark (`results/benchmarks.json`), live Crossref/DataCite title+author citation audit (`13/13` entries, `0` retractions, `bedau1998` wrong DOI removed — see `results/citation-audit.json` and `ERRATA.md`), dual RFC 3161 + Bitcoin OTS timestamp check, Tectonic PDF build (`0` Overfull `\hbox`), and `Audit-Repo.ps1` score (`100.0%`) was executed locally against the actual committed files and reviewed by the human author, who takes full scholarly and engineering responsibility for the published artifact.
- **No Fabricated Peer Review or Credentials:** This work is published openly as an independent technical software artifact and non-peer-reviewed preprint. No external peer review, institutional affiliation, or commercial LLC entity is claimed.
- **Conflict of Interest:** None declared.
