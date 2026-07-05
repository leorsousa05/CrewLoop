# Unified Design & Architecture: React Docs Migration

---

## Part 1: Brand & Aesthetic Direction

### 1. Brand Narrative & Case-Study Frame
- **Problem**: Most AI agent systems feel abstract and invisible. The landing page needs to present CrewLoop as a highly structured, professional developer platform rather than a cluttered index.
- **Audience**: Engineers, tech architects, and AI developers. They expect clear visual evidence of how the platform structures workflow handoffs.
- **Solution**: Restructure the homepage to feature:
  1. An alternating showcase of features with clean screenshots next to description text blocks.
  2. An interactive Sidebar Skills Catalog grouping the 18 active skills into a single dashboard component.
  3. A spacious split comparison block showing standard agent risks vs CrewLoop gates.

### 2. Aesthetic Direction Statement
The design direction is **Futuristic Glassmorphic** combined with **Terminal Monospace** details, heavily inspired by gaming launcher UIs (like Hydra Launcher). It features a pitch-black background (`bg-black`) with sharp, glowing teal-to-emerald gradients, prominent copy-to-clipboard CLI widgets, and interactive panels with cyan border indicators on hover.

---

## Part 2: Design Tokens & Systems

### 3. Color System

| Token | Dark mode (Primary) | Usage |
|-------|------------|-------|
| `--bg-primary` | `#000000` | Main page background (solid black) |
| `--bg-surface` | `#0b0a0f` | Sidebar containers, inactive menu items |
| `--bg-elevated` | `#121117` | Modals, active sidebar tabs, focused panels |
| `--text-primary` | `#f8fafc` | Primary titles and body copy |
| `--text-secondary` | `#94a3b8` | Subheadings and descriptive text |
| `--accent` | `#06b6d4` | Primary action colors (cyan) |
| `--success` | `#10b981` | Completed builds, successful states (emerald) |
| `--border` | `rgba(38,38,38,0.4)` | Subtle panel dividers |

---

## Part 3: Component Specs & Layout

### 5. Core Components Specification

#### Alternating Feature Showcase
- **Layout**: Alternate content columns per section:
  - Row 1: Left: [Discovery Mockup] | Right: [Title + Specs explanation]
  - Row 2: Left: [Title + Specs explanation] | Right: [Blueprint Mockup]
  - Row 3: Left: [Build/Ship Mockup] | Right: [Title + Specs explanation]
- **Transitions**: Smooth scaling on hover over mockups.

#### Interactive Sidebar Skills Catalog
- **Structure**:
  - **Left Sidebar**: 2-column or simple list grouping:
    - *Core Flow*: Orchestrator, Architect, Designer, Engineer, Reviewer, Shipper.
    - *Specialist Advisors*: Project Brainstorm, Long-term Manager, Docs Writer, Tester, etc.
  - **Right Detail Panel**: Displays selected skill description, constraints list (Never Does), and a CTA button `Read the Skill Guide` linking to its docs path.
- **Style**: Active sidebar buttons highlight with a solid cyan left border (`border-l-2 border-cyan-500`) and a glowing background.

### 6. Layout Structure (SaaS Product Pitch & Visual Handoff Flow)

```
+------------------------------------------------------------+
|  [Logo] CrewLoop             [Features]  [Docs]  [GitHub]  |  Header (Nav)
+------------------------------------------------------------+
|                                                            |
|          THE AUTONOMOUS DEV CREW FOR ELITE TEAMS           |  Subtitle Tag
|          Your software team on autopilot.                  |  Hero Pitch Title
|          $ npm i -g @archznn/crewloop-cli && ...           |  CLI Copy Widget
|                                                            |
+------------------------------------------------------------+
|                                                            |
|                 [Skill Flow Visualizer]                    |  Graphical Flow Map
|                                                            |
+------------------------------------------------------------+
|  Alternating Feature Sections:                             |
|  [Image Left] ---------> [Text Right: 01 Discovery]        |  Alternating Feature
|  [Text Left: 02 Spec] -> [Image Right]                     |  Showcase Layout
|  [Image Left] ---------> [Text Right: 03 BUILD]            |
+------------------------------------------------------------+
|                                                            |
|  Interactive Skills Catalog                                |  Integrated Sidebar
|  +--------------------+---------------------------------+  |  Skills Directory
|  | Core Flow          |  Orchestrator Detail Panel      |  |
|  | - Orchestrator [x] |  Role: Discovery & Routing Hub  |  |
|  | - Architect        |  Constraints:                   |  |
|  | Supporting         |  - Never writes code            |  |
|  | - Tester           |  [ Read the Skill Guide ]       |  |
|  +--------------------+---------------------------------+  |
+------------------------------------------------------------+
```
