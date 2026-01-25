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
- [x] **Fluxo de Convites:**
    - [x] Criar model `Invite` no Prisma (email, tenantId, role, token, expiresAt).
    - [x] `POST /tenants/invites`: Admin envia convite para um novo e-mail.
    - [x] `GET /tenants/invites`: Listar convites pendentes da organização.
    - [x] `DELETE /tenants/invites/:id`: Revogar um convite pendente.
- [x] **Adesão de Novos Membros:**
    - [x] `POST /tenants/invites/accept`: Rota pública para aceitar convite via token.
    - [x] `POST /tenants/invites/decline`: Rota pública para recusar convite via token.
- [x] **Gestão de Membros Ativos:**
    - [x] `GET /tenants/members`: Listar todos os usuários da organização atual.
    - [x] `PATCH /tenants/members/:userId`: Alterar Role de um membro (ex: de MEMBER para ADMIN).
    - [x] `DELETE /tenants/members/:userId`: Remover um membro da organização.

### 📂 Fase 3: Ingestão de Documentos e Pipeline ETL (Extração, Transformação e Carga)

- [ ] **Módulo de Armazenamento (Storage):**
    - [ ] Implementar `DocumentsModule` para gestão de metadados.
    - [ ] Configurar **Multer** no NestJS para recebimento de arquivos (PDF/TXT).
    - [ ] Integrar com **MinIO** (via S3 SDK) para persistência de arquivos em ambiente Docker, garantindo paridade com produção (AWS S3).
    - [ ] Criar endpoint `POST /documents/upload` com validação de MIME type e limite de tamanho.

- [ ] **Arquitetura de Mensageria (RabbitMQ):**
    - [ ] Configurar um **Microservice Transporter** no NestJS para o RabbitMQ.
    - [ ] Criar o `DocumentProducer`: Assim que o arquivo for salvo no Storage, disparar um evento `document.uploaded` contendo o `documentId` e `tenantId`.
    - [ ] Implementar filas com **DLQ (Dead Letter Queues)** para tratar falhas em arquivos corrompidos ou erros de API externa.

- [ ] **Worker de Processamento (The Ingestor):**
    - [ ] Criar um **Consumer** dedicado para processar a fila em segundo plano.
    - [ ] **Extração:** Utilizar `pdf-parse` ou bibliotecas similares para extrair texto limpo.
    - [ ] **Splitting/Chunking:** Implementar `RecursiveCharacterTextSplitter` (LangChain) para dividir o texto em pedaços lógicos (ex: 1000 tokens com 20% de overlap).
    - [ ] **Isolamento Multi-tenant:** Garantir que cada fragmento de texto carregue o `tenantId` nos metadados.

- [ ] **Integração com Vector DB & Gemini:**
    - [ ] Consumir a API de **Embeddings do Gemini** (`text-embedding-004`) para converter chunks de texto em vetores de 768 dimensões (ou similar).
    - [ ] **Qdrant Integration:** Criar coleções no Qdrant e realizar o `upsert` dos vetores.
    - [ ] Implementar o **Payload do Vetor**: O Qdrant deve armazenar o vetor + metadados (texto original, `docId`, `pageNumber`, `tenantId`).
    - [ ] Atualizar o status do documento no PostgreSQL para `COMPLETED` após a indexação.

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
