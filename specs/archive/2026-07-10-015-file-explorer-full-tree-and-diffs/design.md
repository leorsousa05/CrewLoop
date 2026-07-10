# Design: File Explorer Full Tree and Diffs

## [Padrões Aplicados]
- **API Contracts / Endpoint Isolation:** Adicionar endpoints REST específicos (`/api/workspace-files`, `/api/file-content`, `/api/file-diff`) isolados de outras rotas do dashboard.
- **Path Resolution & Security (Guard Pattern):** Validar caminhos de arquivos para evitar Directory Traversal, garantindo que o caminho resolvido esteja contido no diretório raiz do workspace.
- **Command Injection Immunization:** Passar argumentos como um array estrito usando `child_process.execFile` em vez de usar `exec` com concatenação de strings no shell.
- **UI Composition & State Elevation:** Elevar o estado de visualização (abas "File Content" vs. "Diff/Snippet", conteúdo do arquivo carregado) em `FilesView` ou `FileDiff`.

## [Estratégia de Implementação]

### 1. Backend: Endpoints adicionais em `server.ts`
- **`GET /api/workspace-files`**:
  Varre recursivamente o diretório raiz (`process.cwd()`).
  Filtra pastas: `.git`, `node_modules`, `dist`, `.next`, `build`, `coverage`, `.gemini`, `out`.
  Retorna: `string[]` (caminhos relativos).
- **`GET /api/file-content`**:
  Parâmetro de busca: `?path=relative/path/to/file`.
  Segurança: Resolve o caminho absoluto usando `path.resolve(process.cwd(), relativePath)`.
  Verifica se o caminho resolvido começa com `process.cwd()`. Se não, retorna 403 Forbidden.
  Lê o arquivo usando `fs.promises.readFile(absPath, 'utf-8')`.
  Se falhar ou for binário, retorna `{ error: "..." }` ou código 400.
  Retorna: `{ content: string }`.
- **`GET /api/file-diff`**:
  Parâmetro de busca: `?path=relative/path/to/file`.
  Segurança: Resolve o caminho absoluto e valida se está dentro de `process.cwd()`.
  Executa de forma segura:
  ```typescript
  execFile('git', ['diff', 'HEAD', '--', absPath], (error, stdout, stderr) => {
    // Nota: git diff retorna código de saída 1 se houver diferenças, o que não é uma falha
    if (error && error.code !== 1) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Git failed' }));
      return;
    }
    // Se estiver limpo ou for arquivo não rastreado (untracked):
    if (!stdout && fs.existsSync(absPath)) {
      execFile('git', ['status', '--porcelain', absPath], (err, statusOut) => {
        if (statusOut.startsWith('??')) {
          // Arquivo untracked: simular diff de adição completa
          fs.promises.readFile(absPath, 'utf-8').then(content => {
            res.end(JSON.stringify({ diff: content.split('\n').map(l => '+' + l).join('\n') }));
          });
        } else {
          res.end(JSON.stringify({ diff: '' }));
        }
      });
      return;
    }
    res.end(JSON.stringify({ diff: stdout }));
  });
  ```

### 2. Normalização de Leituras em `invocations.ts`
- Para operações de **leitura** (`read`), continuamos a capturar `lineHint` do input da ferramenta (ex: `StartLine` / `EndLine`) para que o visualizador possa destacar o intervalo de linhas lidas na aba de Conteúdo.

### 3. Frontend: File Explorer & Tabs em `FileList.tsx` e `FileDiff.tsx`
- **Integração do File Explorer Tree:**
  Carrega a lista de arquivos via `fetch('/api/workspace-files')` ao montar o componente `FilesView.tsx`.
  Mescla a lista de arquivos do workspace com os arquivos ativos da sessão (`files` com operações).
  Em `FileList.tsx`, exibe a árvore de diretórios ou lista completa. Para arquivos inativos, exibe nome cinza/secundário sem badges. Para ativos, exibe em negrito e com os badges normais.
- **Alternador de Abas em `FileDiff.tsx`:**
  Mantém estado `activeTab: 'content' | 'diff'`.
  Se `'content'`, busca o conteúdo do arquivo via `/api/file-content?path=...`.
  Exibe o conteúdo completo do arquivo com numeração de linhas.
  Se `latest.lineHint` estiver presente, destaca as linhas correspondentes com fundo destacado (`bg-running/10` para leituras, ou `bg-success/5` para escritas).
  Se `'diff'`, busca o diff real do Git via `/api/file-diff?path=...`. Se houver diff real retornado, renderiza-o formatado. Se for limpo ou falhar, faz fallback para o snippet do evento original.

## 7 Analysis Questions

1. **Domain and bounded context placement?**
   - Backend routes em `server.ts` e lógica de agregação em `invocations.ts`. Frontend em `FilesView`, `FileList`, e `FileDiff`.
2. **Core responsibilities of new/changed components?**
   - `server.ts`: Listar caminhos, obter diff do Git de forma segura, e ler arquivos.
   - `FileList`/`FileDiff`: Renderizar árvore completa de arquivos e exibir abas Conteúdo/Diff com destaques de linhas.
3. **Contracts (interfaces, types, APIs) to define or change?**
   - API: `GET /api/workspace-files` -> `string[]`.
   - API: `GET /api/file-content?path=string` -> `{ content: string }`.
   - API: `GET /api/file-diff?path=string` -> `{ diff: string }`.
