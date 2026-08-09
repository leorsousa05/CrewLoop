import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { formatDuration, formatTime, truncate, escapeHtml, prettyJson } from '../lib/format';
import { listWorkspaceFiles } from '../lib/workspace-access';
import { resolvePath, resolvePaths } from '../lib/paths';
import {
  projectInvocations,
  buildFileActivity,
  operationType,
  resolveFileSnippet,
} from '../lib/invocations';
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

  it('resolves every unique path in stable canonical order', () => {
    assert.deepEqual(
      resolvePaths(
        {
          path: 'direct.ts',
          args: { file_path: 'nested.ts' },
          operations: [
            { path: 'operation.ts' },
            { file_path: 'direct.ts' },
            { filePath: '' },
          ],
        },
        {
          filePath: 'output.ts',
          operations: [{ path: 'nested.ts' }, { file_path: 'last.ts' }],
        }
      ),
      ['direct.ts', 'nested.ts', 'operation.ts', 'output.ts', 'last.ts']
    );
    assert.equal(resolvePath({ operations: [{ path: 'first.ts' }, { path: 'second.ts' }] }), 'first.ts');
  });

  it('ignores malformed path containers', () => {
    assert.deepEqual(
      resolvePaths(
        { path: '', args: 'invalid', operations: [null, 'bad', { path: 42 }] },
        []
      ),
      []
    );
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
    const activity = buildFileActivity(invs, resolvePaths);
    assert.equal(activity.length, 1);
    assert.equal(activity[0].path, 'a.txt');
    assert.equal(activity[0].snippet, '+x');
  });

  it('resolves Kimi content read as snippet', () => {
    const invs = [
      { id: '1', tool: 'Read', eventType: 'tool_end', startTime: 1000, status: 'success', input: { path: 'b.txt' }, output: { content: 'kimi read output content' } },
    ];
    const activity = buildFileActivity(invs, resolvePaths);
    assert.equal(activity.length, 1);
    assert.equal(activity[0].snippet, 'kimi read output content');
  });

  it('projects one invocation onto every unique file path', () => {
    const invs = [
      {
        id: 'multi',
        tool: 'apply_patch',
        eventType: 'tool_end',
        startTime: 1200,
        status: 'success',
        input: {
          operations: [
            { path: 'a.ts' },
            { path: 'b.ts' },
            { path: 'a.ts' },
          ],
        },
      },
    ];

    const activity = buildFileActivity(invs, resolvePaths);
    assert.deepEqual(activity.map((entry) => entry.path), ['a.ts', 'b.ts']);
    assert.ok(activity.every((entry) => entry.ops[0].id === 'multi'));
    assert.ok(activity.every((entry) => entry.ops[0].type === 'edit'));
  });

  it('projects only the matching operation diff onto each file', () => {
    const invs = [
      {
        id: 'multi-diff',
        tool: 'apply_patch',
        eventType: 'tool_start',
        startTime: 1300,
        status: 'running',
        input: {
          operations: [
            { path: 'a.ts', diff: '*** Update File: a.ts\n+only a' },
            { path: 'b.ts', diff: '*** Update File: b.ts\n+only b' },
          ],
        },
      },
    ];

    const activity = buildFileActivity(invs, resolvePaths);
    assert.equal(activity[0].snippet, '*** Update File: a.ts\n+only a');
    assert.equal(activity[1].snippet, '*** Update File: b.ts\n+only b');
    assert.equal(activity[0].snippet?.includes('only b'), false);
    assert.equal(activity[1].snippet?.includes('only a'), false);
  });
});

describe('resolveFileSnippet', () => {
  it('uses matching input then output operations before output fallbacks', () => {
    const input = {
      operations: [
        { path: 'a.ts', diff: 'input a' },
        { file_path: 'b.ts', diff: 'input b' },
      ],
    };
    const output = {
      operations: [
        { filePath: 'a.ts', diff: 'output a' },
        { path: 'c.ts', diff: 'output c' },
      ],
      diff: 'output fallback',
      contentSnippet: 'snippet fallback',
    };

    assert.equal(resolveFileSnippet('a.ts', input, output), 'input a');
    assert.equal(resolveFileSnippet('b.ts', input, output), 'input b');
    assert.equal(resolveFileSnippet('c.ts', input, output), 'output c');
    assert.equal(resolveFileSnippet('d.ts', input, output), 'output fallback');
  });

  it('uses contentSnippet last when no operation matches', () => {
    assert.equal(
      resolveFileSnippet(
        'a.ts',
        { operations: 'invalid' },
        { operations: [null, { path: 'other.ts', diff: 42 }], contentSnippet: 'fallback' }
      ),
      'fallback'
    );
    assert.equal(resolveFileSnippet('a.ts', null, { contentSnippet: 42 }), undefined);
  });

  it('treats a matching path without diff as explicit suppression', () => {
    const input = {
      operations: [
        { path: '.env' },
        { path: 'src/aggregate-limited.ts' },
        { path: 'src/malformed.ts', diff: 42 },
      ],
    };
    const output = {
      diff: '+DB_PASSWORD=raw-value',
      contentSnippet: 'raw fallback',
    };

    assert.equal(resolveFileSnippet('.env', input, output), undefined);
    assert.equal(
      resolveFileSnippet('src/aggregate-limited.ts', input, output),
      undefined
    );
    assert.equal(resolveFileSnippet('src/malformed.ts', input, output), undefined);
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
      activeSkill: { name: 'crewloop:code', confidence: 'explicit' },
      lifecycle: 'running',
      events: [],
      startTime: 0,
      lastActivity: 0,
      toolCounts: {},
      securityDecisions: [],
    };
    const invs = [
      { id: '1', tool: 'Read', eventType: 'tool_end', startTime: 1000, status: 'success', input: { path: 'a.txt' }, output: {} },
    ];
    const graph = buildGraph3D(session, invs);
    assert.equal(graph.nodes.length, 3);
    assert.ok(graph.nodes.some((n) => n.id === 'skill:crewloop:code'));
    assert.ok(graph.nodes.some((n) => n.id === 'tool:Read'));
    assert.ok(graph.nodes.some((n) => n.id === 'file:a.txt'));
    assert.equal(graph.links.length, 2);
  });

  it('builds graph with multiple distinct skill nodes', () => {
    const session: ClientSession = {
      id: 's2',
      source: 'kimi',
      activeSkill: { name: 'crewloop:code', confidence: 'explicit' },
      lifecycle: 'running',
      events: [],
      startTime: 0,
      lastActivity: 0,
      toolCounts: {},
      securityDecisions: [],
    };
    const invs = [
      { id: '1', tool: 'Read', eventType: 'tool_end', startTime: 1000, status: 'success', input: { path: 'a.txt' }, output: {}, skill: 'crewloop:plan' },
      { id: '2', tool: 'Write', eventType: 'tool_end', startTime: 1100, status: 'success', input: { path: 'b.txt' }, output: {}, skill: 'crewloop:code' },
    ];
    const graph = buildGraph3D(session, invs);
    assert.equal(graph.nodes.length, 6);
    assert.ok(graph.nodes.some((n) => n.id === 'skill:crewloop:plan'));
    assert.ok(graph.nodes.some((n) => n.id === 'skill:crewloop:code'));
    assert.ok(graph.links.some((l) => l.source === 'skill:crewloop:plan' && l.target === 'tool:Read'));
    assert.ok(graph.links.some((l) => l.source === 'skill:crewloop:code' && l.target === 'tool:Write'));
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
