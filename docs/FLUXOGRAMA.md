# Fluxograma de Funcionamento — MVP Estimator

> Fluxograma do funcionamento do produto, em notação Mermaid (renderizável diretamente no GitHub).

---

## Fluxo Principal — Geração de Estimativa

```mermaid
flowchart TD
    Start([Usuário acessa a aplicação]) --> Form[Preenche formulário<br/>com descrição da ideia]
    Form --> Valid{Descrição<br/>válida?}
    Valid -- Não --> Form
    Valid -- Sim --> Submit[Clica Gerar Estimativa]
    Submit --> Loading[Frontend mostra<br/>'Gerando backlog...']
    Loading --> POST[/POST /api/estimates/]

    POST --> Zod{Zod valida<br/>payload?}
    Zod -- Não --> Err400[HTTP 400<br/>VALIDATION_ERROR]
    Err400 --> ShowErr[Frontend exibe<br/>ErrorCallout]
    Zod -- Sim --> Factory[AIServiceFactory<br/>createAIService]

    Factory --> CheckEnv{NODE_ENV === test<br/>OU AI_PROVIDER === mock?}
    CheckEnv -- Sim --> Mock[Retorna MockAIService]
    CheckEnv -- Não --> OpenAIService[Retorna OpenAIService]

    Mock --> CallLLM
    OpenAIService --> CallLLM[Chama LLM via HTTP<br/>(OpenAI/Groq/etc)]

    CallLLM --> Success{Resposta OK?}
    Success -- Não --> ErrLLM[HTTP 502<br/>AI_PROVIDER_ERROR]
    ErrLLM --> ShowErr
    Success -- Sim --> ParseJSON{JSON.parse<br/>OK?}

    ParseJSON -- Não --> ErrJSON[HTTP 502<br/>AI_INVALID_RESPONSE]
    ErrJSON --> ShowErr
    ParseJSON -- Sim --> SchemaCheck{Zod valida<br/>backlogResultSchema?}

    SchemaCheck -- Não --> ErrSchema[HTTP 502<br/>AI_INVALID_RESPONSE]
    ErrSchema --> ShowErr
    SchemaCheck -- Sim --> Estimate[estimateAICodeGeneration]

    Estimate --> Resp[/HTTP 201<br/>data: BacklogResult/]
    Resp --> Render[Frontend renderiza<br/>EstimateResult]
    Render --> Show[Visão + Épicos + Stories +<br/>Critérios + Estimativa financeira]

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

    class Err400,ErrLLM,ErrJSON,ErrSchema errorNode
    class Resp,Render,Show,Toast successNode
    class CallLLM,ParseJSON,SchemaCheck llmNode
```
