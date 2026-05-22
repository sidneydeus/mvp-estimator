# User Stories — MVP Estimator

> Documento de user stories do produto, geradas com auxílio de IA (Claude / Groq `gpt-oss-20b`) a partir do PRD e do Steering Document, seguindo padrão **INVEST** (Independent, Negotiable, Valuable, Estimable, Small, Testable).
>
> O prompt original utilizado para geração está em `docs/PROMPTS.MD` (seção 6 — User Stories).

---

## US-01 — Submeter descrição de ideia e obter backlog estimado

**Como** empreendedor sem background técnico,
**Quero** colar uma descrição em linguagem natural da minha ideia de software num formulário web,
**Para que** eu receba um backlog estruturado (épicos + user stories + critérios de aceitação) com estimativa de horas, sem precisar contratar um Product Manager.

### Critérios de Aceitação
- **CA-01.1** O formulário aceita descrição entre 10 e 2000 caracteres. Abaixo de 10 o botão "Gerar estimativa" permanece desabilitado.
- **CA-01.2** Ao submeter, a UI exibe estado de carregamento explícito ("Gerando backlog…") até a resposta chegar.
- **CA-01.3** A resposta exibida contém: Visão de Produto + ao menos 3 épicos + ao menos 1 user story por épico + estimativa em faixa (mín–máx) de horas.
- **CA-01.4** Se a requisição estourar 60s, a UI mostra mensagem amigável sugerindo descrição menor (HTTP 408 ou `GROQ_TIMEOUT`).
- **CA-01.5** Erros do provedor LLM (4xx/5xx, JSON inválido, schema quebrado) são apresentados como mensagem de erro legível, não como stack trace.

### Mapeamento técnico
- Frontend: `frontend/src/pages/EstimatorPage.tsx`, `IdeaForm.tsx`, `EstimateResult.tsx`, `ErrorCallout.tsx`
- Backend: `POST /api/v1/estimates` → `EstimatesController.create` → `getAIService().generateBacklog(...)`
- Validação: `estimateRequestSchema` (Zod) + `groqBacklogSchema` (Zod)

**Estimativa de complexidade:** 1800 tokens (média)

---

## US-02 — Exportar o backlog gerado em Markdown

**Como** Product Owner,
**Quero** baixar/copiar o backlog gerado em formato Markdown,
**Para que** eu possa colar diretamente no Notion/Jira/Confluence sem reformatação manual.

### Critérios de Aceitação
- **CA-02.1** Botão "Exportar Markdown" aparece somente após geração bem-sucedida.
- **CA-02.2** O Markdown exportado contém: título com a Visão, seções `## Épico N — <título>`, listas de stories com `### Story N.M — <título>` e bullet list de critérios de aceitação.
- **CA-02.3** A estimativa de horas (mín–máx) e o total de tokens aparecem em bloco no topo do Markdown.
- **CA-02.4** Clicar no botão copia o conteúdo para o clipboard e mostra feedback visual ("Copiado!") por ~2s.
- **CA-02.5** O Markdown é válido (renderiza corretamente em parsers CommonMark).

### Mapeamento técnico
- Frontend: `frontend/src/components/ExportMarkdownButton.tsx`, `frontend/src/utils/markdown.ts`

**Estimativa de complexidade:** 1200 tokens (baixa)

---

## US-03 — Operar sem chave de API em ambiente de desenvolvimento/testes

**Como** desenvolvedor do MVP Estimator,
**Quero** rodar a aplicação localmente e os testes automatizados sem precisar de uma `GROQ_API_KEY`,
**Para que** eu possa desenvolver, revisar PRs e rodar CI sem depender de credencial externa nem consumir cotas.

### Critérios de Aceitação
- **CA-03.1** Se `NODE_ENV=test`, o `aiServiceFactory` retorna sempre `MockAIService`, mesmo que `GROQ_API_KEY` esteja definida.
- **CA-03.2** Se `NODE_ENV=development` e `GROQ_API_KEY` estiver ausente, o factory cai em `MockAIService` e loga warning explícito.
- **CA-03.3** Se `NODE_ENV=production` e `GROQ_API_KEY` estiver ausente, a aplicação lança erro `AI_PROVIDER_NOT_CONFIGURED` (HTTP 503).
- **CA-03.4** Testes de integração passam sem variáveis de ambiente externas configuradas.
- **CA-03.5** A resposta do `MockAIService` segue o mesmo contrato `BacklogResult` da `GroqAIService` — frontend e testes não percebem diferença estrutural.

### Mapeamento técnico
- Backend: `src/services/ai/aiServiceFactory.ts`, `src/services/ai/MockAIService.ts`, `src/config/env.ts`
- Testes: `tests/integration/estimates.test.ts`

**Estimativa de complexidade:** 900 tokens (baixa)

---

## Resumo

| ID | Título | Prioridade | Complexidade |
|---|---|---|---|
| US-01 | Submeter ideia e obter backlog estimado | P0 | Alta (1800) |
| US-02 | Exportar backlog em Markdown | P1 | Baixa (1200) |
| US-03 | Operar sem chave de API em dev/test | P0 | Baixa (900) |

**Total:** 3900 tokens → estimativa ~71h–122h (aplicando `min = tokens/55`, `max = tokens/32`).

---
*Versão: 1.0.0*
*Geração: IA (Claude / Groq) com revisão humana*
