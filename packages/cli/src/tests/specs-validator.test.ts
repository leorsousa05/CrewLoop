import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { CommandContext } from '../args';
import { runValidateSpecs } from '../commands/validate-specs';
import { normalizeChangedPath, scopeToChanged, validateSpecs } from '../specs-validator';

interface SpecOptions {
  name?: string;
  domain?: string | null;
  status?: string;
  titleFirst?: boolean;
  edgeCases?: boolean;
  criteria?: string;
  doneWhen?: string;
  extra?: string;
}

function specContent(options: SpecOptions = {}): string {
  const {
    name = 'spec-001-example',
    domain = '04-workflow',
    status = 'active',
    titleFirst = false,
    edgeCases = true,
    criteria = '- AC-01: Given a, when b, then c.',
    doneWhen = '- [ ] AC-01 — proven by `npm test`',
    extra = '',
  } = options;
  const fields = [`name: ${name}`];
  if (domain !== null) fields.push(`domain: ${domain}`);
  fields.push(`status: ${status}`, 'created: 2026-10-23');
  fields.push(status === 'completed' ? 'completed: 2026-10-23' : 'completed: null');
  const frontmatter = `---\n${fields.join('\n')}\n---\n`;
  const header = titleFirst ? `# ${name}\n\n${frontmatter}` : frontmatter;
  const edge = edgeCases ? '## Edge Cases\n\n| Scenario | Handling |\n|---|---|\n| empty | rejected |\n\n' : '';
  return `${header}\n# Example\n\n## Objective\n\nDo the thing.\n\n${edge}## Acceptance Criteria\n\n${criteria}\n\n## Done When\n\n${doneWhen}\n${extra}`;
}

const roots: string[] = [];

function makeRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-specs-test-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'specs', 'features', '04-workflow'), { recursive: true });
  fs.writeFileSync(path.join(root, 'specs', 'README.md'), '# Specs\n');
  return root;
}

