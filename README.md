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
- [x] **Setup de Infraestrutura:**
    - [x] Inicializar projeto NestJS.
    - [x] Configurar `docker-compose.yml` (Postgres, Redis, RabbitMQ, Qdrant).
    - [x] Definir Schema Prisma (`User`, `Tenant`, `Member`).
- [x] **Autenticação Avançada:**
    - [x] Implementar `POST /auth/register`: Criar User, Tenant e Member (OWNER) em uma transação.
    - [x] Implementar `POST /auth/login`: Retornar JWT com `tenantId` e `role` no payload.
- [x] **Autorização & Contexto:**
    - [x] Criar Decorator `@Roles(TenantRole.ADMIN)`.
    - [x] Criar `RolesGuard` para validar acesso baseado na organização.
    - [x] Endpoint `GET /auth/me`: Retornar perfil do usuário e lista de Tenants vinculados.
    - [x] Endpoint `PATCH /auth/switch-tenant`: Rota para o usuário trocar qual organização ele está operando no momento.

### 👥 Fase 2: Gestão de Times e Convites (Team Management)
- [ ] **Fluxo de Convites:**
    - [x] Criar model `Invite` no Prisma (email, tenantId, role, token, expiresAt).
    - [x] `POST /tenants/invites`: Admin envia convite para um novo e-mail.
    - [ ] `GET /tenants/invites`: Listar convites pendentes da organização.
    - [ ] `DELETE /tenants/invites/:id`: Revogar um convite pendente.
- [ ] **Adesão de Novos Membros:**
    - [ ] `POST /auth/invites/accept`: Rota pública para aceitar convite via token.
    - [ ] Lógica para vincular usuário existente ao novo Tenant ou forçar registro.
- [ ] **Gestão de Membros Ativos:**
    - [ ] `GET /tenants/members`: Listar todos os usuários da organização atual.
    - [ ] `PATCH /tenants/members/:userId`: Alterar Role de um membro (ex: de MEMBER para ADMIN).
    - [ ] `DELETE /tenants/members/:userId`: Remover um membro da organização.

### 📂 Fase 3: Ingestão de Documentos e Pipeline ETL
- [ ] **Módulo de Documentos Granular:**
    - [ ] `POST /documents/upload`: Receber arquivo e salvar metadados como `PENDING`.
    - [ ] `GET /documents`: Listar documentos do Tenant com paginação e filtro de status.
    - [ ] `DELETE /documents/:id`: Remover do Postgres e disparar remoção no Qdrant.
- [ ] **Processamento Assíncrono:**
    - [ ] Configurar Producer RabbitMQ para evento `document.uploaded`.
    - [ ] Criar Worker (Consumer) para processamento pesado.
- [ ] **Integração IA & Vector DB:**
    - [ ] Implementar lógica de Chunking de texto.
    - [ ] Gerar Embeddings via Gemini API.
    - [ ] Upsert no Qdrant com metadados de isolamento (`tenantId`).

### 🧠 Fase 4: Motor de RAG e Chat
- [ ] **Retrieval & Prompt:**
    - [ ] Criar Service de busca semântica no Qdrant.
    - [ ] Implementar `PromptBuilder` para gerir o contexto enviado à LLM.
- [ ] **Experiência de Chat:**
    - [ ] `POST /chat`: Endpoint de pergunta e resposta.
    - [ ] Implementar suporte a **Streaming (SSE)** para respostas em tempo real.
    - [ ] Armazenar histórico de mensagens por `conversationId`.

### 💳 Fase 5: Monetização, Billing e Créditos
- [ ] **Integração Stripe:**
    - [ ] Criar `Customer` no Stripe ao criar um `Tenant`.
    - [ ] Implementar Webhooks para `checkout.session.completed` e `invoice.paid`.
- [ ] **Sistema de Cotas:**
    - [ ] Criar model `Usage` para debito de créditos/tokens.
    - [ ] `Guard` de cobrança: Bloquear `/chat` se o `Tenant` estiver sem saldo.
    - [ ] `GET /tenants/usage`: Endpoint para o Admin ver o consumo de créditos.

### 🛡️ Fase 6: Auditoria e Observabilidade (Enterprise Ready)
- [ ] **Audit Logs:**
    - [ ] Criar model `AuditLog` (userId, action, targetId, timestamp).
    - [ ] Implementar um `Global Interceptor` para registrar ações críticas (Delete, Invite, Update Role).
    - [ ] `GET /tenants/audit-logs`: Visualização para o OWNER da organização.
- [ ] **Health & Quality:**
    - [ ] Implementar `Terminus` para Health Checks (DB, Redis, RabbitMQ).
    - [ ] Configurar logs estruturados com `Pino`.

---
