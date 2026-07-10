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
    fs.writeFileSync(path.join(skillSource, 'SKILL.md'), '# Skill\n');

    const skills: SkillManifest[] = [
      { name: 'example', description: '', sourcePath: skillSource },
    ];

    const result = installSkills(skills, targetDir, {}, sharedRoot);
    assert.deepStrictEqual(result.installed, ['example']);

    const installedSkillPath = path.join(targetDir, 'example');
    assert.ok(fs.existsSync(path.join(installedSkillPath, 'references', 'conventions.md')));
    assert.ok(fs.existsSync(path.join(installedSkillPath, 'assets', 'templates', 'skill.md')));

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
    assert.ok(content.includes('references/conventions.md'));
    assert.ok(content.includes('references/workflow.md'));

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

  it('creates symlinks for shared dirs inside the skill in symlink mode', () => {
    const skillSource = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-skillsource-'));
    fs.writeFileSync(
      path.join(skillSource, 'SKILL.md'),
      'See [conventions](../../references/conventions.md).\n'
    );

    const skills: SkillManifest[] = [
      { name: 'example', description: '', sourcePath: skillSource },
    ];

    const result = installSkills(skills, targetDir, { force: true, symlink: true }, sharedRoot);
    assert.deepStrictEqual(result.installed, ['example']);

    const installedSkillPath = path.join(targetDir, 'example');
    assert.ok(fs.lstatSync(installedSkillPath).isSymbolicLink());

    const sharedReferencesLink = path.join(installedSkillPath, 'references');
    const sharedAssetsLink = path.join(installedSkillPath, 'assets');
    assert.ok(fs.lstatSync(sharedReferencesLink).isSymbolicLink());
    assert.ok(fs.lstatSync(sharedAssetsLink).isSymbolicLink());
    assert.ok(fs.existsSync(path.join(sharedReferencesLink, 'conventions.md')));
    assert.ok(fs.existsSync(path.join(sharedAssetsLink, 'templates', 'skill.md')));

    const skillFile = path.join(installedSkillPath, 'SKILL.md');
    const content = fs.readFileSync(skillFile, 'utf-8');
    assert.ok(content.includes('../../references/conventions.md'));

    fs.rmSync(skillSource, { recursive: true, force: true });
  });
});
