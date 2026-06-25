# Proposal: Write Codex hooks as matcher-array groups per official docs

## WHY

After fixing the event names in spec 008, the user checked the official Codex hooks documentation (https://developers.openai.com/codex/hooks) and discovered that the config shape is richer than a flat object. The correct `~/.codex/hooks.json` structure is:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim",
            "args": ["codex", "--default-skill", "orchestrator"]
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim",
            "args": ["codex", "--default-skill", "orchestrator"]
          }
        ]
      }
    ]
  }
}
```

The current CLI writes:

```json
{
  "hooks": {
    "PreToolUse": { "command": "crewloop-shim", "args": [...] }
  }
}
```

That shape is not recognized by Codex, so hooks remain `Installed 0`. The dashboard adapter already handles `PreToolUse`/`PostToolUse` payloads; only the CLI writer needs to match the documented schema.

## Scope

1. Implement a Codex-specific hook writer that emits the matcher-array group format.
2. Keep Kimi, Claude, and AGY writers unchanged (flat object/string format) until their docs confirm a different schema.
3. Ensure idempotency: do not duplicate command entries inside the nested arrays.
4. Clean up the legacy flat-object entries previously written for Codex (`PreToolUse`/`PostToolUse` as objects instead of arrays, and `before_tool_use`/`after_tool_use`).
5. Update `servers/dashboard/config-examples/codex-hooks.json` to the documented format.
6. Update CLI help text and `specs/living/cli/spec.md` to describe the Codex array format.
7. Add/update tests for the Codex writer.

## Constraints

- Must follow the official Codex schema exactly for event arrays and command objects.
- Must not alter Claude/AGY behavior.
- Must not change the dashboard adapter or shim.
