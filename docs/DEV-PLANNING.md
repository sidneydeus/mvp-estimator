# Plano de Desenvolvimento: Backend MVP Estimator

**Objetivo:** Implementar a API backend Node.js/Express para o MVP Estimator, seguindo a arquitetura definida no `ADR-BACKEND.md`.

## Fase 1: Setup da Infraestrutura e Ambiente (Foundation)
- [x] Inicialização do projeto Node.js com TypeScript.
- [x] Configuração do Vite (`vite-node`) para o ambiente de desenvolvimento (HMR).
- [x] Configuração de Linters (ESLint) e Formatadores (Prettier).
- [x] Criação da estrutura de pastas baseada em MVC (`src/routes`, `src/controllers`, `src/services`, etc.).
- [x] Setup inicial do Express com configurações básicas (CORS, body-parser de JSON).

## Fase 2: Core Architecture, Validação & Padronização (Plumbing)
- [ ] Instalação e configuração do **Zod** para validação de esquemas.
- [ ] Implementação de validação de variáveis de ambiente usando Zod no momento da inicialização (Fail-fast).
- [ ] Implementação do Middleware Global de Tratamento de Erros (padronizando respostas de erro e integrando erros do Zod).
- [ ] Criação de helpers utilitários para padronizar respostas de Sucesso.
- [ ] Implementação de um logger simples para a aplicação.

## Fase 3: Integração de Serviços Base (AI Layer)
- [ ] Criação da camada de `Services` abstrata para integração com IA.
- [ ] Implementação de um serviço "Mock" de IA para facilitar o desenvolvimento inicial local.
- [ ] Configuração de timeouts no Express (60s) para requisições de LLM de longa duração.

## Fase 4: Implementação do Domínio (Business Logic)
- [ ] **Models/DTOs:** Definir os esquemas **Zod** para o Request de Ingestão de Ideias e os tipos TypeScript inferidos.
- [ ] **Middlewares:** Criar um middleware genérico de validação de Request utilizando Zod.
- [ ] **Rotas & Controllers:** Criar o endpoint `POST /api/estimates` acoplando a validação Zod.
- [ ] **Services:** Implementar a lógica de orquestração (receber ideia, chamar serviço IA, calcular estimativa).

## Fase 5: Containerização (Deployability)
- [ ] Criação do `Dockerfile` multi-stage otimizado para produção.
- [ ] Criação do `docker-compose.yaml` para ambiente de desenvolvimento local.
- [ ] Validação do build e execução via Docker.

## Fase 6: Testes e Validação (Quality Assurance)
- [ ] Setup do framework de testes (ex: Vitest).
- [ ] Escrita de Testes Unitários para a lógica de cálculo de tokens/horas e validações do Zod.
- [ ] Escrita de Testes de Integração para as rotas da API.
