import Joi from 'joi';

export const navigateSchema = Joi.object({
  url: Joi.string().uri().required(),
  waitUntil: Joi.string()
    .valid('load', 'domcontentloaded', 'networkidle0', 'networkidle2')
    .optional(),
  timeout: Joi.number().min(0).max(120000).optional(),
});

export const screenshotSchema = Joi.object({
  url: Joi.string().uri().required(),
  fullPage: Joi.boolean().optional(),
  type: Joi.string().valid('png', 'jpeg', 'webp').optional(),
  quality: Joi.number().min(0).max(100).optional(),
  viewport: Joi.object({
    width: Joi.number().min(1).max(3840).required(),
    height: Joi.number().min(1).max(2160).required(),
  }).optional(),
});

export const extractSchema = Joi.object({
  url: Joi.string().uri().required(),
  selector: Joi.string().required(),
  attribute: Joi.string().optional(),
  multiple: Joi.boolean().optional(),
  waitForSelector: Joi.boolean().optional(),
  timeout: Joi.number().min(0).max(60000).optional(),
});

const actionSchema = Joi.object({
  type: Joi.string()
    .valid('click', 'type', 'select', 'hover', 'scroll', 'wait')
    .required(),
  selector: Joi.string().when('type', {
    is: Joi.valid('click', 'type', 'select', 'hover'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  value: Joi.alternatives()
    .try(Joi.string(), Joi.number())
    .when('type', {
      is: Joi.valid('type', 'select'),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  options: Joi.object().optional(),
});

export const interactSchema = Joi.object({
  url: Joi.string().uri().required(),
  actions: Joi.array().items(actionSchema).min(1).required(),
  screenshot: Joi.boolean().optional(),
});