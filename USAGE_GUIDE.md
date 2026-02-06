# Guia de Uso Rápido - Orquestrador de IAs

Este guia mostra como usar o sistema passo a passo.

## 🚀 Início Rápido

### 1. Configuração Inicial

```bash
# 1. Configure a API Key do Gemini
cp .env.example .env
# Edite .env e adicione sua GEMINI_API_KEY

# 2. Execute o setup
./start.sh
# Escolha opção 1 (Setup completo)
```

### 2. Iniciar o Sistema

```bash
# Inicie a infraestrutura e agentes
./start.sh
# Escolha opção 2

# Em outro terminal, inicie o backend
cd Orquestrador.API
dotnet run

# Em outro terminal, inicie o frontend
cd frontend
npm start
```

### 3. Acessar o Sistema

Abra seu navegador em `http://localhost:4200`

---

## 📝 Exemplo de Uso Completo

### Cenário: Criar um Sistema de E-commerce

#### Passo 1: Criar o Projeto

**Via API (Postman/curl):**

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-commerce Platform",
    "description": "Plataforma completa de e-commerce com carrinho, pagamentos e gestão de produtos",
    "requirements": "Sistema deve suportar múltiplos vendedores, integração com gateways de pagamento, e ter interface responsiva",
    "technicalStack": "React, Node.js, PostgreSQL, Redis, Stripe"
  }'
```

**Resposta:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "E-commerce Platform",
  "status": "Planning",
  "createdAt": "2026-02-04T14:30:00Z"
}
```

#### Passo 2: Adicionar Agentes ao Time

```bash
# Product Owner
curl -X POST http://localhost:5000/api/teammembers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah - PO",
    "role": "ProductOwner",
    "description": "Product Owner especializada em e-commerce"
  }'

# Tech Lead
curl -X POST http://localhost:5000/api/teammembers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marcus - Tech Lead",
    "role": "TechLead",
    "description": "Tech Lead com experiência em arquitetura de e-commerce"
  }'

# Designer
curl -X POST http://localhost:5000/api/teammembers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana - Designer",
    "role": "Designer",
    "description": "UX/UI Designer especializada em conversão"
  }'

# Developer
curl -X POST http://localhost:5000/api/teammembers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos - Dev",
    "role": "Developer",
    "description": "Full-stack developer"
  }'

# QA
curl -X POST http://localhost:5000/api/teammembers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Julia - QA",
    "role": "QA",
    "description": "QA Engineer com foco em testes automatizados"
  }'
```

#### Passo 3: Criar Tarefas para os Agentes

**Tarefa 1: Product Owner - Definir User Stories**

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "123e4567-e89b-12d3-a456-426614174000",
    "assignedToId": "<id-do-po>",
    "title": "Definir User Stories para MVP",
    "description": "Criar user stories detalhadas para o MVP do e-commerce",
    "priority": "High",
    "context": "Foco em funcionalidades essenciais: catálogo de produtos, carrinho, checkout e pagamento",
    "expectedOutput": "Lista de user stories priorizadas com critérios de aceitação"
  }'
```

**Tarefa 2: Tech Lead - Definir Arquitetura**

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "123e4567-e89b-12d3-a456-426614174000",
    "assignedToId": "<id-do-tech-lead>",
    "title": "Definir Arquitetura do Sistema",
    "description": "Propor arquitetura técnica para o e-commerce",
    "priority": "Critical",
    "context": "Stack: React, Node.js, PostgreSQL, Redis. Deve ser escalável e suportar múltiplos vendedores",
    "expectedOutput": "Diagrama de arquitetura e decisões técnicas documentadas"
  }'
```

**Tarefa 3: Designer - Criar Wireframes**

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "123e4567-e89b-12d3-a456-426614174000",
    "assignedToId": "<id-do-designer>",
    "title": "Criar Wireframes da Home e Produto",
    "description": "Desenhar wireframes para página inicial e página de produto",
    "priority": "High",
    "context": "Foco em conversão, mobile-first, acessibilidade",
    "expectedOutput": "Descrição detalhada dos wireframes com justificativas de UX"
  }'
```

#### Passo 4: Executar as Tarefas

```bash
# Executar tarefa do PO
curl -X POST http://localhost:5000/api/tasks/<task-id>/execute

# Executar tarefa do Tech Lead
curl -X POST http://localhost:5000/api/tasks/<task-id>/execute

