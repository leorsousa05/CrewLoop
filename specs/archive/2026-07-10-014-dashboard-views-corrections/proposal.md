# Proposal: Dashboard Views Corrections

## Status
- **State:** draft
- **Created:** 2026-07-10
- **Author:** architect

## Problem Statement

Durante os testes da branch `fix-issues` três problemas concretos foram observados na aba de visualização do CrewLoop Dashboard, além de uma melhoria solicitada na forma como arquivos são apresentados:

1. **Network 3D renomeia o nó de skill em vez de criar novos nós.**  
   Quando a IA muda de skill, o grafo 3D parece "trocar o nome" da bolinha atual. Isso acontece porque o grafo é construído a partir da skill ativa da sessão (`session.activeSkill`) e todas as invocações são ligadas a um único nó skill. Quando a skill muda, o nó antigo some e o novo absorve as mesmas ferramentas, perdendo o histórico de qual skill usou qual ferramenta/arquivo.

2. **AGY não aparece na view Files ao ler arquivos.**  
   Eventos `Read` vindos do Antigravity (AGY) carregam o caminho na chave `AbsolutePath`. A função `resolvePath` usada para montar a atividade de arquivos só reconhece `path`, `file_path` e `filePath`, ignorando `AbsolutePath` e `TargetFile`. Por isso o arquivo é exibido no Timeline, mas não é agrupado em Files.

3. **Kimi lista arquivos lidos na view Files, mas não exibe conteúdo.**  
   Leituras do Kimi conseguem produzir `detail` e `operationType: 'read'`, então o arquivo aparece na lista. No entanto, o painel de detalhes (`FileDiff`) não renderiza o conteúdo lido porque o snippet só é extraído das chaves `diff` ou `contentSnippet`, e o output do Kimi para `Read` pode vir em outras chaves ou ser descartado pela sanitização.

4. **View Files deve funcionar como um file explorer.**  
   O usuário espera que, ao clicar em um arquivo, ele fique "aberto" no painel direito, mostrando onde a IA leu ou modificou. Hoje o painel só mostra um snippet estático quando disponível, sem indicar linhas/posições, sem separar leituras de edições e sem manter o arquivo selecionado em destaque.

## Goals

1. Fazer com que o grafo 3D mantenha **um nó por skill** e ligue cada ferramenta/arquivo à skill que estava ativa no momento do evento.
2. Fazer com que a view Files reconheça campos de path de **todas as IAs suportadas** (`path`, `file_path`, `filePath`, `AbsolutePath`, `TargetFile`, etc.).
3. Garantir que o conteúdo lido pelo **Kimi** seja preservado e exibido no painel de arquivo.
4. Evoluir a view Files para um **file explorer mínimo**: lista de arquivos à esquerda, visualizador à direita, com badges de operação e destaque do arquivo selecionado.

## Non-Goals

- Não reescrever o visual do dashboard (manter Tailwind + React 18).
- Não alterar o protocolo WebSocket nem os tipos públicos sem necessidade.
- Não implementar edição de arquivos pelo dashboard (somente leitura/observação).
- Não persistir estado de arquivos abertos entre recarregamentos de página.

## Constraints

- Manter sanitização de payloads: nunca exibir chaves perigosas (`command`, `api_key`, etc.).
- Preservar compatibilidade com os adapters existentes (Kimi, Claude, Codex, AGY).
- Limitar snippets a um tamanho seguro (respeitar `MAX_PAYLOAD_STRING_LENGTH`).
- Manter os testes existentes passando e adicionar novos testes de regressão.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mudar a chave de identificação do nó skill quebrar filtros ou animações do `react-force-graph-3d` | Médio | Manter IDs estáveis por skillName e testar transições no Network3D |
| Adicionar `AbsolutePath`/`TargetFile` ao `resolvePath` expor caminhos sensíveis | Baixo | Esses campos já passam pelo sanitizer; `resolvePath` atua sobre dados já sanitizados |
| Exibir conteúdo de leitura do Kimi aumentar payload WebSocket | Médio | Aplicar o truncamento existente e manter `MAX_PAYLOAD_STRING_LENGTH` |
| File explorer aumentar complexidade da UI | Baixo | Reutilizar componentes `FileList`/`FileDiff`; adicionar apenas badges e scroll-to-op |

## Success Criteria

- [ ] Ao trocar de skill em uma sessão, o grafo 3D mostra duas bolhas de skill distintas, cada uma ligada às ferramentas usadas enquanto estava ativa.
- [ ] Leituras de arquivo do AGY aparecem na view Files com badge `read`.
- [ ] Leituras de arquivo do Kimi aparecem na view Files e o painel direito exibe o conteúdo lido (truncado se necessário).
- [ ] Todos os testes do dashboard continuam passando (`npm test` em `servers/dashboard`).
