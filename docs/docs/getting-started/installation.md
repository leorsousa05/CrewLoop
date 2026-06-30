---
sidebar_position: 3
---

# Installation

CrewLoop is distributed via npm. The CLI installs all skills into your agent's skill directory and configures hooks so the real-time dashboard receives tool-use events.

## Prerequisites

- **Node.js 20+**
- **A compatible AI agent:** Kimi Code, Claude, Codex, or AGY
- **Python 3** (optional — only for running the skill validator)

## Step 1 — Install the CLI

```bash
npm install -g @archznn/crewloop-cli
```

## Step 2 — Install the skills

Install all 18 skills into your agent's default skill directory:

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

Supported agents: `kimi`, `claude`, `codex`, `agy`.

### Install to a custom directory

```bash
crewloop install --target /path/to/your/skills/dir
```

### Preview before installing

```bash
crewloop install --dry-run
```

## Step 3 — Validate (optional)

Confirm all skills are well-formed:

```bash
python scripts/validate-skills.py
```

You should see `PASS` for every skill.

## What happens after installation

Once installed, skills are automatically detected and activated by your AI agent based on conversation context. Start any task by describing what you want — the **Orchestrator** skill takes over, asks clarifying questions, and routes the task through the crew.

## Next steps

→ [Your First Task](./first-task) — see the full workflow in action  
→ [CLI Reference](../tools/cli) — all commands and flags
