import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logging.middleware';
import { rateLimiter } from './middleware/rate-limit.middleware';
import { healthRouter } from './routes/health.routes';
import { openAIRouter } from './routes/openai.routes';
import { BrowserService } from './services/browser.service';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));
app.use(compression());
app.use(express.json({ limit: process.env.BODY_SIZE_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_SIZE_LIMIT || '10mb' }));

app.use(requestLogger);
app.use(rateLimiter);

// OpenAI-compatible API endpoints (v1)
app.use('/v1', openAIRouter);

// Root endpoint (like OpenAI)
app.get('/', (_req, res) => {
  res.json({
    message: 'OpenAI API Proxy',
    documentation: 'https://platform.openai.com/docs/api-reference',
    version: 'v1',
    endpoints: {
      chat: '/v1/chat/completions',
      models: '/v1/models',
      embeddings: '/v1/embeddings',
      images: '/v1/images/generations',
      audio: '/v1/audio/transcriptions'
    }
  });
});

// Health check endpoint (not part of OpenAI API, but useful for monitoring)
app.use('/health', healthRouter);

app.use(errorHandler);

const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, starting graceful shutdown...');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });

  try {
    await BrowserService.getInstance().cleanup();
    logger.info('Browser service cleaned up');
  } catch (error) {
    logger.error('Error during browser cleanup:', error);
  }

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

server.listen(portNumber, HOST, () => {
  logger.info(`Server is running on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`OpenAI-compatible API endpoints available at /v1`);
});