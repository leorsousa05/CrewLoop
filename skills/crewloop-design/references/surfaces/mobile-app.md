# Surface: Mobile App

## Anatomy

1. **Status bar zone** — OS-owned; extend background color/image into it, never place content there.
2. **Top app bar** (44-56px) — screen title, back action left, ≤2 actions right; collapses on scroll only for long reading surfaces.
3. **Content region** — scrollable, primary surface; pull-to-refresh where content updates remotely.
4. **Primary action zone** — floating action button or full-width bottom CTA, one per screen.
5. **Bottom navigation** (56-64px + safe-area inset) — 3-5 top-level destinations, labels always visible.
6. **Modal/sheet layer** — bottom sheets for secondary flows (filters, pickers, share), drag handle + scrim behind.
7. **Toast/snackbar zone** — transient feedback above the bottom nav, never covering the primary CTA.

## Density & spacing

- Base grid: 8px; screen horizontal padding 16px (20px for reading-heavy screens).
- List rows: 48-64px tall with one thumb or icon, one title, one meta line; 72-80px only for two-line media rows.
- Card padding 16px; section gaps 24-32px; keep density higher than desktop web — mobile screens punish waste.
- Content width: full-bleed within padding; never letterbox content into a desktop-style max-width column on phones.
- Bottom padding of scroll content: bottom nav height + 16px, so the last item is never trapped under chrome.

## Navigation

- **Bottom nav for 3-5 peer destinations** — the default for consumer apps; label + icon, active state via accent color and filled icon.
- **Drawer only when destinations exceed 6** or are rarely used (settings, legal); never put the primary task behind a drawer.
- Stack navigation for drill-down: system back gesture (edge swipe) must always work; provide an explicit back chevron too.
- Tabs (segmented control) for 2-4 same-level views within one screen — not a substitute for bottom nav.
- Responsive: at tablet width (≥768px), bottom nav becomes a side rail; sheets become centered dialogs.

## Real states

- **Loading:** skeleton rows matching final layout; spinner only for full-screen first load with no cached content.
- **Empty:** illustration optional, one sentence of copy, one CTA; sized to the empty region, not a full-screen takeover for a small list.
- **Error:** inline banner with retry for content failures; destructive-action errors as dialogs; never a dead screen.
- **Success:** snackbar with undo where reversible (delete, archive); toast auto-dismiss ≤4s.
- **Offline:** required for any app with read behavior — persistent offline banner, cached content marked stale, queued actions (send, save) with pending indicator, clear sync-conflict resolution on reconnect.

## Motion posture

- Budget: ≤4 justified animations — screen push/pop transitions, sheet present/dismiss, one feedback animation (like, toggle), shared-element transition only if the platform does it natively.
- Durations: 150-250ms for feedback, 250-350ms for screen/sheet transitions; transform/opacity only.
- Never spring overshoot on utility surfaces; modest spring is acceptable only in consumer/Playful registers for delight moments (reorder, pull-to-refresh release).
- Never parallax on scroll, never looping decorative animation, never cursor effects (no cursor exists).
- Reduced motion: replace slides with crossfades or instant swaps; pull-to-refresh shows a static indicator.

## Interaction specifics

- **Touch targets ≥44×44px** (iOS) / 48×48dp (Android); visible control may be smaller, hit area may not.
- **Thumb zone:** primary actions in the bottom half of the screen; destructive actions top-right or behind confirmation, away from the thumb's resting path.
- **Gestures:** swipe-to-act on list rows (archive, delete) must have a visible equivalent (edit button, context menu) — never gesture-only; pinch-to-zoom only on media and maps; long-press for context menus, always with discoverable alternative.
- **Pull-to-refresh** on remote lists; **horizontal swipe between tabs** only when tabs are siblings with no vertical-scroll conflicts.
- Forms: input focus scrolls the field above the keyboard; primary submit in the keyboard toolbar or sticky bottom; return key advances to the next field.
- Bottom sheets: swipe-to-dismiss, scrim tap dismisses, detents at 50%/90% heights — never a sheet that traps the user.

## Default register & pairings

- **Default: Quiet / Product Default** — system fonts (SF Pro / Roboto or `system-ui` stack), platform-native controls, near-zero chrome decoration.
- **Works:** Playful/Toy-like for education, kids, habit trackers (larger radii, spring feedback earned); Organic/Natural for wellness and food apps; Luxury/Refined for premium finance or concierge apps.
- **Clashes:** Brutalist (fights platform conventions users rely on), Industrial on consumer apps, any register that replaces native pickers/steppers with custom gimmicks.

## Common pitfalls

- AI-slop signature: gradient splash screen + glassmorphic cards + glow FAB + parallax header on a utility app — platform conventions exist, respect them.
- Five bottom-nav items where two are destinations nobody visits weekly; consolidate into one screen or a drawer.
- Gesture-only critical actions (delete only via swipe) with no discoverable alternative.
- Ignoring safe areas: CTA clipped by the home indicator, top bar colliding with the notch, landscape never tested.
- Web habits transplanted: hover states, 32px tap targets, right-click menus, desktop tables crammed into 375px.
