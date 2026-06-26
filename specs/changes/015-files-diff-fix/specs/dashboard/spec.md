# Dashboard Spec Delta

## ADDED

- `FileActivity` now computes a per-file `snippet` field that keeps the latest non-empty diff or content snippet across all operations.
- `Shared.resolvePath` now resolves file paths from the `operations[]` array used by Kimi `Read` payloads, in addition to the existing `path`, `file_path`, and nested `args` lookups.
- Unit tests covering the scenario where a `Read` after a `Write`/`Edit` would previously hide the diff.
- Unit tests covering Kimi-specific payload shapes for `Read`, `Write`, `Edit`, and `Bash` tools.

## MODIFIED

- `servers/dashboard/src/filters/sanitize.ts` — `sanitize()` now accepts `tool_response` as `unknown` and, when it is a string, creates an `output.contentSnippet` from it. This fixes agents such as Kimi that send simple tool results as plain strings.
- `servers/dashboard/src/filters/sanitize.ts` — `sanitize()` now extracts a usable content snippet from object `tool_response` values via a prioritized set of response fields: `content`, `result` (string or array joined with `\n`), `stdout`, `stderr`, and `output`. This fixes missing output for Kimi `Bash` and `Read` tools.
- `servers/dashboard/src/filters/sanitize.ts` — `addToolInputSnippet()` now builds diff/content snippets for `Write`/`Edit`/`EditFile` tools using the following input key fallbacks, in order:
  - Path: `path`, `file_path`, `filePath`.
  - Write content: `content`, `text`, `code`.
  - Edit old/new strings: `old_string`/`new_string`, `oldString`/`newString`, `old`/`new`.
- `servers/dashboard/public/components/fileActivity.js` — `buildFileActivity` now derives `file.snippet` from the most recent operation that has a snippet, instead of only the chronologically last operation. `renderFileActivity` now renders `file.snippet` in the detail panel.
- `servers/dashboard/public/components/shared.js` — `resolvePath()` now inspects `input.operations[].path` and `input.operations[].file_path` so that Kimi `Read` events are correctly grouped by file.
- `servers/dashboard/src/tests/sanitize.test.ts` — added tests for string `tool_response` handling and for object response fields `content`, `result`, `stdout`, and `output`.
- `servers/dashboard/src/tests/dashboard-components.test.ts` — added tests for snippet retention, `contentSnippet` fallback, and `operations[]` path resolution.
- `servers/dashboard/src/adapters/shim.ts` — `buildEvent()` now aliases Kimi's `tool_output` field to `tool_response` before sanitization, since Kimi `PostToolUse` payloads use `tool_output` instead of `tool_response`.

## REMOVED

- Nothing.

## Backward compatibility

- The WebSocket event contract is unchanged.
- `sanitize()` now accepts string `tool_response` values in addition to objects; this only adds optional `output.contentSnippet` for responses that previously produced no output.
- `Shared.resolvePath` and the shim were unchanged except for additional path lookups and the `tool_output` alias.

## Contracts

### Path resolution

```ts
function resolvePath(input?: unknown, output?: unknown): string | undefined
```

Resolution order:
1. `input.path` as string
2. `input.file_path` as string
3. `input.filePath` as string
4. `input.args.path` as string
5. `input.args.file_path` as string
6. `input.args.filePath` as string
7. `input.operations[].path` as string (first element)
8. `input.operations[].file_path` as string (first element)
9. `output.path` as string
10. `output.file_path` as string
11. `output.args.path` as string
12. `output.args.file_path` as string

### Response content extraction

```ts
function extractContentSnippet(response: unknown): string | undefined
```

For string responses, return the truncated string.
For object responses, check in order:
1. `response.content` string
2. `response.result` string
3. `response.result` array → join with `\n`
4. `response.stdout` string
5. `response.stderr` string
6. `response.output` string

Return `undefined` if none match or if the value is empty/whitespace-only.

### Tool-input diff/content building

```ts
function addToolInputSnippet(
  output: Record<string, unknown> | undefined,
  toolName: string,
  toolInput: Record<string, unknown> | undefined
): Record<string, unknown> | undefined
```

- For tools matching `/^(write|edit|editfile)$/i`:
  - If `output.diff` or `output.contentSnippet` already exists, do not override.
  - Write: use `toolInput.content ?? toolInput.text ?? toolInput.code`.
  - Edit: use `toolInput.old_string ?? toolInput.oldString ?? toolInput.old` and `toolInput.new_string ?? toolInput.newString ?? toolInput.new`.

### Bash output

For `Bash` post events, `output.contentSnippet` must be populated from `tool_response` using the same `extractContentSnippet` logic. The `command` detail continues to be truncated from `tool_input.command`.
