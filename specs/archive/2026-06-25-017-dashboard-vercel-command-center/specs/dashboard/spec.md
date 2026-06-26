# Dashboard Spec Delta

## ADDED

- Vercel-style command-center chrome:
  - `Sidebar` — persistent vertical navigation for the seven views.
  - `TopBar` — brand, breadcrumb, command-palette trigger, connection status, theme toggle.
  - `CommandPalette` — global `Cmd/Ctrl+K` modal search over views, sessions, skills, tools, files, events, and actions.
  - `FilterBar` — shared filter controls for source, skill, status, time, tool, and operation type.
  - `ViewHeader` — per-view title and actions.
- Seven top-level views under `ui/src/components/views/`:
  - `Overview` — dashboard health summary, active sessions, telemetry, activity sparkline.
  - `SessionsView` — sortable, filterable, pinnable session list.
  - `TimelineView` — existing Timeline wrapped with filters, export, and copy actions.
  - `NetworkView` — existing 3D network wrapped with filter-aware graph.
  - `FilesView` — existing two-pane file activity wrapped with filters.
  - `SkillsView` — aggregate skill/tool/file usage across visible sessions.
  - `SettingsView` — theme, density, reduced motion, auto-follow, max events.
- New state contexts under `ui/src/contexts/`:
  - `FilterContext` and `useFilters`.
  - `SettingsContext` and `useSettings`.
  - `PinnedSessionsContext` and `usePinnedSessions`.
- New hooks under `ui/src/hooks/`:
  - `useCommandPalette`.
  - `useKeyboardShortcut`.
- New pure helpers under `ui/src/lib/`:
  - `search.ts` — fuzzy search and invocation text matching.
  - `filter.ts` — filter predicates and option builders.
  - `export.ts` — JSON export controller.
  - `settings.ts` — settings schema, defaults, and localStorage migration.
- View icon constants added to `ui/src/lib/constants.ts`.

## MODIFIED

- `ui/src/App.tsx` — rewritten to render the new chrome (Sidebar + TopBar) and route between views via a `View` union. Wraps children in providers.
- `ui/src/components/Timeline.tsx` — consumes `FilterContext` and density classes; receives filtered invocations.
- `ui/src/components/TimelineRow.tsx` — adds copy-to-clipboard action and density-aware sizing.
- `ui/src/components/Network3D.tsx` — accepts a filtered graph; hides unmatched tool/file nodes while preserving the skill root.
- `ui/src/components/FileActivity.tsx` — consumes filtered invocations.
- `ui/src/components/FileList.tsx` — applies density classes.
- `ui/src/components/SessionSelector.tsx` — respects pinned-session ordering.
- `ui/src/lib/types.ts` — extends local types with `View`, `FilterState`, `DashboardSettings`, `PinnedSession`, `CommandPaletteItem`, and related helper return types.
- `servers/dashboard/README.md` — documents new views, command palette, shortcuts, filters, and settings.

## REMOVED

- `ui/src/components/Header.tsx` — responsibilities merged into `TopBar`.
- `ui/src/components/ViewTabs.tsx` — responsibilities replaced by `Sidebar`.

## Backward compatibility

- The WebSocket event contract is unchanged.
- The HTTP API (`POST /event`, `GET /api/skills`) is unchanged.
- The server startup command (`node dist/index.js`) is unchanged after a full build.
- Global binary names (`crewloop-dashboard`, `crewloop-shim`) are unchanged.
- Existing localStorage key `crewloop-theme` may be deprecated; `useSettings` should read it as a fallback when no `crewloop-dashboard-settings` entry exists.

## Contracts

### View

```typescript
export type View =
  | 'overview'
  | 'sessions'
  | 'timeline'
  | 'network'
  | 'files'
  | 'skills'
  | 'settings';
```

### FilterState

```typescript
export type TimeRange =
  | 'all'
  | '1m'
  | '5m'
  | '15m'
  | '1h'
  | '24h'
  | 'session';

export interface FilterState {
  query: string;
  sources: AgentSource[];
  skills: string[];
  statuses: EventStatus[];
  tools: string[];
  opTypes: ('read' | 'edit' | 'other')[];
  timeRange: TimeRange;
}
```

### DashboardSettings

```typescript
export type Theme = 'dark' | 'light' | 'system';
export type Density = 'compact' | 'comfortable';

export interface DashboardSettings {
  theme: Theme;
  density: Density;
  reducedMotion: boolean;
  autoFollowActive: boolean;
  maxEvents: number;
}
```

### PinnedSession

```typescript
export interface PinnedSession {
  id: string;
  pinnedAt: number;
}
```

### CommandPaletteItem

```typescript
export interface CommandPaletteItem {
  id: string;
  type: 'view' | 'session' | 'skill' | 'tool' | 'file' | 'event' | 'action';
  title: string;
  subtitle?: string;
  icon?: string;
  keywords?: string[];
  action(): void;
}
```

### Filter engine

```typescript
export interface FilterOptions {
  sources: AgentSource[];
  skills: string[];
  statuses: EventStatus[];
  tools: string[];
  opTypes: ('read' | 'edit' | 'other')[];
}

export interface FilterEngine {
  buildOptions(
    sessions: Map<string, ClientSession>,
    selectedSessionId: string | null
  ): FilterOptions;

  filterInvocations(
    invocations: ToolInvocation[],
    session: ClientSession | undefined,
    filters: FilterState,
    now: number
  ): ToolInvocation[];

  filterSessions(
    sessions: ClientSession[],
    filters: FilterState,
    pins: PinnedSession[],
    now: number
  ): ClientSession[];

  filterGraph(
    graph: Graph3D,
    invocations: ToolInvocation[],
    filters: FilterState
  ): Graph3D;
}
```

### Search engine

```typescript
export interface SearchEngine {
  score(item: CommandPaletteItem, query: string): number;
  search(items: CommandPaletteItem[], query: string): CommandPaletteItem[];
  matchesInvocation(inv: ToolInvocation, query: string): boolean;
}
```

### Export controller

```typescript
export interface ExportableEvent {
  id: string;
  timestamp: number;
  tool?: string;
  eventType: string;
  status: string;
  skill?: string;
  detail?: string;
  path?: string;
  durationMs?: number;
}

export interface ExportController {
  toJson(events: ExportableEvent[]): Blob;
  download(blob: Blob, filename: string): void;
  filename(extension: 'json'): string;
}
```

### Settings store

```typescript
export interface SettingsStore {
  load(): DashboardSettings;
  save(settings: DashboardSettings): void;
  migrate(partial: unknown): DashboardSettings;
}
```

## Testing requirements

- All existing server tests pass (`npm test`).
- `npm run build` succeeds and produces `servers/dashboard/dist/public/`.
- `npm run typecheck` passes for both server and UI TypeScript code.
- New Vitest tests cover `filter.ts`, `search.ts`, `export.ts`, and `settings.ts`.
- A browser can load `http://127.0.0.1:7890/` and navigate through all seven views.
- Manual smoke test: live agent session populates Overview, Sessions, Timeline, Network, Files, and Skills views; filters, command palette, pinning, export, copy, density, and settings all work.
