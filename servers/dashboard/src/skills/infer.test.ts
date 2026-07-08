import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SkillInferenceEngine } from './infer';
import type { DashboardEvent, Session } from '../types';

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'sess-1',
    source: 'kimi',
    events: [],
    tool_counts: {},
    lifecycle: 'running',
    started_at: Date.now(),
    last_event_at: Date.now(),
    ...overrides,
  };
}

function makeEvent(overrides: Partial<DashboardEvent> = {}): DashboardEvent {
  return {
    id: 'ev-1',
    timestamp: Date.now(),
    source: 'kimi',
    session_id: 'sess-1',
    event_type: 'tool_start',
    ...overrides,
  };
}

const skills = [
  { name: 'crewloop-hub', description: '', icon: 'target' },
  { name: 'architect', description: '', icon: 'blueprint' },
  { name: 'engineer', description: '', icon: 'wrench' },
  { name: 'shipper', description: '', icon: 'rocket-launch' },
  { name: 'researcher', description: '', icon: 'microscope' },
];

describe('SkillInferenceEngine', () => {
  it('infers explicit skill from skill_change event', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ event_type: 'skill_change', skill: 'architect' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, 'architect');
    assert.equal(result.confidence, 'explicit');
  });

  it('infers explicit skill from Skill tool detail', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'Skill', detail: 'engineer' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, 'engineer');
    assert.equal(result.confidence, 'explicit');
  });

  it('returns unknown for generic Read tool', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'Read', detail: 'README.md' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, undefined);
    assert.equal(result.confidence, 'unknown');
  });

  it('returns unknown for generic Bash tool', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'Bash', detail: 'ls -la' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, undefined);
    assert.equal(result.confidence, 'unknown');
  });

  it('infers shipper from git commit command', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'Bash', detail: 'git commit -m "feat: x"' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, 'shipper');
    assert.equal(result.confidence, 'heuristic');
  });

  it('falls back to session active skill', () => {
    const engine = new SkillInferenceEngine(skills);
    const session = makeSession({ active_skill: 'architect' });
    const event = makeEvent({ tool: 'UnknownTool' });
    const result = engine.infer(event, session);
    assert.equal(result.skill, 'architect');
    assert.equal(result.confidence, 'heuristic');
  });

  it('preserves explicit active skill when no new explicit signal arrives', () => {
    const engine = new SkillInferenceEngine(skills);
    const session = makeSession({ active_skill: 'crewloop-hub', active_confidence: 'explicit' });
    const event = makeEvent({ tool: 'Read', detail: 'README.md' });
    const result = engine.infer(event, session);
    assert.equal(result.skill, 'crewloop-hub');
    assert.equal(result.confidence, 'explicit');
  });

  it('returns unknown when nothing matches', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'UnknownTool' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, undefined);
    assert.equal(result.confidence, 'unknown');
  });

  it('falls back to default_skill when no active skill exists', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'Bash', detail: 'ls', default_skill: 'crewloop-hub' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, 'crewloop-hub');
    assert.equal(result.confidence, 'heuristic');
  });

  it('ignores default_skill when session already has active skill', () => {
    const engine = new SkillInferenceEngine(skills);
    const session = makeSession({ active_skill: 'architect' });
    const event = makeEvent({ tool: 'Bash', detail: 'ls', default_skill: 'crewloop-hub' });
    const result = engine.infer(event, session);
    assert.equal(result.skill, 'architect');
    assert.equal(result.confidence, 'heuristic');
  });
});

describe('SkillInferenceEngine fallback priority', () => {
  it('1) direct invocation via Skill tool input wins over everything', () => {
    const engine = new SkillInferenceEngine(skills);
    const session = makeSession({ active_skill: 'architect' });
    const event = makeEvent({
      tool: 'Skill',
      input: { skill: 'engineer' },
      default_skill: 'crewloop-hub',
    });
    const result = engine.infer(event, session);
    assert.equal(result.skill, 'engineer');
    assert.equal(result.confidence, 'explicit');
  });

  it('1) supports use_skill tool naming variant', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'use_skill', input: { skill: 'researcher' } });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, 'researcher');
    assert.equal(result.confidence, 'explicit');
  });

  it('2) infers from SKILL.md read when there is no direct invocation', () => {
    const engine = new SkillInferenceEngine(skills);
    const session = makeSession({ active_skill: 'architect' });
    const event = makeEvent({
      tool: 'Read',
      detail: '/home/user/.claude/skills/shipper/SKILL.md',
      default_skill: 'crewloop-hub',
    });
    const result = engine.infer(event, session);
    assert.equal(result.skill, 'shipper');
    assert.equal(result.confidence, 'heuristic');
  });

  it('2) infers from SKILL.md read via input file_path on Windows paths', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({
      tool: 'read_file',
      input: { file_path: 'C:\\Users\\arch\\.agents\\skills\\engineer\\SKILL.md' },
    });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, 'engineer');
    assert.equal(result.confidence, 'heuristic');
  });

  it('3) falls back to session metadata when no invocation or skill read', () => {
    const engine = new SkillInferenceEngine(skills);
    const session = makeSession({ active_skill: 'architect' });
    const event = makeEvent({ tool: 'Read', detail: 'README.md', default_skill: 'crewloop-hub' });
    const result = engine.infer(event, session);
    assert.equal(result.skill, 'architect');
    assert.equal(result.confidence, 'heuristic');
  });

  it('4) falls back to default_skill when session has no metadata', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'Read', detail: 'README.md', default_skill: 'crewloop-hub' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, 'crewloop-hub');
    assert.equal(result.confidence, 'heuristic');
  });

  it('5) returns unknown only when every strategy fails', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'Read', detail: 'README.md' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, undefined);
    assert.equal(result.confidence, 'unknown');
  });
});
