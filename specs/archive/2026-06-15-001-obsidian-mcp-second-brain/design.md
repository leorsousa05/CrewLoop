# Design: Obsidian MCP Second Brain

## Overview

Um servidor MCP local em Python conecta o repositório `loop-engineering-agents` e o vault do Obsidian em `~/.lea`. O servidor expõe ferramentas para leitura, busca e escrita de notas, mantém um índice local leve e detecta aprendizados para criar notas automaticamente.

## Proposed Directory & File Structure

```
servers/obsidian-mcp/
├── README.md
├── pyproject.toml
├── src/
│   ├── __init__.py
│   ├── main.py                 # Entrypoint stdio
│   ├── server.py               # MCP server + tool registry
│   ├── config.py               # Settings e defaults
│   ├── models.py               # Contratos de dados
│   ├── vault/
│   │   ├── __init__.py
│   │   ├── repository.py       # CRUD de notas no filesystem
│   │   ├── parser.py           # Parse Markdown, frontmatter, links [[...]]
│   │   └── writer.py           # Geração de Markdown com frontmatter
│   ├── indexer/
│   │   ├── __init__.py
│   │   ├── indexer.py          # Orquestra indexação incremental
│   │   ├── embeddings.py       # Modelo local + fallback TF-IDF
│   │   ├── store.py            # SQLite: chunks, embeddings, graph edges
│   │   └── sync.py             # Sync do bundle para o vault/index
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── engine.py           # Orquestra modos de busca
│   │   ├── text_search.py      # BM25/TF-IDF simples
│   │   ├── vector_search.py    # Busca por similaridade de embeddings
│   │   └── graph_search.py     # Navegação por links e backlinks
│   ├── learning/
│   │   ├── __init__.py
│   │   ├── detector.py         # Detecta conceito/decisão/aprendizado
│   │   └── note_generator.py   # Gera nota Markdown a partir de aprendizado
│   ├── privacy/
│   │   ├── __init__.py
│   │   └── filter.py           # Bloqueia conteúdo sensível
│   └── tools/
│       ├── __init__.py
│       ├── registry.py         # Registro e schemas das tools
│       ├── read.py
│       ├── search.py
│       ├── create.py
│       ├── update.py
│       ├── delete.py
│       ├── list.py
│       ├── related.py
│       └── sync.py
tests/
├── conftest.py
├── test_vault.py
├── test_indexer.py
├── test_rag.py
├── test_privacy.py
├── test_learning.py
└── test_tools.py
```

## Code Architecture & Design Patterns

- **Clean Architecture / Modular:** camadas bem separadas. `tools` depende de `vault`, `rag` e `learning`; `rag` depende de `indexer`; `indexer` depende de `vault`.
- **Adapter Pattern:** `embeddings.py` isola o modelo de embeddings, permitindo trocar por outro ou usar fallback TF-IDF. `repository.py` isola o filesystem.
- **Strategy Pattern:** `rag/engine.py` seleciona o modo de busca (texto, vetor, graph) com base no query e disponibilidade.
- **Repository Pattern:** `vault/repository.py` e `indexer/store.py` centralizam acesso a dados.
- **Observer Pattern:** eventos de aprendizado disparam geração de notas sem acoplar detector ao escritor.
- **Factory Pattern:** criação de `Note` e `Chunk` a partir de arquivos Markdown.

## Data Model

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Any

@dataclass
class Note:
    path: str                # Caminho relativo ao vault (ex: "conceitos/mcp.md")
    title: str
    content: str             # Corpo sem frontmatter
    frontmatter: dict[str, Any]
    links: list[str]         # Destinos de [[...]]
    backlinks: list[str]     # Notas que apontam para esta
    ctime: datetime
    mtime: datetime

@dataclass
class Chunk:
    id: str
    note_path: str
    text: str
    embedding: list[float] | None
    start_line: int
    end_line: int

@dataclass
class GraphEdge:
    source: str
    target: str
    relation: str           # "links", "backlink", "semantic"
    weight: float

@dataclass
class SearchResult:
    note_path: str
    score: float
    snippet: str
    matched_chunks: list[Chunk]
