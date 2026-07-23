import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { installSkills } from '../installer';
import type { SkillManifest } from '../resolver';

describe('installer', () => {
  let sourceDir: string;
  let targetDir: string;

  before(() => {
    sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-source-'));
    targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-target-'));

    fs.mkdirSync(path.join(sourceDir, 'architect'), { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'architect', 'SKILL.md'), '# Architect\n');
  });

  after(() => {
    fs.rmSync(sourceDir, { recursive: true, force: true });
    fs.rmSync(targetDir, { recursive: true, force: true });
  });

  it('copies skills to target directory', () => {
    const skills: SkillManifest[] = [
      { name: 'architect', description: '', sourcePath: path.join(sourceDir, 'architect') },
    ];

    const result = installSkills(skills, targetDir, {});
    assert.deepStrictEqual(result.installed, ['architect']);
    assert.strictEqual(result.skipped.length, 0);
    assert.strictEqual(result.errors.length, 0);
    assert.ok(fs.existsSync(path.join(targetDir, 'architect', 'SKILL.md')));
  });

  it('skips existing skills without force', () => {
    const skills: SkillManifest[] = [
      { name: 'architect', description: '', sourcePath: path.join(sourceDir, 'architect') },
    ];

    const result = installSkills(skills, targetDir, {});
    assert.strictEqual(result.installed.length, 0);
    assert.deepStrictEqual(result.skipped, ['architect']);
  });

  it('overwrites existing skills with force', () => {
    const skills: SkillManifest[] = [
      { name: 'architect', description: '', sourcePath: path.join(sourceDir, 'architect') },
    ];

    const result = installSkills(skills, targetDir, { force: true });
    assert.deepStrictEqual(result.installed, ['architect']);
    assert.strictEqual(result.skipped.length, 0);
    assert.ok(fs.existsSync(path.join(targetDir, 'architect', 'SKILL.md')));
  });

  it('dry-run does not write files', () => {
    const dryTarget = path.join(targetDir, 'dry');
    const skills: SkillManifest[] = [
      { name: 'architect', description: '', sourcePath: path.join(sourceDir, 'architect') },
    ];

    const result = installSkills(skills, dryTarget, { dryRun: true });
    assert.deepStrictEqual(result.installed, ['architect']);
    assert.ok(!fs.existsSync(dryTarget));
  });
});

