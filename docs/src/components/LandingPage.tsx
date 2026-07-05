import React, { useState } from 'react';
import { SkillVisualizer } from './SkillVisualizer';
import { 
  ArrowRight, 
  Sparkle,
  X,
  Check,
  Copy,
  ShieldWarning,
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

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDocs }) => {
  const [copied, setCopied] = useState(false);
  const [activeModalImg, setActiveModalImg] = useState<{ src: string; title: string; desc: string } | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('orchestrator');

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('npm i -g @archznn/crewloop-cli && crewloop install');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };


  const coreSkillsList: SkillDetails[] = [
    { 
      id: 'core/orchestrator', 
      name: 'Orchestrator', 
      role: 'Discovery & Routing Hub',
      desc: 'Context discovery, requirement gathering, and overall process routing. Serves as the central hub connecting all execution phases.',
      cannotDo: ['Writes code', 'Designs systems', 'Creates files', 'Git operations']
    },
    { 
      id: 'core/architect', 
      name: 'Architect', 
      role: 'Specs & Contracts Creator',
      desc: 'Authors strict specification files in specs/changes/ for every system adjustment. Resolves API schemas and database contracts.',
      cannotDo: ['Writes implementation code', 'Runs git', 'Configures build scripts']
    },
    { 
      id: 'core/designer', 
      name: 'Designer', 
      role: 'UI/UX Visual Architect',
      desc: 'Formulates visual design tokens, responsive layouts, motion specification directives, and interactive components layout structures.',
      cannotDo: ['Writes code', 'Git operations', 'Runs database migrations']
    },
    { 
      id: 'core/engineer', 
      name: 'Engineer', 
      role: 'Code Implementation specialist',
      desc: 'Only role permitted to write implementation code. Runs local test suites and code build compilation checks.',
      cannotDo: ['Git operations', 'Code review', 'Architectural redesigns']
    },
    { 
      id: 'core/reviewer', 
      name: 'Reviewer', 
      role: 'Quality Gate Auditor',
      desc: 'Runs static code reviews, checks specs compliance, conducts security scans, and audits codebase for secrets leakage.',
      cannotDo: ['Writes code', 'Runs git operations', 'Approves own code']
    },
    { 
      id: 'core/shipper', 
      name: 'Shipper', 
      role: 'Git tag & PR Preparer',
      desc: 'Sole role authorized to perform git commits, push branches, and create pull requests using conventional formats.',
      cannotDo: ['Reviews code', 'Writes code', 'Alters spec files']
    }
  ];

  const supportingSkillsList: SkillDetails[] = [
    { 
      id: 'supporting/project-brainstorm', 
      name: 'Project Brainstorm', 
      role: 'Product discovery advisor',
      desc: 'Handles complex or ambiguous requirements prior to spec creation, asking interactive discovery questions.',
      cannotDo: ['Writes implementation code', 'Runs git operations']
    },
    { 
      id: 'supporting/long-term-manager', 
      name: 'Long-term Manager', 
      role: 'Progress log keeper',
      desc: 'Tracks session goals and records development progress checklist structures across multiple sessions.',
      cannotDo: ['Writes implementation code', 'Runs git operations']
    },
    { 
      id: 'supporting/docs-writer', 
      name: 'Docs Writer', 
      role: 'Developer guides author',
      desc: 'Writes clean READMEs, subsystem descriptions, API references, and conceptual documentation changes.',
      cannotDo: ['Modifies logic code', 'Alters spec files', 'Configures builds']
    },
    { 
      id: 'supporting/tester', 
      name: 'Tester', 
      role: 'QA & Verification strategist',
      desc: 'Audits testing strategies, formulates QA verification checklists, checks test coverage ratios, and outlines edge cases.',
      cannotDo: ['Modifies source code', 'Runs git commits', 'Changes spec files']
    },
    { 
      id: 'supporting/product-manager', 
      name: 'Product Manager', 
      role: 'Roadmap scoping specialist',
      desc: 'Assists with project prioritizations, scoping roadmaps, mapping stories, and aligning success metrics.',
      cannotDo: ['Modifies source code', 'Runs git commits', 'Runs tests']
    },
    { 
      id: 'supporting/maintainer', 
      name: 'Maintainer', 
      role: 'Bug triage & Upkeep supervisor',
      desc: 'Triages issues, refactors legacy code patterns, cleans technical debt, and handles dependencies updates.',
      cannotDo: ['Creates specs', 'Handles PR rules', 'Approves own reviews']
    },
    { 
      id: 'supporting/researcher', 
      name: 'Researcher', 
      role: 'Technology options evaluator',
      desc: 'Evaluates new libraries or tech alternatives, compares framework constraints, and writes proofs-of-concept.',
      cannotDo: ['Writes production code', 'Commits changes', 'Opens PRs']
    },
    { 
      id: 'supporting/security-guard', 
      name: 'Security Guard', 
      role: 'Vulnerability scan auditor',
      desc: 'Conducts authorization rules verification, scans dependency risk factors, and audits exposed endpoints.',
      cannotDo: ['Writes code', 'Modifies git configuration', 'Runs migrations']
    },
    { 
      id: 'supporting/accessibility-auditor', 
      name: 'Accessibility Auditor', 
      role: 'WCAG compliance inspector',
      desc: 'Audits layouts for accessibility standards, screen readers, semantic tags, and keyboard navigation.',
      cannotDo: ['Writes backend code', 'Runs database migrations', 'Runs commits']
    },
    { 
      id: 'devops-specialist', 
      name: 'DevOps Specialist', 
      role: 'CI/CD Pipeline engineer',
      desc: 'Configures docker container settings, updates GitHub Actions pipelines, and adjusts server configurations.',
      cannotDo: ['Writes application logic', 'Modifies spec files', 'Performs code reviews']
    },
    { 
      id: 'frontend-architect', 
      name: 'Frontend Architect', 
      role: 'Component structure advisor',
      desc: 'Specs Next.js design compositions, slot elements models, and component custom hooks structures.',
      cannotDo: ['Writes backend code', 'Runs git operations', 'Handles PR reviews']
    },
    { 
      id: 'schema-designer', 
      name: 'Schema Designer', 
      role: 'Relational database architect',
      desc: 'Designs SQL schema layouts, relational constraints diagrams, and coordinates Prisma database migrations.',
      cannotDo: ['Writes frontend layout', 'Configures builds', 'Runs commits']
    }
  ];

  const allSkills = [...coreSkillsList, ...supportingSkillsList];
  const selectedSkill = allSkills.find(s => s.id === selectedSkillId) || allSkills[0];

  return (
    <div className="relative min-h-screen bg-black text-text-primary overflow-x-hidden pt-16 pb-24">
      {/* Background cyan/emerald glows */}
      <div className="absolute top-[-5%] left-[-15%] w-[60%] aspect-square rounded-full bg-cyan-900/5 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[25%] right-[-15%] w-[55%] aspect-square rounded-full bg-emerald-900/5 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute bottom-[10%] left-[10%] w-[50%] aspect-square rounded-full bg-teal-900/5 blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 text-center pt-20 pb-12 z-10 animate-fade-in-up">
        {/* Animated Pill Header */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs font-mono mb-8">
          <Sparkle className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>THE AUTONOMOUS DEV CREW FOR ELITE TEAMS</span>
        </div>
        
        {/* Gaming style Gradient Display Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7.5xl font-extrabold font-display tracking-tight text-white mb-6 leading-[1.05] max-w-5xl mx-auto">
          Your software team <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-xl">on autopilot.</span>
        </h1>
        
        {/* Description */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop writing boilerplate. CrewLoop orchestrates a team of specialized AI agents — from requirement discovery to pull request — to execute your specs with absolute predictability.
        </p>

        {/* Dynamic CLI Installer Copy Widget */}
        <div className="max-w-md mx-auto mb-6">
          <div 
            onClick={handleCopyInstall}
            className="group relative bg-neutral-950 border border-neutral-800/80 hover:border-cyan-500/45 rounded-xl px-5 py-3.5 font-mono text-xs flex items-center justify-between text-slate-300 cursor-pointer shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-cyan-500 select-none">$</span>
              <span>npm i -g @archznn/crewloop-cli && crewloop install</span>
            </div>
            <div className="text-slate-500 group-hover:text-slate-300 transition-colors pl-4">
              {copied ? (
                <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Compatible IDEs / Agent Clients bar */}
        <div className="flex items-center justify-center gap-6 mt-4 mb-10 text-slate-500 text-[11px] font-mono select-none">
          <span className="text-[9px] text-slate-600 tracking-wider mr-2">COMPATIBLE AGENTS:</span>
          <img src="assets/images/claude-ai-icon.png" alt="Claude AI" className="w-8 h-8 object-contain hover:scale-115 hover:brightness-125 transition-all cursor-pointer rounded-sm" title="Claude Code" />
          <img src="assets/images/kimi-icon.png" alt="Kimi" className="w-8 h-8 object-contain hover:scale-115 hover:brightness-125 transition-all cursor-pointer rounded-sm" title="Kimi Code" />
          <img src="assets/images/antigravity-icon.png" alt="AGY" className="w-8 h-8 object-contain hover:scale-115 hover:brightness-125 transition-all cursor-pointer rounded-sm" title="AGY" />
          <img src="assets/images/opencode-icon.png" alt="OpenCode" className="w-8 h-8 object-contain hover:scale-115 hover:brightness-125 transition-all cursor-pointer rounded-sm" title="OpenCode" />
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <button 
            onClick={() => onNavigateToDocs('getting-started/what-is-crewloop')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-95 transition-all text-white font-medium rounded-xl flex items-center justify-center space-x-2 group shadow-xl shadow-cyan-500/10"
          >
            <span>Deploy Your Crew</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onNavigateToDocs('concepts/workflow')}
            className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900/60 border border-neutral-800/80 hover:border-slate-700/80 hover:bg-neutral-850 text-slate-200 font-medium rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore the Docs</span>
          </button>
        </div>
      </section>

      {/* Interactive Skill Visualizer Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold font-display text-white mb-3">The Handoff Architecture</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Skills cooperate by returning control to the central Orchestrator between phases. Click nodes below to inspect.
          </p>
        </div>
        <SkillVisualizer />
      </section>

      {/* Alternating Feature Showcase Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-neutral-900/50 space-y-32">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">Sleek Web-Console Observability</h2>
          <p className="text-slate-400 text-sm md:text-base">
            Track and audit your automated agent workflow via real-time WebSocket dashboard sync and localized execution screens.
          </p>
        </div>

        {/* Alternate Row 1: Image Left, Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div 
              onClick={() => setActiveModalImg({
                src: '/assets/screenshots/skill-active.png',
                title: 'Active Skill Real-Time Screen',
                desc: 'A dedicated panel displaying hooks metrics, active workspace, files changed count, and CLI log streams.'
              })}
              className="group glass-card rounded-2xl overflow-hidden border border-neutral-800/40 shadow-[0_20px_50px_rgba(6,182,212,0.05)] cursor-zoom-in hover:border-cyan-500/40 transition-all duration-300"
            >
              <div className="aspect-video bg-black overflow-hidden relative">
                <img 
                  src="/assets/screenshots/skill-active.png" 
                  alt="Active Skill Dashboard" 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              Step 01 - Context Discovery
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-white">Focused Workspace Details</h3>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              When a specific agent skill is triggered, the dashboard focuses automatically on its context scope. See active files list, count metrics, changed lines telemetry, and raw execution logs streams updating in real-time.
            </p>
          </div>
        </div>

        {/* Alternate Row 2: Text Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              Step 02 - Spec Blueprint
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-white">Rigorous Task Checklists</h3>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              CrewLoop mandates a specifications-first workflow. Before any code is changed, the Architect writes design specifications and checklists in `specs/changes/`. The dashboard imports these checklist files, giving you a live trace of what tasks are left.
            </p>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div 
              onClick={() => setActiveModalImg({
                src: '/assets/screenshots/dashboard-overview.png',
                title: 'Dashboard Overview Session Console',
                desc: 'WebSocket event telemetry displaying connection timelines, historical active sessions, and event streams.'
              })}
              className="group glass-card rounded-2xl overflow-hidden border border-neutral-800/40 shadow-[0_20px_50px_rgba(16,185,129,0.05)] cursor-zoom-in hover:border-emerald-500/40 transition-all duration-300"
            >
              <div className="aspect-video bg-black overflow-hidden relative">
                <img 
                  src="/assets/screenshots/dashboard-overview.png" 
                  alt="Dashboard Overview" 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sidebar Skills Catalog Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-neutral-900/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">The Skills Directory</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Interact with the catalog to explore responsibilities, strict operational constraints, and markdown documentation files.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Sidebar Selection */}
          <div className="lg:col-span-4 glass-card rounded-2xl p-5 border border-neutral-850/60 flex flex-col justify-between max-h-[520px] overflow-y-auto">
            <div className="space-y-6">
              {/* Category Core */}
              <div>
                <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2 animate-pulse" />
                  Core Flow Skills
                </h4>
                <div className="space-y-1">
                  {coreSkillsList.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkillId(skill.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-mono font-medium flex items-center justify-between transition-all ${
                        selectedSkillId === skill.id 
                          ? 'bg-[#121117] border-l-2 border-cyan-500 text-cyan-400 pl-4' 
                          : 'hover:bg-neutral-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{skill.name}</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${selectedSkillId === skill.id ? 'translate-x-0.5 text-cyan-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Supporting */}
              <div>
                <h4 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  Specialist Advisors
                </h4>
                <div className="space-y-1">
                  {supportingSkillsList.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkillId(skill.id)}
                      className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-mono font-medium flex items-center justify-between transition-all ${
                        selectedSkillId === skill.id 
                          ? 'bg-[#121117] border-l-2 border-emerald-500 text-emerald-400 pl-4' 
                          : 'hover:bg-neutral-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{skill.name}</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${selectedSkillId === skill.id ? 'translate-x-0.5 text-emerald-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Details Panel */}
          <div className="lg:col-span-8 glass-card rounded-2xl p-8 border border-neutral-850/60 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-900">
                <div>
                  <h3 className="text-2xl font-bold font-display text-slate-100">{selectedSkill.name}</h3>
                  <p className="text-xs font-mono text-cyan-400 mt-1">{selectedSkill.role}</p>
                </div>
                <button
                  onClick={() => onNavigateToDocs(selectedSkill.id)}
                  className="px-4 py-2 border border-neutral-800 hover:border-cyan-500/50 hover:bg-cyan-950/10 text-xs font-mono text-cyan-400 rounded-lg transition-colors flex items-center justify-center space-x-1.5 self-start"
                >
                  <span>Read Skill Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description */}
              <div>
                <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h5>
                <p className="text-slate-300 text-sm leading-relaxed">{selectedSkill.desc}</p>
              </div>

              {/* Constraints */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5">
                <h5 className="text-xs font-mono font-bold text-rose-400 flex items-center mb-3">
                  <Warning className="w-4 h-4 mr-1.5 text-rose-400" />
                  CONSTRAINTS: WHAT IT NEVER DOES
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedSkill.cannotDo.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 text-[11px] font-mono text-slate-500 border-t border-neutral-900 pt-4 flex items-center justify-between">
              <span>Select any core flow or advisor skill on the left sidebar to swap specs details.</span>
              <Sparkle className="w-4 h-4 text-cyan-500/40 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Zero-Config Integration (crewloop.config.yaml preview) */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-neutral-900/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-teal-950/20 border border-teal-800/30 text-teal-400 text-xs font-mono font-bold uppercase tracking-wider">
              Configuration
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-white">Simple YAML Control</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              CrewLoop is configured via a simple `.crewloop.yaml` file in your repository root. Enable AFK mode for fully autonomous pipelines, select specific specialist skills, or target custom workspace directories.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="glass-card rounded-2xl border border-neutral-850/60 overflow-hidden font-mono text-xs text-slate-300">
              <div className="bg-neutral-950 px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-[10px] text-slate-500">
                <span>.crewloop.yaml</span>
                <span className="text-cyan-500">YAML Config</span>
              </div>
              <div className="p-5 bg-neutral-950/40 space-y-1 text-slate-300 select-text leading-relaxed">
                <div><span className="text-cyan-400"># CrewLoop Workspace settings</span></div>
                <div><span className="text-pink-400">afk</span>: <span className="text-emerald-400">true</span> <span className="text-slate-650"># Enable autonomous skill handoffs</span></div>
                <div><span className="text-pink-400">agent</span>: <span className="text-emerald-400">"claude"</span> <span className="text-slate-650"># Active hook architecture target</span></div>
                <div><span className="text-pink-400">workspace</span>: <span className="text-emerald-400">"./src"</span></div>
                <div className="pt-2"><span className="text-pink-400">skills</span>:</div>
                <div>  - <span className="text-emerald-400">"orchestrator"</span></div>
                <div>  - <span className="text-emerald-400">"architect"</span></div>
                <div>  - <span className="text-emerald-400">"engineer"</span></div>
                <div>  - <span className="text-emerald-400">"reviewer"</span></div>
                <div>  - <span className="text-emerald-400">"shipper"</span></div>
                <div className="pt-2"><span className="text-pink-400">advisors</span>:</div>
                <div>  - <span className="text-emerald-400">"tester"</span></div>
                <div>  - <span className="text-emerald-400">"security-guard"</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why CrewLoop comparative section */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-neutral-900/50">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold font-display text-white mb-3">Why CrewLoop?</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Traditional AI agents operate without a structured process. CrewLoop enforces a rigorous flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Traditional AI */}
          <div className="bg-[#140505]/40 border border-red-950/20 rounded-2xl p-6">
            <div className="flex items-center space-x-2.5 mb-4 text-red-400 font-display font-bold">
              <ShieldWarning className="w-5 h-5 text-red-400" />
              <h4>Standard AI Agents</h4>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold">✕</span>
                <span>Jumps straight to implementation without system specifications.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold">✕</span>
                <span>Runs commands blindly and modifies unrelated configurations.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold">✕</span>
                <span>Performs direct git operations (auto-commits bugs/untested files).</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold">✕</span>
                <span>Lacks code review gates or local compilations logic checks.</span>
              </li>
            </ul>
          </div>

          {/* CrewLoop */}
          <div className="bg-[#05140e]/40 border border-emerald-950/20 rounded-2xl p-6">
            <div className="flex items-center space-x-2.5 mb-4 text-emerald-400 font-display font-bold">
              <Check className="w-5 h-5 text-emerald-400" />
              <h4>CrewLoop Enforced Flow</h4>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Mandatory Architect gatekeeper creates specs for every single change.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Isolated roles: the Engineer codes, the Reviewer scans, the Shipper commits.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Strict git safeties: Engineer never commits, Shipper handles PR rules.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Active local build/lint verification gates before reviewing code.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Modal image zoom */}
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
