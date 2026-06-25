# Proposal: Fix Codex Hook Format and Relax Agent Detection

## WHY

The user confirmed that `crewloop-shim` is available globally and the dashboard is running, yet Codex events were not appearing in the dashboard. Inspection of `~/.codex/hooks.json` revealed that the hooks **were installed**, but as plain strings:

```json
{
  "hooks": {
    "before_tool_use": "crewloop-shim codex --default-skill orchestrator",
    "after_tool_use": "crewloop-shim codex --default-skill orchestrator"
  }
}
```

The reference example for Codex (`servers/dashboard/config-examples/codex-hooks.json`) shows that Codex expects hooks to be objects:

```json
{
  "hooks": {
    "before_tool_use": {
      "command": "crewloop-shim",
      "args": ["codex", "--default-skill", "orchestrator"]
    }
  }
}
```

Because the CLI writes string values, Codex does not invoke the hooks, so no events reach the dashboard.

Additionally, the agent-detection logic (`agentIsInstalled`) skips hook installation when the agent config directory does not exist. This means users who install CrewLoop before creating the agent's config dir never get hooks configured.

## Scope

1. Change JSON hook writers (Codex, Claude, AGY) to emit `{ command, args }` objects instead of plain strings.
2. Update `jsonCommandMatches` and `setJsonCommand` helpers to handle the object format correctly and idempotently.
3. Relax `agentIsInstalled` so supported agents always receive hooks; the writer will create the config directory if needed.
4. Update unit tests to assert the new object format and the relaxed detection behavior.
5. Update `AGENTS.md` if needed to mention that hooks are configured proactively.

## Constraints

- Must not break Kimi TOML hooks.
- Must remain idempotent: rerunning `crewloop install` should not duplicate entries.
- Must preserve backup behavior.
- Must keep `--no-hooks` opt-out working.
