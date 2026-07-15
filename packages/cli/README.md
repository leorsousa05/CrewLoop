# @archznn/crewloop-cli

CLI for installing [CrewLoop](https://leorsousa05.github.io/CrewLoop/) skills into your agent's skills directory.

## Install

```bash
npm install -g @archznn/crewloop-cli
```

Requires Node.js 18 or newer.

## Usage

```text
crewloop <command> [options]

Commands:
  install              Install CrewLoop skills and configure agent hooks
  list                 List available skills
  agents               List supported agents and hook paths
  doctor               Diagnose CLI, dashboard, and hook setup
  dashboard            Start the real-time skill dashboard
  version              Show version
  help                 Show this help message
```

Run `crewloop help <command>` or `crewloop <command> --help` for command-specific usage.

Install all skills:

```bash
crewloop install
```

Install specific skills:

```bash
crewloop install --skill architect --skill engineer
```

Install to a custom directory:

```bash
crewloop install --target /path/to/skills
```

Install for a specific agent:

```bash
crewloop install --agent claude
```

List available skills:

```bash
crewloop list
```

Inspect supported agents and their hook config paths:

```bash
crewloop agents
```

Diagnose the package, dashboard, shim, and hook setup (read-only):

```bash
crewloop doctor
```

Start the dashboard:

```bash
crewloop dashboard --port 8080
```

Link skill payloads for local development:

```bash
crewloop install --symlink --force
```

`--symlink` creates a real wrapper for each installed skill, materializes its rewritten `SKILL.md`, and links the remaining skill-local payloads. Shared CrewLoop files use a reserved namespace so they cannot overwrite local references or assets:

```text
<target>/<skill>/
├── SKILL.md
├── references -> <skill-source>/references
├── assets -> <skill-source>/assets
└── _crewloop/
    ├── references -> <shared-source>/references
    └── assets -> <shared-source>/assets
```

Re-run the command after changing a source `SKILL.md`; linked references and assets update immediately.

## Options

- `--target <dir>` — custom target directory
- `--skill <name>` — install only a specific skill (repeatable)
- `--agent <agent>` — target agent convention (`kimi`, `claude`, `codex`, `agy`, `opencode`, `cursor`, `windsurf`)
- `--port <number>` — dashboard port (default: 7890)
- `--host <address>` — dashboard host (default: 127.0.0.1)
- `--symlink` — link skill payloads inside a safe installed wrapper
- `--force` — overwrite existing skills
- `--dry-run` — preview actions without installing
- `--hooks` — configure agent hooks (default)
- `--no-hooks` — skip agent hook configuration
- `--verbose` — show per-skill and per-hook install details
- `-v, --version` — show version
- `-h, --help` — show help

## Output and errors

Output is minimalist and script-friendly: no color, no emoji, no spinners. Successful results go to stdout; errors go to stderr and begin with `error:`.

```text
$ crewloop install
installed 19 skills to /home/user/.agents/skills
hooks: 2 configured, 3 skipped
next: crewloop dashboard
```

Exit codes:

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Runtime failure or unknown command |
| `2` | Usage error: unknown flag, missing value, unexpected argument, invalid port |

Unknown flags and commands fail loudly with a usage hint instead of being silently ignored.


## Publishing

`@archznn/crewloop-cli` is published automatically by the GitHub Actions workflow in `.github/workflows/publish-npm.yml` whenever a `v*.*.*` tag is pushed. The `@archznn/crewloop-skills` package is published first, then the CLI.

## License

[MIT](../../LICENSE.md)
