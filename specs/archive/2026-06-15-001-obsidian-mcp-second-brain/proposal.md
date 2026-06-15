# Proposal: Obsidian MCP Second Brain

## Status
- **State:** draft
- **Created:** 2026-06-15
- **Author:** @user

## Problem Statement

O bundle `loop-engineering-agents` é composto por skills e referências em Markdown. Hoje, esse conhecimento é estático: a IA não pode consultar um histórico de aprendizados, decisões ou contexto acumulado entre sessões. O usuário quer transformar um vault do Obsidian local (`~/.lea`) em um segundo cérebro ativo, acessível via MCP, para que a IA aprenda, relacione informações e evolua o conhecimento ao longo do tempo.

## Goals

1. Criar um servidor MCP em Python que exponha o vault `~/.lea` como fonte de conhecimento e destino de aprendizados.
2. Permitir leitura, busca, criação, atualização e remoção de notas do Obsidian por clientes MCP (Kimi Code e outros).
3. Indexar o repositório `loop-engineering-agents` como conhecimento base inicial e manter o vault sincronizado.
4. Implementar Graph RAG em duas camadas: graph view nativo do Obsidian (links `[[...]]`) e engine própria de busca vetorial + navegação por graph.
5. Detectar novos conceitos, decisões e aprendizados automaticamente e convertê-los em notas no vault.
6. Garantir que dados sensíveis nunca sejam persistidos no vault.

## Non-Goals

- Criar uma interface gráfica própria (o Obsidian já provê a visualização).
- Sincronizar com serviços de nuvem ou multi-dispositivo.
- Implementar um plugin nativo do Obsidian.
- Usar modelos de embeddings grandes ou APIs externas.
- Suportar permissões multiusuário ou autenticação.

## Constraints

- Linguagem: Python.
- Vault local fixo em `~/.lea`.
- Integração silenciosa, sem UI customizada.
- Servidor MCP genérico, consumível por Kimi Code e outros clientes compatíveis.
- Modelo de embeddings local e leve para hardware fraco.
- Totalmente offline.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Modelo de embeddings pesado demais para o hardware | Alto | Escolher modelo muito pequeno; implementar fallback para busca textual/TF-IDF. |
| Escrita automática gerar ruído ou notas duplicadas | Médio | Detector conservador baseado em regras + deduplicação por hash/título. |
| Conteúdo sensível vazar para o vault | Alto | Filtro explícito de padrões sensíveis e validação antes de toda escrita. |
| MCP server não ser detectado pelo Kimi Code | Médio | Usar transporte stdio e documentar configuração em `mcpServers`. |
| Dependência de FUSE/libfuse2 para AppImage do Obsidian | Baixo | Usar instalação Flatpak já existente; vault é apenas pasta Markdown. |

## Success Criteria

- [ ] Servidor MCP inicia via stdio e responde a requisições do protocolo MCP.
- [ ] Ferramentas MCP permitem ler, buscar, criar, atualizar, deletar e listar notas.
- [ ] O repositório `loop-engineering-agents` é indexado como conhecimento base inicial.
- [ ] Busca textual e busca vetorial retornam resultados relevantes em < 2s para vaults de até 1.000 notas.
- [ ] Links `[[...]]` no Obsidian são gerados e atualizados automaticamente.
- [ ] Detector de aprendizado cria notas automaticamente quando novos conceitos/decisões surgem.
- [ ] Filtro de privacidade bloqueia 100% de padrões sensíveis em testes.
