import React, { useState, useEffect } from 'react';
import { sidebarConfig } from '../sidebarConfig';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { DocItem } from '../types';
import { 
  List, 
  MagnifyingGlass, 
  Warning, 
  ArrowLeft, 
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

  // Fallback to first item if not found
  if (!activeItem && sidebarConfig.length > 0 && sidebarConfig[0].items.length > 0) {
    activeItem = sidebarConfig[0].items[0];
    activeCategoryLabel = sidebarConfig[0].label;
  }

  useEffect(() => {
    if (!activeItem) return;
    
    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(activeItem!.path);
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
        // Add a tiny delay for beautiful transition skeleton shimmer feel
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    fetchDoc();
    setMobileMenuOpen(false);
  }, [activeDocId, activeItem]);

  // Filter sidebar config based on search query
  const filteredCategories = sidebarConfig.map(cat => {
    const matchedItems = cat.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, items: matchedItems };
  }).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      {/* Search and Navigation Sidebar (Desktop) */}
      <div className="flex-1 flex flex-row items-stretch">
        
        {/* Sidebar Container */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950/80 border-r border-slate-800/80 pt-16 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Quick Filter Box */}
          <div className="px-5 py-4 border-b border-slate-900">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Quick filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-violet-500/50"
              />
              <MagnifyingGlass className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300 font-mono"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase px-3">
                  {cat.label}
                </h4>
                <ul className="space-y-1">
                  {cat.items.map((item) => {
                    const isActive = item.id === activeDocId;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full text-left text-xs font-medium px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                            isActive 
                              ? 'text-violet-400 bg-violet-500/10 font-semibold border-l-2 border-violet-500 pl-2' 
                              : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
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
              <div className="px-3 py-4 text-center text-xs text-slate-500 font-mono">
                No matching pages
              </div>
            )}
          </nav>

          {/* Back to Home CTA */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/40">
            <button 
              onClick={onGoHome}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
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
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Content Panel */}
        <main className="flex-1 min-w-0 flex flex-col min-h-screen pt-16">
          {/* Mobile Shell Header Bar */}
          <div className="lg:hidden h-12 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 sticky top-16 z-20">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              <List className="w-5 h-5 text-slate-300" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
              {activeItem?.title}
            </span>
          </div>

          {/* Docs Reading Panel */}
          <div className="flex-1 max-w-4xl w-full mx-auto px-6 md:px-12 py-8 flex flex-col justify-between">
            <div>
              {/* Breadcrumb Header */}
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-8 border-b border-slate-900 pb-4">
                <button onClick={onGoHome} className="hover:text-slate-300 flex items-center">
                  <House className="w-3.5 h-3.5" />
                </button>
                <CaretRight className="w-3 h-3" />
                <span>Docs</span>
                <CaretRight className="w-3 h-3" />
                <span>{activeCategoryLabel}</span>
                <CaretRight className="w-3 h-3" />
                <span className="text-slate-300 font-semibold">{activeItem?.title}</span>
              </div>

              {/* Shimmering Skeleton Loader */}
              {loading && (
                <div className="space-y-6 animate-pulse">
                  <div className="h-10 bg-slate-900 rounded-lg w-2/3" />
                  <div className="h-4 bg-slate-900 rounded w-full" />
                  <div className="h-4 bg-slate-900 rounded w-5/6" />
                  <div className="h-4 bg-slate-900 rounded w-4/5" />
                  <div className="h-32 bg-slate-900 rounded-lg w-full mt-8" />
                  <div className="h-4 bg-slate-900 rounded w-full mt-6" />
                  <div className="h-4 bg-slate-900 rounded w-3/4" />
                </div>
              )}

              {/* Error State Card */}
              {error && !loading && (
                <div className="glass-card border-rose-500/30 p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto mt-12">
                  <Warning className="w-12 h-12 text-rose-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-100 font-display">Failed to load documentation</h3>
                  <p className="text-sm font-mono text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                    {error}
                  </p>
                  <button 
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                      // Trigger state refresh
                      onNavigate(activeDocId);
                    }}
                    className="px-5 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-mono rounded-lg transition-colors"
                  >
                    Retry Loading
                  </button>
                </div>
              )}

              {/* Document Markdown Content */}
              {!loading && !error && (
                <div className="animate-fade-in-up">
                  <MarkdownRenderer content={docContent} />
                </div>
              )}
            </div>

            {/* Document Footer Navigation */}
            <div className="mt-16 pt-6 border-t border-slate-900 text-xs font-mono text-slate-500 flex items-center justify-between">
              <span>CrewLoop Docs</span>
              <a 
                href="https://github.com/leorsousa05/CrewLoop"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-300"
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
