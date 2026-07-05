import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

// Initialize mermaid library
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
});

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    containerRef.current.innerHTML = '';
    const id = `mermaid-${Math.floor(Math.random() * 1000000)}`;
    
    try {
      mermaid.render(id, chart).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      });
    } catch (err) {
      console.error('Failed to render mermaid chart:', err);
      containerRef.current.innerHTML = `<pre class="text-rose-400 text-xs font-mono p-4 border border-rose-500/20 bg-rose-950/20 rounded">${err}</pre>`;
    }
  }, [chart]);

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center my-6 overflow-x-auto bg-slate-900/20 p-4 rounded-xl border border-slate-800/40" 
    />
  );
};

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-h1:text-3xl prose-h1:text-slate-100 prose-h2:text-2xl prose-h2:text-slate-200 prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:text-slate-300 prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-violet-400 prose-a:underline hover:prose-a:text-violet-300 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4 prose-li:mb-2 prose-li:text-slate-300 prose-pre:bg-slate-900/60 prose-pre:border prose-pre:border-slate-800 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-code:font-mono prose-code:text-violet-300 prose-code:text-sm prose-code:bg-slate-800/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-table:w-full prose-table:border-collapse prose-table:mb-6 prose-th:border prose-th:border-slate-800 prose-th:bg-slate-900/60 prose-th:p-3 prose-th:text-left prose-th:text-slate-200 prose-td:border prose-td:border-slate-800 prose-td:p-3 prose-td:text-slate-300 prose-hr:border-slate-800 prose-hr:my-8">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Render alerts (blockquotes containing specific alert markers like [!NOTE])
          blockquote({ children }) {
            const childrenArray = React.Children.toArray(children);
            const firstChild = childrenArray[0];
            
            let alertType = 'default';
            let cleanedChildren = children;

            if (React.isValidElement(firstChild)) {
              const firstChildElement = firstChild as React.ReactElement<any>;
              const text = firstChildElement.props.children;
              if (typeof text === 'string') {
                if (text.startsWith('[!NOTE]')) {
                  alertType = 'note';
                  cleanedChildren = React.Children.map(children, (child, idx) => {
                    if (idx === 0 && React.isValidElement(child)) {
                      const childElement = child as React.ReactElement<any>;
                      return React.cloneElement(childElement, {
                        ...childElement.props,
                        children: text.replace('[!NOTE]', '').trim()
                      });
                    }
                    return child;
                  });
                } else if (text.startsWith('[!TIP]')) {
                  alertType = 'tip';
                  cleanedChildren = React.Children.map(children, (child, idx) => {
                    if (idx === 0 && React.isValidElement(child)) {
                      const childElement = child as React.ReactElement<any>;
                      return React.cloneElement(childElement, {
                        ...childElement.props,
                        children: text.replace('[!TIP]', '').trim()
                      });
                    }
                    return child;
                  });
                } else if (text.startsWith('[!IMPORTANT]')) {
                  alertType = 'important';
                  cleanedChildren = React.Children.map(children, (child, idx) => {
                    if (idx === 0 && React.isValidElement(child)) {
                      const childElement = child as React.ReactElement<any>;
                      return React.cloneElement(childElement, {
                        ...childElement.props,
                        children: text.replace('[!IMPORTANT]', '').trim()
                      });
                    }
                    return child;
                  });
                } else if (text.startsWith('[!WARNING]')) {
                  alertType = 'warning';
                  cleanedChildren = React.Children.map(children, (child, idx) => {
                    if (idx === 0 && React.isValidElement(child)) {
                      const childElement = child as React.ReactElement<any>;
                      return React.cloneElement(childElement, {
                        ...childElement.props,
                        children: text.replace('[!WARNING]', '').trim()
                      });
                    }
                    return child;
                  });
                } else if (text.startsWith('[!CAUTION]')) {
                  alertType = 'caution';
                  cleanedChildren = React.Children.map(children, (child, idx) => {
                    if (idx === 0 && React.isValidElement(child)) {
                      const childElement = child as React.ReactElement<any>;
                      return React.cloneElement(childElement, {
                        ...childElement.props,
                        children: text.replace('[!CAUTION]', '').trim()
                      });
                    }
                    return child;
                  });
                }
              }
            }

            const alertStyles = {
              note: 'border-l-4 border-blue-500 bg-blue-950/20 text-blue-200 px-4 py-3 my-4 rounded-r-lg',
              tip: 'border-l-4 border-emerald-500 bg-emerald-950/20 text-emerald-200 px-4 py-3 my-4 rounded-r-lg',
              important: 'border-l-4 border-violet-500 bg-violet-950/20 text-violet-200 px-4 py-3 my-4 rounded-r-lg',
              warning: 'border-l-4 border-amber-500 bg-amber-950/20 text-amber-200 px-4 py-3 my-4 rounded-r-lg',
              caution: 'border-l-4 border-red-500 bg-red-950/20 text-red-200 px-4 py-3 my-4 rounded-r-lg',
              default: 'border-l-4 border-slate-700 bg-slate-800/20 text-slate-300 px-4 py-3 my-4 rounded-r-lg',
            };

            const activeStyle = alertStyles[alertType as keyof typeof alertStyles] || alertStyles.default;

            return <blockquote className={activeStyle}>{cleanedChildren}</blockquote>;
          },
          // Format custom tables
          table({ children }) {
            return (
              <div className="overflow-x-auto w-full mb-6 rounded-lg border border-slate-800">
                <table className="w-full text-sm text-left">{children}</table>
              </div>
            );
          },
          // Code block highlighting overrides
          pre({ children }) {
            const firstChild = React.Children.toArray(children)[0];
            if (React.isValidElement(firstChild)) {
              const firstChildElement = firstChild as React.ReactElement<any>;
              if (
                typeof firstChildElement.props.className === 'string' &&
                firstChildElement.props.className.includes('language-mermaid')
              ) {
                const chartContent = String(firstChildElement.props.children).replace(/\n$/, '');
                return <Mermaid chart={chartContent} />;
              }
            }

            return (
              <pre className="relative overflow-hidden group p-0 bg-slate-900 border border-slate-800/80 rounded-lg my-6">
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800 bg-slate-950 text-xs text-slate-400 font-mono">
                  <span>code terminal</span>
                  <button 
                    onClick={(e) => {
                      const preElement = e.currentTarget.parentElement?.nextElementSibling;
                      if (preElement) {
                        navigator.clipboard.writeText(preElement.textContent || '');
                      }
                    }}
                    className="hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">{children}</div>
              </pre>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
