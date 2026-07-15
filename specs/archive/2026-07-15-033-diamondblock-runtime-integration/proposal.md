# Proposal: DiamondBlock Runtime Integration and Lifecycle

## Status

- **State:** active
- **Created:** 2026-07-15
- **Author:** @opencode

## Problem Statement

CrewLoop installs the DiamondBlock skill instructions but does not install, register, detect, or diagnose the external DiamondBlock MCP server. The Hub is instructed to use DiamondBlock first only when it is configured and active, yet no concrete availability contract tells the agent how to establish that condition. In the current OpenCode environment, the skill and `diamondblock` executable exist while no MCP tools are exposed, so the Hub correctly falls back to manual exploration but gives the user no actionable explanation.

The lifecycle contract is also incomplete: startup context retrieval is aspirational, repeated semantic search is ambiguously delegated, `project_id` and `session_id` acquisition are undefined, and Shipper does not invoke `log_session` at wrap-up.

## Goals

1. Add an explicit, opt-in CrewLoop installation path that delegates MCP registration to the official DiamondBlock CLI.
2. Keep normal `crewloop install` behavior unchanged and never mutate MCP configuration silently.
3. Make `crewloop doctor` distinguish skill presence, executable readiness, installer compatibility, and runtime activation without false claims.
4. Define an unambiguous Hub contract for startup context, repeated memory search, and selective decision persistence.
5. Define non-blocking session logging after successful shipping.
6. Preserve manual indexing fallback and all mandatory CrewLoop phase boundaries.

## Non-Goals

- Reimplementing DiamondBlock's per-agent MCP configuration writers inside CrewLoop.
- Bundling or publishing the DiamondBlock server with CrewLoop.
- Configuring agents unsupported by the installed DiamondBlock CLI.
- Automatically indexing missing, stale, large, or unsafe repositories.
- Saving raw transcripts, every tool result, secrets, or unconfirmed ideas as memory.
- Making DiamondBlock mandatory for CrewLoop execution.

## User Decisions

- Installation is explicit opt-in.
- Scope is the intersection of agents supported by CrewLoop and the official DiamondBlock installer.
- The lifecycle includes startup context, repeated search, selective decision saving, and wrap-up logging.
- Implementation must not begin until the user approves this specification.

## Constraints

- `diamondblock install` is the authority for MCP config format and ownership.
- CrewLoop may call `diamondblock` or its `dblock` alias but must not infer support only from help examples.
- `crewloop install --dry-run --diamondblock` must remain mutation-free end to end.
- A requested integration failure is visible and returns non-zero; ordinary CrewLoop operation without the flag remains unaffected.
- MCP tool failure during discovery or wrap-up is a warning and never blocks delivery.
- Actual runtime activation can only be confirmed from the agent's exposed MCP tool registry, not merely from binary presence.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Official CLI changes arguments or output | High | Depend only on documented arguments and exit status; isolate subprocess adapter |
| Agent IDs differ between products | High | Pass selected ID to official dry-run preflight and report unsupported targets explicitly |
| Install partially succeeds before external failure | Medium | Run dry-run preflight before CrewLoop mutation; report partial state if execution later fails |
| Doctor claims active MCP from filesystem evidence | High | Use layered status language; runtime active requires exposed tools |
| Automatic memory creates noise or leaks data | High | Save only distilled, user-confirmed decisions; preserve sanitization and non-secret rules |
| Wrap-up logging disrupts shipping navigation | Medium | Invoke after successful push, return to Shipper, and fail open with warning |
| Index is stale or absent | Medium | Keep `dblock index run` as an explicit user action |

## Success Criteria

- [ ] Normal `crewloop install` never invokes DiamondBlock.
- [ ] `crewloop install --diamondblock` preflights and delegates to the official installer.
- [ ] `--agent` and `--dry-run` are forwarded consistently; unsupported targets fail before CrewLoop mutation.
- [ ] CLI tests never touch real agent config or the real DiamondBlock executable.
- [ ] Doctor reports absent skill, absent binary, installer readiness, and runtime verification limitations accurately.
- [ ] Hub loads DiamondBlock directly when required MCP capabilities are exposed and otherwise explains the fallback once.
- [ ] Startup context and repeated search happen before broad manual inspection when available.
- [ ] Only confirmed, distilled decisions are saved.
- [ ] Successful shipping attempts a distilled session log and returns to Shipper without blocking on failure.
- [ ] Skill validation, CLI typecheck/build/tests, and documentation checks pass.
