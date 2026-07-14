# Proposal: Dashboard Redesign & CLI Feature Integration

## 1. Motivation & Context
The current CrewLoop Dashboard functions primarily as an observability tool, capturing agent tool invocations, showing the timeline of events, displaying files changed, and visualizing session networks. While this works well for monitoring, it is completely disconnected from the management capabilities offered by the `@archznn/crewloop-cli`.

Currently, users must configure hooks, install skills, and trigger dry-runs using terminal CLI commands manually. Bringing these features into the dashboard web interface bridges this gap, allowing developers to:
- Visually configure active agent hooks (Kimi Code, Claude, Codex, Agy, Cursor, Windsurf) through a professional GUI.
- Explore and install available skills directly into their local directories without needing to lookup terminal flag syntax.
- Verify skills and configurations with visual logs and dry-runs before installation.
- Interface with the CLI through a clean, modern, and minimalist design system.

Furthermore, the existing UI design is busy and does not meet the "minimalist and professional" aesthetic requested. A complete visual redesign is required to streamline the UI, reduce noise, and present a premium, distraction-free environment for developers.

---

## 2. Goals & Objectives
- **Visual CLI Manager**: Expose core CLI capabilities in the UI, enabling skill installation, hook synchronization, and parameter toggling.
- **Aesthetic Overhaul**: Replace the current design with a clean, high-end, minimalist layout featuring structured columns, a consistent typography scale, and a professional dark mode interface.
- **Unified Navigation**: Merge telemetry, file views, and timeline events with the new CLI management panel into a coherent tabbed or sidebar-driven screen hierarchy.

---

## 3. Scope of Work

### What is In-Scope:
1. **CLI Integration Endpoints**: Introduce HTTP API routes on the dashboard server to read local skill metadata, install skills, and configure agent settings.
2. **CLI Config Panel (`CLIConfigPanel.tsx`)**: Build a dedicated interface showing local skills, their descriptions, active hooks status, and controls to trigger installer logic (directories, symlinks, dry-run).
3. **UI Theme and Layout Overhaul**: Update `App.tsx` and main stylesheets to implement a minimalist, high-contrast professional dark theme.
4. **Improved Directory/File Trees**: Revamp how modified workspace files are displayed.

### What is Out-of-Scope:
- Implementing runtime agent executables.
- Modifying how the CLI is globally published or packaged (remains npm workspaces).
- Altering the core behavior of the hooks parser itself (only programmatic triggering of the hook functions is in-scope).

---

## 4. Architectural & System Constraints
- **Zero Configuration Fallback**: The dashboard must run out-of-the-box using safe defaults. If CLI features fail to run or lack write permission, they must fail gracefully without crash.
- **Monorepo Layout**: The dashboard resides in `servers/dashboard`, while CLI logic resides in `packages/cli`. Backend routes should import CLI configuration functions using workspace-resolved imports.
- **Responsive Layout**: Designed primarily for desktop viewing since developers operate within terminals and desktop IDE environments, but responsive enough to stack panels nicely.
