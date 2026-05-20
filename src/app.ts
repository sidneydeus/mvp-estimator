import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { sendSuccess } from './utils/response';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok' });
});

// Middleware de Erro Global (sempre ao final)
app.use(errorHandler);

export const viteNodeApp = app;
