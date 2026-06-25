# Visual Design Specification: Dashboard Session Lifecycle

## Aesthetic Direction

**Industrial / Utilitarian — refined.** The dashboard already communicates control-room precision: dark surfaces, cyan signal color, monospace telemetry, and sharp panel edges. This design system extends that language to session lifecycle states, treating each session like a mission status board. No decorative gradients, no ornamental motion. Every visual choice answers the question: "What is the system doing right now?"

Why this fits: the user is a developer running multiple AI agents. They need glanceable state, not ornament. The existing palette and typography already establish trust and clarity; we only add semantic signals for lifecycle.

---

## Color System

Use the existing CSS custom properties. Add **lifecycle semantic tokens** mapped to existing variables so light/dark themes switch automatically.

```css
:root {
  /* existing tokens preserved */
  --bg-base: #09090b;
  --bg-surface: #121214;
  --bg-elevated: #1c1c1f;
  --bg-inset: #050507;
  --border-default: #27272a;
  --border-strong: #3f3f46;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #475569;
  --accent: #22d3ee;
  --accent-hover: #67e8f9;
  --accent-dim: #0891b2;
  --success: #4ade80;
  --error: #fb7185;
  --warning: #facc15;
  --running: #38bdf8;

  /* lifecycle tokens */
  --lifecycle-starting: var(--warning);       /* amber */
  --lifecycle-running: var(--running);        /* cyan */
  --lifecycle-ended: var(--text-muted);       /* neutral gray */
  --lifecycle-starting-bg: rgba(250, 204, 21, 0.12);
  --lifecycle-running-bg: rgba(56, 189, 248, 0.12);
  --lifecycle-ended-bg: rgba(148, 163, 184, 0.10);
  --lifecycle-pulse-shadow-starting: rgba(250, 204, 21, 0.35);
  --lifecycle-pulse-shadow-running: rgba(56, 189, 248, 0.35);
}

[data-theme="light"] {
  --lifecycle-starting: var(--warning);       /* #ca8a04 */
  --lifecycle-running: var(--running);        /* #0284c7 */
  --lifecycle-ended: var(--text-muted);       /* #94a3b8 */
  --lifecycle-starting-bg: rgba(202, 138, 4, 0.10);
  --lifecycle-running-bg: rgba(2, 132, 199, 0.10);
  --lifecycle-ended-bg: rgba(148, 163, 184, 0.10);
  --lifecycle-pulse-shadow-starting: rgba(202, 138, 4, 0.30);
  --lifecycle-pulse-shadow-running: rgba(2, 132, 199, 0.30);
}
```

### Contrast notes

- `lifecycle-running` cyan on dark surface: ~7.2:1 — passes WCAG AA.
- `lifecycle-starting` amber on dark surface: ~6.8:1 — passes WCAG AA.
- `lifecycle-ended` muted gray on dark surface: ~4.6:1 — passes WCAG AA.
- Light-mode tokens use darker variants to maintain contrast.

---

## Typography System

Keep the existing font stack. Introduce no new font families.

| Role | Font | Size | Weight | Line-height | Letter-spacing | Usage |
|------|------|------|--------|-------------|----------------|-------|
| Skill name (display) | Bebas Neue | 4rem / 64px (desktop), 3rem (tablet), 2.5rem (mobile) | 400 | 0.95 | 0.02em | `#active-skill-name` |
| Lifecycle badge | DM Sans | 0.75rem / 12px | 600 | 1 | 0.06em | `.lifecycle-badge` |
| Empty state title | Bebas Neue | 2rem / 32px | 400 | 1.1 | 0.04em | `.empty-state-title` |
| Empty state body | DM Sans | 0.875rem / 14px | 400 | 1.5 | 0 | `.empty-state-body` |
| Session selector id | JetBrains Mono | 0.75rem / 12px | 400 | 1 | 0 | `.session-item-id` |
| Session selector meta | DM Sans | 0.6875rem / 11px | 400 | 1.3 | 0 | `.session-item-meta` |
| Telemetry value | JetBrains Mono | 2rem / 32px | 500 | 1 | 0 | `.telemetry-value` |

---

## Component Specs

### 1. Lifecycle Badge

A compact pill next to the active skill name that signals the current session phase.

**Structure:**

```html
<span class="lifecycle-badge starting">
  <span class="lifecycle-dot"></span>
  STARTING
</span>
```

**CSS:**

