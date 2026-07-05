import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { DocsLayout } from './components/DocsLayout';
import { 
  GithubLogo, 
  BookOpen, 
  Terminal,
  House
} from '@phosphor-icons/react';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(''); // e.g. '', 'docs/getting-started/what-is-crewloop'

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/docs/')) {
        setCurrentRoute(hash.replace('#/docs/', ''));
      } else {
        setCurrentRoute('');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToDocs = (docId: string) => {
    window.location.hash = `#/docs/${docId}`;
  };

  const navigateHome = () => {
    window.location.hash = '#/';
  };

  const isDocsView = currentRoute !== '';

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 h-16 border-b border-slate-900 bg-bg-primary/80 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-12">
        <button onClick={navigateHome} className="flex items-center space-x-2.5 group">
          <div className="p-2 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 group-hover:border-violet-500/50 transition-colors">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg text-white group-hover:text-violet-300 transition-colors">
            CrewLoop
          </span>
        </button>

        <nav className="flex items-center space-x-6">
          <button 
            onClick={navigateHome}
            className={`text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors ${
              !isDocsView ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <House className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
          
          <button 
            onClick={() => navigateToDocs('getting-started/what-is-crewloop')}
            className={`text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors ${
              isDocsView ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Docs</span>
          </button>

          <a 
            href="https://github.com/leorsousa05/CrewLoop"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono font-medium text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 transition-colors"
          >
            <GithubLogo className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {isDocsView ? (
          <DocsLayout 
            activeDocId={currentRoute}
            onNavigate={navigateToDocs}
            onGoHome={navigateHome}
          />
        ) : (
          <LandingPage onNavigateToDocs={navigateToDocs} />
        )}
      </div>
    </div>
  );
};

export default App;
