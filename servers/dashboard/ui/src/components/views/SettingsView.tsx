import { useSettings } from '../../contexts/SettingsContext';
import { SHORTCUTS, type ShortcutScope } from '../../lib/shortcuts';
import { MAX_MAX_EVENTS, MIN_MAX_EVENTS } from '../../lib/settings';
import { Icon } from '../ui/Icon';

const SCOPE_LABELS: Record<ShortcutScope, string> = {
  global: 'Global',
  timeline: 'Timeline',
};

export function SettingsView() {
  const { settings, setSettings, reducedMotion } = useSettings();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-4 md:px-5 py-3 border-b border-border-default flex-shrink-0">
        <h1 className="font-display text-display-lg text-text-primary">Settings</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="max-w-2xl flex flex-col gap-4">
          <section className="panel">
            <h2 className="text-caption uppercase tracking-wide text-text-muted pb-3 border-b border-border-default">
              Appearance
            </h2>
            <div className="pt-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-body text-text-primary">Theme</div>
                  <div className="text-label text-text-muted">Choose your preferred color scheme.</div>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings((s) => ({ ...s, theme: e.target.value as typeof s.theme }))}
                  className="min-h-11 px-3 rounded-lg bg-elevated border border-border-default text-body text-text-primary outline-none focus:border-accent"
                >
                  <option value="system">System</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-body text-text-primary">Density</div>
                  <div className="text-label text-text-muted">Control how compact lists appear.</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, density: 'comfortable' }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 min-h-11 rounded-lg border text-label transition-colors ${
                      settings.density === 'comfortable'
                        ? 'border-accent text-accent bg-accent/10'
                        : 'border-border-default text-text-secondary hover:bg-elevated'
                    }`}
                  >
                    <Icon name="ArrowsOutLineVertical" className="w-4 h-4" />
                    Comfortable
                  </button>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, density: 'compact' }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 min-h-11 rounded-lg border text-label transition-colors ${
                      settings.density === 'compact'
                        ? 'border-accent text-accent bg-accent/10'
                        : 'border-border-default text-text-secondary hover:bg-elevated'
                    }`}
                  >
                    <Icon name="ArrowsInLineVertical" className="w-4 h-4" />
                    Compact
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-body text-text-primary">Reduced motion</div>
                  <div className="text-label text-text-muted">Disable animations throughout the dashboard.</div>
                </div>
                <button
                  onClick={() => setSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion }))}
                  className={`relative w-11 min-h-11 rounded-full transition-colors flex-shrink-0 ${
                    settings.reducedMotion ? 'bg-accent' : 'bg-border-strong'
                  }`}
                  aria-pressed={settings.reducedMotion}
                >
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 left-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-[18px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {reducedMotion && (
                <p className="text-label text-text-muted">OS reduced-motion preference is also enabled.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <h2 className="text-caption uppercase tracking-wide text-text-muted pb-3 border-b border-border-default">
              Behavior
            </h2>
            <div className="pt-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-body text-text-primary">Auto-follow active session</div>
                  <div className="text-label text-text-muted">Automatically select the running session.</div>
                </div>
                <button
                  onClick={() => setSettings((s) => ({ ...s, autoFollowActive: !s.autoFollowActive }))}
                  className={`relative w-11 min-h-11 rounded-full transition-colors flex-shrink-0 ${
                    settings.autoFollowActive ? 'bg-accent' : 'bg-border-strong'
                  }`}
                  aria-pressed={settings.autoFollowActive}
                >
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 left-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.autoFollowActive ? 'translate-x-[18px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-body text-text-primary">Max events per session</div>
                  <div className="text-label text-text-muted">Limit how many events are kept in memory.</div>
                </div>
                <input
                  type="number"
                  min={MIN_MAX_EVENTS}
                  max={MAX_MAX_EVENTS}
                  value={settings.maxEvents}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!Number.isNaN(n)) {
                      setSettings((s) => ({
                        ...s,
                        maxEvents: Math.max(MIN_MAX_EVENTS, Math.min(MAX_MAX_EVENTS, n)),
                      }));
                    }
                  }}
                  className="w-24 min-h-11 px-3 rounded-lg bg-elevated border border-border-default text-body text-text-primary outline-none focus:border-accent"
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <h2 className="text-caption uppercase tracking-wide text-text-muted pb-3 border-b border-border-default">
              Keyboard shortcuts
            </h2>
            <div className="pt-4 flex flex-col gap-4">
              {(['global', 'timeline'] as ShortcutScope[]).map((scope) => (
                <div key={scope} className="flex flex-col gap-2">
                  <span className="text-label text-text-secondary">{SCOPE_LABELS[scope]}</span>
                  {SHORTCUTS.filter((s) => s.scope === scope).map((s) => (
                    <div key={s.keys} className="flex items-center justify-between gap-3">
                      <span className="text-body text-text-primary">{s.label}</span>
                      <span className="kbd">{s.keys}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
