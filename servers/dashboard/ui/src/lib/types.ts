import type { AgentSource, ClientSession, EventStatus } from '../../../src/types';
import type { ToolInvocation } from '../../../src/lib/invocations';

export type { ToolInvocation };

export type View =
  | 'overview'
  | 'sessions'
  | 'timeline'
  | 'files'
  | 'skills'
  | 'settings';

export type Theme = 'dark' | 'light' | 'system';
export type Density = 'compact' | 'comfortable';

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

export const DEFAULT_FILTER_STATE: FilterState = {
  query: '',
  sources: [],
  skills: [],
  statuses: [],
  tools: [],
  opTypes: [],
  timeRange: 'all',
};

export interface DashboardSettings {
  theme: Theme;
  density: Density;
  reducedMotion: boolean;
  autoFollowActive: boolean;
  maxEvents: number;
}

export const DEFAULT_SETTINGS: DashboardSettings = {
  theme: 'system',
  density: 'comfortable',
  reducedMotion: false,
  autoFollowActive: true,
  maxEvents: 100,
};

export interface PinnedSession {
  id: string;
  pinnedAt: number;
}

export interface CommandPaletteItem {
  id: string;
  type: 'view' | 'session' | 'skill' | 'tool' | 'file' | 'event' | 'action';
  title: string;
  subtitle?: string;
  icon?: string;
  keywords?: string[];
  action(): void;
}

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
}

export type SessionSortKey = 'recent' | 'duration' | 'events' | 'name';

export interface SerializedFilterState {
  q: string;
  sources: string;
  skills: string;
  statuses: string;
  tools: string;
  ops: string;
  time: TimeRange;
}

export interface RouteState {
  view: View;
  sessionId: string | null;
  filters: Partial<SerializedFilterState>;
  filePath: string | null;
  sort: SessionSortKey | null;
}
