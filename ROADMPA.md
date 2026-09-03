# Roadmap: Otimizador de Tokens para um Orquestrador de Agentes

Sistema inspirado no conceito do Ponytail, mas implementado internamente no orquestrador para reduzir tokens, chamadas desnecessárias e retrabalho sem sacrificar correção, segurança ou qualidade.

## 1. Objetivo

Reduzir o custo total de cada tarefa concluída com sucesso.

O projeto não deve apenas pedir respostas menores ao modelo. Ele deve controlar:

- quantidade de tokens enviados;
- quantidade de tokens recebidos;
- número de turnos;
- chamadas de ferramentas;
- tamanho do contexto;
- número de tentativas;
- escolha do modelo;
- validação do resultado.

## 2. Resultado esperado

Para uma mesma tarefa, o orquestrador deve conseguir:

1. entender o objetivo com menos contexto;
2. evitar implementação desnecessária;
3. reutilizar código e ferramentas existentes;
4. gerar a menor solução correta;
5. encerrar assim que a tarefa estiver validada;
6. evitar ciclos de correção sem progresso.
7. Ter um otimização de token que faça sentido usar o orquestador e não outros plugins

## 3. Métricas de sucesso

Criar uma linha de base antes de ativar o otimizador.

| Métrica | Objetivo inicial |
|---|---:|
| Tokens totais por tarefa concluída | reduzir 20–30% |
| Chamadas ao modelo | reduzir sem piorar a qualidade |
| Chamadas de ferramentas repetidas | próximo de zero |
| Taxa de tarefas concluídas | manter ou aumentar |
| Testes aprovados | não reduzir |
| Falhas de segurança | zero regressão |
| Retrabalho | reduzir |
| Latência | reduzir ou manter |

A métrica principal é:

```text
custo total por tarefa concluída corretamente
```

Menos tokens com mais falhas não é otimização.

## 3.1 Status atual da implementacao

As Fases 0 a 7 ja possuem contratos portateis, testes e evidencias locais no proprio CrewLoop:

| Fase | Status | Evidencia principal |
|---|---|---|
| 0 - Medicao e linha de base | Implementada | [Spec 014](specs/features/04-workflow/spec-014-token-optimization-phase-0-1.md) |
| 1 - Politica minimalista | Implementada | [Spec 014](specs/features/04-workflow/spec-014-token-optimization-phase-0-1.md) |
| 2 - Contexto inteligente | Implementada | [Spec 015](specs/features/04-workflow/spec-015-token-optimization-phase-2-context-selection.md) |
| 3 - Controle de execucao | Implementada | [Spec 016](specs/features/04-workflow/spec-016-token-optimization-phase-3-execution-control.md) |
| 4 - Verificacao automatica | Implementada | [Spec 017](specs/features/04-workflow/spec-017-token-optimization-phase-4-automatic-verification.md) |
| 5 - Roteamento de modelos | Implementada | [Spec 018](specs/features/04-workflow/spec-018-token-optimization-phase-5-model-routing.md) |
| 6 - Perfis de execucao | Implementada | [Spec 019](specs/features/04-workflow/spec-019-token-optimization-phase-6-execution-profiles.md) |
| 7 - Otimizacao continua | Implementada | [Spec 020](specs/features/04-workflow/spec-020-token-optimization-phase-7-continuous-optimization.md), [Spec 021](specs/features/04-workflow/spec-021-continuous-benchmark-ci-gate.md), [Spec 037](specs/features/04-workflow/spec-037-execution-record-benchmark-bridge.md) e specs relacionadas |

O benchmark de seis cenarios e os fixtures de execution-record sao evidencia sintetica, deterministica e local. Eles nao representam telemetria inventada de provedores. Registros reais so podem entrar no mesmo contrato quando forem produzidos pelo fluxo de execucao e validados com medicoes disponiveis.

## 4. Princípios do sistema

### 4.1 Política minimalista

Antes de criar algo novo, o agente deve avaliar:

1. a funcionalidade realmente precisa existir?
2. já existe algo equivalente no projeto?
3. a biblioteca padrão resolve?
4. a plataforma possui um recurso nativo?
5. uma dependência já instalada resolve?
6. qual é a menor implementação correta?

### 4.2 Segurança fora do modo econômico

