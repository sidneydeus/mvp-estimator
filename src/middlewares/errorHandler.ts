import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(`[Error] ${err.message || err}`);

  if (err instanceof ZodError) {
    return sendError(
      res,
      {
        code: 'VALIDATION_ERROR',
        message: 'Dados de entrada inválidos',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      400,
    );
  }

  // Erros operacionais conhecidos podem ser tratados aqui
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Ocorreu um erro inesperado no servidor';

  return sendError(res, { code, message }, status);
};
