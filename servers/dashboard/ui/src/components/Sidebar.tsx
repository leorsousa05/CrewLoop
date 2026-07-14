import type { View } from '../lib/types';
import { NAV_ITEMS, getNavItem, type NavItem } from '../lib/navigation';
import { useViewport } from '../hooks/useViewport';
import { Icon } from './ui/Icon';

const MAIN_ITEMS = NAV_ITEMS.filter((i) => i.key !== 'settings');
const SETTINGS_ITEM = getNavItem('settings');

interface Props {
  activeView: View;
  onChange: (view: View) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeView, onChange, mobileOpen, onClose }: Props) {
  const { breakpoint } = useViewport();
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
        title={isTablet ? `${item.label} — ${item.description}` : undefined}
        className={`sidebar-item group relative flex items-center gap-3 w-full rounded-md transition-colors text-left ${
          isTablet ? 'justify-center h-11' : 'h-9 px-3'
        } ${
          active
            ? 'bg-accent-subtle text-text-primary'
            : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-accent animate-bar-in" />
        )}
        <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" weight={active ? 'bold' : 'regular'} />
        {!isTablet && (
          <>
            <span className="text-label flex-1">{item.label}</span>
            <kbd className="kbd opacity-50">{item.shortcut}</kbd>
          </>
        )}
      </button>
    );
  }

  const content = (
    <nav aria-label="Main" className="flex flex-col h-full py-4 px-3 gap-2">
      <div className="flex flex-col gap-1.5">{MAIN_ITEMS.map(renderItem)}</div>
      <div className="flex-1" />
      <div className="border-t border-border-default pt-2">{renderItem(SETTINGS_ITEM)}</div>
    </nav>
  );

  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'var(--overlay)' }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed top-12 left-0 bottom-0 w-[280px] bg-surface border-r border-border-default z-40 transform transition-transform ${
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
      className={`flex-shrink-0 h-[calc(100vh-3rem)] bg-surface border-r border-border-default sticky top-12 ${
        isTablet ? 'w-14' : 'w-56'
      }`}
    >
      {content}
    </aside>
  );
}
