# spec-064-cli-validate-specs

---
name: spec-064-cli-validate-specs
domain: 01-cli
status: completed
created: 2026-10-23
completed: 2026-10-23
supersedes: [spec-062-deterministic-spec-validator]
---

# CLI `validate-specs` Command

## Objective

Ship the deterministic spec validator to every CrewLoop user as `crewloop validate-specs`, implemented once in the TypeScript CLI (no Python dependency), scoped to the files a change touches so legacy specs in user projects never block a review, and remove the repository-only Python validator from spec-062.

## Context

- Rules being ported: [spec-062](../04-workflow/spec-062-deterministic-spec-validator.md) (placement and feature-spec rules) and [spec-063](../04-workflow/spec-063-bounded-project-memory.md) (project-state cap).
- CLI structure and conventions: [packages/cli/AGENTS.md](../../../packages/cli/AGENTS.md); commands live in `packages/cli/src/commands/`, flags in `src/args.ts`, help in `src/help.ts`, tests in `src/tests/` (Node test runner).
- Distribution: the CLI ships inside `@archznn/crewloop-skills` (root `package.json` `files` includes `packages/cli/dist/`); `scripts/` is not published.

## Requirements

1. New command `crewloop validate-specs [--root <dir>] [--changed <path>]... [--json]`.
   - `--root` defaults to the current working directory; the command validates `<root>/specs`.
   - `--changed` is repeatable; paths may be root-relative or absolute and are normalized to root-relative POSIX paths.
   - Exit `0` when no errors remain, `1` when at least one error remains, `2` for usage errors or a missing `<root>/specs` directory.
2. All spec-062 rules and codes are preserved (placement, filename, frontmatter, name/status/domain, required sections, Edge Cases strictness, AC mapping, links, duplicate numbers, unreadable file) plus spec-062 review fixes: non-scalar status reports `invalid-status`, UTF-8 BOM is accepted, links inside inline code are ignored, invalid link paths report `broken-link` instead of crashing, and only `spec-*.md` files are validated as feature specs (other files are `non-spec-file` warnings). Advisory warnings carried over from spec-062's implementation are listed explicitly: `missing-field` for absent `domain`/`created` and for a completed spec without a `completed` date, `invalid-date` for a non-ISO `created`, and `non-spec-file` for unexpected folders inside a domain.
3. The spec-063 project-state checks are preserved: more than 10 dated Recent decisions → error `project-state-decisions-over-limit`; more than 12,000 bytes → warning `project-state-oversized`.
4. Change scoping: when at least one `--changed` path is given, an error whose `path` is not in the changed set is downgraded to a warning (same code and message). Without `--changed`, every error counts (repository CI mode). On Windows, paths compare case-insensitively and Git Bash `/c/...` paths are accepted. A `--changed` path that does not exist adds a warning `changed-path-not-found`, so a typo cannot silently downgrade every error.
5. Output: text mode prints `LEVEL path: code: message` lines and a `PASS|FAIL <n> feature specs, <e> errors, <w> warnings` summary; `--json` prints `{"ok": boolean, "files": number, "issues": Issue[]}` where `Issue = { level: 'error' | 'warning'; path: string; code: string; message: string }`.
6. Frontmatter is parsed without new runtime dependencies: a minimal parser accepts `key: value` scalars, `null`/`~`/empty, single- or double-quoted strings (whose content may start with `[` or `{`), trailing ` # comments`, inline lists, and indented nested/list blocks under an empty-valued key. Unclosed quotes, block scalars (`|`, `>`), inline maps, and any other non-blank, non-comment line make the frontmatter `invalid-frontmatter`. Any non-plain-scalar `status` (list, nested block) is `invalid-status`.
7. Help: a `validate-specs` help topic, the command in top-level help and examples. The existing `help.test.ts` guard "does not include unplanned commands" (which asserts no `validate` text) is updated because this command is now planned.
8. Repository integration: CI `Validate specs` runs `node packages/cli/bin/crewloop.js validate-specs` after the workspace build; `scripts/validate-specs.py` and `scripts/tests/test_validate_specs.py` are deleted; `AGENTS.md` build table points to the CLI command.
9. Skill integration (installed for users):
   - Review (`automatic-verification.md`): when the `crewloop` CLI is available, run `crewloop validate-specs --changed <each changed file>`; remaining errors mark the `schema` check `failed`; when the CLI is unavailable the check is optional and recorded `unavailable` without blocking.
   - Plan pre-handoff gate: run it with `--changed <new spec path>` when available.
   - Ship: after updating the feature spec and project memory, run it with `--changed` on the touched memory/spec files when available and fix errors before committing.

