# Diagramas UML — MVP Estimator

> Diagramas gerados com auxílio de IA (Claude) a partir do código real em `src/` e `frontend/src/`. Notação Mermaid (renderizável diretamente no GitHub).

---

## 1. Diagrama de Sequência — Fluxo de geração de estimativa

Mostra o caminho completo de uma requisição: do formulário no frontend até a resposta do LLM e o retorno ao usuário.

```mermaid
sequenceDiagram
    actor U as Usuário
    participant F as Frontend (EstimatorPage)
    participant API as Backend (Express)
    participant V as validateRequest (Zod)
    participant C as EstimatesController
    participant Fac as aiServiceFactory
    participant G as GroqAIService
    participant LLM as Groq Cloud API

    U->>F: Digita descrição da ideia
    U->>F: Clica "Gerar estimativa"
    F->>API: POST /api/v1/estimates {ideaDescription}
    API->>V: valida payload contra estimateRequestSchema
    alt payload inválido
        V-->>F: HTTP 400 VALIDATION_ERROR
        F-->>U: Exibe ErrorCallout
    else payload válido
        V->>C: req.body validado
        C->>Fac: getAIService()
        Fac-->>C: GroqAIService (cached)
        C->>G: generateBacklog(ideaDescription)
        G->>LLM: POST /openai/v1/chat/completions<br/>{model, temperature:0.2, response_format:json_object, messages}
        Note over G,LLM: AbortController timeout=55s
        alt LLM responde ok
            LLM-->>G: { choices: [{ message: { content: "{...}" } }] }
            G->>G: JSON.parse + groqBacklogSchema.parse
            G->>G: calculateEstimatedHours(totalTokens)
            G-->>C: BacklogResult
            C-->>API: sendSuccess(201, result)
            API-->>F: HTTP 201 { success:true, data:BacklogResult }
            F-->>U: Renderiza EstimateResult + botão exportar
        else LLM timeout
            LLM--xG: AbortError (>55s)
            G-->>C: GROQ_TIMEOUT (504)
            C-->>API: errorHandler
            API-->>F: HTTP 504
            F-->>U: "Tempo excedido. Tente descrição menor."
        else JSON inválido / schema quebrado
            LLM-->>G: content malformado
            G-->>C: GROQ_INVALID_JSON ou GROQ_INVALID_SCHEMA (502)
            C-->>API: errorHandler
            API-->>F: HTTP 502
            F-->>U: ErrorCallout com detalhes
        end
    end
```

---

## 2. Diagrama de Classes — Camada de Serviços de IA

Mostra a aplicação do **Strategy Pattern** via interface `IAIService` e o factory que seleciona a implementação por ambiente.

```mermaid
classDiagram
    class IAIService {
        <<interface>>
        +generateBacklog(ideaDescription: string) Promise~BacklogResult~
    }

    class BacklogResult {
        +vision: string
        +epics: Epic[]
        +totalTokens: number
        +estimatedHours: EstimatedHours
    }

    class Epic {
        +id: string
        +title: string
        +description: string
        +stories: UserStory[]
    }

    class UserStory {
        +id: string
        +title: string
        +description: string
        +acceptanceCriteria: string[]
        +complexityTokens: number
    }

    class EstimatedHours {
        +min: number
        +max: number
    }

    class MockAIService {
        +generateBacklog(idea) Promise~BacklogResult~
    }

    class GroqAIService {
        -calculateEstimatedHours(tokens) EstimatedHours
        -normalizeResult(raw) BacklogResult
        +generateBacklog(idea) Promise~BacklogResult~
    }

    class aiServiceFactory {
        <<module>>
        -cachedService: IAIService
        +getAIService() IAIService
    }

    class EstimatesController {
        +create(req, res, next)$
    }

    IAIService <|.. MockAIService : implements
    IAIService <|.. GroqAIService : implements
    aiServiceFactory ..> IAIService : returns
    aiServiceFactory ..> MockAIService : creates
    aiServiceFactory ..> GroqAIService : creates
    EstimatesController ..> aiServiceFactory : uses
    GroqAIService ..> BacklogResult : produces
    BacklogResult *-- Epic
    Epic *-- UserStory
    BacklogResult *-- EstimatedHours
```

---

## 3. Diagrama de Componentes — Arquitetura geral

Visão de alto nível dos componentes deployáveis.

```mermaid
flowchart LR
    subgraph Browser
        SPA[Frontend SPA<br/>React + Vite]
    end

    subgraph "Container Backend (Node 18+)"
        Express[Express Server<br/>:3000]
        Routes[estimates.routes]
        MW[validateRequest<br/>errorHandler]
        Ctrl[EstimatesController]
        Fac[aiServiceFactory]
        Mock[MockAIService]
        Groq[GroqAIService]
    end

    subgraph "Cloud externa"
        GroqAPI[(Groq API<br/>openai/gpt-oss-20b)]
    end

    SPA -- HTTP/JSON --> Express
    Express --> Routes
    Routes --> MW
    MW --> Ctrl
    Ctrl --> Fac
    Fac -- "NODE_ENV=test OR no key" --> Mock
    Fac -- "GROQ_API_KEY present" --> Groq
    Groq -- HTTPS --> GroqAPI

    classDef external fill:#fde,stroke:#a06
    class GroqAPI external
```

---

## Notas

- Os três diagramas cobrem **comportamento dinâmico** (sequência), **estrutura estática** (classes) e **deploy** (componentes), conforme boas práticas UML 2.x.
- Os nomes de classes e métodos correspondem 1:1 ao código em `src/services/ai/` e `src/controllers/`.
- Renderização: GitHub renderiza Mermaid nativamente em arquivos `.md`. Para edição local, recomendado [Mermaid Live Editor](https://mermaid.live/).

---
*Versão: 1.0.0*
*Geração: IA (Claude) com revisão humana contra código real*
