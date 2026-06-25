# CLI Spec Update: AGY hook alignment

## AGY hook configuration

AGY hooks are written to:

```
~/.gemini/config/hooks.json
```

Event names are `PreToolUse` and `PostToolUse`, matching the Antigravity docs.

The format is the same matcher-array group used by Codex:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "crewloop-shim",
            "args": ["agy", "--default-skill", "orchestrator"]
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
            "args": ["agy", "--default-skill", "orchestrator"]
          }
        ]
      }
    ]
  }
}
```

## Shim normalization

The shim normalizes AGY payloads by reading `toolName` first, then falling back to `toolCall.name`. Session id is read from `sessionId` or `session_id`.
