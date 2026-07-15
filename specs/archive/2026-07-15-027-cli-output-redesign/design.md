# Design: CLI Output and Command Redesign

## Overview

The CLI will be reorganized around four boundaries: argument parsing, help rendering, command execution, and terminal output. `cli.ts` remains the public entry point, but it delegates to small modules instead of owning parsing, formatting, validation, and every command handler. The redesign intentionally keeps `installer.ts` and `hooks.ts` untouched; the CLI composes their existing public contracts and adds read-only discovery on top.

The resulting user experience is minimalist and UNIX-like: strict input validation, concise stdout, actionable stderr, stable exit codes, and no decorative formatting.

This revision incorporates the Reviewer findings: unknown commands now have a type-safe error contract, `doctor` resolves the package root itself with injectable dependencies, hook checks report presence rather than full validity, shim diagnostics include a PATH lookup, `help`/`version` are explicitly dispatcher-owned, and the public installation docs page is in scope.

## Seven Analysis Questions

1. **Domain and bounded context placement?** The change belongs to the CLI presentation and command-dispatch bounded context in `packages/cli/src/`. It does not cross into installer semantics, hook writer semantics, dashboard runtime state, or skill content.
2. **Core responsibilities of new/changed components?** The parser validates the command surface; help modules render static command documentation; command handlers orchestrate existing domain services; output helpers normalize stdout/stderr formatting; `agents` and `doctor` expose read-only environment information.
3. **Contracts to define or change?** Define `CommandName`, `CliOptions`, `CliUsageError`, `CliUnknownCommandError`, `CommandContext`, `CommandHandler`, `HelpTopic`, `DoctorContext`, and diagnostic result types. `parseArgs` becomes strict and `printHelp` accepts an optional command topic. Existing `installSkills`, `installHooks`, `resolveSkills`, `resolveAgentDir`, and `listSupportedAgents` contracts remain unchanged.
4. **Which parts need tests per TDD skip criteria?** Parsing branches, per-command flag validation, port validation, help rendering, output rendering, doctor diagnostics, and install output branches all require tests. Doctor tests must use injected filesystem/home dependencies, never the real user environment.
5. **Architecture that minimizes ambiguity?** A thin dispatcher plus Strategy-style command handlers keeps command behavior isolated. A single output module keeps phrasing and stream selection consistent. `doctor` owns its own package-root resolution through an injectable context, so it can diagnose resolution failure instead of depending on the dispatcher to resolve first.
6. **Project structure changes needed?** Add `args.ts`, `help.ts`, `output.ts`, and `commands/` modules under `packages/cli/src/`. Add focused test files while keeping `cli.test.ts` as dispatcher/backward-surface coverage. Update README, package AGENTS, the public installation docs page, and the living CLI spec.
7. **Key trade-offs?** Strict parsing may break scripts that relied on ignored flags, but silent acceptance is worse for correctness. Hook configuration errors now return exit code `1` — an intentional behavioral correction, not a compatible preservation. Splitting modules adds files but removes the current 350-line command parser/handler mix and makes the redesigned output testable.

## Proposed Directory & File Structure

