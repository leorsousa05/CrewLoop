import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_MATRIX_FILE = path.resolve(process.cwd(), 'tests/dashboard-acceptance-matrix.md');
const EXPECTED_VIEWS = [
  'Overview',
  'Sessions',
  'Timeline',
  'Files',
  'Skills',
  'Usage',
  'Settings',
];
const EXPECTED_VIEW_COLUMNS = 16;
const EXPECTED_INTERACTIONS = 12;
const REQUIRED_RUN_FIELDS = [
  'Date/time',
  'Commit',
  'OS',
  'Browser',
  'Server URL',
  'Actual desktop viewport',
  'Actual mobile viewport',
  'Assistive technology',
];

function tableCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;
  return trimmed.slice(1, -1).split('|').map((cell) => cell.trim());
}

function isSeparatorRow(cells) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function nextHeadingIndex(lines, start) {
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index].trim())) return index;
  }
  return lines.length;
}

function sectionLines(lines, heading) {
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return null;
  return lines.slice(start + 1, nextHeadingIndex(lines, start));
}

function isPendingRunValue(value) {
  return value.length === 0 || /\b(?:fill|pending|todo|tbd)\b/i.test(value);
}

function analyzeRunRecord(lines) {
  const section = sectionLines(lines, '## Run record');
  const values = new Map();
  if (section) {
    for (const line of section) {
      const cells = tableCells(line);
      if (!cells || cells.length !== 2 || cells[0] === 'Field' || isSeparatorRow(cells)) continue;
      values.set(cells[0], cells[1].replaceAll('`', '').trim());
    }
  }
  const pendingFields = REQUIRED_RUN_FIELDS.filter((field) => isPendingRunValue(values.get(field) ?? ''));
  return {
    total: REQUIRED_RUN_FIELDS.length,
    recorded: REQUIRED_RUN_FIELDS.length - pendingFields.length,
    pendingFields,
    invalid: section === null ? ['Run record section'] : [],
  };
}

function isRecordedViewCell(value) {
  return /^\[(?:x|X)\]$/.test(value) || /^P$/i.test(value);
}

function isPendingViewCell(value) {
  return /^\[\s*\]$/.test(value) || /^\[record\]$/i.test(value) || value.length === 0;
}

function analyzeViews(lines) {
  const section = sectionLines(lines, '## View matrix');
  const result = {
    total: EXPECTED_VIEWS.length * EXPECTED_VIEW_COLUMNS,
    recorded: 0,
    pending: 0,
    invalid: 0,
    invalidRows: [],
  };
  if (!section) {
    result.invalid += result.total;
    result.invalidRows.push('View matrix section');
    return result;
  }

  const rows = section.map(tableCells).filter((cells) => cells && !isSeparatorRow(cells));
  const header = rows.find((cells) => cells[0] === 'View');
  if (!header || header.length - 1 !== EXPECTED_VIEW_COLUMNS) {
    result.invalid += 1;
    result.invalidRows.push('View matrix header');
  }

  for (const view of EXPECTED_VIEWS) {
    const row = rows.find((cells) => cells[0] === view);
    if (!row || row.length - 1 !== EXPECTED_VIEW_COLUMNS) {
      result.invalid += 1;
      result.invalidRows.push(view);
      continue;
    }
    for (const cell of row.slice(1)) {
      if (isRecordedViewCell(cell)) result.recorded += 1;
      else if (isPendingViewCell(cell)) result.pending += 1;
      else result.invalid += 1;
    }
  }
  return result;
}

function isPendingInteractionResult(value) {
  const normalized = value.replace(/^`(.*)`$/, '$1').trim();
  return normalized.length === 0 || /^\[record\]$/i.test(normalized) || /^\[\s*\]$/.test(normalized)
    || /^(?:pending|not recorded)$/i.test(normalized);
}

