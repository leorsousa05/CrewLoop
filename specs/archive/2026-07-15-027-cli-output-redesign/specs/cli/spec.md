# Spec Delta: CLI Command Surface and Terminal Output

## Current State

The CLI is implemented primarily in `packages/cli/src/cli.ts` and exposes:

- `install` — installs skills and configures hooks by default.
- `list` — lists skill names and descriptions.
- `dashboard` — starts the dashboard server binary.
- `version` — prints the package version.
- `help` — prints top-level help.

Current output and parsing gaps:

- Unknown flags are silently ignored.
- Unknown commands print generic help but do not identify the invalid command.
- `--port abc` becomes `NaN`, and `--port 8080abc` is accepted as `8080`.
- There is no `crewloop install --help` or equivalent command-specific help.
- `list` uses a heading and two-line records, which is harder to scan than a table.
- Install output always lists installed skills and uses mixed symbols and prose.
- README and package `AGENTS.md` do not accurately describe the current command surface.
- There is no read-only diagnostic command for package root, dashboard, shim, and hooks.

## Changes

### ADDED

- `crewloop agents` — read-only command that prints supported agent IDs, hook support, skills directories, and hook config paths.
- `crewloop doctor` — read-only diagnostics for package root, skills, shim binary (file and PATH), dashboard binary/dependencies, and hook configuration markers.
- `crewloop help <command>` — command-specific help.
- `crewloop <command> --help` — command-specific help using the existing help flag.
- `--verbose` for `install` — prints per-skill and per-hook detail that is hidden from the default summarized output.
- `CliUsageError` — a parser error type for usage mistakes (exit code `2`).
- `CliUnknownCommandError` — a parser error type for unknown commands (exit code `1`), keeping `CliOptions.command` type-safe.
- Strict per-command flag validation.
- Dedicated parser, help, output, and command-handler modules so `cli.ts` becomes a thin dispatcher.
- Parser and output tests for the new command-surface contract.

### MODIFIED

- `crewloop` with no arguments → prints top-level help and returns exit code `0`.
- Unknown command → prints `error: unknown command "<name>"` plus a help hint and returns exit code `1`.
- Parser usage errors → print an actionable error plus command usage and return exit code `2`.
- `--port` → must be an integer from `1` through `65535`; partial numeric strings are rejected.
- `list` output → one aligned `name  description` row per skill, with no decorative heading.
- `install` default output → summarized counts and next action only.
- `install --dry-run` output → explicit preview lines that make the no-write guarantee visible.
- Hook output during install → summarized counts by default; `--verbose` includes per-agent status and config path.
- Hook summary counts exclude unsupported agents and include error count when present.
- Hook configuration errors during install → print actionable stderr details and return exit code `1` (intentional correction; previously they exited `0`).
- Dashboard startup output → one concise line before delegating stdio to the dashboard process.
- Error output → stderr lines begin with `error:`; warnings use `warn:`; successful diagnostics use `ok:`.
- Top-level help → includes all public commands, all options, hook behavior, and examples for the new commands.
- `packages/cli/README.md` and `packages/cli/AGENTS.md` → describe the actual public command surface.

### REMOVED

- Silent acceptance of unknown flags.
- Silent acceptance of unexpected positional arguments.
- Decorative `Available CrewLoop skills:` heading from default list output.
- Unconditional per-skill detail from default install output.

## Output Contract

### General rules

- stdout is reserved for successful results and help.
- stderr is reserved for errors.
- `doctor` warnings are printed to stdout with `warn:` because the command itself succeeded.
- No emoji, no color dependency, no progress spinners, and no cursor manipulation.
- Keep lines short enough for an 80-column terminal whenever practical.
- Error messages name the invalid value and the corrective action.

### Exit codes

| Exit code | Meaning |
|-----------|---------|
| `0` | Command succeeded, including help, version, list, agents, and doctor with warnings only |
| `1` | Runtime failure or unknown command |
| `2` | CLI usage error: unknown flag, missing value, unexpected positional argument, invalid port |

### `install`

Default success shape:

```text
installed 19 skills to /home/user/.agents/skills
hooks: 2 configured, 3 skipped
next: crewloop dashboard
```

When existing skills are skipped:

```text
installed 0 skills to /home/user/.agents/skills
skipped 19 existing skills (use --force to overwrite)
hooks: 2 configured, 3 skipped
next: crewloop dashboard
```

Hook state variants:

```text
hooks: skipped (--no-hooks)
hooks: skipped (no supported agents detected)
hooks: 1 configured, 3 skipped, 1 error
```

Dry-run shape:

```text
dry-run: would install 19 skills to /home/user/.agents/skills
dry-run: hooks would be configured for 2 agents
```

Verbose mode may add stable detail rows:

```text
+ architect
- engineer (existing)
hook: claude configured /home/user/.claude/settings.json
```

### `list`

```text
accessibility-auditor  Accessibility audit and WCAG review
architect              Software architecture and spec-writing skill
engineer               Software implementation and coding skill
```

Rows are aligned by the longest skill name and separated by two spaces. Empty descriptions leave only the skill name. Descriptions are truncated with `…` so each row fits the terminal width (`process.stdout.columns`, fallback `80`, minimum `40`).

### `agents`

```text
agent     hooks  skills dir                         hook config
kimi      yes    ~/.agents/skills                   ~/.kimi-code/config.toml
claude    yes    ~/.claude/skills                   ~/.claude/settings.json
cursor    no     ~/.cursor/rules                    -
```

The home directory is collapsed to `~` for readability.

### `doctor`

```text
ok package root: /path/to/package
ok skills: 19 found
ok shim: /path/to/crewloop-shim.js
ok shim: crewloop-shim found on PATH
ok dashboard: /path/to/crewloop-dashboard.js
warn hooks: kimi not present
ok hooks: claude present
```

- Hook checks report marker **presence** only (`present` / `not present`), not semantic validity of the config file.
- A missing `crewloop-shim` PATH entry is `warn`-level with the hint `npm install -g @archznn/crewloop-skills`.
- `error:` findings cause exit code `1`.
- `warn:` findings do not cause a non-zero exit by themselves.

## Migration Notes

No data or config migration is required. Existing hook files and installed skill layouts remain untouched unless the user separately runs `crewloop install` with the appropriate flags.

Scripts that passed previously ignored unknown flags must remove those flags or adopt the documented command options. This is an intentional strictness change because silently ignored flags can hide user mistakes.

## Backward Compatibility

Backward compatible:

- Existing command names and established flags remain available.
- `install` still defaults to hook configuration.
- `--no-hooks`, `--dry-run`, `--force`, `--symlink`, `--target`, `--skill`, and `--agent` retain their meanings.
- Installer and hook-writer public contracts remain unchanged.
- Hook file formats, hook commands, ownership rules, and backup behavior remain unchanged.

Intentionally stricter:

- Unknown flags now fail.
- Unexpected positional arguments now fail.
- Invalid or partial `--port` values now fail.
- Unknown commands now produce an explicit error before help guidance.
- Hook configuration errors during install now return exit code `1` instead of `0`.
