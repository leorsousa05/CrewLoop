import React, { useState } from 'react';
import { 
  PaintBrush, 
  Code, 
  Eye, 
  Rocket, 
  Brain, 
  MapTrifold, 
  CaretDown,
  Warning
} from '@phosphor-icons/react';

interface PipelineStep {
  id: string;
  stepNum: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  description: string;
  cannotDo: string[];
}

export const SkillVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string | null>('crewloop-hub');

  const steps: PipelineStep[] = [
    {
      id: 'crewloop-hub',
      stepNum: '01',
      name: 'CrewLoop Hub',
      role: 'Discovery & Routing Hub',
      icon: <Brain className="w-5 h-5" />,
      description: 'Handles context discovery, requirement gathering, and workflow routing. Acts as the central hub connecting all execution phases.',
      cannotDo: ['Writes code', 'Designs systems', 'Creates code files', 'Performs git operations']
    },
    {
      id: 'architect',
      stepNum: '02',
      name: 'Architect',
      role: 'Specs & Contracts',
      icon: <MapTrifold className="w-5 h-5" />,
      description: 'Authors technical specifications and checklists under specs/changes/ before coding begins. Resolves API schemas and database migrations.',
      cannotDo: ['Writes implementation code', 'Runs git operations', 'Configures build scripts']
    },
    {
      id: 'designer',
      stepNum: '03',
      name: 'Designer',
      role: 'UI/UX Visual Specs',
      icon: <PaintBrush className="w-5 h-5" />,
      description: 'Defines layout specs, design tokens (HSL colors), responsiveness, and motion specifications for user interface components.',
      cannotDo: ['Writes functional code', 'Runs git operations', 'Executes database migrations']
    },
    {
      id: 'engineer',
      stepNum: '04',
      name: 'Engineer',
      role: 'Code & Local Verification',
      icon: <Code className="w-5 h-5" />,
      description: 'The only role authorized to write implementation code and unit tests. Compiles codebase locally and verifies verification checks pass.',
      cannotDo: ['Commits or pushes to git', 'Performs code reviews', 'Modifies specs without routing approval']
    },
    {
      id: 'reviewer',
      stepNum: '05',
      name: 'Reviewer',
      role: 'Quality Gate & Security',
      icon: <Eye className="w-5 h-5" />,
      description: 'Audits spec compliance, reviews implementation code, runs security checks, and scans files for secrets or exposed credentials.',
      cannotDo: ['Writes correction code', 'Runs git operations', 'Approves own code']
    },
    {
      id: 'shipper',
      stepNum: '06',
      name: 'Shipper',
      role: 'Git Commit & PR Preparer',
      icon: <Rocket className="w-5 h-5" />,
      description: 'The only role authorized to commit changes, create branches, push code, and open pull requests following Conventional Commits.',
      cannotDo: ['Reviews code', 'Writes implementation code', 'Alters specification files']
    }
  ];

  const toggleStep = (stepId: string) => {
    setActiveStep(prev => prev === stepId ? null : stepId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="panel">
        {/* Steps — vertical stepper on desktop, horizontal snap-scroll cards on mobile
            (dashboard recent-sessions pattern, design-ui.md §7) */}
        <div className="relative flex gap-3 overflow-x-auto snap-x snap-mandatory md:flex-col md:overflow-visible">
          {/* Timeline connector track (desktop only) — plain graphite hairline */}
          <div className="hidden md:block absolute left-[29px] top-[24px] bottom-[24px] w-[2px] bg-border-default pointer-events-none z-0" />

          {steps.map((step) => {
            const isOpen = activeStep === step.id;
            return (
              <div 
                key={step.id}
                className={`min-w-[260px] max-w-[280px] snap-start md:min-w-0 md:max-w-none transition-all duration-300 border rounded-lg overflow-hidden relative z-10 ${
                  isOpen 
                    ? 'bg-surface border-accent shadow-[var(--shadow-live)]' 
                    : 'bg-base border-border-default hover:border-border-strong'
                }`}
              >
                {/* Stepper Header Row */}
                <div 
                  onClick={() => toggleStep(step.id)}
                  className="flex items-center gap-4 p-4 cursor-pointer select-none"
                >
                  {/* Step Number Circle */}
                  <div className={`w-[28px] h-[28px] shrink-0 rounded-full flex items-center justify-center font-mono text-micro font-bold border transition-all ${
                    isOpen 
                      ? 'bg-accent-dim border-accent text-accent' 
                      : 'bg-inset border-border-default text-text-muted'
                  }`}>
                    {step.stepNum}
                  </div>

                  {/* Icon */}
                  <div className={`p-2 rounded-md border transition-all ${
                    isOpen 
                      ? 'bg-inset border-border-default text-accent' 
                      : 'bg-inset border-border-default text-text-muted'
                  }`}>
                    {step.icon}
                  </div>

                  {/* Name and Role Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-body font-bold font-display ${isOpen ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {step.name}
                      </h4>
                      <span className="text-micro font-mono text-text-muted uppercase tracking-wider hidden sm:inline">
                        Phase {step.stepNum}
                      </span>
                    </div>
                    <p className="text-label text-text-muted mt-0.5 truncate">
                      {step.role}
                    </p>
                  </div>

                  {/* Caret icon */}
                  <div className={`text-text-muted transition-transform duration-300 p-1 ${isOpen ? 'rotate-180 text-accent' : ''}`}>
                    <CaretDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Collapsible Panel Content */}
                <div className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-[600px] border-t border-border-default opacity-100 p-5 bg-inset' : 'max-h-0 opacity-0 pointer-events-none'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Description Paragraph */}
                    <div className="md:col-span-7 space-y-2.5">
                      <h5 className="label">
                        Role Description
                      </h5>
                      <p className="font-prose text-prose-sm text-text-secondary">
                        {step.description}
                      </p>
                    </div>

                    {/* Constraints Block */}
                    <div className="md:col-span-5 bg-base border border-border-default rounded-md p-5">
                      <h5 className="text-micro font-semibold uppercase tracking-wider text-error flex items-center mb-3.5">
                        <Warning className="w-4 h-4 mr-2" />
                        Constraints: never does
                      </h5>
                      <ul className="space-y-2.5">
                        {step.cannotDo.map((item, idx) => (
                          <li key={idx} className="text-label text-text-secondary flex items-start gap-2.5 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
