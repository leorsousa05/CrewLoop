# Proposal: Improve MCP Server Installation Feedback

## WHY

Installing the Obsidian MCP server during `crewloop install` is the slowest step of the installation process. It creates a Python virtual environment, runs `pip install -e`, and exposes a binary wrapper. Today the CLI prints nothing while these steps run, so users cannot tell whether the installer is hanging or working. After the step completes, only a single line is printed:

```
Installed Obsidian MCP server at /home/user/.local/bin/obsidian-mcp
```

If the user is on a slow network or if pip takes a long time to resolve dependencies, the lack of feedback creates anxiety and a poor first-run experience. This change adds explicit progress messages for each sub-step of the MCP installation.

## Scope

- Extend `packages/cli/src/mcp.ts` with an optional progress callback.
- Define enumerated installation steps: `check_python`, `create_venv`, `install_package`, `expose_binary`, `complete`.
- Update `packages/cli/src/cli.ts` to print progress messages during `crewloop install`.
- Preserve all existing behavior for `--dry-run`, `--force`, and error handling.
- Add unit tests verifying the callback is invoked in the correct order.

## Constraints

- Must not make MCP installation slower.
- Must not add new runtime dependencies to the CLI.
- Progress output must be concise and friendly.
- Must remain silent enough to be usable in scripts (progress goes to `stderr` or is opt-in via `--verbose`).
