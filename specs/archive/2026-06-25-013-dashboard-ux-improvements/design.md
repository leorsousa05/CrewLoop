# Design: Dashboard UX Improvements

## Architecture

The dashboard stays a vanilla JS SPA over a WebSocket connection. The server remains a thin event store; all presentation logic (timeline collapsing, graph layout, file extraction) lives in the browser. This keeps the backend simple and lets the UI iterate without redeploying the server.

Patterns:

- **Observer** — WebSocket message handler dispatches to UI components.
- **State projection** — raw `ClientEvent[]` is projected into view models (`ToolInvocation[]`, `FileActivity[]`, `Graph`) inside the browser.
- **Strategy** — `sanitize()` uses per-tool rules to produce safe summaries.
- **Component isolation** — each major view (timeline, network, files) is a self-contained render function with its own DOM container.

## Directory structure

```
servers/dashboard/
├── public/
│   ├── index.html              # adds view tabs + containers
│   ├── styles.css              # new component styles
│   ├── app.js                  # thinner orchestrator
│   └── components/
│       ├── timeline.js         # ToolInvocation projection + render
│       ├── networkGraph.js     # node/edge graph renderer
│       ├── fileActivity.js     # file list + diff renderer
│       └── shared.js           # escapeHtml, formatTime, dom helpers
├── src/
│   ├── types.ts                # +input/output fields
│   ├── state.ts                # unchanged
│   ├── presenter.ts            # forwards input/output
│   ├── filters/
│   │   └── sanitize.ts         # returns input/output summaries
│   └── adapters/
│       └── shim.ts             # attaches sanitized input/output
```

## Data contracts

### Backend types (`src/types.ts`)

```typescript
export interface DashboardEvent {
  id: string;
  timestamp: number;
  source: AgentSource;
  session_id: string;
  event_type: EventType;
  skill?: string;
  default_skill?: string;
  tool?: string;
  detail?: string;
  status?: EventStatus;
  duration_ms?: number;
  input?: Record<string, unknown>;   // NEW
  output?: Record<string, unknown>;  // NEW
}

export interface ClientEvent {
  id: string;
  timestamp: number;
  event_type: EventType;
  tool?: string;
  detail?: string;
  status?: EventStatus;
  duration_ms?: number;
  skill?: string;
  input?: Record<string, unknown>;   // NEW
  output?: Record<string, unknown>;  // NEW
}
```

### Sanitizer contract (`src/filters/sanitize.ts`)

```typescript
export interface SanitizedToolData {
  detail: string;
  status: EventStatus | undefined;
  duration_ms: number | undefined;
  input: Record<string, unknown> | undefined;   // NEW
  output: Record<string, unknown> | undefined;  // NEW
}

export function sanitize(payload: ToolPayload, phase: 'pre' | 'post'): SanitizedToolData;
```

Rules:

- `input` is a shallow clone of `tool_input` with dangerous keys removed (no `command` strings longer than 200 chars, no `content` blobs).
- `output` is a shallow clone of `tool_response` with the same filters.
- For `Read` tools, `detail` should be the path; `input` keeps `{ path }`; `output` keeps a short `{ contentSnippet? }` if present.
- For `Bash` tools, `detail` should be the command truncated to 80 chars; `input` keeps `{ command }`; `output` keeps `{ stdoutSnippet?, exitCode? }`.
- For `Skill`/`skill_change`, `detail` should be the inferred skill name.

### Frontend view models (`public/components/timeline.js`)

```typescript
interface ToolInvocation {
  id: string;              // id of the tool_start event
  tool: string;
  status: 'running' | 'success' | 'error';
  startTime: number;
  endTime?: number;
  durationMs?: number;
  detail: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  expanded: boolean;
}
```

Projection algorithm:

1. Events arrive from the server in **newest-first** order.
2. Walk the list in that order and build invocations:
   - On `tool_start`, push a new `ToolInvocation` with status `running`.
   - On `tool_end`, find the most recent running invocation for the same `tool` and update it with status, endTime, durationMs, output.
   - On `skill_change` / `session_*`, render as non-collapsible meta rows.
3. Return the invocation list **as-is** so the UI renders newest at top.
4. Cap to `MAX_EVENTS` invocations.

### Network graph model (`public/components/networkGraph.js`)

```typescript
interface GraphNode {
  id: string;
  label: string;
  type: 'skill' | 'tool' | 'file';
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphEdge {
  source: string;
  target: string;
}
```

Build rules:

- One `skill` node: `session.activeSkill.name`.
- One `tool` node per distinct tool seen in the session.
- One `file` node per distinct file path extracted from `Read`/`Write`/`Edit` invocations.
- Edges:
  - `skill -> tool` for every tool invocation.
  - `tool -> file` when the tool's input contains a `path`.

