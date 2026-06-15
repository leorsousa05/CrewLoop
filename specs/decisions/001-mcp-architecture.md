# ADR 001: Servidor MCP + Vault Obsidian Local como Second Brain

## Status
- **State:** proposed
- **Date:** 2026-06-15
- **Author:** @user

## Context

O projeto `loop-engineering-agents` precisa de uma forma de a IA acumular, relacionar e reutilizar conhecimento ao longo das sessões. A solução deve:

- Ser local e offline.
- Funcionar com Kimi Code e outros clientes compatíveis.
- Aproveitar uma ferramenta de visualização já existente (Obsidian).
- Ser leve o suficiente para rodar em hardware fraco.
- Manter o bundle de skills separado do conhecimento gerado pela IA.

## Decision

Adotar um **servidor MCP em Python** que lê e escreve em um **vault do Obsidian local** fixo em `~/.lea`.

O servidor expõe ferramentas MCP para leitura, busca (texto, vetor, graph) e escrita de notas. Ele indexa o repositório `loop-engineering-agents` como conhecimento base inicial e mantém um índice local leve em SQLite. A escrita automática de notas é acionada por um detector de aprendizado baseado em regras.

## Consequences

### Positivos

- **Padrão aberto:** MCP é um protocolo emergente suportado por Kimi Code, Claude Desktop e outros.
- **Visualização nativa:** Obsidian já oferece graph view, backlinks e renderização Markdown.
- **Separado do bundle:** o vault `~/.lea` não polui o repositório de skills.
- **Offline e privado:** embeddings locais, sem chamadas externas.
- **Extensível:** novas ferramentas MCP podem ser adicionadas sem mudar a arquitetura.

### Negativos

- **Dependência do protocolo MCP:** ainda em evolução; versões futuras podem exigir adaptação.
- **Overhead de embeddings:** mesmo modelos leves consomem CPU/memória; fallback TF-IDF mitiga.
- **Escrita automática pode gerar ruído:** requer detector conservador e revisão humana.
- **Sem sincronização em nuvem:** limitado ao dispositivo local.

## Alternatives Considered

| Alternativa | Por que descartada |
|-------------|--------------------|
| Plugin nativo do Obsidian | Requer TypeScript e API do Obsidian; não expõe facilmente ferramentas para agentes externos. |
| API REST local customizada | Não segue padrão de mercado; exige configuração manual de portas e autenticação. |
| Sincronizar diretamente no repo de skills | Poluiria o versionamento com notas geradas automaticamente e misturaria conhecimento humano/IA. |
| Usar embeddings via API externa | Viola requisito de offline e privacidade; aumenta custo e latência. |

## References

- [MCP Specification](https://modelcontextprotocol.io/)
- [Obsidian Help: Internal links](https://help.obsidian.md/Linking+notes+and+files/Internal+links)
- `specs/changes/001-obsidian-mcp-second-brain/design.md`
