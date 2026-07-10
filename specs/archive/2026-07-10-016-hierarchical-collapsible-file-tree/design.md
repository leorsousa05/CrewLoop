# Design: Hierarchical Collapsible File Tree

## [Padrões Aplicados]
- **Hierarchical Tree Decomposition:** Conversão linear-to-tree no cliente para evitar processamento recursivo no servidor e manter a API REST simples.
- **Auto-expansion of Context paths:** Pré-processamento dos caminhos ativos no carregamento inicial para melhorar a focabilidade do usuário.
- **Recursive Component Composition:** Uso de um subcomponente recursivo `FileNode` para renderização limpa do grafo de diretórios.

## [Estratégia de Implementação]

### 1. Modelagem de Dados no Frontend
Definição da interface de nós no componente React:
```typescript
export interface FileTreeNode {
  name: string;
  path: string; // Caminho relativo completo desde a raiz
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  fileEntry?: FileEntry; // Objeto de entrada original caso seja arquivo
}
```

### 2. Conversão da Lista Plana para Árvore
A lista de caminhos de arquivos relativos (ex: `src/components/Button.tsx`) será estruturada usando o delimitador `/`:
- Cada segmento do caminho é processado recursivamente.
- Pastas (`directory`) e arquivos (`file`) são colocados em coleções sob a mesma chave.
- No final do parsing, o nó raiz é ordenado de forma que diretórios apareçam antes de arquivos e de forma alfabética.

### 3. Gerenciamento de Estado de Colapso
- Estado local da árvore: `const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())`.
- Ao montar ou atualizar a lista de arquivos, o componente busca todos os caminhos que possuem operações ativas (`ops.length > 0`) e inclui todos os seus diretórios pais no conjunto de `expandedPaths`.

---

## 7 Analysis Questions

1. **Domain and bounded context placement?**
   - UI do Dashboard, especificamente no subcomponente `FileList.tsx`.
2. **Core responsibilities of new/changed components?**
   - `FileList.tsx`: Parsear lista plana para hierárquica e renderizar recursivamente diretórios e arquivos com setas colapsáveis e ícones de pastas.
3. **Contracts (interfaces, types, APIs) to define or change?**
   - Nenhuma API backend muda. Introdução do tipo de cliente `FileTreeNode`.
4. **Which parts need tests per TDD skip criteria?**
   - A função utilitária `buildFileTree` deve ter cobertura de teste unitário cobrindo aninhamento e ordenação alfabética de pastas antes de arquivos.
5. **Architecture that minimizes ambiguity?**
   - Lógica de transformação de dados puramente isolada da renderização para simplificar testes de regressão.
6. **Project structure changes needed?**
   - Nenhuma.
7. **Key trade-offs?**
   - Custo de reconstruir o grafo na UI vs. Complexidade de transferir o grafo aninhado via rede. A quantidade de arquivos do repositório é pequena, tornando o custo insignificante na UI.

---

## UI/UX Visual Specification

### 1. Espaçamento e Indentação
* Cada nível de profundidade na árvore (`depth`) incrementa o recuo esquerdo (`padding-left`) em `12px` para diretórios e arquivos, criando uma hierarquia visual clara de aninhamento.

### 2. Ícones e Símbolos
* **Diretórios:** Setas de expandir (`▶`) ou colapsar (`▼`) seguidas por ícones `Folder` (fechada) ou `FolderOpen` (aberta) em tom `--accent/70`.
* **Arquivos:** Ícone `FileText` com cor `--accent` (ativo selecionado), `--accent/60` (ativo não selecionado com operações) ou `--text-muted/40` (inativo).