```

## API Contracts (MCP Tools)

```python
# Cada tool recebe um dict de arguments e retorna dict/texto conforme protocolo MCP.

def read_note(path: str) -> str:
    """Retorna o conteúdo Markdown completo da nota."""

def search_notes(
    query: str,
    mode: str = "hybrid",   # "text" | "vector" | "graph" | "hybrid"
    limit: int = 10
) -> list[SearchResult]:
    """Busca notas por texto, embedding ou graph."""

def create_note(
    path: str,
    content: str,
    title: str | None = None,
    tags: list[str] | None = None,
    overwrite: bool = False
) -> dict:
    """Cria uma nota. Falha se já existir e overwrite=False."""

def update_note(
    path: str,
    content: str | None = None,
    append: str | None = None,
    tags: list[str] | None = None
) -> dict:
    """Substitui ou anexa conteúdo a uma nota existente."""

def delete_note(path: str) -> dict:
    """Remove uma nota do vault."""

def list_notes(folder: str | None = None) -> list[str]:
    """Lista caminhos de notas, opcionalmente filtradas por pasta."""

def get_related_notes(path: str, depth: int = 1) -> list[SearchResult]:
    """Retorna notas relacionadas por links e similaridade."""

def sync_from_bundle(force: bool = False) -> dict:
    """Reindexa o repositório loop-engineering-agents e atualiza o índice local."""
```

## Flow Diagrams

### Tool Invocation
1. Cliente MCP chama `read_note`/`search_notes`/`create_note`.
2. `server.py` roteia para a tool correspondente em `tools/`.
3. Tool valida argumentos e chama `privacy.filter`.
4. Tool executa operação em `vault/` ou `rag/`.
5. Resultado é serializado e retornado ao cliente.

### Automatic Learning
1. Durante uma conversa, o detector recebe texto do contexto.
2. `detector.py` identifica conceito, decisão ou aprendizado novo.
3. `privacy.filter` valida o conteúdo.
4. `note_generator.py` produz Markdown com frontmatter (`type`, `tags`, `created`).
5. `vault/writer.py` persiste a nota em `~/.lea/inbox/` ou pasta apropriada.
6. `indexer.py` atualiza o índice incrementalmente.

### Indexing
1. `sync.py` escaneia `loop-engineering-agents/` e `~/.lea/`.
2. `parser.py` extrai título, frontmatter, links e chunks.
3. `embeddings.py` gera embeddings para chunks modificados.
4. `store.py` persiste metadados, embeddings e arestas do graph em SQLite.
5. Próxima sync processa apenas arquivos com `mtime` alterado.

## State Management

- **Vault state:** arquivos Markdown em `~/.lea/`. Única fonte de verdade para notas.
- **Index state:** SQLite em `~/.lea/.index/index.db` para chunks, embeddings e graph.
- **Config state:** `servers/obsidian-mcp/src/config.py` com defaults; futuro suporte a `~/.config/lea/mcp.yaml`.
- Nenhum estado global mutável em memória além do cache de embeddings carregado uma vez.

## Error Handling

- Vault inexistente → cria estrutura inicial e retorna aviso.
- Nota não encontrada → erro MCP claro com `code` e `message`.
- Conteúdo sensível detectado → erro de validação antes de escrita.
- Modelo de embeddings indisponível → fallback para busca textual e log.
- Link quebrado em graph search → ignora aresta e registra em log.
- Erros de I/O filesystem → propagam como erro MCP interno.

## Performance Considerations

- Modelo de embeddings pequeno (`sentence-transformers/all-MiniLM-L6-v2` ou menor).
- Indexação incremental: compara `mtime` e hash do conteúdo.
- Busca vetorial com índice simples em SQLite (cosine similarity linear); suficiente para milhares de chunks.
- Carregamento lazy do modelo de embeddings na primeira chamada vetorial.
- Cache de notas parseadas durante uma única requisição para evitar leituras duplicadas.

## Security Considerations

- Nenhuma autenticação: acesso local apenas.
- Filtro de privacidade com padrões: `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`, `-----BEGIN`, `.env`.
- Sanitização de caminhos: nunca permitir escape de `~/.lea` via `../`.
- Revisão manual recomendada para notas geradas automaticamente antes de confiar plenamente.