# Executar tarefa do Designer
curl -X POST http://localhost:5000/api/tasks/<task-id>/execute
```

#### Passo 5: Visualizar Respostas

```bash
# Ver resposta de uma tarefa
curl http://localhost:5000/api/tasks/<task-id>/responses
```

**Exemplo de Resposta do Product Owner:**

```json
{
  "id": "response-123",
  "taskId": "task-456",
  "teamMemberId": "po-789",
  "content": "# User Stories para MVP do E-commerce\n\n## Epic: Catálogo de Produtos\n\n### US-001: Visualizar Lista de Produtos\n**Como** visitante\n**Quero** visualizar uma lista de produtos disponíveis\n**Para** encontrar itens que desejo comprar\n\n**Critérios de Aceitação:**\n- Produtos exibidos em grid responsivo\n- Cada produto mostra: imagem, nome, preço, avaliação\n- Paginação de 20 produtos por página\n- Filtros por categoria e faixa de preço\n\n**Prioridade:** Alta\n**Story Points:** 5\n\n### US-002: Ver Detalhes do Produto\n**Como** visitante\n**Quero** ver informações detalhadas de um produto\n**Para** tomar decisão de compra informada\n\n**Critérios de Aceitação:**\n- Galeria de imagens do produto\n- Descrição completa\n- Especificações técnicas\n- Avaliações de outros compradores\n- Botão de adicionar ao carrinho\n\n**Prioridade:** Alta\n**Story Points:** 8\n\n## Epic: Carrinho de Compras\n\n### US-003: Adicionar Produto ao Carrinho\n...",
  "isSuccessful": true,
  "tokensUsed": 1250,
  "processingTimeMs": 3500,
  "createdAt": "2026-02-04T14:35:00Z"
}
```

---

## 🎯 Casos de Uso Comuns

### 1. Planejamento de Sprint

```bash
# Criar tarefa para PM
{
  "title": "Planejar Sprint 1",
  "description": "Criar plano detalhado da primeira sprint",
  "assignedTo": "Project Manager",
  "priority": "High",
  "context": "Time de 5 pessoas, sprint de 2 semanas, foco no MVP"
}
```

### 2. Code Review

```bash
# Criar tarefa para Tech Lead
{
  "title": "Revisar Implementação do Carrinho",
  "description": "Revisar código do módulo de carrinho de compras",
  "assignedTo": "Tech Lead",
  "priority": "Medium",
  "context": "Código em React com Redux, verificar performance e boas práticas"
}
```

### 3. Criar Test Plan

```bash
# Criar tarefa para QA
{
  "title": "Test Plan para Checkout",
  "description": "Criar plano de testes para fluxo de checkout",
  "assignedTo": "QA",
  "priority": "High",
  "context": "Fluxo crítico: carrinho -> dados pessoais -> pagamento -> confirmação"
}
```

### 4. Design de Feature

```bash
# Criar tarefa para Designer
{
  "title": "Design do Sistema de Avaliações",
  "description": "Criar design para sistema de avaliações de produtos",
  "assignedTo": "Designer",
  "priority": "Medium",
  "context": "Deve permitir texto, estrelas e fotos. Inspiração: Amazon"
}
```

---

## 📊 Monitoramento

### Ver Status de Todos os Projetos

```bash
curl http://localhost:5000/api/projects
```

### Ver Tarefas de um Projeto

```bash
curl http://localhost:5000/api/projects/<project-id>/tasks
```

### Ver Todos os Agentes Ativos

```bash
curl http://localhost:5000/api/teammembers?isActive=true
```

### Health Check dos Agentes

```bash
# Product Owner
curl http://localhost:8001/health

# Project Manager
curl http://localhost:8002/health

# Designer
curl http://localhost:8003/health

# Tech Lead
curl http://localhost:8004/health

# Developer
curl http://localhost:8005/health

# QA
curl http://localhost:8006/health
```

---

## 🔧 Troubleshooting

### Agente não responde

1. Verifique se o agente está rodando:
   ```bash
   docker ps
   ```

2. Veja os logs do agente:
   ```bash
   docker logs <container-name>
   ```

3. Verifique a API Key do Gemini no .env

### Backend não conecta ao banco

1. Verifique se o PostgreSQL está rodando:
   ```bash
   docker ps | grep postgres
   ```

2. Teste a conexão:
   ```bash
   docker exec -it <postgres-container> psql -U postgres -d orquestrador
   ```

### Frontend não carrega dados

1. Verifique se o backend está rodando em http://localhost:5000
2. Abra o console do navegador (F12) para ver erros
3. Verifique CORS no backend

---

## 💡 Dicas

- **Priorize tarefas**: Use `Critical` para tarefas bloqueantes
- **Contexto é importante**: Quanto mais contexto você der, melhor será a resposta da IA
- **Iteração**: Use as respostas dos agentes para criar novas tarefas mais específicas
- **Combine agentes**: Faça o PO definir requisitos, depois o Tech Lead arquitetura, depois o Dev implementar
- **Use o expected_output**: Especifique o formato que você espera (lista, diagrama, código, etc.)

---

## 🎓 Exemplos de Prompts Efetivos

### Para Product Owner
```
"Definir requisitos funcionais e não-funcionais para sistema de notificações em tempo real. 
Considerar: push notifications, email, SMS. 
Priorizar por impacto no usuário e viabilidade técnica."
```

### Para Tech Lead
```
"Propor arquitetura de microserviços para sistema de pagamentos.
Stack: Node.js, Kafka, PostgreSQL.
Considerar: segurança PCI-DSS, idempotência, retry logic, dead letter queue."
```

### Para Designer
```
"Criar design system para aplicativo mobile de delivery.
Incluir: paleta de cores, tipografia, componentes principais (botões, cards, inputs).
Foco em acessibilidade e usabilidade."
```

### Para Developer
```
"Implementar autenticação JWT com refresh tokens em Node.js.
Requisitos: bcrypt para hash, tokens com expiração, blacklist de tokens revogados.
Incluir tratamento de erros e validação de inputs."
```

### Para QA
```
"Criar estratégia de testes para API REST de gerenciamento de usuários.
Incluir: testes unitários, integração, carga, segurança.
Definir métricas de cobertura e ferramentas recomendadas."
```

---

**Pronto para começar! 🚀**

Execute `./start.sh` e comece a orquestrar seu time de IAs!
