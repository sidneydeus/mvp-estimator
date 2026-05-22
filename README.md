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
<<<<<<< HEAD
    Edite o arquivo `.env` e configure as variáveis necessárias.
    Para ativar o agente de IA com Groq, defina `GROQ_API_KEY` e, opcionalmente, `GROQ_MODEL`.
=======
    Edite o arquivo `.env` e configure a porta e o provedor de LLM.

    Para rodar sem consultar uma LLM real:
    ```env
    AI_PROVIDER=mock
    ```

    Para usar um provedor compatível com OpenAI Chat Completions:
    ```env
    AI_PROVIDER=openai-compatible
    AI_BASE_URL=https://api.openai.com/v1
    AI_API_KEY=sua_chave
    AI_MODEL=gpt-4o-mini
    AI_INPUT_COST_PER_1M_TOKENS=0
    AI_OUTPUT_COST_PER_1M_TOKENS=0
    ```

    Exemplo com xAI/Grok:
    ```env
    AI_PROVIDER=openai-compatible
    AI_BASE_URL=https://api.x.ai/v1
    AI_API_KEY=sua_chave_xai
    AI_MODEL=grok-4
    AI_INPUT_COST_PER_1M_TOKENS=0
    AI_OUTPUT_COST_PER_1M_TOKENS=0
    ```

    Exemplo com Google Gemini:
    ```env
    AI_PROVIDER=openai-compatible
    AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
    AI_API_KEY=sua_chave_gemini
    AI_MODEL=gemini-3.5-flash
    AI_INPUT_COST_PER_1M_TOKENS=0
    AI_OUTPUT_COST_PER_1M_TOKENS=0
    ```

    O backend chama `${AI_BASE_URL}/chat/completions`, então informe a base URL incluindo `/v1` quando o provedor exigir.
    Configure `AI_INPUT_COST_PER_1M_TOKENS` e `AI_OUTPUT_COST_PER_1M_TOKENS` com os preços do modelo escolhido para calcular a estimativa de custo de geração de código.

    Também é possível sobrescrever os preços por requisição:
    ```json
    {
      "ideaDescription": "Quero criar uma plataforma SaaS para gestão de clínicas.",
      "aiPricing": {
        "inputCostPer1MTokens": 0.30,
        "outputCostPer1MTokens": 2.50
      }
    }
    ```

    A LLM retorna a estimativa base de tokens em `aiTokenEstimate`. A aplicação calcula a media dos ranges, soma os valores e entrega `aiCodeGenerationEstimate` já pronto para exibicao usando `aiPricing` da request ou os preços do `.env`.

    Para validar a conexão Gemini diretamente:
    ```bash
    curl "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AI_API_KEY" \
      -d '{
        "model": "gemini-3.5-flash",
        "messages": [
          { "role": "user", "content": "Responda apenas OK." }
        ]
      }'
    ```
>>>>>>> feature/adr-backend

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
