# Proposal: Make `crewloop-shim` Executable and Improve CLI Help/Output

## WHY

`crewloop install` writes agent hooks that invoke `crewloop-shim <agent> --default-skill orchestrator`. The hooks are created successfully, but the `crewloop-shim` command is **not exposed as a global npm binary**. Users who install the CrewLoop bundle therefore end up with agent configs pointing to a command that does not exist on PATH. The hooks silently fail, the dashboard receives no events, and the user has no obvious signal that anything is wrong.

In addition, the current `crewloop -h` help text:

- Lists `--hooks` and `--no-hooks` without explaining what hooks are or which agents are supported.
- Provides no usage examples, making the CLI harder to discover than necessary.
- Describes the `install` command as "Install CrewLoop skills", even though it also installs the Obsidian MCP server and configures hooks.

Finally, the install-time output emphasizes the Obsidian MCP server ("Installing Obsidian MCP server...") and can give the impression that hooks are not part of the install, especially when the server is already present.

This change fixes the missing binary, makes the CLI help explain the hook behavior, and clarifies install output so users can see that hooks are being configured.

## Scope

1. **Expose `crewloop-shim` as an executable binary.**
   - Add `servers/dashboard/bin/crewloop-shim.js` as a Node.js entry point.
   - Register `crewloop-shim` in the root `@archznn/crewloop-skills` `package.json` `bin` field.
   - Register `crewloop-shim` in `servers/dashboard/package.json` `bin` field for standalone dashboard installs.

2. **Improve CLI help text.**
   - Update `packages/cli/src/cli.ts` `printHelp()` to describe `install` as installing skills **and** configuring hooks.
   - Add a `Hooks:` section explaining supported agents, config files touched, and the `--no-hooks` opt-out.
   - Add an `Examples:` section covering all commands and common flag combinations.

3. **Improve install-time messaging.**
   - Change the Obsidian MCP server progress header from "Installing..." to "Ensuring Obsidian MCP server is installed...".
   - Keep the final "installed" / "already installed" messages.
   - Make the hook summary clearer: distinguish "configured" from "skipped (agent not installed)" and add a friendly hint when no supported agents are detected.

4. **Preserve and tighten idempotency.**
   - Avoid creating a backup when the config file already contains the exact target hooks.
   - Keep existing idempotent add-or-skip behavior for the hooks themselves.

5. **Update documentation.**
   - Update `AGENTS.md` install section to mention that `crewloop-shim` is installed globally and is used by the hooks.
   - Keep the existing workflow conventions intact.

6. **Add tests.**
   - Extend `packages/cli/src/tests/cli.test.ts` to assert the new help text contains examples and hook documentation.
   - Extend `packages/cli/src/tests/hooks.test.ts` to assert that no backup is created when the config is already correct.
   - Add a basic test in `servers/dashboard/src/tests/shim.test.ts` that verifies `runShim` is exported and the bin wrapper calls it without throwing when stdin is empty.

## Constraints

- Do not change the hook command string in agent configs unless necessary. Existing users should not need to re-run `crewloop install` because the command name stays `crewloop-shim`.
- Do not break `--no-hooks`, `--dry-run`, or existing flag parsing.
- Maintain cross-platform behavior (Windows, macOS, Linux).
- Only Shipper may create branches, commits, or PRs.
- All new code must follow existing TypeScript and test conventions.
