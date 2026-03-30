# LabManager - Sistema de Gerenciamento para Laboratório de Impressoras

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.6-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

Sistema web moderno e intuitivo para gerenciamento de laboratório de reparo de impressoras. Desenvolvido com React, Vite e Tailwind CSS.

## Funcionalidades

### Gerenciamento de Máquinas
- Cadastro completo de impressoras (número de série, marca, modelo)
- Controle de localização (cliente, setor, bancada)
- Acompanhamento de status em tempo real
- Marcação de máquinas urgentes
- Histórico de serviço completo

### Status de Reparo
- **Recebido** - Máquina recebida no laboratório
- **Em Diagnóstico** - Análise inicial em andamento
- **Aguardando Peças** - Esperando peças para reparo
- **Em Reparo** - Reparo em execução
- **Concluído** - Serviço finalizado
- **Entregue** - Máquina devolvida ao cliente

### Histórico de Serviço
- Timeline completa de atividades
- Registro de ações realizadas
- Controle de peças substituídas
- Testes realizados
- Observações e notas
- Suporte a entrada por voz

### Gestão de Peças
- Controle de estoque
- Status: Em Estoque, Solicitado, Chegou
- Vinculação com máquinas específicas
- Acompanhamento de solicitações pendentes

### Lista de Tarefas
- Tarefas diárias com prioridades (Baixa, Média, Alta)
- Checklist interativo
- Vinculação com máquinas
- Datas de vencimento

### Recursos Adicionais
- **Entrada por Voz** - Adicione notas falando (Web Speech API)
- **Exportação PDF** - Gere relatórios profissionais de serviço
- **Fotos** - Anexe fotos do antes/durante/depois do reparo
- **Busca e Filtros** - Encontre máquinas rapidamente
- **Design Responsivo** - Funciona em desktop e mobile

## Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool rápida e moderna
- **Tailwind CSS** - Framework CSS utilitário
- **React Router DOM** - Navegação entre páginas
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas
- **jsPDF** - Geração de PDFs
- **Web Speech API** - Reconhecimento de voz

## Instalação

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/lucianodev2/labmanager.git
cd labmanager
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra o navegador em `http://localhost:5173`

## Build para Produção

```bash
npm run build
```

Os arquivos de produção estarão na pasta `dist/`.

## Estrutura do Projeto

```
printer-lab-manager/
├── src/
│   ├── components/
│   │   ├── common/       # Componentes reutilizáveis
│   │   ├── layout/       # Layout (Sidebar, Header)
│   │   ├── machines/     # Componentes de máquinas
│   │   ├── service/      # Histórico de serviço
│   │   ├── parts/        # Gestão de peças
│   │   └── tasks/        # Lista de tarefas
│   ├── pages/            # Páginas principais
│   ├── hooks/            # Custom hooks
│   ├── context/          # Context API
│   ├── utils/            # Utilitários e constantes
│   └── data/             # Dados de exemplo
├── public/               # Arquivos estáticos
└── package.json
```

## Armazenamento de Dados

O aplicativo utiliza **Local Storage** do navegador para persistência de dados. Todas as máquinas, peças e tarefas são salvas localmente no dispositivo.

## Recursos de Acessibilidade

- Interface responsiva para mobile e desktop
- Suporte a navegação por teclado
- Contraste adequado para leitura
- Ícones intuitivos para rápida identificação

## Screenshots

### Dashboard
Visão geral com estatísticas, máquinas urgentes e tarefas pendentes.

### Lista de Máquinas
Grid de máquinas com filtros, busca e indicadores visuais de status.

### Detalhes da Máquina
Página completa com informações, histórico de serviço, fotos e exportação PDF.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto está licenciado sob a licença MIT.

## Autor

Desenvolvido para otimizar o fluxo de trabalho em laboratórios de reparo de impressoras.

---

**Nota:** Este é um projeto de código aberto. Use e modifique conforme necessário para suas necessidades.
