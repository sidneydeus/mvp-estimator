# Diagrama de Classes — MVP Estimator

> Representa a estrutura estática do sistema: classes, interfaces, atributos, métodos e relacionamentos. Baseado 1:1 no código em `src/` e `frontend/src/`.

---

## Diagrama

```mermaid
%%{init: {"theme": "dark", "themeVariables": {"primaryColor": "#7c3aed", "primaryTextColor": "#fff", "primaryBorderColor": "#a78bfa", "lineColor": "#a78bfa", "secondaryColor": "#0d1526"}}}%%
classDiagram
    direction TB

    %% ── Interfaces e contratos ──────────────────────────────────────
    class IAIService {
        <<interface>>
        +generateBacklog(ideaDescription: string) Promise~BacklogResult~
    }

    %% ── Modelos de domínio ──────────────────────────────────────────
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

    class EstimateRequest {
        <<Zod Schema>>
        +ideaDescription: string
        +validate(body: unknown) EstimateRequest
    }

    %% ── Serviços de IA ──────────────────────────────────────────────
    class GroqAIService {
        -GROQ_API_URL: string
        -calculateEstimatedHours(totalTokens: number) EstimatedHours
        -normalizeResult(raw: RawGroqResponse) BacklogResult
        +generateBacklog(ideaDescription: string) Promise~BacklogResult~
    }

    class MockAIService {
        -MOCK_DELAY_MS: number
        +generateBacklog(ideaDescription: string) Promise~BacklogResult~
    }

    class aiServiceFactory {
        <<module>>
        -cachedService: IAIService
        +getAIService() IAIService
    }

    %% ── Camada HTTP (Backend) ───────────────────────────────────────
    class EstimatesController {
        <<static>>
        +create(req: Request, res: Response, next: NextFunction) void$
    }

    class validateRequest {
        <<middleware>>
        +validateRequest(schema: ZodSchema) RequestHandler
    }

    class errorHandler {
        <<middleware>>
        +errorHandler(err, req, res, next) void
    }

    class ResponseHelper {
        <<module>>
        +sendSuccess(res: Response, data: T, status?: number) void
        +sendError(res: Response, code: string, message: string, status: number) void
    }

    class Logger {
        <<module>>
        +info(message: string) void
        +warn(message: string) void
        +error(message: string) void
    }

    class EnvConfig {
        <<module>>
        +PORT: number
        +NODE_ENV: string
        +GROQ_API_KEY: string
        +GROQ_MODEL: string
    }

    %% ── Camada HTTP (Frontend) ──────────────────────────────────────
    class HttpClient {
        <<module>>
        +postJson(url: string, body: unknown, opts?: Options) Promise~T~
    }

    class HttpError {
        +status: number
        +code: string
        +details: unknown
        +constructor(message, status, code?, details?)
    }

    class EstimatesApi {
        <<module>>
        +createEstimate(ideaDescription: string) Promise~ApiResponse~BacklogResult~~
    }

    %% ── Componentes React ───────────────────────────────────────────
    class EstimatorPage {
        <<React Component>>
        -idea: string
        -loading: boolean
        -result: BacklogResult
        -error: ErrorState
        +onSubmit() void
        +onClear() void
        +render() JSX
    }

    class IdeaForm {
        <<React Component>>
        +value: string
        +onChange: Function
        +disabled: boolean
        +maxLength: number
        +render() JSX
    }

    class EstimateResult {
        <<React Component>>
        +result: BacklogResult
        +render() JSX
    }

    class ExportMarkdownButton {
        <<React Component>>
        -copyState: idle | success | error
        +result: BacklogResult
        +handleCopy() void
        +handleDownload() void
        +render() JSX
    }

    class ErrorCallout {
        <<React Component>>
        +title: string
        +children: ReactNode
        +render() JSX
    }

    class LoadingSkeleton {
        <<React Component>>
        +render() JSX
    }

    class MarkdownUtils {
        <<module>>
        +backlogToMarkdown(result: BacklogResult) string
        -storyToMd(story: UserStory) string
        -epicToMd(epic: Epic) string
        -escapeMd(text: string) string
    }

    %% ── Relacionamentos ─────────────────────────────────────────────

    %% Strategy Pattern
    IAIService <|.. GroqAIService : implements
    IAIService <|.. MockAIService : implements

    %% Factory
    aiServiceFactory ..> IAIService : returns
    aiServiceFactory ..> GroqAIService : creates
    aiServiceFactory ..> MockAIService : creates

    %% Controller → Factory → Service
    EstimatesController ..> aiServiceFactory : uses
    EstimatesController ..> ResponseHelper : uses
    EstimatesController ..> Logger : uses

    %% Middleware
    validateRequest ..> EstimateRequest : validates with
    errorHandler ..> ResponseHelper : uses

    %% Service → Domain
    GroqAIService ..> BacklogResult : produces
    MockAIService ..> BacklogResult : produces

    %% Domain composition
    BacklogResult *-- Epic : contains
    BacklogResult *-- EstimatedHours : contains
    Epic *-- UserStory : contains

    %% Frontend API layer
    EstimatesApi ..> HttpClient : uses
    EstimatesApi ..> BacklogResult : returns
    HttpClient ..> HttpError : throws

    %% Frontend components
    EstimatorPage ..> EstimatesApi : calls
    EstimatorPage *-- IdeaForm : renders
    EstimatorPage *-- EstimateResult : renders
    EstimatorPage *-- ErrorCallout : renders
    EstimatorPage *-- LoadingSkeleton : renders
    EstimateResult *-- ExportMarkdownButton : renders
    ExportMarkdownButton ..> MarkdownUtils : uses
    EstimatorPage ..> BacklogResult : holds state
```

---

## Legenda de Relacionamentos

| Notação | Significado |
|---|---|
| `<\|..` | Implementação de interface |
| `*--` | Composição (parte pertence ao todo) |
| `..>` | Dependência (usa, chama, cria) |

## Padrões de Design Identificados

- **Strategy** — `IAIService` com `GroqAIService` e `MockAIService` como estratégias intercambiáveis
- **Factory** — `aiServiceFactory` seleciona a implementação por ambiente
- **Middleware Chain** — `validateRequest` → `EstimatesController` → `errorHandler`
- **Module Pattern** — `ResponseHelper`, `Logger`, `EnvConfig`, `MarkdownUtils` como módulos utilitários sem estado

---

*Versão: 1.1.0*
*Baseado no código real em `src/` e `frontend/src/`*
