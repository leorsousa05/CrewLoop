# Dashboard Delta: AGY Source Support

## Current State

`AgentSource` only supports `kimi`, `codex`, `opencode`, and `log-watcher`:

```ts
export type AgentSource = 'kimi' | 'codex' | 'opencode' | 'log-watcher';
```

`servers/dashboard/src/adapters/shim.ts` rejects any unknown source, so `crewloop-shim agy` exits with an error.

There is no AGY adapter in `servers/dashboard/src/adapters/`.

## Desired State

1. Add `'agy'` to `AgentSource` and to `detectSource` in the shim.
2. Add an AGY adapter (`servers/dashboard/src/adapters/agy.ts`) that converts AGY hook payloads into `DashboardEvent`.
3. Update `normalizePayload` / `buildEvent` in `shim.ts` to route `agy` to the new adapter.
4. Update `projectInvocations` in `servers/dashboard/src/lib/invocations.ts` to pair AGY `tool_start` / `tool_end` events by deterministic ID, since AGY `PostToolUse` does not repeat the tool name.

## AGY Payload Schema

AGY sends JSON on stdin with camelCase fields.

### PreToolUse

```typescript
interface AgyPreToolUsePayload {
  hook_event_name: 'PreToolUse';
  conversationId: string;
  toolCall: {
    name: string; // e.g. "run_command"
    args: Record<string, unknown>;
  };
  stepIdx: number;
  workspacePaths?: string[];
  transcriptPath?: string;
  artifactDirectoryPath?: string;
}
```

### PostToolUse

```typescript
interface AgyPostToolUsePayload {
  hook_event_name: 'PostToolUse';
  conversationId: string;
  stepIdx: number;
  error?: string;
  workspacePaths?: string[];
  transcriptPath?: string;
  artifactDirectoryPath?: string;
}
```

## Event Normalization

The adapter must produce:

```typescript
{
  id: `agy:${conversationId}:${stepIdx}`,
  timestamp: Date.now(),
  source: 'agy',
  session_id: conversationId,
  event_type: 'tool_start' | 'tool_end',
  tool: <normalized tool name>,
  detail: <extracted detail>,
  input: <PreToolUse toolCall.args>,
  output: <PostToolUse error wrapped as { error }>,
}
```

### Tool name mapping

AGY tool names are snake_case. Normalize to the internal names already used by the dashboard so that existing heuristics (e.g., git command → `shipper`) keep working:

| AGY tool name | Internal tool |
|---|---|
| `run_command` | `Bash` |
| `view_file` | `Read` |
| `write_to_file` | `Write` |
| `replace_file_content` | `Edit` |
| `multi_replace_file_content` | `Edit` |
| `list_dir` | `Glob` |
| `find_by_name` | `Glob` |
| `grep_search` | `Grep` |
| `search_web` | `WebSearch` |
| `read_url_content` | `FetchURL` |
| `ask_question` | `AskUserQuestion` |
| `generate_image` | `ReadMediaFile` |
| `manage_task` | `Task` |
| `invoke_subagent` | `Agent` |
| `define_subagent` | `Agent` |
| `manage_subagents` | `Agent` |
| `send_message` | `Agent` |
| `schedule` | `CronCreate` |
| `list_permissions` | `Bash` |
| `ask_permission` | `AskUserQuestion` |

Tools not in this table keep their original AGY name.

### Detail extraction

Use the first available field from the AGY args:

| Tool | Detail field(s) |
|---|---|
| `run_command` | `CommandLine` |
| `view_file` | `AbsolutePath` |
| `write_to_file` | `TargetFile` |
| `replace_file_content` | `TargetFile` |
| `multi_replace_file_content` | `TargetFile` |
| `list_dir` | `DirectoryPath` |
| `find_by_name` | `Pattern` |
| `grep_search` | `Query` |
| `search_web` | `query` |
| `read_url_content` | `Url` |
| default | `JSON.stringify(args)` truncated to 200 chars |

## Invocation Pairing

`projectInvocations` currently pairs `tool_start` with `tool_end` by tool name. Because AGY `PostToolUse` does not include the tool name, pairing by tool name fails.

Change the algorithm to:

1. When a `tool_start` arrives, store it in a map keyed by `event.id`.
2. When a `tool_end` arrives, look up the start by `event.id`. If found, merge them and clear the entry.
3. If no id match, fall back to the existing tool-name stack.

For AGY, both pre and post events use the same deterministic id (`agy:${conversationId}:${stepIdx}`), so they pair correctly.

## Impact

- `servers/dashboard/src/types.ts` — add `'agy'` to `AgentSource`.
- `servers/dashboard/src/adapters/shim.ts` — add `'agy'` to `detectSource`, route in `normalizePayload`.
- `servers/dashboard/src/adapters/agy.ts` — new file.
- `servers/dashboard/src/lib/invocations.ts` — pair by id first, then by tool.
- `servers/dashboard/src/tests/adapters.test.ts` — add AGY adapter tests.
- `servers/dashboard/src/tests/shim.test.ts` — add AGY source detection tests.
- `servers/dashboard/src/lib/invocations.test.ts` (if exists) or existing tests — add id-pairing tests.
