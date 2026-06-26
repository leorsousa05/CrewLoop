# Design: Dashboard React + Tailwind + 3D Network Rewrite

## Architecture

The dashboard becomes a Vite-built React SPA served by the existing Node.js/WebSocket server. The server stays a thin event store and broadcaster; all presentation logic moves into the React app.

Patterns:

- **Component-driven UI** — each panel (Header, ActiveSkill, Telemetry, ActivityGraph, Timeline, Network3D, Files) is an isolated React component.
- **Custom hooks for side effects** — `useWebSocket`, `useSessions`, `useTheme` encapsulate stateful behavior and make components declarative.
- **Pure view-model helpers** — invocation projection, path resolution, graph building, and formatting are pure functions exported from `ui/src/lib/`. They are tested with Node's built-in test runner, just like the server helpers.
- **Controlled global state** — top-level `App` owns the session map, selected session, active tab, expanded timeline rows, selected file path, and hover-pause flag. State is passed down and updated through props/callbacks (no external store).
- **Declarative 3D scene** — `react-force-graph-3d` handles the Three.js scene, force simulation, camera controls, and raycasting.
- **Tailwind theming** — CSS variables for semantic colors are injected through `index.html`; Tailwind reads them via arbitrary values and `dark`/`light` classes on `<html>`.

## Directory structure

```
servers/dashboard/
├── bin/                          # unchanged
├── config-examples/              # unchanged
├── src/                          # server source (unchanged behavior)
│   ├── adapters/
│   ├── api/
│   ├── filters/
│   ├── skills/
│   ├── state.ts
│   ├── presenter.ts
│   ├── server.ts                 # modified: static root becomes dist/public
│   ├── types.ts
│   └── tests/                    # unchanged + possible graph helper tests
├── ui/                           # NEW React source
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── lib/
│       │   ├── types.ts          # Client* types mirrored from server types.ts
│       │   ├── format.ts         # duration, time, escapeHtml, truncate
│       │   ├── invocations.ts    # projectInvocations (reverse + collapse)
│       │   ├── paths.ts          # resolvePath with operations[] support
│       │   ├── graph.ts          # buildGraph3D
│       │   └── constants.ts      # skill icons, source icons, type colors
│       ├── hooks/
│       │   ├── useWebSocket.ts
│       │   ├── useSessions.ts
│       │   └── useTheme.ts
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── SessionSelector.tsx
│       │   ├── ActiveSkillPanel.tsx
│       │   ├── TelemetryPanel.tsx
│       │   ├── ActivityGraph.tsx
│       │   ├── ViewTabs.tsx
│       │   ├── Timeline.tsx
│       │   ├── TimelineRow.tsx
│       │   ├── Network3D.tsx
│       │   ├── NetworkDetails.tsx
│       │   ├── FileActivity.tsx
│       │   ├── FileList.tsx
│       │   ├── FileDiff.tsx
│       │   └── ui/
│       │       ├── SkillIcon.tsx
│       │       ├── StatusBadge.tsx
│       │       ├── LifecycleStrip.tsx
│       │       └── EmptyState.tsx
│       └── styles/
│           └── index.css
├── public/                       # static assets served in dev, copied to dist/public by build
├── dist/                         # server + built UI (gitignored)
│   ├── index.js
│   ├── ...
│   └── public/
│       ├── index.html
│       └── assets/
├── package.json                  # updated scripts + deps
└── README.md                     # updated run/build instructions
```

Notes:

- The old `public/app.js`, `public/components/*.js`, and `public/styles.css` are removed. `public/index.html` becomes a minimal Vite entry point.
- Any static assets that should not be processed by Vite (e.g., favicon) can live in `public/` and will be copied to `dist/public/`.

## Build and dev workflow

### Production / CI build

```bash
npm run build
```

Runs:
1. `tsc` → compiles server TS to `dist/`.
2. `vite build` → bundles UI to `dist/public/`.

Run the server:
```bash
CREWLOOP_DASHBOARD_PORT=7890 node dist/index.js
```

### Development

Option A — Vite dev server with proxy:
```bash
# terminal 1
CREWLOOP_DASHBOARD_PORT=7890 node dist/index.js
# terminal 2
npm run dev
```
Vite serves the UI on `http://127.0.0.1:5173` and proxies `/event`, `/api`, and `/ws` to port `7890`.

