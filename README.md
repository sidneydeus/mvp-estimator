# MVP Estimator

O MVP Estimator é uma aplicação para fornecer estimativas de custo e tempo para o desenvolvimento de MVPs (Minimum Viable Products), utilizando inteligência artificial para analisar requisitos. O repositório contém:

- **Backend (API Node/Express)** na raiz do projeto
- **Frontend (SPA React)** no diretório `frontend/`

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

#### 1) Subir o Backend (API) — npm (Modo Desenvolvimento)

Para iniciar o servidor com hot-reload (usando Vite):
```bash
npm run dev
```
A API estará disponível em `http://localhost:3000` (ou na porta configurada no seu `.env`).

Endpoints úteis:

- `GET /health`
- `POST /estimate`

#### 2) Subir o Frontend (React) — npm (Modo Desenvolvimento)

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend roda em `http://localhost:5173` e faz proxy para o backend em `http://localhost:3000`.

#### Usando Docker (somente backend)

Se preferir rodar o projeto em um container isolado:
```bash
docker-compose up --build
```

#### Usando Docker (backend + frontend)

Para subir os dois serviços (API em `:3000` e frontend em `:5173`):

```bash
docker-compose up --build
```

Links:

- API: `http://localhost:3000/health`
- Frontend: `http://localhost:5173`

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

*   [Express](https://expressjs.com/): Framework web para Node.js.
*   [Vite](https://vitejs.dev/): Ferramenta de build e desenvolvimento ultra-rápida.
*   [TypeScript](https://www.typescriptlang.org/): Superset de JavaScript com tipagem estática.
*   [Zod](https://zod.dev/): Validação de esquemas e tipos.
*   [Vitest](https://vitest.dev/): Framework de testes.
