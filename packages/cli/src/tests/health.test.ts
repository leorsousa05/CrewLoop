import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { checkAgentHealth } from '../health';
import type { AgentConfig } from '../agents';

function makeCodexAgent(): AgentConfig {
  return {
    id: 'codex',
    skillsDir: path.join(os.tmpdir(), 'crewloop-codex-skills'),
    hooks: {
      supported: true,
      configPath: path.join(os.tmpdir(), 'crewloop-codex-hooks.json'),
      format: 'json',
      beforeToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
      afterToolUseCommand: 'crewloop-shim codex --default-skill orchestrator',
      beforeToolUseEventName: 'PreToolUse',
      afterToolUseEventName: 'PostToolUse',
    },
  };
}

describe('checkAgentHealth codex', () => {
  let originalHome: string | undefined;
  let originalUserProfile: string | undefined;
  let originalPath: string | undefined;
  let tempHome: string;

  before(() => {
    originalHome = process.env.HOME;
    originalUserProfile = process.env.USERPROFILE;
    originalPath = process.env.PATH;
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-health-home-'));
    process.env.HOME = tempHome;
    process.env.USERPROFILE = tempHome;
  });

  after(() => {
    if (originalHome !== undefined) process.env.HOME = originalHome;
    else delete process.env.HOME;
    if (originalUserProfile !== undefined) process.env.USERPROFILE = originalUserProfile;
    else delete process.env.USERPROFILE;
    if (originalPath !== undefined) process.env.PATH = originalPath;
    else delete process.env.PATH;
    try {
      fs.rmSync(tempHome, { recursive: true, force: true });
    } catch {
      // Ignore cleanup failures on Windows.
    }
  });

  it('returns ok when no Codex standalone package is installed', () => {
    const agent = makeCodexAgent();
    const results = checkAgentHealth(agent);
    assert.ok(results.every((r) => r.severity === 'ok'));
  });

  it('returns ok when the sandbox helper is on PATH', () => {
    const standaloneDir = path.join(tempHome, '.codex', 'packages', 'standalone', 'current');
    const resourcesDir = path.join(standaloneDir, 'codex-resources');
    fs.mkdirSync(resourcesDir, { recursive: true });
    fs.writeFileSync(path.join(resourcesDir, 'codex-windows-sandbox-setup.exe'), '', 'utf8');

    process.env.PATH = resourcesDir + path.delimiter + (originalPath || '');

    const agent = makeCodexAgent();
    const results = checkAgentHealth(agent);
    assert.ok(results.every((r) => r.severity === 'ok'));
  });

  it('returns ok when the package binary is on PATH', () => {
    const standaloneDir = path.join(tempHome, '.codex', 'packages', 'standalone', 'current');
    const resourcesDir = path.join(standaloneDir, 'codex-resources');
    const binDir = path.join(standaloneDir, 'bin');
    fs.mkdirSync(resourcesDir, { recursive: true });
    fs.mkdirSync(binDir, { recursive: true });
    fs.writeFileSync(path.join(resourcesDir, 'codex-windows-sandbox-setup.exe'), '', 'utf8');
    fs.writeFileSync(path.join(binDir, 'codex.exe'), '', 'utf8');

    process.env.PATH = binDir + path.delimiter + (originalPath || '');

    const agent = makeCodexAgent();
    const results = checkAgentHealth(agent);
    assert.ok(results.every((r) => r.severity === 'ok'));
  });

  it('returns warning when the launcher binary is on PATH instead of resources', () => {
    const standaloneDir = path.join(tempHome, '.codex', 'packages', 'standalone', 'current');
    const resourcesDir = path.join(standaloneDir, 'codex-resources');
    const launcherDir = path.join(tempHome, 'Programs', 'OpenAI', 'Codex', 'bin');
    fs.mkdirSync(resourcesDir, { recursive: true });
    fs.mkdirSync(launcherDir, { recursive: true });
    fs.writeFileSync(path.join(resourcesDir, 'codex-windows-sandbox-setup.exe'), '', 'utf8');
    fs.writeFileSync(path.join(launcherDir, 'codex.exe'), '', 'utf8');

    process.env.PATH = launcherDir + path.delimiter + (originalPath || '');

    const agent = makeCodexAgent();
    const results = checkAgentHealth(agent);
    const warning = results.find((r) => r.severity === 'warning');
    assert.ok(warning);
    assert.ok(warning?.message.includes('Windows sandbox helper'));
  });

  it('returns warning when the helper exists but codex is not on PATH', () => {
    const standaloneDir = path.join(tempHome, '.codex', 'packages', 'standalone', 'current');
    const resourcesDir = path.join(standaloneDir, 'codex-resources');
    fs.mkdirSync(resourcesDir, { recursive: true });
    fs.writeFileSync(path.join(resourcesDir, 'codex-windows-sandbox-setup.exe'), '', 'utf8');

    process.env.PATH = tempHome + path.delimiter + (originalPath || '');

    const agent = makeCodexAgent();
    const results = checkAgentHealth(agent);
    const warning = results.find((r) => r.severity === 'warning');
    assert.ok(warning);
  });

  it('returns ok for unsupported agents', () => {
    const agent: AgentConfig = {
      id: 'cursor',
      skillsDir: path.join(os.tmpdir(), 'cursor-skills'),
      hooks: {
        supported: false,
        configPath: '',
        format: 'none',
      },
    };
    const results = checkAgentHealth(agent);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].severity, 'ok');
    assert.ok(results[0].message.includes('not supported'));
  });
});
