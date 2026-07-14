# Design Specification: Dashboard Redesign & CLI Feature Integration

This document defines the visual system, UI components, states, layouts, and motion guidelines for the CrewLoop Dashboard.

---

## 1. Bounded Context & Architecture [Padrões Aplicados]

### Clean API Architecture
All CLI management features are delegated to dedicated HTTP handlers under `/api/cli`. The backend server does not reimplement CLI logic; instead, it imports and calls the core functions of `@archznn/crewloop-cli` synchronously or asynchronously.

### Component-Driven Design (CDD)
The UI is built with React using isolated, reusable presentation components that receive data and callbacks via TypeScript props.

### Design System Integration (Minimalist & Professional)
We define a strict visual design token palette based on CSS variables inside `index.css`. Ad-hoc Tailwind utility classes are scoped to fit this dark-mode-first aesthetic.

---

## 2. Brand Narrative & Case-Study Frame
- **Problem**: Developers running agent teams face context switching between CLI configs (symlinks, hooks, dry-runs) and visual telemetry interfaces. Current telemetry is bloated and visual hierarchy is cluttered.
- **Audience**: Software engineers and system architects demanding a high-fidelity workspace that behaves like a professional developer console.
- **Insight**: Dashboards are more than observation tools; they are command bridges. Minimizing visual distractions (unnecessary glowing cards, neon colors) and maximizing information-density with clean borders yields higher cognitive focus.
- **Solution**: A minimalist, high-contrast, industrial dashboard that visualizes agent telemetry and provides a direct, side-by-side skill/hook management panel.

---

## 3. Color System (Custom Developer HSL Palette)
We use a high-contrast dark theme. Colors are derived custom HSL values ensuring WCAG contrast compliance.

| Token | Light Mode (Fallback) | Dark Mode (Primary) | Usage | Contrast (vs Bg) |
|---|---|---|---|---|
| `--bg-primary` | `hsl(210, 20%, 98%)` | `hsl(220, 13%, 7%)` | Main page background | - |
| `--bg-surface` | `hsl(210, 17%, 95%)` | `hsl(216, 12%, 12%)` | Cards, sidebar, panel containers | 4.8:1 |
| `--bg-elevated` | `hsl(210, 15%, 90%)` | `hsl(215, 14%, 18%)` | Dropdowns, popovers, select fields | 5.2:1 |
| `--text-primary`| `hsl(210, 24%, 16%)` | `hsl(210, 17%, 88%)` | Titles, primary body copy | 12:1 |
| `--text-secondary`| `hsl(210, 16%, 38%)`| `hsl(210, 12%, 66%)` | Muted descriptions, inactive tabs | 6.5:1 |
| `--text-muted` | `hsl(210, 12%, 60%)` | `hsl(210, 10%, 45%)` | Labels, details, placeholder text | 4.6:1 |
| `--accent` | `hsl(212, 100%, 45%)`| `hsl(212, 92%, 60%)` | Interactive actions, active tab borders | 5.1:1 |
| `--success` | `hsl(140, 80%, 30%)` | `hsl(142, 60%, 45%)` | Success logs, installed badge | 4.8:1 |
| `--warning` | `hsl(38, 90%, 42%)`  | `hsl(36, 85%, 55%)`  | Skip status, logs alert | 4.5:1 |
| `--error` | `hsl(0, 75%, 45%)`   | `hsl(0, 84%, 60%)`   | Error/failure status | 4.9:1 |
| `--border` | `hsl(210, 14%, 85%)` | `hsl(215, 14%, 19%)` | 1px panel boundaries | - |
| `--focus` | `hsl(212, 100%, 45%)`| `hsl(212, 92%, 60%)` | Form outline ring | - |

---

## 4. Typography System
Fonts: Display headings use a crisp geometric sans-serif (e.g. system fonts falling back to Inter). Code/Console blocks use a clean monospace font family (e.g. SF Mono, Fira Code).

| Level | Font | Size | Line-height | Letter-spacing | Weight | Usage |
|---|---|---|---|---|---|---|
| H1 | Sans-serif | 1.5rem (24px) | 2.0rem | -0.02em | 600 | Page header |
| H2 | Sans-serif | 1.125rem (18px) | 1.5rem | -0.01em | 550 | Section header |
| H3 | Sans-serif | 0.875rem (14px) | 1.25rem | 0.00em | 600 | Panel details, table labels |
| Body | Sans-serif | 0.875rem (14px) | 1.375rem | 0.00em | 400 | Descriptions, status cards |
| Monospace | Monospace | 0.8125rem (13px) | 1.25rem | 0.00em | 400 | CLI installer log, console |
| Badge | Sans-serif | 0.75rem (12px) | 1.0rem | 0.02em | 600 | Skill name pill, status |

