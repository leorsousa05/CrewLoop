# Design: Dashboard Views Corrections

## Overview

Esta mudança corrige três bugs de renderização no dashboard e evolui a view Files para um file explorer mínimo. A solução é dividida em três pilares:

1. **Grafo 3D com histórico de skills:** cada skill usada na sessão vira um nó separado; cada ferramenta/arquivo é ligada à skill ativa no momento do evento.
2. **Resolução de caminhos cross-agent:** expandir `resolvePath` para reconhecer os campos de path usados por Kimi, Claude, Codex e AGY.
3. **File explorer com conteúdo de leitura:** preservar o conteúdo retornado por leituras (Kimi/AGY/Claude/Codex) e exibi-lo no painel direito, junto com a lista de operações realizadas no arquivo.

## Proposed Directory & File Structure

```
servers/dashboard/
├── src/
│   ├── lib/
│   │   ├── graph.ts               # Modified — multi-skill nodes, per-invocation skill link
│   │   ├── paths.ts               # Modified — AGY path keys, case-insensitive lookup
│   │   ├── invocations.ts         # Modified — skill snapshot, read snippet extraction
│   │   └── operations.ts          # (possibly) keep path keys in sync
│   ├── adapters/
│   │   ├── kimi.ts                # Modified — preserve read output keys
│   │   └── agy.ts                 # (possibly) ensure detail carries path
│   ├── filters/
│   │   ├── sanitize.ts            # Modified — keep read content keys safe
│   │   └── sanitize.test.ts       # New tests
│   ├── config.ts                  # Modified — add read content keys to SAFE_PAYLOAD_KEYS
│   ├── types.ts                   # Modified — add optional fields if needed
│   ├── state.ts                   # (possibly) store active skill on each event
│   └── presenter.ts               # Unchanged (presents existing fields)
├── ui/src/
│   ├── components/
│   │   ├── Network3D.tsx          # Modified — verify stable multi-skill rendering
│   │   ├── FileActivity.tsx       # Modified — pass active operation
│   │   ├── FileList.tsx           # Modified — selection highlight, op badges
│   │   ├── FileDiff.tsx           # Modified — render read content, operation list
│   │   └── views/FilesView.tsx    # Modified — hoist selection state
│   ├── App.tsx                    # Modified — keep selectedPath stable
│   └── lib/filter.ts              # Unchanged (filter logic remains)
└── src/tests/
    └── (existing + new regression tests)
```

## Code Architecture & Design Patterns

- **Architecture Model:** MVC dividido em camadas — backend normaliza/sanitiza eventos (`adapters`, `filters`, `state`), backend deriva estruturas (`invocations`, `graph`, `paths`), frontend apresenta (`ui/components`). Mantemos essa separação.
- **Design Patterns Used:**
  - **Strategy:** adapters específicos por agente, todos convergindo para `DashboardEvent`.
  - **Normalizer (`resolvePath`):** função centralizada que isola o conhecimento dos formatos de path de cada agente.
  - **Projection (`projectInvocations`, `buildFileActivity`, `buildGraph3D`):** transformam o log de eventos em estruturas de apresentação sem mutar o estado original.
  - **Stable Identity:** IDs de nós (`skill:<name>`, `tool:<name>`, `file:<path>`) garantem que o `react-force-graph-3d` reuse objetos e mantenha animações suaves.

## Data Model

```typescript
// servers/dashboard/src/types.ts (additions only)
export interface DashboardEvent {
  // existing fields...
  skill?: string;            // skill ativa no momento do evento (já existe, mas será preenchida)
  default_skill?: string;    // fallback configurado
}

export interface ToolInvocation {
  // existing fields...
  skill?: string;            // skill ativa quando a invocação começou
}

// Optional: explicit operation metadata for the file explorer
export interface FileOp {
  // existing fields...
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  lineHint?: string;         // e.g. "StartLine: 1" when available
}
```

## API Contracts

