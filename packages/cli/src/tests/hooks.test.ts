import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  installHooksForAgent,
  installHooks,
  type HookWriterResult,
} from '../hooks';
import type { AgentConfig, HookFormat } from '../agents';

function createAgentConfig(
  overrides: Partial<AgentConfig> & { format?: HookFormat } = {}
): AgentConfig {
  const { format, ...restOverrides } = overrides;
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-agent-'));
  const id = restOverrides.id || 'kimi';
  const hookOverrides = restOverrides.hooks || {};
  return {
    id,
    skillsDir: path.join(baseDir, 'skills'),
    hooks: {
      supported: true,
      configPath: path.join(baseDir, 'config.toml'),
      format: format ?? 'toml',
      beforeToolUseCommand: `crewloop-shim ${id} --default-skill orchestrator`,
      afterToolUseCommand: `crewloop-shim ${id} --default-skill orchestrator`,
      beforeToolUseEventName: id === 'kimi' || id === 'codex' || id === 'agy' ? 'PreToolUse' : 'before_tool_use',
      afterToolUseEventName: id === 'kimi' || id === 'codex' || id === 'agy' ? 'PostToolUse' : 'after_tool_use',
      legacyEventNames: id === 'kimi' || id === 'codex' ? ['before_tool_use', 'after_tool_use'] : undefined,
      ...hookOverrides,
    },
  };
}

