# 2026-08-14 Specs System Restructure

## What was done

- Restructured `specs/` into: `features/` (one spec = one task, per domain), `memory/` (project-state, chat-logs, decisions, incidents), `shared/` (glossary, tech-stack, conventions, architecture-overview, adrs), `changes/` (RFCs only), `templates/` (4 new blueprints), `archive/` (+ README index).
- Migrated 10 ADRs from `specs/decisions/` → `specs/shared/adrs/` (cross-references updated, frontmatter added).
- Merged 6 living domain specs into `specs/shared/architecture-overview.md`; removed `specs/living/`.
- Converted 8 active change specs (012/013/021/022/029/030/031/032) into single-file feature specs under `features/<domain>/`.
- Archived `docs/specs/` (docs-redesign, superseded) and spec 034 itself (last legacy-format change).
- Rewrote all 6 SKILL.md files (transition contracts byte-identical — validate-skills passes), `references/conventions.md`, `references/workflow.md`, `AGENTS.md`, root `README.md`, and 10 docs-site pages.

## Decisions

- Completed feature specs **stay** in `features/` as source of truth — no more archiving on ship.
- RFC lifecycle: `changes/rfc-NNN-*.md` → approved → `shared/adrs/`; rejected → `archive/` + reason in README.
- `specs/memory/project-state.md` is the always-read file at session start.

## Verification

- `python3 scripts/validate-skills.py` → 6 PASS, exit 0.
- CLI: build + 97 tests pass. Dashboard: build + 65 tests pass.
- Docs build/lint blocked by pre-existing missing `node_modules` (identical failure with changes stashed).
- Grep sweep for old `specs/(changes|living|decisions)/` paths clean outside archive.
