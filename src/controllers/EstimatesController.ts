import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { logger } from '../utils/logger';
import { getAIService } from '../services/ai/aiServiceFactory';

export class EstimatesController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { ideaDescription } = req.body;

      logger.info('Recebida nova solicitação de estimativa');

      const aiService = getAIService();
      const result = await aiService.generateBacklog(ideaDescription);

      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
