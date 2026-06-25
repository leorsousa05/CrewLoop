# ADR 001: Hybrid Agent Instrumentation for the Real-time Dashboard

## Status

Accepted

## Context

CrewLoop needs a real-time dashboard that shows which skill is active when an agent runs. The user primarily uses three agents: Kimi Code, Codex CLI, and OpenCode. Each exposes a different instrumentation surface:

- **Kimi Code:** native PreToolUse/PostToolUse hooks via `~/.kimi-code/config.toml`.
- **Codex CLI:** native hooks via `~/.codex/hooks.json`, but PreToolUse currently fires reliably only for Bash/shell; file edits via `apply_patch` are not consistently instrumented.
- **OpenCode:** rich plugin API with `tool.execute.before/after` events and an SDK with SSE streaming.

No single instrumentation mechanism covers all three agents well.

## Decision

Adopt a **hybrid instrumentation architecture**:

1. **Local event server** as the central hub.
2. **Per-agent adapters:**
   - Kimi Code: TOML hooks calling a `crewloop-shim` binary.
   - Codex CLI: JSON hooks calling `crewloop-shim` with documented coverage gaps.
   - OpenCode: a first-party plugin connecting directly to the event server.
3. **Log watcher fallback** for scenarios where hooks are unavailable or incomplete.
4. **Skill inference** combining explicit `Skill` tool tracking with heuristic tool-to-skill mapping.

## Consequences

### Positive

- Works across all three target agents without waiting for standardization.
- Graceful degradation: when hooks miss events, log watcher or PostToolUse heuristics still provide partial coverage.
- Clear separation: the event server is agent-agnostic; adapters are agent-specific.
- Future agents can be added by writing a new adapter without changing the server.

### Negative

- More components to maintain than a single native hook system.
- Codex file-edit events will be incomplete until upstream improves hook coverage.
- Log watcher is brittle and may break with agent log format changes.
- Skill inference is heuristic and may misidentify the active skill in edge cases.

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Only native hooks | Codex coverage gaps make this insufficient. |
| Only log watcher | Too delayed and fragile; poor user experience. |
| MCP server as instrumentation | MCP is for tool extension, not reliable lifecycle observation. |
| Modify each skill to emit signals | Requires changing every `SKILL.md`; not enforceable across agents. |

## Related specs

- `specs/changes/001-real-time-skill-dashboard/`
