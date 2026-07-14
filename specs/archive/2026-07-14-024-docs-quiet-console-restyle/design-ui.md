# Design-UI: Docs Site — Quiet Console (Reading Edition)

> Adapts the dashboard's "Quiet Console" system (spec 023, `specs/archive/2026-07-14-023-dashboard-full-redesign/design-ui.md`) to the docs site. Token values are **verbatim** unless a section explicitly marks a docs-only derivation.

## 1. Brand Narrative & Case-Study Frame

- **Problem:** A visitor landing on CrewLoop's docs needs to orient in the role-separated workflow fast — what it is, how to install it, which skill does what — and then read long-form reference material comfortably. Today the site answers with a neon SaaS pitch deck; the dashboard answers with a calm instrument panel. Same product, two personalities.
- **Audience:** Developers evaluating or adopting CrewLoop — skeptical, scanning, allergic to marketing gloss. They arrive from the repo or the dashboard and expect the same voice in both places.
- **Insight:** CrewLoop's docs are the *manual of a console*, not a sales page. The dashboard already found the product's visual voice ("a well-tuned terminal that happens to be beautiful"). The docs don't need a new identity — they need the same identity, re-voiced for reading instead of monitoring.
- **Solution:** One design system, two registers: the dashboard monitors, the docs explain — same graphite, same indigo pulse, same hairline panels, with a reading column tuned for prose.

## 2. Aesthetic Direction Statement

**Thesis: Linear-like Minimalist (dominant), with Editorial as a supporting influence inside the reading column only.** The emotional effect is *calm authority*: a field manual that feels machined, not marketed. This is spec 023's thesis carried over by explicit user directive — the novelty of this design is the *register shift*, not a new style.

References that shaped this output:

- `references/reference-library.md` — selection rule applied honestly: Editorial is the textbook pick for docs, but the product's emotional job is already solved by Linear-like Minimalist; Editorial enters only as the supporting influence for prose rhythm (measure, leading, hierarchy), never as an equal partner.
- `references/typography-playbook.md` — the decisive input for the reading-face decision: "mono should be reserved for code, paths, labels, and operational metadata" and "the body face must be highly readable for long-form scanning." Long-form mono prose violates both; the hybrid in §4 follows the playbook while preserving the console identity.
- `references/layout-patterns.md` — asymmetrical hero for the landing (no center-stack), dense utility stack for sidebar/nav chrome, "let one component dominate" for the workflow visual.
- `references/anti-patterns.md` — the current site is a catalog of them (glassmorphism as decoration, neon cards, dual-accent palette, equal-weight grids); this spec is the correction cue applied section by section.
- `specs/archive/2026-07-14-023-dashboard-full-redesign/design-ui.md` — the primary reference: every token, motion rule, and rejection below descends from it.

## 3. Color System

All tokens are **verbatim from the dashboard** (`servers/dashboard/ui/src/styles/index.css`) — same names, same values, both themes (`:root` dark default, `html.light` overrides). The full table lives there; the docs must not re-derive a single value.

Verified contrast for the **reading context** (computed, WCAG formula):

| Pair | Dark | Light | Rule |
|------|------|-------|------|
| `--text-primary` on `--bg-base` (prose body) | 17.41:1 ✅ | 17.09:1 ✅ | prose body, headings |
| `--text-secondary` on `--bg-base` | 8.75:1 ✅ | 4.84:1 ✅ | secondary prose, descriptions |
| `--text-muted` on `--bg-base` | 4.50:1 ⚠️ | 2.86:1 ❌ | meta only, ≤`label`; in light, never for meaning-bearing text — use `--text-secondary` |
| `--text-muted` on `--bg-surface` | 4.23:1 ❌ | — | on panels, meta uses `--text-secondary` |
| `--accent` on `--bg-base` (links) | 5.77:1 ✅ | 4.16:1 ❌ | dark-theme prose links |
| `--accent-strong` on `--bg-base` (links) | — | 6.33:1 ✅ | **light-theme prose links MUST use `--accent-strong` + underline** |
| `--text-primary` on `--bg-inset` (code) | 17.93:1 ✅ | 15.93:1 ✅ | code slabs, inline code |

Status tokens (`--success`, `--warning`, `--error`, `--running`) are used at `/5`–`/10` backgrounds with full-strength text — same pattern as dashboard badges.

