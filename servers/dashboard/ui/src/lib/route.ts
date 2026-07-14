import type { AgentSource, EventStatus } from '../../../src/types';
import type { FilterState, RouteState, SerializedFilterState, SessionSortKey, TimeRange, View } from './types';
import { NAV_ITEMS } from './navigation';

const VALID_VIEWS = NAV_ITEMS.map((i) => i.key) as View[];
const VALID_TIME_RANGES: TimeRange[] = ['all', '1m', '5m', '15m', '1h', '24h', 'session'];
const VALID_OPS = ['read', 'edit', 'other'];
const VALID_SOURCES: AgentSource[] = ['kimi', 'claude', 'codex', 'opencode', 'log-watcher', 'agy'];
const VALID_STATUSES: EventStatus[] = ['running', 'success', 'error'];
const VALID_SORTS: SessionSortKey[] = ['recent', 'duration', 'events', 'name'];

export const DEFAULT_ROUTE: RouteState = {
  view: 'overview',
  sessionId: null,
  filters: {},
  filePath: null,
  sort: null,
};

function filterCsv(value: string | null, valid: readonly string[]): string | undefined {
  if (!value) return undefined;
  const kept = value.split(',').filter((v) => valid.includes(v));
  return kept.length > 0 ? kept.join(',') : undefined;
}

export function parseRoute(hash: string): RouteState {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const [pathPart, queryPart] = raw.split('?');
  const segments = (pathPart || '').split('/').filter(Boolean);
  const view = segments[0] as View | undefined;
  if (!view || !VALID_VIEWS.includes(view)) return DEFAULT_ROUTE;

  const params = new URLSearchParams(queryPart || '');
  const filters: Partial<SerializedFilterState> = {};

  const q = params.get('q');
  if (q) filters.q = q;
  const sources = filterCsv(params.get('sources'), VALID_SOURCES);
  if (sources) filters.sources = sources;
  const skills = params.get('skills');
  if (skills) filters.skills = skills;
  const statuses = filterCsv(params.get('statuses'), VALID_STATUSES);
  if (statuses) filters.statuses = statuses;
  const tools = params.get('tools');
  if (tools) filters.tools = tools;
  const ops = filterCsv(params.get('ops'), VALID_OPS);
  if (ops) filters.ops = ops;
  const time = params.get('time');
  if (time && VALID_TIME_RANGES.includes(time as TimeRange)) filters.time = time as TimeRange;

  const sessionId = params.get('session');
  const filePath = params.get('file');
  const sort = params.get('sort');

  return {
    view,
    sessionId: sessionId || null,
    filters,
    filePath: filePath || null,
    sort: sort && VALID_SORTS.includes(sort as SessionSortKey) ? (sort as SessionSortKey) : null,
  };
}

export function serializeRoute(state: RouteState): string {
  const params = new URLSearchParams();
  const f = state.filters;
  if (f.q) params.set('q', f.q);
  if (f.sources) params.set('sources', f.sources);
  if (f.skills) params.set('skills', f.skills);
  if (f.statuses) params.set('statuses', f.statuses);
  if (f.tools) params.set('tools', f.tools);
  if (f.ops) params.set('ops', f.ops);
  if (f.time && f.time !== 'all') params.set('time', f.time);
  if (state.sessionId) params.set('session', state.sessionId);
  if (state.filePath) params.set('file', state.filePath);
  if (state.sort && state.sort !== 'recent') params.set('sort', state.sort);
  const query = params.toString();
  return `#/${state.view}${query ? `?${query}` : ''}`;
}

export function filtersToQuery(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.sources.length > 0) params.set('sources', filters.sources.join(','));
  if (filters.skills.length > 0) params.set('skills', filters.skills.join(','));
  if (filters.statuses.length > 0) params.set('statuses', filters.statuses.join(','));
  if (filters.tools.length > 0) params.set('tools', filters.tools.join(','));
  if (filters.opTypes.length > 0) params.set('ops', filters.opTypes.join(','));
  if (filters.timeRange !== 'all') params.set('time', filters.timeRange);
  return params;
}

export function filtersFromQuery(params: URLSearchParams): Partial<FilterState> {
  const out: Partial<FilterState> = {};
  const q = params.get('q');
  if (q) out.query = q;
  const sources = filterCsv(params.get('sources'), VALID_SOURCES);
  if (sources) out.sources = sources.split(',') as AgentSource[];
  const skills = params.get('skills');
  if (skills) out.skills = skills.split(',');
  const statuses = filterCsv(params.get('statuses'), VALID_STATUSES);
  if (statuses) out.statuses = statuses.split(',') as EventStatus[];
  const tools = params.get('tools');
  if (tools) out.tools = tools.split(',');
  const ops = filterCsv(params.get('ops'), VALID_OPS);
  if (ops) out.opTypes = ops.split(',') as FilterState['opTypes'];
  const time = params.get('time');
  if (time && VALID_TIME_RANGES.includes(time as TimeRange)) out.timeRange = time as TimeRange;
  return out;
}
