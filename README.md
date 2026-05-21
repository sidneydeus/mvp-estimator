# MVP Estimator

O MVP Estimator é uma API desenvolvida para fornecer estimativas de custo e tempo para o desenvolvimento de MVPs (Minimum Viable Products), utilizando inteligência artificial para analisar os requisitos.

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
* [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
* [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (opcional, para execução via containers)

### 🔧 Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/mvp-estimator.git
    cd mvp-estimator
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Edite o arquivo `.env` e configure as variáveis necessárias.
    Para ativar o agente de IA com Groq, defina `GROQ_API_KEY` e, opcionalmente, `GROQ_MODEL`.

### 💻 Executando a Aplicação

#### Usando npm (Modo Desenvolvimento)

Para iniciar o servidor com hot-reload (usando Vite):
```bash
npm run dev
```
A API estará disponível em `http://localhost:3000` (ou na porta configurada no seu `.env`).

#### Usando Docker

Se preferir rodar o projeto em um container isolado:
```bash
docker-compose up --build
```

### 🧪 Executando Testes

O projeto utiliza **Vitest** para testes unitários e de integração.

Para rodar todos os testes:
```bash
npm test
```

### 🏗️ Scripts Disponíveis

*   `npm run dev`: Inicia o servidor em modo de desenvolvimento.
*   `npm run build`: Gera o build de produção.
*   `npm run start`: Inicia o servidor em modo de produção (após o build).
*   `npm run test`: Executa a suíte de testes.

## 🛠️ Tecnologias Utilizadas

### Backend
*   [Express](https://expressjs.com/): Framework web para Node.js.
*   [Vite](https://vitejs.dev/): Ferramenta de build e desenvolvimento ultra-rápida.
*   [TypeScript](https://www.typescriptlang.org/): Superset de JavaScript com tipagem estática.
*   [Zod](https://zod.dev/): Validação de esquemas e tipos.
*   [Vitest](https://vitest.dev/): Framework de testes.

### Frontend
*   [React](https://react.dev/) + [Vite](https://vitejs.dev/): SPA em `frontend/`.

### IA
*   [Groq Cloud](https://groq.com/) com modelo padrão `openai/gpt-oss-20b` para geração do backlog.
*   `MockAIService` em desenvolvimento sem chave ou em ambiente de testes — selecionado automaticamente pelo `aiServiceFactory`.

## 📚 Documentação

A documentação técnica e de produto está versionada em [`docs/`](./docs):

| Documento | Conteúdo |
|---|---|
| [`docs/PRD.md`](./docs/PRD.md) | Product Requirements Document — visão, personas, escopo do MVP |
| [`docs/STEERING.md`](./docs/STEERING.md) | Princípios arquiteturais e direcionamento estratégico |
| [`docs/ADR-BACKEND.md`](./docs/ADR-BACKEND.md) | Architecture Decision Record do backend (Express, MVC, Docker) |
| [`docs/ADR-FRONTEND.md`](./docs/ADR-FRONTEND.md) | ADR do frontend (React + Vite, consumo da API) |
| [`docs/VIABILIDADE.md`](./docs/VIABILIDADE.md) | Documento de viabilidade técnica: problema, papel da IA, custo/benefício, limitações com causa raiz, próximos passos |
| [`docs/USER-STORIES.md`](./docs/USER-STORIES.md) | 3 user stories no padrão INVEST, geradas com IA, com mapeamento técnico |
| [`docs/UML.md`](./docs/UML.md) | Diagramas UML (sequência, classes, componentes) em Mermaid |
| [`docs/FLUXOGRAMA.md`](./docs/FLUXOGRAMA.md) | Fluxograma completo do produto (caminho feliz + erros) em Mermaid |
| [`docs/DEV-PLANNING.md`](./docs/DEV-PLANNING.md) | Planejamento de desenvolvimento |
| [`docs/PROMPTS.MD`](./docs/PROMPTS.MD) | Registro de todos os prompts utilizados — evidência obrigatória |

## 🤖 Papel da IA no Produto

A IA é o **núcleo funcional do produto** — não apenas auxílio de desenvolvimento. O endpoint `POST /api/v1/estimates` recebe a descrição da ideia em linguagem natural e devolve um backlog estruturado (Visão → Épicos → User Stories → Critérios de aceitação) com estimativa de horas baseada em densidade de tokens. Veja [`docs/VIABILIDADE.md`](./docs/VIABILIDADE.md) para a justificativa técnica completa.
