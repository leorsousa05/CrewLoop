# Tasks: Hierarchical Collapsible File Tree

## Setup
- [x] Create spec folder structure
- [x] Initialize `.spec.yaml`

## Implementation
- [x] Implementar utilitário `buildFileTree(files: FileEntry[])` que cria o grafo `FileTreeNode[]` a partir do array plano.
- [x] Implementar no `FileList.tsx` a lógica de montagem do estado inicial de expansão (`expandedPaths`) adicionando os caminhos pais dos arquivos que têm operações.
- [x] Criar subcomponente recursivo `FileNode` no `FileList.tsx` para renderizar pastas e subpastas hierarquicamente com setas e ícones correspondentes.
- [x] Integrar seleção e acionador de colapso de diretórios.

## Testing
- [x] Adicionar teste unitário para `buildFileTree` validando o parse correto de caminhos aninhados e ordenação alfabética (diretórios primeiro).
- [x] Rodar suíte de testes e validar conformidade.

## Verification
- [x] Abrir o dashboard e verificar que as pastas comecem colapsadas por padrão, exceto as pastas dos arquivos que o agente leu/escreveu, que devem começar expandidas.
- [x] Clicar nas setas para expandir/colapsar pastas.

## Completion
- [x] Atualizar `.spec.yaml` para completed.
