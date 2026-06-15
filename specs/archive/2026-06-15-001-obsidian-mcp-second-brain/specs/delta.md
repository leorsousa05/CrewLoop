# Spec Delta: Obsidian MCP Second Brain

## Current State

O projeto `loop-engineering-agents` possui:

- Skills em Markdown em `skills/<skill-name>/SKILL.md`.
- Referências compartilhadas em `references/`.
- Scripts auxiliares em `scripts/` (Bash e Python).
- Nenhum servidor, API ou mecanismo de RAG.
- Nenhuma pasta `specs/` (esta é a primeira change).

Não existe integração com Obsidian, nem conhecimento persistente fora dos arquivos do próprio repositório.

## Changes

### ADDED

- `servers/obsidian-mcp/` — novo bounded context com o servidor MCP.
  - `src/main.py` — ponto de entrada stdio.
  - `src/server.py` — registro de ferramentas e loop MCP.
  - `src/config.py` — configurações (vault path, modelo de embeddings, thresholds).
  - `src/models.py` — contratos de dados (`Note`, `Chunk`, `GraphEdge`, etc.).
  - `src/vault/` — leitura/escrita de notas Markdown no vault `~/.lea`.
  - `src/indexer/` — indexação incremental, embeddings e store local.
  - `src/rag/` — engine de busca textual, vetorial e por graph.
  - `src/learning/` — detector de aprendizado e gerador de notas.
  - `src/privacy/` — filtro de conteúdo sensível.
  - `src/tools/` — implementações das ferramentas MCP expostas.
  - `tests/` — testes unitários e de integração.
- `specs/changes/001-obsidian-mcp-second-brain/` — spec da change.
- `specs/decisions/001-mcp-architecture.md` — ADR com a escolha de MCP + vault local.

### MODIFIED

- `README.md` — adicionar seção sobre o servidor MCP e como configurar no Kimi Code.
- `scripts/install.sh` — opcional: criar symlink/copiar binário do MCP server para `~/.local/bin`.

### REMOVED

- Nenhuma remoção.

## Migration Notes

- A pasta `~/.lea` será criada automaticamente na primeira execução, caso não exista.
- O indexador fará scan inicial do repositório `loop-engineering-agents` e gerará um índice local em `~/.lea/.index/`.
- Não há migração de dados porque não existe estado anterior.

## Backward Compatibility

- Change aditiva. Nenhum arquivo existente é alterado de forma incompatível.
- O `scripts/install.sh` pode ganhar comportamento adicional, mas deve continuar funcionando para quem não usa o MCP.
