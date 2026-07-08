import { describe, it } from 'node:test';
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
      beforeToolUseCommand: `crewloop-shim ${id} --default-skill crewloop-hub`,
      afterToolUseCommand: `crewloop-shim ${id} --default-skill crewloop-hub`,
      ...hookOverrides,
    },
  };
}

function assertResult(result: HookWriterResult, expected: HookWriterResult['status']) {
  assert.strictEqual(result.status, expected);
}

describe('installHooksForAgent', () => {
  it('configures Kimi TOML hooks in array-of-tables format', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');
    assert.ok(result.configPath);
    assert.ok(fs.existsSync(result.configPath));
    assert.strictEqual(result.backupPath, undefined);

    const content = fs.readFileSync(result.configPath!, 'utf8');
    assert.ok(content.includes('[[hooks]]'));
    assert.ok(content.includes('event = "PreToolUse"'));
    assert.ok(content.includes('event = "PostToolUse"'));
    assert.ok(content.includes('matcher = ".*"'));
    assert.ok(content.includes('command = "crewloop-shim kimi --default-skill crewloop-hub"'));
  });

  it('configures Kimi TOML hooks idempotently', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const first = installHooksForAgent(agent, { backup: true });
    assertResult(first, 'configured');

    const second = installHooksForAgent(agent, { backup: true });
    assertResult(second, 'configured');
    assert.strictEqual(second.backupPath, undefined);

    const content = fs.readFileSync(first.configPath!, 'utf8');
    const crewLoopBlocks = content
      .split('[[hooks]]')
      .filter((block) => block.includes('crewloop-shim')).length;
    assert.strictEqual(crewLoopBlocks, 2);
  });

  it('preserves user Kimi hooks when adding CrewLoop hooks', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.mkdirSync(agent.skillsDir, { recursive: true });
    fs.writeFileSync(
      agent.hooks.configPath,
      '[[hooks]]\nevent = "PostToolUse"\nmatcher = "WriteFile|StrReplaceFile"\ncommand = "prettier --write"\n',
      'utf8'
    );

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');

    const content = fs.readFileSync(agent.hooks.configPath, 'utf8');
    assert.ok(content.includes('prettier --write'));
    assert.ok(content.includes('crewloop-shim kimi'));
    const crewLoopBlocks = content
      .split('[[hooks]]')
      .filter((block) => block.includes('crewloop-shim')).length;
    assert.strictEqual(crewLoopBlocks, 2);
  });

  it('migrates Kimi from legacy [hooks] table to [[hooks]] blocks', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.mkdirSync(agent.skillsDir, { recursive: true });
    fs.writeFileSync(
      agent.hooks.configPath,
      '[hooks]\nbefore_tool_use = "crewloop-shim kimi --default-skill crewloop-hub"\nafter_tool_use = "crewloop-shim kimi --default-skill crewloop-hub"\n',
      'utf8'
    );

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');
    assert.ok(result.backupPath);

    const content = fs.readFileSync(agent.hooks.configPath, 'utf8');
    assert.ok(!/^\[hooks\]$/m.test(content));
    assert.ok(content.includes('[[hooks]]'));
    assert.ok(content.includes('event = "PreToolUse"'));
    assert.ok(content.includes('event = "PostToolUse"'));
  });

  it('deduplicates CrewLoop Kimi hooks interleaved with other tables', () => {
    const agent = createAgentConfig({ id: 'kimi', format: 'toml' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.mkdirSync(agent.skillsDir, { recursive: true });
    fs.writeFileSync(
      agent.hooks.configPath,
      '[[hooks]]\nevent = "PreToolUse"\nmatcher = ".*"\ncommand = "crewloop-shim kimi --default-skill crewloop-hub"\n\n[other]\nkey = "value"\n\n[[hooks]]\nevent = "PostToolUse"\nmatcher = ".*"\ncommand = "crewloop-shim kimi --default-skill crewloop-hub"\n',
      'utf8'
    );

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');

    const content = fs.readFileSync(agent.hooks.configPath, 'utf8');
    const crewLoopBlocks = content
      .split('[[hooks]]')
      .filter((block) => block.includes('crewloop-shim')).length;
    assert.strictEqual(crewLoopBlocks, 2);
    assert.ok(content.includes('[other]'));
    assert.ok(content.includes('key = "value"'));
  });

  it('configures Codex grouped JSON hooks', () => {
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
        beforeToolUseCommand: 'crewloop-shim codex --default-skill crewloop-hub',
        afterToolUseCommand: 'crewloop-shim codex --default-skill crewloop-hub',
      },
    });

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.ok(Array.isArray(config.hooks.PreToolUse));
    assert.strictEqual(config.hooks.PreToolUse[0].matcher, '*');
    assert.strictEqual(config.hooks.PreToolUse[0].hooks[0].type, 'command');
    assert.strictEqual(
      config.hooks.PreToolUse[0].hooks[0].command,
      'crewloop-shim codex --default-skill crewloop-hub'
    );
    assert.ok(Array.isArray(config.hooks.PostToolUse));
  });

  it('configures Codex hooks idempotently', () => {
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
        beforeToolUseCommand: 'crewloop-shim codex --default-skill crewloop-hub',
        afterToolUseCommand: 'crewloop-shim codex --default-skill crewloop-hub',
      },
    });

    installHooksForAgent(agent, { backup: true });
    const second = installHooksForAgent(agent, { backup: true });
    assertResult(second, 'configured');
    assert.strictEqual(second.backupPath, undefined);

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(config.hooks.PreToolUse.length, 1);
    assert.strictEqual(config.hooks.PostToolUse.length, 1);
  });

  it('configures Claude grouped JSON hooks', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-claude-')),
      'config.json'
    );
    const agent = createAgentConfig({
      id: 'claude',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim claude --default-skill crewloop-hub',
        afterToolUseCommand: 'crewloop-shim claude --default-skill crewloop-hub',
      },
    });

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.ok(Array.isArray(config.hooks.PreToolUse));
    assert.strictEqual(config.hooks.PreToolUse[0].matcher, '*');
    assert.strictEqual(config.hooks.PreToolUse[0].hooks[0].command, 'crewloop-shim claude --default-skill crewloop-hub');
    assert.ok(Array.isArray(config.hooks.PostToolUse));
  });

  it('installs lifecycle hooks for agents that declare them', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-claude-lifecycle-')),
      'settings.json'
    );
    const agent = createAgentConfig({
      id: 'claude',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim claude --default-skill crewloop-hub',
        afterToolUseCommand: 'crewloop-shim claude --default-skill crewloop-hub',
        lifecycleEvents: ['SessionStart', 'SessionEnd'],
      },
    });

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    for (const event of ['SessionStart', 'SessionEnd']) {
      assert.ok(Array.isArray(config.hooks[event]), `expected ${event} hooks`);
      assert.strictEqual(
        config.hooks[event][0].hooks[0].command,
        'crewloop-shim claude --default-skill crewloop-hub'
      );
    }
  });

  it('configures AGY grouped JSON hooks under crewloop group', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-agy-')),
      'config.json'
    );
    const agent = createAgentConfig({
      id: 'agy',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim agy --default-skill crewloop-hub',
        afterToolUseCommand: 'crewloop-shim agy --default-skill crewloop-hub',
      },
    });

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.ok(config.crewloop);
    assert.ok(Array.isArray(config.crewloop.PreToolUse));
    assert.strictEqual(config.crewloop.PreToolUse[0].matcher, '*');
    assert.strictEqual(config.crewloop.PreToolUse[0].hooks[0].command, 'crewloop-shim agy --default-skill crewloop-hub');
    assert.ok(Array.isArray(config.crewloop.PostToolUse));
  });

  it('preserves user AGY hooks when adding CrewLoop hooks', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-agy-')),
      'config.json'
    );
    const agent = createAgentConfig({
      id: 'agy',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim agy --default-skill crewloop-hub',
        afterToolUseCommand: 'crewloop-shim agy --default-skill crewloop-hub',
      },
    });

    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        'my-linter': {
          PostToolUse: [
            {
              matcher: 'run_command',
              hooks: [{ type: 'command', command: './scripts/lint.sh' }],
            },
          ],
        },
      }),
      'utf8'
    );

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.ok(config['my-linter']);
    assert.ok(config.crewloop);
    assert.strictEqual(config.crewloop.PreToolUse.length, 1);
  });

  it('migrates AGY from legacy hooks object to crewloop group', () => {
    const configPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-agy-')),
      'config.json'
    );
    const agent = createAgentConfig({
      id: 'agy',
      skillsDir: path.join(path.dirname(configPath), 'skills'),
      hooks: {
        supported: true,
        configPath,
        format: 'json',
        beforeToolUseCommand: 'crewloop-shim agy --default-skill crewloop-hub',
        afterToolUseCommand: 'crewloop-shim agy --default-skill crewloop-hub',
      },
    });

    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        hooks: {
          before_tool_use: 'crewloop-shim agy --default-skill crewloop-hub',
          after_tool_use: 'crewloop-shim agy --default-skill crewloop-hub',
        },
      }),
      'utf8'
    );

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');
    assert.ok(result.backupPath);

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(config.hooks, undefined);
    assert.ok(config.crewloop);
    assert.ok(Array.isArray(config.crewloop.PreToolUse));
  });

  it('creates a backup before modifying an existing config', () => {
    const agent = createAgentConfig({ id: 'kimi' });
    fs.mkdirSync(path.dirname(agent.hooks.configPath), { recursive: true });
    fs.writeFileSync(agent.hooks.configPath, '# existing config\n', 'utf8');
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const result = installHooksForAgent(agent, { backup: true });
    assertResult(result, 'configured');
    assert.ok(result.backupPath);
    assert.ok(fs.existsSync(result.backupPath));
    assert.strictEqual(fs.readFileSync(result.backupPath, 'utf8'), '# existing config\n');
  });

  it('dry-run does not write files', () => {
    const agent = createAgentConfig({ id: 'kimi' });
    fs.mkdirSync(agent.skillsDir, { recursive: true });

    const result = installHooksForAgent(agent, { dryRun: true, backup: true });
    assertResult(result, 'configured');
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

  it('returns skipped when agent is not installed', () => {
    const agent = createAgentConfig({
      id: 'claude',
      hooks: {
        supported: true,
        format: 'json',
        configPath: path.join(os.tmpdir(), 'nonexistent-claude', 'config.json'),
      },
    });

    const result = installHooksForAgent(agent);
    assert.strictEqual(result.status, 'skipped');
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

    for (const dirname of [
      path.join(fakeHome, '.agents', 'skills'),
      path.join(fakeHome, '.claude', 'skills'),
      path.join(fakeHome, '.codex', 'skills'),
      path.join(fakeHome, '.agy', 'skills'),
      path.join(fakeHome, '.gemini', 'config'),
    ]) {
      fs.mkdirSync(dirname, { recursive: true });
    }

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

describe('AGY default config', () => {
  it('uses ~/.gemini/config/hooks.json as the AGY hook path', () => {
    const { listSupportedAgents } = require('../agents');
    const agy = listSupportedAgents().find((a: AgentConfig) => a.id === 'agy');
    assert.ok(agy);
    assert.ok(agy.hooks.configPath.endsWith(path.join('.gemini', 'config', 'hooks.json')));
  });

  it('cleans up legacy ~/.agy/config.json when configuring AGY', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-agy-cleanup-'));
    const originalUserProfile = process.env.USERPROFILE;
    const originalHome = process.env.HOME;
    process.env.USERPROFILE = fakeHome;
    process.env.HOME = fakeHome;

    try {
      fs.mkdirSync(path.join(fakeHome, '.agy', 'skills'), { recursive: true });
      fs.mkdirSync(path.join(fakeHome, '.gemini', 'config'), { recursive: true });
      const legacyPath = path.join(fakeHome, '.agy', 'config.json');
      fs.writeFileSync(
        legacyPath,
        JSON.stringify({ crewloop: { PreToolUse: [], PostToolUse: [] } }),
        'utf8'
      );

      const result = installHooks({ agents: ['agy'] });
      assert.strictEqual(result[0].status, 'configured');
      assert.ok(!fs.existsSync(legacyPath));
    } finally {
      process.env.USERPROFILE = originalUserProfile;
      process.env.HOME = originalHome;
    }
  });

  it('preserves non-crewloop content in legacy ~/.agy/config.json', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-agy-cleanup-'));
    const originalUserProfile = process.env.USERPROFILE;
    const originalHome = process.env.HOME;
    process.env.USERPROFILE = fakeHome;
    process.env.HOME = fakeHome;

    try {
      fs.mkdirSync(path.join(fakeHome, '.agy', 'skills'), { recursive: true });
      fs.mkdirSync(path.join(fakeHome, '.gemini', 'config'), { recursive: true });
      const legacyPath = path.join(fakeHome, '.agy', 'config.json');
      fs.writeFileSync(
        legacyPath,
        JSON.stringify({ crewloop: { PreToolUse: [] }, other: { key: 'value' } }),
        'utf8'
      );

      installHooks({ agents: ['agy'] });

      const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
      assert.strictEqual(legacy.crewloop, undefined);
      assert.deepStrictEqual(legacy.other, { key: 'value' });
    } finally {
      process.env.USERPROFILE = originalUserProfile;
      process.env.HOME = originalHome;
    }
  });
});
