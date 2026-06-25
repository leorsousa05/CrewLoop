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

    const content = fs.readFileSync(first.configPath, 'utf8');
    assert.ok(content.includes('before_tool_use = "crewloop-shim kimi --default-skill orchestrator"'));
    assert.ok(content.includes('after_tool_use = "crewloop-shim kimi --default-skill orchestrator"'));

    const second = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(second.status, 'configured');

    const updatedContent = fs.readFileSync(first.configPath, 'utf8');
    const beforeMatches = updatedContent.match(/before_tool_use/g);
    const afterMatches = updatedContent.match(/after_tool_use/g);
    assert.strictEqual(beforeMatches?.length, 1);
    assert.strictEqual(afterMatches?.length, 1);
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
    assert.strictEqual(config.hooks.before_tool_use, agent.hooks.beforeToolUseCommand);
    assert.strictEqual(config.hooks.after_tool_use, agent.hooks.afterToolUseCommand);

    const second = installHooksForAgent(agent, { backup: true });
    assert.strictEqual(second.status, 'configured');

    const updatedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(updatedConfig.hooks.before_tool_use, agent.hooks.beforeToolUseCommand);
    assert.strictEqual(updatedConfig.hooks.after_tool_use, agent.hooks.afterToolUseCommand);
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

  it('returns skipped when agent is not installed', () => {
    const agent = createAgentConfig({
      id: 'claude',
      hooks: {
        supported: true,
        format: 'json',
        configPath: path.join(os.tmpdir(), 'nonexistent-claude', 'config.json'),
      },
    });
    // Neither skillsDir nor config dir exists.

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
