# Tasks: Obsidian MCP Second Brain

## Setup
- [x] Create spec folder structure
- [x] Initialize `.spec.yaml`
- [x] Write `proposal.md`
- [x] Write `specs/delta.md`
- [x] Write `design.md`
- [x] Write ADR in `specs/decisions/001-mcp-architecture.md`

## Implementation
- [x] Criar estrutura inicial de `servers/obsidian-mcp/`
- [x] Implementar `src/config.py` com defaults (vault path, modelo, thresholds)
- [x] Implementar `src/models.py` (Note, Chunk, GraphEdge, SearchResult)
- [x] Implementar `src/vault/parser.py` (frontmatter, links, backlinks)
- [x] Implementar `src/vault/repository.py` (CRUD de notas)
- [x] Implementar `src/vault/writer.py` (geração de Markdown)
- [x] Implementar `src/privacy/filter.py` (detecção de conteúdo sensível)
- [x] Implementar `src/indexer/embeddings.py` (modelo local + fallback TF-IDF)
- [x] Implementar `src/indexer/store.py` (SQLite: chunks, embeddings, graph)
- [x] Implementar `src/indexer/indexer.py` (indexação incremental)
- [x] Implementar `src/indexer/sync.py` (sync do bundle para o índice)
- [x] Implementar `src/rag/text_search.py`
- [x] Implementar `src/rag/vector_search.py`
- [x] Implementar `src/rag/graph_search.py`
- [x] Implementar `src/rag/engine.py` (orquestração híbrida)
- [x] Implementar `src/learning/detector.py` (detecção de conceito/decisão/aprendizado)
- [x] Implementar `src/learning/note_generator.py` (geração de nota Markdown)
- [x] Implementar `src/tools/*.py` (read, search, create, update, delete, list, related, sync)
- [x] Implementar `src/tools/registry.py` (registro e schemas das tools)
- [x] Implementar `src/server.py` (MCP server + stdio)
- [x] Implementar `src/main.py` (entrypoint)
- [x] Adicionar `pyproject.toml` com dependências
- [x] Atualizar `README.md` com instruções de instalação/configuração
- [x] Atualizar `scripts/install.sh` para instalar/linkar o MCP server

## Testing
- [x] Unit tests para `vault/parser.py`
- [x] Unit tests para `vault/repository.py` com vault temporário
- [x] Unit tests para `privacy/filter.py`
- [x] Unit tests para `indexer/embeddings.py` e `store.py`
- [x] Unit tests para `rag/text_search.py`, `vector_search.py`, `graph_search.py`
- [x] Unit tests para `learning/detector.py` e `note_generator.py`
- [x] Integration tests para ferramentas MCP via dispatch
- [x] Teste de performance: busca < 2s em vault de 1.000 notas

## Verification
- [x] Rodar test suite: `pytest tests/`
- [x] Validar skills existentes: `python scripts/validate-skills.py`
- [ ] Teste manual: conectar Kimi Code ao MCP server e executar `search_notes`
- [ ] Teste manual: verificar geração automática de nota pelo detector
- [ ] Teste manual: abrir `~/.lea` no Obsidian e confirmar graph view

> Nota: os testes manuais dependem de um cliente MCP configurado e do Obsidian instalado no ambiente do usuário. Eles serão executados após a instalação/entrega, não durante o BUILD automatizado.

## Documentation
- [x] Atualizar living specs em `specs/living/`
- [x] Atualizar `README.md`
- [x] Adicionar ADR `specs/decisions/001-mcp-architecture.md`
- [x] Adicionar README específico em `servers/obsidian-mcp/README.md`

## Completion
- [x] Revisar spec com reviewer
- [x] Archive change folder
- [x] Update `.spec.yaml` status to completed
