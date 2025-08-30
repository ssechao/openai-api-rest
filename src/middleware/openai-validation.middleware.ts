import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from './error.middleware';

export const validateOpenAIRequest = (endpoint: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Basic validation for now
    // TODO: Implement proper validation for each endpoint
    
    switch (endpoint) {
      case 'chatCompletion':
        if (!req.body.model || !req.body.messages) {
          return next(new ValidationError('Missing required fields: model and messages'));
        }
        break;
      
      case 'completion':
        if (!req.body.model || !req.body.prompt) {
          return next(new ValidationError('Missing required fields: model and prompt'));
        }
        break;
      
      case 'imageGeneration':
        if (!req.body.prompt) {
          return next(new ValidationError('Missing required field: prompt'));
        }
        break;
      
      case 'embeddings':
        if (!req.body.model || !req.body.input) {
          return next(new ValidationError('Missing required fields: model and input'));
        }
        break;
      
      case 'moderation':
        if (!req.body.input) {
          return next(new ValidationError('Missing required field: input'));
        }
        break;
    }
    
    next();
  };
};