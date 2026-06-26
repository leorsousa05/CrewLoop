# Dashboard Spec Delta

## ADDED

- New React + TypeScript frontend source under `servers/dashboard/ui/`.
- Vite build pipeline that bundles the UI into `servers/dashboard/dist/public/`.
- Tailwind CSS design system with dark/light themes.
- Interactive 3D network graph using `react-force-graph-3d`:
  - Skill node at the center.
  - Tool nodes linked from the skill.
  - File nodes linked from tools when a path is resolved.
  - Hover highlighting, click-to-focus, and a details panel.
- New pure view-model helpers in `ui/src/lib/`:
  - `format.ts` — duration, time, escapeHtml, truncate.
  - `invocations.ts` — `projectInvocations` and `buildFileActivity`.
  - `paths.ts` — `resolvePath` (same rules as `Shared.resolvePath`).
  - `graph.ts` — `buildGraph3D`.
  - `constants.ts` — skill/source icons and type colors.
- React hooks:
  - `useWebSocket` — connect, reconnect, ping/pong.
  - `useSessions` — merge snapshots/updates into a session map.
  - `useTheme` — persist and apply dark/light/system theme.
- React components:
  - `Header`, `SessionSelector`, `ActiveSkillPanel`, `TelemetryPanel`.
  - `ActivityGraph`, `ViewTabs`, `Timeline`, `TimelineRow`.
  - `Network3D`, `NetworkDetails`, `FileActivity`, `FileList`, `FileDiff`.

## MODIFIED

- `servers/dashboard/src/server.ts` — static file root changed from `../public` to `../dist/public`. Logs a helpful error if the built UI is missing.
- `servers/dashboard/package.json` — scripts and dependencies updated for React/Vite/Tailwind build.
- `servers/dashboard/README.md` — build and run instructions updated.
- `servers/dashboard/public/` — replaced old static files with Vite entry `index.html` and any static assets (favicon, etc.).

## REMOVED

- `servers/dashboard/public/app.js`
- `servers/dashboard/public/styles.css`
- `servers/dashboard/public/components/shared.js`
- `servers/dashboard/public/components/timeline.js`
- `servers/dashboard/public/components/networkGraph.js`
- `servers/dashboard/public/components/fileActivity.js`

## Backward compatibility

- The WebSocket event contract is unchanged.
- The HTTP API (`POST /event`, `GET /api/skills`) is unchanged.
- The server startup command (`node dist/index.js`) is unchanged after a full build.
- Global binary names (`crewloop-dashboard`, `crewloop-shim`) are unchanged.

## Contracts

### `projectInvocations(events: ClientEvent[]): ToolInvocation[]`

Reverse-chronological pairing of `tool_start` and `tool_end`, newest first, capped at 100.

```ts
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

### `buildGraph3D(session, invocations): Graph3D`

```ts
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
```

Rules:

- Skill node id: `skill:<skillName>`.
- Tool node id: `tool:<toolName>`.
- File node id: `file:<path>`.
- Edges: `skill → tool` for every invocation; `tool → file` when `resolvePath(inv.input, inv.output)` returns a string.
- Weights increment on duplicate nodes/edges.

### `resolvePath(input?, output?): string | undefined`

Same resolution order as the existing `Shared.resolvePath`:

1. `input.path`
2. `input.file_path`
3. `input.filePath`
4. `input.args.path`
5. `input.args.file_path`
6. `input.args.filePath`
7. `input.operations[].path`
8. `input.operations[].file_path`
9. `output.path`
10. `output.file_path`
11. `output.args.path`
12. `output.args.file_path`

### `buildFileActivity(invocations): FileEntry[]`

Groups invocations by resolved path. `entry.snippet` is the latest non-empty `output.diff` or `output.contentSnippet` across all ops on that file.

### 3D graph rendering

Props passed to `react-force-graph-3d`:

- `graphData={graph}`
- `nodeAutoColorBy="type"` or explicit `nodeColor` mapping skill/tool/file.
- `nodeRelSize={node => Math.min(8, 4 + node.weight / 2)}`
- `nodeLabel="label"`
- `linkWidth={link => Math.max(1, link.weight)}`
- `linkDirectionalArrowLength={0}` (undirected graph)
- `onNodeClick={handleNodeClick}`
- `onNodeHover={handleNodeHover}`
- `enableNavigationControls={true}`
- `showNavInfo={false}`
- `backgroundColor="rgba(0,0,0,0)"` (transparent; canvas container provides theme background)

### Theme persistence

- Read `localStorage.getItem('crewloop-theme')` on mount.
- Valid values: `dark`, `light`, `system`.
- Default: `system`.
- Write back on toggle.
- Apply `dark` or `light` class to `<html>` based on resolved theme.

### Hover pause

- `Timeline` container sets `timelinePaused` true on `mouseenter`, false on `mouseleave`.
- While paused, incoming `snapshot`/`update` messages are queued in `pendingUpdates`.
- On `mouseleave`, queued messages are applied and the view re-renders.

## Testing requirements

- All existing server tests pass (`npm test`).
- `npm run build` succeeds on Windows.
- `npm run typecheck` passes for both server and UI TS code.
- A browser can load `http://127.0.0.1:7890/` and receive a `snapshot` WebSocket message.
- Manual smoke test: a live Kimi/Codex/AGY session populates Timeline, Network, and Files tabs.
