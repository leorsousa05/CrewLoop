# @archznn/crewloop-cli

CLI for installing [CrewLoop](https://leorsousa05.github.io/CrewLoop/) skills into your agent's skills directory.

## Install

```bash
npm install -g @archznn/crewloop-cli
```

## Usage

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

## Options

- `--target <dir>` — custom target directory
- `--skill <name>` — install only a specific skill (repeatable)
- `--agent <agent>` — target agent convention (`kimi`, `claude`, `codex`, `cursor`, `windsurf`)
- `--symlink` — create symlinks instead of copying
- `--force` — overwrite existing skills
- `--dry-run` — preview actions without installing
- `-h, --help` — show help

## Publishing

`@archznn/crewloop-cli` is published automatically by the GitHub Actions workflow in `.github/workflows/publish-npm.yml` whenever a `v*.*.*` tag is pushed. The `@archznn/crewloop-skills` package is published first, then the CLI.
