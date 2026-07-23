# Surface: SaaS App

The SaaS app shell is a working environment, not a showcase. Priorities: predictable structure, fast keyboard access, and settings that never hide.

## Anatomy

1. Sidebar: workspace switcher at top, primary nav sections grouped with labels, user/team footer — 220-260px, collapsible to 56px icons.
2. Top bar: breadcrumb or current-view title, global search / command palette trigger, notifications, avatar — 48-56px, sticky.
3. Content region: page header (title + primary action), then the main view; max-width ~1200px for forms and reading, fluid for tables and canvases.
4. Secondary panel (contextual): detail inspector or right rail, 280-360px, dismissible, never required for the core task.
5. Command palette: overlay centered at ~40% viewport height, 560-640px wide, triggered by `Ctrl/Cmd+K`.

## Density & spacing

- Base grid: 4px; content padding 24-32px desktop, 16px mobile.
- Form fields: 40-44px tall inputs, 8px label-to-field gap, 24px between field groups.
- Sidebar nav items: 32-36px tall, icon + label, 4px radius, selected state = surface tint + weight, not a colored pill everywhere.
- Type: 14px body, 13px secondary/meta, 20-24px page titles; one family, usually the system stack.

## Navigation

- Sidebar is the source of truth for sections; top bar never duplicates it with a second nav.
- Deep views use breadcrumbs (`Section / Object / Tab`) and preserve sidebar state.
- Keyboard: `Ctrl/Cmd+K` palette is mandatory for apps with >10 routes or actions; `g then key` shortcuts are optional but documented in-app if present.
- Responsive: below 1024px sidebar collapses to icons; below 768px sidebar becomes an overlay drawer and the palette stays reachable from the top bar.

## Real states

- Loading: shell renders instantly (sidebar + top bar are static); content area shows skeletons matching the real layout.
- Empty: first-run views get a genuine zero state — what this area does, one CTA, optional sample data toggle; never a dead chart.
- Error: inline banner at the content top for load failures (with retry), inline field errors for forms; toasts only for async confirmations.
- Success: non-blocking toast or inline confirmation, auto-dismiss 3-5s, never a modal that must be closed.
- Permission/billing: locked features show an explicit upgrade state, not a hidden menu item or a silent 403.

## Motion posture

- Budget: 0-3 animations. Legitimate uses: palette/overlay enter (150-200ms opacity + 8px translate, `ease-out`), sidebar collapse (150ms width via transform-safe layout or opacity swap), toast slide-in.
- Never: spring overshoot, page-transition reveals between routes, animated gradient backgrounds, cursor effects.
- Route changes render instantly; perceived speed comes from the static shell, not from transitions.

## Interaction specifics

- Command palette: fuzzy search over routes, actions, and recent objects; arrow-key navigation, `Enter` executes, footer lists shortcuts.
- Forms: labels above inputs (never placeholder-only), inline validation on blur, destructive actions gated by confirm dialog or typed confirmation.
- Onboarding: 2-4 step setup checklist in-product (dismissible, progress persisted), not a 7-slide carousel; ask only for what the first session needs.
- Save model: autosave with a visible "saved" indicator for documents/settings; explicit save button for forms with side effects.

## Default register & pairings

- Default register: Quiet / Product Default; Linear-like Minimalist works for the shell if the marketing site already uses it.
- Works: Industrial / Utilitarian for devtool and infra products.
- Clashes: Playful, Organic, Brutalist — anything that fights tabular data, dense forms, or long daily sessions.

## Common pitfalls

- Marketing-site styling leaking into the app: display fonts, oversized padding, hero imagery inside a settings page.
- Onboarding as a slideshow with illustrations and "Next" buttons instead of a checklist that sets the product up.
- Placeholder-only form labels, validation that fires on every keystroke, and errors announced only in red color.
- A command palette listed in the footer but missing, or `Ctrl/Cmd+K` bound but searching nothing beyond page titles.
- Sidebar nav with gradient-icon pills, bounce hover effects, and 10px padding that breaks scan speed — the AI-slop SaaS signature.
