import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { CliOptions, CommandContext } from '../args';
import { runList } from '../commands/list';
import { runAgents } from '../commands/agents';
import { runDoctor, runDoctorCommand } from '../commands/doctor';
import { runInstall } from '../commands/install';
import { resolveDashboardAddress } from '../commands/dashboard';
import type {
  DiamondBlockCommandResult,
  DiamondBlockCommandRunner,
  DiamondBlockInstallRequest,
} from '../diamondblock';

function diamondblockResult(partial: Partial<DiamondBlockCommandResult> = {}): DiamondBlockCommandResult {
  return {
    status: 'ready',
    executable: '/usr/bin/diamondblock',
    dryRun: true,
    exitCode: 0,
    stdout: '',
    stderr: '',
    ...partial,
  };
}

function createPackageRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-cli-test-'));
  const skills = [
    { name: 'architect', description: 'Software architecture and spec-writing skill' },
    { name: 'engineer', description: 'Software implementation and coding skill' },
  ];
  for (const skill of skills) {
    const dir = path.join(root, 'skills', skill.name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'SKILL.md'),
      `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n# ${skill.name}\n`
    );
  }
  return root;
}

function createDashboard(root: string, withDeps = false): void {
  const binDir = path.join(root, 'servers', 'dashboard', 'bin');
  fs.mkdirSync(binDir, { recursive: true });
  fs.writeFileSync(path.join(binDir, 'crewloop-shim.js'), '// shim\n');
  fs.writeFileSync(path.join(binDir, 'crewloop-dashboard.js'), '// dashboard\n');
  const deps = withDeps ? { dependencies: { 'definitely-missing-dep': '^1.0.0' } } : {};
  fs.writeFileSync(
    path.join(root, 'servers', 'dashboard', 'package.json'),
    JSON.stringify({ name: 'dashboard', ...deps })
  );
}

function collect(): { lines: string[]; errors: string[]; context: (root: string) => CommandContext } {
  const lines: string[] = [];
  const errors: string[] = [];
  return {
    lines,
    errors,
    context: (root: string) => ({
      packageRoot: root,
      stdout: (line: string) => lines.push(line),
      stderr: (line: string) => errors.push(line),
    }),
  };
}

