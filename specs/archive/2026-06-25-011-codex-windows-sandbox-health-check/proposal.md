# Proposal: Add health checks for Codex Windows sandbox

## WHY

On Windows, Codex CLI can be installed through a standalone PowerShell installer that leaves the runtime resources in `%USERPROFILE%\.codex\packages\standalone\current\codex-resources`. When the user launches Codex from the normal entrypoint (`%LOCALAPPDATA%\Programs\OpenAI\Codex\bin\codex.exe`), the Windows sandbox helper `codex-windows-sandbox-setup.exe` is not on `PATH`, so hooks fail with:

```
windows sandbox: orchestrator_helper_launch_failed: setup refresh failed to launch helper:
helper=codex-windows-sandbox-setup.exe, cwd=C:\Users\<user>\.codex,
error=program not found
```

This failure happens before the hook command (`crewloop-shim`) runs, so the CrewLoop dashboard never receives Codex events. Users think the dashboard is broken, but the real issue is an upstream Codex resource-resolution bug.

## Scope

1. Add a `crewloop doctor` command that checks the health of each supported agent's hook environment.
2. On Windows, when Codex is configured, verify that the active Codex resource directory is discoverable on `PATH` (or that the Codex binary is the package binary rather than the launcher).
3. Emit a clear warning with a workaround when the sandbox helper is not discoverable.
4. Also run the same check after `crewloop install` for any agent that was configured, so users see the warning immediately.
5. Document the workaround in `specs/living/cli/spec.md` and the built-in help text.

## Out of scope

- Fixing the Codex bug itself (upstream issue).
- Modifying Codex configuration files.
- Auto-correcting the user's `PATH`.

## Constraints

- Must not break existing commands.
- Must be safe to run in any environment (Linux/macOS should be no-ops for Windows-specific checks).
- Must not require elevated privileges.
- Health checks must be read-only; no state mutation.
