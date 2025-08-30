import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import type { ApiError } from '../types';

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error handling request:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const includeDetails = process.env.ERROR_EXPOSE_DETAILS === 'true';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(includeDetails && err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV === 'development' && process.env.ERROR_INCLUDE_STACK === 'true' ? { stack: err.stack } : {}),
    timestamp: new Date().toISOString(),
  });
};

export class AppError extends Error implements ApiError {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}