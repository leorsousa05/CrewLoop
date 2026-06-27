# CLI Delta: AGY Hook Path

## Current State

`packages/cli/src/agents.ts` defines the AGY hook config path as:

```ts
configPath: path.join(os.homedir(), '.agy', 'config.json'),
```

`packages/cli/src/hooks.ts` writes a grouped JSON block under the `crewloop` root key:

```json
{
  "crewloop": {
    "PreToolUse": [{ "matcher": "*", "hooks": [...] }],
    "PostToolUse": [{ "matcher": "*", "hooks": [...] }]
  }
}
```

The format is already compatible with the AGY `hooks.json` schema; only the file path is wrong.

## Desired State

The AGY hook config path must be:

```ts
configPath: path.join(os.homedir(), '.gemini', 'config', 'hooks.json'),
```

The format under `crewloop` remains unchanged.

## Legacy Cleanup

`~/.agy/config.json` may contain a stale `crewloop` block from previous installs. The CLI must remove that block when installing AGY hooks. If, after removal, the file contains only an empty object, the file may be deleted to avoid leaving an unused config.

## Impact

- `packages/cli/src/agents.ts` — one line change.
- `packages/cli/src/hooks.ts` — add legacy cleanup logic for AGY.
- `packages/cli/src/tests/hooks.test.ts` — update expected AGY path and add cleanup test.
