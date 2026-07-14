# Spec Delta: Dashboard UI & API Endpoints

This document details the modifications, additions, and removals required for the dashboard redesign.

---

## 1. Directory Structure Changes
```
servers/dashboard/
├── src/
│   ├── server.ts                    # [MODIFIED] Add route registration for CLI API
│   └── api/
│       └── cli.ts                   # [ADDED] REST handlers for listing/installing skills and sync hooks
└── ui/
    └── src/
        ├── App.tsx                  # [MODIFIED] Overhauled layout, navigation, and state
        ├── index.css                # [MODIFIED] Style definitions for minimalist dark theme
        └── components/
            └── CLIConfigPanel.tsx   # [ADDED] UI panel for managing skills and hooks
```

---

## 2. API Deltas (Backend)

### ADDED: `servers/dashboard/src/api/cli.ts`
This file exposes the API handlers interfacing with the CLI packages:
- **`GET /api/cli/skills`**: Scan available skills in `@archznn/crewloop-skills` (or relative `skills/` directory) and return their YAML frontmatter metadata (name, description).
- **`POST /api/cli/install`**: Executes the CLI installer script programmatically.
- **`POST /api/cli/hooks`**: Synchronizes agent hooks dynamically.

### MODIFIED: `servers/dashboard/src/server.ts`
- Register routing checks for `/api/cli/skills`, `/api/cli/install`, and `/api/cli/hooks`.
- Import the handers from `./api/cli`.

---

## 3. UI Deltas (Frontend)

### ADDED: `servers/dashboard/ui/src/components/CLIConfigPanel.tsx`
A React component implementing:
- A form to customize installation options:
  - Custom target directory text field.
  - Active agent selection dropdown (Kimi, Claude, Codex, Agy, Cursor, Windsurf).
  - Toggles for `--symlink`, `--force`, `--dry-run`, and `--hooks`/`--no-hooks`.
- Interactive skill list:
  - Display checklist of all available skills.
  - Select all / Deselect all options.
- Visual Console:
  - Live console view showing output/success logs of the dry-run or installation process.
- Hook Status Manager:
  - Toggle switch to active/deactivate hooks config for the selected agent.

### MODIFIED: `servers/dashboard/ui/src/App.tsx`
- **Layout Redesign**: Remove the current cluttered sidebar and multi-panel graph layouts. Establish a clean, professional two-column or tabbed interface.
- **Minimalist Aesthetic**:
  - Implement a uniform color scheme: deep slate/charcoal backgrounds (`#0b0f19` / `#161b22`), high-contrast clean borders (`#30363d`), and soft muted text offsets (`#8b949e`).
  - Use modern sans-serif typography (e.g. Inter/system fonts) with clear spacing.
  - Collapse timeline and file views into sub-sections or dedicated tabs to reduce active visual cognitive load.
- **CLI Configuration Tab**: Add a new core navigation tab for `CLI Configuration` alongside `Observability` (Overview/Timeline/Network/Files).
