import { useState, useEffect } from 'react';
import { escapeHtml } from '../../../src/lib/format';
import type { FileEntry } from '../../../src/lib/invocations';
import { Icon } from './ui/Icon';
import { StatusBadge } from './ui/StatusBadge';

interface Props {
  file: FileEntry | undefined;
  sessionId?: string;
  onBack?: () => void;
  isDirectory?: boolean;
  childCount?: number;
}

function highlightCode(text: string, filename: string): string {
  let escaped = escapeHtml(text);
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (ext === 'json' || ext === 'yaml' || ext === 'yml') {
    escaped = escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")/g, '<span class="text-success">$1</span>');
    return escaped;
  }

  const keywords = [
    'const', 'let', 'var', 'function', 'class', 'return', 'import', 'export', 'from',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
    'try', 'catch', 'finally', 'throw', 'new', 'typeof', 'instanceof', 'async', 'await',
    'def', 'elif', 'in', 'except', 'with', 'assert', 'pass', 'yield'
  ];

  const builtins = [
    'string', 'number', 'boolean', 'void', 'any', 'Promise', 'React', 'useState', 'useEffect',
    'null', 'undefined', 'true', 'false', 'self', 'this'
  ];

  const stringTokens: string[] = [];
  escaped = escaped.replace(/(["'`])(.*?)\1/g, (match) => {
    const token = `___STR_TOKEN_${stringTokens.length}___`;
    stringTokens.push(`<span class="text-success">${match}</span>`);
    return token;
  });

  const commentTokens: string[] = [];
  escaped = escaped.replace(/(\/\/.*|#.*)/g, (match) => {
    const token = `___COM_TOKEN_${commentTokens.length}___`;
    commentTokens.push(`<span class="text-text-muted italic">${match}</span>`);
    return token;
  });

  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  escaped = escaped.replace(keywordRegex, '<span class="text-accent font-semibold">$1</span>');

  const builtinRegex = new RegExp(`\\b(${builtins.join('|')})\\b`, 'g');
  escaped = escaped.replace(builtinRegex, '<span class="text-running">$1</span>');

  commentTokens.forEach((tokenHtml, index) => {
    escaped = escaped.replace(`___COM_TOKEN_${index}___`, tokenHtml);
  });
  stringTokens.forEach((tokenHtml, index) => {
    escaped = escaped.replace(`___STR_TOKEN_${index}___`, tokenHtml);
  });

  return escaped;
}

export function FileDiff({ file, sessionId, onBack, isDirectory, childCount }: Props) {
  const [activeTab, setActiveTab] = useState<'content' | 'diff'>('diff');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [gitDiff, setGitDiff] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const hasEdit = file?.ops.some((op) => op.type === 'edit') ?? false;

  useEffect(() => {
    if (file) {
      if (!hasEdit) {
        setActiveTab('content');
      } else {
        setActiveTab('diff');
      }
    }
  }, [file?.path, hasEdit]);

  useEffect(() => {
    // Directories have no file content — skip the fetch entirely.
    if (!file || isDirectory) return;

    setLoading(true);
    setError(null);
    const sessQuery = sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : '';

    if (activeTab === 'content') {
      fetch(`/api/file-content?path=${encodeURIComponent(file.path)}${sessQuery}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load file content');
          return res.json();
        })
        .then((data) => {
          setFileContent(data.content);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setFileContent(null);
          setLoading(false);
        });
    } else {
      fetch(`/api/file-diff?path=${encodeURIComponent(file.path)}${sessQuery}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load git diff');
          return res.json();
        })
        .then((data) => {
          setGitDiff(data.diff);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setGitDiff(null);
          setLoading(false);
        });
    }
  }, [file?.path, activeTab, sessionId, retryKey, isDirectory]);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-body bg-base/50">
        Select a file to view activity.
      </div>
    );
  }

  if (isDirectory) {
    return (
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-base/50 animate-drill-in md:animate-none">
        <header className="flex flex-col gap-2.5 p-4 border-b border-border-default bg-elevated/10">
          <div className="flex items-center gap-2 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back to file list"
                className="md:hidden flex items-center gap-1 text-label text-text-muted hover:text-text-primary flex-shrink-0"
              >
                <Icon name="CaretLeft" className="w-4 h-4" />
                Files
              </button>
            )}
            <Icon name="Folder" className="w-4 h-4 text-accent/70 flex-shrink-0" />
            <span className="text-text-primary break-all text-body font-mono font-semibold" title={file.path}>
              {file.path}
            </span>
            <span className="text-micro font-semibold uppercase px-1.5 py-0.5 rounded border text-text-secondary border-border-default bg-elevated/30 flex-shrink-0">
              Directory
            </span>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-text-muted">
          <Icon name="FolderOpen" className="w-8 h-8 text-text-muted" />
          <p className="text-body">Directory read by the agent</p>
          <p className="text-label text-text-muted">
            {childCount && childCount > 0
              ? `${childCount} known file${childCount === 1 ? '' : 's'} inside`
              : 'No file content to display.'}
          </p>
        </div>
      </div>
    );
  }

  const latest = file.ops[file.ops.length - 1];

  let startHighlight: number | undefined;
  let endHighlight: number | undefined;
  if (latest && latest.input) {
    const s = latest.input.StartLine ?? latest.input.startLine ?? latest.input.Startline ?? latest.input.line ?? latest.input.Line;
    const e = latest.input.EndLine ?? latest.input.endLine ?? latest.input.Endline;
    if (typeof s === 'number') startHighlight = s;
    else if (typeof s === 'string') {
      const parsed = parseInt(s, 10);
      if (!isNaN(parsed)) startHighlight = parsed;
    }

    if (typeof e === 'number') endHighlight = e;
    else if (typeof e === 'string') {
      const parsed = parseInt(e, 10);
      if (!isNaN(parsed)) endHighlight = parsed;
    }

    if (startHighlight !== undefined && endHighlight === undefined) {
      endHighlight = startHighlight + (latest.snippet ? latest.snippet.split('\n').length - 1 : 0);
    }
  }

  const renderContentLines = () => {
    if (!fileContent) return <p className="text-text-muted">No content available.</p>;
    const lines = fileContent.split('\n');
    return (
      <div className="min-w-full inline-block">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isHighlighted = startHighlight !== undefined && endHighlight !== undefined &&
                                lineNum >= startHighlight && lineNum <= endHighlight;

          let lineBg = 'hover:bg-elevated/30';
          if (isHighlighted) {
            lineBg = latest?.type === 'read' ? 'bg-running/10 border-l border-running' : 'bg-success/10 border-l border-success';
          }

          return (
            <div key={i} className={`flex px-1 py-0.5 rounded ${lineBg}`}>
              <span className="w-10 text-text-muted select-none text-right pr-2 border-r border-border-default/30 mr-3 font-mono">
                {lineNum}
              </span>
              <span className={`font-mono text-text-secondary whitespace-pre break-all ${isHighlighted ? 'text-text-primary font-medium' : ''}`} dangerouslySetInnerHTML={{ __html: highlightCode(line, file.path) }} />
            </div>
          );
        })}
      </div>
    );
  };

  const renderDiffLines = () => {
    const diffToUse = gitDiff || latest?.snippet || '';
    if (!diffToUse) {
      return <p className="text-text-muted">No pending git changes or diff snippet available.</p>;
    }
    const lines = diffToUse.split('\n');
    return (
      <div className="min-w-full inline-block">
        {!gitDiff && latest?.snippet && (
          <p className="text-caption text-text-muted border-b border-border-default/30 pb-2 mb-2">
            No active changes detected in local git. Showing the snippet captured from the tool:
          </p>
        )}
        {lines.map((line, i) => {
          let cls = 'text-text-secondary px-1 whitespace-pre break-all rounded py-0.5';
          if (line.startsWith('+')) cls = 'text-success bg-success/5 px-1 whitespace-pre break-all rounded py-0.5';
          else if (line.startsWith('-')) cls = 'text-error bg-error/5 px-1 whitespace-pre break-all rounded py-0.5';
          else if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++'))
            cls = 'text-text-muted px-1 whitespace-pre break-all py-0.5';
          return (
            <div key={i} className={cls}>
              <span dangerouslySetInnerHTML={{ __html: escapeHtml(line) }} />
            </div>
          );
        })}
      </div>
    );
  };

  const tabClass = (active: boolean) =>
    `py-2 text-caption font-mono font-semibold relative transition-colors ${
      active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
    }`;

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-base/50 animate-drill-in md:animate-none">
      <header className="flex flex-col gap-2.5 p-4 pb-0 border-b border-border-default bg-elevated/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back to file list"
                className="md:hidden flex items-center gap-1 text-label text-text-muted hover:text-text-primary flex-shrink-0"
              >
                <Icon name="CaretLeft" className="w-4 h-4" />
                Files
              </button>
            )}
            <span className="text-text-primary break-all text-body font-mono font-semibold" title={file.path}>
              {file.path}
            </span>
          </div>
          {latest && <StatusBadge status={latest.status} />}
        </div>

        {latest && (
          <div className="flex flex-wrap items-center gap-2 text-label text-text-secondary pb-2.5">
            <span className={`text-micro font-semibold uppercase px-1.5 py-0.5 rounded border ${
              latest.type === 'read'
                ? 'text-running border-running/35 bg-running/5'
                : latest.type === 'edit'
                ? 'text-success border-success/35 bg-success/5'
                : 'text-text-secondary border-border-default bg-elevated/30'
            }`}>
              {latest.type}
            </span>

            <span className="flex items-center gap-1 bg-elevated px-2 py-0.5 rounded border border-border-default/60 font-mono text-caption">
              tool: <strong className="text-text-primary">{latest.tool}</strong>
            </span>
            {latest.skill && (
              <span className="flex items-center gap-1 bg-elevated px-2 py-0.5 rounded border border-border-default/60 font-mono text-caption">
                skill: <strong className="text-text-primary">{latest.skill}</strong>
              </span>
            )}
            {latest.lineHint && (
              <span className="flex items-center gap-1 bg-elevated px-2 py-0.5 rounded border border-border-default/60 font-mono text-caption">
                range: <strong className="text-text-primary">{latest.lineHint}</strong>
              </span>
            )}
            <span className="text-text-muted text-caption ml-auto font-mono">
              {new Date(latest.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}

        <div className="flex border-t border-border-default/30 px-1 gap-6">
          {hasEdit && (
            <button onClick={() => setActiveTab('diff')} className={tabClass(activeTab === 'diff')}>
              Operation Diff
              {activeTab === 'diff' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
              )}
            </button>
          )}
          <button onClick={() => setActiveTab('content')} className={tabClass(activeTab === 'content')}>
            Full Content
            {activeTab === 'content' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 font-mono text-body">
        {loading ? (
          <p className="text-text-muted animate-pulse">Loading file…</p>
        ) : error ? (
          <div className="flex items-center gap-3 p-3 rounded border-l-2 border-error bg-inset">
            <p className="text-label text-text-secondary flex-1">
              Failed to load file: {error}. It may be binary or have been deleted locally.
            </p>
            <button onClick={() => setRetryKey((k) => k + 1)} className="btn-ghost text-label flex-shrink-0">
              Retry
            </button>
          </div>
        ) : activeTab === 'content' ? (
          renderContentLines()
        ) : (
          renderDiffLines()
        )}
      </div>
    </div>
  );
}
