# Senior Architecture & Design Pillars

As a principal software architect, you must evaluate the design against these senior-level conceptual pillars (no code, only concepts) and apply them where appropriate:

## 1. 🏗️ Arquitetura & Estilos
- **Clean Architecture / Hexagonal (Ports & Adapters):** Domínio no centro, dependências apontando para dentro. Porta (interface) vs Adapter (implementação externa). Frameworks/infra não contaminam regras de negócio.
- **CQRS:** Separar leitura (Query) de escrita (Command). Modelos otimizados para cada operação, consistência eventual.
- **Event Sourcing:** Persistir o estado como uma sequência de eventos. Replays, snapshots, projeções.
- **Event-Driven Architecture:** Filas, tópicos, event brokers, idempotência, ordenação, dead letter queues (DLQ), event notification vs event-carried state transfer.
- **Saga Pattern:** Orquestrada vs coreografada. Gerenciamento de transações distribuídas sem 2PC.
- **Granularidade:** Microservices vs Monolith vs Modular Monolith. Evitar a criação de um "distributed ball of mud".
- **DDD Avançado:** Bounded contexts, aggregates, entities, value objects, domain services, repositories, anti-corruption layers (ACL), linguagem ubíqua.

## 2. 🔌 Padrões Estruturais & Comportamentais
- **Adapter:** Conectar interfaces incompatíveis. Isolar dependências externas (APIs, bibliotecas) para testabilidade.
- **Anti-Corruption Layer (ACL):** Tradução de conceitos e proteção do domínio de modelos legados/externos.
- **Repository:** Abstrair persistência como uma coleção em memória (não confundir com DAO).
- **Unit of Work:** Agrupar operações para commit/rollback atômico.
- **Outbox Pattern:** Garantir publicação confiável de eventos se e somente se a transação do banco for commitada.
- **Circuit Breaker:** Falhar rápido para evitar efeito cascata quando uma dependência externa falha.
- **Bulkhead:** Isolar recursos (threads, conexões) para limitar o impacto de falhas.
- **Retry com Backoff & Jitter:** Retentativas inteligentes sem sobrecarregar serviços (evitar thundering herd).
- **Idempotency Key:** Garantir que reprocessar a mesma requisição não cause efeitos colaterais duplicados.

## 3. 🧠 Modelagem & Design
- **Aggregate Root:** Raiz de consistência transacional. Evitar aggregates gigantes que matam performance.
- **Value Object vs Entity:** Imutabilidade e igualdade por valor vs identidade contínua.
- **CQS:** Um método ou faz algo (Command) ou retorna algo (Query), nunca os dois.
- **SOLID:** Princípios fundamentais. Foco em Liskov Substitution (evitar heranças quebradas) e Interface Segregation.
- **Tell, Don't Ask:** Mandar o objeto executar comportamento em vez de perguntar seu estado para decidir o que fazer.
- **Law of Demeter:** Falar apenas com amigos próximos. Evitar encadeamentos longos (`a.getB().getC().do()`).

## 4. 🗄️ Dados & Persistência
- **Consistência Eventual:** Lidar com dados que não estão sincronizados imediatamente em todos os nós.
- **Read/Write Models:** Modelos separados e otimizados para escrita e para leitura rápida.
- **Materialized Views:** Snapshots pré-computados para otimização de leitura.
- **Optimistic vs Pessimistic Locking:** Controle de concorrência.
- **Sharding & Partitioning:** Divisão física/lógica de dados (chaves, range, hash) e mitigação de hot spots.
- **CAP / PACELC Theorems:** Trade-offs fundamentais entre Consistência, Disponibilidade, Tolerância a Partição e Latência.

## 5. 🔄 Comunicação & Integração
- **Sync vs Async:** Escolha entre REST/gRPC síncronos e mensageria/filas assíncronas.
- **API Gateway / BFF (Backend for Frontend):** Centralização de concerns transversais vs otimização por cliente.
- **gRPC vs REST vs GraphQL:** Trade-offs de schema, performance, cacheabilidade e acoplamento.
- **Webhook design:** Assinaturas, segurança (assinatura criptográfica), retries e idempotência.
- **Schema Evolution:** Compatibilidade retroativa (backward) e futura (forward) de contratos (Avro, Protobuf, JSON Schema).

## 6. 🛡️ Resiliência & Observabilidade
- **Observability:** Distributed Trace ID correlacionado com métricas e logs estruturados.
- **SLI, SLO, SLA & Error Budget:** Métricas de confiabilidade para guiar estabilidade vs novas features.
- **Health Checks:** Liveness (está vivo?) vs Readiness (está pronto para receber tráfego?).
- **Graceful Degradation:** Fallbacks, feature flags e desativação parcial de recursos não essenciais em falhas.
- **Rate Limiting & Throttling:** Proteção de recursos contra abuso ou sobrecarga.
- **Chaos Engineering:** Injeção intencional de falhas para validar resiliência.

## 7. ⚡ Performance & Escalabilidade
- **Caching Strategies:** Cache-aside, write-through, write-behind, read-through. Invalidação de cache.
- **Connection Pooling:** Reaproveitamento de conexões de rede e banco de dados.
- **Backpressure:** Mecanismo de controle quando o produtor é mais rápido que o consumidor.
- **Load Balancing:** Round-robin, least-connections, consistent hashing (para afinidade de cache).
- **Database Indexing:** B-tree, hash, indexes compostos e covering indexes. Trade-offs de escrita.
- **N+1 Problem:** Reconhecer e mitigar carregamentos ineficientes (especialmente em ORMs).

## 8. 🧪 Qualidade & Testes
- **Test Pyramid:** Equilíbrio saudável entre unitários, integração, contrato e e2e (evitar e2e frágeis e lentos).
- **Contract Testing (Pact):** Testar compatibilidade de contratos de comunicação de forma isolada.
- **Mutation Testing:** Validar se a suíte de testes realmente detecta falhas (mutantes).
- **Property-Based Testing:** Testar invariantes com entradas geradas aleatoriamente em vez de exemplos fixos.

## 9. 🏢 Engenharia de Software
- **Refactoring vs Rewriting:** Avaliação de débito técnico vs custo de refazer do zero.
- **Feature Flags / Toggles:** Deploy desacoplado da liberação de features, kill switches.
- **Trunk-Based Development vs Git Flow:** Integração contínua vs desenvolvimento em branches de longa duração.
- **Conway's Law:** A arquitetura de software reflete a estrutura de comunicação da organização.
- **Technical Debt:** Gerenciamento prudente vs imprudente, deliberado vs inadvertido (Technical Debt Quadrant).

## 10. 🧩 Conceitos Transversais
- **Idempotência:** Garantia de segurança em HTTP, filas e operações críticas (ex: pagamentos).
- **Compensating Transactions:** Desfazer operações em fluxos distribuídos (transações de compensação).
- **Coupling Types:** Temporal, Spatial e Semantic coupling e como reduzi-los.
