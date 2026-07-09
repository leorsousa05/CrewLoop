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
  let targetParent: string;
  let targetDir: string;

  before(() => {
    sharedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-shared-'));
    targetParent = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-target-parent-'));
    targetDir = fs.mkdtempSync(path.join(targetParent, 'skills-'));

    fs.mkdirSync(path.join(sharedRoot, 'references'), { recursive: true });
    fs.writeFileSync(path.join(sharedRoot, 'references', 'conventions.md'), '# Conventions\n');

    fs.mkdirSync(path.join(sharedRoot, 'assets', 'templates'), { recursive: true });
    fs.writeFileSync(path.join(sharedRoot, 'assets', 'templates', 'skill.md'), '# Template\n');
  });

  after(() => {
    fs.rmSync(sharedRoot, { recursive: true, force: true });
    fs.rmSync(targetParent, { recursive: true, force: true });
  });

  it('copies shared references and assets into parent of target directory', () => {
    mergeSharedDirs(targetDir, sharedRoot, {});

    assert.ok(fs.existsSync(path.join(targetParent, 'references', 'conventions.md')));
    assert.ok(fs.existsSync(path.join(targetParent, 'assets', 'templates', 'skill.md')));
  });

  it('overwrites existing shared files with shared copies', () => {
    fs.mkdirSync(path.join(targetParent, 'references'), { recursive: true });
    fs.writeFileSync(path.join(targetParent, 'references', 'conventions.md'), '# Skill-specific\n');

    mergeSharedDirs(targetDir, sharedRoot, {});

    const content = fs.readFileSync(path.join(targetParent, 'references', 'conventions.md'), 'utf-8');
    assert.strictEqual(content, '# Conventions\n');
  });

  it('respects dry-run', () => {
    const dryParent = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-dry-parent-'));
    const dryTarget = fs.mkdtempSync(path.join(dryParent, 'skills-'));

    mergeSharedDirs(dryTarget, sharedRoot, { dryRun: true });

    assert.ok(!fs.existsSync(path.join(dryParent, 'references')));
    assert.ok(!fs.existsSync(path.join(dryParent, 'assets')));

    fs.rmSync(dryParent, { recursive: true, force: true });
  });

  it('installs shared dirs at parent of skills target directory', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    const skillTargetParent = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skilltarget-parent-'));
    const skillTarget = fs.mkdtempSync(path.join(skillTargetParent, 'skills-'));

    fs.writeFileSync(path.join(skillSource, 'SKILL.md'), '# Skill\n');

    const skills: SkillManifest[] = [
      { name: 'example', description: '', sourcePath: skillSource },
    ];

    const result = installSkills(skills, skillTarget, {}, sharedRoot);
    assert.deepStrictEqual(result.installed, ['example']);
    assert.ok(fs.existsSync(path.join(skillTargetParent, 'references', 'conventions.md')));
    assert.ok(fs.existsSync(path.join(skillTargetParent, 'assets', 'templates', 'skill.md')));

    fs.rmSync(skillSource, { recursive: true, force: true });
    fs.rmSync(skillTargetParent, { recursive: true, force: true });
  });

  it('creates symlinks for shared dirs at parent of skills target in symlink mode', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    const skillTargetParent = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skilltarget-parent-'));
    const skillTarget = fs.mkdtempSync(path.join(skillTargetParent, 'skills-'));

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

    const sharedReferencesLink = path.join(skillTargetParent, 'references');
    const sharedAssetsLink = path.join(skillTargetParent, 'assets');
    assert.ok(fs.lstatSync(sharedReferencesLink).isSymbolicLink());
    assert.ok(fs.lstatSync(sharedAssetsLink).isSymbolicLink());
    assert.ok(fs.existsSync(path.join(sharedReferencesLink, 'conventions.md')));
    assert.ok(fs.existsSync(path.join(sharedAssetsLink, 'templates', 'skill.md')));

    assert.ok(!fs.existsSync(path.join(skillSource, 'references')));
    assert.ok(!fs.existsSync(path.join(skillSource, 'assets')));

    fs.rmSync(skillSource, { recursive: true, force: true });
    fs.rmSync(skillTargetParent, { recursive: true, force: true });
  });
});
