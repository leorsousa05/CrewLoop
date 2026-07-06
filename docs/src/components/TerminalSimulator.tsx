import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, ArrowClockwise, Circle } from '@phosphor-icons/react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'success' | 'error' | 'header';
  text: string;
  delayBefore?: number;
}

interface TerminalStep {
  stepId: number;
  command: string;
  logs: TerminalLine[];
  durationAfter: number;
}

export const TerminalSimulator: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  const [visibleLogs, setVisibleLogs] = useState<TerminalLine[]>([]);

  const simulationSteps: TerminalStep[] = [
    {
      stepId: 0,
      command: 'npm i -g @archznn/crewloop-cli && crewloop install',
      logs: [
        { id: '1', type: 'header', text: 'npm install -g @archznn/crewloop-cli' },
        { id: '2', type: 'output', text: 'added 42 packages in 1.4s' },
        { id: '3', type: 'output', text: '' },
        { id: '4', type: 'header', text: 'crewloop install' },
        { id: '5', type: 'output', text: 'Installed 18 skill(s) to ~/.agents/skills/' },
        { id: '6', type: 'output', text: '  + crewloop-hub' },
        { id: '7', type: 'output', text: '  + architect' },
        { id: '8', type: 'output', text: '  + designer' },
        { id: '9', type: 'output', text: '  + engineer' },
        { id: '10', type: 'output', text: '  + reviewer' },
        { id: '11', type: 'output', text: '  + shipper' },
        { id: '12', type: 'output', text: '  + project-brainstorm' },
        { id: '13', type: 'output', text: '  + long-term-manager' },
        { id: '14', type: 'output', text: '  + docs-writer' },
        { id: '15', type: 'output', text: '  + tester' },
        { id: '16', type: 'output', text: '  + product-manager' },
        { id: '17', type: 'output', text: '  + maintainer' },
        { id: '18', type: 'output', text: '  + researcher' },
        { id: '19', type: 'output', text: '  + security-guard' },
        { id: '20', type: 'output', text: '  + accessibility-auditor' },
        { id: '21', type: 'output', text: '  + devops-specialist' },
        { id: '22', type: 'output', text: '  + frontend-architect' },
        { id: '23', type: 'output', text: '  + schema-designer' },
        { id: '24', type: 'output', text: '' },
        { id: '25', type: 'output', text: 'Configured agent hooks:' },
        { id: '26', type: 'success', text: '  ✓ claude (configured)' },
        { id: '27', type: 'success', text: '  ✓ kimi (configured)' },
        { id: '28', type: 'output', text: '' },
        { id: '29', type: 'success', text: 'Run "crewloop dashboard" to start receiving hook events.' }
      ],
      durationAfter: 3500
    },
    {
      stepId: 1,
      command: 'crewloop dashboard',
      logs: [
        { id: '30', type: 'header', text: 'Starting CrewLoop dashboard...' },
        { id: '31', type: 'output', text: 'CREWLOOP DASHBOARD - Ready on http://127.0.0.1:7890' },
        { id: '32', type: 'output', text: '[INFO] WebSocket server active on port 7890.' },
        { id: '33', type: 'output', text: '[INFO] UI served locally at http://localhost:7890.' },
        { id: '34', type: 'output', text: '[INFO] Connection established: client-shim (claude)' },
        { id: '35', type: 'success', text: '[INFO] Session active: NNN-docs-homepage-redesign' }
      ],
      durationAfter: 5000
    }
  ];

  useEffect(() => {
    let active = true;
    const currentStep = simulationSteps[activeStep];
    
    if (activeStep === 0 && visibleLogs.length === 0) {
      setTypedCommand('');
    }

    let currentText = '';
    let index = 0;
    let timer: any;

    const type = () => {
      if (!active) return;
      if (index < currentStep.command.length) {
        currentText += currentStep.command[index];
        setTypedCommand(currentText);
        index++;
        timer = setTimeout(type, 40 + Math.random() * 30);
      } else {
        timer = setTimeout(() => {
          if (!active) return;
          setVisibleLogs(prev => [...prev, ...currentStep.logs]);
          
          timer = setTimeout(() => {
            if (!active) return;
            if (activeStep < simulationSteps.length - 1) {
              setActiveStep(prev => prev + 1);
            } else {
              timer = setTimeout(() => {
                if (!active) return;
                setTypedCommand('');
                setVisibleLogs([]);
                setActiveStep(0);
              }, 4000);
            }
          }, currentStep.durationAfter);

        }, 500);
      }
    };

    timer = setTimeout(type, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [activeStep]);

  const handleRestart = () => {
    setTypedCommand('');
    setVisibleLogs([]);
    setActiveStep(0);
  };

  const handleCopyLogs = () => {
    const textToCopy = visibleLogs.map(l => l.text).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full glass-card rounded-xl border border-neutral-800/80 overflow-hidden shadow-2xl font-mono text-[13px] leading-relaxed flex flex-col min-h-[380px] md:min-h-[420px]">
      {/* Top Header Mockup */}
      <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-900 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <Circle weight="fill" className="w-3 h-3 text-red-500/80" />
          <Circle weight="fill" className="w-3 h-3 text-yellow-500/80" />
          <Circle weight="fill" className="w-3 h-3 text-green-500/80" />
          <span className="text-slate-500 text-xs ml-3 flex items-center gap-1.5 font-mono">
            <Terminal className="w-3.5 h-3.5" />
            crewloop-terminal-sim
          </span>
        </div>
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={handleCopyLogs}
            disabled={visibleLogs.length === 0}
            className="p-1.5 rounded hover:bg-neutral-900 text-slate-500 hover:text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Copy logs output"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleRestart}
            className="p-1.5 rounded hover:bg-neutral-900 text-slate-500 hover:text-slate-300 transition-colors"
            title="Restart simulation"
          >
            <ArrowClockwise className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="p-5 flex-1 bg-black/60 overflow-y-auto max-h-[360px] text-slate-300 flex flex-col justify-start">
        {/* Render prior logs */}
        {visibleLogs.map((log) => {
          let colorClass = 'text-slate-300';
          if (log.type === 'header') colorClass = 'text-slate-500 font-bold border-b border-neutral-900/60 pb-1 mb-2';
          if (log.type === 'success') colorClass = 'text-emerald-400 font-semibold';
          if (log.type === 'error') colorClass = 'text-rose-500';
          
          return (
            <div key={log.id} className={`${colorClass} whitespace-pre-wrap animate-fade-in-up`}>
              {log.text}
            </div>
          );
        })}

        {/* Render currently typing prompt */}
        <div className="flex items-center text-cyan-400 mt-2 font-bold select-none">
          <span className="text-slate-500 mr-2">$</span>
          <span>{typedCommand}</span>
          <span className="w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
