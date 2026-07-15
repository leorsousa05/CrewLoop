# Proposal: CLI Output and Command Redesign

## Status
- **State:** active
- **Created:** 2026-07-15
- **Author:** @opencode

## Problem Statement

The CLI currently exposes more commands than its package documentation describes, but the command surface and terminal output have not been redesigned as a coherent user experience. The parser silently ignores unknown flags, unknown commands fall through to generic help without explaining the mistake, `--port` accepts partial or invalid numbers, and command-specific help is unavailable. Install, list, and hook feedback also use inconsistent levels of detail, which makes the CLI harder to scan and less predictable for users.

This change redesigns the CLI around a minimalist UNIX-style contract: concise stdout for successful results, actionable stderr for failures, strict argument validation, stable command help, and a small set of read-only discovery commands that make the installed environment easier to inspect.

## Goals

1. Make all command output concise, consistent, and free of decorative formatting.
2. Add strict parsing for unknown commands, unknown flags, unexpected positional arguments, missing values, and invalid dashboard ports.
3. Add command-specific help for every public command.
4. Improve `install`, `list`, `help`, and error output without changing installer or hook-writer safety behavior.
5. Add `agents` as a read-only command for supported agent conventions and hook/config paths.
6. Add `doctor` as a read-only diagnostics command for package, skills, dashboard, shim, and hook configuration health.
7. Update CLI documentation (`packages/cli/README.md`, `packages/cli/AGENTS.md`, `docs/public/docs/getting-started/installation.md`) and living specs so the public command surface is accurate.

## Non-Goals

- Changing how skills are copied, symlinked, replaced, or namespaced by `installer.ts`.
- Changing hook file formats, hook commands, hook ownership rules, or backup behavior.
- Adding JSON output, color output, interactive prompts, telemetry, or network calls.
- Supporting new target agents beyond the current definitions in `agents.ts`.
- Refactoring dashboard server internals or shim event normalization.
- Resolving unrelated uncommitted changes from active specs 023 and 026; this change must layer on the current worktree without reverting them.

## Constraints

- Preserve Node.js 18 compatibility and the existing CommonJS TypeScript build.
- Preserve the public command names `install`, `list`, `dashboard`, `version`, and `help`.
- Keep `crewloop install` hook configuration enabled by default and `--no-hooks` as the opt-out.
- Keep `--dry-run` strictly read-only for both skills and hooks.
- Keep `--force` and `--symlink` semantics aligned with active spec `026-safe-skill-installation`.
- Do not modify `packages/cli/src/installer.ts` or `packages/cli/src/hooks.ts` for this redesign.
- Do not remove or rewrite unrelated changes already present in the worktree.
- Output must remain useful in non-TTY terminals: no color requirement, no emoji, no cursor control, and no interactive prompts.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Strict unknown-flag errors break scripts that relied on ignored flags | Medium | Treat this as an intentional correctness fix; error messages include usage and the offending flag |
| Splitting `cli.ts` introduces import or CommonJS build issues | Medium | Keep `cli.ts` as the thin public dispatcher and verify with `npm run typecheck`, `npm run build`, and `npm test` |
| `doctor` diagnoses hooks without duplicating writer logic | Medium | Use read-only marker detection based on the documented `crewloop-shim` / `CREWLOOP-PLUGIN` ownership rule |
| Existing tests assert the old command surface | Low | Update tests to assert the intentional new commands and command-specific help |
| Minimal install output hides details users need | Low | Add `--verbose` for per-skill and per-hook detail while keeping default output summarized |
| New docs conflict with active spec 026 while it remains unmerged | Medium | README/help wording must preserve the materialized-wrapper `--symlink` language from spec 026 |

## Success Criteria

- [ ] `crewloop --help` lists `install`, `list`, `agents`, `doctor`, `dashboard`, `version`, and `help`.
- [ ] `crewloop <command> --help` and `crewloop help <command>` show command-specific usage for every public command.
- [ ] Unknown commands, unknown flags, unexpected positional arguments, missing flag values, and invalid `--port` values fail with actionable errors.
- [ ] Default `install` output is summarized and minimal; `--verbose` restores detailed per-item output.
- [ ] `list` prints aligned `name  description` rows without a decorative heading.
- [ ] `agents` prints supported agents, hook support, skills directory, and hook config path.
- [ ] `doctor` performs read-only diagnostics and returns non-zero only for error-level findings.
- [ ] `dashboard`, `version`, install behavior, dry-run behavior, and safe installer behavior remain backward compatible.
- [ ] Hook file formats, hook commands, ownership rules, and backup behavior remain unchanged; hook configuration errors now return exit code `1` as an intentional correction.
- [ ] CLI package typecheck, build, and tests pass.

## Deferred

- Machine-readable `--json` output is deferred until a stable text contract is reviewed.
- Color and TTY-aware formatting are deferred and may never be added if the minimalist output remains sufficient.
- Shell completion generation is deferred to a separate change.
- A `hooks status` subcommand is deferred because `doctor` covers the current diagnostic need without adding a nested command parser.
- Deep semantic validation of hook config files (event coverage, legacy-format detection, current command strings) is deferred; `doctor` reports marker presence only.
