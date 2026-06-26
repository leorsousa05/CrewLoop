# Living Spec: CrewLoop Dashboard

## Purpose

The CrewLoop dashboard accepts normalized events from multiple agent hook sources and presents them as a unified real-time session view.

## Supported sources

| Source | Config format | Hook events |
|--------|---------------|-------------|
| `kimi` | TOML array-of-tables (`~/.kimi/config/config.toml`) | `PreToolUse` / `PostToolUse` |
| `claude` | JSON flat object (`~/.claude/config.json`) | `before_tool_use` / `after_tool_use` |
| `codex` | JSON matcher-array groups (`~/.codex/hooks.json`) | `PreToolUse` / `PostToolUse` |
| `agy` | JSON matcher-array groups (`~/.gemini/config/hooks.json`, fallback `~/.gemini/antigravity-cli/hooks.json`) | `PreToolUse` / `PostToolUse` |

The `crewloop-shim` binary dispatches on the source name passed as the first positional argument:

```bash
crewloop-shim <kimi|codex|agy|opencode|log-watcher> --default-skill orchestrator
```

For sources whose payloads do not include the event name (such as AGY), the event type can be forced with `--event-type`:

```bash
crewloop-shim agy --default-skill orchestrator --event-type tool_start
```

## Normalization

Each source adapter converts its native payload into `DashboardEvent`:

```typescript
export interface DashboardEvent {
  id: string;
  timestamp: number;
  source: AgentSource;
  session_id: string;
  event_type: EventType; // session_start | session_end | tool_start | tool_end | skill_change
  tool?: string;
  skill?: string;
  detail?: string;
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface ClientEvent {
  id: string;
  timestamp: number;
  event_type: EventType;
  tool?: string;
  detail?: string;
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
  skill?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}
```

### AGY payload

AGY sends the tool name at the top level or inside a `toolCall` object. It does not include a `hook_event_name` field, so the shim uses the `--event-type` argument from the hook command:

```typescript
interface AgyHookPayload {
  conversationId?: string;
  sessionId?: string;
  session_id?: string;
  toolName?: string;
  toolCall?: { name?: string; args?: Record<string, unknown> };
  toolInput?: Record<string, unknown>;
  toolResponse?: Record<string, unknown>;
  skill?: string;
}
```

The adapter resolves:

- `event_type` from the shim's `--event-type` argument (defaults to `tool_end`).
- `tool` from `toolName ?? toolCall?.name`.
- `session_id` from `sessionId ?? session_id ?? conversationId`.

## Security

The shim runs the raw payload through `sanitize()` before forwarding. Dangerous keys and verbose content are stripped so that agent data does not leak to the dashboard UI. The sanitizer accepts object or string `tool_response` values; plain-string responses are converted to a truncated `contentSnippet` so the UI can display them without exposing raw tool output.

### Kimi payload normalization

Kimi sends tool inputs and responses in slightly different shapes from other sources. The sanitizer normalizes them before the UI sees them:

- **Path resolution** checks `path`, `file_path`, `filePath`, nested `args.*`, and Kimi's `operations[].path` / `operations[].file_path` arrays.
- **Write tools** produce a `contentSnippet` from `content`, `text`, or `code`.
- **Edit tools** produce a unified `diff` from `old_string`/`new_string`, `oldString`/`newString`, or `old`/`new`.
- **Tool responses** produce a `contentSnippet` from, in order: `content`, `result` (string or array joined with `\n`), `stdout`, `stderr`, or `output`. The shim also accepts Kimi's `tool_output` field as an alias for `tool_response`.

## Client views

The dashboard UI is a Vercel-style command center with a persistent sidebar, a top bar, and a main content area. It exposes seven views:

1. **Overview** — high-level health cards for the selected session (active skill, telemetry, activity graph), plus cross-session summaries (total/active/pinned sessions, top skills, top tools, recent sessions).
2. **Sessions** — sortable, filterable, pinnable session list. Pinned sessions stay at the top and persist in `localStorage`.
3. **Timeline** — reverse-chronological tool invocations (newest at top). A `tool_start` and its matching `tool_end` are collapsed into one row that changes color from running (blue) to success (green) or error (red). Rows can be expanded to view sanitized `input` and `output`; rows with no details show a fallback message. Events can be copied to the clipboard or exported as JSON.
4. **Network** — interactive 3D force-directed graph (`react-force-graph-3d`) with the active skill at the center, connected to tool nodes, which in turn connect to file nodes discovered from tool input/output paths (including nested `args.path`). Nodes are colored by type (skill, tool, file) and sized by activity weight. Users can orbit, zoom, hover, and click nodes to view details. The layout respects `prefers-reduced-motion`.
5. **Files** — two-pane layout with a file list and a diff/content viewer. Selecting a file shows the latest non-empty diff or content snippet across all operations on that file, so a later `Read` does not hide an earlier `Write`/`Edit` diff.
6. **Skills** — aggregate skill, tool, and file usage for the selected session's visible invocations.
7. **Settings** — user preferences for theme (`system`/`dark`/`light`), density (`comfortable`/`compact`), reduced motion, auto-follow active session, and max events per session. Settings persist to `localStorage`.

## Command palette

A global command palette is triggered by `Cmd/Ctrl+K` or the search button in the top bar. It provides fuzzy search across views, sessions, skills, tools, files, recent events, and actions (e.g., export JSON, toggle density, open settings). Selecting an item executes its action and closes the palette. The palette traps focus while open.

## Filters

A shared filter bar appears on list and graph views. Filters apply to invocations and sessions by:

- **Source** — agent source.
- **Skill** — active skill name.
- **Status** — `running`, `success`, `error`.
- **Tool** — individual tool name.
- **Operation type** — `read`, `edit`, `other`.
- **Time range** — `1m`, `5m`, `15m`, `1h`, `24h`, `session`, or `all`.

Filter state is global and ephemeral (not persisted across reloads).

## Implementation notes

- Source adapters live in `servers/dashboard/src/adapters/`.
- Shared normalization and HTTP forwarding live in `servers/dashboard/src/adapters/shim.ts`.
- Sanitization lives in `servers/dashboard/src/filters/sanitize.ts`.
- View-model helpers live in `servers/dashboard/src/lib/` and are tested with Node's built-in test runner.
- The React UI lives in `servers/dashboard/ui/`, is built by Vite into `dist/public/`, and is served by the dashboard server on `http://127.0.0.1:7890`.
- The server exposes `POST /event` and a WebSocket for live updates.
