# Fluxograma de Funcionamento — MVP Estimator

> Fluxograma do funcionamento do produto, em notação Mermaid (renderizável diretamente no GitHub).

---

## Fluxo Principal — Geração de Estimativa

```mermaid
flowchart TD
    Start([Usuário acessa a aplicação]) --> Form[Preenche formulário<br/>com descrição da ideia<br/>10-2000 caracteres]
    Form --> Valid{Descrição<br/>>= 10 chars?}
    Valid -- Não --> Form
    Valid -- Sim --> Submit[Clica Gerar Estimativa]
    Submit --> Loading[Frontend mostra<br/>'Gerando backlog...']
    Loading --> POST[/POST /api/v1/estimates/]

    POST --> Zod{Zod valida<br/>payload?}
    Zod -- Não --> Err400[HTTP 400<br/>VALIDATION_ERROR]
    Err400 --> ShowErr[Frontend exibe<br/>ErrorCallout]
    Zod -- Sim --> Factory[aiServiceFactory<br/>getAIService]

    Factory --> CheckEnv{NODE_ENV<br/>=== test?}
    CheckEnv -- Sim --> Mock[Retorna MockAIService]
    CheckEnv -- Não --> CheckKey{GROQ_API_KEY<br/>configurada?}
    CheckKey -- Sim --> Groq[Retorna GroqAIService]
    CheckKey -- Não --> Dev{NODE_ENV<br/>=== production?}
    Dev -- Sim --> Err503[HTTP 503<br/>AI_PROVIDER_NOT_CONFIGURED]
    Err503 --> ShowErr
    Dev -- Não --> WarnMock[Log warning +<br/>Retorna MockAIService]

    Mock --> CallLLM
    WarnMock --> CallLLM
    Groq --> CallLLM[Chama LLM<br/>com prompt sistema<br/>+ ideia do usuário]

    CallLLM --> Timeout{Resposta<br/>em 55s?}
    Timeout -- Não --> Err504[HTTP 504<br/>GROQ_TIMEOUT]
    Err504 --> ShowErr
    Timeout -- Sim --> ParseJSON{JSON.parse<br/>OK?}

    ParseJSON -- Não --> Err502a[HTTP 502<br/>GROQ_INVALID_JSON]
    Err502a --> ShowErr
    ParseJSON -- Sim --> SchemaCheck{Zod valida<br/>groqBacklogSchema?}

    SchemaCheck -- Não --> Err502b[HTTP 502<br/>GROQ_INVALID_SCHEMA]
    Err502b --> ShowErr
    SchemaCheck -- Sim --> Normalize[normalizeResult:<br/>soma totalTokens]

    Normalize --> Calc[calculateEstimatedHours<br/>min = max 8, tokens/55<br/>max = max min+2, tokens/32]
    Calc --> Build[Monta BacklogResult]
    Build --> Resp[/HTTP 201<br/>data: BacklogResult/]
    Resp --> Render[Frontend renderiza<br/>EstimateResult]
    Render --> Show[Visão + Épicos + Stories +<br/>Critérios + Estimativa horas]

    Show --> Action{Usuário<br/>exporta?}
    Action -- Sim --> Export[ExportMarkdownButton<br/>copia MD para clipboard]
    Export --> Toast[Feedback 'Copiado!']
    Toast --> End([Fim])
    Action -- Não --> End

    ShowErr --> RetryQ{Usuário<br/>tenta novamente?}
    RetryQ -- Sim --> Form
    RetryQ -- Não --> End

    classDef errorNode fill:#fdd,stroke:#a00,color:#900
    classDef successNode fill:#dfd,stroke:#080,color:#060
    classDef llmNode fill:#fef,stroke:#a0a,color:#606

    class Err400,Err503,Err504,Err502a,Err502b errorNode
    class Resp,Render,Show,Toast successNode
    class CallLLM,ParseJSON,SchemaCheck llmNode
```

---

## Legenda

| Cor | Significado |
|---|---|
| 🟥 Vermelho | Caminho de erro tratado (HTTP 4xx/5xx com código próprio) |
| 🟩 Verde | Caminho feliz (resposta 201) |
| 🟪 Roxo | Interação com o LLM (chamada, parsing, validação) |

## Pontos-chave

1. **Validação em duas camadas:** Zod valida o request (entrada do usuário) e a resposta do LLM. Nenhum dado entra ou sai sem passar por schema.
2. **Determinismo no cálculo:** A IA gera o conteúdo (épicos, stories, complexityTokens). O cálculo final de horas é puramente aritmético — fácil de auditar, fácil de testar.
3. **Failover para Mock:** Em dev sem key e em testes, o `MockAIService` mantém o mesmo contrato. Nenhuma parte do código upstream (controller, frontend) sabe qual implementação está rodando.
4. **Timeout dura 55s:** Cabe dentro do limite de 60s do PRD, deixando margem para serialização da resposta.

---
*Versão: 1.0.0*
