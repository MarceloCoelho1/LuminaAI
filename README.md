# LuminaAI - SaaS de Inteligência Artificial & RAG

LuminaAI é uma plataforma **Multi-tenant** de orquestração de LLMs (Gemini) que permite a empresas indexarem documentos privados e interagirem com eles via Chat (RAG - Retrieval-Augmented Generation). O sistema foca em escalabilidade industrial, utilizando processamento assíncrono e isolamento rigoroso de dados por organização.

## 🛠 Tech Stack

- **Framework:** NestJS (Node.js)
- **Linguagem:** TypeScript
- **Banco de Dados Relacional:** PostgreSQL (Prisma ORM)
- **Banco de Dados de Vetores:** Qdrant
- **Mensageria:** RabbitMQ
- **Cache & Auth Session:** Redis
- **IA:** Google Gemini API (Embeddings e LLM)
- **Pagamentos & Billing:** Stripe

---

## 🗺️ Roadmap de Desenvolvimento (Checklist Detalhado)

### 🏗️ Fase 1: Fundação, Multi-tenancy e Auth (RBAC)
- [ x ] **Setup de Infraestrutura:**
    - [ x ] Inicializar projeto NestJS.
    - [ x ] Configurar `docker-compose.yml` (Postgres, Redis, RabbitMQ, Qdrant).
    - [ x ] Definir Schema Prisma (`User`, `Tenant`, `Member`).
- [ x ] **Autenticação Avançada:**
    - [ x ] Implementar `POST /auth/register`: Criar User, Tenant e Member (OWNER) em uma **Prisma Transaction**.
    - [ x ] Implementar `POST /auth/login`: Retornar JWT com `tenantId` e `role` no payload.
- [ ] **Autorização (RBAC):**
    - [ ] Criar Decorator `@Roles(TenantRole.ADMIN)`.
    - [ ] Criar `RolesGuard` para validar acesso baseado na organização atual.
    - [ ] Criar `TenantInterceptor` para injetar o contexto da organização nas requisições.

### 📂 Fase 2: Ingestão de Documentos e Pipeline de Dados (ETL)
- [ ] **Módulo de Documentos:**
    - [ ] CRUD de documentos com status (PENDING, PROCESSING, COMPLETED, FAILED).
    - [ ] Integração com armazenamento (Multer para local ou AWS S3 para prod).
- [ ] **Processamento Assíncrono (RabbitMQ):**
    - [ ] Configurar Producer no NestJS para disparar evento `document.uploaded`.
    - [ ] Criar Worker independente para consumir a fila de indexação.
- [ ] **Integração com IA (Embeddings):**
    - [ ] Implementar lógica de **Chunking** (quebra de texto em pedaços menores).
    - [ ] Consumir API do Gemini para gerar vetores (embeddings) dos chunks.
    - [ ] Persistir vetores no **Qdrant** com metadados (`tenantId`, `docId`).

### 🧠 Fase 3: Motor de RAG (Chat Inteligente)
- [ ] **Retrieval Service:**
    - [ ] Implementar busca por similaridade no Qdrant baseada na pergunta do usuário.
    - [ ] Filtro obrigatório de `tenantId` no banco de vetores (Isolamento de dados).
- [ ] **Orquestração de LLM:**
    - [ ] Criar `PromptBuilder` para injetar contexto recuperado.
    - [ ] Implementar endpoint de Chat com suporte a **Streaming (Server-Sent Events)**.
- [ ] **Histórico:**
    - [ ] Salvar logs de conversas para auditoria e contexto de memória curta.

### 💳 Fase 4: Monetização e Modelo SaaS
- [ ] **Billing com Stripe:**
    - [ ] Criar Clientes no Stripe automaticamente no registro do Tenant.
    - [ ] Implementar Webhooks para processar pagamentos e assinaturas.
- [ ] **Controle de Créditos:**
    - [ ] Implementar sistema de "Wallet" de créditos por Tenant.
    - [ ] Criar `Guard` que bloqueia uso da IA se o saldo de créditos for insuficiente.
    - [ ] Lógica de contagem de tokens após cada resposta da IA.

### 🧪 Fase 5: Qualidade e Operação
- [ ] **Testes:**
    - [ ] Testes unitários para lógica de créditos e permissões.
    - [ ] Testes de integração usando **Testcontainers**.
- [ ] **Observabilidade:**
    - [ ] Logs estruturados com `Pino` ou `Winston`.
    - [ ] Endpoint de `/health` para monitoramento.

---

## 🚀 Como Iniciar

1. Clone o repositório.
2. Copie o arquivo `.env.example` para `.env` e preencha as chaves (Gemini, Stripe).
3. Suba a infraestrutura: `docker-compose up -d`.
4. Execute as migrações: `npx prisma migrate dev`.
5. Inicie a aplicação: `npm run start:dev`.

---
