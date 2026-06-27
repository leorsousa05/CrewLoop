# Tasks — CrewLoop Documentation Restructure

## Phase 0 — Preparation (read before writing)

- [x] Read `references/conventions.md`
- [x] Read `references/workflow.md`
- [x] Read all 13 `skills/*/SKILL.md` (name, description, responsibilities)
- [x] Read `servers/dashboard/README.md`
- [x] Read `packages/cli/README.md`
- [x] Read `docs/docusaurus.config.js`
- [x] Read current `docs/sidebars.js`
- [x] Read current `docs/src/pages/index.js`

---

## Phase 1 — Delete obsolete files

- [x] Delete `docs/docs/intro.md`
- [x] Delete `docs/docs/why-crewloop.md`
- [x] Delete `docs/docs/concepts.md`
- [x] Delete `docs/docs/installation.md`
- [x] Delete `docs/docs/usage-examples.md`
- [x] Delete `docs/docs/contributing.md`
- [x] Delete `docs/docs/workflow/overview.md`
- [x] Delete `docs/docs/workflow/detailed-flow.md`
- [x] Delete `docs/docs/workflow/decision-trees.md`
- [x] Delete `docs/docs/workflow/artifacts.md`
- [x] Delete `docs/docs/workflow/afk-mode.md`
- [x] Delete `docs/docs/workflow/` directory (after all files removed)

---

## Phase 2 — Getting Started

- [x] Create `docs/docs/getting-started/what-is-crewloop.md`
- [x] Create `docs/docs/getting-started/why-crewloop.md`
- [x] Create `docs/docs/getting-started/installation.md` — USE `npm install -g @archznn/crewloop-cli`, no shell scripts
- [x] Create `docs/docs/getting-started/first-task.md` — end-to-end tutorial

---

## Phase 3 — Core Concepts

- [x] Create `docs/docs/concepts/skills-and-roles.md`
- [x] Create `docs/docs/concepts/workflow.md`
- [x] Create `docs/docs/concepts/specs.md`
- [x] Create `docs/docs/concepts/navigation-and-afk.md`
- [x] Create `docs/docs/concepts/conventional-commits.md`

---

## Phase 4 — Core Skills (rewrite all 6)

Each must follow the universal skill template: Role, Responsibilities, Never Does, Output Artifact (table), Concrete Example, Handoff.

- [x] Rewrite `docs/docs/core/orchestrator.md`
- [x] Rewrite `docs/docs/core/architect.md`
- [x] Rewrite `docs/docs/core/designer.md`
- [x] Rewrite `docs/docs/core/engineer.md`
- [x] Rewrite `docs/docs/core/reviewer.md`
- [x] Rewrite `docs/docs/core/shipper.md`

---

## Phase 5 — Supporting Skills (rewrite all 7)

Each must follow the universal skill template.

- [x] Rewrite `docs/docs/supporting/accessibility-auditor.md`
- [x] Rewrite `docs/docs/supporting/docs-writer.md`
- [x] Rewrite `docs/docs/supporting/maintainer.md`
- [x] Rewrite `docs/docs/supporting/product-manager.md`
- [x] Rewrite `docs/docs/supporting/researcher.md`
- [x] Rewrite `docs/docs/supporting/security-guard.md`
- [x] Rewrite `docs/docs/supporting/tester.md`

---

## Phase 6 — Tools (all new)

- [x] Create `docs/docs/tools/cli.md`
- [x] Create `docs/docs/tools/dashboard.md`
- [x] Create `docs/docs/tools/obsidian-mcp.md`

---

## Phase 7 — Contributing (rewrite)

- [x] Create `docs/docs/contributing/writing-a-skill.md`
- [x] Create `docs/docs/contributing/repository-structure.md`
- [x] Create `docs/docs/contributing/conventions.md`
- [x] Create `docs/docs/contributing/publishing.md`

---

## Phase 8 — Config files

- [x] Rewrite `docs/sidebars.js` — 5-section structure per design.md
- [x] Update `docs/docusaurus.config.js` — navbar links + footer links
- [x] Check `docs/src/pages/index.js` — update any hardcoded CTA links

---

## Phase 9 — README.md

- [x] Rewrite `README.md` (root) — per design.md contract, include obsidian-mcp in layout

---

## Phase 10 — Validation

- [x] Run `cd docs && npm run build` — must pass with zero errors
- [x] Confirm no broken internal links (Docusaurus throws on broken links)
- [x] Confirm `installation.md` has no reference to `./scripts/install.sh`
- [x] Confirm all 13 skills have pages with full template
- [x] Confirm `tools/cli.md`, `tools/dashboard.md`, `tools/obsidian-mcp.md` exist
- [x] Confirm `sidebars.js` references only existing file paths

---

## Phase 11 — Quality Check (Reviewer)

- [x] No secrets, tokens, or real credentials in any example
- [x] No AI artifacts (placeholder comments, TODO without reference, "Written by AI")
- [x] No contradictions with `references/conventions.md`
- [x] No broken links in README.md (external GitHub Pages URLs correct)
- [x] All `Docs` links in README.md tables resolve to real pages

---

## Phase 12 — Ship

- [x] Commit: `docs: restructure and rewrite public documentation`
- [x] Branch: `docs/docs-restructure`
- [x] Archive spec to `specs/archive/2026-06-27-002-docs-restructure/`
