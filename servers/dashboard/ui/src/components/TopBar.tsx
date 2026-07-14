import type { ClientSession } from '../../../src/types';
import type { View } from '../lib/types';
import { getNavItem } from '../lib/navigation';
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

const CONNECTION_LABEL: Record<Props['connection'], string> = {
  connected: 'Connected',
  connecting: 'Reconnecting…',
  disconnected: 'Offline',
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
  const view = getNavItem(activeView);
  const dotColor =
    connection === 'connected'
      ? 'bg-running'
      : connection === 'connecting'
      ? 'bg-warning animate-pulse'
      : 'bg-error';

  return (
    <header className="h-12 bg-surface border-b border-border-default flex items-center justify-between px-4 flex-shrink-0 z-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="lg:hidden btn-ghost w-8 h-8 justify-center !px-0"
        >
          <Icon name="List" className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="Pulse" className="w-5 h-5 text-accent flex-shrink-0" />
          <span className="font-display text-heading tracking-wide text-text-primary hidden sm:inline">
            CrewLoop
          </span>
          <span className="w-px h-5 bg-border-default hidden sm:block flex-shrink-0" />
          <span className="font-display text-heading text-text-secondary truncate">{view.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <SessionSelector
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          activeSessionId={activeSessionId}
          connection={connection}
          onSelect={onSelectSession}
        />

        <div className="chip" title={CONNECTION_LABEL[connection]}>
          <span className={`w-2 h-2 rounded-full ${dotColor}`} aria-hidden="true" />
          <span className="text-label hidden sm:inline">{CONNECTION_LABEL[connection]}</span>
          <span className="sr-only sm:hidden">{CONNECTION_LABEL[connection]}</span>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex btn-ghost items-center gap-2 text-label"
        >
          <Icon name="MagnifyingGlass" className="w-4 h-4" />
          <span>Search</span>
          <kbd className="kbd ml-1">{commandHint()}</kbd>
        </button>
        <button
          onClick={onOpenCommandPalette}
          aria-label="Open command palette"
          className="md:hidden btn-ghost w-8 h-8 justify-center !px-0"
        >
          <Icon name="MagnifyingGlass" className="w-5 h-5" />
        </button>

        <button
          onClick={() => setSettings((s) => ({ ...s, theme: resolvedTheme === 'dark' ? 'light' : 'dark' }))}
          aria-label="Toggle theme"
          className="btn-ghost w-8 h-8 justify-center !px-0"
        >
          <Icon name={resolvedTheme === 'light' ? 'Sun' : 'Moon'} className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
