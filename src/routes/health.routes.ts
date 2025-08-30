import { Router } from 'express';
import type { Request, Response } from 'express';
import { BrowserService } from '../services/browser.service';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
  };

  res.status(200).json(health);
});

healthRouter.get('/ready', async (_req: Request, res: Response) => {
  try {
    const browserService = BrowserService.getInstance();
    const isReady = await browserService.healthCheck();

    if (isReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        message: 'Browser service is not ready',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});