describe('installHooksForAgent', () => {
  it('configures Kimi TOML hooks idempotently', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const first = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(first.status, 'configured');
    assert.ok(first.configPath);
    assert.ok(fs.existsSync(first.configPath));
    assert.strictEqual(first.backupPath, undefined);

    const content = fs.readFileSync(first.configPath, 'utf8');
    assert.ok(content.includes('event = "PreToolUse"'));
    assert.ok(content.includes('event = "PostToolUse"'));
    assert.ok(content.includes('command = "crewloop-shim kimi --default-skill orchestrator"'));

    const second = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(second.status, 'configured');
    assert.strictEqual(second.backupPath, undefined);

    const updatedContent = fs.readFileSync(first.configPath, 'utf8');
    const hookBlockMatches = updatedContent.match(/\[\[hooks\]\]/g);
    assert.strictEqual(hookBlockMatches?.length, 2);
  });

  it('does not create a backup when the config is already correct', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.writeFileSync(
      agent.hooks.configPath,
      '[[hooks]]\nevent = "PreToolUse"\ncommand = "crewloop-shim kimi --default-skill orchestrator"\n\n[[hooks]]\nevent = "PostToolUse"\ncommand = "crewloop-shim kimi --default-skill orchestrator"\n',
      'utf8'
    );
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');
    assert.strictEqual(result.backupPath, undefined);

    const updatedContent = fs.readFileSync(agent.hooks.configPath, 'utf8');
    const hookBlockMatches = updatedContent.match(/\[\[hooks\]\]/g);
    assert.strictEqual(hookBlockMatches?.length, 2);
  });

  it('removes a legacy [hooks] table and replaces it with [[hooks]] blocks', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.writeFileSync(
      agent.hooks.configPath,
      '[hooks]\nbefore_tool_use = "crewloop-shim kimi --default-skill orchestrator"\nafter_tool_use = "crewloop-shim kimi --default-skill orchestrator"\n',
      'utf8'
    );
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');
    assert.ok(result.backupPath);

    const content = fs.readFileSync(agent.hooks.configPath, 'utf8');
    assert.ok(!content.split('\n').some((line) => line.trim() === '[hooks]'));
    assert.ok(!content.includes('before_tool_use'));
    assert.ok(!content.includes('after_tool_use'));
    assert.strictEqual(content.match(/\[\[hooks\]\]/g)?.length, 2);
    assert.ok(content.includes('event = "PreToolUse"'));
    assert.ok(content.includes('event = "PostToolUse"'));
  });

  it('removes a legacy [hooks] table when new [[hooks]] blocks already exist', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.writeFileSync(
      agent.hooks.configPath,
      '[hooks]\nbefore_tool_use = "crewloop-shim kimi --default-skill orchestrator"\nafter_tool_use = "crewloop-shim kimi --default-skill orchestrator"\n\n[[hooks]]\nevent = "PreToolUse"\ncommand = "crewloop-shim kimi --default-skill orchestrator"\n\n[[hooks]]\nevent = "PostToolUse"\ncommand = "crewloop-shim kimi --default-skill orchestrator"\n',
      'utf8'
    );
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');

    const content = fs.readFileSync(agent.hooks.configPath, 'utf8');
    assert.ok(!content.split('\n').some((line) => line.trim() === '[hooks]'));
    assert.ok(!content.includes('before_tool_use'));
    assert.ok(!content.includes('after_tool_use'));
    assert.strictEqual(content.match(/\[\[hooks\]\]/g)?.length, 2);
  });

  it('is idempotent when starting from a legacy [hooks] table', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.writeFileSync(
      agent.hooks.configPath,
      '[hooks]\nbefore_tool_use = "crewloop-shim kimi --default-skill orchestrator"\nafter_tool_use = "crewloop-shim kimi --default-skill orchestrator"\n',
      'utf8'
    );
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const first = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(first.status, 'configured');
    assert.ok(first.backupPath);

    const firstContent = fs.readFileSync(agent.hooks.configPath, 'utf8');
    assert.strictEqual(firstContent.match(/\[\[hooks\]\]/g)?.length, 2);

    const second = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(second.status, 'configured');
    assert.strictEqual(second.backupPath, undefined);

    const secondContent = fs.readFileSync(agent.hooks.configPath, 'utf8');
    assert.strictEqual(secondContent.match(/\[\[hooks\]\]/g)?.length, 2);
    assert.ok(!secondContent.split('\n').some((line) => line.trim() === '[hooks]'));
  });

  it('preserves non-legacy keys inside a [hooks] table', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.writeFileSync(
      agent.hooks.configPath,
      '[hooks]\nsome_future_hook = "do-something"\nbefore_tool_use = "crewloop-shim kimi --default-skill orchestrator"\n\n[[hooks]]\nevent = "PreToolUse"\ncommand = "crewloop-shim kimi --default-skill orchestrator"\n\n[[hooks]]\nevent = "PostToolUse"\ncommand = "crewloop-shim kimi --default-skill orchestrator"\n',
      'utf8'
    );
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');

    const content = fs.readFileSync(agent.hooks.configPath, 'utf8');
    assert.ok(content.includes('some_future_hook = "do-something"'));
    assert.ok(content.split('\n').some((line) => line.trim() === '[hooks]'));
    assert.ok(!content.includes('before_tool_use'));
    assert.strictEqual(content.match(/\[\[hooks\]\]/g)?.length, 2);
  });

  it('configures JSON hooks idempotently for codex', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-codex-')),
      'hooks.json'
    );
    const agent = createAgentConfig({
      id: 'codex',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
        afterToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
      },
    });

    const first = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(first.status, 'configured');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.ok(Array.isArray(config.hooks.PreToolUse));
    assert.strictEqual(config.hooks.PreToolUse.length, 1);
    assert.deepStrictEqual(config.hooks.PreToolUse[0].hooks[0], {
      type: 'command',
      command: 'crewloop-shim',
      args: ['codex', '--default-skill', 'orchestrator'],
    });
    assert.ok(Array.isArray(config.hooks.PostToolUse));
    assert.strictEqual(config.hooks.PostToolUse.length, 1);
    assert.deepStrictEqual(config.hooks.PostToolUse[0].hooks[0], {
      type: 'command',
      command: 'crewloop-shim',
      args: ['codex', '--default-skill', 'orchestrator'],
    });

    const second = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(second.status, 'configured');
    assert.strictEqual(second.backupPath, undefined);

    const updatedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(updatedConfig.hooks.PreToolUse.length, 1);
    assert.strictEqual(updatedConfig.hooks.PostToolUse.length, 1);
  });

  it('upgrades legacy string JSON hooks to Codex matcher-array format', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-codex-legacy-')),
      'hooks.json'
    );
    const agent = createAgentConfig({
      id: 'codex',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
        afterToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
      },
    });
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        hooks: {
          before_tool_use: 'crewloop-shim codex --default-skill orchestrator',
          after_tool_use: 'crewloop-shim codex --default-skill orchestrator',
        },
      }),
      'utf8'
    );

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');
    assert.ok(result.backupPath);

    const updatedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.ok(Array.isArray(updatedConfig.hooks.PreToolUse));
    assert.deepStrictEqual(updatedConfig.hooks.PreToolUse[0].hooks[0], {
      type: 'command',
      command: 'crewloop-shim',
      args: ['codex', '--default-skill', 'orchestrator'],
    });
    assert.ok(Array.isArray(updatedConfig.hooks.PostToolUse));
    assert.strictEqual('before_tool_use' in updatedConfig.hooks, false);
    assert.strictEqual('after_tool_use' in updatedConfig.hooks, false);
  });

  it('replaces legacy flat-object Codex hooks with matcher arrays', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-codex-flat-')),
      'hooks.json'
    );
    const agent = createAgentConfig({
      id: 'codex',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
        afterToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
      },
    });
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        hooks: {
          PreToolUse: { command: 'crewloop-shim', args: ['codex', '--default-skill', 'orchestrator'] },
          PostToolUse: { command: 'crewloop-shim', args: ['codex', '--default-skill', 'orchestrator'] },
        },
      }),
      'utf8'
    );

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');

    const updatedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.ok(Array.isArray(updatedConfig.hooks.PreToolUse));
    assert.ok(Array.isArray(updatedConfig.hooks.PostToolUse));
    assert.strictEqual(updatedConfig.hooks.PreToolUse.length, 1);
    assert.strictEqual(updatedConfig.hooks.PostToolUse.length, 1);
  });

  it('configures AGY hooks with matcher, command string, and event-type override', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-agy-')),
      'hooks.json'
    );
    const agent = createAgentConfig({
      id: 'agy',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim agy --default-skill orchestrator',
        afterToolUseCommand: 'crewloop-shim agy --default-skill orchestrator',
        beforeToolUseEventName: 'PreToolUse',
        afterToolUseEventName: 'PostToolUse',
      },
    });

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.ok(Array.isArray(config.hooks.PreToolUse));
    assert.ok(Array.isArray(config.hooks.PostToolUse));

    const preHook = config.hooks.PreToolUse[0];
    assert.strictEqual(preHook.matcher, '*');
    assert.strictEqual(preHook.hooks[0].type, 'command');
    assert.ok(preHook.hooks[0].command.includes('crewloop-shim.js'));
    assert.ok(preHook.hooks[0].command.includes('agy'));
    assert.ok(preHook.hooks[0].command.includes('--event-type tool_start'));

    const postHook = config.hooks.PostToolUse[0];
    assert.strictEqual(postHook.matcher, '*');
    assert.ok(postHook.hooks[0].command.includes('--event-type tool_end'))

    // Idempotency: running again should not duplicate the hook group.
    const second = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(second.status, 'configured');
    const updated = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(updated.hooks.PreToolUse.length, 1);
    assert.strictEqual(updated.hooks.PreToolUse[0].hooks.length, 1);
    assert.strictEqual(updated.hooks.PostToolUse.length, 1);
    assert.strictEqual(updated.hooks.PostToolUse[0].hooks.length, 1);
  });

  it('deduplicates AGY hooks that point to the same shim via different paths', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-agy-paths-')),
      'hooks.json'
    );
    const agent = createAgentConfig({
      id: 'agy',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim agy --default-skill orchestrator',
        afterToolUseCommand: 'crewloop-shim agy --default-skill orchestrator',
        beforeToolUseEventName: 'PreToolUse',
        afterToolUseEventName: 'PostToolUse',
      },
    });

    // Resolve the real shim path and create an alternate symlink to it.
    const realShimPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'servers',
      'dashboard',
      'bin',
      'crewloop-shim.js'
    );
    const symlinkDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-shim-link-'));
    const symlinkShimPath = path.join(symlinkDir, 'crewloop-shim.js');
    try {
      fs.symlinkSync(realShimPath, symlinkShimPath, 'file');
    } catch {
      // Symlinks may not be available on this Windows environment; skip the test.
      return;
    }

    const nodePath = process.execPath;
    const alternateShimPath = symlinkShimPath;
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        hooks: {
          PreToolUse: [
            {
              matcher: '*',
              hooks: [
                {
                  type: 'command',
                  command: `${nodePath} ${alternateShimPath} agy --default-skill orchestrator --event-type tool_start`,
                  timeout: 10,
                },
              ],
            },
          ],
          PostToolUse: [
            {
              matcher: '*',
              hooks: [
                {
                  type: 'command',
                  command: `${nodePath} ${alternateShimPath} agy --default-skill orchestrator --event-type tool_end`,
                  timeout: 10,
                },
              ],
            },
          ],
        },
      }),
      'utf8'
    );

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');

    const updated = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(updated.hooks.PreToolUse.length, 1);
    assert.strictEqual(updated.hooks.PreToolUse[0].hooks.length, 1);
    assert.strictEqual(updated.hooks.PostToolUse.length, 1);
    assert.strictEqual(updated.hooks.PostToolUse[0].hooks.length, 1);
    assert.ok(
      updated.hooks.PreToolUse[0].hooks[0].command.includes('crewloop-shim.js')
    );
    assert.ok(
      !updated.hooks.PreToolUse[0].hooks[0].command.includes(alternateShimPath)
    );
  });

  it('mirrors AGY config to fallbackConfigPath', () => {
    const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-agy-fallback-'));
    const configPath = path.join(baseDir, 'config', 'hooks.json');
    const fallbackPath = path.join(baseDir, 'fallback', 'hooks.json');
    const agent = createAgentConfig({
      id: 'agy',
      skillsDir: path.join(baseDir, 'skills'),
      hooks: {
        supported: true,
        configPath,
        fallbackConfigPath: fallbackPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim agy --default-skill orchestrator',
        afterToolUseCommand: 'crewloop-shim agy --default-skill orchestrator',
        beforeToolUseEventName: 'PreToolUse',
        afterToolUseEventName: 'PostToolUse',
      },
    });

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');
    assert.ok(fs.existsSync(configPath));
    assert.ok(fs.existsSync(fallbackPath));

    const primary = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const fallback = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    assert.deepStrictEqual(fallback, primary);

    // Running again should be idempotent and not create new backups.
    const second = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(second.status, 'configured');
    assert.strictEqual(second.backupPath, undefined);
    const fallbackAfter = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    assert.deepStrictEqual(fallbackAfter, primary);
  });

  it('creates a backup before modifying an existing config', () => {
    const agent = createAgentConfig({ id: 'kimi' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.writeFileSync(agent.hooks.configPath, '# existing config\n', 'utf8');
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const result = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(result.status, 'configured');
    assert.ok(result.backupPath);
    assert.ok(fs.existsSync(result.backupPath));
    assert.strictEqual(fs.readFileSync(result.backupPath, 'utf8'), '# existing config\n');
  });

  it('dry-run does not write files', () => {
    const agent = createAgentConfig({ id: 'kimi' });
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const result = installHooksForAgent(agent, { dryRun: true, backup: true });
    assert.strictEqual(result.status, 'configured');
    assert.ok(!fs.existsSync(agent.hooks.configPath));
  });

  it('returns unsupported for unsupported agents', () => {
    const agent = createAgentConfig({
      id: 'cursor',
      hooks: { supported: false, configPath: '', format: 'none' },
    });

    const result = installHooksForAgent(agent);
    assert.strictEqual(result.status, 'unsupported');
  });

  it('configures hooks even when the agent config directory does not exist', () => {
    const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-claude-missing-'));
    const configPath = path.join(baseDir, 'nonexistent', 'config.json');
    const agent = createAgentConfig({
      id: 'claude',
      skillsDir: path.join(baseDir, 'skills'),
      hooks: {
        supported: true,
        format: 'json',
        configPath,
      },
    });
    // Neither skillsDir nor config dir exists.

    const result = installHooksForAgent(agent);
    assert.strictEqual(result.status, 'configured');
    assert.ok(fs.existsSync(configPath));

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.deepStrictEqual(config.hooks.before_tool_use, {
      command: 'crewloop-shim',
      args: ['claude', '--default-skill', 'orchestrator'],
    });
  });

  it('returns error for malformed JSON config', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-badjson-')),
      'hooks.json'
    );
    const agent = createAgentConfig({
      id: 'codex',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim codex',
        afterToolUseCommand: 'crewloop-shim codex',
      },
    });
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, '{ invalid json', 'utf8');

    const result = installHooksForAgent(agent);
    assert.strictEqual(result.status, 'error');
    assert.ok(result.error);
  });
});

