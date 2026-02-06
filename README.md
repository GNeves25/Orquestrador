# 🚀 Orquestrador de Agentes IA

> **Um ambiente avançado para colaboração multi-agente e orquestração de desenvolvimento de software.**

![Dashboard Overview]<img width="2940" height="1672" alt="dashboard_overview_1770401065079" src="https://github.com/user-attachments/assets/87070e35-d4b3-42c2-9162-388f6f8ee720" />

O **Orquestrador** é uma plataforma que simula uma equipe completa de desenvolvimento de software (Product Owner, Tech Lead, Designers, Devs, QA) utilizando Agentes de IA autônomos. Ele permite criar projetos, definir tarefas e assistir em tempo real enquanto os agentes colaboram para executar o trabalho.

## ✨ Principais Funcionalidades

*   **🕵️ Colaboração Multi-Agente**: Simulação de reuniões e processos de decisão entre agentes especializados.
*   **⚡ Atualizações em Tempo Real**: Interface reativa utilizando **SignalR** (WebSockets) para acompanhar o pensamento e as ações dos agentes ao vivo.
*   **📊 Gerenciamento de Tarefas**: Criação, priorização e execução de tarefas complexas com validação de responsáveis.
*   **🧠 Integração com LLMs**: Suporte a modelos avançados (Google Gemini) para raciocínio e geração de código.
*   **🎨 Design System Próprio**: Interface moderna e responsiva construída com Angular e CSS puro.

![Nova Tarefa] <img width="2940" height="1672" alt="nova_tarefa_modal_1770401300367" src="https://github.com/user-attachments/assets/4c5835a6-45df-4ad1-8bab-e6e0e29d1d41" />

<img width="1015" height="629" alt="image" src="https://github.com/user-attachments/assets/22989e74-a732-4fef-aa17-d6a8ebaa0edd" />

## 🛠️ Stack Tecnológica

### Backend
*   **.NET 8 API**: Core robusto para orquestração.
*   **SignalR**: Comunicação bidirecional para updates em tempo real.
*   **PostgreSQL**: Persistência de dados segura e escalável.
*   **Python Agents**: Microsserviços para lógica de IA especializada.

### Frontend
*   **Angular 17+**: Framework performático para SPA.
*   **RxJS & Signals**: Gerenciamento de estado reativo.
*   **Mermaid.js**: Renderização de diagramas gerados pela IA.

## 🚀 Como Executar

### Pré-requisitos
*   .NET 8 SDK
*   Node.js 18+
*   Docker & Docker Compose (para Banco de Dados)
*   Python 3.10+

### Instalação

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/gneves25/orquestrador.git
    ```

2.  **Configure o Ambiente**
    *   Renomeie `.env.example` para `.env` e insira sua API Key do Google Gemini.
    *   No arquivo `Orquestrador.API/appsettings.Development.json`, configure a ConnectionString se necessário.

3.  **Inicie os Serviços**

    **Backend:**
    ```bash
    cd Orquestrador.API
    dotnet run
    ```

    **Frontend:**
    ```bash
    cd frontend
    npm install
    npm start
    ```

    **Agentes (Python):**
    ```bash
    cd agents
    pip install -r requirements.txt
    python main.py
    ```

4.  **Acesse:** `http://localhost:4200`

## 🔒 Segurança

*   Todas as chaves de API foram removidas do código fonte.
*   Utilize Segredos de Usuário (`dotnet user-secrets`) ou Variáveis de Ambiente em produção.

---
Desenvolvido por Guilherme Neves e I.A.

---

# 🚀 AI Agent Orchestrator

> **An advanced environment for multi-agent collaboration and software development orchestration.**

![Dashboard Overview]<img width="2940" height="1672" alt="dashboard_overview_1770401065079" src="https://github.com/user-attachments/assets/87070e35-d4b3-42c2-9162-388f6f8ee720" />

The **Orchestrator** is a platform that simulates a full software development team (Product Owner, Tech Lead, Designers, Devs, QA) using autonomous AI Agents. It allows you to create projects, define tasks, and watch in real-time as agents collaborate to execute the work.

## ✨ Key Features

*   **🕵️ Multi-Agent Collaboration**: Simulated meetings and decision-making processes between specialized agents.
*   **⚡ Real-Time Updates**: Reactive interface using **SignalR** (WebSockets) to follow agent thoughts and actions live.
*   **📊 Task Management**: Creation, prioritization, and execution of complex tasks with ownership validation.
*   **🧠 LLM Integration**: Support for advanced models (Google Gemini) for reasoning and code generation.
*   **🎨 Custom Design System**: Modern and responsive interface built with Angular and pure CSS.

![Nova Tarefa] <img width="2940" height="1672" alt="nova_tarefa_modal_1770401300367" src="https://github.com/user-attachments/assets/4c5835a6-45df-4ad1-8bab-e6e0e29d1d41" />

<img width="1015" height="629" alt="image" src="https://github.com/user-attachments/assets/32e663e0-1201-47ed-a318-d2fb1040e36e" />

## 🛠️ Tech Stack

### Backend
*   **.NET 8 API**: Robust core for orchestration.
*   **SignalR**: Bidirectional communication for real-time updates.
*   **PostgreSQL**: Secure and scalable data persistence.
*   **Python Agents**: Microservices for specialized AI logic.

### Frontend
*   **Angular 17+**: Performant framework for SPA.
*   **RxJS & Signals**: Reactive state management.
*   **Mermaid.js**: Rendering of AI-generated diagrams.

## 🚀 How to Run

### Prerequisites
*   .NET 8 SDK
*   Node.js 18+
*   Docker & Docker Compose (for Database)
*   Python 3.10+

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/gneves25/orquestrador.git
    ```

2.  **Configure the Environment**
    *   Rename `.env.example` to `.env` and insert your Google Gemini API Key.
    *   In `Orquestrador.API/appsettings.Development.json`, configure the ConnectionString if necessary.

3.  **Start Services**

    **Backend:**
    ```bash
    cd Orquestrador.API
    dotnet run
    ```

    **Frontend:**
    ```bash
    cd frontend
    npm install
    npm start
    ```

    **Agents (Python):**
    ```bash
    cd agents
    pip install -r requirements.txt
    python main.py
    ```

4.  **Access:** `http://localhost:4200`

## 🔒 Security

*   All API keys have been removed from the source code.
*   Use User Secrets (`dotnet user-secrets`) or Environment Variables in production.

---
Developed by Guilherme Neves and A.I.
