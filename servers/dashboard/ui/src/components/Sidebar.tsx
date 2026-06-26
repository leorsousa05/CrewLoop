import type { View } from '../lib/types';
import { useSettings } from '../contexts/SettingsContext';
import { useViewport } from '../hooks/useViewport';
import { Icon } from './ui/Icon';

interface NavItem {
  key: View;
  label: string;
  icon: string;
}

const ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: 'House' },
  { key: 'sessions', label: 'Sessions', icon: 'Rows' },
  { key: 'timeline', label: 'Timeline', icon: 'Clock' },
  { key: 'network', label: 'Network', icon: 'Graph' },
  { key: 'files', label: 'Files', icon: 'Files' },
  { key: 'skills', label: 'Skills', icon: 'ChartPie' },
];

const SETTINGS_ITEM: NavItem = { key: 'settings', label: 'Settings', icon: 'Gear' };

interface Props {
  activeView: View;
  onChange: (view: View) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeView, onChange, mobileOpen, onClose }: Props) {
  const { breakpoint } = useViewport();
  const { reducedMotion } = useSettings();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  function handleSelect(view: View) {
    onChange(view);
    if (isMobile) onClose();
  }

  function renderItem(item: NavItem) {
    const active = activeView === item.key;
    return (
      <button
        key={item.key}
        onClick={() => handleSelect(item.key)}
        aria-current={active ? 'page' : undefined}
        className={`sidebar-item group relative flex items-center gap-3 w-full rounded-lg transition-colors text-left ${
          isTablet ? 'justify-center h-11' : 'h-10 px-3'
        } ${
          active
            ? 'bg-elevated text-text-primary'
            : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
        }`}
      >
        {active && !reducedMotion && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-accent" />
        )}
        {active && reducedMotion && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-accent" />
        )}
        <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
        {!isTablet && <span className="text-sm font-medium">{item.label}</span>}
      </button>
    );
  }

  const content = (
    <nav aria-label="Main" className="flex flex-col h-full py-4 px-3 gap-2">
      <div className="flex flex-col gap-1">
        {ITEMS.map(renderItem)}
      </div>
      <div className="flex-1" />
      <div className="border-t border-border-default pt-2">
        {renderItem(SETTINGS_ITEM)}
      </div>
    </nav>
  );

  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed top-14 left-0 bottom-0 w-60 bg-surface border-r border-border-default z-40 transform transition-transform ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={`flex-shrink-0 h-[calc(100vh-3.5rem)] bg-surface border-r border-border-default sticky top-14 ${
        isTablet ? 'w-16' : 'w-60'
      }`}
    >
      {content}
    </aside>
  );
}
