# Proposal: Real-time Skill Dashboard

## Why

CrewLoop is a process-driven skill bundle where multiple specialized skills (orchestrator, architect, designer, engineer, reviewer, shipper, etc.) collaborate to complete software tasks. Today, when an agent is running, the user has no visible indication of which skill is currently active, what the agent is doing, or how the workflow is progressing. This creates three problems:

1. **Lack of observability.** The user cannot see which phase of the workflow is active without reading the terminal output.
2. **Difficulty debugging flow issues.** If a skill loops, stalls, or transitions unexpectedly, there is no consolidated timeline to inspect.
3. **Missed opportunity for trust and transparency.** A live dashboard that shows the active skill, recent tool calls, and session telemetry makes the agent's behavior tangible and easier to reason about.

The project EGC (`https://github.com/Fmarzochi/EGC`) demonstrates that this is possible: it exposes a local web dashboard (`egc dashboard`) that streams agent activity in real time via hooks, a local event server, and WebSocket broadcasting. CrewLoop should provide a similar capability tailored to its role-based workflow.

## What

Add a local-first, real-time web dashboard to CrewLoop that:

- Detects which skill is active while the agent is running.
- Streams agent activity (tool calls, skill transitions, session lifecycle) to a browser.
- Displays the active skill, a timeline of events, and lightweight telemetry.
- Works with the user's current agents: Kimi Code, Codex, and OpenCode.
- Does not capture sensitive data (secrets, PII, file contents, API keys).

## Scope

### In scope

- Local event server (`crewloop dashboard`) with HTTP receiver and WebSocket broadcaster.
- Agent adapters/shims for Kimi Code, Codex CLI, and OpenCode.
- Web dashboard UI showing:
  - Currently active skill with role icon and status.
  - Event timeline (tool calls, skill transitions, session start/end).
  - Session telemetry (tool count, duration, agent source).
- Skill inference engine combining explicit `Skill` tool invocations with heuristic tool-to-skill mapping.
- Log watcher fallback for agents or scenarios where hooks are unavailable.
- Installation/config helpers for each supported agent.
- Documentation for setup and limitations.

### Out of scope

- Cloud hosting or multi-user remote access.
- Persistent long-term history database (sessions are ephemeral in memory; optional SQLite may be added later).
- Modifying existing skills to emit custom signals.
- Editing skills or running commands from the dashboard.
- Authentication/authorization.

## Constraints

- **Privacy first.** The dashboard must not receive or display tool inputs that may contain secrets (`Bash` command strings, `Write`/`Edit` file contents, MCP tool inputs, user prompts). Only tool names, status, duration, file paths, and skill names are displayed.
- **Agent coverage.** Must support Kimi Code, Codex CLI, and OpenCode. Each has different hook capabilities:
  - Kimi Code: full PreToolUse/PostToolUse hooks via `~/.kimi-code/config.toml`.
  - Codex CLI: hooks via `~/.codex/hooks.json` but PreToolUse currently fires only for Bash/shell reliably; file edits via `apply_patch` are not consistently instrumented.
  - OpenCode: rich plugin API with `tool.execute.before/after` events.
- **Local only.** Server binds to localhost by default.
- **Minimal agent overhead.** Hook commands must complete in < 50ms and fail silently so they do not block or slow the agent.
- **No new runtime dependency for the skill bundle.** The dashboard is an optional runtime component under `servers/dashboard/`.

## Success criteria

1. Running `crewloop dashboard` starts a server accessible at `http://localhost:7890`.
2. A user running Kimi Code, Codex, or OpenCode with the provided config/plugin sees skill activity appear in the dashboard within 200ms of a tool event.
3. The dashboard correctly identifies the active CrewLoop skill (orchestrator, architect, designer, engineer, reviewer, shipper, etc.) at least 90% of the time during a normal workflow.
4. No sensitive data appears in the dashboard or in transit.
5. The dashboard degrades gracefully when hooks are missing or incomplete (e.g., Codex file edits).

## Risks

| Risk | Mitigation |
|------|------------|
| Codex hooks do not cover file edits | Document limitation; rely on PostToolUse where available and log watcher fallback. |
| Skill inference is heuristic | Combine explicit `Skill` tool tracking with tool-to-skill mapping; accept "unknown" state when confidence is low. |
| Hook overhead slows agent | Fire-and-forget async shim with short timeout; ignore failures. |
| Sensitive data leak | Allowlist-based filtering in the shim; never forward `tool_input` except harmless fields like `path` or `skill`. |
| Multi-agent config conflicts | Use project-local hooks where supported and namespace env vars. |
