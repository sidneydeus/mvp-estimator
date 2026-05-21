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

*   [Express](https://expressjs.com/): Framework web para Node.js.
*   [Vite](https://vitejs.dev/): Ferramenta de build e desenvolvimento ultra-rápida.
*   [TypeScript](https://www.typescriptlang.org/): Superset de JavaScript com tipagem estática.
*   [Zod](https://zod.dev/): Validação de esquemas e tipos.
*   [Vitest](https://vitest.dev/): Framework de testes.
