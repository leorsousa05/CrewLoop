# Spec Delta: Kimi hook config path

## MODIFIED

### `packages/cli/src/agents.ts`

Change the Kimi hook `configPath` from:

```ts
configPath: path.join(os.homedir(), '.kimi', 'config.toml'),
```

to:

```ts
configPath: path.join(os.homedir(), '.kimi-code', 'config.toml'),
```

All other agents remain unchanged.

### `packages/cli/AGENTS.md`

Update the Kimi Code section heading and any inline path references from `~/.kimi/config.toml` to `~/.kimi-code/config.toml`.

### `specs/living/cli/hooks.md`

Update the Kimi Code section heading from `~/.kimi/config.toml` to `~/.kimi-code/config.toml`.