```typescript
// servers/dashboard/src/lib/paths.ts
/**
 * Resolves the affected file path from tool input/output.
 * Recognizes Kimi/Claude/Codex/AGY path fields case-insensitively.
 */
export function resolvePath(input?: unknown, output?: unknown): string | undefined;

// servers/dashboard/src/lib/invocations.ts
export interface ToolInvocation {
  id: string;
  tool: string;
  eventType: string;
  status: 'running' | 'success' | 'error' | string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  detail?: string;
  skill?: string;            // ← populated from the event's active skill
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  meta?: boolean;
}

export function projectInvocations(events: ClientEvent[]): ToolInvocation[];
export function buildFileActivity(
  invocations: ToolInvocation[],
  resolvePathFn: (input?: unknown, output?: unknown) => string | undefined
): FileEntry[];

// servers/dashboard/src/lib/graph.ts
export function buildGraph3D(
  session: ClientSession | undefined,
  invocations: ToolInvocation[]
): Graph3D;
```

## Flow Diagrams

### Skill change in Network 3D
1. Event `skill_change` chega com `skill: 'reviewer'`.
2. `state.ts` atualiza `session.active_skill` para `'reviewer'`.
3. Tool events subsequentes carregam `skill` preenchida pelo estado no momento do evento.
4. `projectInvocations` preserva `inv.skill` em cada `ToolInvocation`.
5. `buildGraph3D` cria/usa nó `skill:reviewer` e liga apenas as invocações cujo `inv.skill === 'reviewer'`.
6. Nó `skill:architect` permanece no grafo com suas próprias ferramentas/arquivos.

### AGY read path resolution
1. AGY envia `PreToolUse`/`PostToolUse` com `toolCall.name: 'view_file'`, `args.AbsolutePath: '/x/README.md'`.
2. `normalizeAgy` define `tool: 'Read'`, `detail: '/x/README.md'`, `input: args`.
3. `buildEvent` sanitiza e classifica `operationType: 'read'`.
4. `projectInvocations` cria invocação com `input` sanitizado.
5. `buildFileActivity` chama `resolvePath(inv.input, inv.output)`.
6. `resolvePath` encontra `AbsolutePath` e retorna o caminho.
7. File entry é criada com badge `read`.

### Kimi read content rendering
1. Kimi envia `PostToolUse` para `Read` com `tool_output` contendo `content`.
2. `normalizeKimi` preserva o output como objeto.
3. `sanitizeToolPayload` mantém `content` (SAFE_PAYLOAD_KEYS) e aplica truncamento.
4. `buildFileActivity` extrai snippet de `output.content`.
5. `FileDiff` renderiza o snippet como conteúdo de leitura (não diff).

## State Management

- **Backend:** `StateStore` mantém `active_skill` por sessão. Cada evento recebido deve ser anotado com a skill ativa no momento (ou fallback/default) antes de ser adicionado a `session.events`, para que projeções posteriores não dependam do estado mutável.
- **Frontend:** `FilesView` mantém `selectedPath` via `useState`. Esse estado deve ser preservado quando novos eventos chegam, desde que o arquivo ainda exista na lista filtrada.

## Error Handling

- Se `resolvePath` não encontrar caminho, a invocação é ignorada pela view Files (comportamento atual).
- Se o conteúdo de leitura exceder `MAX_PAYLOAD_STRING_LENGTH`, o sanitizer trunca com marcador `…[truncated N chars]`.
- Se o output do Kimi for uma string pura, `normalizeKimi` continua a embrulhar em `{ output: string }`, mas `buildFileActivity` tentará extrair snippet de `output.output` como fallback.

## Performance Considerations

- O grafo 3D já usa `useMemo` e refs estáveis no `Network3D.tsx`; manteremos essa estratégia para evitar re-layouts desnecessários.
- A resolução de path case-insensitiva deve ser feita sem converter o valor do path, apenas a chave de lookup.
- File entries são limitados por `MAX_EVENTS` por sessão; não há risco de crescimento ilimitado.

## Security Considerations

