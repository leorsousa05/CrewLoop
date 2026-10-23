import fs from 'node:fs';
import path from 'node:path';

export type IssueLevel = 'error' | 'warning';

export interface Issue {
  level: IssueLevel;
  path: string;
  code: string;
  message: string;
}

export interface SpecsReport {
  files: number;
  issues: Issue[];
}

type FrontmatterValue = string | null | string[] | { block: true };
type Frontmatter = Record<string, FrontmatterValue>;

const DOMAIN_FOLDER = /^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SPEC_FILENAME = /^spec-(\d{2,3})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const SUB_SPEC_FOLDER = /^spec-\d{2,3}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MARKDOWN_LINK = /\[[^\]]*\]\(([^)]+)\)/g;
const INLINE_CODE = /(`+)(?:(?!\1).)+?\1/g;
const AC_ID = /\bAC-\d+\b/g;
const DATED_DECISION = /^- \d{4}-\d{2}-\d{2}:/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = new Set(['active', 'completed', 'superseded']);
const REQUIRED_SECTIONS = ['Objective', 'Acceptance Criteria', 'Done When'];

export const MAX_RECENT_DECISIONS = 10;
export const MAX_PROJECT_STATE_BYTES = 12_000;

class Collector {
  readonly issues: Issue[] = [];
  files = 0;

  constructor(private readonly root: string) {}

  add(level: IssueLevel, target: string, code: string, message: string): void {
    const relative = path.relative(this.root, target);
    const display = relative && !relative.startsWith('..') && !path.isAbsolute(relative) ? relative : target;
    this.issues.push({ level, path: display.split(path.sep).join('/'), code, message });
  }

  error(target: string, code: string, message: string): void {
    this.add('error', target, code, message);
  }

  warning(target: string, code: string, message: string): void {
    this.add('warning', target, code, message);
  }

  strict(active: boolean, target: string, code: string, message: string): void {
    this.add(active ? 'error' : 'warning', target, code, message);
  }
}

/** Lines outside fenced code blocks. */
function structuralLines(content: string): string[] {
  const output: string[] = [];
  let active: { char: string; length: number } | null = null;
  for (const line of content.split(/\r?\n/)) {
    const fence = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      const [, marker, suffix] = fence;
      if (active === null) {
        active = { char: marker[0], length: marker.length };
        continue;
      }
      if (marker[0] === active.char && marker.length >= active.length && !suffix.trim()) {
        active = null;
        continue;
      }
    }
    if (active === null) output.push(line);
  }
  return output;
}

/** Parse one frontmatter value; `undefined` means the value is outside the supported subset. */
function parseScalar(raw: string): FrontmatterValue | undefined {
  const trimmed = raw.trim();
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
    const quoted = /^(["'])(.*?)\1\s*(?:#.*)?$/.exec(trimmed);
    return quoted ? quoted[2] : undefined;
  }
  const value = trimmed.replace(/(^|\s+)#.*$/, '').trim();
  if (value === '' || value === '~' || value === 'null') return null;
  if (value.startsWith('[')) {
    if (!value.endsWith(']')) return undefined;
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  if (value.startsWith('{') || value.startsWith('|') || value.startsWith('>')) return undefined;
  return value;
}

function formatValue(value: FrontmatterValue): string {
  if (Array.isArray(value)) return `[${value.join(', ')}]`;
  if (value !== null && typeof value === 'object') return '<block>';
  return String(value);
}

/**
 * Minimal frontmatter parser for the spec subset (no YAML dependency): `key: value`
 * scalars, inline lists, and indented blocks under an empty-valued key.
 */
function parseFrontmatterBlock(lines: string[]): Frontmatter | null {
  const result: Frontmatter = {};
  let blockKey: string | null = null;
  for (const line of lines) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      if (blockKey === null) return null;
      result[blockKey] = { block: true };
      continue;
    }
    const pair = /^([A-Za-z0-9_-]+):(?:\s(.*)|)$/.exec(line);
    if (!pair) return null;
    const [, key, rawValue = ''] = pair;
    const value = parseScalar(rawValue);
    if (value === undefined) return null;
    result[key] = value;
    blockKey = value === null ? key : null;
  }
  return result;
}

function parseFrontmatter(content: string): Frontmatter | 'missing-frontmatter' | 'invalid-frontmatter' {
  const lines = content.split(/\r?\n/);
  let index = 0;
  while (index < lines.length && !lines[index].trim()) index++;
  if (index < lines.length && lines[index].startsWith('# ')) {
    index++;
    while (index < lines.length && !lines[index].trim()) index++;
  }
  if (index >= lines.length || lines[index].trim() !== '---') return 'missing-frontmatter';

  const end = lines.findIndex((line, i) => i > index && line.trim() === '---');
  if (end === -1) return 'invalid-frontmatter';
  return parseFrontmatterBlock(lines.slice(index + 1, end)) ?? 'invalid-frontmatter';
}

/** Map lowercase `## Heading` titles to their body, ignoring fenced code. */
function sections(content: string): Map<string, string> {
  const result = new Map<string, string[]>();
  let current: string | null = null;
  for (const line of structuralLines(content)) {
    const heading = /^(#{1,2})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      current = heading[1] === '##' ? heading[2].toLowerCase() : null;
      if (current !== null && !result.has(current)) result.set(current, []);
      continue;
    }
    if (current !== null) result.get(current)?.push(line);
  }
  return new Map([...result].map(([title, body]) => [title, body.join('\n')]));
}

function findSection(found: Map<string, string>, name: string): string | undefined {
  const wanted = name.toLowerCase();
  for (const [title, body] of found) {
    if (title === wanted || title.startsWith(`${wanted} `)) return body;
  }
  return undefined;
}

function brokenLinks(markdownFile: string, content: string): string[] {
  const broken: string[] = [];
  const prose = structuralLines(content).join('\n').replace(INLINE_CODE, '');
  for (const match of prose.matchAll(MARKDOWN_LINK)) {
    const raw = match[1].trim();
    const target = raw ? raw.split(/\s+/)[0].replace(/^<|>$/g, '') : '';
    if (!target || /^(https?:|mailto:|#)/.test(target)) continue;
    const relativeTarget = target.split('#', 1)[0];
    if (!relativeTarget) continue;
    let exists = false;
    try {
      exists = fs.existsSync(path.resolve(path.dirname(markdownFile), relativeTarget));
    } catch {
      exists = false;
    }
    if (!exists) broken.push(target);
  }
  return broken;
}

function readUtf8(file: string): string | null {
  try {
    // TextDecoder strips a leading UTF-8 BOM by default.
    return new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(file));
  } catch {
    return null;
  }
}

function idsIn(text: string): Set<string> {
  return new Set(text.match(AC_ID) ?? []);
}

/** Validate one feature spec; returns its number and whether it is active when the filename is valid. */
function validateFeatureSpec(file: string, report: Collector): { number: number; active: boolean } | null {
  report.files++;
  const filename = SPEC_FILENAME.exec(path.basename(file));
  if (!filename) {
    report.error(file, 'invalid-filename', 'Feature spec filename must match spec-NNN-kebab-name.md');
  }

  const content = readUtf8(file);
  if (content === null) {
    report.error(file, 'unreadable-file', 'File cannot be read as UTF-8');
    return null;
  }

  const frontmatter = parseFrontmatter(content);
  if (typeof frontmatter === 'string') {
    const message = frontmatter === 'missing-frontmatter' ? 'Frontmatter is missing' : 'Frontmatter is not a valid YAML mapping';
    report.error(file, frontmatter, message);
    return filename ? { number: Number(filename[1]), active: false } : null;
  }

  const stem = path.basename(file, '.md');
  const name = frontmatter.name;
  if (name === undefined || name === null) {
    report.error(file, 'missing-field', 'Frontmatter must define name');
  } else if (name !== stem) {
    report.error(file, 'name-mismatch', `Frontmatter name '${formatValue(name)}' does not match filename '${stem}'`);
  }

  const status = frontmatter.status;
  if (typeof status !== 'string' || !STATUSES.has(status)) {
    report.error(file, 'invalid-status', `Frontmatter status must be one of: ${[...STATUSES].sort().join(', ')}`);
  }
  const active = status === 'active';

  const domain = frontmatter.domain;
  const folder = path.basename(path.dirname(file));
  if (domain === undefined || domain === null) {
    report.warning(file, 'missing-field', 'Frontmatter should define domain');
  } else if (domain !== folder) {
    report.error(file, 'domain-mismatch', `Frontmatter domain '${formatValue(domain)}' does not match folder '${folder}'`);
  }

  if (!('created' in frontmatter)) {
    report.warning(file, 'missing-field', 'Frontmatter should define created');
  } else if (typeof frontmatter.created !== 'string' || !ISO_DATE.test(frontmatter.created)) {
    report.warning(file, 'invalid-date', 'Frontmatter created should be YYYY-MM-DD');
  }
  if (status === 'completed' && (typeof frontmatter.completed !== 'string' || !ISO_DATE.test(frontmatter.completed))) {
    report.warning(file, 'missing-field', 'Completed specs should record a completed date');
  }

  const found = sections(content);
  for (const section of REQUIRED_SECTIONS) {
    if (findSection(found, section) === undefined) {
      report.error(file, 'missing-section', `Missing required section: ## ${section}`);
    }
  }
  if (findSection(found, 'Edge Cases') === undefined) {
    report.strict(active, file, 'missing-section', 'Missing section: ## Edge Cases');
  }

  const criteria = findSection(found, 'Acceptance Criteria');
  const doneWhen = findSection(found, 'Done When');
  if (criteria !== undefined && doneWhen !== undefined) {
    const defined = idsIn(criteria);
    const referenced = idsIn(doneWhen);
    for (const ac of [...referenced].filter((id) => !defined.has(id)).sort()) {
      report.error(file, 'unknown-ac-reference', `Done When references undefined ${ac}`);
    }
    for (const ac of [...defined].filter((id) => !referenced.has(id)).sort()) {
      report.strict(active, file, 'unmapped-ac', `${ac} is not referenced in Done When`);
    }
    if (active && defined.size === 0) {
      report.error(file, 'missing-ac-ids', 'Active specs must define AC-NN acceptance criteria IDs');
    }
  }

  for (const target of brokenLinks(file, content)) {
    report.strict(active, file, 'broken-link', `Broken relative link: ${target}`);
  }

  return filename ? { number: Number(filename[1]), active } : null;
}

function sortedEntries(directory: string): fs.Dirent[] {
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

function validateFeatures(features: string, report: Collector): void {
  const numbers = new Map<number, Array<{ file: string; active: boolean }>>();
  for (const entry of sortedEntries(features)) {
    if (entry.name.startsWith('.')) continue;
    const domainPath = path.join(features, entry.name);
    if (entry.isFile()) {
      report.error(domainPath, 'loose-feature-file', 'Files must live inside a features/<NN-domain>/ folder');
      continue;
    }
    if (!entry.isDirectory()) continue;
    if (!DOMAIN_FOLDER.test(entry.name)) {
      report.error(domainPath, 'invalid-domain-folder', 'Domain folders must match NN-kebab-name');
      continue;
    }
    for (const item of sortedEntries(domainPath)) {
      if (item.name.startsWith('.')) continue;
      const itemPath = path.join(domainPath, item.name);
      if (item.isDirectory()) {
        if (!SUB_SPEC_FOLDER.test(item.name)) {
          report.warning(itemPath, 'non-spec-file', 'Only spec-NNN-name/ sub-spec folders are expected here');
        }
        continue;
      }
      if (!item.name.startsWith('spec-') || !item.name.endsWith('.md')) {
        report.warning(itemPath, 'non-spec-file', 'Non-spec file inside a domain folder; move it into a spec-NNN-name/ sub-spec folder');
        continue;
      }
      const result = validateFeatureSpec(itemPath, report);
      if (result) {
        const list = numbers.get(result.number) ?? [];
        list.push({ file: itemPath, active: result.active });
        numbers.set(result.number, list);
      }
    }
  }

  for (const [number, entries] of [...numbers].sort(([a], [b]) => a - b)) {
    if (entries.length < 2) continue;
    const anyActive = entries.some((entry) => entry.active);
    const others = entries.map((entry) => path.basename(entry.file)).join(', ');
    for (const entry of entries) {
      report.strict(anyActive, entry.file, 'duplicate-spec-number', `Spec number ${String(number).padStart(3, '0')} is shared by: ${others}`);
    }
  }
}

function validateProjectState(projectState: string, report: Collector): void {
  if (!fs.existsSync(projectState) || !fs.statSync(projectState).isFile()) return;
  const size = fs.statSync(projectState).size;
  const content = readUtf8(projectState);
  if (content === null) {
    report.error(projectState, 'unreadable-file', 'File cannot be read as UTF-8');
    return;
  }

  if (size > MAX_PROJECT_STATE_BYTES) {
    report.warning(projectState, 'project-state-oversized', `project-state.md is ${size} bytes; keep it under ${MAX_PROJECT_STATE_BYTES}`);
  }

  const decisions = findSection(sections(content), 'Recent decisions');
  if (decisions === undefined) return;
  const count = decisions.split('\n').filter((line) => DATED_DECISION.test(line)).length;
  if (count > MAX_RECENT_DECISIONS) {
    report.error(
      projectState,
      'project-state-decisions-over-limit',
      `Recent decisions has ${count} dated entries; keep at most ${MAX_RECENT_DECISIONS} and move older ones to decisions/decision-log.md`
    );
  }
}

/** Validate `<root>/specs`. The caller must check that the directory exists. */
export function validateSpecs(root: string): SpecsReport {
  const report = new Collector(root);
  const specs = path.join(root, 'specs');
  for (const entry of sortedEntries(specs)) {
    if (entry.isFile() && entry.name !== 'README.md' && !entry.name.startsWith('.')) {
      report.error(path.join(specs, entry.name), 'loose-spec-file', 'Never place files directly in specs/; use a subfolder');
    }
  }
  const features = path.join(specs, 'features');
  if (fs.existsSync(features) && fs.statSync(features).isDirectory()) {
    validateFeatures(features, report);
  }
  validateProjectState(path.join(specs, 'memory', 'project-state.md'), report);
  return { files: report.files, issues: report.issues };
}

function toPlatformPath(changed: string, platform: NodeJS.Platform): string {
  const slashed = changed.replace(/\\/g, '/');
  // Git Bash style `/c/Users/...` paths on Windows.
  return platform === 'win32' ? slashed.replace(/^\/([a-zA-Z])\//, '$1:/') : slashed;
}

/** Normalize a `--changed` path to the root-relative POSIX form used in issues. */
export function normalizeChangedPath(root: string, changed: string, platform: NodeJS.Platform = process.platform): string {
  // Use the path flavor of the requested platform, not the host's, so results match on every OS.
  const flavor = platform === 'win32' ? path.win32 : path.posix;
  const absolute = flavor.resolve(root, toPlatformPath(changed, platform));
  const relative = flavor.relative(root, absolute);
  return (relative && !relative.startsWith('..') ? relative : absolute).split(flavor.sep).join('/');
}

/**
 * Downgrade errors outside the changed set to warnings; no changed paths means strict mode.
 * Paths compare case-insensitively on Windows, and a changed path that does not exist is
 * reported as a warning so a typo cannot silently turn every error into a warning.
 */
export function scopeToChanged(
  root: string,
  report: SpecsReport,
  changed: string[] | undefined,
  platform: NodeJS.Platform = process.platform
): SpecsReport {
  if (!changed || changed.length === 0) return report;
  const fold = (value: string) => (platform === 'win32' ? value.toLowerCase() : value);
  const normalized = changed.map((item) => normalizeChangedPath(root, item, platform));
  const scope = new Set(normalized.map(fold));
  const missing: Issue[] = normalized
    .filter((item) => !fs.existsSync(path.resolve(root, item)))
    .map((item) => ({
      level: 'warning',
      path: item,
      code: 'changed-path-not-found',
      message: '--changed path does not exist; errors in it cannot be matched',
    }));
  return {
    files: report.files,
    issues: [
      ...report.issues.map((issue): Issue =>
        issue.level === 'error' && !scope.has(fold(issue.path)) ? { ...issue, level: 'warning' } : issue
      ),
      ...missing,
    ],
  };
}
