# Tasks: File Explorer Full Tree and Diffs

## Setup
- [x] Create spec folder structure
- [x] Initialize `.spec.yaml`

## Implementation

### Backend Endpoints
- [x] Adicionar função utilitária de listagem recursiva de arquivos respeitando filtros de exclusão (`.git`, `node_modules`, `dist`, `.next`, `build`, etc.).
- [x] Adicionar rota `GET /api/workspace-files` em `server.ts` que retorna os arquivos relativos.
- [x] Adicionar rota `GET /api/file-content` com validação estrita contra Directory Traversal.
- [x] Adicionar rota `GET /api/file-diff` executando `git diff HEAD` de forma segura via `execFile` com detecção de arquivos untracked.

### Diff & Snippet Reconstruction
- [x] Para operações de leitura, capturar `lineHint` no backend e repassar ao frontend.
- [x] Para operações de escrita que não possuem diff nativo em formato string, obter o diff dinamicamente a partir do endpoint `/api/file-diff` no frontend.

### UI File Explorer (FileList)
- [x] No `FilesView.tsx`, carregar lista completa de arquivos de `/api/workspace-files`.
- [x] Combinar a lista do workspace com o estado de operações de arquivos do frontend.
- [x] Atualizar `FileList.tsx` para listar todos os arquivos do workspace (com realce em negrito/badges para arquivos ativos).

### UI Code Viewer (FileDiff)
- [x] Adicionar abas "Conteúdo" (File Content) e "Diff da Operação" (Diff / Snippet) em `FileDiff.tsx`.
- [x] Buscar conteúdo completo do arquivo via `/api/file-content?path=...` ao selecionar/trocar a aba para "Conteúdo".
- [x] Buscar diff do arquivo via `/api/file-diff?path=...` ao selecionar/trocar a aba para "Diff da Operação".
- [x] Renderizar o conteúdo completo com numeração de linhas e destaque visual na faixa correspondente a `StartLine`/`EndLine` ou `lineHint`.

## Testing
- [x] Escrever teste unitário para listagem de arquivos e prevenção de directory traversal.
- [x] Escrever teste unitário para o endpoint de diff seguro.
- [x] Rodar suíte de testes do servidor.
- [x] Rodar validação de skills.

## Verification
- [x] Iniciar dashboard e verificar se o File Explorer lista toda a árvore.
- [x] Ler README.md e verificar realce de leitura na aba "Conteúdo".
- [x] Executar edição com Kimi e verificar diff real do Git renderizado na aba "Diff".

## Completion
- [ ] Run Shipper to commit/branch/PR.
- [ ] Archive change folder to `specs/archive/`.
- [x] Update `.spec.yaml` status to completed.
