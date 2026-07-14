import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ClientSession, ClientWebSocketMessage } from '../../src/types';
import type {
  View,
  CommandPaletteItem,
  FilterOptions,
  FilterState,
  SerializedFilterState,
} from './lib/types';
import { DEFAULT_FILTER_STATE } from './lib/types';
import { useSessions } from './hooks/useSessions';
import { useWebSocket } from './hooks/useWebSocket';
import { useSettings } from './contexts/SettingsContext';
import { usePinnedSessions } from './contexts/PinnedSessionsContext';
import { useFilters } from './contexts/FilterContext';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { useHashRoute, type HashRoute } from './hooks/useHashRoute';
import { useNow } from './hooks/useNow';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { Overview } from './components/views/Overview';
import { SessionsView } from './components/views/SessionsView';
import { TimelineView } from './components/views/TimelineView';
import { FilesView } from './components/views/FilesView';
import { SkillsView } from './components/views/SkillsView';
import { SettingsView } from './components/views/SettingsView';
import { projectInvocations, buildFileActivity } from '../../src/lib/invocations';
import { resolvePath } from '../../src/lib/paths';
import { buildOptions, filterInvocations, filterSessions } from './lib/filter';
import { filtersToQuery, filtersFromQuery } from './lib/route';
import { NAV_ITEMS } from './lib/navigation';
import { toExportableEvent, toJson, download, filename } from './lib/export';
import { sourceIcon } from '../../src/lib/constants';
import { formatTime } from '../../src/lib/format';

function serializedEqual(a: Partial<SerializedFilterState>, b: Partial<SerializedFilterState>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if ((a as Record<string, unknown>)[k] !== (b as Record<string, unknown>)[k]) return false;
  }
  return true;
}

function listEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function filtersEqual(a: FilterState, b: FilterState): boolean {
  return (
    a.query === b.query &&
    a.timeRange === b.timeRange &&
    listEqual(a.sources, b.sources) &&
    listEqual(a.skills, b.skills) &&
    listEqual(a.statuses, b.statuses) &&
    listEqual(a.tools, b.tools) &&
    listEqual(a.opTypes, b.opTypes)
  );
}

function buildPaletteItems(
  navigateToView: (v: View) => void,
  navigate: HashRoute['navigate'],
  sessions: ClientSession[],
  selectAndRoute: (id: string | null) => void,
  exportJson: () => void,
  toggleDensity: () => void
): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [];

  for (const v of NAV_ITEMS) {
    items.push({
      id: `view:${v.key}`,
      type: 'view',
      title: v.label,
      subtitle: v.description,
      icon: v.icon,
      keywords: [v.label.toLowerCase(), v.shortcut],
      action: () => navigateToView(v.key),
    });
  }

  for (const s of sessions) {
    items.push({
      id: `session:${s.id}`,
      type: 'session',
      title: s.activeSkill?.name || s.id,
      subtitle: `${s.source} · ${formatTime(s.startTime)}`,
      icon: sourceIcon(s.source),
      keywords: [s.id, s.source, s.activeSkill?.name || ''],
      action: () => selectAndRoute(s.id),
    });
  }

  const skills = new Set<string>();
  const tools = new Set<string>();
  const files = new Set<string>();
  const recentEvents: { id: string; title: string; tool?: string; time: number }[] = [];

  for (const s of sessions) {
    if (s.activeSkill?.name) skills.add(s.activeSkill.name);
    if (s.skill) skills.add(s.skill);
    for (const e of s.events.slice(-10)) {
      if (e.tool) tools.add(e.tool);
      const path = resolvePath(e.input, e.output);
      if (path) files.add(path);
      recentEvents.push({
        id: e.id,
        title: e.tool || e.event_type,
        tool: e.tool,
        time: e.timestamp,
      });
    }
  }

  for (const skill of skills) {
    items.push({
      id: `skill:${skill}`,
      type: 'skill',
      title: skill,
      icon: 'Target',
      action: () => navigate({ filters: { skills: skill } }),
    });
  }

  for (const tool of tools) {
    items.push({
      id: `tool:${tool}`,
      type: 'tool',
      title: tool,
      icon: 'Wrench',
      action: () => navigate({ filters: { tools: tool } }),
    });
  }

  for (const file of files) {
    items.push({
      id: `file:${file}`,
      type: 'file',
      title: file,
      icon: 'FileText',
      action: () => navigate({ view: 'files', filters: { q: file } }, 'push'),
    });
  }

  recentEvents
    .sort((a, b) => b.time - a.time)
    .slice(0, 20)
    .forEach((ev) => {
      items.push({
        id: `event:${ev.id}`,
        type: 'event',
        title: ev.title,
        subtitle: formatTime(ev.time),
        icon: 'Clock',
        action: () => navigate({ view: 'timeline', filters: { q: ev.tool || ev.title } }, 'push'),
      });
    });

  items.push(
    {
      id: 'action:export',
      type: 'action',
      title: 'Export timeline JSON',
      icon: 'DownloadSimple',
      action: exportJson,
    },
    {
      id: 'action:density',
      type: 'action',
      title: 'Toggle density',
      icon: 'ArrowsInLineVertical',
      action: toggleDensity,
    },
    {
      id: 'action:settings',
      type: 'action',
      title: 'Open settings',
      icon: 'Gear',
      action: () => navigateToView('settings'),
    }
  );

  return items;
}

