import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ClientSession, ClientWebSocketMessage } from '../../src/types';
import type { View, CommandPaletteItem, FilterOptions, FilterState } from './lib/types';
import { useSessions } from './hooks/useSessions';
import { useWebSocket } from './hooks/useWebSocket';
import { useSettings } from './contexts/SettingsContext';
import { usePinnedSessions } from './contexts/PinnedSessionsContext';
import { useFilters } from './contexts/FilterContext';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { useNow } from './hooks/useNow';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { Overview } from './components/views/Overview';
import { SessionsView } from './components/views/SessionsView';
import { TimelineView } from './components/views/TimelineView';
import { NetworkView } from './components/views/NetworkView';
import { FilesView } from './components/views/FilesView';
import { SkillsView } from './components/views/SkillsView';
import { SettingsView } from './components/views/SettingsView';
import { projectInvocations, buildFileActivity } from '../../src/lib/invocations';
import { buildGraph3D } from '../../src/lib/graph';
import { resolvePath } from '../../src/lib/paths';
import { buildOptions, filterInvocations, filterSessions, filterGraph } from './lib/filter';
import { toExportableEvent, toJson, download, filename } from './lib/export';
import { sourceIcon } from '../../src/lib/constants';
import { formatTime } from '../../src/lib/format';

const VIEWS: { key: View; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'House' },
  { key: 'sessions', label: 'Sessions', icon: 'Rows' },
  { key: 'timeline', label: 'Timeline', icon: 'Clock' },
  { key: 'network', label: 'Network', icon: 'Graph' },
  { key: 'files', label: 'Files', icon: 'Files' },
  { key: 'skills', label: 'Skills', icon: 'ChartPie' },
  { key: 'settings', label: 'Settings', icon: 'Gear' },
];

function buildPaletteItems(
  currentView: View,
  setView: (v: View) => void,
  sessions: ClientSession[],
  selectSession: (id: string) => void,
  setFilters: (u: Partial<FilterState>) => void,
  exportJson: () => void,
  toggleDensity: () => void
): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [];

  for (const v of VIEWS) {
    items.push({
      id: `view:${v.key}`,
      type: 'view',
      title: v.label,
      icon: v.icon,
      keywords: [v.label.toLowerCase()],
      action: () => setView(v.key),
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
      action: () => selectSession(s.id),
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
      action: () => setFilters({ skills: [skill] }),
    });
  }

  for (const tool of tools) {
    items.push({
      id: `tool:${tool}`,
      type: 'tool',
      title: tool,
      icon: 'Wrench',
      action: () => setFilters({ tools: [tool] }),
    });
  }

  for (const file of files) {
    items.push({
      id: `file:${file}`,
      type: 'file',
      title: file,
      icon: 'FileText',
      action: () => {
        setView('files');
        setFilters({ query: file });
      },
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
        action: () => {
          if (currentView !== 'timeline') setView('timeline');
          setFilters({ query: ev.tool || ev.title });
        },
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
      action: () => setView('settings'),
    }
  );

  return items;
}

export default function App() {
  const { settings, setSettings } = useSettings();
  const { pins } = usePinnedSessions();
  const { filters, setFilters, resetFilters } = useFilters();
  const { sessions, selectedSessionId, selectSession, handleMessage, sortedSessions } = useSessions();
  const [activeView, setActiveView] = useState<View>('overview');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timelinePaused, setTimelinePaused] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<ClientWebSocketMessage[]>([]);
  const now = useNow();
  const pausedRef = useRef(timelinePaused);

  useEffect(() => {
    pausedRef.current = timelinePaused;
  }, [timelinePaused]);

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
    if (!timelinePaused) flushPending();
  }, [timelinePaused, flushPending]);

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
  const graph = useMemo(
    () => buildGraph3D(selectedSession, filteredInvocations),
    [selectedSession, filteredInvocations]
  );
  const filteredGraph = useMemo(
    () => filterGraph(graph, filteredInvocations, filters),
    [graph, filteredInvocations, filters]
  );
  const filterOptions = useMemo<FilterOptions>(
    () => buildOptions(sessions, selectedSessionId),
    [sessions, selectedSessionId]
  );

  function handleExport() {
    const events = filteredInvocations.map(toExportableEvent);
    download(toJson(events), filename('json'));
  }

  function toggleDensity() {
    setSettings((s) => ({ ...s, density: s.density === 'compact' ? 'comfortable' : 'compact' }));
  }

  const paletteItems = useMemo(
    () =>
      buildPaletteItems(
        activeView,
        (v) => {
          setActiveView(v);
          resetFilters();
        },
        sortedSessions,
        selectSession,
        setFilters,
        handleExport,
        toggleDensity
      ),
    [activeView, sortedSessions, selectSession, setFilters, resetFilters]
  );

  useKeyboardShortcut('k', () => setCmdOpen(true), { meta: true });

  function renderView() {
    switch (activeView) {
      case 'overview':
        return (
          <Overview
            sessions={sessions}
            selectedSession={selectedSession}
            onSelectSession={selectSession}
          />
        );
      case 'sessions':
        return (
          <SessionsView
            sessions={sortedWithPins}
            selectedSessionId={selectedSessionId}
            filterOptions={filterOptions}
            onSelectSession={selectSession}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            invocations={filteredInvocations}
            filterOptions={filterOptions}
            onMouseEnter={() => setTimelinePaused(true)}
            onMouseLeave={() => setTimelinePaused(false)}
          />
        );
      case 'network':
        return <NetworkView graph={filteredGraph} filterOptions={filterOptions} />;
      case 'files':
        return <FilesView files={filteredFiles} filterOptions={filterOptions} selectedSessionId={selectedSessionId} />;
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
        activeView={activeView}
        sessions={sortedWithPins}
        selectedSessionId={selectedSessionId}
        activeSessionId={activeSessionId}
        connection={connection}
        onSelectSession={selectSession}
        onOpenCommandPalette={() => setCmdOpen(true)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          onChange={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 overflow-hidden animate-fade-in">{renderView()}</main>
      </div>
      <CommandPalette
        items={paletteItems}
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
      />
    </div>
  );
}