---

## 5. Design Tokens

### Spacing Scale (4px base)
- `--space-xs`: 4px / 0.25rem
- `--space-sm`: 8px / 0.5rem
- `--space-md`: 16px / 1rem
- `--space-lg`: 24px / 1.5rem
- `--space-xl`: 32px / 2rem

### Border Radius Scale
- `--radius-none`: 0px (Used for main layout borders and table layout panels)
- `--radius-sm`: 4px / 0.25rem (Inputs, checklist options)
- `--radius-md`: 6px / 0.375rem (Action buttons, dropdown triggers)
- `--radius-lg`: 8px / 0.5rem (Inner panels, status boxes)

### Elevation / Shadow Scale
- `--shadow-flat`: none
- `--shadow-sm`: 0 1px 2px rgba(0, 0, 0, 0.2)
- `--shadow-md`: 0 4px 12px rgba(0, 0, 0, 0.4)

---

## 6. Layout & Spatial Composition (ASCII Wireframe)
A structured 3-panel split screen under the `CLI Configuration` view. Layout margins are zero, relying on absolute border grids.

```
+-----------------------------------------------------------------------------------+
|  CrewLoop Hub  |  Workspace: /home/arch/codes/crewloop                  v0.8.0    |
+-----------------------------------------------------------------------------------+
|  [OBSERVABILITY]  |  * [CLI CONFIGURATION] *                                      |
+-------------------+------------------------------+--------------------------------+
|  1. CONFIG OPTIONS (30%)                          | 2. SKILL CHECKLIST (40%)        |
|                                                   |                                |
|  Target Directory:                                | Select Skills to Install:      |
|  [/home/arch/codes/crewloop                  ]    | [x] crewloop-hub               |
|                                                   | [x] architect                  |
|  Agent Selection:                                 | [ ] designer                   |
|  [ Kimi Code                       v]             | [x] engineer                   |
|                                                   | [x] reviewer                   |
|  Options Flags:                                   | [ ] shipper                    |
|  [x] Symlink skills folder                        | [ ] security-guard             |
|  [x] Force overwrite destination                  | [ ] accessibility-auditor      |
|  [ ] Dry-run (simulate installation)              | [x] diamondblock               |
|  [x] Configure agent lifecycle hooks              |                                |
|                                                   +--------------------------------+
|  +---------------------------------------------+  | 3. CLI CONSOLE (30%)           |
|  | [ RUN DRY-RUN ]       [ EXECUTE INSTALL ]   |  |                                |
|  +---------------------------------------------+  | > Scanning workspace...        |
|                                                   | > Skills resolved successfully |
|  Hook Sync status:                                | > Hooks written for Kimi Code  |
|  - Kimi Code: ✓ Configured                        | > Done. Installed 5 skills     |
|  - Claude:    - Unconfigured                      |                                |
+---------------------------------------------------+--------------------------------+
```

---

## 7. Component Specs
- **Form Controls**: Outlined with `--border`. Active focus states apply `--border-active` outline (no glowing blur shadows).
- **Tab Triggers**: Flat button elements with `--text-secondary`. Active states switch to `--text-primary` and highlight with a solid 2px accent bar at the bottom.
- **Skill Checklist Item**: Horizontal padding `--space-sm`, interactive hover state transitions background to `--bg-elevated` and changes border color.

---

## 8. Real-State Specs
- **Loading State**: Background shimmer/skeleton components for the skills checkbox list. Main action buttons show a disabled spinner loader during installer actions.
- **Empty State**: Detailed placeholder instructions in the CLI console before execution is started.
- **Error State**: Displays red terminal logs within the console view showing details of disk access errors or write failures.

---

## 9. Motion Choreography
Animations must be minimal, performant, and support reduced-motion fallbacks.

| Animation | Trigger | Property | Duration | Easing | Reduced-motion fallback |
|---|---|---|---|---|---|
| Tab Swap | Navigation click | opacity, transform | 150ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Static replacement |
| Action Start | Click | scale | 80ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Instant state swap |
| Log Append | Console stdout | opacity, translateY | 120ms | ease-out | Immediate append |

---

## 10. Data Visualization & Telemetry Specs
- **Timeline & Event logs**: Displayed as a continuous stream of rows separated by 1px borders. Tool classifications (e.g. read/write/bash) are tagged with specific badge border accents.
- **Workspace File Trees**: Mapped in folders. Modifying files highlights them with a green indicator; read files highlight in subtle slate-blue.
