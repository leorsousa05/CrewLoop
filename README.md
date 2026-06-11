# Loop Engineering Agents

Um time de skills de IA projetadas para trabalharem juntas como um fluxo completo de desenvolvimento de software. Cada skill representa um papel especializado — desde a descoberta de requisitos até o deploy — garantindo que nenhuma etapa seja pulada e que o trabalho seja feito com qualidade profissional.

## Por que eu criei isso?

Sempre que pedi para uma IA criar código, sentia que faltava **processo**. A IA pulava etapas importantes: não perguntava o suficiente antes de codar, não documentava decisões, não pensava em design antes de implementar, e às vezes commitava código sem revisar. Isso gerava retrabalho, código mal estruturado e falta de rastreabilidade.

Então decidi criar um **time de agentes especializados**, onde cada um tem UMA responsabilidade clara e NUNCA invade o território do outro. O resultado é um fluxo onde:

- **Nada começa sem contexto** — o orchestrator garante que todos os requisitos sejam coletados
- **Nada é implementado sem specs** — o architect cria especificações técnicas para tudo, até bug fixes
- **Nada é codado sem design** — o designer define direção estética antes do engineer tocar no código
- **Nada é enviado sem revisão** — o shipper valida commits, mensagens e arquiva specs

## O Time

### 🎯 Orchestrator — Descoberta e Roteamento
**Arquivo:** `orchestrator/SKILL.md`

O ponto de entrada de qualquer tarefa. O orchestrator não escreve código, não designa e não arquiteta. Ele **pergunta, esclarece e organiza**.

**O que faz:**
- Coleta contexto do projeto (tecnologias, constraints, preferências)
- Identifica o tipo de tarefa (feature, bug fix, redesign, refactor)
- Pergunta sobre UI/UX quando relevante (estilo visual, animações, público-alvo)
- Produz um **brief estruturado** com todos os requisitos
- **SEMPRE roteia para o architect** — não há exceções, não há escolha

**Regra de ouro:** O orchestrator NUNCA envia direto para designer ou engineer. Architect é sempre o próximo passo.

**Quando ativa:** Sempre que o usuário pedir qualquer coisa relacionada a código, design, ou mudanças no projeto.

---

### 🏗️ Architect — Arquitetura e Specs
**Arquivo:** `architect/SKILL.md`

O cérebro técnico do time. O architect **pensa antes de construir** e documenta tudo.

**O que faz:**
- Cria a pasta `specs/` com estrutura organizada (`changes/`, `archive/`, `living/`, `decisions/`)
- Produz **specs obrigatórios para qualquer mudança** — desde um bug fix de 1 linha até uma feature complexa
- Define contratos, interfaces, modelos de dados e APIs
- Analisa trade-offs e registra decisões arquiteturais (ADRs)
- Segue padrões: SDD (Spec-Driven), DDD (Domain-Driven), CDD (Contract-Driven), TDD

**Estrutura de specs:**
```
specs/
├── changes/001-feature-name/
│   ├── .spec.yaml          # status, datas, autor
│   ├── proposal.md         # WHY: motivação e escopo
│   ├── specs/              # WHAT: delta vs sistema atual
│   ├── design.md           # HOW: models, APIs, flows
│   └── tasks.md            # ordered implementation checklist
├── archive/                # specs completados
├── living/                 # source of truth mergeado
└── decisions/              # ADRs
```

**Quando ativa:** Sempre após o orchestrator. É o **primeiro passo obrigatório** de qualquer tarefa.

---

### 🎨 Designer — Direção Estética e Design Specs
**Arquivo:** `designer/SKILL.md`

O olho criativo do time. O designer **rejeita estéticas genéricas de IA** e cria identidades visuais memoráveis.

**O que faz:**
- Escolhe uma **direção estética ousada** (brutalist, maximalist, luxury, organic, editorial, etc.)
- Define tipografia distintiva (nunca Inter/Roboto como fonte principal)
- Cria paletas de cores ousadas (nunca gradiente roxo clichê)
- Especifica layouts inesperados, animações coreografadas e texturas atmosféricas
- Aplica **guardrails técnicos**: acessibilidade (contraste 4.5:1), touch targets ≥44px, reduced motion
- Produz **8 deliveráveis**: direção estética, sistema de cores, tipografia, componentes, layout, motion, assets, checklist

**O que NÃO faz:**
- Não escreve código HTML/CSS/JS
- Não usa fontes genéricas (Inter, Roboto, Arial, Space Grotesk, Poppins)
- Não cria gradientes roxos clichê

**Quando ativa:** Após o architect, quando a tarefa envolve UI, frontend, landing pages, dashboards, ou componentes visuais.

---