4. **Which parts need tests per TDD skip criteria?**
   - Lógica de varredura segura de arquivos e geração de diffs no backend precisam de cobertura de testes. Visualizações React podem ser testadas manualmente.
5. **Architecture that minimizes ambiguity?**
   - Isolamento completo das rotas REST locais e delegação da renderização baseada em abas bem definidas no frontend.
6. **Project structure changes needed?**
   - Nenhuma alteração estrutural de pastas de projeto.
7. **Key trade-offs?**
   - Desempenho de varredura recursiva de diretórios no backend vs. Fidelidade visual. Mitigado ignorando pastas pesadas de build/dependências.

---

## UI/UX Visual Specification

### 1. Brand Narrative & Case-Study Frame
* **Problem:** Desenvolvedores precisam de clareza imediata sobre a estrutura do projeto e o contexto de quais arquivos foram lidos ou modificados pelos agentes sem alternar para o editor.
* **Audience:** Engenheiros de software analisando fluxos autônomos complexos.
* **Insight:** Arquivos isolados sem a árvore estrutural do workspace quebram a orientação espacial.
* **Solution:** Uma árvore completa estilo IDE que serve como seletor, acoplada a um visualizador com abas que mescla diffs focados com a leitura integral do arquivo.

### 2. Aesthetic Direction: Terminal Monospace / Utilitarian
* Uma estética crua de terminal com grades rígidas, fontes monoespaçadas, badges bem definidos e contrastes cirúrgicos, projetado para parecer uma extensão nativa de um terminal de desenvolvimento.

### 3. Color System (Dark-Mode Theme)
| Token | Dark Value | Usage |
|-------|------------|-------|
| `--bg-primary` | `hsl(240, 10%, 4%)` | Fundo principal da view |
| `--bg-surface` | `hsl(240, 6%, 8%)` | Sidebar esquerda e visualizador direito |
| `--bg-elevated` | `hsl(240, 6%, 12%)` | Abas ativas, botões e dropdowns |
| `--text-primary` | `hsl(0, 0%, 98%)` | Títulos e arquivos selecionados/modificados |
| `--text-secondary` | `hsl(240, 5%, 70%)` | Nomes de diretórios e arquivos inativos |
| `--text-muted` | `hsl(240, 5%, 45%)` | Linhas inalteradas, numerações e metadados |
| `--accent` | `hsl(142.1, 76.2%, 36.3%)` | Linhas ativas, realce esquerdo de arquivo selecionado |
| `--success` | `hsl(142.1, 76.2%, 36.3%)` | Diffs de adições e linhas gravadas |
| `--error` | `hsl(346.8, 77.2%, 49.8%)` | Diffs de deleções |
| `--running` | `hsl(217.2, 91.2%, 59.8%)` | Destaque de linhas lidas |
| `--border` | `hsl(240, 6%, 14%)` | Linhas divisórias de grade de 1px |

### 4. Typography System
* **Font Family:** `JetBrains Mono`, `Fira Code`, monospace.
* **Sizes:**
  * **H3 (Header de Visualizador):** 14px, `line-height: 20px`, `letter-spacing: -0.01em`, `weight: 600`.
  * **Body (Code Text):** 13px, `line-height: 18px`, `letter-spacing: normal`, `weight: 400`.
  * **Meta/Badges:** 11px, `line-height: 14px`, `letter-spacing: 0.05em`, `weight: 600` (caps).

### 5. Layout Structure (ASCII Wireframe)
```text
+-----------------------------------------------------------------------------------+
| FILES VIEW                                                                        |
+------------------------------------+----------------------------------------------+
| [File Explorer Directory Tree]     | [Abas de Visualização]                       |
|                                    | > [ File Content ]   [ Diff / Snippet ]      |
| > src/                             +----------------------------------------------+
|   > components/                    | 01 | import React from 'react';              |
|     - Button.tsx                   | 02 |                                         |
|     - List.tsx          [READ]     | 03 | export function Button() {              |
|   > lib/                           | 04 |   // ...                                |
|     - paths.ts          [EDIT]     | 05 | }                                       |
| - README.md                        |                                              |
| - package.json                     |                                              |
|                                    |                                              |
+------------------------------------+----------------------------------------------+
```

### 6. Component Specs & Interaction
* **File Explorer Items:**
  * *Inativos:* Nome do arquivo em cinza médio (`--text-secondary`).
  * *Ativos:* Nome em branco (`--text-primary`), texto em negrito, e badge de operação à direita (`[READ]` ou `[EDIT]`).
  * *Selecionado:* Fundo `--bg-elevated`, borda esquerda ativa de 2px de cor `--accent`, texto destacado.
* **Tabs do Visualizador:**
  * Dispostas lado a lado no header do painel.
  * Aba ativa possui realce com linha inferior `--accent` de 2px e texto `--text-primary`.
  * Transição suave de opacidade e cor no hover.

### 7. Motion Specs
| Animation | Trigger | Property | Duration | Easing | Fallback |
|-----------|---------|----------|----------|--------|----------|
| Tab switch | click | opacity | 150ms | ease-out | instant swap |
| Gutter glow | operation | background | 250ms | ease-in-out | static highlight |