Option B — build UI once and use the production server:
```bash
npm run build
CREWLOOP_DASHBOARD_PORT=7890 node dist/index.js
```
Use this when testing the exact package that will be published.

## Data contracts

### ClientSession / ClientEvent (unchanged)

Mirror the server `types.ts` contracts exactly:

```typescript
export interface ClientSession {
  id: string;
  source: AgentSource;
  skill?: string;
  activeSkill?: { name: string; confidence: 'explicit' | 'heuristic' | 'unknown' };
  status?: 'running' | 'success' | 'error';
  lifecycle: 'starting' | 'running' | 'ended';
  events: ClientEvent[];
  startTime: number;
  lastActivity: number;
  endedAt?: number;
  toolCounts: Record<string, number>;
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

### ToolInvocation (view model)

```typescript
export interface ToolInvocation {
  id: string;
  tool: string;
  eventType: string;
  status: 'running' | 'success' | 'error' | string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  detail?: string;
  skill?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  meta?: boolean;
}
```

Produced by `lib/invocations.ts:projectInvocations(events)`. Same algorithm as today:

1. Reverse events.
2. Pair `tool_start` with the matching `tool_end` using a per-tool stack.
3. Cap at `MAX_EVENTS = 100`.
4. Reverse back so newest is first.

### Graph3D (view model)

```typescript
export interface GraphNode {
  id: string;
  type: 'skill' | 'tool' | 'file';
  label: string;
  weight: number;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

export interface Graph3D {
  nodes: GraphNode[];
  links: GraphLink[];
}
```

Produced by `lib/graph.ts:buildGraph3D(session, invocations)`:

1. Add a `skill:` node from `session.activeSkill?.name ?? session.skill ?? 'unknown'`.
2. For each non-meta invocation, add/weight a `tool:` node and link `skill → tool`.
3. Resolve a path from `inv.input` / `inv.output` via `resolvePath`. If found, add/weight a `file:` node and link `tool → file`.

Rendering contract for `react-force-graph-3d`:
- `graphData` receives `{ nodes: GraphNode[], links: GraphLink[] }`.
- `nodeAutoColorBy="type"` or explicit `nodeColor` callback reading `type`.
- `nodeLabel` shows the label.
- `nodeRelSize` scales with `weight` (clamped).
- `linkWidth` scales with `weight`.
- `onNodeClick` centers the camera on the node and opens the details panel.
- `onNodeHover` highlights the node and its adjacent links.

### FileActivity (view model)

```typescript
export interface FileEntry {
  path: string;
  ops: FileOp[];
  snippet?: string;
}

export interface FileOp {
  id: string;
  type: 'read' | 'edit' | 'other';
  status: string;
  timestamp: number;
  tool: string;
  snippet?: string;
}
```

Produced by `lib/invocations.ts:buildFileActivity(invocations)`:

1. Resolve path per invocation.
2. Group ops by path, sorted chronologically.
3. `entry.snippet` = latest non-empty `snippet` across ops (preserves diff when a later `Read` has no snippet).

## UI layout

Use a flex-based layout matching the current dashboard:

```
+------------------------------------------+
| Header (brand, theme toggle, sessions)   |
+------------+-----------------------------+
| Sidebar    | Content                     |
| · Active   | · Activity graph            |
| · Telemetry| · Tabs (Timeline/Network/   |
+------------+   Files)                     |
```

Responsive breakpoints:

- **Desktop (≥1024px):** sidebar fixed `w-80`, content flexes.
- **Tablet (768–1023px):** sidebar becomes full-width top section; content below.
- **Small (<768px):** stack everything; Files list becomes drill-in (selected file replaces list).

## Component responsibilities

### `App.tsx`

- Owns `sessions`, `selectedSessionId`, `activeView`, `expandedIds`, `selectedFilePath`, `timelinePaused`, `pendingUpdates`.
- Renders the outer layout and delegates panels.
- Handles WebSocket messages via `useWebSocket`.
- Applies theme class to `<html>`.

### `Header.tsx`

- Brand, theme toggle button, session selector trigger.
- Displays connection status dot.

### `SessionSelector.tsx`

- Dropdown list of sessions sorted by `lastActivity` descending.
- Marks active session with a dot.
- Closes on outside click.

### `ActiveSkillPanel.tsx`

- Shows lifecycle accent strip, skill icon, skill name, status badge, confidence badge, source.
- Empty state when no session selected.

### `TelemetryPanel.tsx`

- Tool count, duration, event rate/min.
- Duration ticks every second while session is running.

### `ActivityGraph.tsx`

- Canvas bar chart of events over time.
- Uses `useRef` + `useEffect` to draw; respects reduced motion.

### `ViewTabs.tsx`

- Tab buttons: Timeline, Network, Files.
- ARIA tabs/panels.

### `Timeline.tsx`

- Scrollable `<ul>` of `TimelineRow`.
- `onMouseEnter` sets `timelinePaused` true; `onMouseLeave` flushes pending updates.

### `TimelineRow.tsx`

- Time, status dot, tool name, detail, duration, outcome icon.
- Click toggles expansion and shows sanitized input/output payloads.

### `Network3D.tsx`

- Wraps `react-force-graph-3d`.
- Handles window resize.
- Respects reduced motion (disable auto-rotation).
- Shows `NetworkDetails` when a node is selected.

### `NetworkDetails.tsx`

- Side panel or floating card with node id, type, label, and connected neighbors.

### `FileActivity.tsx`

- Two-pane layout: `FileList` + `FileDiff`.
- Manages `selectedFilePath`.

### `FileList.tsx` / `FileDiff.tsx`

- List shows file path, op pills, latest status badge.
- Diff viewer syntax-highlights lines starting with `+`, `-`, `@@`.

## Theming

CSS variables in `ui/index.html` (injected via a `<style>` block or linked CSS):

```css
:root {
  --bg-base: #09090b;
  --bg-surface: #121214;
  --bg-elevated: #1c1c1f;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent: #22d3ee;
  --success: #4ade80;
  --error: #fb7185;
  --warning: #facc15;
  --running: #38bdf8;
}

html.light {
  --bg-base: #f8fafc;
  --bg-surface: #ffffff;
  ...
}
```

Tailwind config maps these to a custom color object so components can use `bg-surface`, `text-secondary`, etc.

## Server changes

`src/server.ts`:

- Change static root from `path.resolve(__dirname, '..', 'public')` to `path.resolve(__dirname, '..', 'dist', 'public')`.
- Keep `CONTENT_TYPES` and security path check.
- If `dist/public/index.html` is missing, log a clear message telling the user to run `npm run build`.

`package.json`:

- Update `scripts`:
  - `"build": "npm run build:server && npm run build:ui"`
  - `"build:server": "tsc"`
  - `"build:ui": "vite build"`
  - `"dev": "vite"`
  - `"typecheck": "tsc --noEmit && tsc --noEmit -p ui/tsconfig.json"`
  - `"test": "node --test dist/**/*.test.js"` (unchanged)
- Add dependencies/devDependencies:
  - `react`, `react-dom`
  - `@types/react`, `@types/react-dom`
  - `vite`, `@vitejs/plugin-react`
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `react-force-graph-3d`
  - `@phosphor-icons/react`

## Testing plan

- **Unit:** Port or keep existing Node tests for `sanitize`, `resolvePath`, and `projectInvocations`.
- **Unit:** Add tests for `buildGraph3D` to assert skill/tool/file node/link shapes.
- **Unit:** Add tests for `buildFileActivity` latest-non-empty snippet behavior.
- **Build:** `npm run build` succeeds on Windows Git Bash.
- **Integration:** Start server and load the UI in a browser; verify WebSocket connection and snapshot rendering.
- **Manual:** Run a live agent session through `crewloop-shim` and exercise Timeline, Network, Files, theme toggle, session switching.
- **Accessibility:** Tab through controls; confirm focus outlines and ARIA labels.
- **Reduced motion:** Enable OS reduced motion; confirm 3D graph does not auto-rotate.

## Risks and trade-offs

- **Bundle size:** `react-force-graph-3d` + Three.js is large. Mitigation: this is a local dev tool, not a public web app; accept the cost for the interaction quality.
- **WebGL availability:** Some environments lack GPU acceleration. Mitigation: catch renderer init errors and show a fallback message with a link to the Timeline/Files tabs.
- **React re-render performance:** Large sessions could cause jank. Mitigation: keep `MAX_EVENTS` cap, memoize expensive projections with `useMemo`, and pause updates on hover.
- **Windows path issues:** `path.sep` and `__dirname` behavior must be verified on Git Bash. Mitigation: test `npm run build` and server start locally.
- **Build complexity:** Two build steps (server + UI). Mitigation: single `npm run build` command and clear README instructions.