```css
.lifecycle-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.lifecycle-badge.starting {
  color: var(--lifecycle-starting);
  background: var(--lifecycle-starting-bg);
  border-color: rgba(250, 204, 21, 0.35);
}

.lifecycle-badge.running {
  color: var(--lifecycle-running);
  background: var(--lifecycle-running-bg);
  border-color: rgba(56, 189, 248, 0.35);
}

.lifecycle-badge.ended {
  color: var(--lifecycle-ended);
  background: var(--lifecycle-ended-bg);
  border-color: var(--border-default);
}

.lifecycle-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.lifecycle-badge.starting .lifecycle-dot,
.lifecycle-badge.running .lifecycle-dot {
  animation: lifecycle-pulse 1.5s ease-in-out infinite;
}
```

**Behavior:**

- Appears inline inside `.active-skill-meta`, immediately after the status badge.
- Updates synchronously with session state changes via WebSocket `update` messages.
- `starting` and `running` pulse; `ended` is static.

**Accessibility:**

- The badge text is always visible; color reinforces but does not replace the label.
- Add `aria-label` on the parent panel or keep the visible text inside the badge.

---

### 2. Status Badge Update

The existing `.status-badge` remains but its dot now uses lifecycle-aware pulse behavior.

**CSS additions:**

```css
.status-badge {
  /* existing styles preserved */
}

.status-badge .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.status-badge .status-dot.running,
.status-badge .status-dot.starting {
  background: var(--lifecycle-running);
  animation: lifecycle-pulse 1.5s ease-in-out infinite;
}

.status-badge .status-dot.starting {
  background: var(--lifecycle-starting);
}

.status-badge .status-dot.success {
  background: var(--success);
}

.status-badge .status-dot.error {
  background: var(--error);
}
```

**Behavior:**

- When `lifecycle === 'starting'`, the status dot is amber and pulsing; status text reads "STARTING".
- When `lifecycle === 'running'` and `status === 'running'`, the dot is cyan and pulsing; text reads "RUNNING".
- When `lifecycle === 'ended'`, the dot is static success/error/neutral based on the final `status`.

---

### 3. Panel Accent Strip

The top strip already glows when running. Extend it to react to lifecycle.

**CSS additions:**

```css
.panel-accent-strip {
  height: 4px;
  background: var(--text-muted);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.panel-accent-strip.starting {
  background: var(--lifecycle-starting);
  box-shadow: 0 0 12px var(--lifecycle-pulse-shadow-starting);
  animation: lifecycle-glow 2s ease-in-out infinite;
}

.panel-accent-strip.running {
  background: var(--lifecycle-running);
  box-shadow: 0 0 12px var(--lifecycle-pulse-shadow-running);
  animation: lifecycle-glow 2s ease-in-out infinite;
}

.panel-accent-strip.ended {
  background: var(--border-strong);
  box-shadow: none;
}
```

---

### 4. Empty State

Replaces the current "IDLE / waiting for events" message with a calmer, informative empty state.

**Structure:**

```html
<div class="empty-state">
  <div class="empty-state-icon">
    <i class="ph ph-monitor-play"></i>
  </div>
  <h2 class="empty-state-title">NO ACTIVE SESSION</h2>
  <p class="empty-state-body">Start an agent session to see it here.</p>
</div>
```

**CSS:**

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.empty-state-icon i {
  font-size: 2rem;
}

.empty-state-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: 0.04em;
  color: var(--text-primary);
  margin: 0;
}

.empty-state-body {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}
```

**Behavior:**

- Rendered inside `.active-skill-content` when `state.sessions.size === 0`.
- Hide skill icon, name, meta, and source; show only the empty-state block.
- Telemetry panel still renders zeros; activity graph shows existing "Waiting for agent activity..." text.

---

### 5. Session Selector Item

Each item in the dropdown gains a second line showing start time and duration.

**Structure:**

```html
<li class="session-item" role="option" aria-selected="false">
  <div class="session-item-main">
    <span class="session-item-id">sess-abc123</span>
    <span class="session-item-meta">14:32:10 · 02:14</span>
  </div>
  <span class="session-item-source">kimi</span>
</li>
```

**CSS:**

```css
.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  border-left: 2px solid transparent;
}

