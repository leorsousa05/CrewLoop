# spec-065-install-command-package-name

---
name: spec-065-install-command-package-name
domain: 03-docs
status: active
created: 2026-10-23
completed: null
supersedes: []
---

# Install Command Uses the Published Package

## Objective

Make every install instruction point to `@archznn/crewloop-skills`, the package that actually ships the `crewloop` CLI, instead of the stale `@archznn/crewloop-cli` (frozen at 0.4.0 on npm since 2026-06-25).

## Context

- Commit `ce7340e` ("ship CLI and dashboard inside the skills package") moved the CLI into the root package; `packages/cli/package.json` is `private: true` and `.github/workflows/publish-npm.yml` publishes only `@archznn/crewloop-skills`, whose `bin` exposes `crewloop` and `crewloop-shim`.
- The CLI itself already tells users to reinstall with `npm install -g @archznn/crewloop-skills` (`packages/cli/src/cli.ts`).

## Requirements

1. Replace user-facing install commands `npm install -g @archznn/crewloop-cli` / `npm i -g @archznn/crewloop-cli` with `@archznn/crewloop-skills` in: `README.md`, `packages/cli/README.md`, `docs/public/docs/getting-started/installation.md`, `docs/public/docs/tools/cli.md`, `docs/src/components/LandingPage.tsx`, `docs/src/components/TerminalSimulator.tsx`, `specs/shared/architecture-overview.md`, and the hero CTA text in `scripts/generate_hero.py`.
2. Correct publishing descriptions that claim `@archznn/crewloop-cli` is published second: `AGENTS.md`, `packages/cli/README.md`, `docs/public/docs/contributing/publishing.md`, `specs/shared/architecture-overview.md`.
3. Label the CLI workspace in structure trees as a private workspace bundled into `@archznn/crewloop-skills` (`AGENTS.md`, `docs/public/docs/contributing/repository-structure.md`) and in descriptive intros (`packages/cli/AGENTS.md`, `docs/public/docs/tools/cli.md`).
4. Document the new `crewloop validate-specs` command (spec-064) in the CLI references `packages/cli/README.md`, `packages/cli/AGENTS.md`, and `docs/public/docs/tools/cli.md`, and fix the stale release steps in `docs/public/docs/contributing/publishing.md` (root version bump merged into `main` → `release-tag` → `publish-npm`).

## Behavior / Flow

1. A new user copies the install command from any doc and gets the current CLI.

## Constraints

- Do not rename `packages/cli/package.json` `name` (workspace identity used by `npm test --workspace=@archznn/crewloop-cli`) or change publish workflows.
- Do not touch `specs/archive/`, `specs/memory/` history, chat-logs, or test fixtures that merely use `crewloop-cli` as a temp-dir prefix.
- Deprecating `@archznn/crewloop-cli` on npm is an owner action outside this repository and out of scope.
- [Hero image]: `scripts/generate_hero.py` CTA text is updated, but `assets/images/crewloop-hero.png` is not regenerated here because the output depends on locally installed fonts. Revisit: regenerate on the machine that produced the original image.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| String in TSX is a terminal animation, not a real command | Still updated so copy-paste works |
| Mention of `crewloop-cli` as a test temp-dir prefix | Left unchanged |
| Historical records (archive, chat-logs, memory) | Left unchanged |

## Acceptance Criteria

- AC-01: Given the repository excluding `specs/archive/`, `specs/memory/`, `node_modules/`, and `dist/`, when searching for `install -g @archznn/crewloop-cli` or `i -g @archznn/crewloop-cli`, then there are no matches.
- AC-02: Given `AGENTS.md`, `packages/cli/README.md`, `docs/public/docs/contributing/publishing.md`, and `specs/shared/architecture-overview.md`, when read, then none claims that `@archznn/crewloop-cli` is published, and each states the CLI ships inside `@archznn/crewloop-skills`.
- AC-03: Given the docs site sources, when the docs build runs, then the changed TSX files still type-check (or, if dependencies are unavailable, the change is limited to string literals and recorded as such).
- AC-04: Given the three CLI reference documents, when read, then each documents `crewloop validate-specs` and `--changed`; given `publishing.md`, then it describes the automatic `release-tag` → `publish-npm` flow and no longer mentions publishing `@archznn/crewloop-cli`.

## Done When

- [x] AC-01 — proven by `git grep -nE "(install|i) -g @archznn/crewloop-cli" -- . ":!specs/archive" ":!specs/memory"` returning no matches
- [x] AC-02 — proven by `git grep -n "crewloop-cli" -- AGENTS.md packages/cli/README.md docs/public/docs/contributing/publishing.md specs/shared/architecture-overview.md` showing only workspace/private-package mentions
- [x] AC-03 — proven by `npm run build` in `docs/` or a recorded string-literal-only diff of the two TSX files
- [x] AC-04 — proven by `git grep -n "validate-specs" -- packages/cli/README.md packages/cli/AGENTS.md docs/public/docs/tools/cli.md` and `git grep -n "release-tag" -- docs/public/docs/contributing/publishing.md`
