import React, { useState, useEffect } from 'react';
import { SkillVisualizer } from './SkillVisualizer';
import { TerminalSimulator } from './TerminalSimulator';
import { sidebarConfig } from '../sidebarConfig';
import {
  ArrowRight,
  X,
  Check,
  Copy,
  ShieldWarning,
  ShieldCheck,
  BookOpen,
  Warning
} from '@phosphor-icons/react';

interface LandingPageProps {
  onNavigateToDocs: (path: string) => void;
}

interface SkillDetails {
  id: string;
  name: string;
  role: string;
  desc: string;
  cannotDo: string[];
}

// Doc pages that actually exist — the modal's "Read Full Guide" button is
// hidden for skills without one (review follow-up, spec 024).
const AVAILABLE_DOC_IDS = new Set(sidebarConfig.flatMap(cat => cat.items.map(i => i.id)));

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDocs }) => {
  const [copied, setCopied] = useState(false);
  const [activeModalImg, setActiveModalImg] = useState<{ src: string; title: string; desc: string } | null>(null);
  const [selectedSkillForModal, setSelectedSkillForModal] = useState<SkillDetails | null>(null);
  const [cliCommandText, setCliCommandText] = useState('');
  const fullCliCommand = 'npm i -g @archznn/crewloop-cli && crewloop install';

  // Typewriter for the install command — content motion, not decoration.
  // Reduced-motion users get the full command instantly (design-ui.md §6/§10).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCliCommandText(fullCliCommand);
      return;
    }
    let index = 0;
    const interval = setInterval(() => {
      setCliCommandText(fullCliCommand.slice(0, index + 1));
      index++;
      if (index >= fullCliCommand.length) {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  // ESC closes any open overlay (review follow-up, spec 024 — never existed before).
  const anyModalOpen = selectedSkillForModal !== null || activeModalImg !== null;
  useEffect(() => {
    if (!anyModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSkillForModal(null);
        setActiveModalImg(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [anyModalOpen]);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(fullCliCommand);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  const coreSkillsList: SkillDetails[] = [
    {
      id: 'core/crewloop-hub',
      name: 'CrewLoop Hub',
      role: 'Context & Routing',
      desc: 'Analyzes initial context, gathers requirements, and routes workflow tasks between specialist agents.',
      cannotDo: ['Writes code', 'Designs systems', 'Creates files', 'Git operations']
    },
    {
      id: 'core/architect',
      name: 'Architect',
      role: 'Specs & Contracts',
      desc: 'Creates system specs and task lists in specs/changes/ before coding begins.',
      cannotDo: ['Writes implementation code', 'Runs git commands', 'Configures build scripts']
    },
    {
      id: 'core/designer',
      name: 'Designer',
      role: 'Visual UI/UX Specs',
      desc: 'Defines design tokens, responsive layouts, and visual visualizer models for UI components.',
      cannotDo: ['Writes functional code', 'Git operations', 'Runs database migrations']
    },
    {
      id: 'core/engineer',
      name: 'Engineer',
      role: 'Code Implementation',
      desc: 'Implements source code and unit tests. The only role permitted to modify codebase source files.',
      cannotDo: ['Git operations', 'Code reviews', 'Modifies system architecture']
    },
    {
      id: 'core/reviewer',
      name: 'Reviewer',
      role: 'Quality Assurance',
      desc: 'Audits spec compliance, runs local tests, and performs security checks for exposed credentials.',
      cannotDo: ['Writes implementation code', 'Runs git commands', 'Approves own code']
    },
    {
      id: 'core/shipper',
      name: 'Shipper',
      role: 'Git & PR Preparer',
      desc: 'Manages repository branches, pushes committed changes, and prepares pull requests following Conventional Commits.',
      cannotDo: ['Reviews code', 'Writes code', 'Alters spec files']
    }
  ];

  const supportingSkillsList: SkillDetails[] = [
    {
      id: 'supporting/project-brainstorm',
      name: 'Project Brainstorm',
      role: 'Product Discovery',
      desc: 'Aids in defining requirements for ambiguous or complex tasks before specifications are written.',
      cannotDo: ['Writes code', 'Git operations']
    },
    {
      id: 'supporting/long-term-manager',
      name: 'Long-term Manager',
      role: 'Progress Tracking',
      desc: 'Monitors long-term tasks across sessions and keeps progress checklists up-to-date.',
      cannotDo: ['Writes code', 'Git operations']
    },
    {
      id: 'supporting/docs-writer',
      name: 'Docs Writer',
      role: 'Documentation',
      desc: 'Writes and updates project READMEs, subsystem manuals, and API guides.',
      cannotDo: ['Modifies logic code', 'Alters spec files', 'Configures build scripts']
    },
    {
      id: 'supporting/tester',
      name: 'Tester',
      role: 'QA Verification',
      desc: 'Designs verification plans, analyzes test coverage, and logs edge cases.',
      cannotDo: ['Modifies source code', 'Runs git commands', 'Alters spec files']
    },
    {
      id: 'supporting/product-manager',
      name: 'Product Manager',
      role: 'Prioritization',
      desc: 'Aids in roadmap prioritization, user stories mapping, and setting delivery goals.',
      cannotDo: ['Modifies source code', 'Runs git commands', 'Executes tests']
    },
    {
      id: 'supporting/maintainer',
      name: 'Maintainer',
      role: 'Refactoring & Maintenance',
      desc: 'Triages bug reports, cleans up code debt, updates outdated packages, and refactors code.',
      cannotDo: ['Creates spec files', 'Approves own reviews', 'Runs git commits']
    },
    {
      id: 'supporting/researcher',
      name: 'Researcher',
      role: 'Tech Investigation',
      desc: 'Compares alternative frameworks and libraries, building quick proofs-of-concept.',
      cannotDo: ['Writes production code', 'Runs git commits', 'Opens Pull Requests']
    },
    {
      id: 'supporting/security-guard',
      name: 'Security Guard',
      role: 'Vulnerabilities',
      desc: 'Verifies auth rules, audits exposed endpoints, and checks dependency supply chain risk.',
      cannotDo: ['Writes code', 'Modifies git settings', 'Runs database migrations']
    },
    {
      id: 'supporting/accessibility-auditor',
      name: 'Accessibility Auditor',
      role: 'WCAG Compliance',
      desc: 'Audits layouts against WCAG guidelines, ensuring screen reader and keyboard nav support.',
      cannotDo: ['Writes backend code', 'Runs database migrations', 'Runs git commits']
    },
    {
      id: 'devops-specialist',
      name: 'DevOps Specialist',
      role: 'CI/CD Pipelines',
      desc: 'Manages Docker configurations, edits GitHub Actions workflows, and maintains deploy settings.',
      cannotDo: ['Writes application logic', 'Alters specs', 'Performs code reviews']
    },
    {
      id: 'frontend-architect',
      name: 'Frontend Architect',
      role: 'Component Composition',
      desc: 'Defines frontend component composition, slot structures, and hook patterns.',
      cannotDo: ['Writes backend code', 'Runs git commits', 'Approves PR reviews']
    },
    {
      id: 'schema-designer',
      name: 'Schema Designer',
      role: 'Database Schema',
      desc: 'Designs relational schemas, table constraints, and coordinates Prisma migrations.',
      cannotDo: ['Writes frontend logic', 'Configures builds', 'Runs git commits']
    }
  ];

  return (
    <div className="relative min-h-screen bg-base text-text-primary overflow-x-hidden pt-14 pb-24 font-mono">

      {/* Hero — asymmetrical: thesis left, install slab + live terminal right */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 text-left animate-fade-in">
          <span className="label">CrewLoop — standardized agent workflow</span>

          <h1 className="text-display-3xl font-display font-bold tracking-tight text-text-primary">
            Structured software <br />
            with AI agents.
          </h1>

          <p className="font-prose text-prose text-text-secondary max-w-xl">
            CrewLoop organizes AI agent execution into isolated roles — from requirements discovery to Pull Request — ensuring absolute predictability and control.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToDocs('getting-started/what-is-crewloop')}
              className="btn-primary w-full sm:w-auto justify-center"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToDocs('concepts/workflow')}
              className="btn-ghost w-full sm:w-auto justify-center border border-border-default"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore the docs</span>
            </button>
          </div>

          <div className="flex items-center gap-5 pt-3">
            <span className="label">Compatible agents</span>
            <div className="flex items-center gap-4">
              <img src="assets/images/claude-ai-icon.png" alt="Claude Code" className="w-7 h-7 object-contain opacity-80 hover:opacity-100 transition-opacity rounded-sm" title="Claude Code" />
              <img src="assets/images/kimi-icon.png" alt="Kimi Code" className="w-7 h-7 object-contain opacity-80 hover:opacity-100 transition-opacity rounded-sm" title="Kimi Code" />
              <img src="assets/images/antigravity-icon.png" alt="AGY" className="w-7 h-7 object-contain opacity-80 hover:opacity-100 transition-opacity rounded-sm" title="AGY" />
              <img src="assets/images/opencode-icon.png" alt="OpenCode" className="w-7 h-7 object-contain opacity-80 hover:opacity-100 transition-opacity rounded-sm" title="OpenCode" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
          {/* Install slab */}
          <div className="bg-inset border border-border-default rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
              <span className="label">Install</span>
              <button
                onClick={handleCopyInstall}
                className="btn-ghost !px-2 !py-1 text-label"
                aria-label={copied ? 'Copied' : 'Copy install command'}
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
            </div>
            <div
              onClick={handleCopyInstall}
              className="px-3 py-2.5 font-mono text-label text-text-secondary flex items-center cursor-pointer"
              title="Click to copy"
            >
              <span className="text-accent select-none mr-2">$</span>
              <span className="select-text break-all">{cliCommandText}</span>
              <span className="w-[1px] h-3.5 bg-accent ml-0.5 flex-shrink-0 animate-caret-blink" />
            </div>
          </div>

          <TerminalSimulator />
        </div>
      </section>

      {/* The loop — workflow visualizer */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border-default">
        <div className="mb-10">
          <span className="label">The loop</span>
          <h2 className="text-display-xl font-display font-bold text-text-primary mt-2 mb-3">Development Workflow</h2>
          <p className="font-prose text-prose text-text-secondary max-w-xl">
            Each phase operates under strict boundaries and returns control to the central CrewLoop Hub between steps.
          </p>
        </div>
        <SkillVisualizer />
      </section>

      {/* Skills directory */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border-default">
        <div className="mb-12">
          <span className="label">Skills directory</span>
          <h2 className="text-display-xl font-display font-bold text-text-primary mt-2 mb-3">Skills Directory</h2>
          <p className="font-prose text-prose text-text-secondary max-w-xl">
            The 18 specialized roles available to compose your development team. Click any card to inspect constraints.
          </p>
        </div>

        <div className="space-y-12">
          {/* Core pipeline — 2-col panels */}
          <div>
            <h3 className="label mb-6 flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              Core Sequential Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coreSkillsList.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => setSelectedSkillForModal(skill)}
                  className="panel panel-hoverable text-left cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-micro font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border text-accent-strong border-accent-dim bg-accent-subtle">
                      Core Flow
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-heading font-display font-semibold text-text-primary">
                    {skill.name}
                  </h4>
                  <p className="text-label font-mono text-text-muted mt-1 mb-2">{skill.role}</p>
                  <p className="text-label text-text-secondary leading-relaxed">
                    {skill.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-border-default text-micro font-mono text-text-muted">
                    Inspect limits &amp; constraints
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Supporting cast — dense 3-col compact grid */}
          <div>
            <h3 className="label mb-6 flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-running" aria-hidden="true" />
              Specialists &amp; Support Roles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {supportingSkillsList.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => setSelectedSkillForModal(skill)}
                  className="panel panel-hoverable !p-4 text-left cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-label font-display font-semibold text-text-primary">
                      {skill.name}
                    </h4>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-micro font-mono text-text-muted mt-1">{skill.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Observability — screenshots in hairline frames */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border-default space-y-24">
        <div className="max-w-2xl">
          <span className="label">Workspace observability</span>
          <h2 className="text-display-xl font-display font-bold text-text-primary mt-2 mb-3">Workspace Observability</h2>
          <p className="font-prose text-prose text-text-secondary">
            Monitor task progress and audit active session logs in real time through the local WebSocket console.
          </p>
        </div>

        {/* Row 1: image left, text right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <button
              onClick={() => setActiveModalImg({
                src: 'assets/screenshots/skill-active.png',
                title: 'Skill Activity Panel',
                desc: 'Displays execution duration, the active workspace scope, modified files, and raw stream outputs.'
              })}
              className="panel !p-0 overflow-hidden cursor-zoom-in block w-full group"
              aria-label="Zoom Skill Activity Panel screenshot"
            >
              <div className="aspect-video bg-inset overflow-hidden relative">
                <div className="absolute inset-0 w-full h-full bg-inset flex flex-col items-center justify-center p-8 text-center text-text-muted text-body">
                  Screenshot unavailable — run the dashboard locally to capture it.
                </div>
                <img
                  src="assets/screenshots/skill-active.png"
                  alt="Activity Dashboard"
                  className="relative w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </button>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <span className="text-micro font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border text-running border-running/30 bg-running/5 inline-block">
              Audit &amp; Logs
            </span>
            <h3 className="text-display-lg font-display font-bold text-text-primary">Activity Monitoring</h3>
            <p className="font-prose text-prose text-text-secondary">
              The dashboard displays output logs and changes made by the active skill. Developers can pause execution, inspect agent shell streams, and review tool calls in real time.
            </p>
          </div>
        </div>

        {/* Row 2: text left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
            <span className="text-micro font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border text-success border-success/30 bg-success/5 inline-block">
              Task Checklists
            </span>
            <h3 className="text-display-lg font-display font-bold text-text-primary">Specs Tracing</h3>
            <p className="font-prose text-prose text-text-secondary">
              CrewLoop enforces a spec-first cycle. The Architect documents specs in `specs/changes/` and the dashboard tracks checklist status, highlighting implemented and verified tasks.
            </p>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <button
              onClick={() => setActiveModalImg({
                src: 'assets/screenshots/dashboard-overview.png',
                title: 'Sessions Overview',
                desc: 'Historical session timelines, connected shims, and raw WebSocket connection telemetry.'
              })}
              className="panel !p-0 overflow-hidden cursor-zoom-in block w-full group"
              aria-label="Zoom Sessions Overview screenshot"
            >
              <div className="aspect-video bg-inset overflow-hidden relative">
                <img
                  src="assets/screenshots/dashboard-overview.png"
                  alt="Dashboard Overview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Comparison — split panels in status colors */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border-default">
        <div className="mb-12">
          <span className="label">Workflow comparison</span>
          <h2 className="text-display-xl font-display font-bold text-text-primary mt-2 mb-3">Workflow Comparison</h2>
          <p className="font-prose text-prose text-text-secondary max-w-xl">
            The difference between free execution and a structured workflow with role isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
          <div className="panel border-l-2 !border-l-error">
            <div className="flex items-center gap-3 mb-6 text-error">
              <ShieldWarning className="w-5 h-5" />
              <h4 className="text-heading font-display font-semibold">Standard AI Coding</h4>
            </div>
            <ul className="space-y-4 text-label text-text-secondary">
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-error flex-shrink-0 mt-0.5" weight="bold" />
                <span>Alters files immediately without technical specifications or task blueprints.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-error flex-shrink-0 mt-0.5" weight="bold" />
                <span>Modifies multiple directories without context boundaries, leading to compilation breakage.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-error flex-shrink-0 mt-0.5" weight="bold" />
                <span>Pushes untested changes directly to the remote repository.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-4 h-4 text-error flex-shrink-0 mt-0.5" weight="bold" />
                <span>Skips static verification and security analysis, risking credential leaks.</span>
              </li>
            </ul>
          </div>

          <div className="panel border-l-2 !border-l-success">
            <div className="flex items-center gap-3 mb-6 text-success">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-heading font-display font-semibold">CrewLoop Enforced Flow</h4>
            </div>
            <ul className="space-y-4 text-label text-text-secondary">
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" weight="bold" />
                <span>Requires task definitions and architecture specs before coding begins.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" weight="bold" />
                <span>Strict role isolation: Engineer codes, Reviewer audits, Shipper commits.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" weight="bold" />
                <span>Automatic formatting of branch structures and commits following Conventional Commits.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" weight="bold" />
                <span>Integrates local test sweeps and security scanning prior to PR creation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Metrics — one hairline strip, not separate cards */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border-default">
        <div className="mb-10">
          <span className="label">Efficiency metrics</span>
          <h2 className="text-display-xl font-display font-bold text-text-primary mt-2 mb-3">Efficiency Metrics</h2>
          <p className="font-prose text-prose text-text-secondary max-w-xl">
            Practical performance indicators achieved by enforcing the structured workflow.
          </p>
        </div>

        <div className="panel !p-0 grid grid-cols-1 md:grid-cols-3 max-w-5xl">
          <div className="p-6 border-b md:border-b-0 md:border-r border-border-default space-y-3">
            <div className="font-display font-bold text-display-xl text-text-primary tabular">-94%</div>
            <div className="label">Compilation Failures</div>
            <p className="text-prose-sm font-prose text-text-secondary">
              "Mandatory quality gates verify syntax checks and linting before code leaves the local workspace."
            </p>
          </div>
          <div className="p-6 border-b md:border-b-0 md:border-r border-border-default space-y-3">
            <div className="font-display font-bold text-display-xl text-text-primary tabular">100%</div>
            <div className="label">Specs Traceability</div>
            <p className="text-prose-sm font-prose text-text-secondary">
              "No code modifications are written without an associated task checklist and spec file in specs/changes/."
            </p>
          </div>
          <div className="p-6 space-y-3">
            <div className="font-display font-bold text-display-xl text-text-primary tabular">12k+</div>
            <div className="label">Sessions Ran</div>
            <p className="text-prose-sm font-prose text-text-secondary">
              "Enforcing stable code additions and PR releases automatically across multiple scale repositories."
            </p>
          </div>
        </div>
      </section>

      {/* Skill details modal */}
      {selectedSkillForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-sheet-scrim-in"
          style={{ background: 'var(--overlay)' }}
          onClick={() => setSelectedSkillForModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedSkillForModal.name}
            tabIndex={-1}
            ref={(el) => el?.focus()}
            className="relative max-w-lg w-full bg-surface border border-border-default rounded-xl overflow-hidden shadow-modal animate-modal-in focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-heading">{selectedSkillForModal.name}</h3>
                <span className="text-micro font-mono text-accent uppercase tracking-wider mt-0.5 inline-block">
                  {selectedSkillForModal.role}
                </span>
              </div>
              <button
                onClick={() => setSelectedSkillForModal(null)}
                aria-label="Close skill details"
                className="btn-ghost !p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h5 className="label mb-1.5">Role Description</h5>
                <p className="font-prose text-prose-sm text-text-secondary">{selectedSkillForModal.desc}</p>
              </div>

              <div className="bg-inset border border-border-default rounded-lg p-5">
                <h5 className="text-micro font-semibold uppercase tracking-wider text-error flex items-center mb-3.5">
                  <Warning className="w-4 h-4 mr-2" />
                  Constraints: never does
                </h5>
                <ul className="space-y-2.5">
                  {selectedSkillForModal.cannotDo.map((item, idx) => (
                    <li key={idx} className="text-label text-text-secondary flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 flex-shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-default flex items-center justify-end gap-2">
              {AVAILABLE_DOC_IDS.has(selectedSkillForModal.id) && (
                <button
                  onClick={() => {
                    setSelectedSkillForModal(null);
                    onNavigateToDocs(selectedSkillForModal.id);
                  }}
                  className="btn-ghost text-label text-accent-strong border border-accent-dim hover:bg-accent-subtle"
                >
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setSelectedSkillForModal(null)}
                className="btn-ghost text-label border border-border-default"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot zoom modal */}
      {activeModalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-sheet-scrim-in"
          style={{ background: 'var(--overlay)' }}
          onClick={() => setActiveModalImg(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeModalImg.title}
            tabIndex={-1}
            ref={(el) => el?.focus()}
            className="relative max-w-5xl w-full bg-surface border border-border-default rounded-xl overflow-hidden shadow-modal animate-modal-in focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
              <h3 className="font-display font-semibold text-text-primary text-heading">{activeModalImg.title}</h3>
              <button
                onClick={() => setActiveModalImg(null)}
                aria-label="Close screenshot"
                className="btn-ghost !p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-inset aspect-video flex items-center justify-center">
              <img
                src={activeModalImg.src}
                alt={activeModalImg.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 border-t border-border-default">
              <p className="font-prose text-prose-sm text-text-secondary">{activeModalImg.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