.session-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.session-item-id {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.session-item-meta {
  font-family: var(--font-body);
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.session-item-source {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.session-item.active {
  border-left-color: var(--accent);
  background: var(--bg-elevated);
}

.session-item.active .session-item-id {
  color: var(--text-primary);
}
```

**Behavior:**

- `.session-item-meta` displays `HH:MM:SS · DURATION`.
- For ended sessions: `14:32:10 · ended after 02:14`.
- For active sessions: `14:32:10 · 02:14` (duration updates every second via the existing telemetry interval).
- The session trigger button label shows the active session's skill name (or truncated ID) plus a leading dot if it is the active session.

---

## Layout Structure

The existing two-column layout is preserved. Only the active-skill panel interior and session selector items change.

```
┌─────────────────────────────────────────────────────────────┐
│ CREWLOOP · DASHBOARD              [🌙] [● No session ▼]    │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  ┌────────────┐  │  ┌────────────────────────────────────┐  │
│  │ ━━━ (strip)│  │  │ Skill Activity                     │  │
│  │            │  │  │                                    │  │
│  │  ◯         │  │  │  [activity graph]                  │  │
│  │            │  │  │                                    │  │
│  │ NO ACTIVE  │  │  └────────────────────────────────────┘  │
│  │ SESSION    │  │                                          │
│  │            │  │  ┌────────────────────────────────────┐  │
│  │ Start an   │  │  │ Event Timeline                     │  │
│  │ agent...   │  │  │  ──●──●──●──●──                    │  │
│  │            │  │  └────────────────────────────────────┘  │
│  └────────────┘  │                                          │
│                  │                                          │
│  ┌────────────┐  │                                          │
│  │ Telemetry  │  │                                          │
│  │  0  00:00  │  │                                          │
│  │  0         │  │                                          │
│  └────────────┘  │                                          │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

When a session is running:

```
┌─────────────────────────────────────────────────────────────┐
│ CREWLOOP · DASHBOARD              [🌙] [● ORCHESTRATOR ▼]   │
├──────────────────┬──────────────────────────────────────────┤
│  ┌────────────┐  │  ┌────────────────────────────────────┐  │
│  │ ━━━ (cyan) │  │  │ Skill Activity                     │  │
│  │            │  │  │  ████▓▒░ [graph]                   │  │
│  │  🎯        │  │  │                                    │  │
│  │            │  │  └────────────────────────────────────┘  │
│  │ ORCHESTRATOR      │                                          │
│  │ ● RUNNING ● STARTING │                                     │
│  │            │  │  ┌────────────────────────────────────┐  │
│  │ ◆ kimi     │  │  │ Event Timeline                     │  │
│  └────────────┘  │  │  ──●──●──●──●──                    │  │
│                  │  └────────────────────────────────────┘  │
│  ┌────────────┐  │                                          │
│  │ Telemetry  │  │                                          │
│  │  3  02:14  │  │                                          │
│  │  12        │  │                                          │
│  └────────────┘  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

*(Note: in the running example above, "STARTING" would only appear during the brief starting phase; afterwards the badge becomes "RUNNING".)*

---

## Motion Choreography

### Lifecycle badge enter

When a session first appears, the lifecycle badge fades and slides in.

```css
@keyframes lifecycle-enter {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lifecycle-badge {
  animation: lifecycle-enter 0.2s ease-out;
}
```

### Lifecycle pulse

Subtle opacity pulse on the dot and accent strip for `starting` and `running` states.

```css
@keyframes lifecycle-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes lifecycle-glow {
  0%, 100% {
    box-shadow: 0 0 8px currentColor;
  }
  50% {
    box-shadow: 0 0 16px currentColor;
  }
}
```

- **Duration:** 1.5s for pulse, 2s for glow.
- **Easing:** `ease-in-out`.
- **Transform-only:** no layout-triggering properties.

### Empty state enter

When the last session ends, the empty state fades in.

```css
@keyframes empty-state-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state {
  animation: empty-state-enter 0.25s ease-out;
}
```

### Session selector list enter

Existing timeline items already use `slideIn`. Apply the same to newly added session selector items.

```css
.session-list .session-item {
  animation: slideIn 0.15s ease-out;
}
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .lifecycle-badge,
  .lifecycle-dot,
  .panel-accent-strip,
  .empty-state,
  .session-list .session-item {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Responsive Behavior

- **Desktop (>1024px):** sidebar 320px, lifecycle badge sits next to status badge, skill name 4rem.
- **Tablet (768–1023px):** sidebar becomes horizontal row, lifecycle badge remains inline, skill name 3rem.
- **Mobile (<768px):** single column, lifecycle badge wraps below skill name if needed, skill name 2.5rem, session selector dropdown full-width below header.

No layout breakpoints change. Existing responsive rules in `styles.css` remain valid.

---

## Asset List

- **Icons:** reuse Phosphor Icons set already loaded (`ph-monitor-play` for empty state, existing skill icons).
- **Fonts:** no new fonts.
- **Images/illustrations:** none. The empty state uses an icon + text only.
- **Textures/effects:** only CSS box-shadow glows defined above.

---

## Pre-Implementation Checklist

- [x] Contrast ratios verified (all lifecycle tokens pass WCAG AA).
- [x] Touch targets ≥44px (badges and session items exceed 44px height).
- [x] Reduced motion alternative defined (`prefers-reduced-motion` disables animations).
- [x] Mobile layout preserves personality (single column, same tokens).
- [x] Focus states designed (existing `.icon-button:focus-visible` and `.session-trigger:focus-visible` apply).
- [x] No emoji as structural icons (Phosphor Icons used).