- `resolvePath` opera sobre payloads já sanitizados no backend; nunca expõe chaves perigosas.
- Adicionar `content`/`result` a `SAFE_PAYLOAD_KEYS` apenas preserva os valores no payload; eles ainda passam por truncamento e ainda são exibidos apenas no painel do usuário local (`127.0.0.1`).
- A lista `DANGEROUS_PAYLOAD_KEYS` não deve ser relaxada.

---

## UI/UX Visual Specification

### 1. Brand Narrative & Case-Study Frame
- **Problem:** O dashboard carecia de granularidade temporal/funcional na visualização do histórico de execução (as skills se sobrepunham no grafo 3D) e faltava uma visualização integrada de exploração de código onde o usuário pudesse revisar facilmente a atividade de arquivos e ler seu conteúdo de forma estável.
- **Audience:** Engenheiros de software e operadores que utilizam o CrewLoop para monitorar e auditar execuções autônomas de agentes de IA de forma confiável e em tempo real.
- **Insight:** Desenvolvedores pensam em termos de estrutura de arquivos física (diretórios) e atividades sequenciais (quem leu o quê e quando). Apresentar os arquivos de maneira tabular ou puramente linear desconecta a visualização do modelo mental do desenvolvedor.
- **Solution:** Unificar a visualização de arquivos em um Explorer minimalista com painel de leitura integrado, suportado por um grafo 3D que mapeia cada ciclo de skill individual como um nó distinto no tempo.

### 2. Aesthetic Direction Statement
Optamos por uma direção **Linear-like Minimalist** integrada com elementos de **Terminal Monospace**. A interface utiliza tons escuros de obsidian, bordas ultra-finas e realces em gradientes violeta-neon. A tipografia prioriza fontes monospace compactas para a visualização de código e dados, trazendo um sentimento de terminal moderno de alta performance que minimiza distrações e maximiza a legibilidade.

### 3. Color System

| Token | Light mode (Fallback) | Dark mode (Primary) | Usage |
|-------|------------|-----------|-------|
| `--bg-primary` | `hsl(0, 0%, 98%)` | `hsl(240, 10%, 3.9%)` | Fundo principal do Dashboard |
| `--bg-surface` | `hsl(0, 0%, 100%)` | `hsl(240, 10%, 6%)` | Painéis, listas de arquivos e cartões |
| `--bg-elevated` | `hsl(240, 5%, 96%)` | `hsl(240, 10%, 10%)` | Modais e dropdowns |
| `--text-primary` | `hsl(240, 10%, 4%)` | `hsl(0, 0%, 98%)` | Títulos e textos de alta ênfase |
| `--text-secondary` | `hsl(240, 5%, 35%)` | `hsl(240, 5%, 65%)` | Descrições e metadados secundários |
| `--text-muted` | `hsl(240, 5%, 60%)` | `hsl(240, 5%, 45%)` | Números de linha e placeholders |
| `--accent` | `hsl(263.4, 70%, 50%)` | `hsl(263.4, 70%, 50.4%)` | Foco, realces e botões ativos (Violeta-neon) |
| `--success` | `hsl(142.1, 76%, 36%)` | `hsl(142.1, 70.6%, 45.3%)` | Badge e indicador de operação `edit` (Verde) |
| `--info` | `hsl(198.6, 88.7%, 38%)` | `hsl(198.6, 88.7%, 48.4%)` | Badge e indicador de operação `read` (Azul-céu) |
| `--warning` | `hsl(37.9, 90.2%, 40%)` | `hsl(37.9, 90.2%, 50.2%)` | Estado de atenção ou execução pendente (Âmbar) |
| `--error` | `hsl(346.8, 77.2%, 40%)` | `hsl(346.8, 77.2%, 49.8%)` | Estado de erro ou falha no fluxo |
| `--border` | `hsl(240, 5.9%, 90%)` | `hsl(240, 5.9%, 15%)` | Bordas e divisores sutis de 1px |

### 4. Typography System

