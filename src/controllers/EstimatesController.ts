import { Request, Response, NextFunction } from 'express';
import { MockAIService } from '../services/ai/MockAIService';
import { sendSuccess } from '../utils/response';
import { logger } from '../utils/logger';

// No futuro, isso poderia ser injetado via Dependency Injection
const aiService = new MockAIService();

export class EstimatesController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { ideaDescription } = req.body;
      
      logger.info('Recebida nova solicitação de estimativa');
      
      const result = await aiService.generateBacklog(ideaDescription);
      
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
