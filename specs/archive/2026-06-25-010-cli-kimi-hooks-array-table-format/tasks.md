## Tasks: Write Kimi hooks as [[hooks]] array-of-tables per official docs

### Implementation
- [x] Add optional `removeLegacyHooks(config): AgentHookConfigFile` to `AgentHookConfigWriter` interface in `packages/cli/src/hooks.ts`.
- [x] Implement `removeLegacyHooks` in `KimiHookWriter` using the existing `removeLegacyHookTable` logic, but return a new `AgentHookConfigFile`.
- [x] Update `installHooksForAgent` to call `writer.removeLegacyHooks?.(config)` before checking `hasHook` whenever `agent.hooks.legacyEventNames` is defined.
- [x] Ensure `needsWrite` is set to true when the cleanup changes the config content.

### Testing
- [x] Add test: Kimi config with only a legacy `[hooks]` table is fully replaced by `[[hooks]]` blocks.
- [x] Add test: Kimi config with both legacy `[hooks]` table and new `[[hooks]]` blocks has the legacy table removed and no duplicate blocks.
- [x] Add test: running `installHooksForAgent` twice on a config that starts with a legacy table leaves exactly two `[[hooks]]` blocks.
- [x] Add test: non-legacy keys inside `[hooks]` are preserved (e.g., future hooks with different names).
- [x] Keep Codex/Claude/AGY tests unchanged.

### Verification
- [x] Run `npm run build --workspaces`.
- [x] Run `npm test --workspaces`.
- [x] Run `python scripts/validate-skills.py`.
- [x] Reinstall the CLI globally and run `crewloop install`, then verify `~/.kimi-code/config.toml` contains only `[[hooks]]` blocks and no `[hooks]` table.

### Documentation
- [x] Update `specs/living/cli/spec.md` if it describes the legacy `[hooks]` behavior.
- [x] Mark `.spec.yaml` status as completed when done.