| Level | Font | Size | Line-height | Letter-spacing | Weight | Usage |
|-------|------|------|-------------|----------------|--------|-------|
| H1 | `Geist Mono, JetBrains Mono, monospace` | `24px / 1.5rem` | `32px` | `-0.02em` | `700` | Títulos de seções principais |
| H2 | `Geist Mono, JetBrains Mono, monospace` | `20px / 1.25rem` | `28px` | `-0.01em` | `600` | Subseções e cabeçalhos |
| H3 | `Geist Mono, JetBrains Mono, monospace` | `16px / 1rem` | `24px` | `0` | `600` | Títulos de painéis de arquivos |
| Body | `Inter, sans-serif` | `14px / 0.875rem` | `20px` | `0` | `400` | Parágrafos de feedback e textos |
| Body-sm | `Inter, sans-serif` | `12px / 0.75rem` | `16px` | `0.01em` | `400` | Metadados, horários, caminhos |
| Label | `Geist Mono, monospace` | `11px / 0.6875rem` | `14px` | `0.05em` | `600` | Badges de operação (`read`, `edit`, `other`) |
| Code | `JetBrains Mono, Geist Mono, monospace` | `13px / 0.8125rem` | `18px` | `0` | `400` | Visualizador de arquivo e diffs |

### 5. Design Tokens

#### Spacing Scale (4px base)
- `--space-xs`: `4px`
- `--space-sm`: `8px`
- `--space-md`: `16px`
- `--space-lg`: `24px`
- `--space-xl`: `32px`

#### Border Radius Scale
- `--radius-none`: `0` (Usado em divisores do file explorer e painel de diff)
- `--radius-sm`: `4px` (Tags, badges de operação)
- `--radius-md`: `6px` (Abas de arquivo, inputs de busca)
- `--radius-lg`: `8px` (Contêineres de painel externo)

#### Elevation / Shadow Scale
- `--shadow-0`: `none`
- `--shadow-1`: `0 1px 2px rgba(0, 0, 0, 0.05)`
- `--shadow-2`: `0 4px 12px rgba(0, 0, 0, 0.15)`

### 6. Component Specs

#### A. FileList Item
- **Estrutura:** Layout flex horizontal com alinhamento vertical centralizado.
- **Estados:**
  - *Default:* Fundo transparente, texto secundário.
  - *Hover:* Fundo `--bg-elevated`, texto primário, transição suave de 150ms.
  - *Selected:* Fundo `--bg-surface` com borda esquerda de 2px `--accent` ativa, texto primário em negrito.
- **Elementos internos:** Badge de operação (`[READ]` ou `[EDIT]`) alinhado à esquerda; caminho relativo do arquivo ao centro; indicador de modificação à direita.

