import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { formatDuration, formatTime, truncate, escapeHtml, prettyJson } from '../lib/format';
import { listWorkspaceFiles } from '../lib/workspace-access';
import { resolvePath } from '../lib/paths';
import { projectInvocations, buildFileActivity, operationType } from '../lib/invocations';
import { buildGraph3D } from '../lib/graph';
import type { ClientEvent, ClientSession } from '../types';

describe('format', () => {
  it('formats duration', () => {
    assert.equal(formatDuration(0), '00:00');
    assert.equal(formatDuration(61000), '01:01');
    assert.equal(formatDuration(3661000), '1:01:01');
    assert.equal(formatDuration(undefined), '00:00');
  });

  it('formats time', () => {
    const ts = new Date('2026-06-26T14:30:45').getTime();
    assert.equal(formatTime(ts), '14:30:45');
  });

  it('truncates strings', () => {
    assert.equal(truncate('hello', 10), 'hello');
    assert.equal(truncate('hello world', 6), 'hello…');
  });

  it('escapes html', () => {
    assert.equal(escapeHtml('<div>"x" & \'y\'</div>'), '&lt;div&gt;&quot;x&quot; &amp; &#039;y&#039;&lt;/div&gt;');
  });

  it('pretty prints json', () => {
    assert.equal(prettyJson({ a: 1 }), '{\n  "a": 1\n}');
  });
});

describe('resolvePath', () => {
  it('resolves input.path', () => {
    assert.equal(resolvePath({ path: 'a.txt' }), 'a.txt');
  });

  it('prefers input.path over output.path', () => {
    assert.equal(resolvePath({ path: 'in.txt' }, { path: 'out.txt' }), 'in.txt');
  });

  it('resolves operations[].path', () => {
    assert.equal(resolvePath({ operations: [{ path: 'op.txt' }] }), 'op.txt');
  });

  it('resolves camelCase filePath', () => {
    assert.equal(resolvePath({ filePath: 'camel.txt' }), 'camel.txt');
  });

  it('resolves AbsolutePath and TargetFile and lowercase variants', () => {
    assert.equal(resolvePath({ AbsolutePath: 'abs.txt' }), 'abs.txt');
    assert.equal(resolvePath({ TargetFile: 'tgt.txt' }), 'tgt.txt');
    assert.equal(resolvePath({ args: { AbsolutePath: 'args-abs.txt' } }), 'args-abs.txt');
    assert.equal(resolvePath({ args: { TargetFile: 'args-tgt.txt' } }), 'args-tgt.txt');
    assert.equal(resolvePath({ targetfile: 'low-tgt.txt' }), 'low-tgt.txt');
  });
});

describe('projectInvocations', () => {
  it('pairs tool_start with tool_end (server newest-first order)', () => {
    const events: ClientEvent[] = [
      { id: '2', timestamp: 1100, event_type: 'tool_end', tool: 'Read', status: 'success', duration_ms: 100, output: { content: 'hi' } },
      { id: '1', timestamp: 1000, event_type: 'tool_start', tool: 'Read', input: { path: 'a.txt' } },
    ];
    const invs = projectInvocations(events);
    assert.equal(invs.length, 1);
    assert.equal(invs[0].status, 'success');
    assert.equal(invs[0].durationMs, 100);
  });

  it('keeps running invocations when end is missing', () => {
    const events: ClientEvent[] = [
      { id: '1', timestamp: 1000, event_type: 'tool_start', tool: 'Bash', input: { command: 'ls' } },
    ];
    const invs = projectInvocations(events);
    assert.equal(invs.length, 1);
    assert.equal(invs[0].status, 'running');
  });

  it('renders newest invocations at the top', () => {
    const events: ClientEvent[] = [
      { id: '4', timestamp: 4000, event_type: 'tool_end', tool: 'Read', status: 'success' },
      { id: '3', timestamp: 3000, event_type: 'tool_start', tool: 'Read' },
      { id: '2', timestamp: 2000, event_type: 'tool_end', tool: 'Write', status: 'success' },
      { id: '1', timestamp: 1000, event_type: 'tool_start', tool: 'Write' },
    ];
    const invs = projectInvocations(events);
    assert.equal(invs.length, 2);
    assert.equal(invs[0].tool, 'Read');
    assert.equal(invs[1].tool, 'Write');
  });
});

