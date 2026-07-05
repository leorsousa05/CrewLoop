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
  themeColor: string;
  glowColor: string;
  badgeColor: string;
  description: string;
  cannotDo: string[];
}

export const SkillVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string | null>('orchestrator');

  const steps: PipelineStep[] = [
    {
      id: 'orchestrator',
      stepNum: '01',
      name: 'Orquestrador',
      role: 'Hub de Descoberta & Roteamento',
      icon: <Brain className="w-5.5 h-5.5" />,
      themeColor: 'border-cyan-500/25 text-cyan-400 bg-cyan-950/10 hover:border-cyan-500/50',
      glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.25)] border-cyan-400 bg-cyan-950/30 text-cyan-300 ring-1 ring-cyan-500/30',
      badgeColor: 'bg-cyan-950/40 border-cyan-800/40 text-cyan-400',
      description: 'Responsável pela descoberta de contexto, levantamento de requisitos e roteamento das fases. É o ponto central que conecta toda a equipe de agentes.',
      cannotDo: ['Escrever código', 'Desenhar sistemas', 'Criar arquivos de código', 'Realizar operações git']
    },
    {
      id: 'architect',
      stepNum: '02',
      name: 'Arquiteto',
      role: 'Especificações & Contratos',
      icon: <MapTrifold className="w-5.5 h-5.5" />,
      themeColor: 'border-teal-500/25 text-teal-400 bg-teal-950/10 hover:border-teal-500/50',
      glowColor: 'shadow-[0_0_20px_rgba(20,184,166,0.25)] border-teal-400 bg-teal-950/30 text-teal-300 ring-1 ring-teal-500/30',
      badgeColor: 'bg-teal-950/40 border-teal-800/40 text-teal-450',
      description: 'Elabora a especificação técnica detalhada em specs/changes/ para cada mudança do sistema. Resolve esquemas de banco de dados e contratos de APIs antes da codificação.',
      cannotDo: ['Escrever código de implementação', 'Executar operações git', 'Configurar scripts de build']
    },
    {
      id: 'designer',
      stepNum: '03',
      name: 'Designer',
      role: 'Arquitetura Visual UI/UX',
      icon: <PaintBrush className="w-5.5 h-5.5" />,
      themeColor: 'border-sky-500/25 text-sky-400 bg-sky-950/10 hover:border-sky-500/50',
      glowColor: 'shadow-[0_0_20px_rgba(14,165,233,0.25)] border-sky-400 bg-sky-950/30 text-sky-300 ring-1 ring-sky-500/30',
      badgeColor: 'bg-sky-950/40 border-sky-800/40 text-sky-400',
      description: 'Define a especificação visual do layout, paleta de cores (tokens HSL), responsividade e especificações de animação para os componentes da interface.',
      cannotDo: ['Escrever código funcional', 'Operações git', 'Executar migrações de banco de dados']
    },
    {
      id: 'engineer',
      stepNum: '04',
      name: 'Engenheiro',
      role: 'Código & Testes Locais',
      icon: <Code className="w-5.5 h-5.5" />,
      themeColor: 'border-emerald-500/25 text-emerald-400 bg-emerald-950/10 hover:border-emerald-500/50',
      glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.25)] border-emerald-400 bg-emerald-950/30 text-emerald-300 ring-1 ring-emerald-500/30',
      badgeColor: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400',
      description: 'O único papel autorizado a escrever código de implementação e testes unitários. Executa a compilação local e garante que as verificações de build passem.',
      cannotDo: ['Fazer commits/PRs no git', 'Realizar code reviews', 'Modificar especificações arquiteturais sem aprovação']
    },
    {
      id: 'reviewer',
      stepNum: '05',
      name: 'Revisor',
      role: 'Auditor de Qualidade & Gatekeeper',
      icon: <Eye className="w-5.5 h-5.5" />,
      themeColor: 'border-rose-500/25 text-rose-400 bg-rose-950/10 hover:border-rose-500/50',
      glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.25)] border-rose-400 bg-rose-950/30 text-rose-300 ring-1 ring-rose-500/30',
      badgeColor: 'bg-rose-950/40 border-rose-800/40 text-rose-400',
      description: 'Realiza revisões de código estáticas, valida a cobertura de testes e escaneia o código em busca de segredos vazados ou falhas de segurança.',
      cannotDo: ['Escrever código de correção', 'Fazer commits/PRs no git', 'Aprovar o próprio código']
    },
    {
      id: 'shipper',
      stepNum: '06',
      name: 'Shipper',
      role: 'Preparação de Commit & PR',
      icon: <Rocket className="w-5.5 h-5.5" />,
      themeColor: 'border-indigo-500/25 text-indigo-400 bg-indigo-950/10 hover:border-indigo-500/50',
      glowColor: 'shadow-[0_0_20px_rgba(99,102,241,0.25)] border-indigo-400 bg-indigo-950/30 text-indigo-300 ring-1 ring-indigo-500/30',
      badgeColor: 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400',
      description: 'O único papel que realiza commits, cria ramificações no repositório local, faz o push para o github e cria as Pull Requests de forma padronizada.',
      cannotDo: ['Revisar códigos', 'Escrever código de implementação', 'Modificar arquivos de especificações']
    }
  ];

  const toggleStep = (stepId: string) => {
    setActiveStep(prev => prev === stepId ? null : stepId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      {/* Full-width Glass Container */}
      <div className="glass-card-3d p-6 sm:p-8 rounded-2xl border border-neutral-800/40 shadow-2xl relative overflow-hidden">
        {/* Glow grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b22_1px,transparent_1px),linear-gradient(to_bottom,#1b1b22_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />
        
        <div className="relative space-y-4">
          {/* Timeline Connector Track (Desktop vertical track line) */}
          <div className="absolute left-[27px] top-[24px] bottom-[24px] w-[2px] bg-neutral-900 pointer-events-none z-0">
            <div className="h-full w-full bg-gradient-to-b from-cyan-500 via-teal-500 to-indigo-500 opacity-60 rounded-full" />
          </div>

          {/* Collapsible Stepper Rows */}
          {steps.map((step) => {
            const isOpen = activeStep === step.id;
            return (
              <div 
                key={step.id}
                className={`transition-all duration-300 border rounded-xl overflow-hidden relative z-10 ${
                  isOpen 
                    ? 'bg-[#111016]/90 border-neutral-800 shadow-[0_4px_25px_rgba(0,0,0,0.5)]' 
                    : 'border-transparent hover:bg-neutral-950/40'
                }`}
              >
                {/* Stepper Header Row */}
                <div 
                  onClick={() => toggleStep(step.id)}
                  className="flex items-center space-x-4 p-4 cursor-pointer select-none"
                >
                  {/* Step Number Circle */}
                  <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-all ${
                    isOpen 
                      ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20' 
                      : 'bg-neutral-950 border-neutral-800 text-slate-500'
                  }`}>
                    {step.stepNum}
                  </div>

                  {/* Icon */}
                  <div className={`p-2 rounded-lg border transition-all ${
                    isOpen 
                      ? 'bg-neutral-950 border-neutral-850 text-cyan-400' 
                      : 'bg-neutral-950/60 border-transparent text-slate-550'
                  }`}>
                    {step.icon}
                  </div>

                  {/* Name and Role Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-[15px] sm:text-base font-bold font-display ${isOpen ? 'text-white' : 'text-slate-400'}`}>
                        {step.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider hidden sm:inline">
                        Fase {step.stepNum}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {step.role}
                    </p>
                  </div>

                  {/* Caret icon */}
                  <div className={`text-slate-500 transition-transform duration-300 p-1 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}>
                    <CaretDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Collapsible Panel Content */}
                <div className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-[600px] border-t border-neutral-900/60 opacity-100 p-5 bg-neutral-950/30' : 'max-h-0 opacity-0 pointer-events-none'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Description Paragraph */}
                    <div className="md:col-span-7 space-y-2.5">
                      <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        Descrição da Função
                      </h5>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Constraints Block */}
                    <div className="md:col-span-5 bg-neutral-950/70 border border-neutral-900 rounded-xl p-5">
                      <h5 className="text-[10px] font-mono font-bold text-rose-400 flex items-center mb-3.5 tracking-wider">
                        <Warning className="w-4 h-4 mr-2" />
                        RESTRIÇÕES: O QUE NUNCA FAZ
                      </h5>
                      <ul className="space-y-2.5">
                        {step.cannotDo.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-400 flex items-start space-x-2.5 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500/90 animate-pulse mt-1.5 flex-shrink-0" />
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
