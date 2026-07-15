# Tasks: CLI Output and Command Redesign

## Setup

- [x] Create spec folder structure.
- [x] Initialize `.spec.yaml`.
- [x] Record command-surface and output contracts in `specs/cli/spec.md`.

## Parser and Help

- [x] Add `src/args.ts` with `CommandName`, `CliOptions`, `CliUsageError`, `CliUnknownCommandError`, and strict `parseArgs`.
- [x] Throw `CliUnknownCommandError` (exit `1`) for unknown commands so `CliOptions.command` stays type-safe.
- [x] Enforce per-command flags and reject unexpected positional arguments.
- [x] Validate `--port` as a whole base-10 integer from `1` through `65535`.
- [x] Add `src/help.ts` with top-level help and one help topic per public command.
- [x] Support `crewloop help <command>` and `crewloop <command> --help`.
- [x] Preserve `crewloop --help`, `crewloop -h`, `crewloop --version`, and `crewloop -v`.

## Output and Commands

- [x] Add `src/output.ts` with stdout/stderr helpers, error formatting, pluralization, and `~` path display.
- [x] Move install orchestration to `src/commands/install.ts` without modifying `installer.ts` or `hooks.ts`.
- [x] Change default install output to summarized counts plus next action.
- [x] Add `install --verbose` for per-skill and per-hook detail.
- [x] Make install dry-run output explicitly start with `dry-run:`.
- [x] Move list handling to `src/commands/list.ts` and render aligned `name  description` rows.
- [x] Move dashboard handling to `src/commands/dashboard.ts` while preserving dependency checks and spawned stdio behavior.
- [x] Add `src/commands/agents.ts` for the read-only supported-agent table.
- [x] Add `src/commands/doctor.ts` with an injectable `DoctorContext` (package-root resolution, filesystem, home dir, module resolution, PATH lookup).
- [x] Doctor checks: package root, skills, shim file, `crewloop-shim` on PATH (warn-level), dashboard binary/dependencies, hook marker presence (`present` / `not present`).
- [x] Update `src/cli.ts` to be a thin dispatcher with stable exit-code handling; `help`/`version` are dispatcher-owned.

## Testing

- [x] Add parser tests for all commands, aliases, command help, unknown flags, unexpected arguments, missing values, and port boundaries.
- [x] Add help tests for top-level sections, all command topics, options, and examples.
- [x] Add output tests for usage errors, unknown commands, pluralization, and home-path display.
- [x] Add command tests for list rows, agents rows, doctor severity/exit behavior (with injected fixtures, never the real home), install summary, install verbose detail, and dry-run wording.
- [x] Add doctor tests for package-root resolution failure, PATH-missing warning, and hook presence wording.
- [x] Update existing `cli.test.ts` expectations for the intentional new command surface.
- [x] Confirm existing installer, hooks, agents, and resolver tests remain unchanged and passing.

## Documentation

- [x] Update `packages/cli/README.md` with all commands, options, examples, and minimalist output behavior.
- [x] Update `packages/cli/AGENTS.md` so it no longer says the CLI exposes only two commands.
- [x] Update `docs/public/docs/getting-started/installation.md` with the new commands (`agents`, `doctor`) and output behavior.
- [x] Update `specs/living/cli/spec.md` with the redesigned command surface, output rules, and exit codes.
- [x] Preserve spec 026 wording for `--symlink` materialized-wrapper behavior.

## Verification

- [x] Run `npm run typecheck` in `packages/cli/`.
- [x] Run `npm run build` in `packages/cli/`.
- [x] Run `npm test` in `packages/cli/`.
- [x] Manually inspect `node bin/crewloop.js --help` output after build.
- [x] Manually inspect `node bin/crewloop.js list`, `node bin/crewloop.js agents`, and `node bin/crewloop.js doctor` output after build.
- [x] Confirm `packages/cli/src/installer.ts` and `packages/cli/src/hooks.ts` have no changes from this spec.

## Completion

- [x] Submit implementation to Reviewer.
- [x] Mark `.spec.yaml` completed only after review passes.
- [x] Archive the change only during the shipping phase.