O otimizador nunca deve remover automaticamente:

- validação de entrada;
- autorização e autenticação;
- tratamento de erros que evita perda de dados;
- proteção contra operações destrutivas;
- acessibilidade;
- testes essenciais;
- confirmações exigidas pelo usuário.

### 4.3 Contexto relevante

Enviar somente o contexto necessário para a tarefa:

- arquivos relacionados;
- funções e classes relevantes;
- dependências importantes;
- testes associados;
- resumo do histórico;
- regras de segurança.

Não enviar o repositório inteiro por padrão.

### 4.4 Encerramento antecipado

Quando a alteração estiver aplicada, validada e dentro do escopo, o orquestrador deve finalizar sem iniciar novas revisões desnecessárias.

## 5. Fluxo desejado

```text
Pedido do usuário
        ↓
Classificação da tarefa
        ↓
Política minimalista
        ↓
Busca por código reutilizável
        ↓
Seleção de contexto
        ↓
Execução do agente
        ↓
Testes e validações
        ↓
Finalização ou correção controlada
```

## 6. Roadmap por fases

### Fase 0 — Medição e linha de base

#### Objetivo

Descobrir onde o orquestrador gasta tokens e tempo atualmente.

#### Entregas

- registro de cada chamada ao modelo;
- contagem de tokens de entrada e saída;
- registro de chamadas de ferramentas;
- contagem de turnos;
- custo por tarefa;
- duração;
- resultado dos testes;
- número de tentativas e falhas.

#### Critério de saída

Conseguir comparar duas execuções da mesma tarefa com dados objetivos.

---

### Fase 1 — Política minimalista

#### Objetivo

Evitar que o agente implemente complexidade que não foi solicitada.

#### Entregas

- regras YAGNI;
- preferência por código existente;
- preferência por biblioteca padrão;
- preferência por recursos nativos;
- rejeição de dependências desnecessárias;
- preferência pela menor alteração correta;
- preservação explícita das regras de segurança.

#### Critério de saída

As mesmas tarefas geram alterações menores sem queda na correção.

#### Observação

Não enviar um documento extenso em todas as chamadas. Criar uma versão curta da política adequada ao tipo de tarefa.

---

### Fase 2 — Contexto inteligente

#### Objetivo

Reduzir tokens de entrada sem remover informações necessárias.

#### Entregas

- seleção de arquivos relevantes;
- remoção de conteúdo duplicado;
- resumo de histórico antigo;
- truncamento de saídas grandes;
- reaproveitamento de resultados já obtidos;
- orçamento máximo de tokens por etapa.

#### Critério de saída

O agente recebe menos contexto e mantém a mesma taxa de conclusão.

#### Primeira abordagem

Começar com busca textual, análise de imports e seleção por arquivos modificados. Adicionar busca semântica somente se os dados demonstrarem necessidade.

---

### Fase 3 — Controle de execução

#### Objetivo

Evitar turnos e chamadas de ferramentas sem valor.

#### Entregas

- limite de tentativas;
- limite de tokens;
- limite de chamadas de ferramentas;
- deduplicação de chamadas;
- cache de resultados;
- detecção de falta de progresso;
- condições objetivas de parada.

#### Critério de saída

Reduzir chamadas por tarefa sem aumentar falhas ou retrabalho.

#### Condição de parada mínima

```text
alteração aplicada
+ testes aprovados
+ escopo respeitado
+ nenhuma validação obrigatória pendente
→ finalizar
```

---

### Fase 4 — Verificação automática

#### Objetivo

Evitar que o próprio modelo seja a única autoridade sobre a qualidade do resultado.

#### Entregas

- execução de testes;
- validação de formato;
- verificação de arquivos alterados;
- scanner de secrets;
- verificações básicas de segurança;
- detecção de comandos destrutivos;
- correção limitada quando necessário.

#### Critério de saída

Reduzir correções manuais e impedir que a economia de tokens remova proteções importantes.

---

### Fase 5 — Roteamento de modelos

#### Objetivo

Usar o modelo adequado para cada etapa.

#### Possíveis divisões

| Etapa | Modelo recomendado |
|---|---|
| Classificação | econômico |
| Busca de arquivos | econômico |
| Resumo | econômico |
| Alteração trivial | rápido |
| Implementação complexa | mais capaz |
| Segurança e depuração | mais capaz + validação |

