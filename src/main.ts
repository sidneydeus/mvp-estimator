import { viteNodeApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const port = env.PORT;
viteNodeApp.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port}`);
});
