# Documento de Viabilidade Técnica: MVP Estimator

## 1. Problema Identificado

Empreendedores, Product Owners e desenvolvedores freelancers enfrentam dificuldade recorrente em transformar uma **ideia vaga de software** em um plano executável com estimativa de custo e tempo defensável. O processo tradicional envolve:

- Várias sessões de discovery e refinamento de backlog (dias a semanas).
- Conhecimento prévio em engenharia de software para quebrar a ideia em épicos/stories.
- Esforço manual para correlacionar complexidade percebida com horas de desenvolvimento.

Resultado: muitos MVPs morrem antes da validação porque o ciclo "ideia → orçamento" é caro e lento.

## 2. Papel da IA no Produto

A IA é o **núcleo funcional do produto**, não um auxílio de desenvolvimento. Sem o LLM, o produto deixa de existir.

Fluxo concreto na aplicação:

1. Usuário envia descrição via `POST /api/v1/estimates` (ou frontend SPA).
2. `EstimatesController` resolve a implementação de `IAIService` pelo `aiServiceFactory` (Groq em produção, Mock em testes).
3. `GroqAIService` chama `https://api.groq.com/openai/v1/chat/completions` com `response_format: json_object` e um system prompt que força o contrato `BacklogResult` (visão → épicos → stories → critérios + `complexityTokens`).
4. A resposta JSON é validada com Zod (`groqBacklogSchema`).
5. `calculateEstimatedHours` deriva a estimativa de horas **deterministicamente** a partir do total de tokens: `min = max(8, tokens/55)`, `max = max(min+2, tokens/32)`.
6. Frontend exibe Visão + Épicos + Stories + Estimativa e permite exportar em Markdown.

**Sem IA não há produto.** A IA não está apenas auxiliando o cálculo — ela é responsável por interpretar a ideia bruta, projetar a arquitetura de produto (épicos/stories) e atribuir a complexidade relativa (`complexityTokens`).

## 3. Justificativa Técnica das Escolhas

| Decisão | Justificativa |
|---|---|
| **Groq Cloud** (`openai/gpt-oss-20b`) | Inferência ultra-rápida (~300–800 tokens/s), free tier suficiente para o MVP, suporta `response_format: json_object` nativo, API compatível com OpenAI (fácil migrar) |
| Saída forçada em **JSON** | Determinismo estrutural — o pipeline downstream depende do contrato `BacklogResult`. Sem isso, parsing manual quebraria com frequência |
| **Validação com Zod** no parser | LLMs podem entregar JSON sintaticamente válido mas estruturalmente inconsistente. Zod transforma essa quebra em erro tratado (`GROQ_INVALID_SCHEMA` → HTTP 502) em vez de exception genérica |
| `temperature: 0.2` | Backlogs precisam ser consistentes, não criativos. Baixa temperatura reduz alucinação estrutural sem perder cobertura |
| Interface `IAIService` (Strategy Pattern) | Permite trocar provedor (Mock ↔ Groq ↔ OpenAI ↔ Ollama) sem tocar em controller ou domínio. Em testes, o factory retorna Mock automaticamente |
| **Timeout 55s** (`AbortController`) | LLMs podem travar; sem timeout o cliente espera indefinidamente. 55s cabe dentro do limite de 60s definido no PRD |
| **Backend stateless** (sem DB no MVP) | Reduz superfície, custo operacional e tempo de entrega. Persistência fica para a fase 2 |
| **Estimativa baseada em tokens** | Proxy mensurável de complexidade; mais defensável que "chute" subjetivo de horas. Divisores 55 e 32 calibrados empiricamente para MVPs medianos |

## 4. Análise Custo / Benefício

| Provedor | Custo por estimativa | Latência típica | Privacidade |
|---|---|---|---|
| **Groq** (`gpt-oss-20b`) — **adotado** | R$ 0 no free tier (limites generosos) | 3–8s | Dados trafegam para Groq |
| OpenAI (`gpt-4o-mini`) | ~US$ 0,002 | 5–15s | Dados trafegam para OpenAI |
| Anthropic (`claude-haiku`) | ~US$ 0,003 | 5–15s | Dados trafegam para Anthropic |
| Ollama local (`qwen2.5:7b`) | R$ 0 (eletricidade + hardware) | 15–60s em CPU | Total — dados nunca saem da máquina |

**Decisão adotada:** Groq. Trade-off: aceitamos enviar a descrição da ideia para um terceiro em troca de latência de cloud com custo zero. Para um cenário com requisitos de privacidade mais restritos, basta implementar `OllamaAIService` (a interface está preparada) e mudar o factory.

