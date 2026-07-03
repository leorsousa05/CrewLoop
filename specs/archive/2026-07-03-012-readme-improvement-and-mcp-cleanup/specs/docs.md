# Specification Delta: Documentation Updates & Deletion

## Bounded Context
- **Root Repository Documentation:** `README.md`, `AGENTS.md`
- **Servers Directory:** `servers/obsidian-mcp`

---

## 1. Directory Tree Changes
Below is the directory tree mapping the files to be modified or deleted.

```text
crewloop/
├── AGENTS.md (MODIFIED: Remove Obsidian MCP references)
├── README.md (MODIFIED: Remove Obsidian MCP, add CLI, Dashboard, Hooks details, & aesthetic alerts)
└── servers/
    └── obsidian-mcp/ (DELETED)
```

---

## 2. README.md Specifications

### A. CLI Commands & Options
Modify the "Quick Start" or add a new "CLI Commands" section detailing the following flags:
* `crewloop install`: Installs skills to target path.
  * `--symlink`: Link skills instead of copying them (crucial for local development).
  * `--force`: Overwrite existing skill configurations.
  * `--dry-run`: Output actions without making filesystem changes.
  * `--agent <agent>`: Target configuration for specific agents (e.g. `claude`, `kimi`, `codex`, `agy`).
* `crewloop list`: Lists all currently available skills and active configurations.
* `crewloop dashboard`: Launches the real-time WebSocket dashboard.

### B. Real-time Activity Dashboard
Add a new section details:
* How to run the dashboard (defaults to `http://127.0.0.1:7890` or custom port via `CREWLOOP_DASHBOARD_PORT`).
* Alternative launch via CLI (`crewloop dashboard`) or source build:
  ```bash
  cd servers/dashboard
  npm install
  npm run dev
  ```
* UI keyboard shortcuts (`Cmd/Ctrl+K` for command palette).

### C. Supported Agents Hooks
Specify supported agents (`kimi`, `claude`, `codex`, `agy`) and clarify that the CLI hooks shim files in their specific configuration directories to capture tool calls and pipe them to the dashboard WebSocket.

### D. Aesthetic improvements
* Use GitHub Markdown alert blocks (e.g. `> [!IMPORTANT]`) to emphasize critical hub-and-spoke rules.
* Present the linear routing example:
  $$\text{Orchestrator} \rightarrow \text{Architect} \rightarrow \text{Orchestrator} \rightarrow \text{Engineer} \rightarrow \text{Orchestrator} \rightarrow \text{Reviewer} \rightarrow \text{Orchestrator} \rightarrow \text{Shipper}$$

---

## 3. AGENTS.md Specifications
* Remove Obsidian MCP from the "The 18 Skills" or "Repository Structure" table and folders.
* Remove `servers/obsidian-mcp/` entry in the main overview layout table.
* Ensure references to MCP server name or path are stripped.

---

## 4. Docusaurus Documentation Specifications
* **`docs/docs/contributing/repository-structure.md`**: Remove references to `servers/obsidian-mcp/` from the repository structure layout map.
* **`docs/docs/tools/obsidian-mcp.md`**: Delete this markdown file entirely as it is now obsolete.
* **`docs/sidebars.js`**: Remove the `'tools/obsidian-mcp'` item from the sidebar navigation array.

---

## 5. Obsidian MCP Deletion Specifications
* Delete the directory `/home/arch/codes/crewloop/servers/obsidian-mcp/` and all its children.