### 🔧 Engineer — Implementação e BUILD
**Arquivo:** `engineer/SKILL.md`

As mãos do time. O engineer **implementa specs com precisão** e nada mais.

**O que faz:**
- Lê specs do architect antes de qualquer implementação
- Segue contratos e interfaces definidos pelo architect
- Escreve código de produção com testes, documentação e tratamento de erros
- Verifica builds e testes — fail once, fix once, still fail → STOP
- Aplica TDD (escreve testes antes ou junto com código)

**O que NÃO faz:**
- **Nunca faz git operations** (commit, push, branch, merge) — isso é do shipper
- Nunca redesenha arquitetura sem aprovação do architect
- Nunca pula specs ou inventa contratos no meio da implementação
- Nunca escreve pseudocódigo vago

**Quando ativa:** Após o architect (e designer, se houver UI). Recebe specs prontos e transforma em código.

---

### 🚀 Shipper — Git Workflow e Deploy
**Arquivo:** `shipper/SKILL.md`

O coordenador de release. O shipper **empacota e envia** o trabalho feito.

**O que faz:**
- Analiza o diff e categoriza mudanças (feat, fix, refactor, docs, chore, etc.)
- Gera **mensagens de commit no padrão Conventional Commits** com validação rigorosa
- Cria branches no formato `tipo/descricao-curta`
- Detecta e previne commits de segredos (API keys, tokens, .env)
- Escaneia e remove artefatos de IA (comentários "Written by AI", placeholders)
- **Arquiva specs** ao commitar: move `specs/changes/` → `specs/archive/`
- Gera links de PR para GitHub/GitLab/Bitbucket

**Validação de commits:**
- Tipo obrigatório: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Descrição no imperativo: "add login" (não "added login")
- Máximo 72 caracteres na descrição
- Sem ponto final
- Breaking changes com `!`: `feat(api)!: remove endpoint`

**Quando ativa:** Após o engineer, quando o usuário quer commitar, criar PR, ou "shippar" o trabalho.

---

## Fluxo de Trabalho

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR                             │
│              (Coleta contexto, cria brief)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ARCHITECT                               │
│         (Cria specs obrigatórios para QUALQUER mudança)         │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌───────────────────────┐           ┌───────────────────────┐
│       DESIGNER        │           │       ENGINEER        │
│  (Direção estética +  │           │  (Implementa specs    │
│   especificação UI)   │           │   em código)          │
└───────────────────────┘           └───────────────────────┘
            │                                   │
            └─────────────────┬─────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SHIPPER                                 │
│   (Conventional commits, branch, push, PR, arquiva specs)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR                               │
│                    (Próxima tarefa)                             │
└─────────────────────────────────────────────────────────────────┘
```

**Regras do fluxo:**
1. **Orchestrator SEMPRE envia para Architect primeiro** — nunca envia direto para Designer ou Engineer
2. **Architect é o gatekeeper** — cria specs e decide se roteia para Designer (UI/frontend) ou Engineer (backend/código)
3. **Designer atua ANTES do Engineer** — quando há UI, o designer cria a especificação visual antes do engineer implementar
4. **Engineer nunca faz git** — shipper é o único que toca no repositório
5. **Specs são arquivados** — `specs/changes/` vira `specs/archive/` no commit
6. **Todas as skills voltam ao orchestrator** — ele é o hub central

## Instalação

As skills são arquivos `SKILL.md` que podem ser usados com agentes de IA compatíveis (Claude Code, Kimi Code, etc.).

1. Clone o repositório:
```bash
git clone https://github.com/leorsousa05/loop-engineering-agents.git
```

2. Copie as skills para o diretório de skills do seu agente:
```bash
# Exemplo para Kimi Code
cp -r loop-engineering-agents/* ~/.agents/skills/
```

3. Cada skill será automaticamente detectada e ativada conforme o contexto da conversa.

## Princípios do Time

- **Separação de responsabilidades:** Cada skill faz UMA coisa e faz bem. Nunca invade o território de outra.
- **Specs como source of truth:** O architect documenta, o designer especifica, o engineer implementa, o shipper arquiva. Tudo rastreável.
- **Qualidade sobre velocidade:** Nada é pulado por ser "rápido". Um bug fix de 1 linha ainda precisa de um spec lightweight.
- **Navegação por letras:** Ao final de cada skill, o usuário escolhe o próximo passo por letra (`[A] Architect`, `[D] Designer`, `[E] Engineer`, `[S] Shipper`, `[O] Orchestrator`).
- **Resistência a atalhos:** As skills foram testadas com stress tests para garantir que não cedam a pressões como "só faz rápido", "pula o design", ou "commita pra mim".

---

**Autor:** @leorsousa05  
**Licença:** MIT
