import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveAgentDir, listSupportedAgents } from '../agents';

describe('agents', () => {
  it('returns default agent directory when no agent is specified', () => {
    const dir = resolveAgentDir();
    assert.ok(dir.includes('.agents'));
  });

  it('resolves known agents', () => {
    const dir = resolveAgentDir('claude');
    assert.ok(dir.includes('.claude'));
  });

  it('throws for unknown agents', () => {
    assert.throws(() => resolveAgentDir('unknown'), /Unknown agent/);
  });

  it('lists supported agents', () => {
    const agents = listSupportedAgents();
    assert.ok(agents.length > 0);
    assert.ok(agents.some((a: { id: string }) => a.id === 'kimi'));
  });
});
