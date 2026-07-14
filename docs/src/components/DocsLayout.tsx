import React, { useState, useEffect } from 'react';
import { sidebarConfig } from '../sidebarConfig';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { DocItem } from '../types';
import { 
  List, 
  MagnifyingGlass, 
  Warning, 
  ArrowLeft, 
  CaretLeft,
  CaretRight,
  House
} from '@phosphor-icons/react';

interface DocsLayoutProps {
  activeDocId: string;
  onNavigate: (docId: string) => void;
  onGoHome: () => void;
}

export const DocsLayout: React.FC<DocsLayoutProps> = ({ activeDocId, onNavigate, onGoHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [docContent, setDocContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  // Find active item and category
  let activeItem: DocItem | null = null;
  let activeCategoryLabel = '';

  for (const cat of sidebarConfig) {
    const item = cat.items.find(i => i.id === activeDocId);
    if (item) {
      activeItem = item;
      activeCategoryLabel = cat.label;
      break;
    }
  }

  const docNotFound = !activeItem;

  // Flattened reading order for prev/next footer navigation
  const allItems = sidebarConfig.flatMap(cat => cat.items);
  const activeIndex = allItems.findIndex(i => i.id === activeDocId);
  const prevItem = activeIndex > 0 ? allItems[activeIndex - 1] : null;
  const nextItem = activeIndex >= 0 && activeIndex < allItems.length - 1 ? allItems[activeIndex + 1] : null;

  useEffect(() => {
    if (!activeItem) {
      setLoading(false);
      return;
    }
    
    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const basePath = import.meta.env.BASE_URL.endsWith('/') 
          ? import.meta.env.BASE_URL.slice(0, -1) 
          : import.meta.env.BASE_URL;
        const response = await fetch(`${basePath}${activeItem!.path}`);
        if (!response.ok) {
          throw new Error(`Failed to load document (Status ${response.status})`);
        }
        const text = await response.text();
        const cleanText = text.replace(/^---[\s\S]*?---/, '').trim();
        setDocContent(cleanText);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while loading this document.');
      } finally {
        // Small delay so the skeleton reads as a state, not a flash
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    fetchDoc();
    setMobileMenuOpen(false);
  }, [activeDocId, activeItem, retryNonce]);

  // Filter sidebar config based on search query
  const filteredCategories = sidebarConfig.map(cat => {
    const matchedItems = cat.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, items: matchedItems };
  }).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      {/* Search and Navigation Sidebar (Desktop) */}
      <div className="flex-1 flex flex-row items-stretch">
        
        {/* Sidebar Container — 260px hairline column; off-canvas sheet on mobile */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-base border-r border-border-default pt-14 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Quick Filter Box */}
          <div className="px-4 py-4 border-b border-border-default">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Quick filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-inset border border-border-default rounded-md py-1.5 pl-9 pr-12 text-label font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <MagnifyingGlass className="absolute left-3 top-2 w-4 h-4 text-text-muted" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1.5 text-micro text-text-muted hover:text-text-primary font-mono transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <h4 className="label px-3 py-1">
                  {cat.label}
                </h4>
                <ul className="space-y-0.5">
                  {cat.items.map((item) => {
                    const isActive = item.id === activeDocId;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full text-left text-label font-medium px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                            isActive 
                              ? 'bg-accent-dim text-accent-strong font-semibold border-l-2 border-accent pl-2' 
                              : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                          }`}
                        >
                          <span>{item.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            
            {filteredCategories.length === 0 && (
              <div className="px-3 py-4 text-label font-mono text-text-secondary">
                No docs match "{searchQuery}".
              </div>
            )}
          </nav>

          {/* Back to Home CTA */}
          <div className="p-4 border-t border-border-default">
            <button 
              onClick={onGoHome}
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 animate-sheet-scrim-in lg:hidden"
            style={{ background: 'var(--overlay)' }}
          />
        )}

        {/* Content Panel */}
        <main className="flex-1 min-w-0 flex flex-col min-h-screen pt-14">
          {/* Mobile Shell Header Bar */}
          <div className="lg:hidden h-12 bg-base border-b border-border-default flex items-center justify-between px-6 sticky top-14 z-20">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 text-label font-mono text-text-secondary hover:text-text-primary transition-colors"
            >
              <List className="w-5 h-5" />
              <span>Menu</span>
            </button>
            <span className="text-label font-mono text-text-muted truncate max-w-[200px]">
              {activeItem?.title}
            </span>
          </div>

          {/* Docs Reading Panel */}
          <div className="flex-1 max-w-4xl w-full mx-auto px-6 md:px-12 py-8 flex flex-col justify-between">
            <div>
              {/* Breadcrumb Header */}
              <div className="flex items-center gap-2 text-micro font-mono text-text-muted mb-8 border-b border-border-default pb-4">
                <button onClick={onGoHome} className="hover:text-text-primary flex items-center transition-colors" aria-label="Back to home">
                  <House className="w-3.5 h-3.5" />
                </button>
                <CaretRight className="w-3 h-3" />
                <span>Docs</span>
                <CaretRight className="w-3 h-3" />
                <span>{activeCategoryLabel}</span>
                <CaretRight className="w-3 h-3" />
                <span className="text-text-secondary font-semibold">{activeItem?.title}</span>
              </div>

              {/* 404 / missing doc state */}
              {docNotFound && (
                <div className="text-center py-20 space-y-4">
                  <h2 className="text-display-lg font-display font-bold text-text-primary">Doc not found</h2>
                  <p className="text-label font-mono text-text-muted">{activeDocId}</p>
                  <div>
                    <button
                      onClick={() => allItems.length > 0 && onNavigate(allItems[0].id)}
                      className="btn-ghost"
                    >
                      Back to docs index
                    </button>
                  </div>
                </div>
              )}

              {/* Shimmering Skeleton Loader — mirrors final layout */}
              {!docNotFound && loading && (
                <div className="space-y-6">
                  <div className="h-9 w-2/5 rounded-md bg-elevated animate-shimmer" />
                  <div className="h-4 w-full rounded bg-elevated animate-shimmer" />
                  <div className="h-4 w-4/5 rounded bg-elevated animate-shimmer" />
                  <div className="h-32 w-full rounded-lg bg-inset border border-border-default animate-shimmer mt-8" />
                  <div className="h-4 w-full rounded bg-elevated animate-shimmer mt-6" />
                  <div className="h-4 w-3/4 rounded bg-elevated animate-shimmer" />
                </div>
              )}

              {/* Error State — FileDiff well pattern: inset, 2px error left border, ghost retry */}
              {error && !loading && (
                <div className="bg-inset border border-border-default border-l-2 !border-l-error rounded-md p-6 space-y-4 max-w-lg mt-8">
                  <div className="flex items-center gap-3 text-error">
                    <Warning className="w-5 h-5" />
                    <h3 className="text-heading font-display font-semibold">Failed to load documentation</h3>
                  </div>
                  <p className="text-label font-mono text-text-secondary">
                    {error}
                  </p>
                  <button 
                    onClick={() => setRetryNonce(n => n + 1)}
                    className="btn-ghost"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Document Markdown Content */}
              {!docNotFound && !loading && !error && (
                <div className="animate-fade-in">
                  <MarkdownRenderer content={docContent} />
                </div>
              )}
            </div>

            {/* Document Footer Navigation — prev/next hairline cards */}
            {!docNotFound && !loading && !error && (
              <div className="mt-16 grid grid-cols-2 gap-3">
                {prevItem ? (
                  <button
                    onClick={() => onNavigate(prevItem.id)}
                    className="text-left border border-border-default rounded-lg p-4 hover:border-border-strong hover:bg-elevated/40 transition-colors group"
                  >
                    <span className="text-micro font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <CaretLeft className="w-3.5 h-3.5" />
                      Previous
                    </span>
                    <span className="block mt-1.5 text-label font-semibold text-text-primary group-hover:text-accent-strong transition-colors">
                      {prevItem.title}
                    </span>
                  </button>
                ) : <div />}
                {nextItem ? (
                  <button
                    onClick={() => onNavigate(nextItem.id)}
                    className="text-right border border-border-default rounded-lg p-4 hover:border-border-strong hover:bg-elevated/40 transition-colors group col-start-2"
                  >
                    <span className="text-micro font-mono uppercase tracking-wider text-text-muted flex items-center justify-end gap-1.5">
                      Next
                      <CaretRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="block mt-1.5 text-label font-semibold text-text-primary group-hover:text-accent-strong transition-colors">
                      {nextItem.title}
                    </span>
                  </button>
                ) : <div className="col-start-2" />}
              </div>
            )}

            {/* Footer line */}
            <div className="mt-8 pt-6 border-t border-border-default text-micro font-mono text-text-muted flex items-center justify-between">
              <span>CrewLoop Docs</span>
              <a 
                href="https://github.com/leorsousa05/CrewLoop"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary transition-colors"
              >
                GitHub Repository
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