## Behavior / Flow

1. `parseArgs` accepts `validate-specs` with `--root`, `--changed` (repeatable), and `--json`; unknown flags are usage errors (exit 2).
2. `runValidateSpecs` resolves root, checks `specs/`, runs the validator, applies change scoping, prints, and returns the exit code.

## Constraints

- No new runtime or dev dependencies in `packages/cli` or the root package.
- Do not change existing commands, flags, exit codes, or hook behavior.
- Do not normalize or rewrite existing specs to silence warnings.
- [Command name]: chose `validate-specs` over `specs validate` because the parser has no subcommand support and all commands are single kebab-case words. Revisit if more `specs` subcommands appear.
- [Single implementation]: chose to delete the Python validator instead of keeping two implementations that would drift.
- [Scoping default]: no `--changed` means strict whole-tree mode so this repository's CI keeps full coverage.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| `specs/` missing under `--root` | stderr message, exit 2 |
| `--root` or `--changed` without a value | Usage error, exit 2 |
| Unknown flag (e.g. `--bogus`) | Usage error, exit 2 |
| `--changed` path outside the root | Kept as given (normalized); simply matches no issue |
| `--changed` path that does not exist (typo, deleted file) | Warning `changed-path-not-found`; exit unaffected |
| `--changed` path with different case on Windows | Matches (case-insensitive on `win32` only) |
| Quoted value starting with `[` or `{` (e.g. `title: "[draft] x"`) | Accepted as a string |
| `--changed` with Windows backslashes | Normalized to POSIX before matching |
| Error in a legacy spec not in `--changed` | Downgraded to warning; exit unaffected |
| Duplicate number between a changed active spec and a legacy spec | Error stays on the changed file; the legacy file's copy is downgraded |
| Frontmatter with nested `subagents:` block | Accepted |
| Frontmatter line like `just text` | `invalid-frontmatter` |
| `status: [active]` or nested status block | `invalid-status` |
| File with UTF-8 BOM | Parsed normally |
| Non-UTF-8 bytes | `unreadable-file`, other files continue |

## Acceptance Criteria

- AC-01: Given fixture trees covering every spec-062 rule and its review fixes, when the validator runs, then it reports the same codes and levels as spec-062 defines (active vs completed strictness included), and a valid tree yields `ok: true` with no issues.
- AC-02: Given project-state fixtures with 10 and 11 dated decisions, an oversized file, a missing file, and a missing section, when the validator runs, then results match spec-063 (error only for 11, warning only for oversized, nothing otherwise).
- AC-03: Given a tree with an error in an unchanged legacy spec and `--changed` naming a clean spec, when the command runs, then it exits 0 and reports the legacy error as a warning; given `--changed` naming the broken spec, then it exits 1.
- AC-04: Given `validate-specs` with a missing `specs/`, an unknown flag, or a value flag without a value, when the CLI runs, then it exits 2.
- AC-05: Given `--json`, when the command runs, then stdout parses as `{ok, files, issues}` with the documented `Issue` fields.
- AC-06: Given `crewloop help` and `crewloop help validate-specs`, when printed, then the command, its three flags, and an example appear, and the help test suite passes with the updated guard.
- AC-07: Given this repository after the change, when `node packages/cli/bin/crewloop.js validate-specs` runs, then it exits 0; `scripts/validate-specs.py` and its test no longer exist; CI runs the CLI command.
- AC-08: Given `automatic-verification.md`, the Plan skill, and the Ship skill, when read, then each instructs running `crewloop validate-specs --changed …` when the CLI is available, and Review treats an unavailable CLI as a non-blocking `unavailable` check.

## Done When

- [x] AC-01 — proven by `npm test --workspace=@archznn/crewloop-cli` (specs-validator tests)
- [x] AC-02 — proven by `npm test --workspace=@archznn/crewloop-cli`
- [x] AC-03 — proven by `npm test --workspace=@archznn/crewloop-cli` (change-scoping tests)
- [x] AC-04 — proven by `npm test --workspace=@archznn/crewloop-cli` (args and command tests)
- [x] AC-05 — proven by `npm test --workspace=@archznn/crewloop-cli`
- [x] AC-06 — proven by `npm test --workspace=@archznn/crewloop-cli` (help tests)
- [x] AC-07 — proven by `node packages/cli/bin/crewloop.js validate-specs` (exit 0) and `python -m unittest scripts.tests.test_automated_workflow` (CI contract)
- [x] AC-08 — proven by `python -m unittest scripts.tests.test_automated_workflow`
