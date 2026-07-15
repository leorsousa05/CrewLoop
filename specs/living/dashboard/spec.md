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
crewloop-shim <kimi|codex|agy|opencode|log-watcher> --default-skill crewloop-hub
```

For sources whose payloads do not include the event name (such as AGY), the event type can be forced with `--event-type`:

```bash
crewloop-shim agy --default-skill crewloop-hub --event-type tool_start
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

AGY sends JSON on stdin with camelCase fields. The payload includes `hook_event_name` (`PreToolUse` / `PostToolUse`) and a `toolCall` object on pre events:

```typescript
interface AgyHookPayload {
  hook_event_name?: 'PreToolUse' | 'PostToolUse';
  conversationId?: string;
  sessionId?: string;
  session_id?: string;
  toolName?: string;
  toolCall?: { name?: string; args?: Record<string, unknown> };
  stepIdx?: number;
  error?: string;
}
```

The adapter (`servers/dashboard/src/adapters/agy.ts`) resolves:

- `event_type` from `hook_event_name`.
- `session_id` from `conversationId ?? sessionId ?? session_id`.
- `id` as a deterministic value `agy:${session_id}:${stepIdx}` so pre/post events pair correctly even when the post event does not repeat the tool name.
- `tool` by mapping AGY snake_case names to internal names (`run_command` → `Bash`, `view_file` → `Read`, etc.).
- `detail` by extracting the primary argument for known tools (`CommandLine`, `AbsolutePath`, etc.).
- `skill` when a `Read` (`view_file`) targets a skill file whose path matches `.../skills/<skill-name>/SKILL.md`.
- `output` on `PostToolUse` from the `error` field when present.

Because AGY does not emit `session_start`, the shim applies the `--default-skill` fallback as a separate `default_skill` field on every AGY event that does not already carry an inferred or explicit skill. The state store only uses `default_skill` when the session has no active skill, so an inferred skill from a `Read` of `SKILL.md` is preserved across subsequent tool calls.

## Security

The shim runs the raw payload through `sanitize()` before forwarding. Dangerous keys and verbose content are stripped so that agent data does not leak to the dashboard UI. The sanitizer accepts object or string `tool_response` values; plain-string responses are converted to a truncated `contentSnippet` so the UI can display them without exposing raw tool output.

### Local trust boundary (ADR 005)

The dashboard is a loopback-only product, enforced in code rather than implied by bind address:

- **WebSocket Origin policy** — browser WebSocket upgrades must present an Origin matching the configured local origin (loopback host + configured port); foreign origins are rejected with 403 before any telemetry is sent. Non-browser hook clients without an Origin header are accepted.
- **Workspace filesystem policy** — `/api/workspace-files`, `/api/file-content`, and `/api/file-diff` require a `sessionId` with a known workspace root (from `workspacePath` events or the runtime root mapping). There are no repository/CWD fallbacks and no session-ID substring authorization.
- **Canonical path containment** — requested paths must be relative, resolve inside the canonical workspace root, and symlinks whose real targets escape the root are rejected (403).
- **Bounded resources** — event bodies, workspace scans (entries and depth), and file reads have configured limits (`eventBodyBytes`, `workspaceEntries`, `workspaceDepth`, `fileBytes`); violations return typed 413 errors without partial state updates.
- **Safe errors** — API errors carry stable codes (`PATH_FORBIDDEN`, `WORKSPACE_UNAVAILABLE`, `FILE_TOO_LARGE`, `BINARY_FILE_UNSUPPORTED`, `PAYLOAD_TOO_LARGE`) and never expose absolute paths or raw stderr.

### Kimi payload normalization

Kimi sends tool inputs and responses in slightly different shapes from other sources. The sanitizer normalizes them before the UI sees them:

- **Path resolution** checks path-bearing keys including `path`, `file_path`, `filePath`, `AbsolutePath`, `TargetFile`, nested `args.*`, and `operations[].path` arrays case-insensitively.
- **Write/Read tools** preserve and extract snippets or content from `diff`, `contentSnippet`, `content`, `result`, `snippet`, or `output`.
- **Edit tools** produce a unified `diff` from `old_string`/`new_string`, `oldString`/`newString`, or `old`/`new`.
- **Tool responses** preserve safe content keys (`content`, `result`, `contentsnippet`) to render code views and diffs.

## Client views

The dashboard UI is a Vercel-style command center with a persistent sidebar, a top bar (view title + session selector + connection indicator + command palette trigger), and a main content area. It exposes six views, registered centrally in `ui/src/lib/navigation.ts` (`NAV_ITEMS`):