```text
crewloop/
├── docs/public/docs/getting-started/
│   └── installation.md                    (Modified: new commands and output)
├── packages/cli/
│   ├── src/
│   │   ├── cli.ts                         (Modified: thin run/dispatch entry)
│   │   ├── args.ts                        (New: strict parser and usage errors)
│   │   ├── help.ts                        (New: top-level and per-command help)
│   │   ├── output.ts                      (New: stdout/stderr formatting helpers)
│   │   ├── commands/
│   │   │   ├── install.ts                 (New: install orchestration and output)
│   │   │   ├── list.ts                    (New: skill list output)
│   │   │   ├── agents.ts                  (New: supported-agent table)
│   │   │   ├── doctor.ts                  (New: read-only diagnostics)
│   │   │   └── dashboard.ts               (New: dashboard command handler)
│   │   ├── agents.ts                      (Unmodified)
│   │   ├── hooks.ts                       (Unmodified)
│   │   ├── installer.ts                   (Unmodified)
│   │   ├── resolver.ts                    (Unmodified)
│   │   └── tests/
│   │       ├── cli.test.ts                (Modified: dispatcher and compatibility)
│   │       ├── args.test.ts               (New: parser validation)
│   │       ├── help.test.ts               (New: help topics)
│   │       ├── output.test.ts             (New: formatters/streams)
│   │       ├── commands.test.ts           (New: command output behavior)
│   │       ├── agents.test.ts             (Unmodified)
│   │       ├── hooks.test.ts              (Unmodified)
│   │       ├── installer.test.ts          (Unmodified)
│   │       └── resolver.test.ts           (Unmodified)
│   ├── README.md                          (Modified)
│   └── AGENTS.md                          (Modified)
└── specs/
    ├── changes/027-cli-output-redesign/
    │   ├── .spec.yaml                     (New)
    │   ├── proposal.md                    (New)
    │   ├── design.md                      (New)
    │   ├── tasks.md                       (New)
    │   └── specs/cli/spec.md              (New)
    └── living/cli/spec.md                 (Modified after implementation)
```

## Code Architecture & Design Patterns

### [Padrões Aplicados]

- **Strategy Pattern:** each stateful command handler implements the same `CommandHandler` contract. The registry covers `install`, `list`, `agents`, `doctor`, and `dashboard`. `help` and `version` are dispatcher-owned: they need no package root or filesystem access, so registering them as strategies would add indirection without value.
- **Command/Query Separation:** `install` and `dashboard` perform commands; `list`, `agents`, `doctor`, `version`, and `help` are queries. Query handlers must not mutate the filesystem.
- **Ports & Adapters (lightweight):** command handlers depend on small context/output ports rather than writing directly to global console everywhere. `doctor` depends on an injectable `DoctorContext` (filesystem, home directory, module resolution, PATH lookup) so tests never touch the real user environment.
- **Value Objects:** `CliOptions`, `HelpTopic`, and `DoctorCheckResult` are immutable data structures that carry validated intent between parser, dispatcher, handlers, and output helpers.
- **Fail Fast:** parser rejects unknown commands, unknown flags, unexpected positional arguments, missing values, and invalid ports before any command performs filesystem work.
- **Single Responsibility:** `cli.ts` dispatches; `args.ts` parses; `help.ts` renders help; `output.ts` formats; command handlers orchestrate; installer/hooks modules retain their existing responsibilities.

## Command Surface

```typescript
export type CommandName =
  | 'install'
  | 'list'
  | 'agents'
  | 'doctor'
  | 'dashboard'
  | 'version'
  | 'help';

export interface CliOptions {
  command: CommandName;
  target?: string;
  skills?: string[];
  agent?: string;
  symlink?: boolean;
  force?: boolean;
  dryRun?: boolean;
  hooks?: boolean;
  port?: number;
  host?: string;
  verbose?: boolean;
  helpTopic?: CommandName;
}

export class CliUsageError extends Error {
  readonly exitCode: 2;
  readonly command?: CommandName;
  constructor(message: string, command?: CommandName);
}

export class CliUnknownCommandError extends Error {
  readonly exitCode: 1;
  readonly invalidCommand: string;
  constructor(invalidCommand: string);
}

export interface CommandContext {
  packageRoot: string;
  stdout: (line: string) => void;
  stderr: (line: string) => void;
}

export interface CommandHandler {
  readonly name: CommandName;
  run(options: CliOptions, context: CommandContext): Promise<number> | number;
}
```

Type-safety rule: `CliOptions.command` is always a valid `CommandName`. Unknown commands never reach the dispatcher as data — `parseArgs` throws `CliUnknownCommandError`, which the top-level `run` catches and renders through `formatUnknownCommand`.

### Parser contract

```typescript
export function parseArgs(argv: string[]): CliOptions;
export function parsePort(value: string): number;
export function isCommandName(value: string): value is CommandName;
```

