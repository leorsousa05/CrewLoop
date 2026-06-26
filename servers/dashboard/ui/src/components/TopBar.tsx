import type { ClientSession } from '../../../src/types';
import type { View } from '../lib/types';
import { useSettings } from '../contexts/SettingsContext';
import { SessionSelector } from './SessionSelector';
import { Icon } from './ui/Icon';

interface Props {
  activeView: View;
  sessions: ClientSession[];
  selectedSessionId: string | null;
  activeSessionId: string | undefined;
  connection: 'connecting' | 'connected' | 'disconnected';
  onSelectSession: (id: string) => void;
  onOpenCommandPalette: () => void;
  onToggleSidebar: () => void;
}

const VIEW_TITLES: Record<View, string> = {
  overview: 'Overview',
  sessions: 'Sessions',
  timeline: 'Timeline',
  network: 'Network',
  files: 'Files',
  skills: 'Skills',
  settings: 'Settings',
};

function commandHint(): string {
  if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
    return '⌘K';
  }
  return 'Ctrl+K';
}

export function TopBar({
  activeView,
  sessions,
  selectedSessionId,
  activeSessionId,
  connection,
  onSelectSession,
  onOpenCommandPalette,
  onToggleSidebar,
}: Props) {
  const { resolvedTheme, setSettings } = useSettings();

  return (
    <header className="h-14 bg-surface border-b border-border-default flex items-center justify-between px-4 flex-shrink-0 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="lg:hidden w-9 h-9 rounded-lg border border-border-default bg-elevated text-text-secondary hover:border-accent hover:text-accent transition-colors flex items-center justify-center"
        >
          <Icon name="List" className="w-5 h-5" />
        </button>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-widest text-text-primary">CREWLOOP</span>
          <span className="text-text-muted hidden sm:inline">·</span>
          <span className="text-xs text-text-muted tracking-widest uppercase hidden sm:inline">
            {VIEW_TITLES[activeView]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-default bg-elevated text-text-secondary hover:border-accent hover:text-accent transition-colors text-xs"
        >
          <Icon name="MagnifyingGlass" className="w-4 h-4" />
          <span>Search</span>
          <kbd className="ml-2 px-1.5 py-0.5 rounded bg-base border border-border-default text-[10px] font-mono">
            {commandHint()}
          </kbd>
        </button>
        <button
          onClick={onOpenCommandPalette}
          aria-label="Search"
          className="md:hidden w-9 h-9 rounded-lg border border-border-default bg-elevated text-text-secondary hover:border-accent hover:text-accent transition-colors flex items-center justify-center"
        >
          <Icon name="MagnifyingGlass" className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border-default bg-elevated text-xs text-text-secondary">
          <span
            className={`w-2 h-2 rounded-full ${
              connection === 'connected'
                ? 'bg-success'
                : connection === 'connecting'
                ? 'bg-warning'
                : 'bg-error'
            }`}
          />
          <span className="capitalize">{connection}</span>
        </div>

        <button
          onClick={() => setSettings((s) => ({ ...s, theme: resolvedTheme === 'dark' ? 'light' : 'dark' }))}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-lg border border-border-default bg-elevated text-text-secondary hover:border-accent hover:text-accent transition-colors flex items-center justify-center"
        >
          <Icon name={resolvedTheme === 'light' ? 'Sun' : 'Moon'} className="w-5 h-5" />
        </button>

        <SessionSelector
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          activeSessionId={activeSessionId}
          connection={connection}
          onSelect={onSelectSession}
        />
      </div>
    </header>
  );
}