## 5. Limitações Conhecidas (com causa)

### Limitações do modelo LLM
- **Alucinação no conteúdo das stories.** Causa: o LLM gera texto plausível mas pode inventar requisitos. *Mitigação:* o cálculo de horas é determinístico em cima dos tokens, não da semântica. A IA não inventa o número de horas — ela inventa o conteúdo cujo tamanho gera o número.
- **JSON malformado ocasional.** Causa: mesmo com `response_format: json_object`, modelos menores podem quebrar o contrato. *Mitigação:* try/catch separado para `SyntaxError` (`GROQ_INVALID_JSON` → HTTP 502) e `ZodError` (`GROQ_INVALID_SCHEMA` → HTTP 502). Erro é devolvido ao cliente sem stack trace.
- **Modelos de classe 20B têm raciocínio limitado.** Causa: o modelo padrão `openai/gpt-oss-20b` pode produzir backlogs rasos para domínios muito complexos. *Mitigação:* env `GROQ_MODEL` permite trocar para modelos maiores.

### Limitações arquiteturais (com causa)
- **Sem persistência.** Causa: escopo reduzido do MVP. Cada chamada é stateless; usuário precisa reexecutar para gerar de novo.
- **Sem autenticação.** Causa: endpoint aberto. Adequado para MVP local/demo, inadequado para produção pública.
- **Sem rate limiting.** Causa: ausência de gateway. Vulnerável a abuso se exposto na internet.
- **Sem cache de respostas.** Causa: cada chamada vai ao LLM. Para ideias idênticas paga-se inferência repetida.
- **Estimador token→horas calibrado empiricamente.** Causa: divisores 55 e 32 derivam de heurística, não de regressão sobre projetos reais. Acurácia depende de calibração futura.

## 6. Escopo Implementado vs. Proposta Futura

### ✅ Implementado nesta entrega
- API REST em Node.js + TypeScript + Express
- Endpoint `POST /api/v1/estimates` com validação Zod (`EstimateRequest`)
- Interface `IAIService` com duas implementações: `MockAIService` (testes) e `GroqAIService` (produção)
- Factory `aiServiceFactory` com seleção automática por env
- Cálculo determinístico de estimativa Token → Horas (`min/max`)
- Frontend SPA em React + Vite consumindo a API, com:
  - Formulário de ideia (`IdeaForm`)
  - Tela de resultado (`EstimateResult`)
  - Botão de exportar Markdown (`ExportMarkdownButton`)
  - Tratamento de erro (`ErrorCallout`)
- Containerização via Docker Compose
- Convenção de commits (Conventional Commits)
- Documentação completa: PRD, Steering, ADR-BACKEND, ADR-FRONTEND, VIABILIDADE, USER-STORIES, UML, FLUXOGRAMA
- Registro de prompts em `docs/PROMPTS.MD`
- Testes automatizados (unit + integration)

### 🔜 Fora do escopo desta entrega (Backlog Futuro)
- Persistência (PostgreSQL/SQLite) para histórico de estimativas
- Autenticação e gestão de usuários
- Cache de respostas LLM por hash da descrição
- Exportação em PDF além de Markdown
- Suporte a múltiplos provedores cloud com fallback (OpenAI/Anthropic/Gemini/Ollama)
- Rate limiting e métricas de observabilidade
- Refinamento iterativo do backlog (chat-loop com a IA)
- Integração com Jira/Trello/Linear
- Calibração estatística do estimador Token → Horas contra projetos reais

## 7. Próximos Passos Concretos

1. **Curto prazo (1 semana):** Adicionar cache em memória keyed por hash SHA-256 da descrição, expirando em 24h. Reduz custo e latência em ideias repetidas.
2. **Curto prazo (1 semana):** Implementar `OllamaAIService` como alternativa local (interface já preparada — basta criar a classe e adicionar branch no factory).
3. **Médio prazo (2–4 semanas):** Persistência em SQLite + endpoint `GET /estimates` para histórico anônimo.
4. **Médio prazo (1 mês):** Autenticação básica (JWT) e endpoint de listagem por usuário.
5. **Longo prazo:** Calibrar `calculateEstimatedHours` com regressão sobre projetos concluídos. Substituir constantes 55/32 por coeficientes derivados de dados.
6. **Longo prazo:** Adicionar etapa de refinamento iterativo — usuário aprova/rejeita stories e o LLM ajusta o backlog.

---
*Versão: 1.0.0*
*Status: Aprovado para entrega do MVP (M1S04 — SCTEC IA para DEVs)*
