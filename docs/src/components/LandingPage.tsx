import React, { useState, useEffect } from 'react';
import { SkillVisualizer } from './SkillVisualizer';
import { TerminalSimulator } from './TerminalSimulator';
import { 
  ArrowRight, 
  Sparkle,
  X,
  Check,
  Copy,
  ShieldWarning,
  Warning,
  Terminal,
  GitFork,
  ShieldCheck,
  BookOpen
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

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDocs }) => {
  const [copied, setCopied] = useState(false);
  const [activeModalImg, setActiveModalImg] = useState<{ src: string; title: string; desc: string } | null>(null);
  const [selectedSkillForModal, setSelectedSkillForModal] = useState<SkillDetails | null>(null);
  const [cliCommandText, setCliCommandText] = useState('');
  const fullCliCommand = 'npm i -g @archznn/crewloop-cli && crewloop install';

  // Dynamic typewriter for the installation command widget
  useEffect(() => {
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

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(fullCliCommand);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1800);
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
    <div className="relative min-h-screen bg-black text-text-primary overflow-x-hidden pt-16 pb-24 font-sans select-none">
      {/* Background drift glow spots */}
      <div className="absolute top-[-5%] left-[-15%] w-[60%] aspect-square rounded-full bg-cyan-950/15 blur-[120px] pointer-events-none animate-glow-drift" style={{ animationDuration: '22s' }} />
      <div className="absolute top-[28%] right-[-15%] w-[55%] aspect-square rounded-full bg-emerald-950/10 blur-[130px] pointer-events-none animate-glow-drift" style={{ animationDuration: '28s', animationDelay: '-5s' }} />
      <div className="absolute bottom-[20%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-950/10 blur-[140px] pointer-events-none animate-glow-drift" style={{ animationDuration: '32s', animationDelay: '-12s' }} />

      {/* Hero Split Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Branding Description & CTAs */}
        <div className="lg:col-span-6 space-y-6 text-left animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 text-xs font-mono font-bold tracking-wider">
            <Sparkle className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>STANDARDIZED AGENT WORKFLOW FOR ELITE DEVELOPERS</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-extrabold tracking-tight text-white leading-[1.08] font-display">
            Structured software <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-xl">
              with AI agents.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            CrewLoop organizes AI agent execution into isolated roles — from requirements discovery to Pull Request — ensuring absolute predictability and control.
          </p>

          {/* Quick CLI typing installer widget */}
          <div className="max-w-md">
            <div 
              onClick={handleCopyInstall}
              className="group relative bg-neutral-950/90 border border-neutral-800 hover:border-cyan-500/40 rounded-xl px-4 py-3 font-mono text-[12px] flex items-center justify-between text-slate-300 cursor-pointer shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <span className="text-cyan-500 font-bold select-none">$</span>
                <span className="select-text">{cliCommandText}</span>
                <span className="w-1.5 h-3.5 bg-cyan-500 ml-0.5 animate-pulse" />
              </div>
              <div className="text-slate-550 group-hover:text-slate-300 transition-colors pl-4 select-none">
                {copied ? (
                  <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </span>
                ) : (
                  <Copy className="w-4.5 h-4.5" />
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button 
              onClick={() => onNavigateToDocs('getting-started/what-is-crewloop')}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-98 transition-all text-neutral-950 font-bold font-mono rounded-xl flex items-center justify-center space-x-2 group shadow-xl shadow-cyan-500/10"
            >
              <span>GET STARTED</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigateToDocs('concepts/workflow')}
              className="w-full sm:w-auto px-7 py-3.5 bg-neutral-950 border border-neutral-800 hover:border-slate-700 hover:bg-neutral-900 text-slate-200 font-bold font-mono rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-4.5 h-4.5 text-slate-400" />
              <span>EXPLORE THE DOCS</span>
            </button>
          </div>

          {/* Compatible AI logo agents bar */}
          <div className="flex items-center gap-5 pt-3 text-slate-500 text-[11px] font-mono select-none">
            <span className="text-[9px] text-slate-600 tracking-wider font-bold">COMPATIBLE AGENTS:</span>
            <div className="flex items-center gap-5">
              <img src="assets/images/claude-ai-icon.png" alt="Claude AI" className="w-8 h-8 object-contain hover:scale-115 hover:brightness-125 transition-all cursor-pointer rounded-sm" title="Claude Code" />
              <img src="assets/images/kimi-icon.png" alt="Kimi" className="w-8 h-8 object-contain hover:scale-115 hover:brightness-125 transition-all cursor-pointer rounded-sm" title="Kimi Code" />
              <img src="assets/images/antigravity-icon.png" alt="AGY" className="w-8 h-8 object-contain hover:scale-115 hover:brightness-125 transition-all cursor-pointer rounded-sm" title="AGY" />
              <img src="assets/images/opencode-icon.png" alt="OpenCode" className="w-8 h-8 object-contain hover:scale-115 hover:brightness-125 transition-all cursor-pointer rounded-sm" title="OpenCode" />
            </div>
          </div>
        </div>

        {/* Right: Live Terminal Simulation window */}
        <div className="lg:col-span-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <TerminalSimulator />
        </div>
      </section>

      {/* Stepper section */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3.5xl font-bold font-display text-white mb-3">Development Workflow</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Each phase operates under strict boundaries and returns control to the central CrewLoop Hub between steps.
          </p>
        </div>
        <SkillVisualizer />
      </section>

      {/* Bento-grid catalog list directory of 18 skills */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-neutral-900/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">Skills Directory</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            The 18 specialized roles available to compose your development team. Click any card to inspect constraints.
          </p>
        </div>

        <div className="space-y-12">
          {/* Core pipeline flow grid */}
          <div>
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2.5 animate-pulse" />
              Core Sequential Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coreSkillsList.map((skill) => (
                <div 
                  key={skill.id}
                  onClick={() => setSelectedSkillForModal(skill)}
                  className="glass-card-interactive p-6 rounded-xl border border-neutral-850 hover:border-cyan-500/30 cursor-pointer hover-spring-physics flex flex-col justify-between h-full group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/30 text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        Core Flow
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
                      {skill.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {skill.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-900/60 text-[10.5px] font-mono text-slate-500">
                    Inspect Limits & Constraints
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialist advisors catalog grid */}
          <div>
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2.5 animate-pulse" />
              Specialists & Support Roles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {supportingSkillsList.map((skill) => (
                <div 
                  key={skill.id}
                  onClick={() => setSelectedSkillForModal(skill)}
                  className="glass-card-interactive p-5 rounded-xl border border-neutral-850 hover:border-emerald-500/20 cursor-pointer hover-spring-physics flex flex-col justify-between h-full group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/30 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        Specialist
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-base font-bold font-display text-white group-hover:text-emerald-300 transition-colors">
                      {skill.name}
                    </h4>
                    <p className="text-xs text-slate-450 line-clamp-3 leading-relaxed">
                      {skill.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-neutral-900/60 text-[10px] font-mono text-slate-500">
                    Inspect Limits
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Observability Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-neutral-900/50 space-y-28">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">Workspace Observability</h2>
          <p className="text-slate-450 text-sm md:text-base">
            Monitor task progress and audit active session logs in real time through the local WebSocket console.
          </p>
        </div>

        {/* Row 1: Image Left, Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div 
              onClick={() => setActiveModalImg({
                src: 'assets/screenshots/skill-active.png',
                title: 'Skill Activity Panel',
                desc: 'Displays execution duration, the active workspace scope, modified files, and raw stream outputs.'
              })}
              className="group glass-card-3d rounded-2xl overflow-hidden border border-neutral-800/40 shadow-[0_20px_50px_rgba(6,182,212,0.05)] cursor-zoom-in hover:border-cyan-500/40 transition-all duration-300"
            >
              <div className="aspect-video bg-black overflow-hidden relative">
                <img 
                  src="assets/screenshots/skill-active.png" 
                  alt="Activity Dashboard" 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback visual block if screenshot is missing */}
                <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Terminal className="w-12 h-12 text-cyan-500 mb-3 animate-pulse" />
                  <span className="font-mono text-xs text-slate-400">Real-time log stream mockup</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              Audit & Logs
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-white">Activity Monitoring</h3>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              The dashboard displays output logs and changes made by the active skill. Developers can pause execution, inspect agent shell streams, and review tool calls in real time.
            </p>
          </div>
        </div>

        {/* Row 2: Text Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              Task Checklists
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-white">Specs Tracing</h3>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              CrewLoop enforces a spec-first cycle. The Architect documents specs in `specs/changes/` and the dashboard tracks checklist status, highlighting implemented and verified tasks.
            </p>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div 
              onClick={() => setActiveModalImg({
                src: 'assets/screenshots/dashboard-overview.png',
                title: 'Sessions Overview',
                desc: 'Historical session timelines, connected shims, and raw WebSocket connection telemetry.'
              })}
              className="group glass-card-3d rounded-2xl overflow-hidden border border-neutral-800/40 shadow-[0_20px_50px_rgba(16,185,129,0.05)] cursor-zoom-in hover:border-emerald-500/40 transition-all duration-300"
            >
              <div className="aspect-video bg-black overflow-hidden relative">
                <img 
                  src="assets/screenshots/dashboard-overview.png" 
                  alt="Dashboard Overview" 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <GitFork className="w-12 h-12 text-emerald-400 mb-3 animate-pulse" />
                  <span className="font-mono text-xs text-slate-400">Session management console mockup</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid Section: Traditional vs CrewLoop */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-neutral-900/50">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3.5xl font-bold font-display text-white mb-3">Workflow Comparison</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            The difference between free execution and a structured workflow with role isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Traditional AI panel */}
          <div className="glass-card rounded-2xl p-7 border border-red-950/30 bg-gradient-to-b from-[#140505]/40 to-transparent hover:border-red-900/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6 text-red-400 font-display font-bold">
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/30 shadow-inner">
                <ShieldWarning className="w-5 h-5" />
              </div>
              <h4 className="text-xl">Standard AI Coding</h4>
            </div>
            <ul className="space-y-4 text-[13px] text-slate-400">
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-base select-none">✕</span>
                <span>Alters files immediately without technical specifications or task blueprints.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-base select-none">✕</span>
                <span>Modifies multiple directories without context boundaries, leading to compilation breakage.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-base select-none">✕</span>
                <span>Pushes untested changes directly to the remote repository.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-base select-none">✕</span>
                <span>Skips static verification and security analysis, risking credential leaks.</span>
              </li>
            </ul>
          </div>

          {/* CrewLoop panel */}
          <div className="glass-card rounded-2xl p-7 border border-emerald-950/30 bg-gradient-to-b from-[#05140e]/40 to-transparent hover:border-emerald-900/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6 text-emerald-400 font-display font-bold">
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/30 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-xl">CrewLoop Enforced Flow</h4>
            </div>
            <ul className="space-y-4 text-[13px] text-slate-350">
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 font-bold text-base select-none">✓</span>
                <span>Requires task definitions and architecture specs before coding begins.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 font-bold text-base select-none">✓</span>
                <span>Strict role isolation: Engineer codes, Reviewer audits, Shipper commits.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 font-bold text-base select-none">✓</span>
                <span>Automatic formatting of branch structures and commits following Conventional Commits.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 font-bold text-base select-none">✓</span>
                <span>Integrates local test sweeps and security scanning prior to PR creation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 z-10 relative border-t border-neutral-900/50">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3.5xl font-bold font-display text-white mb-3">Efficiency Metrics</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Practical performance indicators achieved by enforcing the structured workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="glass-card-3d p-6 rounded-xl border border-neutral-850 hover-spring-physics flex flex-col justify-between space-y-4">
            <div className="text-cyan-400 font-display font-extrabold text-4xl leading-none">
              -94%
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Compilation Failures
              </div>
              <p className="text-xs text-slate-555 italic leading-relaxed">
                "Mandatory quality gates verify syntax checks and linting before code leaves the local workspace."
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card-3d p-6 rounded-xl border border-neutral-850 hover-spring-physics flex flex-col justify-between space-y-4">
            <div className="text-teal-400 font-display font-extrabold text-4xl leading-none">
              100%
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Specs Traceability
              </div>
              <p className="text-xs text-slate-555 italic leading-relaxed">
                "No code modifications are written without an associated task checklist and spec file in specs/changes/."
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card-3d p-6 rounded-xl border border-neutral-850 hover-spring-physics flex flex-col justify-between space-y-4">
            <div className="text-emerald-400 font-display font-extrabold text-4xl leading-none">
              12k+
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sessions Ran
              </div>
              <p className="text-xs text-slate-555 italic leading-relaxed">
                "Enforcing stable code additions and PR releases automatically across multiple scale repositories."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skill details popup modal */}
      {selectedSkillForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up">
          <div className="relative max-w-lg w-full bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-black">
              <div>
                <h3 className="font-display font-bold text-slate-100 text-lg">{selectedSkillForModal.name}</h3>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mt-0.5 inline-block">
                  {selectedSkillForModal.role}
                </span>
              </div>
              <button 
                onClick={() => setSelectedSkillForModal(null)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 bg-neutral-950/40">
              <div>
                <h5 className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider mb-1.5">Role Description</h5>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{selectedSkillForModal.desc}</p>
              </div>

              <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5">
                <h5 className="text-[10px] font-mono font-bold text-rose-400 flex items-center mb-3.5 tracking-wider">
                  <Warning className="w-4 h-4 mr-2 text-rose-400" />
                  CONSTRAINTS: NEVER DOES
                </h5>
                <ul className="space-y-2.5">
                  {selectedSkillForModal.cannotDo.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex items-start space-x-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500/90 animate-pulse mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-neutral-900 bg-neutral-950 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedSkillForModal(null);
                  onNavigateToDocs(selectedSkillForModal.id);
                }}
                className="px-4 py-2 border border-neutral-850 hover:border-cyan-500/50 hover:bg-cyan-950/10 text-xs font-mono text-cyan-400 rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setSelectedSkillForModal(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-slate-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal screenshot image zoom */}
      {activeModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up">
          <div className="relative max-w-5xl w-full bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-black">
              <h3 className="font-display font-bold text-slate-100 text-lg">{activeModalImg.title}</h3>
              <button 
                onClick={() => setActiveModalImg(null)}
                className="p-1 rounded-full hover:bg-neutral-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black aspect-video flex items-center justify-center">
              <img 
                src={activeModalImg.src} 
                alt={activeModalImg.title} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 border-t border-neutral-900 bg-neutral-950">
              <p className="text-sm text-slate-300 leading-relaxed">{activeModalImg.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
