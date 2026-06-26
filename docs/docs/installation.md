# Installation

CrewLoop is distributed as a bundle of skills. You install the skills into your AI agent's skills directory so they can be detected and triggered automatically.

## Prerequisites

- Git
- Python 3 (for the validator)
- A compatible AI agent (Claude Code, Kimi Code, etc.)
- Optional: Node.js 20+ if you want to build the documentation site locally

## Step 1: Clone the repository

```bash
git clone https://github.com/leorsousa05/CrewLoop.git
cd CrewLoop
```

## Step 2: Install the skills

Run the install script:

```bash
./scripts/install.sh
```

This copies all `skills/*` directories to `~/.agents/skills/` by default.

### Custom skills directory

If your agent uses a different skills directory, pass it as an argument:

```bash
./scripts/install.sh /path/to/your/skills/dir
```

## Step 3: Validate

Run the validator to ensure all skills are well-formed:

```bash
python scripts/validate-skills.py
```

You should see `PASS` for every skill.

## Step 4: Build the documentation site (optional)

If you want to preview or deploy the CrewLoop website locally:

```bash
cd docs
npm install
npm run build
npm run serve
```

The site will be available at `http://localhost:3000/CrewLoop/`.

## Next steps

Start a task and let the **Orchestrator** guide you. See [Usage Examples](usage-examples) for concrete scenarios.