Layout: simple force-directed simulation on `<canvas>` (no external library). Run a fixed number of iterations once when the node/edge set changes, then draw the static graph. Disable the continuous `requestAnimationFrame` loop to avoid visual shaking and CPU waste. Re-layout only when the set of nodes or edges changes, not on every state update.

### File activity model (`public/components/fileActivity.js`)

```typescript
interface FileActivity {
  id: string;
  path: string;
  type: 'read' | 'edit';
  timestamp: number;
  diff?: string;
  snippet?: string;
}
```

Path extraction fallback order:

1. `input.path`
2. `input.file_path`
3. `input.args.path`
4. `input.args.file_path`
5. `output.path`
6. `output.file_path`

Build rules:

- `read`: from `Read` invocations; `path` using the fallback order above; `snippet` from `output.contentSnippet` if present.
- `edit`: from `Write`/`Edit`/`EditFile` invocations; `path` using the fallback order above; `diff` from `output.diff` or `output.content` if present.

## Flows

### Timeline update flow

1. WebSocket `update` arrives.
2. `handleMessage` updates `state.sessions`.
3. If the timeline is hovered, the message is pushed to `state.pendingUpdate`.
4. When the mouse leaves the timeline, pending updates are applied and `renderTimeline` runs.
5. `renderTimeline` projects events into `ToolInvocation[]` (newest at top) and renders rows.
6. No auto-scroll: the list grows downward and the user controls scroll position.

### Tool row color transition

- CSS class `.timeline-item.running` uses `var(--running)` (blue).
- `.timeline-item.success` uses `var(--success)` (green).
- `.timeline-item.error` uses `var(--error)` (red).
- When a `tool_end` event updates an existing invocation, the row element is reused and the class is swapped with a 200ms transition on `background-color` and `border-color`.

### Expand/collapse details

- Clicking a timeline row toggles `invocation.expanded`.
- The row re-renders to show a `<pre>` block with sanitized `input` and `output` JSON.
- If both `input` and `output` are empty/missing, render a neutral fallback: "No details available."
- If reduced motion is preferred, the panel toggles instantly; otherwise a `grid-template-rows` transition animates the height.

## Backend changes

### `src/filters/sanitize.ts`

Extend the existing function to return `input` and `output`. Keep the current `detail`, `status`, `duration_ms` behavior. The new fields are optional and only populated when the payload contains tool input/output.

### `src/adapters/shim.ts`

In `buildEvent`, capture the sanitized `input` and `output` and attach them to the base event:

```typescript
return {
  ...base,
  detail: sanitized.detail,
  status: sanitized.status,
  duration_ms: sanitized.duration_ms,
  input: sanitized.input,
  output: sanitized.output,
};
```

### `src/presenter.ts`

`presentEvent` forwards `input` and `output`:

```typescript
return {
  ...,
  input: event.input,
  output: event.output,
};
```

## UI layout changes

`index.html` main content becomes:

```html
<div class="content">
  <nav class="view-tabs">
    <button data-view="timeline" class="view-tab active">Timeline</button>
    <button data-view="network" class="view-tab">Network</button>
    <button data-view="files" class="view-tab">Files</button>
  </nav>

  <section class="panel timeline-panel" data-view-panel="timeline">...</section>
  <section class="panel network-panel hidden" data-view-panel="network">...</section>
  <section class="panel files-panel hidden" data-view-panel="files">...</section>
</div>
```

The active skill sidebar and telemetry stay visible across views.

## Testing plan

- **Unit:** `sanitize()` returns safe `input`/`output` for Read, Bash, Skill tools.
- **Unit:** timeline projection correctly pairs `tool_start`/`tool_end` and handles interleaved events.
- **Unit:** graph builder creates expected nodes/edges from a sample session.
- **Unit:** file activity builder extracts reads and edits.
- **Manual:** run a live agent session and verify scrolling, hover pause, expansion, color transitions, network view, and file view.

## Risks and trade-offs

- **Memory:** sending input/output in every event increases WebSocket payload size. Mitigation: sanitizer truncates/snips large strings; max events per session is capped at 100.
- **Security:** showing tool input/output could expose secrets. Mitigation: sanitizer strips known dangerous keys and long content; diff view only renders escaped text.
- **Performance:** graph simulation on every update could jank. Mitigation: run layout once per structural change, then render a static graph; no continuous animation loop.
- **Deployment drift:** users may run an older globally installed `crewloop` package and not see fixes. Mitigation: after shipping, instruct users to reinstall or run the local workspace build (`npm install -g .` from repo root or `node servers/dashboard/dist/index.js`).
- **Complexity:** splitting `app.js` into components adds files. Mitigation: keep components as plain functions and a shared small helper module.