export default function App() {
  const { settings, setSettings } = useSettings();
  const { pins } = usePinnedSessions();
  const { filters, setFilters, resetFilters } = useFilters();
  const { sessions, selectedSessionId, selectSession, handleMessage, sortedSessions } = useSessions();
  const { route, navigate } = useHashRoute();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<ClientWebSocketMessage[]>([]);
  const now = useNow();

  const paused = hoverPaused || manualPaused;
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const navigateToView = useCallback(
    (view: View) => {
      navigate({ view, filters: {}, filePath: null, sort: null }, 'push');
      resetFilters();
    },
    [navigate, resetFilters]
  );

  const selectAndRoute = useCallback(
    (id: string | null) => {
      selectSession(id);
      navigate({ sessionId: id });
    },
    [selectSession, navigate]
  );

  // Hydrate session selection from the URL (deep links, back/forward)
  useEffect(() => {
    if (route.sessionId && route.sessionId !== selectedSessionId && sessions.has(route.sessionId)) {
      selectSession(route.sessionId);
    }
  }, [route.sessionId, selectedSessionId, sessions, selectSession]);

  // Hydrate filters from the URL
  useEffect(() => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(route.filters)) {
      if (v !== undefined) params.set(k, String(v));
    }
    const hydrated: FilterState = { ...DEFAULT_FILTER_STATE, ...filtersFromQuery(params) };
    if (!filtersEqual(hydrated, filters)) setFilters(hydrated);
  }, [route.filters, filters, setFilters]);

  // Mirror filter changes back to the URL
  useEffect(() => {
    const next = Object.fromEntries(filtersToQuery(filters).entries()) as Partial<SerializedFilterState>;
    if (!serializedEqual(next, route.filters)) navigate({ filters: next });
  }, [filters, navigate, route.filters]);

  const sortedWithPins = useMemo(
    () => filterSessions(sortedSessions, filters, pins, now),
    [sortedSessions, filters, pins, now]
  );

  const activeSessionId = useMemo(() => {
    for (const s of sessions.values()) {
      if (s.lifecycle === 'running') return s.id;
    }
    return sortedWithPins[0]?.id;
  }, [sessions, sortedWithPins]);

  const selectedSession = useMemo(
    () => (selectedSessionId ? sessions.get(selectedSessionId) : undefined),
    [sessions, selectedSessionId]
  );

  useEffect(() => {
    if (settings.autoFollowActive && activeSessionId && !selectedSessionId) {
      selectSession(activeSessionId);
    }
  }, [activeSessionId, selectedSessionId, selectSession, settings.autoFollowActive]);

  const flushPending = useCallback(() => {
    if (pendingUpdates.length === 0) return;
    const batch = pendingUpdates;
    setPendingUpdates([]);
    for (const msg of batch) handleMessage(msg);
  }, [pendingUpdates, handleMessage]);

  useEffect(() => {
    if (!paused) flushPending();
  }, [paused, flushPending]);

  const onMessage = useCallback(
    (msg: ClientWebSocketMessage) => {
      if (pausedRef.current && (msg.type === 'snapshot' || msg.type === 'update')) {
        setPendingUpdates((prev) => [...prev, msg]);
        return;
      }
      handleMessage(msg);
    },
    [handleMessage]
  );

  const { status: connection } = useWebSocket(`ws://${location.host}/ws`, onMessage);

  const invocations = useMemo(
    () => projectInvocations(selectedSession?.events || []),
    [selectedSession]
  );
  const filteredInvocations = useMemo(
    () => filterInvocations(invocations, selectedSession, filters, now),
    [invocations, selectedSession, filters, now]
  );
  const filteredFiles = useMemo(
    () => buildFileActivity(filteredInvocations, resolvePath),
    [filteredInvocations]
  );
  const filterOptions = useMemo<FilterOptions>(
    () => buildOptions(sessions, selectedSessionId),
    [sessions, selectedSessionId]
  );

  const handleExport = useCallback(() => {
    const events = filteredInvocations.map(toExportableEvent);
    download(toJson(events), filename('json'));
  }, [filteredInvocations]);

  const toggleDensity = useCallback(() => {
    setSettings((s) => ({ ...s, density: s.density === 'compact' ? 'comfortable' : 'compact' }));
  }, [setSettings]);

  const paletteItems = useMemo(
    () => buildPaletteItems(navigateToView, navigate, sortedSessions, selectAndRoute, handleExport, toggleDensity),
    [navigateToView, navigate, sortedSessions, selectAndRoute, handleExport, toggleDensity]
  );

  // Global view shortcuts (digits 1-6), guarded against form fields
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const item = NAV_ITEMS.find((i) => i.shortcut === e.key);
      if (item) {
        e.preventDefault();
        navigateToView(item.key);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [navigateToView]);

  const focusFilterSearch = useCallback(() => {
    document.getElementById('filter-search')?.focus();
  }, []);

  useKeyboardShortcut('/', focusFilterSearch);
  useKeyboardShortcut('k', () => setCmdOpen(true), { meta: true });
  useKeyboardShortcut('Escape', () => setCmdOpen(false), { disabled: !cmdOpen });

  const handleResume = useCallback(() => {
    setManualPaused(false);
    setHoverPaused(false);
  }, []);

  function renderView() {
    switch (route.view) {
      case 'overview':
        return (
          <Overview
            sessions={sessions}
            selectedSession={selectedSession}
            invocations={invocations}
            onSelectSession={selectAndRoute}
            onOpenTimeline={() => navigateToView('timeline')}
          />
        );
      case 'sessions':
        return (
          <SessionsView
            sessions={sortedWithPins}
            selectedSessionId={selectedSessionId}
            filterOptions={filterOptions}
            onSelectSession={selectAndRoute}
            sort={route.sort ?? 'recent'}
            onSortChange={(sort) => navigate({ sort })}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            invocations={filteredInvocations}
            filterOptions={filterOptions}
            paused={paused}
            manualPaused={manualPaused}
            bufferedCount={pendingUpdates.length}
            onHoverChange={setHoverPaused}
            onManualPauseToggle={() => setManualPaused((v) => !v)}
            onResume={handleResume}
          />
        );
      case 'files':
        return (
          <FilesView
            files={filteredFiles}
            filterOptions={filterOptions}
            selectedSessionId={selectedSessionId}
            selectedPath={route.filePath}
            onSelectPath={(path) => navigate({ filePath: path })}
          />
        );
      case 'skills':
        return <SkillsView invocations={filteredInvocations} filterOptions={filterOptions} />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  }

  return (
    <div className="h-screen flex flex-col bg-base text-text-primary overflow-hidden">
      <TopBar
        activeView={route.view}
        sessions={sortedWithPins}
        selectedSessionId={selectedSessionId}
        activeSessionId={activeSessionId}
        connection={connection}
        onSelectSession={selectAndRoute}
        onOpenCommandPalette={() => setCmdOpen(true)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      {connection === 'connecting' && (
        <div className="h-6 flex items-center justify-center px-4 flex-shrink-0 bg-error/10 border-b border-error/30 text-micro text-error">
          Connection lost — reconnecting…
        </div>
      )}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={route.view}
          onChange={navigateToView}
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 overflow-hidden animate-fade-in">{renderView()}</main>
      </div>
      <CommandPalette items={paletteItems} open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
