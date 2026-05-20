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
