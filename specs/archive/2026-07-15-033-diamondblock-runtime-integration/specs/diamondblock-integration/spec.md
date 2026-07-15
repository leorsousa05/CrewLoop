# Spec Delta: DiamondBlock Integration

## Current State

- `crewloop install` copies `skills/diamondblock/SKILL.md` like any other skill and configures dashboard hooks only.
- There is no MCP installation flag, subprocess adapter, readiness check, or DiamondBlock-specific test.
- `crewloop doctor` checks package, skill count, shim, dashboard, dependencies, and hook files, but not DiamondBlock.
- The Hub says to use a “diamondblock-focused subagent” when configured without defining a direct load or capability probe.
- The DiamondBlock skill requires `session_id` and `project_id` without defining their source.
- Shipper has no wrap-up logging step.

## Changes

### ADDED

- Boolean `crewloop install --diamondblock` opt-in.
- A dedicated CLI adapter that locates `diamondblock`/`dblock`, runs official dry-run preflight, and executes official installation.
- Layered doctor results for DiamondBlock skill, executable, installer readiness, and runtime activation guidance.
- A runtime capability contract based on exposed MCP tools.
- Hub lifecycle rules for startup context, repeated memory search, and confirmed-decision persistence.
- Shipper lifecycle rule for post-push session logging outside AFK; Hub owns AFK wrap-up.
- Tests for CLI parsing, help, command construction, preflight, failures, dry-run, doctor, and workflow text.

### MODIFIED

- Install output reports DiamondBlock separately from skill and hook counts.
- `--agent` is forwarded to `diamondblock install --target` only when explicitly selected.
- `--dry-run` is forwarded to the official installer and prevents all mutations.
- Hub directly loads the DiamondBlock skill when the runtime capability set is available; ordinary explore subagents remain fallback.
- DiamondBlock identifier handling uses verified runtime/platform values and never fabricates IDs.
- Public docs explain that installing the skill is distinct from activating its MCP server.

### REMOVED

- Ambiguous wording that treats “skill installed” as equivalent to “MCP configured and active.”
- The instruction to spawn an unspecified “diamondblock-focused subagent” as the primary invocation mechanism.
- Unwired claims that Shipper normally logs sessions without a Shipper-side contract.

## Required Behavior

### CLI install

1. Without `--diamondblock`, no executable lookup or subprocess occurs.
2. With `--diamondblock`, resolve `diamondblock` first and `dblock` second.
3. Run `install --dry-run`, adding `--target <agent>` when `--agent` is present.
4. If preflight fails, emit one actionable error and stop before installing skills/hooks.
5. In CrewLoop dry-run mode, report official preflight output/status and stop without mutation.
6. In normal mode, install CrewLoop skills/hooks, then invoke official `install` with the same target.
7. If final external execution fails, return exit 1 and explicitly report that CrewLoop installation may already be complete.

### Doctor

Doctor must not equate binary presence with runtime activation:

- `diamondblock skill`: installed/missing in the selected/default skill root.
- `diamondblock binary`: executable path found/missing.
- `diamondblock installer`: dry-run preflight succeeded/failed for an optional selected target when one can be determined.
- `diamondblock runtime`: “verify in agent: expected MCP tools must be exposed”; no false `active` result from static files alone.

DiamondBlock absence is `warn`, not `error`, because it remains optional.

### Runtime lifecycle

1. At task entry, Hub checks whether the runtime tool registry exposes the required DiamondBlock context/search capabilities.
2. If available, Hub loads `diamondblock` directly and requests startup context before broad exploration.
3. Hub may return repeatedly for prior decisions, semantic memory, and codebase search.
4. Missing/stale index produces the existing manual `dblock index run` instruction.
5. Hub saves a decision only after user confirmation or acceptance into a spec/ADR, and only as a distilled non-secret record.
6. Outside AFK, Shipper invokes DiamondBlock after a successful push to log the final outcome, then DiamondBlock returns to Shipper for its ending menu.
7. In AFK, Hub performs wrap-up logging after Shipper returns control.
8. Any MCP failure produces one warning and resumes the normal flow.

## Migration Notes

Existing installations are unchanged until the user runs `crewloop install --diamondblock`. Users with manually configured DiamondBlock remain supported; the official installer is expected to be idempotent. Reinstalling skills with `--force` is independent from MCP installation.

## Backward Compatibility

The change is additive for CLI users. Existing install flags, hook ownership, skill directories, and dashboard behavior remain unchanged. Skill behavior becomes more explicit but preserves non-blocking fallback when DiamondBlock is unavailable.
