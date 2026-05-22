import { z } from 'zod';
import { AICodeGenerationPricing, BacklogResult, IAIService } from './IAIService';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { estimateAICodeGeneration } from './AICodeGenerationEstimator';

const backlogResultSchema = z.object({
  vision: z.string(),
  epics: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      stories: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          acceptanceCriteria: z.array(z.string()),
          complexityPoints: z.number().int().min(1).max(13),
        }),
      ),
    }),
  ),
  totalComplexityPoints: z.number(),
  estimatedHours: z.object({
    min: z.number(),
    max: z.number(),
  }),
  aiTokenEstimate: z.object({
    planningAndContextTokens: tokenRangeSchema(),
    codeGenerationInputTokens: tokenRangeSchema(),
    codeGenerationOutputTokens: tokenRangeSchema(),
    validationAndFixInputTokens: tokenRangeSchema(),
    validationAndFixOutputTokens: tokenRangeSchema(),
  }),
});

const openAIChatResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable(),
      }),
    }),
  ),
});

const openAIErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
  }),
});

const genericProviderErrorSchema = z.object({
  error: z.string(),
  code: z.string().nullable().optional(),
});

function tokenRangeSchema() {
  return z
    .object({
      min: z.number().int().min(0),
      max: z.number().int().min(0),
    })
    .refine((range) => range.max >= range.min, {
      message: 'max deve ser maior ou igual a min',
    });
}

export class OpenAIService implements IAIService {
  async generateBacklog(
    ideaDescription: string,
    pricing?: AICodeGenerationPricing,
  ): Promise<BacklogResult> {
    if (!env.AI_API_KEY) {
      throw Object.assign(new Error('AI_API_KEY não configurada'), {
        status: 500,
        code: 'AI_CONFIGURATION_ERROR',
      });
    }

    logger.info(`Gerando backlog via LLM (${env.AI_MODEL})...`);

    const response = await fetch(this.chatCompletionsUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista sênior em planejamento de MVPs. Responda somente com JSON válido no formato solicitado.',
          },
          {
            role: 'user',
            content: this.buildPrompt(ideaDescription),
          },
        ],
      }),
    });

    if (!response.ok) {
      const providerError = await this.parseProviderError(response);
      logger.error(`Erro do provedor LLM (${response.status}): ${providerError.logMessage}`);

      throw Object.assign(new Error(providerError.clientMessage), {
        status: 502,
        code: 'AI_PROVIDER_ERROR',
      });
    }

    const payload = openAIChatResponseSchema.parse(await response.json());
    const content = payload.choices[0]?.message.content;

    if (!content) {
      throw Object.assign(new Error('A LLM retornou uma resposta vazia'), {
        status: 502,
        code: 'AI_EMPTY_RESPONSE',
      });
    }

    try {
      const backlog = backlogResultSchema.parse(JSON.parse(content));

      return {
        ...backlog,
        aiCodeGenerationEstimate: estimateAICodeGeneration(backlog, pricing),
      };
    } catch (error) {
      logger.error('Resposta da LLM não respeitou o contrato esperado', error);
      throw Object.assign(new Error('Resposta inválida recebida da LLM'), {
        status: 502,
        code: 'AI_INVALID_RESPONSE',
      });
    }
  }

  private buildPrompt(ideaDescription: string): string {
    return `
Gere um backlog inicial para estimar o desenvolvimento de um MVP a partir da ideia abaixo.

Ideia:
${ideaDescription}

Responda exclusivamente com um JSON neste formato:
{
  "vision": "string",
  "epics": [
    {
      "id": "epic-1",
      "title": "string",
      "description": "string",
      "stories": [
        {
          "id": "story-1",
          "title": "string",
          "description": "string",
          "acceptanceCriteria": ["string"],
          "complexityPoints": 5
        }
      ]
    }
  ],
  "totalComplexityPoints": 5,
  "estimatedHours": {
    "min": 40,
    "max": 80
  },
  "aiTokenEstimate": {
    "planningAndContextTokens": { "min": 10000, "max": 25000 },
    "codeGenerationInputTokens": { "min": 250000, "max": 700000 },
    "codeGenerationOutputTokens": { "min": 90000, "max": 260000 },
    "validationAndFixInputTokens": { "min": 80000, "max": 250000 },
    "validationAndFixOutputTokens": { "min": 25000, "max": 100000 }
  }
}

Regras:
- Use PT-BR.
- Crie de 2 a 4 épicos.
- Crie de 1 a 3 histórias por épico.
- Use complexityPoints como pontos funcionais por história, de 1 a 13, onde 1 é trivial, 5 é médio, 8 é complexo e 13 é muito complexo.
- Calcule totalComplexityPoints como a soma dos complexityPoints.
- Estime horas com base na complexidade funcional do MVP.
- Estime aiTokenEstimate para a geração assistida por IA do código do projeto, não para esta chamada de planejamento.
- Separe tokens de entrada e saída: campos terminados em InputTokens são entrada; campos terminados em OutputTokens são saída.
- Considere prompts iterativos com contexto de arquitetura, geração de código, execução de testes, revisão e correções.
- Não calcule totais de tokens nem custo; o backend fará essa soma e aplicará os preços.
`.trim();
  }

  private chatCompletionsUrl(): string {
    return `${env.AI_BASE_URL.replace(/\/$/, '')}/chat/completions`;
  }

  private async parseProviderError(response: Response): Promise<{
    clientMessage: string;
    logMessage: string;
  }> {
    const rawBody = await response.text();
    let errorPayload: unknown = {};

    try {
      errorPayload = JSON.parse(rawBody || '{}');
    } catch {
      errorPayload = {};
    }

    const parsedError = openAIErrorSchema.safeParse(errorPayload);

    if (!parsedError.success) {
      const genericProviderError = genericProviderErrorSchema.safeParse(errorPayload);

      if (genericProviderError.success) {
        return this.providerErrorMessage({
          status: response.status,
          code: genericProviderError.data.code,
          message: genericProviderError.data.error,
        });
      }

      return {
        clientMessage: 'Falha ao consultar a LLM',
        logMessage: rawBody,
      };
    }

    const { code, message, type } = parsedError.data.error;

    return this.providerErrorMessage({ status: response.status, code, message, type });
  }

  private providerErrorMessage({
    status,
    code,
    message,
    type,
  }: {
    status: number;
    code?: string | null;
    message: string;
    type?: string | null;
  }): {
    clientMessage: string;
    logMessage: string;
  } {
    const providerCode = code ?? type;

    if (status === 401) {
      return {
        clientMessage: 'Chave da LLM inválida ou sem permissão',
        logMessage: message,
      };
    }

    if (
      (status === 402 || status === 403 || status === 429) &&
      (providerCode === 'insufficient_quota' ||
        message.toLowerCase().includes('credits') ||
        message.toLowerCase().includes('licenses') ||
        message.toLowerCase().includes('billing'))
    ) {
      return {
        clientMessage: 'Quota da LLM excedida ou billing indisponível para esta chave',
        logMessage: message,
      };
    }

    if (status === 429) {
      return {
        clientMessage: 'Limite de uso da LLM atingido. Tente novamente em instantes',
        logMessage: message,
      };
    }

    return {
      clientMessage: 'Falha ao consultar a LLM',
      logMessage: message,
    };
  }
}
