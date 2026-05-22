import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { viteNodeApp } from '../../src/app';

describe('Estimates API Integration Tests', () => {
  it('GET /health deve retornar 200 OK', async () => {
    const response = await request(viteNodeApp).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });

  it('POST /api/estimates deve criar uma estimativa com sucesso', async () => {
    const payload = {
      ideaDescription: 'Quero criar um app de entrega de comida para pets.',
      aiPricing: {
        inputCostPer1MTokens: 0.3,
        outputCostPer1MTokens: 2.5,
      },
    };
    const response = await request(viteNodeApp)
      .post('/api/estimates')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.vision).toBeDefined();
    expect(response.body.data.epics.length).toBeGreaterThan(0);
    expect(response.body.data.totalComplexityPoints).toBeGreaterThan(0);
    expect(response.body.data.epics[0].stories[0].complexityPoints).toBeGreaterThan(0);
    expect(response.body.data.aiCodeGenerationEstimate.tokenEstimate.totalTokens.min).toBeGreaterThan(0);
    expect(response.body.data.aiCodeGenerationEstimate.costEstimate.currency).toBe('USD');
    expect(response.body.data.aiCodeGenerationEstimate.costEstimate.inputCostPer1MTokens).toBe(0.3);
    expect(response.body.data.aiCodeGenerationEstimate.costEstimate.outputCostPer1MTokens).toBe(2.5);
    expect(response.body.data.aiCodeGenerationEstimate.costEstimate.min).toBeGreaterThan(0);
    expect(response.body.data.aiCodeGenerationEstimate.costEstimate.display.range).toContain('$');
    expect(response.body.data.aiCodeGenerationEstimate.display.totalTokens).toContain('tokens');
    expect(response.body.data.aiCodeGenerationEstimate.display.estimatedCost).toContain('$');
    expect(response.body.data.aiCodeGenerationEstimate.costEstimate.min).toBe(
      response.body.data.aiCodeGenerationEstimate.costEstimate.max,
    );

    const { aiTokenEstimate, aiCodeGenerationEstimate } = response.body.data;
    expect(aiTokenEstimate.codeGenerationInputTokens.min).toBeGreaterThan(0);
    const avgInput =
      Math.round((aiTokenEstimate.planningAndContextTokens.min + aiTokenEstimate.planningAndContextTokens.max) / 2) +
      Math.round((aiTokenEstimate.codeGenerationInputTokens.min + aiTokenEstimate.codeGenerationInputTokens.max) / 2) +
      Math.round((aiTokenEstimate.validationAndFixInputTokens.min + aiTokenEstimate.validationAndFixInputTokens.max) / 2);
    const avgOutput =
      Math.round((aiTokenEstimate.codeGenerationOutputTokens.min + aiTokenEstimate.codeGenerationOutputTokens.max) / 2) +
      Math.round((aiTokenEstimate.validationAndFixOutputTokens.min + aiTokenEstimate.validationAndFixOutputTokens.max) / 2);

    expect(aiCodeGenerationEstimate.tokenEstimate.totalInputTokens.min).toBe(avgInput);
    expect(aiCodeGenerationEstimate.tokenEstimate.totalOutputTokens.min).toBe(avgOutput);
    expect(aiCodeGenerationEstimate.tokenEstimate.totalInputTokens.min).toBe(
      aiCodeGenerationEstimate.tokenEstimate.totalInputTokens.max,
    );
  });

  it('POST /api/estimates deve retornar 400 para payload inválido', async () => {
    const payload = { ideaDescription: 'Curto' };
    const response = await request(viteNodeApp)
      .post('/api/estimates')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