describe('buildFileActivity', () => {
  it('groups operations by path', () => {
    const invs = [
      { id: '1', tool: 'Write', eventType: 'tool_end', startTime: 1000, status: 'success', input: { path: 'a.txt' }, output: { diff: '+x' } },
      { id: '2', tool: 'Read', eventType: 'tool_end', startTime: 1100, status: 'success', input: { path: 'a.txt' } },
    ];
    const activity = buildFileActivity(invs, resolvePath);
    assert.equal(activity.length, 1);
    assert.equal(activity[0].path, 'a.txt');
    assert.equal(activity[0].snippet, '+x');
  });

  it('resolves Kimi content read as snippet', () => {
    const invs = [
      { id: '1', tool: 'Read', eventType: 'tool_end', startTime: 1000, status: 'success', input: { path: 'b.txt' }, output: { content: 'kimi read output content' } },
    ];
    const activity = buildFileActivity(invs, resolvePath);
    assert.equal(activity.length, 1);
    assert.equal(activity[0].snippet, 'kimi read output content');
  });
});

describe('operationType', () => {
  it('classifies tools', () => {
    assert.equal(operationType('Read'), 'read');
    assert.equal(operationType('Write'), 'edit');
    assert.equal(operationType('EditFile'), 'edit');
    assert.equal(operationType('Bash'), 'other');
  });
});

describe('buildGraph3D', () => {
  it('builds skill-tool-file graph', () => {
    const session: ClientSession = {
      id: 's1',
      source: 'kimi',
      activeSkill: { name: 'engineer', confidence: 'explicit' },
      lifecycle: 'running',
      events: [],
      startTime: 0,
      lastActivity: 0,
      toolCounts: {},
    };
    const invs = [
      { id: '1', tool: 'Read', eventType: 'tool_end', startTime: 1000, status: 'success', input: { path: 'a.txt' }, output: {} },
    ];
    const graph = buildGraph3D(session, invs);
    assert.equal(graph.nodes.length, 3);
    assert.ok(graph.nodes.some((n) => n.id === 'skill:engineer'));
    assert.ok(graph.nodes.some((n) => n.id === 'tool:Read'));
    assert.ok(graph.nodes.some((n) => n.id === 'file:a.txt'));
    assert.equal(graph.links.length, 2);
  });

  it('builds graph with multiple distinct skill nodes', () => {
    const session: ClientSession = {
      id: 's2',
      source: 'kimi',
      activeSkill: { name: 'engineer', confidence: 'explicit' },
      lifecycle: 'running',
      events: [],
      startTime: 0,
      lastActivity: 0,
      toolCounts: {},
    };
    const invs = [
      { id: '1', tool: 'Read', eventType: 'tool_end', startTime: 1000, status: 'success', input: { path: 'a.txt' }, output: {}, skill: 'architect' },
      { id: '2', tool: 'Write', eventType: 'tool_end', startTime: 1100, status: 'success', input: { path: 'b.txt' }, output: {}, skill: 'engineer' },
    ];
    const graph = buildGraph3D(session, invs);
    assert.equal(graph.nodes.length, 6);
    assert.ok(graph.nodes.some((n) => n.id === 'skill:architect'));
    assert.ok(graph.nodes.some((n) => n.id === 'skill:engineer'));
    assert.ok(graph.links.some((l) => l.source === 'skill:architect' && l.target === 'tool:Read'));
    assert.ok(graph.links.some((l) => l.source === 'skill:engineer' && l.target === 'tool:Write'));
  });
});

describe('listWorkspaceFiles', () => {
  it('excludes git and node_modules and returns relative paths', async () => {
    const root = process.cwd();
    const files = await listWorkspaceFiles(root, {
      fileBytes: 1024 * 1024,
      workspaceEntries: 10000,
      workspaceDepth: 20,
    });
    assert.ok(files.length > 0);
    assert.ok(!files.some((f) => path.isAbsolute(f)));
    assert.ok(!files.some((f) => f.includes('node_modules')));
    assert.ok(!files.some((f) => f.includes('.git/')));
  });
});