1. **Overview** — command center for the selected session: a compact Now strip (active skill, lifecycle, confidence, source, elapsed), a dense telemetry strip (Tools, Duration, Rate/min, Files, Errors), an activity graph, a live preview of the last 5 tool invocations with an "Open timeline" entry point, and a horizontally scrollable recent-sessions strip. With zero sessions it renders an empty state.
2. **Sessions** — filterable, pinnable session list with a segmented sort control (`recent` / `duration` / `events` / `name`) driven by the URL. Pinned sessions stay at the top and persist in `localStorage`. Rows are `div[role=button]` (keyboard-operable) with a real pin button inside.
3. **Timeline** — tool invocations for the selected session. A `tool_start` and its matching `tool_end` are collapsed into one row that changes color from running (blue) to success (green) or error (red). Rows are `div[role="button"][aria-expanded]` and expand to view sanitized `input`/`output`; events can be copied to the clipboard or exported as JSON. Supports `j`/`k` row selection and `Enter` to expand/collapse. A hover-or-manual pause model buffers live updates while paused and shows a banner with the buffered count and a resume action (manual toggle: `p`).
4. **Files** — master-detail Explorer: a file tree (read/edit/other badges, `role="tree"` semantics) and a viewer that switches between code reader format (line numbers) and diff comparison format. Below the `md` breakpoint it drills down to the detail pane with a back action; the selected path lives in the URL.
5. **Skills** — sole owner of aggregate rankings: skill and tool usage bars plus a stat strip (skills, tools, files touched) for the selected session's visible invocations.
6. **Settings** — user preferences for theme (`system`/`dark`/`light`), density (`comfortable`/`compact`), reduced motion, auto-follow active session, and max events per session, plus a keyboard-shortcuts reference generated from the `SHORTCUTS` registry. Settings persist to `localStorage`.

## Navigation & routing

Navigation state lives in the URL hash (`#/view?...`), managed by `ui/src/hooks/useHashRoute.ts` and (de)serialized by `ui/src/lib/route.ts`. The route carries: `view`, `sessionId`, `filePath`, `sort`, and serialized filters (`q`, `sources`, `skills`, `statuses`, `tools`, `ops`, `time`). On mount, contexts and session selection hydrate from the URL; subsequent state changes write through to the hash (`push` for view changes, `replace` for filter mirrors), so refresh restores the exact view/session/filters/file and back/forward works. Switching views via sidebar or palette resets filters.

## Keyboard shortcuts

Global shortcuts are guarded against form fields: `⌘/Ctrl+K` opens the command palette, digits `1`–`6` switch views by position, `/` focuses the filter search, and `Esc` closes the topmost overlay. Timeline scope: `j`/`k` select rows, `Enter` expands/collapses, `p` toggles manual pause. The canonical registry is `ui/src/lib/shortcuts.ts` (`SHORTCUTS`), which also feeds the Settings reference section.

## Command palette

A global command palette is triggered by `Cmd/Ctrl+K` or the search button in the top bar. It provides fuzzy search across views (from `NAV_ITEMS`), sessions, skills, tools, files, recent events, and actions (e.g., export JSON, toggle density, open settings). Selecting an item executes its action — unified through the same `navigate` path as the sidebar — and closes the palette. The palette traps focus while open.

## Filters

A shared filter bar appears on list views. Filters apply to invocations and sessions by:

- **Source** — agent source.
- **Skill** — active skill name.
- **Status** — `running`, `success`, `error`.
- **Tool** — individual tool name.
- **Operation type** — `read`, `edit`, `other`.
- **Time range** — `1m`, `5m`, `15m`, `1h`, `24h`, `session`, or `all` (radio semantics).

Filter state is global, ephemeral (not persisted across reloads beyond the URL), and mirrored into the hash. Popovers close on `Esc` and flip to the right edge when clipped; below the `md` breakpoint the bar collapses into a bottom sheet.

## Design system

The UI uses an 8-step named type scale registered both as CSS variables (`:root` + `html.light`) and as Tailwind `fontSize` tokens: `display-2xl`, `display-xl`, `display-lg`, `heading`, `body` (13px base), `label`, `caption`, `micro`. Color tokens include `accent-strong`, `accent-subtle`, and `focus` alongside the base palette; arbitrary font-size utilities (`text-[…]`) are banned in favor of the named scale. Motion is tokenized (`sheet-in`, `sheet-scrim-in`, `banner-in`, `drill-in`, `row-in`, `fade-in`) and respects the reduced-motion setting.

## Skill inference

The dashboard does **not** guess a skill from generic tool usage. `SkillInferenceEngine` decides the active skill for a session using only these signals, in order:

1. **Explicit skill change** — `event_type: skill_change` with a known `skill`.
2. **Skill tool invocation** — `tool: Skill` with a known skill name in `detail`.
3. **Git heuristic** — `tool: Bash` with a git command (`commit`, `push`, `branch`, `merge`, `tag`, `checkout`) maps to `shipper`.
4. **Preserve existing explicit skill** — once a session has an explicit skill, it is kept until another explicit signal arrives.
5. **No match** — `activeSkill` is left undefined and the UI shows a "no active skill" state.

## Implementation notes

- Source adapters live in `servers/dashboard/src/adapters/`.
- Shared normalization and HTTP forwarding live in `servers/dashboard/src/adapters/shim.ts`.
- Sanitization lives in `servers/dashboard/src/filters/sanitize.ts`.
- View-model helpers live in `servers/dashboard/src/lib/` and are tested with Node's built-in test runner.
- The React UI lives in `servers/dashboard/ui/`, is built by Vite into `dist/public/`, and is served by the dashboard server on `http://127.0.0.1:7890`.
- The server exposes:
  - `POST /event` for receiving hooks payloads.
  - `GET /api/skills` to fetch configured skills.
  - `GET /api/workspace-files` to fetch the list of relative workspace files.
  - `GET /api/file-content?path=...` to safely fetch full file contents.
  - `GET /api/file-diff?path=...` to safely fetch uncommitted git diffs relative to HEAD.
  - A WebSocket for live updates.
