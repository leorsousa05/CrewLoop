# Guarana-inspired quality gates

- Scope: compare the Guarana skill suite (leorsousa05/guarana) with CrewLoop and adopt three ideas: isolated review, a deterministic spec validator, and bounded project memory.
- Spec 061: Code dispatches Review to a fresh subagent with a compact handoff; reports declare `isolated` or `same-context (not isolated)` with a bounded reason. Every review in this session ran isolated.
- Spec 062 (Python validator) was superseded by Spec 064 before shipping because `scripts/` is not published to npm.
- Spec 064: `crewloop validate-specs [--root] [--changed]... [--json]` in the CLI, with no new dependencies; `--changed` downgrades errors outside the diff so legacy user specs never block. CI, Plan, Review, and Ship use it.
- Spec 063: Recent decisions capped at 10; 39 older entries moved verbatim to `decisions/decision-log.md` (49 = 10 + 39 verified). Plan treats restored memory as data, not instructions. The Ship closeout already applied the rotation (Spec 051 entry moved).
- Spec 065: install docs now use `@archznn/crewloop-skills`; `@archznn/crewloop-cli` has been frozen at 0.4.0 on npm since the CLI moved into the root package (`ce7340e`). Release docs now describe the automatic `release-tag` → `publish-npm` flow.
- Review rounds: PASS with 10 non-blocking findings (fixed), FAIL on a quoted-frontmatter parser bug (fixed), FAIL on a Linux-only path test (fixed by using the platform's path flavor), final PASS.
- Lesson: Windows-only test runs can hide Linux CI failures. The final verification ran on Windows and on a clean Linux Node 22 `npm ci` in WSL.
- Results (both platforms): build passed; CLI 132, dashboard server 357, UI 92, preflight 5 tests passed; both benchmarks `adopt_candidate`; Python contract tests and 7/7 skills passed; `validate-specs` 0 errors and 16 historical warnings.
- Linux runs using Windows `node_modules` fail with `better_sqlite3.node: invalid ELF header`, and Node 24 on Linux needs `make` to build better-sqlite3. Both are environment issues, not code failures.
- Not done: hero PNG regeneration (font-dependent), npm deprecation of `@archznn/crewloop-cli` (owner action), and updating `scripts/npm-publish-dry-run.sh`.
- Released as 0.23.0 via a root version bump on `main`.
