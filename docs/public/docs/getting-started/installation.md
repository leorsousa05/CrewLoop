---
sidebar_position: 3
---

# Installation

CrewLoop is distributed via npm. The CLI installs all skills into your agent's skill directory and configures hooks so the real-time dashboard receives tool-use events.

## Prerequisites

- **Node.js 20+**
- **A compatible AI agent:** Kimi Code, Claude, Codex, or AGY
- **Python 3** (optional — only for running the skill validator)
- **Official DiamondBlock CLI** (optional — only for the DiamondBlock MCP integration; install separately, e.g. `npm i -g diamondblock`)

## Step 1 — Install the CLI

```bash
npm install -g @archznn/crewloop-cli
```

## Step 2 — Install the skills

Install all 19 skills into your agent's default skill directory:

```bash
crewloop install
```

### Install specific skills only

```bash
crewloop install --skill architect --skill engineer
```

### Install for a specific agent

```bash
crewloop install --agent claude
```

Supported agents: `kimi`, `claude`, `codex`, `agy`, `opencode`.

### Install to a custom directory

```bash
crewloop install --target /path/to/your/skills/dir
```

### Preview before installing

```bash
crewloop install --dry-run
```

Dry-run output is prefixed with `dry-run:` and never writes files.

### Install the optional DiamondBlock MCP integration (opt-in)

Normal `crewloop install` never touches MCP configuration. Installing the `diamondblock` skill (Markdown instructions) is not the same as configuring or activating its MCP server — registration is delegated to the official DiamondBlock CLI, which must be installed separately (see Prerequisites).

```bash
crewloop install --diamondblock
```

With an explicit agent, and the fully mutation-free preview variant:

```bash
crewloop install --diamondblock --agent claude
crewloop install --dry-run --diamondblock
```

`--agent` is forwarded to the official installer as `--target`; without it, official auto-detection applies. CrewLoop runs the official dry-run preflight before mutating anything and aborts with exit code 1 if the `diamondblock`/`dblock` binary is missing or the target is unsupported.

## Step 3 — Verify your setup (optional)

Inspect supported agents and their hook config paths:

```bash
crewloop agents
```

Run read-only diagnostics for the package, dashboard, shim, and hook setup:

```bash
crewloop doctor
```

`doctor` prints lines prefixed with `ok`, `warn`, or `error` and exits non-zero only when an error-level check fails. Add `--verbose` to `crewloop install` if you want per-skill and per-hook details; the default output is a minimal summary.

`doctor` also reports four optional DiamondBlock checks as `ok`/`warn` (never `error`): skill presence in the agent skill directory, the `diamondblock`/`dblock` binary on PATH, installer readiness via a bounded official dry-run preflight, and runtime guidance — actual activation is verified inside the agent by exposed MCP tools, so binary or config presence alone does not prove activation. If the DiamondBlock index is missing or stale, run `dblock index run` manually; CrewLoop never indexes automatically.

## Step 4 — Validate (optional)

Confirm all skills are well-formed:

```bash
python3 scripts/validate-skills.py
```

You should see `PASS` for every skill.

## What happens after installation

Once installed, skills are automatically detected and activated by your AI agent based on conversation context. Start any task by describing what you want — the **CrewLoop Hub** skill takes over, asks clarifying questions, and routes the task through the crew.

## Next steps

→ [Your First Task](./first-task) — see the full workflow in action  
→ [CLI Reference](../tools/cli) — all commands and flags
