import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { resolveSkills } from '../resolver';

describe('resolver', () => {
  let tmpDir: string;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-resolver-'));
    const skillsDir = path.join(tmpDir, 'skills');
    fs.mkdirSync(path.join(skillsDir, 'architect'), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, 'engineer'), { recursive: true });
    fs.writeFileSync(
      path.join(skillsDir, 'architect', 'SKILL.md'),
      '---\nname: architect\ndescription: Creates specs\n---\n# Architect\n'
    );
    fs.writeFileSync(
      path.join(skillsDir, 'engineer', 'SKILL.md'),
      '---\nname: engineer\ndescription: Builds code\n---\n# Engineer\n'
    );
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('discovers all skills', () => {
    const skills = resolveSkills(tmpDir);
    assert.strictEqual(skills.length, 2);
    assert.ok(skills.some((s: { name: string }) => s.name === 'architect'));
    assert.ok(skills.some((s: { name: string }) => s.name === 'engineer'));
  });

  it('filters skills by name', () => {
    const skills = resolveSkills(tmpDir, ['architect']);
    assert.strictEqual(skills.length, 1);
    assert.strictEqual(skills[0].name, 'architect');
    assert.strictEqual(skills[0].description, 'Creates specs');
  });

  it('throws when skills directory is missing', () => {
    assert.throws(() => resolveSkills(path.join(tmpDir, 'missing')), /Skills directory not found/);
  });
});
