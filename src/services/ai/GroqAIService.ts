import { ZodError, z } from 'zod';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import type { BacklogResult, Epic, IAIService, UserStory } from './IAIService';

const groqBacklogSchema = z.object({
  vision: z.string().min(1),
  epics: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        stories: z.array(
          z.object({
            id: z.string().min(1),
            title: z.string().min(1),
            description: z.string().min(1),
            acceptanceCriteria: z.array(z.string().min(1)).min(1),
            complexityTokens: z.number().int().positive(),
          }),
        ).min(1),
      }),
    )
    .min(1),
});

function calculateEstimatedHours(totalTokens: number) {
  const min = Math.max(8, Math.round(totalTokens / 55));
  const max = Math.max(min + 2, Math.round(totalTokens / 32));
  return { min, max };
}

function normalizeResult(raw: z.infer<typeof groqBacklogSchema>): BacklogResult {
  const epics: Epic[] = raw.epics.map((epic) => ({
    ...epic,
    stories: epic.stories.map((story) => ({
      ...story,
      complexityPoints: Math.ceil(story.complexityTokens / 100), // Mapeamento arbitrário para compatibilidade
      estimatedTokens: {
        input: { min: story.complexityTokens * 10, max: story.complexityTokens * 25 },
        output: { min: story.complexityTokens * 5, max: story.complexityTokens * 15 },
      },
    })) as UserStory[],
  }));

  const totalComplexityPoints = epics.reduce(
    (sum, epic) => sum + epic.stories.reduce((s, st) => s + st.complexityPoints, 0),
    0,
  );

  return {
    vision: raw.vision,
    epics,
    totalComplexityPoints,
    estimatedHours: { min: 0, max: 0 }, // Será recalculado ou ignorado
    aiTokenEstimate: {
      planningAndContextTokens: { min: 50000, max: 150000 },
      codeGenerationInputTokens: { min: 0, max: 0 },
      codeGenerationOutputTokens: { min: 0, max: 0 },
      validationAndFixInputTokens: { min: 100000, max: 300000 },
      validationAndFixOutputTokens: { min: 50000, max: 150000 },
    },
    aiCodeGenerationEstimate: {} as any, // Será preenchido pelo chamador se necessário
  };
}

export class GroqAIService implements IAIService {
  async generateBacklog(ideaDescription: string): Promise<BacklogResult> {
    if (!env.GROQ_API_KEY) {
      throw Object.assign(new Error('GROQ_API_KEY is not configured'), {
        status: 503,
        code: 'AI_PROVIDER_NOT_CONFIGURED',
      });
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 55000);

    try {
      logger.info('Solicitando backlog ao Groq...');

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.GROQ_MODEL,
          temperature: 0.2,
          response_format: {
            type: 'json_object',
          },
          messages: [
            {
              role: 'system',
              content:
                'You are a senior product analyst and technical architect. Analyze the software idea and return only valid JSON. Write all content in Brazilian Portuguese. The JSON must have exactly this shape: { "vision": string, "epics": [{ "id": string, "title": string, "description": string, "stories": [{ "id": string, "title": string, "description": string, "acceptanceCriteria": [string], "complexityTokens": number }] }] }. Create 3 to 5 epics, each with at least 1 user story. Each story must have 2 to 5 acceptance criteria and a positive integer complexityTokens value that reflects relative implementation effort.',
            },
            {
              role: 'user',
              content: `Software idea:\n${ideaDescription}`,
            },
          ],
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw Object.assign(new Error(`Groq API error: ${response.status} ${response.statusText}`), {
          status: response.status,
          code: 'GROQ_API_ERROR',
          details: errorText,
        });
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        throw Object.assign(new Error('Groq returned an empty response'), {
          status: 502,
          code: 'GROQ_EMPTY_RESPONSE',
        });
      }

      const parsed = groqBacklogSchema.parse(JSON.parse(content));
      return normalizeResult(parsed);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw Object.assign(new Error('The Groq request timed out'), {
          status: 504,
          code: 'GROQ_TIMEOUT',
        });
      }

      if (error instanceof SyntaxError) {
        throw Object.assign(new Error('Groq returned invalid JSON'), {
          status: 502,
          code: 'GROQ_INVALID_JSON',
        });
      }

      if (error instanceof ZodError) {
        throw Object.assign(new Error('Groq returned data with an invalid structure'), {
          status: 502,
          code: 'GROQ_INVALID_SCHEMA',
          details: error.issues,
        });
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
