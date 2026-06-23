import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { installSkills, mergeSharedDirs } from '../installer';
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

describe('mergeSharedDirs', () => {
  let sharedRoot: string;
  let targetDir: string;

  before(() => {
    sharedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-shared-'));
    targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skill-'));

    fs.mkdirSync(path.join(sharedRoot, 'references'), { recursive: true });
    fs.writeFileSync(path.join(sharedRoot, 'references', 'conventions.md'), '# Conventions\n');

    fs.mkdirSync(path.join(sharedRoot, 'assets', 'templates'), { recursive: true });
    fs.writeFileSync(path.join(sharedRoot, 'assets', 'templates', 'skill.md'), '# Template\n');
  });

  after(() => {
    fs.rmSync(sharedRoot, { recursive: true, force: true });
    fs.rmSync(targetDir, { recursive: true, force: true });
  });

  it('copies shared references and assets into target skill', () => {
    mergeSharedDirs(targetDir, sharedRoot, {});

    assert.ok(fs.existsSync(path.join(targetDir, 'references', 'conventions.md')));
    assert.ok(fs.existsSync(path.join(targetDir, 'assets', 'templates', 'skill.md')));
  });

  it('overwrites existing skill files with shared copies', () => {
    fs.mkdirSync(path.join(targetDir, 'references'), { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'references', 'conventions.md'), '# Skill-specific\n');

    mergeSharedDirs(targetDir, sharedRoot, {});

    const content = fs.readFileSync(path.join(targetDir, 'references', 'conventions.md'), 'utf-8');
    assert.strictEqual(content, '# Conventions\n');
  });

  it('respects dry-run', () => {
    const dryTarget = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-dry-'));

    mergeSharedDirs(dryTarget, sharedRoot, { dryRun: true });

    assert.ok(!fs.existsSync(path.join(dryTarget, 'references')));
    assert.ok(!fs.existsSync(path.join(dryTarget, 'assets')));

    fs.rmSync(dryTarget, { recursive: true, force: true });
  });

  it('merges shared dirs into each installed skill', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    const skillTarget = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skilltarget-'));

    fs.writeFileSync(path.join(skillSource, 'SKILL.md'), '# Skill\n');

    const skills: SkillManifest[] = [
      { name: 'example', description: '', sourcePath: skillSource },
    ];

    const result = installSkills(skills, skillTarget, {}, sharedRoot);
    assert.deepStrictEqual(result.installed, ['example']);
    assert.ok(fs.existsSync(path.join(skillTarget, 'example', 'references', 'conventions.md')));
    assert.ok(fs.existsSync(path.join(skillTarget, 'example', 'assets', 'templates', 'skill.md')));

    fs.rmSync(skillSource, { recursive: true, force: true });
    fs.rmSync(skillTarget, { recursive: true, force: true });
  });

  it('does not merge shared dirs in symlink mode and leaves source unchanged', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    const skillTarget = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skilltarget-'));

    fs.writeFileSync(path.join(skillSource, 'SKILL.md'), '# Skill\n');

    const skills: SkillManifest[] = [
      { name: 'example', description: '', sourcePath: skillSource },
    ];

    const result = installSkills(skills, skillTarget, { symlink: true }, sharedRoot);
    assert.deepStrictEqual(result.installed, ['example']);

    const installedSkillPath = path.join(skillTarget, 'example');
    assert.ok(fs.lstatSync(installedSkillPath).isSymbolicLink() || fs.lstatSync(installedSkillPath).isDirectory());
    assert.ok(!fs.existsSync(path.join(installedSkillPath, 'references')));
    assert.ok(!fs.existsSync(path.join(installedSkillPath, 'assets')));

    assert.ok(!fs.existsSync(path.join(skillSource, 'references')));
    assert.ok(!fs.existsSync(path.join(skillSource, 'assets')));

    fs.rmSync(skillSource, { recursive: true, force: true });
    fs.rmSync(skillTarget, { recursive: true, force: true });
  });
});
