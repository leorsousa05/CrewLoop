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
