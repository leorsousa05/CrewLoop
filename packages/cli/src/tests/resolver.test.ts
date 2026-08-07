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
    fs.mkdirSync(path.join(skillsDir, 'crewloop-plan'), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, 'crewloop-code'), { recursive: true });
    fs.writeFileSync(
      path.join(skillsDir, 'crewloop-plan', 'SKILL.md'),
      '---\nname: crewloop:plan\ndescription: Creates specs\n---\n# CrewLoop Plan\n'
    );
    fs.writeFileSync(
      path.join(skillsDir, 'crewloop-code', 'SKILL.md'),
      '---\nname: crewloop:code\ndescription: Builds code\n---\n# CrewLoop Code\n'
    );
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('discovers all skills', () => {
    const skills = resolveSkills(tmpDir);
    assert.strictEqual(skills.length, 2);
    assert.ok(skills.some((s: { name: string }) => s.name === 'crewloop-plan'));
    assert.ok(skills.some((s: { name: string }) => s.name === 'crewloop-code'));
  });

  it('filters skills by name', () => {
    const skills = resolveSkills(tmpDir, ['crewloop-plan']);
    assert.strictEqual(skills.length, 1);
    assert.strictEqual(skills[0].name, 'crewloop-plan');
    assert.strictEqual(skills[0].description, 'Creates specs');
  });

  it('throws when skills directory is missing', () => {
    assert.throws(() => resolveSkills(path.join(tmpDir, 'missing')), /Skills directory not found/);
  });
});
