import { z } from 'zod';

export const estimateRequestSchema = z.object({
  ideaDescription: z
    .string({
      required_error: 'A descrição da ideia é obrigatória',
    })
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'A descrição deve ter no máximo 2000 caracteres'),
});

export type EstimateRequest = z.infer<typeof estimateRequestSchema>;
