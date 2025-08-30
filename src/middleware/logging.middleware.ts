import type { Request, Response, NextFunction } from 'express';
import { requestLogger } from '../utils/logger';

export const requestLogging = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip, headers } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    requestLogger.info('Request processed', {
      method,
      url,
      statusCode,
      duration,
      ip: ip || req.socket.remoteAddress,
      userAgent: headers['user-agent'],
      referer: headers.referer || headers.referrer,
    });
  });

  next();
};

export { requestLogging as requestLogger };