#### B. Operation Badge
- **Estilos:**
  - `read`: Fundo `hsla(198.6, 88.7%, 48.4%, 0.15)`, texto `--info`, borda `1px solid hsla(198.6, 88.7%, 48.4%, 0.3)`.
  - `edit`: Fundo `hsla(142.1, 70.6%, 45.3%, 0.15)`, texto `--success`, borda `1px solid hsla(142.1, 70.6%, 45.3%, 0.3)`.
  - `other`: Fundo `hsla(240, 5%, 65%, 0.1)`, texto `--text-secondary`, borda `1px solid `--border`.

### 7. Layout Structure (ASCII Wireframe)

```text
+--------------------------------------------------------------------------------------------------+
|  [FILES]  Timeline  Graph 3D                                                        Session: #014 |
+--------------------------------------------------------------------------------------------------+
|  File Explorer                                                                                   |
|  +-------------------------------------+-------------------------------------------------------+ |
|  | SEARCH FILES... (Input)             | [FileDiff] /home/arch/codes/crewloop/README.md        | |
|  | +---------------------------------+ | +---------------------------------------------------+ | |
|  | | [READ] README.md              # | | | [READ] Line Hint: L1-L235                        | | |
|  | | [EDIT] package.json           # | | | ------------------------------------------------- | | |
|  | | [READ] servers/dash/types.ts    | | | 1 | # CrewLoop                                    | | |
|  | | [OTHER] scripts/test.sh         | | | 2 |                                               | | |
|  | |                                 | | | 3 | ![CrewLoop hero banner](assets/...            | | |
|  | |                                 | | | 4 |                                               | | |
|  | |                                 | | |                                                   | | |
|  | +---------------------------------+ | +---------------------------------------------------+ | |
|  |                                     | Operations list for this file:                        | |
|  |                                     | - [READ] by Engineer at 23:22:20                      | |
|  |                                     | - [EDIT] by Shipper at 23:26:58                       | |
|  +-------------------------------------+-------------------------------------------------------+ |
+--------------------------------------------------------------------------------------------------+
```

### 8. Real-State Specs
- **Loading:** Um efeito de shimmer horizontal `--bg-elevated` na lista de arquivos enquanto os primeiros eventos de sessão são processados.
- **Empty:** Ícone de diretório vazio no centro com o texto `"Nenhum arquivo ativo nesta sessão"`.
- **Error:** Painel com borda vermelha e botão `"Tentar reconectar WebSocket"`.
- **Success:** Destaque pulsante verde sutil de 1s na borda do arquivo que acabou de ser modificado por uma operação de escrita.

### 9. Presentation Mockups
- **Browser-frame mockup:** Visualização em tela cheia com painel lateral colapsável, mantendo a proporção de 30% da largura para a lista de arquivos e 70% para o visualizador detalhado.
- **Responsive adjustment:** Em telas menores (mobile), a visualização alterna entre a lista de arquivos e o leitor de conteúdo usando abas deslizantes.

### 10. Motion Choreography

| Animation | Trigger | Property | Duration | Easing | Reduced-motion fallback |
|-----------|---------|----------|----------|--------|------------------------|
| File Entry Hover | Hover | background-color | 120ms | ease-out | Instant state swap |
| File Selection Switch | Selection change | border-left-width, opacity | 200ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Instant switch |
| Badge Pulse | File updated | transform (scale), box-shadow | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | No pulse effect |

### 11. Asset List
- **Icons:** Uso do conjunto Lucide-React (`Folder`, `FileText`, `Terminal`, `Activity`, `ChevronRight`, `Info`, `AlertTriangle`).
- **Textures:** Fundo de grade pontilhada muito sutil no fundo do grafo 3D (`radial-gradient(circle, var(--border) 1px, transparent 1px)` com background-size de 24px).

### 12. Asset Export Spec
- Icons: Lucide-React SVG nativo (não requer exportação física).
- Canvas: Renderização WebGL nativa via ThreeJS / React-Force-Graph-3D.

### 13. Data Visualization Spec
- As linhas do grafo 3D usarão cores dinâmicas baseadas na skill de origem do link:
  - `crewloop-hub`: `#01579B`
  - `architect`: `#E65100`
  - `designer`: `#6A1B9A`
  - `engineer`: `#1B5E20`
  - `reviewer`: `#B71C1C`
  - `shipper`: `#00695C`
- Nós de arquivos usarão cor neutra (`#A0A0A0`) e nós de ferramentas usarão cor baseada no tipo de ferramenta (Read/Write/Terminal).

### 14. User Flow & Interaction Spec
1. O usuário entra no dashboard e seleciona a aba **Files**.
2. A lista de arquivos é exibida com realce de badges para indicar a atividade de leitura (`read`) ou modificação (`edit`).
3. Ao clicar em um arquivo, a URL/State é atualizada, e o painel direito exibe o conteúdo correspondente.
4. Se o arquivo foi lido (read), o leitor de arquivos exibe o conteúdo completo ou o snippet truncado com a linha indicadora correspondente. Se foi modificado (edit), exibe o diff clássico.

### 15. Pre-Implementation Checklist
- [ ] O visual condiz com o tema Linear-like Minimalist de alta performance com fontes mono.
- [ ] O contraste mínimo de leitura em fundo escuro é de no mínimo 4.5:1.
- [ ] A estabilidade de estados foi mantida ao receber eventos via WebSocket (o arquivo selecionado não se perde).
- [ ] O grafo 3D cria nós de skill separados baseando-se na skill ativa do evento.
- [ ] Ícones estruturais utilizam Lucide-React SVG e não emojis estruturais.
- [ ] Animações de hover e seleção possuem reduced-motion fallbacks.