## 4. Typography System — deliberate docs-only derivations

**Decision (docs-only, recorded per the Architect's deferral):** chrome stays 100% dashboard; the reading column gets a prose register.

| Zone | Family | Why |
|------|--------|-----|
| Chrome (navbar, sidebar, buttons, labels, breadcrumbs, meta) | JetBrains Mono, dashboard type scale verbatim | Identity anchor — chrome must be indistinguishable from the dashboard's |
| Display / wayfinding (hero, section titles, doc H1–H3) | Space Grotesk | Dashboard display face; editorial rhythm needs it at `display-3xl`–`heading` |
| **Prose body (paragraphs, lists, blockquotes in markdown)** | **Plus Jakarta Sans** (already loaded — no new dependency) | typography-playbook: mono is not a reading face; 13px/1.5 mono paragraphs fail "highly readable for long-form scanning" |
| Code (blocks, inline, paths, commands) | JetBrains Mono | unchanged |

**Prose tokens (docs-only derivations):**

| Token | Value | Usage |
|-------|-------|-------|
| `--text-prose` | 15px | prose body (between dashboard `body` 13 and `heading` 16 — deliberately off-scale, documented) |
| `--leading-prose` | 1.65 | prose paragraphs/lists |
| `--text-prose-sm` | 13px | prose small print, footnotes (reuses dashboard `body` size in the sans face) |
| `--measure` | 68ch | reading column max-width |

**Display-scale extension (docs-only, hero follow-up):** `--text-display-3xl: 44px` — one step above the dashboard's 36px ceiling, used by the landing hero H1 only to balance the taller terminal column. The rest of the display scale stays verbatim.

Markdown heading mapping (dashboard tokens verbatim): H1 → `display-xl` Space Grotesk 600; H2 → `display-lg` Space Grotesk 600; H3 → `heading` Space Grotesk 600; H4 → `body` JetBrains Mono 700, uppercase, `letter-spacing: 0.08em`. Body 15px/1.65 Plus Jakarta Sans 400; strong 600; prose links per §3 rules.

If the Engineer finds Plus Jakarta Sans unused anywhere else after the sweep, the import stays solely for prose — that is the intended cost of the deviation.

## 5. Design Tokens

Spacing, radii, shadows, type scale, animations: **verbatim from the dashboard** (spacing 4–64px, radii 4–12px, `--shadow-0…3` + `--shadow-live`, 8-step scale, component classes `.panel`/`.label`/`.kbd`/`.chip`/`.btn-primary`/`.btn-ghost`). Docs-only additions beyond §4:

| Token | Value | Usage |
|-------|-------|-------|
| `--status-bg-alpha` | n/a — use Tailwind `/5` and `/10` opacity on status colors | alert panels, badges (dashboard pattern) |

No new shadows, radii, or spacing values. Glass tokens, glows, isometric utilities, and neon scrollbars are deleted, not replaced.

## 6. Component Specs

### Navbar (`App.tsx`)
- 56px height, `bg-surface`, 1px `--border-default` bottom hairline, no shadow.
- Brand chip: Terminal icon (16px, `--accent`), "CrewLoop" in `font-display` `heading` 600.
- Nav links: mono `label`, `--text-secondary`; active = `--text-primary` + 2px `--accent` bottom inset bar; hover = `--text-primary` + `bg-elevated/40`.
- Right cluster: GitHub icon link + `ThemeToggle`.
- Mobile (<768px): links collapse to icon-only; targets ≥44px.

### ThemeToggle
- `btn-ghost` geometry; Phosphor `Moon` (in dark) / `Sun` (in light), 16px; `aria-pressed`, `aria-label="Switch to light theme"` / `"Switch to dark theme"`.
- Motion: icon swap via 150ms opacity crossfade; no rotate gimmick.

### Sidebar (DocsLayout)
- 260px fixed, `bg-base`, 1px `--border-default` right hairline.
- Search: inset input (`bg-inset`, 1px `--border-default`, `radius-md`, mono `label`, placeholder `--text-muted`); focus = border `--focus` (the global 2px ring applies).
- Section headers: `.label` (11px uppercase, 0.12em tracking, `--text-muted` in dark / `--text-secondary` in light per §3).
- Nav item: mono `label`, 32px height, `radius-sm`; active = `bg-accent-dim` + `--accent-strong` text + 2px `--accent` left bar; hover = `bg-elevated/40`.
- Mobile: off-canvas sheet (`animate-sheet-in`, scrim `--overlay`), ≥44px rows.

### Panels / cards (landing)
- `.panel` verbatim (hairline, `bg-surface`, `radius-lg`, `space-md` padding).
- Interactive card hover: `bg-elevated` + `--border-strong` border — **no lift, no glow, no shadow change** (dashboard discipline).
- Core skills: asymmetric 2-column panels (larger, with 1-line role description). Supporting skills: dense 3-column compact grid (name + icon only, 12px). This kills the equal-weight-grid anti-pattern while preserving all content.
- Skill modal: scrim `--overlay`, `.shadow-modal`, `.animate-modal-in`, `radius-xl`, ESC/backdrop close, focus trap (existing behavior preserved).

### Install panel / typewriter (hero)
- `bg-inset` slab, hairline border, `radius-lg`; header row with `micro` uppercase muted label "install" + copy `btn-ghost`.
- Typewriter survives **simplified**: mono `body` text, caret = 1px `--accent` block blink (opacity only, 1s steps). It is content motion (the command materializing), not decoration. Reduced-motion: full command rendered instantly, no caret blink.

### SkillVisualizer & TerminalSimulator
- Survive, restyled: nodes/frames become hairline `.panel` geometry; live/active states use `--accent` + `--shadow-live` only; all cyan/violet/glow removed; edges/labels graphite mono `micro`.
- TerminalSimulator becomes the "reference panel": `bg-inset` + hairline; prompt lines mono `label`; the running line uses `--running`, success `--success` — same semantics as the dashboard timeline. Behavior and its test are preserved.

### Markdown alerts (callouts)
- Hairline panel, `radius-md`, padding `space-sm space-md`, 2px left border in the status color, bg = status `/5` (dark) / `/5` (light, verified legible per §3 text rules).
- Header row: Phosphor icon 16px in status color + `micro` uppercase label: NOTE=`Info`/`--running`, TIP=`Lightbulb`/`--success`, IMPORTANT=`Star`/`--accent`, WARNING=`Warning`/`--warning`, CAUTION=`XCircle`/`--error`. No emoji.

### Code blocks
- `bg-inset` slab, hairline border, `radius-lg`; header: filename/lang `micro` uppercase `--text-muted` + copy `btn-ghost`.
- Code: JetBrains Mono `label` (12px) / 1.6, `tabular` off, `--text-secondary` base.
- Syntax colors mirror the dashboard's FileDiff highlighter: strings `--success`, keywords `--accent` 600, comments `--text-muted` italic, builtins `--running`. Same code = same colors in both apps.
- Inline code: `bg-inset`, hairline border, `radius-sm`, `0.9em`, padding `1px 5px`.

### Tables / lists / blockquotes (markdown)
- Tables: hairline `--border-default` grid; header row `bg-elevated` + `.label`; cell padding `6px 12px`; row hover `bg-elevated/40`.
- Lists: marker `--text-muted`; nested indent `space-lg`.
- Blockquotes: 2px `--border-strong` left border, `--text-secondary` italic off, padding-left `space-md`.

## 7. Layout Structure

### Landing (desktop ≥1024px)

```
┌──────────────────────────────────────────────────────────┐
│  [⬡ CrewLoop]      Home   Docs   GitHub        [☾]       │  ← 56px hairline navbar
├──────────────────────────────────────────────────────────┤
│                                                          │
│  CREWLOOP — eyebrow micro        ┌────────────────────┐  │
│  ## One workflow.                │ install            │  │
│  ## Nineteen specialists.        │ $ npm i -g …▌      │  │  ← asymmetrical hero:
│  Body 15px sans, 2 lines max.    │ [copy]             │  │    thesis left, install slab right
│  [Open the docs] [GitHub]        └────────────────────┘  │
│                                                          │
│  ─ ─ ─ hairline ─ ─ ─                                    │
│  THE LOOP — eyebrow                                      │
│  ┌──────────────────────────────────────────────────┐    │
│  │  SkillVisualizer — hairline nodes, indigo live   │    │  ← one dominant component
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  CORE SKILLS — eyebrow                                   │
│  ┌───────────────┐ ┌───────────────┐                     │
│  │ panel ×6, 2-col, name + role line                    │  │
│  └───────────────┘ └───────────────┘                     │
│                                                          │
│  SUPPORTING CAST — eyebrow                               │
│  ┌─────┐┌─────┐┌─────┐ dense 3-col compact grid          │
│                                                          │
│  SEE IT RUN — eyebrow                                    │
│  ┌──────────────────────┐ ┌──────────────┐               │
│  │ TerminalSimulator    │ │ steps list   │               │
│  └──────────────────────┘ └──────────────┘               │
│                                                          │
│  footer: hairline top, mono micro muted                  │
└──────────────────────────────────────────────────────────┘
```

Mobile: single column; install slab moves below thesis; skill grids → 1-col panels / 2-col compact; SkillVisualizer horizontal-scroll with `snap-x` (dashboard recent-sessions pattern).

### Docs reader

```
┌──────────────────────────────────────────────────────────┐
│  navbar (same as landing)                                │
├──────────────┬───────────────────────────────────────────┤
│ 260px sidebar│  breadcrumb micro mono muted              │
│  [search]    │                                           │
│  SECTION     │  H1 display-xl                            │
│   • item     │  ┌─────────────────────────────────┐      │
│   • active▌  │  │ prose column, max 68ch,         │      │
│  SECTION     │  │ 15px/1.65 Plus Jakarta Sans     │      │
│   • item     │  │                                 │      │
│              │  │ [alert panel]                   │      │
│              │  │ [code slab]                     │      │
│              │  └─────────────────────────────────┘      │
│              │  ← prev | next →  (hairline cards)        │
└──────────────┴───────────────────────────────────────────┘
```

Mobile: sidebar → off-canvas sheet; content full-width with `space-md` padding.

## 8. Real-State Specs

- **Loading (markdown fetch):** skeleton mirroring final layout — 3 `animate-shimmer` bars (title 40% width, two text 100%/80%) + sidebar skeleton rows. Never a lone spinner >1s (dashboard rule).
- **Empty (search, no results):** mono `label` `--text-secondary` — "No docs match "<query>"." No fake CTA (dashboard rejection).
- **Error (fetch failure):** dashboard FileDiff pattern — `bg-inset` well, 2px `--error` left border, `label` secondary text + `btn-ghost` Retry refetching the same route.
- **404 / missing doc:** centered mono block: `display-lg` "Doc not found", `label` muted path, `btn-ghost` "Back to docs index" (real link, not decorative).
- **Success (copy buttons):** label swaps to "Copied" + `Check` icon 150ms fade, reverts after 1.2s; no toast system (none exists — do not add one).
- **Offline:** static site — content already local; no offline state needed beyond the fetch error well. Documented, not designed.
- **Theme switch:** 150ms token crossfade (color transitions on `background-color, border-color, color` 150ms ease-out); Mermaid re-init without scroll jump; no FOUC on reload (anti-FOUC script in Architect's design.md).

## 9. Presentation Mockups

- **Browser-frame (desktop, dark):** graphite window, 56px hairline navbar with a single indigo pixel of life (active nav + Terminal chip); hero reads like a manual's title page — two lines of Space Grotesk, an inset install slab with a blinking indigo caret; the workflow visual sits like a printed diagram, all hairlines, one live node pulsing indigo.
- **Device (mobile, light):** paper-white reader; sidebar as bottom sheet; prose at 15px sans with accent-strong underlined links; code slabs inset gray with hairline frames; theme toggle thumb-reachable at navbar right, 44px.
- **Before/after:** before — cyan glass cards floating on pure black, violet navbar, glow drift, typewriter hero screaming neon; after — the same copy in a machined console manual: nothing glows except what is live, nothing floats except what is modal. Identity survives logo-removal: remove "CrewLoop" and it still reads as the same product as the dashboard.

## 10. Motion Choreography

Dashboard motion set verbatim (transform/opacity only, 150–250ms, `cubic-bezier(0.25, 1, 0.5, 1)` entrances, button press `cubic-bezier(0.34, 1.56, 0.64, 1)` 120ms, global reduced-motion kill-switch). Docs-specific additions:

| Animation | Trigger | Property | Duration | Easing | Reduced-motion fallback |
|-----------|---------|----------|----------|--------|-------------------------|
| Route change (landing ↔ docs) | hashchange | opacity | 150ms | ease-out | instant swap |
| Sidebar sheet (mobile) | menu tap | translateX(-100%)→0, scrim opacity | 250ms | `cubic-bezier(0.25, 1, 0.5, 1)` | instant show |
| Typewriter caret | mount | opacity blink | 1s steps | — | no caret, full text |
| Typewriter typing | mount | text reveal | ~1.2s total | per-char | full text instantly |
| Copy success | click | label/icon opacity swap | 150ms | ease-out | instant swap |
| Theme crossfade | toggle | color/background/border | 150ms | ease-out | instant swap |

No scroll-reveal animations (nothing in the dashboard scroll-reveals; restraint is the identity). No parallax, no cursor glow.

## 11. Asset List

- **Icons:** Phosphor (already a dependency) at 12/16/20px only: `Terminal`, `Sun`, `Moon`, `GithubLogo`, `BookOpen`, `House`, `Info`, `Lightbulb`, `Star`, `Warning`, `XCircle`, `Copy`, `Check`, `CaretLeft`, `CaretRight`, `MagnifyingGlass`. No emoji as structural icons (dashboard rule).
- **Images/textures:** none. No noise, no grain, no mesh, no blur — all rejected by Quiet Console.
- **Fonts:** Space Grotesk + JetBrains Mono + Plus Jakarta Sans (all already loaded; Plus Jakarta survives only for prose per §4).

## 12. Asset Export Spec

No new raster/vector assets. Favicon and existing static assets unchanged.

## 13. Data Visualization Spec

Mermaid is the only data-viz surface: `getMermaidTheme(mode)` maps CSS variables → Mermaid `themeVariables` (background `--bg-surface`, primaryTextColor `--text-primary`, lineColor `--border-strong`, clusterBkg `--bg-inset`, primaryColor `--accent-dim`, primaryBorderColor `--accent`). Dark mode → Mermaid `theme: 'dark'`; light → `theme: 'default'` with the same variable mapping. Diagram frames: hairline `radius-lg` border, `bg-surface`, centered, `space-md` padding.

## 14. User Flow & Interaction Spec

- **Primary navigation:** top navbar (persistent) + docs sidebar; routes unchanged (`#/`, `#/docs/<id>`).
- **Overlays:** skill modal (ESC, backdrop click, focus trap — existing behavior preserved, restyled only); mobile sidebar sheet (scrim tap, ESC).
- **Keyboard:** all interactive elements reachable; global 2px `--focus` ring; search input focusable first in sidebar; theme toggle reachable in navbar tab order. No new shortcuts (dashboard's digit shortcuts are dashboard-only — do not port).
- **Conversion flow:** hero carries both CTAs above the fold ("Open the docs" primary indigo `btn-primary`, "GitHub" ghost); install slab is itself the copy-paste conversion; footer closes with the same docs CTA. No sticky scroll hooks (nothing in this product should nag).

## 15. Pre-Implementation Checklist

- [x] Brand narrative ties direction to audience/problem (§1)
- [x] Singular thesis named + references cited (§2)
- [x] Color tokens verbatim from dashboard; reading-context contrast **verified by computation** (§3)
- [x] Typography intentional; mono-for-prose rejected with playbook citation; deviation documented (§4)
- [x] Tokens complete; docs-only derivations enumerated (§5)
- [x] Component states defined (§6)
- [x] Layout asymmetrical, one dominant component (§7)
- [x] Real states all spec'd (§8)
- [x] Three contextual mockups described (§9)
- [x] Motion table with reduced-motion fallbacks (§10)
- [x] No emoji structural icons; no glows/gradients/glass (§11, §10)
- [x] Modal ESC/backdrop/focus-trap specified (§14)
- [x] CTA above the fold (§14)
- [x] Touch targets ≥44px on mobile (§6)

## Requirement traceability

Addressed: dashboard style parity (verbatim tokens), light+dark, visual-only scope, no new dependencies, all six Architect questions answered (reading face §4, prose measure §4, reading contrast §3, interactive elements §6/§7, callouts/code §6, landing-as-gateway §7).

Deferred to Engineer: nothing visual. Deferred to Shipper: version bumps and archival mechanics.
