import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { MockAIService } from './MockAIService';
import { GroqAIService } from './GroqAIService';
import type { IAIService } from './IAIService';

let cachedService: IAIService | null = null;

export function getAIService(): IAIService {
  if (cachedService) {
    return cachedService;
  }

  if (env.NODE_ENV === 'test') {
    cachedService = new MockAIService();
    return cachedService;
  }

  if (env.GROQ_API_KEY) {
    cachedService = new GroqAIService();
    return cachedService;
  }

  if (env.NODE_ENV === 'production') {
    throw Object.assign(new Error('GROQ_API_KEY is required in production'), {
      status: 503,
      code: 'AI_PROVIDER_NOT_CONFIGURED',
    });
  }

  logger.warn('GROQ_API_KEY não configurada. Usando MockAIService em desenvolvimento/testes.');
  cachedService = new MockAIService();
  return cachedService;
}

