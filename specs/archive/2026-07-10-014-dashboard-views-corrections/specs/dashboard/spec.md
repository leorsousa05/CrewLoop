# Spec Delta: Dashboard Views

## Current State

O dashboard possui as seguintes views alimentadas por eventos WebSocket:

- **Network 3D** (`src/lib/graph.ts` + `ui/src/components/Network3D.tsx`): monta um grafo de skill → tool → file com base na sessão selecionada e suas invocações. A skill é representada por um único nó derivado de `session.activeSkill?.name`.
- **Files** (`src/lib/invocations.ts`, `src/lib/paths.ts`, `ui/src/components/FileActivity.tsx`, etc.): agrupa invocações por caminho de arquivo usando `resolvePath(input, output)` e exibe lista + painel de snippet.
- **Timeline** (`ui/src/components/Timeline.tsx`): lista eventos brutos, independente de `resolvePath`.
- **Adapters** (`src/adapters/kimi.ts`, `src/adapters/agy.ts`, etc.): normalizam payloads dos agentes para `DashboardEvent`.
- **Sanitização** (`src/filters/sanitize.ts`, `src/config.ts`): remove chaves perigosas e trunca strings longas.

## Changes

### ADDED

- Suporte aos campos de path do AGY em `resolvePath`:
  - `AbsolutePath`
  - `TargetFile`
  - variações lowercase (`absolutepath`, `targetfile`)
- Extração de snippet de leitura para o Kimi em `buildFileActivity` além de `diff`/`contentSnippet`:
  - `content`
  - `output`
  - `result`
  - `contentsnippet`
- Campo `activeSkillAtStart` (ou similar) em `ToolInvocation` para preservar a skill ativa no momento do evento.
- Novo nó skill por skillName distinto no grafo 3D, permitindo múltiplos nós de skill por sessão.
- Estado de "arquivo selecionado" persistente durante a sessão na view Files.
- Badges/indicadores de operação (`read`/`edit`/`other`) por operação individual no painel de arquivo.

### MODIFIED

- `src/lib/graph.ts`:
  - Alterar `buildGraph3D` para usar a skill ativa no momento de cada invocação (`inv.skill` ou fallback) em vez de `session.activeSkill`.
  - Garantir IDs estáveis por skillName (`skill:<name>`).
- `src/lib/paths.ts`:
  - Expandir `resolvePath` para cobrir campos AGY e variações de caixa.
- `src/lib/invocations.ts`:
  - Preencher `inv.skill` com a skill ativa do evento durante `projectInvocations`.
  - Expandir lógica de snippet em `buildFileActivity` para capturar conteúdo de leitura.
- `src/adapters/kimi.ts`:
  - Garantir que o output de ferramentas de leitura seja preservado (não sobrescrito para `{ output: string }` de forma a perder chaves úteis).
- `src/filters/sanitize.ts` / `src/config.ts`:
  - Adicionar chaves de conteúdo de leitura a `SAFE_PAYLOAD_KEYS` (ex.: `content`, `result`, `contentsnippet`) se ainda não estiverem.
- `ui/src/components/FileDiff.tsx`:
  - Renderizar conteúdo de leitura, não apenas diff.
  - Exibir lista de operações com timestamp e tipo.
- `ui/src/components/FileList.tsx`:
  - Manter item selecionado destacado.
  - Mostrar badges por operação individual.
- `ui/src/App.tsx`:
  - Garantir que `selectedPath` seja mantido ao receber novos eventos (atualmente recria o estado a cada render? verificar).

### REMOVED

- Nenhuma remoção planejada.

## Migration Notes

- Não há dados persistentes a migrar (o dashboard é in-memory).
- Após o deploy, os eventos novos já usarão os campos expandidos.

## Backward Compatibility

- Mudanças são retrocompatíveis: adapters antigos continuam funcionando; novos campos são opcionais.
- O protocolo WebSocket (`ClientEvent`, `ClientSession`) pode ganhar campos opcionais, mas tipos existentes não serão removidos.