describe('commands', () => {
  let root: string;
  let cleanupDirs: string[];

  beforeEach(() => {
    root = createPackageRoot();
    cleanupDirs = [root];
  });

  afterEach(() => {
    for (const dir of cleanupDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    cleanupDirs = [];
  });

  it('list prints aligned rows without a decorative heading', () => {
    const { lines, context } = collect();
    const code = runList({ command: 'list' }, context(root));
    assert.strictEqual(code, 0);
    assert.strictEqual(lines.length, 2);
    assert.ok(lines[0].startsWith('architect'));
    assert.ok(lines[0].includes('  Software architecture and spec-writing skill'));
    assert.ok(lines[1].startsWith('engineer'));
    assert.ok(!lines.some((line) => line.includes('Available CrewLoop skills')));
  });

  it('list truncates long descriptions to the terminal width', () => {
    const longRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-cli-test-'));
    cleanupDirs.push(longRoot);
    const dir = path.join(longRoot, 'skills', 'verbose-skill');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'SKILL.md'),
      `---\nname: verbose-skill\ndescription: ${'x'.repeat(200)}\n---\n# verbose-skill\n`
    );

    const { lines, context } = collect();
    const code = runList({ command: 'list' }, context(longRoot), 60);
    assert.strictEqual(code, 0);
    assert.strictEqual(lines.length, 1);
    assert.strictEqual(lines[0].length, 60);
    assert.ok(lines[0].endsWith('…'));
    assert.ok(lines[0].startsWith('verbose-skill  '));
  });

  it('agents prints every supported agent with hook support marker', () => {
    const { lines, context } = collect();
    const code = runAgents({ command: 'agents' }, context(root));
    assert.strictEqual(code, 0);
    assert.ok(lines[0].includes('agent'));
    assert.ok(lines[0].includes('hooks'));
    for (const id of ['kimi', 'claude', 'codex', 'agy', 'opencode', 'cursor', 'windsurf']) {
      assert.ok(lines.some((line) => line.startsWith(id)), `agents should list ${id}`);
    }
    const cursor = lines.find((line) => line.startsWith('cursor'));
    assert.ok(cursor?.includes('no'));
    assert.ok(cursor?.includes('-'));
  });

  it('doctor routes error findings to stderr and warnings to stdout', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    const lines: string[] = [];
    const errors: string[] = [];
    const code = runDoctorCommand(
      { command: 'doctor' },
      (line) => lines.push(line),
      (line) => errors.push(line),
      () => {
        throw new Error('no root');
      }
    );
    assert.strictEqual(code, 1);
    assert.ok(errors.some((line) => line.startsWith('error package root:')));
    assert.ok(errors.every((line) => line.startsWith('error ')));
    assert.ok(lines.some((line) => line.startsWith('warn hooks:')));
    assert.ok(lines.every((line) => !line.startsWith('error ')));
  });

  it('doctor reports package root failure and skips dependent checks', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    const report = runDoctor({
      resolvePackageRoot: () => {
        throw new Error('no root');
      },
      homeDir: home,
      findOnPath: (binary) => (binary === 'crewloop-shim' ? '/usr/bin/crewloop-shim' : undefined),
    });
    assert.strictEqual(report.exitCode, 1);
    assert.strictEqual(report.checks[0].level, 'error');
    assert.strictEqual(report.checks[0].label, 'package root');
    assert.ok(
      report.checks.some((c) => c.detail === 'skipped: package root unavailable'),
      'dependent checks should be skipped'
    );
    assert.ok(report.checks.some((c) => c.label === 'hooks' && c.detail === 'kimi not present' && c.level === 'warn'));
  });

  it('doctor warns when crewloop-shim is missing from PATH without failing', () => {
    createDashboard(root);
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    const report = runDoctor({ packageRoot: root, homeDir: home, findOnPath: () => undefined });
    assert.strictEqual(report.exitCode, 0);
    const pathCheck = report.checks.find((c) => c.detail.includes('not found on PATH'));
    assert.strictEqual(pathCheck?.level, 'warn');
  });

  it('doctor reports error for missing dashboard binary', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    const report = runDoctor({
      packageRoot: root,
      homeDir: home,
      findOnPath: (binary) => (binary === 'crewloop-shim' ? '/usr/bin/crewloop-shim' : undefined),
    });
    assert.strictEqual(report.exitCode, 1);
    assert.ok(report.checks.some((c) => c.label === 'dashboard' && c.level === 'error'));
  });

  it('doctor reports error for missing dashboard dependencies', () => {
    createDashboard(root, true);
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    const report = runDoctor({
      packageRoot: root,
      homeDir: home,
      findOnPath: (binary) => (binary === 'crewloop-shim' ? '/usr/bin/crewloop-shim' : undefined),
    });
    assert.strictEqual(report.exitCode, 1);
    assert.ok(
      report.checks.some((c) => c.level === 'error' && c.detail.includes('missing dependencies'))
    );
  });

  it('doctor reports hook presence using injected home directory', () => {
    createDashboard(root);
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    const claudeConfig = path.join(home, '.claude', 'settings.json');
    fs.mkdirSync(path.dirname(claudeConfig), { recursive: true });
    fs.writeFileSync(claudeConfig, JSON.stringify({ hooks: { command: 'crewloop-shim claude' } }));

    const report = runDoctor({
      packageRoot: root,
      homeDir: home,
      findOnPath: (binary) => (binary === 'crewloop-shim' ? '/usr/bin/crewloop-shim' : undefined),
    });
    assert.strictEqual(report.exitCode, 0);
    const claude = report.checks.find((c) => c.label === 'hooks' && c.detail.startsWith('claude'));
    assert.deepStrictEqual(claude, { level: 'ok', label: 'hooks', detail: 'claude present' });
    const kimi = report.checks.find((c) => c.label === 'hooks' && c.detail.startsWith('kimi'));
    assert.deepStrictEqual(kimi, { level: 'warn', label: 'hooks', detail: 'kimi not present' });
  });

  it('install --no-hooks prints summarized minimal output', async () => {
    const target = path.join(root, 'target');
    const { lines, errors, context } = collect();
    const code = await runInstall(
      { command: 'install', target, hooks: false },
      context(root)
    );
    assert.strictEqual(code, 0);
    assert.deepStrictEqual(errors, []);
    assert.deepStrictEqual(lines, [
      `installed 2 skills to ${target}`,
      'hooks: skipped (--no-hooks)',
    ]);
  });

  it('install --verbose includes per-skill detail', async () => {
    const target = path.join(root, 'target');
    const { lines, context } = collect();
    const code = await runInstall(
      { command: 'install', target, hooks: false, verbose: true },
      context(root)
    );
    assert.strictEqual(code, 0);
    assert.ok(lines.includes('+ architect'));
    assert.ok(lines.includes('+ engineer'));
  });

  it('install --dry-run uses dry-run prefix and does not write', async () => {
    const target = path.join(root, 'target-dry');
    const { lines, context } = collect();
    const code = await runInstall(
      { command: 'install', target, dryRun: true, hooks: false },
      context(root)
    );
    assert.strictEqual(code, 0);
    assert.deepStrictEqual(lines, [
      `dry-run: would install 2 skills to ${target}`,
      'dry-run: hooks skipped (--no-hooks)',
    ]);
    assert.ok(!fs.existsSync(target));
  });

  it('install reports skipped existing skills with --force hint', async () => {
    const target = path.join(root, 'target');
    fs.mkdirSync(path.join(target, 'architect'), { recursive: true });
    const { lines, context } = collect();
    const code = await runInstall(
      { command: 'install', target, hooks: false },
      context(root)
    );
    assert.strictEqual(code, 0);
    assert.ok(lines.includes('installed 1 skill to ' + target));
    assert.ok(lines.includes('skipped 1 existing skill (use --force to overwrite)'));
  });

  it('install dry-run fails and reports hook errors', async () => {
    const target = path.join(root, 'target-dry');
    const { lines, errors, context } = collect();
    const code = await runInstall(
      { command: 'install', target, dryRun: true },
      context(root),
      () => [{ agent: 'kimi', status: 'error', error: new Error('config broken') }]
    );
    assert.strictEqual(code, 1);
    assert.deepStrictEqual(errors, ['error: kimi: config broken']);
    assert.ok(!lines.some((line) => line.includes('no supported agents detected')));
  });

  it('install fails and reports hook errors after installing', async () => {
    const target = path.join(root, 'target');
    const { lines, errors, context } = collect();
    const code = await runInstall(
      { command: 'install', target },
      context(root),
      () => [
        { agent: 'kimi', status: 'configured', configPath: '/tmp/kimi.toml' },
        { agent: 'claude', status: 'error', error: new Error('permission denied') },
      ]
    );
    assert.strictEqual(code, 1);
    assert.ok(lines.includes('hooks: 1 configured, 0 skipped, 1 error'));
    assert.deepStrictEqual(errors, ['error: claude: permission denied']);
    assert.ok(!lines.includes('next: crewloop dashboard'));
  });

  it('resolves dashboard address from flags, env, and defaults', () => {
    const originalPort = process.env.CREWLOOP_DASHBOARD_PORT;
    const originalHost = process.env.CREWLOOP_DASHBOARD_HOST;
    try {
      delete process.env.CREWLOOP_DASHBOARD_PORT;
      delete process.env.CREWLOOP_DASHBOARD_HOST;
      assert.deepStrictEqual(resolveDashboardAddress({ command: 'dashboard' }), {
        host: '127.0.0.1',
        port: 7890,
      });

      process.env.CREWLOOP_DASHBOARD_PORT = '9090';
      process.env.CREWLOOP_DASHBOARD_HOST = '0.0.0.0';
      assert.deepStrictEqual(resolveDashboardAddress({ command: 'dashboard' }), {
        host: '0.0.0.0',
        port: 9090,
      });

      assert.deepStrictEqual(
        resolveDashboardAddress({ command: 'dashboard', port: 8080, host: 'localhost' }),
        { host: 'localhost', port: 8080 }
      );

      process.env.CREWLOOP_DASHBOARD_PORT = 'not-a-port';
      assert.deepStrictEqual(resolveDashboardAddress({ command: 'dashboard' }), {
        host: '0.0.0.0',
        port: 7890,
      });
    } finally {
      if (originalPort === undefined) delete process.env.CREWLOOP_DASHBOARD_PORT;
      else process.env.CREWLOOP_DASHBOARD_PORT = originalPort;
      if (originalHost === undefined) delete process.env.CREWLOOP_DASHBOARD_HOST;
      else process.env.CREWLOOP_DASHBOARD_HOST = originalHost;
    }
  });

  it('install fails when no skills match', async () => {
    const { errors, context } = collect();
    const code = await runInstall(
      { command: 'install', target: path.join(root, 't'), skills: ['missing'], hooks: false },
      context(root)
    );
    assert.strictEqual(code, 1);
    assert.deepStrictEqual(errors, ['error: no matching skills found']);
  });

  it('install without --diamondblock makes zero diamondblock calls', async () => {
    const target = path.join(root, 'target');
    const { lines, errors, context } = collect();
    let calls = 0;
    const runner: DiamondBlockCommandRunner = {
      findExecutable: () => {
        calls++;
        return '/usr/bin/diamondblock';
      },
      preflight: () => {
        calls++;
        return diamondblockResult();
      },
      install: () => {
        calls++;
        return diamondblockResult({ status: 'configured', dryRun: false });
      },
    };
    const code = await runInstall(
      { command: 'install', target, hooks: false },
      context(root),
      undefined,
      runner
    );
    assert.strictEqual(code, 0);
    assert.strictEqual(calls, 0);
    assert.deepStrictEqual(lines, [
      `installed 2 skills to ${target}`,
      'hooks: skipped (--no-hooks)',
    ]);
    assert.deepStrictEqual(errors, []);
  });

  it('install --diamondblock aborts before mutation when preflight fails', async () => {
    const target = path.join(root, 'target');
    const { lines, errors, context } = collect();
    let hookCalls = 0;
    let installCalls = 0;
    const runner: DiamondBlockCommandRunner = {
      findExecutable: () => '/usr/bin/diamondblock',
      preflight: () =>
        diamondblockResult({ status: 'unsupported', exitCode: 3, stderr: 'unsupported target' }),
      install: () => {
        installCalls++;
        return diamondblockResult({ status: 'failed', dryRun: false, exitCode: 1 });
      },
    };
    const code = await runInstall(
      { command: 'install', target, diamondblock: true },
      context(root),
      () => {
        hookCalls++;
        return [];
      },
      runner
    );
    assert.strictEqual(code, 1);
    assert.strictEqual(hookCalls, 0);
    assert.strictEqual(installCalls, 0);
    assert.ok(!fs.existsSync(target));
    assert.deepStrictEqual(lines, []);
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].includes('diamondblock preflight unsupported'));
    assert.ok(errors[0].includes('exit code 3'));
    assert.ok(errors[0].includes('unsupported target'));
  });

  it('install --diamondblock fails before mutation when no executable is found', async () => {
    const target = path.join(root, 'target');
    const { lines, errors, context } = collect();
    let hookCalls = 0;
    let preflightCalls = 0;
    const runner: DiamondBlockCommandRunner = {
      findExecutable: () => undefined,
      preflight: () => {
        preflightCalls++;
        return diamondblockResult({ status: 'unavailable', exitCode: 1 });
      },
      install: () => diamondblockResult({ status: 'configured', dryRun: false }),
    };
    const code = await runInstall(
      { command: 'install', target, diamondblock: true },
      context(root),
      () => {
        hookCalls++;
        return [];
      },
      runner
    );
    assert.strictEqual(code, 1);
    assert.strictEqual(preflightCalls, 0);
    assert.strictEqual(hookCalls, 0);
    assert.ok(!fs.existsSync(target));
    assert.deepStrictEqual(lines, []);
    assert.ok(errors[0].includes('npm i -g diamondblock'));
  });

  it('install --dry-run --diamondblock runs only the official preflight', async () => {
    const target = path.join(root, 'target-dry');
    const { lines, errors, context } = collect();
    const preflightRequests: DiamondBlockInstallRequest[] = [];
    let installCalls = 0;
    const runner: DiamondBlockCommandRunner = {
      findExecutable: () => '/usr/bin/diamondblock',
      preflight: (request) => {
        preflightRequests.push(request);
        return diamondblockResult({ stdout: 'preflight ok' });
      },
      install: () => {
        installCalls++;
        return diamondblockResult({ status: 'configured', dryRun: false });
      },
    };
    const code = await runInstall(
      { command: 'install', target, dryRun: true, hooks: false, diamondblock: true },
      context(root),
      undefined,
      runner
    );
    assert.strictEqual(code, 0);
    assert.strictEqual(installCalls, 0);
    assert.strictEqual(preflightRequests.length, 1);
    assert.strictEqual(preflightRequests[0].agent, undefined);
    assert.strictEqual(preflightRequests[0].dryRun, true);
    assert.ok(!fs.existsSync(target));
    assert.ok(lines.some((line) => line.startsWith('dry-run: would install')));
    assert.ok(lines.some((line) => line === 'diamondblock: ready'));
    assert.ok(lines.some((line) => line.includes('preflight ok')));
    assert.deepStrictEqual(errors, []);
  });

  it('install --diamondblock runs the official installer after CrewLoop steps', async () => {
    const target = path.join(root, 'target');
    const { lines, errors, context } = collect();
    const preflightRequests: DiamondBlockInstallRequest[] = [];
    const installRequests: DiamondBlockInstallRequest[] = [];
    const runner: DiamondBlockCommandRunner = {
      findExecutable: () => '/usr/bin/diamondblock',
      preflight: (request) => {
        preflightRequests.push(request);
        return diamondblockResult();
      },
      install: (request) => {
        installRequests.push(request);
        assert.ok(
          fs.existsSync(path.join(target, 'architect', 'SKILL.md')),
          'skills must be installed before the official install runs'
        );
        return diamondblockResult({ status: 'configured', dryRun: false });
      },
    };
    const code = await runInstall(
      { command: 'install', target, agent: 'claude', hooks: false, diamondblock: true },
      context(root),
      undefined,
      runner
    );
    assert.strictEqual(code, 0);
    assert.ok(fs.existsSync(path.join(target, 'engineer', 'SKILL.md')));
    assert.strictEqual(preflightRequests.length, 1);
    assert.strictEqual(preflightRequests[0].agent, 'claude');
    assert.strictEqual(preflightRequests[0].dryRun, true);
    assert.strictEqual(installRequests.length, 1);
    assert.strictEqual(installRequests[0].agent, 'claude');
    assert.strictEqual(installRequests[0].dryRun, false);
    assert.ok(lines.some((line) => line === 'diamondblock: configured'));
    assert.deepStrictEqual(errors, []);
  });

  it('install --diamondblock reports partial state when the official installer fails', async () => {
    const target = path.join(root, 'target');
    const { lines, errors, context } = collect();
    const runner: DiamondBlockCommandRunner = {
      findExecutable: () => '/usr/bin/diamondblock',
      preflight: () => diamondblockResult(),
      install: () =>
        diamondblockResult({ status: 'failed', dryRun: false, exitCode: 2, stderr: 'write failed' }),
    };
    const code = await runInstall(
      { command: 'install', target, hooks: false, diamondblock: true },
      context(root),
      undefined,
      runner
    );
    assert.strictEqual(code, 1);
    assert.ok(fs.existsSync(path.join(target, 'architect', 'SKILL.md')));
    assert.ok(lines.some((line) => line === 'diamondblock: failed'));
    assert.ok(errors.some((line) => line.includes('may already be installed')));
  });

  it('doctor reports diamondblock layers as optional checks', () => {
    createDashboard(root);
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    const skillDir = path.join(home, '.agents', 'skills', 'diamondblock');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: diamondblock\n---\n');
    const executions: Array<{ executable: string; args: readonly string[] }> = [];
    const report = runDoctor({
      packageRoot: root,
      homeDir: home,
      findOnPath: (binary) =>
        binary === 'crewloop-shim'
          ? '/usr/bin/crewloop-shim'
          : binary === 'diamondblock'
            ? '/usr/bin/diamondblock'
            : undefined,
      executeCommand: (executable, args) => {
        executions.push({ executable, args });
        return { exitCode: 0, stdout: '', stderr: '' };
      },
    });
    assert.strictEqual(report.exitCode, 0);
    const skill = report.checks.find((c) => c.label === 'diamondblock skill');
    assert.strictEqual(skill?.level, 'ok');
    const binary = report.checks.find((c) => c.label === 'diamondblock binary');
    assert.deepStrictEqual(binary, {
      level: 'ok',
      label: 'diamondblock binary',
      detail: '/usr/bin/diamondblock',
    });
    const installer = report.checks.find((c) => c.label === 'diamondblock installer');
    assert.strictEqual(installer?.level, 'ok');
    assert.deepStrictEqual(executions, [
      { executable: '/usr/bin/diamondblock', args: ['install', '--dry-run'] },
    ]);
    const runtime = report.checks.find((c) => c.label === 'diamondblock runtime');
    assert.deepStrictEqual(runtime, {
      level: 'warn',
      label: 'diamondblock runtime',
      detail: 'verify in agent: expected MCP tools must be exposed',
    });
  });

  it('doctor detects the diamondblock skill installed for a non-default agent', () => {
    createDashboard(root);
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    const claudeSkillDir = path.join(home, '.claude', 'skills', 'diamondblock');
    fs.mkdirSync(claudeSkillDir, { recursive: true });
    fs.writeFileSync(path.join(claudeSkillDir, 'SKILL.md'), '---\nname: diamondblock\n---\n');
    const report = runDoctor({
      packageRoot: root,
      homeDir: home,
      findOnPath: (binary) => (binary === 'crewloop-shim' ? '/usr/bin/crewloop-shim' : undefined),
    });
    assert.strictEqual(report.exitCode, 0);
    const skill = report.checks.find((c) => c.label === 'diamondblock skill');
    assert.deepStrictEqual(skill, {
      level: 'ok',
      label: 'diamondblock skill',
      detail: 'installed for: claude',
    });
  });

  it('doctor warns without failing when diamondblock is absent', () => {
    createDashboard(root);
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    let executions = 0;
    const report = runDoctor({
      packageRoot: root,
      homeDir: home,
      findOnPath: (binary) => (binary === 'crewloop-shim' ? '/usr/bin/crewloop-shim' : undefined),
      executeCommand: () => {
        executions++;
        return { exitCode: 0, stdout: '', stderr: '' };
      },
    });
    assert.strictEqual(report.exitCode, 0);
    assert.strictEqual(executions, 0);
    const skill = report.checks.find((c) => c.label === 'diamondblock skill');
    assert.strictEqual(skill?.level, 'warn');
    const binary = report.checks.find((c) => c.label === 'diamondblock binary');
    assert.strictEqual(binary?.level, 'warn');
    assert.ok(binary?.detail.includes('npm i -g diamondblock'));
    assert.ok(!report.checks.some((c) => c.label === 'diamondblock installer'));
    const runtime = report.checks.find((c) => c.label === 'diamondblock runtime');
    assert.strictEqual(runtime?.level, 'warn');
    assert.ok(
      !report.checks.some((c) => c.label.startsWith('diamondblock') && c.level === 'error'),
      'diamondblock checks must never produce error level'
    );
  });

  it('doctor warns when the official installer preflight is unsupported', () => {
    createDashboard(root);
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-home-'));
    cleanupDirs.push(home);
    const report = runDoctor({
      packageRoot: root,
      homeDir: home,
      findOnPath: (binary) =>
        binary === 'crewloop-shim'
          ? '/usr/bin/crewloop-shim'
          : binary === 'dblock'
            ? '/usr/bin/dblock'
            : undefined,
      executeCommand: () => ({ exitCode: 5, stdout: '', stderr: 'unsupported target' }),
    });
    assert.strictEqual(report.exitCode, 0);
    const binary = report.checks.find((c) => c.label === 'diamondblock binary');
    assert.deepStrictEqual(binary, {
      level: 'ok',
      label: 'diamondblock binary',
      detail: '/usr/bin/dblock',
    });
    const installer = report.checks.find((c) => c.label === 'diamondblock installer');
    assert.strictEqual(installer?.level, 'warn');
    assert.ok(installer?.detail.includes('unsupported'));
    assert.ok(installer?.detail.includes('5'));
  });
});
