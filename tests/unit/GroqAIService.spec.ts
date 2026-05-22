import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 3000,
    GROQ_API_KEY: 'test-key',
    GROQ_MODEL: 'openai/gpt-oss-20b',
  },
}));

import { GroqAIService } from '../../src/services/ai/GroqAIService';
import { env } from '../../src/config/env';

function makeFetchResponse(body: unknown, init: { ok?: boolean; status?: number; statusText?: string } = {}) {
  const ok = init.ok ?? true;
  const status = init.status ?? 200;
  return {
    ok,
    status,
    statusText: init.statusText ?? (ok ? 'OK' : 'Error'),
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response;
}

function makeGroqChoice(content: string) {
  return { choices: [{ message: { content } }] };
}

const validBacklog = {
  vision: 'Visão clara do produto',
  epics: [
    {
      id: 'epic-1',
      title: 'Onboarding',
      description: 'Cadastro e primeiros passos',
      stories: [
        {
          id: 'story-1',
          title: 'Cadastrar usuário',
          description: 'Permitir cadastro com email',
          acceptanceCriteria: ['Validar email', 'Persistir conta'],
          complexityTokens: 1500,
        },
      ],
    },
    {
      id: 'epic-2',
      title: 'Core',
      description: 'Funcionalidade central',
      stories: [
        {
          id: 'story-2',
          title: 'Gerar estimativa',
          description: 'Calcular orçamento',
          acceptanceCriteria: ['Retornar mín e máx', 'Validar input'],
          complexityTokens: 2200,
        },
      ],
    },
  ],
};

describe('GroqAIService', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('retorna BacklogResult válido com totalTokens somado e horas calculadas', async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse(makeGroqChoice(JSON.stringify(validBacklog))));

    const service = new GroqAIService();
    const result = await service.generateBacklog('App de delivery para pets');

    expect(result.vision).toBe('Visão clara do produto');
    expect(result.epics).toHaveLength(2);
    expect(result.totalTokens).toBe(1500 + 2200);
    expect(result.estimatedHours.min).toBeGreaterThanOrEqual(8);
    expect(result.estimatedHours.max).toBeGreaterThan(result.estimatedHours.min);
  });

  it('lança AI_PROVIDER_NOT_CONFIGURED quando GROQ_API_KEY está ausente', async () => {
    const originalKey = env.GROQ_API_KEY;
    (env as { GROQ_API_KEY?: string }).GROQ_API_KEY = undefined;

    const service = new GroqAIService();
    await expect(service.generateBacklog('Qualquer ideia válida'))
      .rejects.toMatchObject({ code: 'AI_PROVIDER_NOT_CONFIGURED', status: 503 });

    (env as { GROQ_API_KEY?: string }).GROQ_API_KEY = originalKey;
  });

  it('mapeia erro HTTP do provedor para GROQ_API_ERROR com status original', async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse('quota exceeded', { ok: false, status: 429, statusText: 'Too Many Requests' }));

    const service = new GroqAIService();
    await expect(service.generateBacklog('App de delivery para pets'))
      .rejects.toMatchObject({ code: 'GROQ_API_ERROR', status: 429 });
  });

  it('mapeia resposta vazia do LLM para GROQ_EMPTY_RESPONSE 502', async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse({ choices: [{ message: { content: null } }] }));

    const service = new GroqAIService();
    await expect(service.generateBacklog('App de delivery para pets'))
      .rejects.toMatchObject({ code: 'GROQ_EMPTY_RESPONSE', status: 502 });
  });

  it('mapeia JSON sintaticamente inválido para GROQ_INVALID_JSON 502', async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse(makeGroqChoice('isto não é json {{{')));

    const service = new GroqAIService();
    await expect(service.generateBacklog('App de delivery para pets'))
      .rejects.toMatchObject({ code: 'GROQ_INVALID_JSON', status: 502 });
  });

  it('mapeia JSON com schema quebrado para GROQ_INVALID_SCHEMA 502', async () => {
    const malformed = { vision: '', epics: [] };
    fetchSpy.mockResolvedValue(makeFetchResponse(makeGroqChoice(JSON.stringify(malformed))));

    const service = new GroqAIService();
    await expect(service.generateBacklog('App de delivery para pets'))
      .rejects.toMatchObject({ code: 'GROQ_INVALID_SCHEMA', status: 502 });
  });

  it('mapeia AbortError (timeout) para GROQ_TIMEOUT 504', async () => {
    const abortErr = new Error('aborted');
    abortErr.name = 'AbortError';
    fetchSpy.mockRejectedValue(abortErr);

    const service = new GroqAIService();
    await expect(service.generateBacklog('App de delivery para pets'))
      .rejects.toMatchObject({ code: 'GROQ_TIMEOUT', status: 504 });
  });
});
