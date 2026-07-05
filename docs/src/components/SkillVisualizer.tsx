import React, { useState } from 'react';
import { 
  PaintBrush, 
  Code, 
  Eye, 
  Rocket, 
  Brain, 
  MapTrifold, 
  ArrowRight,
  Warning
} from '@phosphor-icons/react';

interface SkillNode {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  description: string;
  cannotDo: string[];
}

export const SkillVisualizer: React.FC = () => {
  const [activeSkill, setActiveSkill] = useState<string | null>('orchestrator');

  const skills: SkillNode[] = [
    {
      id: 'orchestrator',
      name: 'Orchestrator',
      role: 'Discovery & Routing Hub',
      icon: <Brain className="w-6 h-6" />,
      color: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/10',
      glowColor: 'shadow-cyan-500/20 shadow-xl border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-500/30',
      description: 'Context discovery, requirement gathering, and overall process routing. Central hub of the team.',
      cannotDo: ['Writes code', 'Designs systems', 'Creates files', 'Git operations']
    },
    {
      id: 'architect',
      name: 'Architect',
      role: 'Specs & Contracts',
      icon: <MapTrifold className="w-6 h-6" />,
      color: 'border-teal-500/30 text-teal-400 bg-teal-950/10',
      glowColor: 'shadow-teal-500/20 shadow-xl border-teal-400 bg-teal-950/20 ring-1 ring-teal-500/30',
      description: 'System specifications, contracts, databases, and interface schemas. ALWAYS invoked first.',
      cannotDo: ['Writes implementation code', 'Runs git', 'Configures builds']
    },
    {
      id: 'designer',
      name: 'Designer',
      role: 'UI/UX Visual Specs',
      icon: <PaintBrush className="w-6 h-6" />,
      color: 'border-sky-500/30 text-sky-400 bg-sky-950/10',
      glowColor: 'shadow-sky-500/20 shadow-xl border-sky-400 bg-sky-950/20 ring-1 ring-sky-500/30',
      description: 'Visual identity, responsive layouts, motion spec, typography, and bento components.',
      cannotDo: ['Writes code', 'Git operations', 'Runs database migrations']
    },
    {
      id: 'engineer',
      name: 'Engineer',
      role: 'Build & Code',
      icon: <Code className="w-6 h-6" />,
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10',
      glowColor: 'shadow-emerald-500/20 shadow-xl border-emerald-400 bg-emerald-950/20 ring-1 ring-emerald-500/30',
      description: 'Implementation, unit tests, local verification, and build scripts. Only skill allowed to code.',
      cannotDo: ['Git operations', 'Code review', 'Architectural redesigns']
    },
    {
      id: 'reviewer',
      name: 'Reviewer',
      role: 'Quality Gate',
      icon: <Eye className="w-6 h-6" />,
      color: 'border-rose-500/30 text-rose-400 bg-rose-950/10',
      glowColor: 'shadow-rose-500/20 shadow-xl border-rose-400 bg-rose-950/20 ring-1 ring-rose-500/30',
      description: 'Static code reviews, security scans, compliance audits, and secret scanning.',
      cannotDo: ['Writes code', 'Runs git operations', 'Approves own code']
    },
    {
      id: 'shipper',
      name: 'Shipper',
      role: 'Git & PR Preparer',
      icon: <Rocket className="w-6 h-6" />,
      color: 'border-indigo-500/30 text-indigo-400 bg-indigo-950/10',
      glowColor: 'shadow-indigo-500/20 shadow-xl border-indigo-400 bg-indigo-950/20 ring-1 ring-indigo-500/30',
      description: 'Commit message formatting, branch creation, pushing, and pulling request setup.',
      cannotDo: ['Reviews code', 'Writes code', 'Alters spec files']
    }
  ];

  const currentSkill = skills.find(s => s.id === activeSkill) || skills[0];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-8">
      {/* Visual Canvas (Hub-and-Spoke diagram) */}
      <div className="lg:col-span-7 glass-card p-6 rounded-2xl relative min-h-[400px] flex items-center justify-center overflow-hidden border border-neutral-800/40">
        {/* Glowing grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:32px_32px] opacity-35" />
        
        {/* Hub-and-Spoke Layout */}
        <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
          
          {/* Connecting SVG lines with active glow */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 500 500">
            {skills.filter(s => s.id !== 'orchestrator').map((skill, index) => {
              const angle = (index * 72 * Math.PI) / 180 - Math.PI / 2;
              const radius = 160;
              const startX = 250;
              const startY = 250;
              const endX = 250 + radius * Math.cos(angle);
              const endY = 250 + radius * Math.sin(angle);
              
              const isConnecting = activeSkill === 'orchestrator' || activeSkill === skill.id;

              return (
                <g key={skill.id}>
                  {/* Glowing dynamic path */}
                  <line 
                    x1={startX} 
                    y1={startY} 
                    x2={endX} 
                    y2={endY} 
                    stroke={isConnecting ? '#06b6d4' : '#262626'} 
                    strokeWidth={isConnecting ? '2.5' : '1.5'} 
                    className="transition-all duration-300"
                  />
                  {isConnecting && (
                    <circle r="4" fill="#06b6d4">
                      <animateMotion 
                        path={`M ${startX} ${startY} L ${endX} ${endY}`} 
                        dur="2.5s" 
                        repeatCount="indefinite" 
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Central Orchestrator Node */}
          <div className="absolute z-10">
            <button 
              onClick={() => setActiveSkill('orchestrator')}
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border transition-all duration-300 ${
                activeSkill === 'orchestrator' ? skills[0].glowColor : skills[0].color
              }`}
            >
              {skills[0].icon}
              <span className="text-[11px] font-mono mt-1 font-semibold">Hub</span>
            </button>
          </div>

          {/* Core Surrounding Nodes */}
          {skills.filter(s => s.id !== 'orchestrator').map((skill, index) => {
            const angle = (index * 72 * Math.PI) / 180 - Math.PI / 2;
            const radius = 160;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            return (
              <div 
                key={skill.id}
                className="absolute"
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
              >
                <button
                  onClick={() => setActiveSkill(skill.id)}
                  className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border transition-all duration-300 ${
                    activeSkill === skill.id ? skill.glowColor : skill.color
                  }`}
                >
                  {skill.icon}
                  <span className="text-[10px] font-mono mt-1 font-semibold">{skill.name}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details sidebar card */}
      <div className="lg:col-span-5 glass-card p-6 rounded-2xl border-l-4 border-l-cyan-500 border border-neutral-800/40 animate-fade-in-up">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-cyan-400">
            {currentSkill.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-slate-100">{currentSkill.name}</h3>
            <span className="text-xs font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/30 border border-cyan-800/30">
              {currentSkill.role}
            </span>
          </div>
        </div>

        <p className="text-slate-300 text-[14px] leading-relaxed mb-6">
          {currentSkill.description}
        </p>

        {/* Cannot Do rules list */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4">
          <h4 className="text-xs font-mono font-semibold text-rose-400 flex items-center mb-3">
            <Warning className="w-4 h-4 mr-1.5" />
            CONSTRAINTS: NEVER DOES
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentSkill.cannotDo.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-between items-center text-xs text-slate-500 font-mono border-t border-neutral-800/80 pt-4">
          <span>Click any node in the diagram to inspect skill limits</span>
          <ArrowRight className="w-4 h-4 text-slate-600 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