function write(root: string, relative: string, content: string | Buffer): string {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

function writeSpec(root: string, filename = 'spec-001-example.md', folder = '04-workflow', options: SpecOptions = {}): string {
  const name = options.name ?? path.basename(filename, '.md');
  const domain = options.domain === undefined ? folder : options.domain;
  return write(root, `specs/features/${folder}/${filename}`, specContent({ ...options, name, domain }));
}

function issues(root: string): Set<string> {
  return new Set(validateSpecs(root).issues.map((issue) => `${issue.level}:${issue.code}`));
}

function capture(): { context: CommandContext; out: string[]; err: string[] } {
  const out: string[] = [];
  const err: string[] = [];
  return { context: { packageRoot: '', stdout: (line) => out.push(line), stderr: (line) => err.push(line) }, out, err };
}

afterEach(() => {
  while (roots.length) fs.rmSync(roots.pop() as string, { recursive: true, force: true });
});

describe('specs validator', () => {
  it('accepts a valid tree with both frontmatter positions and reports ok JSON', () => {
    const root = makeRoot();
    writeSpec(root);
    writeSpec(root, 'spec-002-title-first.md', '04-workflow', { titleFirst: true });
    const { context, out } = capture();
    assert.strictEqual(runValidateSpecs({ command: 'validate-specs', root, json: true }, context), 0);
    assert.deepStrictEqual(JSON.parse(out.join('\n')), { ok: true, files: 2, issues: [] });
  });

  it('passes an empty features folder', () => {
    const root = makeRoot();
    assert.deepStrictEqual(validateSpecs(root), { files: 0, issues: [] });
  });

  it('prints text issues and a FAIL summary', () => {
    const root = makeRoot();
    writeSpec(root, 'spec-001-example.md', '04-workflow', { status: 'unknown' });
    const { context, out } = capture();
    assert.strictEqual(runValidateSpecs({ command: 'validate-specs', root }, context), 1);
    assert.ok(out.includes('ERROR   specs/features/04-workflow/spec-001-example.md: invalid-status: Frontmatter status must be one of: active, completed, superseded'));
    assert.strictEqual(out[out.length - 1], 'FAIL 1 feature specs, 1 errors, 0 warnings');
  });

  it('applies placement rules', () => {
    const root = makeRoot();
    write(root, 'specs/stray.md', '# stray\n');
    write(root, 'specs/features/loose.md', '# loose\n');
    write(root, 'specs/features/Workflow/spec-001-x.md', '# x\n');
    write(root, 'specs/features/04-workflow/design-ui.md', '# design\n');
    write(root, 'specs/features/04-workflow/.gitkeep', '');
    write(root, 'specs/features/04-workflow/spec-005-big/design.md', 'no frontmatter\n');
    assert.deepStrictEqual(issues(root), new Set([
      'error:loose-spec-file',
      'error:loose-feature-file',
      'error:invalid-domain-folder',
      'warning:non-spec-file',
    ]));
  });

  it('rejects an invalid filename', () => {
    const root = makeRoot();
    writeSpec(root, 'spec-1-Bad_Name.md');
    assert.ok(issues(root).has('error:invalid-filename'));
  });

  it('reports missing and invalid frontmatter', () => {
    const root = makeRoot();
    write(root, 'specs/features/04-workflow/spec-001-none.md', '# Title\n\n## Objective\n');
    write(root, 'specs/features/04-workflow/spec-002-open.md', '---\nname: spec-002-open\n');
    write(root, 'specs/features/04-workflow/spec-003-list.md', '---\n- a\n- b\n---\n');
    write(root, 'specs/features/04-workflow/spec-004-yaml.md', '---\nname: [unclosed\n---\n');
    write(root, 'specs/features/04-workflow/spec-005-text.md', '---\njust text\n---\n');
    const codes = new Map(validateSpecs(root).issues.map((issue) => [path.posix.basename(issue.path), issue.code]));
    assert.strictEqual(codes.get('spec-001-none.md'), 'missing-frontmatter');
    for (const file of ['spec-002-open.md', 'spec-003-list.md', 'spec-004-yaml.md', 'spec-005-text.md']) {
      assert.strictEqual(codes.get(file), 'invalid-frontmatter', file);
    }
  });

  it('accepts nested blocks and inline lists in frontmatter', () => {
    const root = makeRoot();
    const file = writeSpec(root);
    const content = fs.readFileSync(file, 'utf8').replace(
      'completed: null\n',
      'completed: null\nsupersedes: [spec-000-old]\nsubagents:\n  approved: true\n# comment\n'
    );
    fs.writeFileSync(file, content);
    assert.deepStrictEqual(issues(root), new Set());
  });

  it('accepts quoted values that start with brackets and strips trailing comments', () => {
    const root = makeRoot();
    const file = writeSpec(root);
    const content = fs.readFileSync(file, 'utf8').replace(
      'completed: null\n',
      'completed: null\ntitle: "[draft] new parser"\nsummary: \'{x}\'\nowner: "team" # trailing comment\n'
    ).replace('status: active', 'status: active # wip');
    fs.writeFileSync(file, content);
    assert.deepStrictEqual(issues(root), new Set());
  });

  it('rejects unclosed quotes, block scalars, and inline maps as invalid frontmatter', () => {
    for (const line of ['title: "unclosed', "title: 'unclosed", 'description: >', 'description: |', 'meta: {a: 1}']) {
      const root = makeRoot();
      const file = writeSpec(root);
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('completed: null\n', `completed: null\n${line}\n`));
      assert.deepStrictEqual(issues(root), new Set(['error:invalid-frontmatter']), line);
    }
  });

  it('formats non-scalar names and domains readably', () => {
    const root = makeRoot();
    const file = writeSpec(root);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('name: spec-001-example', 'name: [a, b]').replace('domain: 04-workflow', 'domain:\n  - x'));
    const messages = validateSpecs(root).issues.map((issue) => issue.message);
    assert.ok(messages.includes("Frontmatter name '[a, b]' does not match filename 'spec-001-example'"));
    assert.ok(messages.includes("Frontmatter domain '<block>' does not match folder '04-workflow'"));
  });

  it('treats non-Markdown spec-* files as non-spec files', () => {
    const root = makeRoot();
    write(root, 'specs/features/04-workflow/spec-001-notes.txt', 'notes\n');
    assert.deepStrictEqual(issues(root), new Set(['warning:non-spec-file']));
    assert.strictEqual(validateSpecs(root).files, 0);
  });

  it('checks name, status, and domain fields', () => {
    const root = makeRoot();
    writeSpec(root, 'spec-001-a.md', '04-workflow', { name: 'spec-001-other' });
    writeSpec(root, 'spec-002-b.md', '04-workflow', { status: 'draft' });
    writeSpec(root, 'spec-003-c.md', '04-workflow', { domain: '01-cli' });
    writeSpec(root, 'spec-004-d.md', '04-workflow', { domain: null });
    assert.deepStrictEqual(issues(root), new Set([
      'error:name-mismatch',
      'error:invalid-status',
      'error:domain-mismatch',
      'warning:missing-field',
    ]));
  });

  it('reports a missing name as an error', () => {
    const root = makeRoot();
    const file = writeSpec(root);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('name: spec-001-example\n', ''));
    assert.deepStrictEqual(issues(root), new Set(['error:missing-field']));
  });

  it('reports non-scalar status as invalid-status', () => {
    for (const replacement of ['status: [active]', 'status:\n  - active']) {
      const root = makeRoot();
      const file = writeSpec(root);
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('status: active', replacement));
      assert.ok(issues(root).has('error:invalid-status'), replacement);
    }
  });

  it('requires core sections and ignores headings in fenced code', () => {
    const root = makeRoot();
    const file = writeSpec(root);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('## Objective', '## Goal'));
    assert.ok(issues(root).has('error:missing-section'));

    const fenced = makeRoot();
    writeSpec(fenced, 'spec-001-example.md', '04-workflow', { edgeCases: false, extra: '\n```markdown\n## Edge Cases\n```\n' });
    assert.ok(issues(fenced).has('error:missing-section'));
  });

  it('splits Edge Cases strictness between active and completed specs', () => {
    const active = makeRoot();
    writeSpec(active, 'spec-001-example.md', '04-workflow', { edgeCases: false });
    assert.deepStrictEqual(issues(active), new Set(['error:missing-section']));

    const completed = makeRoot();
    writeSpec(completed, 'spec-001-example.md', '04-workflow', { edgeCases: false, status: 'completed' });
    assert.deepStrictEqual(issues(completed), new Set(['warning:missing-section']));
  });

  it('maps acceptance criteria to Done When', () => {
    let root = makeRoot();
    writeSpec(root, undefined, undefined, { doneWhen: '- [ ] AC-01 — proven\n- [ ] AC-09 — proven' });
    assert.deepStrictEqual(issues(root), new Set(['error:unknown-ac-reference']));

    root = makeRoot();
    writeSpec(root, undefined, undefined, { criteria: '- AC-01: x\n- AC-02: y' });
    assert.deepStrictEqual(issues(root), new Set(['error:unmapped-ac']));

    root = makeRoot();
    writeSpec(root, undefined, undefined, { criteria: '- AC-01: x\n- AC-02: y', status: 'completed' });
    assert.deepStrictEqual(issues(root), new Set(['warning:unmapped-ac']));

    root = makeRoot();
    writeSpec(root, undefined, undefined, { criteria: '- Given x, then y.', doneWhen: '- [ ] proven by tests' });
    assert.deepStrictEqual(issues(root), new Set(['error:missing-ac-ids']));
  });

  it('checks relative links with active/completed strictness', () => {
    let root = makeRoot();
    write(root, 'specs/shared/glossary.md', '# Glossary\n');
    const links =
      '\n[ok](../../shared/glossary.md#terms) [web](https://example.com) [anchor](#objective)\n' +
      '```\n[ignored](missing-in-code.md)\n```\n' +
      'Use `[x](missing.md)` as syntax.\n';
    writeSpec(root, undefined, undefined, { extra: links });
    assert.deepStrictEqual(issues(root), new Set());

    writeSpec(root, 'spec-002-broken.md', undefined, { extra: '\n[gone](../../shared/missing.md)\n' });
    assert.deepStrictEqual(issues(root), new Set(['error:broken-link']));

    root = makeRoot();
    writeSpec(root, undefined, undefined, { extra: '\n`code` then [real](missing.md) then `more`\n' });
    assert.deepStrictEqual(issues(root), new Set(['error:broken-link']));

    root = makeRoot();
    writeSpec(root, undefined, undefined, { status: 'completed', extra: '\n[gone](missing.md)\n' });
    assert.deepStrictEqual(issues(root), new Set(['warning:broken-link']));

    root = makeRoot();
    writeSpec(root, undefined, undefined, { extra: '\n[bad](bad\u0000name.md)\n' });
    assert.deepStrictEqual(issues(root), new Set(['error:broken-link']));
  });

  it('reports duplicate spec numbers with active escalation', () => {
    let root = makeRoot();
    writeSpec(root, 'spec-021-a.md', '04-workflow', { status: 'completed' });
    writeSpec(root, 'spec-021-b.md', '02-dashboard', { status: 'completed' });
    assert.deepStrictEqual(issues(root), new Set(['warning:duplicate-spec-number']));

    root = makeRoot();
    writeSpec(root, 'spec-021-a.md', '04-workflow', { status: 'completed' });
    writeSpec(root, 'spec-021-b.md', '02-dashboard');
    assert.deepStrictEqual(issues(root), new Set(['error:duplicate-spec-number']));
  });

  it('accepts a UTF-8 BOM and reports unreadable files without stopping', () => {
    const root = makeRoot();
    const file = writeSpec(root, 'spec-001-bom.md');
    fs.writeFileSync(file, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), fs.readFileSync(file)]));
    write(root, 'specs/features/04-workflow/spec-002-binary.md', Buffer.from([0xff, 0xfe, 0xfa]));
    const report = validateSpecs(root);
    assert.deepStrictEqual(report.issues.map((issue) => [issue.code, path.posix.basename(issue.path)]), [
      ['unreadable-file', 'spec-002-binary.md'],
    ]);
    assert.strictEqual(report.files, 2);
  });

  it('exits 2 when specs/ is missing', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-specs-test-'));
    roots.push(root);
    const { context, err } = capture();
    assert.strictEqual(runValidateSpecs({ command: 'validate-specs', root }, context), 2);
    assert.ok(err[0].startsWith('error: specs directory not found'));
  });
});

