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
      findOnPath: () => '/usr/bin/crewloop-shim',
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
      findOnPath: () => '/usr/bin/crewloop-shim',
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
      findOnPath: () => '/usr/bin/crewloop-shim',
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
      findOnPath: () => '/usr/bin/crewloop-shim',
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
});