#### Critério de saída

Reduzir custo sem aumentar retrabalho.

#### Regra importante

Risco deve pesar mais que tamanho. Uma alteração pequena em autenticação pode exigir mais controle que uma alteração grande em CSS.

---

### Fase 6 — Perfis de execução

#### Objetivo

Adaptar o comportamento à natureza da tarefa.

#### Perfis sugeridos

- `minimal`: menor contexto e menor número de chamadas;
- `balanced`: equilíbrio entre custo e qualidade;
- `safe`: mais validações e confirmações;
- `review`: foco em complexidade, segurança e regressões.

#### Critério de saída

O usuário ou o orquestrador consegue escolher o equilíbrio adequado para cada tarefa.

---

### Fase 7 — Otimização contínua

#### Objetivo

Melhorar o sistema com dados reais, não com suposições.

#### Entregas

- testes A/B;
- conjunto fixo de tarefas de avaliação;
- comparação entre políticas;
- relatório de custo e qualidade;
- acompanhamento de regressões;
- ajuste de limites e roteamento.

#### Critério de saída

Cada mudança no otimizador pode ser comparada com a versão anterior.

## 7. MVP recomendado

O primeiro lançamento deve conter apenas:

1. telemetria;
2. política minimalista;
3. seleção básica de contexto;
4. limite de turnos e tokens;
5. condições de parada;
6. execução de testes;
7. comparação A/B.

Deixe para depois o suporte a múltiplos agentes, marketplace, embeddings, fine-tuning e dashboards complexos.

## 8. O que não fazer no início

- não copiar todos os adaptadores do Ponytail;
- não criar um banco vetorial antes de medir a necessidade;
- não reduzir tokens removendo validações;
- não injetar a mesma política completa em todos os turnos;
- não iniciar revisão automática após toda tarefa simples;
- não usar um arquivo global para o estado de todas as sessões;
- não otimizar apenas linhas de código;
- não declarar sucesso sem medir correção e segurança.

## 9. Riscos e trade-offs

| Risco | Consequência | Mitigação |
|---|---|---|
| Contexto curto demais | O agente não entende o projeto | preservar arquivos e regras relevantes |
| Política agressiva | Funcionalidade ou validação removida | regras de segurança obrigatórias |
| Muitos limites | Tarefa complexa é interrompida | limites por risco e tipo de tarefa |
| Cache desatualizado | Decisão baseada em código antigo | invalidar cache após alterações |
| Modelo barato inadequado | Mais retrabalho | medir taxa de sucesso por etapa |
| Muitas tentativas automáticas | Custo maior | detectar falta de progresso |
| Estado global | Conflito entre sessões | estado isolado por sessão |

## 10. Critério de sucesso do produto

O otimizador estará pronto quando, em um conjunto representativo de tarefas, ele demonstrar:

- menor custo médio por tarefa concluída;
- menos tokens totais;
- menos chamadas redundantes;
- mesma ou maior taxa de correção;
- nenhuma regressão de segurança;
- menos retrabalho;
- comportamento previsível quando os limites são atingidos.

## 11. Direção futura

O Ponytail serve como referência de política comportamental. Este projeto deve ir além da instrução textual e atuar em três níveis:

```text
Orientar o modelo
+ reduzir o contexto
+ controlar a execução
+ validar o resultado
```

Essa combinação transforma o conceito de “agente minimalista” em uma camada real de otimização do orquestrador.

## 12. Proximo passo

Concluir o gate manual do dashboard descrito em [`tests/dashboard-acceptance-matrix.md`](tests/dashboard-acceptance-matrix.md) e nos Specs 031/032, registrando viewport, tema, densidade, navegador, teclado, contraste e leitor de tela. A automacao de preflight e interaction smoke e complementar e nao substitui essa validacao humana.

Depois, quando existirem registros reais suficientes, comparar uma execucao baseline e uma candidate com o benchmark existente, usando o contrato [`TaskExecutionRecord`](specs/features/04-workflow/spec-040-execution-record-handoff.md). A decisao continua sendo apenas `adopt_candidate` ou `keep_baseline`; nenhuma politica e ativada automaticamente.