describe('specs validator change scoping', () => {
  function legacyTree(): string {
    const root = makeRoot();
    writeSpec(root, 'spec-001-legacy.md', '04-workflow', { status: 'unknown' });
    writeSpec(root, 'spec-002-clean.md');
    return root;
  }

  it('downgrades errors outside --changed to warnings', () => {
    const root = legacyTree();
    const { context, out } = capture();
    const code = runValidateSpecs(
      { command: 'validate-specs', root, json: true, changed: ['specs/features/04-workflow/spec-002-clean.md'] },
      context
    );
    const report = JSON.parse(out.join('\n'));
    assert.strictEqual(code, 0);
    assert.strictEqual(report.ok, true);
    assert.deepStrictEqual(report.issues.map((issue: { level: string; code: string }) => `${issue.level}:${issue.code}`), [
      'warning:invalid-status',
    ]);
  });

  it('fails when a changed file has an error, including absolute and backslash paths', () => {
    const root = legacyTree();
    for (const changed of [
      'specs/features/04-workflow/spec-001-legacy.md',
      'specs\\features\\04-workflow\\spec-001-legacy.md',
      path.join(root, 'specs', 'features', '04-workflow', 'spec-001-legacy.md'),
    ]) {
      const { context } = capture();
      assert.strictEqual(runValidateSpecs({ command: 'validate-specs', root, changed: [changed] }, context), 1, changed);
    }
  });

  it('keeps strict mode without --changed and ignores unmatched changed paths', () => {
    const root = legacyTree();
    assert.strictEqual(runValidateSpecs({ command: 'validate-specs', root }, capture().context), 1);
    const scoped = scopeToChanged(root, validateSpecs(root), ['../outside.md', 'does/not/exist.md']);
    assert.ok(scoped.issues.every((issue) => issue.level === 'warning'));
    assert.strictEqual(normalizeChangedPath(root, 'specs\\a.md'), 'specs/a.md');
  });

  it('warns about --changed paths that do not exist', () => {
    const root = legacyTree();
    const scoped = scopeToChanged(root, validateSpecs(root), ['specs/features/04-workflow/spec-404-typo.md']);
    assert.ok(scoped.issues.some((issue) =>
      issue.level === 'warning' && issue.code === 'changed-path-not-found' && issue.path === 'specs/features/04-workflow/spec-404-typo.md'
    ));
    assert.ok(scoped.issues.every((issue) => issue.level === 'warning'));
  });

  it('matches --changed case-insensitively and accepts Git Bash drive paths on Windows', () => {
    const root = legacyTree();
    const upper = scopeToChanged(root, validateSpecs(root), ['Specs/Features/04-Workflow/spec-001-legacy.md'], 'win32');
    assert.ok(upper.issues.some((issue) => issue.level === 'error' && issue.code === 'invalid-status'));
    assert.strictEqual(normalizeChangedPath('C:\\repo', '/c/repo/specs/a.md', 'win32'), 'specs/a.md');
    const posix = scopeToChanged(root, validateSpecs(root), ['Specs/Features/04-Workflow/spec-001-legacy.md'], 'linux');
    assert.ok(posix.issues.every((issue) => issue.level === 'warning'));
  });

  it('keeps a duplicate-number error on the changed active spec only', () => {
    const root = makeRoot();
    writeSpec(root, 'spec-021-legacy.md', '04-workflow', { status: 'completed' });
    writeSpec(root, 'spec-021-new.md', '02-dashboard');
    const scoped = scopeToChanged(root, validateSpecs(root), ['specs/features/02-dashboard/spec-021-new.md']);
    assert.deepStrictEqual(new Set(scoped.issues.map((issue) => `${issue.level}:${path.posix.basename(issue.path)}`)), new Set([
      'warning:spec-021-legacy.md',
      'error:spec-021-new.md',
    ]));
  });
});

