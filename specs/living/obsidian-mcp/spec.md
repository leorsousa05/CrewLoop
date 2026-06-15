# Living Spec: Obsidian MCP Second Brain

## Overview

Servidor MCP local em Python que conecta o bundle `loop-engineering-agents` a um vault do Obsidian em `~/.lea`, funcionando como segundo cérebro/RAG.

## Location

- Code: `servers/obsidian-mcp/`
- Vault: `~/.lea`
- Index: `~/.lea/.index/index.db`

## Capabilities

- Leitura, busca, criação, atualização e remoção de notas Markdown.
- Busca textual, vetorial (com fallback TF-IDF) e por graph.
- Indexação incremental do repositório como conhecimento base.
- Detecção automática de conceitos/decisões e geração de notas.
- Filtro de privacidade para evitar persistência de dados sensíveis.

## MCP Tools

- `read_note`
- `search_notes`
- `create_note`
- `update_note`
- `delete_note`
- `list_notes`
- `get_related_notes`
- `sync_from_bundle`

## Architecture

- `vault/` — filesystem adapter para notas.
- `indexer/` — embeddings, chunks e store SQLite.
- `rag/` — engines de busca.
- `learning/` — detector e gerador de notas.
- `privacy/` — filtro de conteúdo sensível.
- `tools/` — implementações das ferramentas MCP.
- `server.py` / `main.py` — entrypoint stdio.

## References

- ADR: `specs/decisions/001-mcp-architecture.md`
- Original change: `specs/archive/2026-06-15-001-obsidian-mcp-second-brain/`
