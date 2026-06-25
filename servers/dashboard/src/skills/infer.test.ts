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
  { name: 'orchestrator', description: '', icon: 'target' },
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

  it('infers researcher from Read tool', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'Read', detail: 'README.md' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, 'researcher');
    assert.equal(result.confidence, 'heuristic');
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

  it('returns unknown when nothing matches', () => {
    const engine = new SkillInferenceEngine(skills);
    const event = makeEvent({ tool: 'UnknownTool' });
    const result = engine.infer(event, makeSession());
    assert.equal(result.skill, undefined);
    assert.equal(result.confidence, 'unknown');
  });
});