describe('project-state limits', () => {
  function stateRoot(decisions: number | null, padding = 0): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-specs-test-'));
    roots.push(root);
    fs.mkdirSync(path.join(root, 'specs', 'memory'), { recursive: true });
    if (decisions !== null) {
      const entries = Array.from({ length: decisions }, (_, i) => `- 2026-09-${String(i + 1).padStart(2, '0')}: Decision ${i + 1}.`);
      const content =
        `# Project State\n\n## Recent decisions\n\n${entries.join('\n')}\n` +
        `- See \`decisions/decision-log.md\` for older decisions.\n\n## Blockers\n\n- None.${' '.repeat(padding)}\n`;
      fs.writeFileSync(path.join(root, 'specs', 'memory', 'project-state.md'), content);
    }
    return root;
  }

  it('accepts exactly ten dated decisions', () => {
    assert.deepStrictEqual(issues(stateRoot(10)), new Set());
  });

  it('fails on eleven dated decisions', () => {
    assert.deepStrictEqual(issues(stateRoot(11)), new Set(['error:project-state-decisions-over-limit']));
  });

  it('warns only when the file is oversized', () => {
    assert.deepStrictEqual(issues(stateRoot(3, 12_500)), new Set(['warning:project-state-oversized']));
  });

  it('skips a missing file or a missing Recent decisions section', () => {
    assert.deepStrictEqual(issues(stateRoot(null)), new Set());
    const root = stateRoot(null);
    fs.writeFileSync(path.join(root, 'specs', 'memory', 'project-state.md'), '# Project State\n\n## Blockers\n');
    assert.deepStrictEqual(issues(root), new Set());
  });

  it('parses a project-state file with a UTF-8 BOM', () => {
    const root = stateRoot(11);
    const file = path.join(root, 'specs', 'memory', 'project-state.md');
    fs.writeFileSync(file, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), fs.readFileSync(file)]));
    assert.deepStrictEqual(issues(root), new Set(['error:project-state-decisions-over-limit']));
  });
});
