import { Router } from 'express';
import * as proxyController from '../controllers/proxy.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { navigateSchema, screenshotSchema, extractSchema, interactSchema } from '../validators/proxy.validators';

export const proxyRouter = Router();

proxyRouter.post(
  '/navigate',
  validateRequest(navigateSchema),
  proxyController.navigate
);

proxyRouter.post(
  '/screenshot',
  validateRequest(screenshotSchema),
  proxyController.screenshot
);

proxyRouter.post(
  '/extract',
  validateRequest(extractSchema),
  proxyController.extract
);

proxyRouter.post(
  '/interact',
  validateRequest(interactSchema),
  proxyController.interact
);