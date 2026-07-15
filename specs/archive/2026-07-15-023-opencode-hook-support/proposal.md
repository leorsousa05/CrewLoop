# Proposal: OpenCode Hook Support

## Status
- **State:** draft
- **Created:** 2026-07-14
- **Author:** @architect

## Problem Statement

CrewLoop currently supports hook installation for Kimi Code, Claude, Codex, and AGY via static config files (TOML/JSON). OpenCode does not expose a static hook configuration API; instead, it loads **plugins** from `~/.config/opencode/plugins/` or `.opencode/plugins/` that register event handlers like `tool.execute.before` and `tool.execute.after`. Without a plugin-based writer, CrewLoop cannot forward opencode tool-use events to the dashboard, leaving opencode users without real-time skill tracking.

## Goals

1. Add `opencode` as a first-class supported agent in the CrewLoop CLI.
2. Install a plugin file into `~/.config/opencode/plugins/crewloop.js` that forwards `tool.execute.before` and `tool.execute.after` events to the dashboard via `crewloop-shim opencode`.
3. Normalize opencode plugin payloads into standard `DashboardEvent` objects in the shim.
4. Preserve idempotency, backup, and user-plugin preservation guarantees consistent with existing agents.

## Non-Goals

- Per-project opencode plugin installation (`.opencode/plugins/`) — global only.
- Supporting opencode-specific lifecycle events beyond tool execution (e.g. `session.created`, `permission.asked`) in this iteration.
- Rewriting the dashboard's opencode adapter (`servers/dashboard/src/adapters/opencode.ts`) — it already exists and only needs payload alignment.

## Constraints

- OpenCode plugins are JavaScript/TypeScript modules loaded at startup; they must not block the agent.
- The shim expects JSON on stdin; the plugin must spawn `crewloop-shim` and pipe the payload.
- OpenCode global config directory is `~/.config/opencode/` on Linux/macOS (`%APPDATA%\opencode` on Windows).
- The CLI must remain backward-compatible with existing agents (kimi, claude, codex, agy).

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenCode plugin API changes in future versions | Medium | Pin the plugin to the documented event names (`tool.execute.before`, `tool.execute.after`); add a version comment in the generated file. |
| Plugin spawns shim synchronously and blocks opencode | High | Use `spawn` with `stdio: ['pipe', 'ignore', 'ignore']` and do not wait for exit; shim already exits silently on error. |
| User already has a `crewloop.js` plugin | Medium | Backup the existing file before overwrite; only overwrite if the file contains the CrewLoop marker comment. |
| Windows path differences for `~/.config/opencode` | Low | Use `os.homedir()` + platform-aware path resolution in `resolver.ts`. |

## Success Criteria

- [ ] `crewloop install` creates `~/.config/opencode/plugins/crewloop.js` when opencode is detected.
- [ ] The generated plugin sends `tool_start` and `tool_end` events to the dashboard via the shim.
- [ ] Reinstalling is idempotent — no duplicate plugin files, no unnecessary backups.
- [ ] Existing agents continue to pass all hook tests.
- [ ] `crewloop install --help` lists `opencode` as a supported agent.