function analyzeInteractions(lines) {
  const section = sectionLines(lines, '## Interaction matrix');
  const result = {
    total: EXPECTED_INTERACTIONS,
    recorded: 0,
    pending: 0,
    invalid: 0,
    pendingAreas: [],
  };
  if (!section) {
    result.invalid = EXPECTED_INTERACTIONS;
    return result;
  }

  const rows = section.map(tableCells).filter((cells) => cells && cells.length > 0 && !isSeparatorRow(cells));
  const interactionRows = rows.filter((cells) => cells[0] !== 'Area');
  if (interactionRows.length !== EXPECTED_INTERACTIONS) {
    result.invalid += 1;
  }
  for (const row of interactionRows.slice(0, EXPECTED_INTERACTIONS)) {
    if (row.length !== 4) {
      result.invalid += 1;
      continue;
    }
    const resultValue = row[3].trim();
    if (isPendingInteractionResult(resultValue)) {
      result.pending += 1;
      result.pendingAreas.push(row[0].slice(0, 80));
    } else {
      result.recorded += 1;
    }
  }
  return result;
}

export function analyzeAcceptanceMatrix(content) {
  const lines = content.split(/\r?\n/);
  const runRecord = analyzeRunRecord(lines);
  const views = analyzeViews(lines);
  const interactions = analyzeInteractions(lines);
  const invalid = runRecord.invalid.length + views.invalid + interactions.invalid;
  const complete = invalid === 0
    && runRecord.pendingFields.length === 0
    && views.pending === 0
    && interactions.pending === 0
    && views.recorded === views.total
    && interactions.recorded === interactions.total;
  return {
    status: complete ? 'complete' : invalid > 0 ? 'invalid' : 'incomplete',
    complete,
    runRecord,
    views,
    interactions,
  };
}

function parseArgs(argv) {
  let file = DEFAULT_MATRIX_FILE;
  let format = 'text';
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--file') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('usage: --file <path> [--format text|json]');
      file = path.resolve(value);
      index += 1;
    } else if (argument === '--format') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('usage: --file <path> [--format text|json]');
      format = value;
      index += 1;
    } else {
      throw new Error('usage: --file <path> [--format text|json]');
    }
  }
  if (format !== 'text' && format !== 'json') throw new Error('--format must be text or json');
  return { file, format };
}

function formatText(report) {
  const lines = [
    `Dashboard acceptance matrix: ${report.status.toUpperCase()}`,
    `Run record: ${report.runRecord.recorded}/${report.runRecord.total} recorded`,
    `View cells: ${report.views.recorded}/${report.views.total} recorded; ${report.views.pending} pending; ${report.views.invalid} invalid`,
    `Interaction rows: ${report.interactions.recorded}/${report.interactions.total} recorded; ${report.interactions.pending} pending; ${report.interactions.invalid} invalid`,
  ];
  if (report.runRecord.pendingFields.length > 0) {
    lines.push(`Pending run-record fields: ${report.runRecord.pendingFields.join(', ')}`);
  }
  if (report.views.invalidRows.length > 0) {
    lines.push(`Invalid view rows: ${report.views.invalidRows.join(', ')}`);
  }
  if (report.interactions.pendingAreas.length > 0) {
    lines.push(`Pending interaction areas: ${report.interactions.pendingAreas.join(', ')}`);
  }
  return `${lines.join('\n')}\n`;
}

export function runAcceptanceMatrixCheck(
  argv = process.argv.slice(2),
  io = {
    stdout: (value) => process.stdout.write(value),
    stderr: (value) => process.stderr.write(value),
  }
) {
  try {
    const options = parseArgs(argv);
    let content;
    try {
      content = fs.readFileSync(options.file, 'utf8');
    } catch {
      io.stderr('acceptance matrix: unable to read input\n');
      return 2;
    }
    const report = analyzeAcceptanceMatrix(content);
    io.stdout(options.format === 'json' ? `${JSON.stringify(report, null, 2)}\n` : formatText(report));
    return report.status === 'complete' ? 0 : report.status === 'incomplete' ? 1 : 2;
  } catch (error) {
    io.stderr(`${error instanceof Error ? error.message : 'invalid acceptance matrix input'}\n`);
    return 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runAcceptanceMatrixCheck();
}
