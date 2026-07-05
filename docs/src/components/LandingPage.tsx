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
      id: 'core/orchestrator', 
      name: 'Orquestrador', 
      role: 'Contexto & Roteamento',
      desc: 'Analisa o contexto inicial, coleta requisitos e direciona o fluxo de trabalho entre os agentes especialistas.',
      cannotDo: ['Escrever código', 'Desenhar sistemas', 'Criar arquivos', 'Operações git']
    },
    { 
      id: 'core/architect', 
      name: 'Arquiteto', 
      role: 'Especificações & Contratos',
      desc: 'Cria especificações técnicas e listas de tarefas em specs/changes/ antes do início da codificação.',
      cannotDo: ['Escrever código de implementação', 'Executar comandos git', 'Configurar scripts de build']
    },
    { 
      id: 'core/designer', 
      name: 'Designer', 
      role: 'Especificações Visuais UI/UX',
      desc: 'Define tokens de design, layouts responsivos e estruturas de visualização para componentes de interface.',
      cannotDo: ['Escrever código funcional', 'Operações git', 'Executar migrações de banco de dados']
    },
    { 
      id: 'core/engineer', 
      name: 'Engenheiro', 
      role: 'Implementação de Código',
      desc: 'Desenvolve código funcional e testes unitários. É a única função autorizada a alterar o código-fonte.',
      cannotDo: ['Operações git', 'Revisão de código (code review)', 'Modificar a arquitetura']
    },
    { 
      id: 'core/reviewer', 
      name: 'Revisor', 
      role: 'Garantia de Qualidade',
      desc: 'Audita conformidade das especificações, executa testes locais e realiza varreduras de segurança contra vazamentos de credenciais.',
      cannotDo: ['Escrever código de correção', 'Executar comandos git', 'Aprovar o próprio código']
    },
    { 
      id: 'core/shipper', 
      name: 'Shipper', 
      role: 'Entrega & PR',
      desc: 'Gerencia ramificações do repositório, envia (push) alterações e cria Pull Requests no formato convencional.',
      cannotDo: ['Revisar código', 'Escrever código', 'Alterar especificações (specs)']
    }
  ];

  const supportingSkillsList: SkillDetails[] = [
    { 
      id: 'supporting/project-brainstorm', 
      name: 'Project Brainstorm', 
      role: 'Descoberta de Produto',
      desc: 'Auxilia na definição de requisitos para tarefas complexas ou ambíguas antes da criação da especificação técnica.',
      cannotDo: ['Escrever código', 'Operações git']
    },
    { 
      id: 'supporting/long-term-manager', 
      name: 'Long-term Manager', 
      role: 'Gerenciador de Progresso',
      desc: 'Acompanha o andamento das tarefas e mantém atualizado o checklist de progresso em projetos de longa duração.',
      cannotDo: ['Escrever código', 'Operações git']
    },
    { 
      id: 'supporting/docs-writer', 
      name: 'Docs Writer', 
      role: 'Escrita de Documentação',
      desc: 'Escreve e atualiza arquivos README, manuais de subsistemas e referências técnicas de APIs.',
      cannotDo: ['Modificar código lógico', 'Alterar especificações (specs)', 'Configurar builds']
    },
    { 
      id: 'supporting/tester', 
      name: 'Tester', 
      role: 'Estratégia de QA',
      desc: 'Desenha planos de verificação, analisa a cobertura de testes e mapeia cenários de teste de borda.',
      cannotDo: ['Modificar código-fonte', 'Realizar commits git', 'Alterar especificações (specs)']
    },
    { 
      id: 'supporting/product-manager', 
      name: 'Product Manager', 
      role: 'Métricas & Priorização',
      desc: 'Auxilia na priorização de escopo, mapeamento de histórias de usuários e definição de metas de entrega.',
      cannotDo: ['Modificar código-fonte', 'Realizar commits git', 'Executar testes']
    },
    { 
      id: 'supporting/maintainer', 
      name: 'Maintainer', 
      role: 'Manutenção & Débito Técnico',
      desc: 'Realiza a triagem de bugs, refatora códigos legados, limpa débitos técnicos e atualiza bibliotecas obsoletas.',
      cannotDo: ['Criar especificações (specs)', 'Aprovar as próprias revisões', 'Fazer commits git']
    },
    { 
      id: 'supporting/researcher', 
      name: 'Researcher', 
      role: 'Pesquisa Tecnológica',
      desc: 'Compara frameworks, avalia bibliotecas e constrói provas de conceito rápidas para embasar decisões técnicas.',
      cannotDo: ['Escrever código de produção', 'Realizar commits git', 'Abrir Pull Requests']
    },
    { 
      id: 'supporting/security-guard', 
      name: 'Security Guard', 
      role: 'Segurança & Vulnerabilidades',
      desc: 'Verifica regras de autorização, audita endpoints expostos e inspeciona riscos em dependências externas.',
      cannotDo: ['Escrever código', 'Modificar configurações git', 'Executar migrações de bancos de dados']
    },
    { 
      id: 'supporting/accessibility-auditor', 
      name: 'Accessibility Auditor', 
      role: 'Acessibilidade (WCAG)',
      desc: 'Audita layouts e componentes visuais de acordo com padrões de acessibilidade (leitores de tela e teclado).',
      cannotDo: ['Escrever código de backend', 'Executar migrações de bancos de dados', 'Realizar commits git']
    },
    { 
      id: 'devops-specialist', 
      name: 'DevOps Specialist', 
      role: 'Infraestrutura CI/CD',
      desc: 'Configura arquivos do Docker, atualiza automações de CI/CD e gerencia configurações de ambiente de deploy.',
      cannotDo: ['Escrever lógica de aplicação', 'Modificar especificações (specs)', 'Realizar code reviews']
    },
    { 
      id: 'frontend-architect', 
      name: 'Frontend Architect', 
      role: 'Arquitetura de Componentes',
      desc: 'Define a composição de componentes no frontend, estruturas de props e lógica de hooks reutilizáveis.',
      cannotDo: ['Escrever código de backend', 'Executar operações git', 'Gerenciar revisões de PR']
    },
    { 
      id: 'schema-designer', 
      name: 'Schema Designer', 
      role: 'Modelagem de Banco de Dados',
      desc: 'Modela diagramas de entidades, estruturas de tabelas relacionais e coordena migrações de banco de dados.',
      cannotDo: ['Escrever lógica de frontend', 'Configurar builds', 'Realizar commits git']
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
            <span>FLUXO DE TRABALHO PADRONIZADO PARA DESENVOLVIMENTO COM IA</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-extrabold tracking-tight text-white leading-[1.08] font-display">
            Desenvolvimento estruturado <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-xl">
              com agentes de IA.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-405 max-w-xl leading-relaxed">
            O CrewLoop organiza a execução de agentes de IA em papéis isolados — do levantamento de requisitos à Pull Request — garantindo previsibilidade e controle absoluto sobre o código.
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
              <div className="text-slate-500 group-hover:text-slate-300 transition-colors pl-4 select-none">
                {copied ? (
                  <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
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
              <span>COMEÇAR AGORA</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigateToDocs('concepts/workflow')}
              className="w-full sm:w-auto px-7 py-3.5 bg-neutral-950 border border-neutral-800 hover:border-slate-700 hover:bg-neutral-900 text-slate-200 font-bold font-mono rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-4.5 h-4.5 text-slate-400" />
              <span>EXPLORAR A DOCUMENTAÇÃO</span>
            </button>
          </div>

          {/* Compatible AI logo agents bar */}
          <div className="flex items-center gap-5 pt-3 text-slate-500 text-[11px] font-mono select-none">
            <span className="text-[9px] text-slate-600 tracking-wider font-bold">AGENTES COMPATÍVEIS:</span>
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
          <h2 className="text-2xl md:text-3.5xl font-bold font-display text-white mb-3">Fluxo de Desenvolvimento</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Cada fase do processo possui limites operacionais estritos e devolve o controle ao Orquestrador entre as etapas.
          </p>
        </div>
        <SkillVisualizer />
      </section>

      {/* Bento-grid catalog list directory of 18 skills */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-neutral-900/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">Diretório de Skills</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            As 18 especialidades disponíveis para compor a equipe de desenvolvimento. Clique no card para inspecionar restrições operacionais.
          </p>
        </div>

        <div className="space-y-12">
          {/* Core pipeline flow grid */}
          <div>
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2.5 animate-pulse" />
              Pipeline Core (Equipe Principal)
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
                    Ver Limites & Restrições
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialist advisors catalog grid */}
          <div>
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2.5 animate-pulse" />
              Especialistas & Papéis de Suporte
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
                        Especialista
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
                    Ver Limites
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
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">Monitoramento do Workspace</h2>
          <p className="text-slate-450 text-sm md:text-base">
            Monitore o andamento das tarefas e audite o histórico de execuções através do console WebSocket local.
          </p>
        </div>

        {/* Row 1: Image Left, Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div 
              onClick={() => setActiveModalImg({
                src: 'assets/screenshots/skill-active.png',
                title: 'Painel de Atividade da Skill',
                desc: 'Exibe o tempo decorrido, o workspace ativo, arquivos modificados na sessão e a transmissão direta de logs da execução.'
              })}
              className="group glass-card-3d rounded-2xl overflow-hidden border border-neutral-800/40 shadow-[0_20px_50px_rgba(6,182,212,0.05)] cursor-zoom-in hover:border-cyan-500/40 transition-all duration-300"
            >
              <div className="aspect-video bg-black overflow-hidden relative">
                <img 
                  src="assets/screenshots/skill-active.png" 
                  alt="Dashboard de Atividade" 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback visual block if screenshot is missing */}
                <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Terminal className="w-12 h-12 text-cyan-500 mb-3 animate-pulse" />
                  <span className="font-mono text-xs text-slate-400">Transmissão de logs de execução em tempo real</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              Auditoria & Logs
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-white">Visualização de Atividade</h3>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              O painel do dashboard exibe os logs e arquivos afetados pela skill ativa no momento. É possível pausar, inspecionar a saída do terminal do agente e auditar as chamadas de ferramentas diretamente.
            </p>
          </div>
        </div>

        {/* Row 2: Text Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              Checklists de Tarefas
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-white">Acompanhamento de Specs</h3>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              O CrewLoop impõe o desenvolvimento orientado a especificações. O Arquiteto documenta o plano em `specs/changes/` e o dashboard acompanha automaticamente a lista de tarefas, sinalizando quais etapas foram implementadas e testadas.
            </p>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div 
              onClick={() => setActiveModalImg({
                src: 'assets/screenshots/dashboard-overview.png',
                title: 'Visão Geral das Sessões',
                desc: 'Linha do tempo de conexões ativas, sessões de agentes iniciadas e logs WebSocket de eventos.'
              })}
              className="group glass-card-3d rounded-2xl overflow-hidden border border-neutral-800/40 shadow-[0_20px_50px_rgba(16,185,129,0.05)] cursor-zoom-in hover:border-emerald-500/40 transition-all duration-300"
            >
              <div className="aspect-video bg-black overflow-hidden relative">
                <img 
                  src="assets/screenshots/dashboard-overview.png" 
                  alt="Visão Geral do Dashboard" 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <GitFork className="w-12 h-12 text-emerald-400 mb-3 animate-pulse" />
                  <span className="font-mono text-xs text-slate-400">Painel de gerenciamento de sessões ativas</span>
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
          <h2 className="text-2xl md:text-3.5xl font-bold font-display text-white mb-3">Comparativo de Fluxo</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            A diferença prática entre a execução livre e o fluxo estruturado com divisão de papéis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Traditional AI panel */}
          <div className="glass-card rounded-2xl p-7 border border-red-950/30 bg-gradient-to-b from-[#140505]/40 to-transparent hover:border-red-900/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6 text-red-400 font-display font-bold">
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/30 shadow-inner">
                <ShieldWarning className="w-5 h-5" />
              </div>
              <h4 className="text-xl">Execução Tradicional de IA</h4>
            </div>
            <ul className="space-y-4 text-[13px] text-slate-450">
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-base select-none">✕</span>
                <span>Modificações de código feitas diretamente, sem validação arquitetural ou de requisitos.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-base select-none">✕</span>
                <span>Edições em múltiplos arquivos sem isolamento de contexto, aumentando a chance de regressões.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-base select-none">✕</span>
                <span>Commits automáticos sem linter ou validação prévia de compilação da base.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-base select-none">✕</span>
                <span>Inexistência de revisão de código, facilitando vazamento de credenciais.</span>
              </li>
            </ul>
          </div>

          {/* CrewLoop panel */}
          <div className="glass-card rounded-2xl p-7 border border-emerald-950/30 bg-gradient-to-b from-[#05140e]/40 to-transparent hover:border-emerald-900/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6 text-emerald-400 font-display font-bold">
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/30 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-xl">Fluxo CrewLoop</h4>
            </div>
            <ul className="space-y-4 text-[13px] text-slate-300">
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 font-bold text-base select-none">✓</span>
                <span>Definição obrigatória do plano de tarefas e specs antes de qualquer alteração no código.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 font-bold text-base select-none">✓</span>
                <span>Divisão estrita de papéis: Engenheiro escreve código; Revisor audita; Shipper cria commits.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 font-bold text-base select-none">✓</span>
                <span>Padronização automatizada de commits e ramificações usando Commits Convencionais.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 font-bold text-base select-none">✓</span>
                <span>Execução de testes locais e auditoria de segurança integrada antes da abertura do PR.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 z-10 relative border-t border-neutral-900/50">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3.5xl font-bold font-display text-white mb-3">Métricas de Eficiência</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Resultados práticos obtidos com a aplicação do fluxo estruturado em repositórios de testes reais.
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
                Erros em Compilação
              </div>
              <p className="text-xs text-slate-500 italic leading-relaxed">
                "Os gates de auditoria local barram quebras de build e inconsistências de linter antes da entrega final."
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
                Rastreamento de Modificações
              </div>
              <p className="text-xs text-slate-500 italic leading-relaxed">
                "Todo arquivo modificado possui um plano mapeado pelo Arquiteto, garantindo histórico claro em specs/changes/."
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
                Sessões Executadas
              </div>
              <p className="text-xs text-slate-500 italic leading-relaxed">
                "Integração contínua e autônoma validando o fluxo de mudanças em repositórios reais sem quebras."
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
                <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descrição da Função</h5>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{selectedSkillForModal.desc}</p>
              </div>

              <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5">
                <h5 className="text-[10px] font-mono font-bold text-rose-400 flex items-center mb-3.5 tracking-wider">
                  <Warning className="w-4 h-4 mr-2 text-rose-400" />
                  RESTRIÇÕES: O QUE NUNCA FAZ
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
                <span>Ler Guia Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setSelectedSkillForModal(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-slate-300 rounded-lg transition-colors"
              >
                Fechar
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
