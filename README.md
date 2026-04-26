# Servicelab - Sistema de Gerenciamento para Laboratório de Impressoras

![React](https://img.shields.io/badge/React-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-blue)
![Vite](https://img.shields.io/badge/Vite-7.0-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.6-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

Sistema web completo para gerenciamento de laboratório de reparo de impressoras. Desenvolvido com React + Vite no frontend e FastAPI + PostgreSQL no backend.

## Funcionalidades

### Gerenciamento de Máquinas
- Cadastro de impressoras (número de série, marca, modelo, localização)
- Controle de status em tempo real
- Marcação de máquinas urgentes

### Status das Máquinas
- **maintenance** — Em manutenção
- **waiting_parts** — Aguardando peças
- **testing** — Em testes
- **ready** — Pronto para entrega
- **completed** — Concluído

### Serviços
- Registro de serviços vinculados a máquinas
- Status: pendente, em andamento, concluído

### Gestão de Peças
- Controle de estoque com quantidade
- Status: disponível, solicitado, sem estoque
- Vinculação com máquinas específicas

### Lista de Tarefas
- Prioridades: baixa, média, alta
- Vinculação com máquinas
- Datas de vencimento
- Marcação de conclusão

### Estatísticas
- Total de máquinas, serviços, peças e tarefas
- Máquinas urgentes e tarefas pendentes
- Distribuição de máquinas por status

## Tecnologias

### Backend
- **FastAPI** — API REST com documentação automática
- **SQLAlchemy** — ORM para banco de dados
- **PostgreSQL** — Banco de dados relacional
- **Pydantic** — Validação de dados
- **Uvicorn** — Servidor ASGI
- **python-dotenv** — Gerenciamento de variáveis de ambiente

### Frontend
- **React 18** — Interface de usuário
- **Vite** — Build tool
- **Tailwind CSS** — Estilização
- **React Router DOM** — Navegação
- **Lucide React** — Ícones
- **jsPDF + html2canvas** — Exportação de PDF
- **date-fns** — Manipulação de datas

## Instalação local

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL rodando localmente

### Backend

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Crie um arquivo `.env` na raiz com as variáveis do banco:
```env
DB_USER=postgres
DB_PASS=sua_senha
DB_HOST=localhost
DB_PORT=5432
DB_NAME=servicelab
```

3. Inicie o servidor:
```bash
python main.py
```

A API estará disponível em `http://localhost:8000`.
Documentação interativa: `http://localhost:8000/docs`

### Frontend

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## Build para produção

```bash
npm run build
```

Os arquivos de produção estarão na pasta `dist/`.

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/machines` | Listar máquinas |
| POST | `/api/machines` | Criar máquina |
| GET | `/api/machines/{id}` | Buscar máquina |
| PUT | `/api/machines/{id}` | Atualizar máquina |
| DELETE | `/api/machines/{id}` | Deletar máquina |
| GET | `/api/services` | Listar serviços |
| POST | `/api/services` | Criar serviço |
| GET | `/api/machines/{id}/services` | Serviços de uma máquina |
| PUT | `/api/services/{id}` | Atualizar serviço |
| DELETE | `/api/services/{id}` | Deletar serviço |
| GET | `/api/parts` | Listar peças |
| POST | `/api/parts` | Criar peça |
| PUT | `/api/parts/{id}` | Atualizar peça |
| DELETE | `/api/parts/{id}` | Deletar peça |
| GET | `/api/tasks` | Listar tarefas |
| POST | `/api/tasks` | Criar tarefa |
| PUT | `/api/tasks/{id}` | Atualizar tarefa |
| PATCH | `/api/tasks/{id}/complete` | Concluir tarefa |
| DELETE | `/api/tasks/{id}` | Deletar tarefa |
| GET | `/api/stats` | Estatísticas gerais |

## Estrutura do Projeto

```
servicelab/
├── main.py               # Backend FastAPI (entrada principal)
├── requirements.txt      # Dependências Python
├── .env                  # Variáveis de ambiente (não versionado)
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── hooks/            # Custom hooks
│   ├── context/          # Context API
│   ├── services/         # Chamadas à API
│   └── utils/            # Utilitários e constantes
├── package.json          # Dependências Node.js
└── vite.config.js        # Configuração do Vite
```

## Deploy

### Backend — Render
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Variáveis de ambiente: `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`

### Frontend — Vercel / Netlify
```bash
npm run build
```
Aponte para a pasta `dist/` como diretório de publicação.

## Licença

Este projeto está licenciado sob a licença MIT.