describe('shared references and assets', () => {
  let sharedRoot: string;
  let targetDir: string;

  before(() => {
    sharedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-shared-'));
    targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-target-'));

    fs.mkdirSync(path.join(sharedRoot, 'references'), { recursive: true });
    fs.writeFileSync(path.join(sharedRoot, 'references', 'conventions.md'), '# Conventions\n');

    fs.mkdirSync(path.join(sharedRoot, 'assets', 'templates'), { recursive: true });
    fs.writeFileSync(path.join(sharedRoot, 'assets', 'templates', 'skill.md'), '# Template\n');
  });

  after(() => {
    fs.rmSync(sharedRoot, { recursive: true, force: true });
    fs.rmSync(targetDir, { recursive: true, force: true });
  });

  it('copies shared references and assets into each installed skill', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    fs.mkdirSync(path.join(skillSource, 'references'), { recursive: true });
    fs.writeFileSync(path.join(skillSource, 'references', 'conventions.md'), '# Local conventions\n');
    fs.mkdirSync(path.join(skillSource, 'assets', 'templates'), { recursive: true });
    fs.writeFileSync(path.join(skillSource, 'assets', 'templates', 'skill.md'), '# Local template\n');
    fs.writeFileSync(
      path.join(skillSource, 'SKILL.md'),
      'See [shared](../../references/conventions.md) and [asset](../../assets/templates/skill.md).\n'
    );

    const skills: SkillManifest[] = [
      { name: 'example', description: '', sourcePath: skillSource },
    ];

    const result = installSkills(skills, targetDir, {}, sharedRoot);
    assert.deepStrictEqual(result.installed, ['example']);

    const installedSkillPath = path.join(targetDir, 'example');
    assert.strictEqual(
      fs.readFileSync(path.join(installedSkillPath, 'references', 'conventions.md'), 'utf8'),
      '# Local conventions\n'
    );
    assert.strictEqual(
      fs.readFileSync(path.join(installedSkillPath, 'assets', 'templates', 'skill.md'), 'utf8'),
      '# Local template\n'
    );
    assert.strictEqual(
      fs.readFileSync(path.join(installedSkillPath, '_crewloop', 'references', 'conventions.md'), 'utf8'),
      '# Conventions\n'
    );
    assert.strictEqual(
      fs.readFileSync(path.join(installedSkillPath, '_crewloop', 'assets', 'templates', 'skill.md'), 'utf8'),
      '# Template\n'
    );
    const installedSkill = fs.readFileSync(path.join(installedSkillPath, 'SKILL.md'), 'utf8');
    assert.ok(installedSkill.includes('_crewloop/references/conventions.md'));
    assert.ok(installedSkill.includes('_crewloop/assets/templates/skill.md'));

    fs.rmSync(skillSource, { recursive: true, force: true });
  });

  it('rewrites relative shared links in SKILL.md to local paths', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    fs.writeFileSync(
      path.join(skillSource, 'SKILL.md'),
      'See [conventions](../../references/conventions.md) and [workflow](../../references/workflow.md).\n'
    );

    const skills: SkillManifest[] = [
      { name: 'example', description: '', sourcePath: skillSource },
    ];

    const result = installSkills(skills, targetDir, { force: true }, sharedRoot);
    assert.deepStrictEqual(result.installed, ['example']);

    const installedSkillFile = path.join(targetDir, 'example', 'SKILL.md');
    const content = fs.readFileSync(installedSkillFile, 'utf-8');
    assert.ok(!content.includes('../../references/'));
    assert.ok(content.includes('_crewloop/references/conventions.md'));
    assert.ok(content.includes('_crewloop/references/workflow.md'));

    fs.rmSync(skillSource, { recursive: true, force: true });
  });

  it('does not write shared files during dry-run', () => {
    const dryTarget = path.join(targetDir, 'dry');
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    fs.writeFileSync(path.join(skillSource, 'SKILL.md'), '# Skill\n');

    const skills: SkillManifest[] = [
      { name: 'example', description: '', sourcePath: skillSource },
    ];

    const result = installSkills(skills, dryTarget, { dryRun: true }, sharedRoot);
    assert.deepStrictEqual(result.installed, ['example']);
    assert.ok(!fs.existsSync(dryTarget));

    fs.rmSync(skillSource, { recursive: true, force: true });
  });

  it('creates a safe wrapper with linked local and shared payloads in symlink mode', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    fs.mkdirSync(path.join(skillSource, 'references'), { recursive: true });
    fs.writeFileSync(path.join(skillSource, 'references', 'local.md'), '# Local\n');
    fs.writeFileSync(
      path.join(skillSource, 'SKILL.md'),
      'See [conventions](../../references/conventions.md).\n'
    );
    const sourceSnapshot = snapshotDirectory(skillSource);

    const skills: SkillManifest[] = [
      { name: 'example', description: '', sourcePath: skillSource },
    ];

    const result = installSkills(skills, targetDir, { force: true, symlink: true }, sharedRoot);
    assert.deepStrictEqual(result.installed, ['example']);

    const installedSkillPath = path.join(targetDir, 'example');
    assert.ok(fs.lstatSync(installedSkillPath).isDirectory());
    assert.ok(!fs.lstatSync(installedSkillPath).isSymbolicLink());

    const localReferencesLink = path.join(installedSkillPath, 'references');
    const sharedReferencesLink = path.join(installedSkillPath, '_crewloop', 'references');
    const sharedAssetsLink = path.join(installedSkillPath, '_crewloop', 'assets');
    assert.ok(fs.lstatSync(localReferencesLink).isSymbolicLink());
    assert.ok(fs.lstatSync(sharedReferencesLink).isSymbolicLink());
    assert.ok(fs.lstatSync(sharedAssetsLink).isSymbolicLink());
    assert.ok(fs.existsSync(path.join(localReferencesLink, 'local.md')));
    assert.ok(fs.existsSync(path.join(sharedReferencesLink, 'conventions.md')));
    assert.ok(fs.existsSync(path.join(sharedAssetsLink, 'templates', 'skill.md')));

    const skillFile = path.join(installedSkillPath, 'SKILL.md');
    const content = fs.readFileSync(skillFile, 'utf-8');
    assert.ok(content.includes('_crewloop/references/conventions.md'));
    assert.deepStrictEqual(snapshotDirectory(skillSource), sourceSnapshot);

    fs.rmSync(skillSource, { recursive: true, force: true });
  });

  it('replaces a legacy root symlink without mutating its source', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    fs.mkdirSync(path.join(skillSource, 'references'), { recursive: true });
    fs.writeFileSync(path.join(skillSource, 'references', 'local.md'), '# Local\n');
    fs.writeFileSync(path.join(skillSource, 'SKILL.md'), '# Skill\n');
    const sourceSnapshot = snapshotDirectory(skillSource);
    const installedSkillPath = path.join(targetDir, 'example');

    fs.rmSync(installedSkillPath, { recursive: true, force: true });
    fs.symlinkSync(skillSource, installedSkillPath, os.platform() === 'win32' ? 'junction' : 'dir');

    const result = installSkills(
      [{ name: 'example', description: '', sourcePath: skillSource }],
      targetDir,
      { force: true, symlink: true },
      sharedRoot
    );

    assert.deepStrictEqual(result.installed, ['example']);
    assert.ok(fs.lstatSync(installedSkillPath).isDirectory());
    assert.ok(!fs.lstatSync(installedSkillPath).isSymbolicLink());
    assert.deepStrictEqual(snapshotDirectory(skillSource), sourceSnapshot);

    fs.rmSync(skillSource, { recursive: true, force: true });
  });

  it('replaces a dangling legacy root symlink with force', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    fs.writeFileSync(path.join(skillSource, 'SKILL.md'), '# Skill\n');
    const installedSkillPath = path.join(targetDir, 'example');
    const missingSource = path.join(os.tmpdir(), `crewloop-missing-${Date.now()}`);

    fs.rmSync(installedSkillPath, { recursive: true, force: true });
    fs.symlinkSync(missingSource, installedSkillPath, os.platform() === 'win32' ? 'junction' : 'dir');
    assert.ok(fs.lstatSync(installedSkillPath).isSymbolicLink());
    assert.ok(!fs.existsSync(installedSkillPath));

    const result = installSkills(
      [{ name: 'example', description: '', sourcePath: skillSource }],
      targetDir,
      { force: true, symlink: true },
      sharedRoot
    );

    assert.deepStrictEqual(result.installed, ['example']);
    assert.strictEqual(result.errors.length, 0);
    assert.ok(fs.lstatSync(installedSkillPath).isDirectory());
    assert.ok(!fs.lstatSync(installedSkillPath).isSymbolicLink());

    fs.rmSync(skillSource, { recursive: true, force: true });
  });

  it('rejects a source that uses the reserved namespace', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    fs.mkdirSync(path.join(skillSource, '_crewloop'));
    fs.writeFileSync(path.join(skillSource, 'SKILL.md'), '# Skill\n');

    const result = installSkills(
      [{ name: 'reserved', description: '', sourcePath: skillSource }],
      targetDir,
      { force: true },
      sharedRoot
    );

    assert.strictEqual(result.installed.length, 0);
    assert.strictEqual(result.errors.length, 1);
    assert.match(result.errors[0].message, /reserves the installer namespace/);

    fs.rmSync(skillSource, { recursive: true, force: true });
  });
});

function snapshotDirectory(root: string): Record<string, string> {
  const snapshot: Record<string, string> = {};

  function visit(current: string): void {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);
      const relativePath = path.relative(root, absolutePath);

      if (entry.isDirectory()) {
        snapshot[`${relativePath}/`] = 'directory';
        visit(absolutePath);
      } else if (entry.isSymbolicLink()) {
        snapshot[relativePath] = `symlink:${fs.readlinkSync(absolutePath)}`;
      } else {
        snapshot[relativePath] = fs.readFileSync(absolutePath).toString('base64');
      }
    }
  }

  visit(root);
  return snapshot;
}