describe('installHooks', () => {
  it('returns results for all supported agents', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    const originalUserProfile = process.env.USERPROFILE;
    const originalHome = process.env.HOME;

    // Create fake agent directories so every supported agent looks installed.
    for (const dirname of [
      path.join(fakeHome, '.agents', 'skills'),
      path.join(fakeHome, '.claude', 'skills'),
      path.join(fakeHome, '.codex', 'skills'),
      path.join(fakeHome, '.agy', 'skills'),
    ]) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    // os.homedir() uses USERPROFILE on Windows and HOME on Unix.
    process.env.USERPROFILE = fakeHome;
    process.env.HOME = fakeHome;

    try {
      const results = installHooks({ dryRun: true });
      const statuses = new Map(results.map((r) => [r.agent, r.status]));

      assert.strictEqual(statuses.get('kimi'), 'configured');
      assert.strictEqual(statuses.get('claude'), 'configured');
      assert.strictEqual(statuses.get('codex'), 'configured');
      assert.strictEqual(statuses.get('agy'), 'configured');
      assert.strictEqual(statuses.get('cursor'), 'unsupported');
      assert.strictEqual(statuses.get('windsurf'), 'unsupported');
    } finally {
      process.env.USERPROFILE = originalUserProfile;
      process.env.HOME = originalHome;
    }
  });
});
