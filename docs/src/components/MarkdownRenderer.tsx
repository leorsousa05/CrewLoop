import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import {
  Info,
  Lightbulb,
  Star,
  Warning,
  XCircle,
  Copy,
  Check
} from '@phosphor-icons/react';
import { useTheme, type ThemeMode } from '../hooks/useTheme';

/* -------------------------------------------------------------------------- */
/* Mermaid — theme-aware (design-ui.md §13)                                   */
/* -------------------------------------------------------------------------- */

const readVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function getMermaidTheme(mode: ThemeMode) {
  return {
    startOnLoad: false,
    securityLevel: 'loose' as const,
    theme: (mode === 'light' ? 'default' : 'dark') as 'default' | 'dark',
    themeVariables: {
      background: readVar('--bg-surface'),
      primaryTextColor: readVar('--text-primary'),
      lineColor: readVar('--border-strong'),
      clusterBkg: readVar('--bg-inset'),
      primaryColor: readVar('--accent-dim'),
      primaryBorderColor: readVar('--accent'),
    },
  };
}

const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    // Defer one frame so the ThemeProvider has already flipped the root class
    // and getComputedStyle reads the new theme's tokens.
    const frame = requestAnimationFrame(() => {
      mermaid.initialize(getMermaidTheme(theme));
      const id = `mermaid-${Math.floor(Math.random() * 1000000)}`;
      mermaid
        .render(id, chart)
        .then(({ svg }) => {
          if (!cancelled) container.innerHTML = svg;
        })
        .catch((err) => {
          if (cancelled) return;
          container.innerHTML = '';
          const pre = document.createElement('pre');
          pre.className = 'w-full text-error text-label font-mono p-4 border border-error/30 bg-error/5 rounded-md';
          pre.textContent = String(err);
          container.appendChild(pre);
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [chart, theme]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center my-6 overflow-x-auto bg-surface border border-border-default rounded-lg p-4"
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Syntax highlighting — token set and span classes mirror the dashboard's    */
/* FileDiff highlighter (strings success, keywords accent, comments muted     */
/* italic, builtins running). Tokens are extracted before HTML-escaping so    */
/* quotes inside strings survive; colors are identical by construction.       */
/* -------------------------------------------------------------------------- */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const KEYWORDS = [
  'const', 'let', 'var', 'function', 'class', 'return', 'import', 'export', 'from',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'try', 'catch', 'finally', 'throw', 'new', 'typeof', 'instanceof', 'async', 'await',
  'def', 'elif', 'in', 'except', 'with', 'assert', 'pass', 'yield'
];

const BUILTINS = [
  'string', 'number', 'boolean', 'void', 'any', 'Promise', 'React', 'useState', 'useEffect',
  'null', 'undefined', 'true', 'false', 'self', 'this'
];

function restoreTokens(html: string, stringTokens: string[], commentTokens: string[]): string {
  let out = html;
  commentTokens.forEach((tokenHtml, index) => {
    out = out.replace(`___COM_TOKEN_${index}___`, tokenHtml);
  });
  stringTokens.forEach((tokenHtml, index) => {
    out = out.replace(`___STR_TOKEN_${index}___`, tokenHtml);
  });
  return out;
}

function highlightCode(text: string, language: string): string {
  const ext = language.toLowerCase();
  const stringTokens: string[] = [];
  const commentTokens: string[] = [];

  let working = text.replace(/(["'`])(.*?)\1/g, (match) => {
    const token = `___STR_TOKEN_${stringTokens.length}___`;
    stringTokens.push(`<span class="text-success">${escapeHtml(match)}</span>`);
    return token;
  });

  if (ext === 'json' || ext === 'yaml' || ext === 'yml') {
    // JSON/YAML: strings only — same rule as the dashboard highlighter.
    return restoreTokens(escapeHtml(working), stringTokens, commentTokens);
  }

  working = working.replace(/(\/\/.*|#.*)/g, (match) => {
    const token = `___COM_TOKEN_${commentTokens.length}___`;
    commentTokens.push(`<span class="text-text-muted italic">${escapeHtml(match)}</span>`);
    return token;
  });

  let escaped = escapeHtml(working);

  const keywordRegex = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'g');
  escaped = escaped.replace(keywordRegex, '<span class="text-accent font-semibold">$1</span>');

  const builtinRegex = new RegExp(`\\b(${BUILTINS.join('|')})\\b`, 'g');
  escaped = escaped.replace(builtinRegex, '<span class="text-running">$1</span>');

  return restoreTokens(escaped, stringTokens, commentTokens);
}

/* -------------------------------------------------------------------------- */
/* Code block chrome — inset slab, language label, copy with success swap     */
/* -------------------------------------------------------------------------- */

const CodeCopyButton: React.FC<{ getText: () => string }> = ({ getText }) => {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(getText());
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="btn-ghost !px-2 !py-1 !text-micro"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-success" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

const PreBlock: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const firstChild = React.Children.toArray(children)[0];

  if (React.isValidElement(firstChild)) {
    const codeElement = firstChild as React.ReactElement<any>;
    const className = typeof codeElement.props.className === 'string' ? codeElement.props.className : '';

    if (className.includes('language-mermaid')) {
      const chart = String(codeElement.props.children).replace(/\n$/, '');
      return <Mermaid chart={chart} />;
    }

    const language = className.match(/language-([\w-]+)/)?.[1] || 'code';
    const raw = String(codeElement.props.children).replace(/\n$/, '');

    return (
      <pre className="p-0 bg-inset border border-border-default rounded-lg my-6 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-default bg-base">
          <span className="text-micro font-semibold uppercase tracking-wider text-text-muted">{language}</span>
          <CodeCopyButton getText={() => contentRef.current?.textContent ?? ''} />
        </div>
        <div ref={contentRef} className="p-4 overflow-x-auto">
          <code
            className="block whitespace-pre font-mono text-label leading-[1.6] text-text-secondary"
            dangerouslySetInnerHTML={{ __html: highlightCode(raw, language) }}
          />
        </div>
      </pre>
    );
  }

  return (
    <pre className="p-4 bg-inset border border-border-default rounded-lg my-6 overflow-x-auto font-mono text-label text-text-secondary">
      {children}
    </pre>
  );
};

/* -------------------------------------------------------------------------- */
/* Alerts — GitHub-style [!TYPE] blockquotes as hairline status panels        */
/* -------------------------------------------------------------------------- */

const ALERT_CONFIG = {
  '[!NOTE]': { label: 'Note', icon: Info, tone: 'bg-running/5 text-running' },
  '[!TIP]': { label: 'Tip', icon: Lightbulb, tone: 'bg-success/5 text-success' },
  '[!IMPORTANT]': { label: 'Important', icon: Star, tone: 'bg-accent/5 text-accent' },
  '[!WARNING]': { label: 'Warning', icon: Warning, tone: 'bg-warning/5 text-warning' },
  '[!CAUTION]': { label: 'Caution', icon: XCircle, tone: 'bg-error/5 text-error' },
} as const;

type AlertMarker = keyof typeof ALERT_CONFIG;

const BlockquoteBlock: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);
  const firstChild = childrenArray[0];

  let marker: AlertMarker | null = null;
  let firstText = '';

  if (React.isValidElement(firstChild)) {
    const text = (firstChild as React.ReactElement<any>).props.children;
    if (typeof text === 'string') {
      for (const key of Object.keys(ALERT_CONFIG) as AlertMarker[]) {
        if (text.startsWith(key)) {
          marker = key;
          firstText = text;
          break;
        }
      }
    }
  }

  if (!marker) {
    return (
      <blockquote className="border-l-2 border-border-strong pl-4 my-4 text-text-secondary">
        {children}
      </blockquote>
    );
  }

  const cleanedChildren = React.Children.map(children, (child, idx) => {
    if (idx === 0 && React.isValidElement(child)) {
      const childElement = child as React.ReactElement<any>;
      return React.cloneElement(childElement, {
        ...childElement.props,
        children: firstText.replace(marker as string, '').trim()
      });
    }
    return child;
  });

  const cfg = ALERT_CONFIG[marker];
  const AlertIcon = cfg.icon;

  return (
    <div className={`my-4 rounded-md border border-border-default border-l-2 !border-l-current px-4 py-3 ${cfg.tone}`}>
      <div className="flex items-center gap-2 mb-1">
        <AlertIcon className="w-4 h-4" />
        <span className="text-micro font-semibold uppercase tracking-wider">{cfg.label}</span>
      </div>
      <div className="font-prose text-prose-sm text-text-secondary [&>p]:mb-0">
        {cleanedChildren}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Renderer                                                                   */
/* -------------------------------------------------------------------------- */

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose max-w-measure font-prose text-prose prose-headings:font-display prose-headings:font-bold prose-headings:text-text-primary prose-h1:text-display-xl prose-h1:mb-6 prose-h2:text-display-lg prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-heading prose-h3:mt-8 prose-h3:mb-3 prose-h4:font-mono prose-h4:text-body prose-h4:uppercase prose-h4:tracking-[0.08em] prose-h4:mt-6 prose-h4:mb-2 prose-p:text-text-secondary prose-p:mb-4 prose-strong:text-text-primary prose-strong:font-semibold prose-em:text-text-secondary prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4 prose-li:mb-2 prose-li:text-text-secondary prose-li:marker:text-text-muted prose-th:bg-elevated prose-th:px-3 prose-th:py-1.5 prose-th:text-left prose-th:text-micro prose-th:font-semibold prose-th:uppercase prose-th:tracking-[0.12em] prose-th:text-text-muted prose-td:px-3 prose-td:py-1.5 prose-td:text-label prose-td:text-text-secondary prose-tr:hover:bg-elevated/40 prose-hr:border-border-default prose-hr:my-8">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          blockquote: BlockquoteBlock,
          pre: PreBlock,
          // Tables: hairline frame, horizontal scroll on small screens
          table({ children }) {
            return (
              <div className="overflow-x-auto w-full mb-6 rounded-lg border border-border-default">
                <table className="w-full text-left">{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
