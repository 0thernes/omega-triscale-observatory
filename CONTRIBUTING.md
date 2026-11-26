# Contributing (`CONTRIBUTING.md`)

Thank you for your interest in improving `omega-triscale-observatory`!

## Workflow & Standards

This repository follows the **Build Standard for LLMs v1.2.0** (`AGENTS.md` and `repo.yaml`):
- **Maintainer commits:** The sole maintainer commits directly to `main` (Rules R1–R2). External contributors may open Issues (classified under one of the 10 finding classes) or Discussions with patches, bug reports, or independent replication logs (`REPLICATION.md`).
- **Zero runtime dependencies:** Do not introduce external npm or PyPI runtime dependencies.
- **Observer independence (`D7RO`):** Never add live write channels from T1/T2 into `Asmodensius-Native` (`:8794` / `:8796`) or alter `#ifdef PICK` shader blocks.
- **No fabricated claims:** Every numeric claim, benchmark, or citation must be backed by a real executable verification script.
- **Dual license:** Code contributions are accepted under Apache-2.0 (`LICENSE`); documentation/paper contributions under CC-BY-4.0 (`LICENSE-DOCS`).

## Required Pre-Submission Checks

```bash
npm test
python -m unittest discover -s tests -v
npm run lint
npm run mutate
pwsh -NoProfile -File scripts/Audit-Repo.ps1
```

All contributors are expected to abide by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
