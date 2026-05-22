PROMPTS
1.Como um Arquiteto de Soluções IA Sênior, gere um arquivo steering.md em /docs para
o projeto MVP Estimator.

Contexto:
O sistema transforma ideias de software descritas pelo usuário em projeto estruturado
de forma que seja possível ao final ter uma estimativa de tempo e custos baseado na
quantidade de tokens necessários de acordo com o 'backlog' e 'user stories' gerados.

Definição:
A documentação e arquivos markdown gerados devem estar em PT-BR
A versão é controlada por git usando conventional commits.

=================================================================================================

2.Como um especialista sênior em planejamento de MVPs web, gere um arquivo PRD.md em /docs para
o projeto MVP Estimator considerando /docs/steering.md

Seu objetivo é transformar ideias vagas em PRDs claros, implementáveis e economicamente viáveis.

O PRD deve servir como base para:

- arquitetura do sistema
- geração de backlog
- estimativa de custos
- definição de MVP
- planejamento de desenvolvimento

Priorize:

- simplicidade
- rapidez de validação
- menor custo operacional
- escopo reduzido
- implementação incremental

Evite:

- overengineering
- arquitetura enterprise
- features desnecessárias
- escalabilidade prematura

O PRD deve:

- definir apenas o MVP inicial
- remover funcionalidades não essenciais
- separar backlog futuro

Preferências técnicas:

- monólito modular
- REST APIs

Evitar:

- Microsserviços
- Kubernetes
- mensageria distribuída
- priorizar funcionalidades core

Toda funcionalidade deve:

- ser implementável
- ser objetiva
- possuir propósito claro
- evitar ambiguidades
- possuir prioridade definida

Utilize:

- Markdown
- títulos hierárquicos
- tabelas
- listas organizadas
- linguagem técnica objetiva

validar coerência entre:

- objetivos
- funcionalidades
- arquitetura
- integrações
- complexidade

Antes de finalizar o PRD, valide:

- funcionalidades redundantes
- inconsistências
- escopo excessivo
- integrações desnecessárias
- conflitos arquiteturais

=================================================================================================

Você é um arquiteto sênior de software especializado em arquitetura backend para MVPs web, Node.js e documentação arquitetural baseada em ADR (Architecture Decision Record).

Sua tarefa é gerar um ADR técnico e profissional para definir a arquitetura backend de um sistema web considerando o docs/PRD.md

Salvar em doc/ADR-BACKEND.md

A decisão arquitetural deve definir:

Backend:
- Node.js
- Express.js

Arquitetura:
- padrão MVC
- princípios SOLID
- Clean Code
- separação clara de responsabilidades
- modularização por domínio

Infraestrutura:
- execução obrigatória via Docker
- ambiente containerizado
- facilidade de deploy local e produção

Comunicação:
- APIs REST
- payloads JSON estruturados
- padronização de respostas
- padronização de erros
- estrutura consistente de requests/responses

Ferramentas:
- Vite para gerenciamento do ambiente e pacotes
- npm como gerenciador padrão
- configuração simples e de rápida inicialização

Restrições importantes:
- o sistema NÃO possui autenticação inicialmente
- evitar overengineering
- evitar microsserviços
- evitar arquitetura enterprise
- evitar abstrações desnecessárias
- priorizar simplicidade operacional
- priorizar facilidade de manutenção
- priorizar onboarding rápido de desenvolvedores

O ADR deve justificar tecnicamente:
- escolha do Node.js
- escolha do Express
- adoção do padrão MVC
- adoção de SOLID
- adoção de Clean Code
- uso de Docker
- uso de APIs REST com JSON estruturado
- escolha do Vite
- impactos em produtividade
- impactos em manutenção
- impactos em escalabilidade futura
- impactos em testes e debugging

O documento deve também:
- comparar alternativas rejeitadas
- explicar trade-offs
- analisar consequências positivas e negativas
- analisar riscos arquiteturais
- considerar contexto de MVP

Estruture o ADR EXATAMENTE nas seguintes seções:

# ADR-XXX — Arquitetura Backend Node.js com Express

Status:
Data:

# Contexto

# Objetivos Arquiteturais

# Decisão

# Estrutura Arquitetural

# Organização de Diretórios

# Estratégia de Comunicação JSON

# Estratégia de Containerização

# Justificativa Técnica

# Alternativas Consideradas

## Alternativa 1
### Motivos da rejeição

## Alternativa 2
### Motivos da rejeição

# Consequências

## Positivas

## Negativas

# Impacto Operacional

# Impacto na Escalabilidade

# Impacto na Manutenção

# Impacto no Desenvolvimento

# Riscos

# Recomendações Futuras

# Nível de Confiança

Regras obrigatórias:
- utilizar Markdown
- linguagem técnica objetiva
- evitar textos genéricos
- justificar cada decisão arquitetural
- evitar buzzwords desnecessárias
- considerar contexto de MVP
- considerar simplicidade operacional
- considerar maturidade do ecossistema Node.js
- considerar facilidade de evolução futura

O documento deve parecer um ADR profissional utilizado em um projeto real de engenharia de software.


=================================================================================================

Faça um ADR-FRONTEND.md, incluindo:
- Desenvolvimento do frontend dessa aplicação, 
- Utilizando Reactpara consumir a API do backend em node

=================================================================================================

Crie um diretório chamado frontend e desenvolva conforme o ADR-FRONTEND.MD

=================================================================================================

Implemente uma funcionalidade de Agente de IA integrada ao backend existente utilizando a API da Groq com a variável de ambiente GROQ_API_KEY. A funcionalidade deve receber um texto do usuário, enviar para a API da Groq e retornar a resposta exatamente no padrão de formatação já utilizado pelo backend. Use o mockup como referência visual e estrutural.
