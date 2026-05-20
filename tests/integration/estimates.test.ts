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
    const payload = { ideaDescription: 'Quero criar um app de entrega de comida para pets.' };
    const response = await request(viteNodeApp)
      .post('/api/estimates')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.vision).toBeDefined();
    expect(response.body.data.epics.length).toBeGreaterThan(0);
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