Parser requirements:

- Accept the existing global forms `crewloop --help`, `crewloop -h`, `crewloop --version`, and `crewloop -v`.
- Accept `crewloop help <command>` and `crewloop <command> --help`.
- Treat `crewloop` with no command as `help` and allow the dispatcher to return `0`.
- Reject unknown command names by throwing `CliUnknownCommandError` carrying the invalid token.
- Reject unknown flags with `CliUsageError`.
- Reject unexpected positional arguments with `CliUsageError`.
- Enforce which flags are valid per command.
- Preserve repeatable `--skill`.
- `--port` accepts only base-10 digits and must be between `1` and `65535` inclusive.
- Missing flag values and values that look like another flag remain errors.

### Help contract

```typescript
export interface HelpTopic {
  name: CommandName;
  usage: string;
  summary: string;
  options: string[];
  examples: string[];
}

export function listHelpTopics(): HelpTopic[];
export function getHelpTopic(name: CommandName): HelpTopic;
export function printHelp(topic?: CommandName): string;
export function printCommandHelp(topic: CommandName): string;
```

`printHelp()` remains available for compatibility with existing tests and callers. `printCommandHelp(name)` renders one command-specific topic. Top-level help must keep the required `Hooks:` and `Examples:` sections and include all public commands.

### Output contract

```typescript
export interface Output {
  info(line: string): void;
  error(line: string): void;
}

export function formatUsageError(error: CliUsageError): string[];
export function formatUnknownCommand(command: string): string[];
export function pluralize(count: number, singular: string, plural?: string): string;
export function displayPath(pathname: string): string;
```

Output requirements:

- `formatUsageError` returns stderr-ready lines beginning with `error:` followed by `usage:` when a command is known.
- `formatUnknownCommand` returns `error: unknown command "<name>"` and `hint: run "crewloop help"`.
- `displayPath` collapses the current home directory prefix to `~`.
- No formatter adds color, emoji, or terminal control sequences.

### Diagnostic contracts

```typescript
export type DoctorLevel = 'ok' | 'warn' | 'error';

export interface DoctorCheckResult {
  level: DoctorLevel;
  label: string;
  detail: string;
}

export interface DoctorReport {
  checks: DoctorCheckResult[];
  exitCode: 0 | 1;
}

export interface DoctorContext {
  packageRoot?: string;
  resolvePackageRoot?: () => string;
  homeDir?: string;
  exists?: (path: string) => boolean;
  readFile?: (path: string) => string;
  resolveModule?: (id: string, fromDir: string) => boolean;
  findOnPath?: (binary: string) => string | undefined;
}

export function runDoctor(context: DoctorContext): DoctorReport;
```

`runDoctor` owns package-root resolution as its first check: when `packageRoot` is not provided, it calls `resolvePackageRoot()` and converts a thrown error into an `error`-level result. All package-dependent checks then report `error` with detail `skipped: package root unavailable` rather than throwing.

All `DoctorContext` dependencies have production defaults (real `fs`, `os.homedir()`, `require.resolve`, PATH search) but are injectable so tests run entirely against temporary fixtures.

Doctor checks, in stable order:

1. Package root resolves and contains `skills/`.
2. Skill manifests resolve and at least one skill exists.
3. `servers/dashboard/bin/crewloop-shim.js` exists inside the package.
4. `crewloop-shim` resolves on PATH (`warn` when missing, with hint `npm install -g @archznn/crewloop-skills`; hooks reference the bare binary name, so absence degrades the integration without breaking local install).
5. `servers/dashboard/bin/crewloop-dashboard.js` exists.
6. Dashboard dependencies resolve from the dashboard package.
7. For each hook-supported agent, the hook config exists and contains the documented CrewLoop marker (`crewloop-shim` or `CREWLOOP-PLUGIN`).

Severity rules:

- Missing dashboard binaries or dependencies are `error`-level because `crewloop dashboard` is a public command.
- Missing hook configuration is `warn`-level because hooks are only configured after install and `--no-hooks` is valid.
- Hook checks report **presence**, not semantic validity: a marker proves CrewLoop wrote the entry, not that the file parses, contains every expected event, or is free of legacy formats. Output wording uses `present` / `not present`. Deep format validation is deferred.

## Flow Diagrams

### Top-level dispatch

1. `run(argv)` calls `parseArgs`.
2. If parsing throws `CliUsageError`, render usage error to stderr and return `2`.
3. If parsing throws `CliUnknownCommandError`, render unknown-command error to stderr and return `1`.
4. `help` and `version` run directly in the dispatcher (no package root needed).
5. Resolve package root for `install`, `list`, and `dashboard`; `doctor` resolves its own root inside `runDoctor`.
6. Dispatch to the selected command handler.
7. Convert unexpected thrown errors to `error: <message>` on stderr and return `1`.

### `install`

1. Resolve package root and skill manifests.
2. Resolve target directory from `--target` or `--agent`.
3. Execute existing `installSkills` contract.
4. If hooks are enabled, execute existing `installHooks` contract.
5. Render summarized counts by default; hook counts exclude unsupported agents and include errors when present.
6. Render per-skill/per-hook details only when `--verbose` is set.
7. Return non-zero if installer or hook execution produced error-level failures.

### `list`

1. Resolve package root.
2. Resolve skill manifests.
3. Compute longest skill name for alignment.
4. Print one `name  description` row per skill.

### `agents`

1. Read `listSupportedAgents` metadata.
2. Format hook support as `yes` or `no`.
3. Collapse home prefixes in displayed paths.
4. Print one aligned row per agent.

### `doctor`

1. Build a `DoctorContext` with production defaults.
2. Run read-only checks in stable order, converting exceptions to `error` results.
3. Print checks using `ok:`, `warn:`, or `error:`.
4. Return `1` when any check is error-level; otherwise return `0`.

### `dashboard`

1. Validate parser-provided port/host.
2. Resolve package root and dashboard binary.
3. Check dashboard dependencies.
4. Print one startup line.
5. Spawn the dashboard with inherited stdio and return its exit code.

## State Management

The CLI remains stateless. Command options are immutable parser outputs. Runtime state is limited to local command-handler variables and existing `InstallResult` / `HookWriterResult` aggregates. `agents` and `doctor` do not write files, create backups, alter environment variables, or mutate agent configs.

## Error Handling

- Parser misuse returns exit code `2` and prints usage guidance.
- Unknown commands return exit code `1` via `CliUnknownCommandError` and include a help hint.
- Missing package roots, skill resolution failures, installer failures, dashboard dependency failures, and unexpected exceptions return exit code `1`.
- Hook configuration errors during install are reported on stderr and now return exit code `1`. This is an **intentional behavioral correction**, not a backward-compatible preservation: hook file formats, hook commands, ownership rules, and backup behavior are unchanged, but the exit code contract becomes honest about partial failure.
- `doctor` converts individual check failures into structured results so one failed check does not prevent later diagnostics.
- Error text should include the invalid value when available: `error: invalid --port "8080abc" (expected 1-65535)`.

## Performance Considerations

All new operations are local and linear in the number of skills or agents. `doctor` reads only small config files and uses module resolution checks already present in the dashboard command. No background process, watcher, spinner, or network request is introduced.

## Security Considerations

- `doctor` and `agents` are read-only.
- No command logs file contents; hook detection checks markers without printing config content.
- No secrets, tokens, environment variables, or agent config payloads are printed.
- Parser strictness reduces accidental operations caused by misspelled flags.
- Installer safety constraints from spec 026 remain unchanged, including no traversal through whole-directory symlinks.
- Doctor tests never read the real home directory; all paths come from injected fixtures.

## Test Plan

### Parser tests (`args.test.ts`)

