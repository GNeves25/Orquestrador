#!/bin/bash

# Script de inicialização do Orquestrador de IAs
# Este script facilita o setup e execução do sistema completo

set -e

echo "🤖 Orquestrador de IAs - Setup Rápido"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar pré-requisitos
echo "📋 Verificando pré-requisitos..."

if ! command_exists dotnet; then
    echo -e "${RED}❌ .NET SDK não encontrado${NC}"
    echo "   Instale em: https://dotnet.microsoft.com/download"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 não encontrado${NC}"
    echo "   Instale em: https://www.python.org/downloads/"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    echo "   Instale em: https://nodejs.org/"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker não encontrado${NC}"
    echo "   Instale em: https://www.docker.com/"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando${NC}"
    echo "   Por favor, inicie o Docker Desktop ou o serviço do Docker."
    exit 1
fi

echo -e "${GREEN}✅ Todos os pré-requisitos instalados${NC}"
echo ""

# Verificar .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo "   Criando a partir de .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}   ⚠️  IMPORTANTE: Edite o arquivo .env e adicione sua GEMINI_API_KEY${NC}"
    echo "   Obtenha sua chave em: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Pressione ENTER após configurar a API Key..."
fi

# Carregar variáveis de ambiente
set -a
    source .env
    set +a

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo -e "${RED}❌ GEMINI_API_KEY não configurada no arquivo .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuração carregada${NC}"
echo ""

# Menu de opções
echo "Escolha uma opção:"
echo "1) Setup completo (primeira vez)"
echo "2) Iniciar todos os serviços"
echo "3) Iniciar apenas infraestrutura (PostgreSQL + Redis)"
echo "4) Iniciar apenas backend C#"
echo "5) Iniciar apenas agentes Python"
echo "6) Iniciar apenas frontend Angular"
echo "7) Parar todos os serviços"
echo ""
read -p "Opção: " option

case $option in
    1)
        echo ""
        echo "🔧 Setup Completo"
        echo "================"
        
        # Infraestrutura
        echo ""
        echo "📦 Iniciando PostgreSQL e Redis..."
        docker-compose up -d postgres redis
        
        # Aguardar serviços
        echo "⏳ Aguardando serviços ficarem prontos..."
        sleep 10
        
        # Backend
        echo ""
        echo "🔨 Compilando backend C#..."
        cd Orquestrador.API
        dotnet build
        cd ..
        
        # Python
        echo ""
        echo "🐍 Instalando dependências Python..."
        cd agents
        pip3 install -r requirements.txt
        cd ..
        
        # Frontend
        echo ""
        echo "⚛️  Instalando dependências Angular..."
        cd frontend
        npm install
        cd ..
        
        echo ""
        echo -e "${GREEN}✅ Setup completo!${NC}"
        echo ""
        echo "Para iniciar o sistema, execute: ./start.sh e escolha opção 2"
        ;;
        
    2)
        echo ""
        echo "🚀 Iniciando todos os serviços..."
        
        # Infraestrutura
        docker-compose up -d postgres redis
        sleep 5
        
        # Agentes Python
        docker-compose up -d product-owner project-manager designer tech-lead developer qa devops
        
        echo ""
        echo -e "${GREEN}✅ Infraestrutura e agentes iniciados${NC}"
        echo ""
        echo "Agora inicie manualmente em terminais separados:"
        echo ""
        echo "Terminal 1 - Backend C#:"
        echo "  cd Orquestrador.API && dotnet run"
        echo ""
        echo "Terminal 2 - Frontend Angular:"
        echo "  cd frontend && npm start"
        echo ""
        echo "URLs:"
        echo "  - Frontend: http://localhost:4200"
        echo "  - Backend API: http://localhost:5220"
        echo "  - Swagger: http://localhost:5220/swagger"
        ;;
        
    3)
        echo ""
        echo "📦 Iniciando PostgreSQL e Redis..."
        docker-compose up -d postgres redis
        echo -e "${GREEN}✅ Infraestrutura iniciada${NC}"
        ;;
        
    4)
        echo ""
        echo "🔨 Iniciando backend C#..."
        cd Orquestrador.API
        dotnet run
        ;;
        
    5)
        echo ""
        echo "🐍 Iniciando agentes Python..."
        docker-compose up -d product-owner project-manager designer tech-lead developer qa devops
        echo -e "${GREEN}✅ Agentes iniciados${NC}"
        echo ""
        echo "Agentes rodando em:"
        echo "  - Product Owner: http://localhost:8001"
        echo "  - Project Manager: http://localhost:8002"
        echo "  - Designer: http://localhost:8003"
        echo "  - Tech Lead: http://localhost:8004"
        echo "  - Developer: http://localhost:8005"
        echo "  - QA: http://localhost:8006"
        echo "  - DevOps: http://localhost:8007"
        ;;
        
    6)
        echo ""
        echo "⚛️  Iniciando frontend Angular..."
        cd frontend
        npm start
        ;;
        
    7)
        echo ""
        echo "🛑 Parando todos os serviços..."
        docker-compose down
        echo -e "${GREEN}✅ Serviços parados${NC}"
        ;;
        
    *)
        echo -e "${RED}Opção inválida${NC}"
        exit 1
        ;;
esac
