import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { DocsLayout } from './components/DocsLayout';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './hooks/useTheme';
import {
  GithubLogo,
  BookOpen,
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

  const navLinkClass = (active: boolean) =>
    `relative flex items-center gap-1.5 px-2 py-2 text-label font-mono transition-colors ${
      active
        ? 'text-text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:bg-accent'
        : 'text-text-secondary hover:text-text-primary hover:bg-elevated/40 rounded'
    }`;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-base text-text-primary flex flex-col font-mono">

        {/* Top Navbar */}
        <header className="fixed top-0 inset-x-0 h-14 border-b border-border-default bg-surface z-50 flex items-center justify-between px-4 md:px-8">
          <button onClick={navigateHome} className="flex items-center gap-2.5 group rounded">
            <img
              src={`${import.meta.env.BASE_URL}assets/images/crewloop-logo.png`}
              alt=""
              aria-hidden="true"
              className="h-8 w-8 object-contain opacity-85 transition-opacity group-hover:opacity-100"
            />
            <span className="font-display font-semibold text-heading text-text-primary">
              CrewLoop
            </span>
          </button>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={navigateHome}
              aria-current={!isDocsView ? 'page' : undefined}
              className={navLinkClass(!isDocsView)}
            >
              <House className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => navigateToDocs('getting-started/what-is-crewloop')}
              aria-current={isDocsView ? 'page' : undefined}
              className={navLinkClass(isDocsView)}
            >
              <BookOpen className="w-4 h-4" />
              <span>Docs</span>
            </button>

            <a
              href="https://github.com/leorsousa05/CrewLoop"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2 py-2 text-label font-mono text-text-secondary hover:text-text-primary hover:bg-elevated/40 rounded transition-colors"
            >
              <GithubLogo className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <ThemeToggle className="ml-1" />
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
    </ThemeProvider>
  );
};

export default App;