- Parses every public command.
- Parses command-specific help through both `help <command>` and `<command> --help`.
- Preserves global `--help`, `-h`, `--version`, and `-v`.
- Throws `CliUnknownCommandError` (not `CliUsageError`) for unknown commands, carrying the invalid token.
- Rejects unknown flags per command.
- Rejects unexpected positional arguments.
- Rejects missing values for `--target`, `--skill`, `--agent`, `--port`, and `--host`.
- Rejects `--port abc`, `--port 8080abc`, `--port 0`, `--port 65536`, and negative values.
- Accepts `--port 1`, `--port 7890`, and `--port 65535`.
- Enforces that install-only flags are rejected for unrelated commands.

### Help tests (`help.test.ts`)

- Top-level help lists all seven commands.
- Top-level help keeps `Hooks:` and `Examples:` sections.
- Command help exists for every public command.
- Install help documents `--target`, `--skill`, `--agent`, `--symlink`, `--force`, `--dry-run`, `--hooks`, `--no-hooks`, and `--verbose`.
- Dashboard help documents `--port` and `--host`.
- New examples include `crewloop agents` and `crewloop doctor`.

### Output tests (`output.test.ts`)

- Usage errors begin with `error:` and include `usage:`.
- Unknown command errors include the invalid name and help hint.
- Home directory paths collapse to `~`.
- Pluralization handles zero, one, and many.

### Command tests (`commands.test.ts` / updated `cli.test.ts`)

- `list` prints aligned rows without the old decorative heading.
- `agents` prints every supported agent and hook support marker.
- `doctor` reports package-root resolution failure as an `error` result and marks dependent checks as skipped, all through an injected failing `resolvePackageRoot`.
- `doctor` hook checks use injected `homeDir`/filesystem fixtures and report `present` / `not present` wording.
- `doctor` reports `warn` when `crewloop-shim` is absent from PATH (injected `findOnPath` returns `undefined`) without failing the report.
- `doctor` reports error-level missing dashboard binary or dependency.
- Install dry-run output explicitly says `dry-run:` and does not claim installation happened.
- Install default output summarizes counts.
- Install `--verbose` includes per-skill and per-hook detail.
- Dispatcher returns `2` for usage errors and `1` for unknown commands.

### Verification commands

Run from `packages/cli/`:

```bash
npm run typecheck
npm run build
npm test
```

## [Estratégia de Implementação]

1. Add parser contracts and strict validation in `args.ts`, including `CliUnknownCommandError`, preserving the existing exported `parseArgs` surface through `cli.ts` or a compatibility re-export.
2. Add help topics and rendering in `help.ts`, keeping top-level `Hooks:` and `Examples:` sections.
3. Add output helpers and centralize error formatting.
4. Move install, list, and dashboard handlers into command modules without changing installer/hook internals.
5. Add the read-only `agents` command from existing agent metadata.
6. Add the read-only `doctor` command around an injectable `DoctorContext` with marker-based presence detection and PATH lookup.
7. Update `cli.ts` to dispatch through the command registry, own `help`/`version` directly, and normalize exit codes.
8. Add parser/help/output/command tests before changing documentation.
9. Update README, package AGENTS, the public installation docs page, and the living CLI spec after the command behavior passes locally.
10. Run `npm run typecheck`, `npm run build`, and `npm test` from `packages/cli/` only.

## Risk Assessment and Deferred Items

Addressed: install output, help/usage, list output, errors/validation, new commands, strict parser behavior, documentation drift, and Reviewer findings 1-8.

Deferred: JSON output, color/TTY-aware formatting, shell completions, nested `hooks status` command, deep semantic validation of hook config files, and any change to installer or hook writer internals.

Primary residual risks: scripts that accidentally passed unknown flags now fail loudly (intentional), and hook configuration errors now produce a non-zero install exit code (intentional correction). Both are documented in the spec delta and migration notes.

## Subagent Parallelization

Not approved. Parser, dispatcher, command handlers, and tests share the same command-surface contract. Parallel edits would create conflicts around `cli.ts`, command registration, and expected output strings. Implementation should proceed sequentially in one Engineer pass.
