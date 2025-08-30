import type { Request, Response, NextFunction } from 'express';
import { OpenAIProxyService } from '../services/openai-proxy.service';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  CompletionRequest,
  ImageGenerationRequest,
  AudioTranscriptionRequest,
  EmbeddingRequest,
  ModerationRequest
} from '../types/openai.types';

const openAIProxy = OpenAIProxyService.getInstance();

// ============= Chat Completions =============
export const chatCompletions = async (
  req: Request<{}, {}, ChatCompletionRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { stream = false } = req.body;
    
    if (stream) {
      // SSE streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const streamResponse = await openAIProxy.streamChatCompletion(req.body);
      
      for await (const chunk of streamResponse) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const response = await openAIProxy.createChatCompletion(req.body);
      res.json(response);
    }
  } catch (error) {
    logger.error('Chat completion error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Chat completion failed',
      500
    ));
  }
};

// ============= Legacy Completions =============
export const completions = async (
  req: Request<{}, {}, CompletionRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await openAIProxy.createCompletion(req.body);
    res.json(response);
  } catch (error) {
    logger.error('Completion error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Completion failed',
      500
    ));
  }
};

// ============= Images =============
export const imagesGenerations = async (
  req: Request<{}, {}, ImageGenerationRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await openAIProxy.generateImage(req.body);
    res.json(response);
  } catch (error) {
    logger.error('Image generation error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Image generation failed',
      500
    ));
  }
};

export const imagesEdits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await openAIProxy.editImage(req.body, (req as any).files);
    res.json(response);
  } catch (error) {
    logger.error('Image edit error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Image edit failed',
      500
    ));
  }
};

export const imagesVariations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await openAIProxy.createImageVariation(req.body, (req as any).files);
    res.json(response);
  } catch (error) {
    logger.error('Image variation error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Image variation failed',
      500
    ));
  }
};

// ============= Audio =============
export const audioTranscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await openAIProxy.transcribeAudio(req.body, (req as any).files);
    res.json(response);
  } catch (error) {
    logger.error('Audio transcription error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Audio transcription failed',
      500
    ));
  }
};

export const audioTranslations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await openAIProxy.translateAudio(req.body, (req as any).files);
    res.json(response);
  } catch (error) {
    logger.error('Audio translation error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Audio translation failed',
      500
    ));
  }
};

export const audioSpeech = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const audioBuffer = await openAIProxy.createSpeech(req.body);
    const format = req.body.response_format || 'mp3';
    
    res.setHeader('Content-Type', `audio/${format}`);
    res.send(audioBuffer);
  } catch (error) {
    logger.error('Audio speech error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Audio speech generation failed',
      500
    ));
  }
};

// ============= Embeddings =============
export const embeddings = async (
  req: Request<{}, {}, EmbeddingRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await openAIProxy.createEmbedding(req.body);
    res.json(response);
  } catch (error) {
    logger.error('Embedding error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Embedding creation failed',
      500
    ));
  }
};

// ============= Models =============
export const listModels = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const models = await openAIProxy.listModels();
    res.json(models);
  } catch (error) {
    logger.error('List models error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to list models',
      500
    ));
  }
};

export const retrieveModel = async (
  req: Request<{ model: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const model = await openAIProxy.retrieveModel(req.params.model);
    res.json(model);
  } catch (error) {
    logger.error('Retrieve model error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to retrieve model',
      404
    ));
  }
};

// ============= Files =============
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = await openAIProxy.uploadFile(req.body, (req as any).files);
    res.json(file);
  } catch (error) {
    logger.error('File upload error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'File upload failed',
      500
    ));
  }
};

export const listFiles = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = await openAIProxy.listFiles();
    res.json(files);
  } catch (error) {
    logger.error('List files error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to list files',
      500
    ));
  }
};

export const retrieveFile = async (
  req: Request<{ file_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = await openAIProxy.retrieveFile(req.params.file_id);
    res.json(file);
  } catch (error) {
    logger.error('Retrieve file error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to retrieve file',
      404
    ));
  }
};

export const deleteFile = async (
  req: Request<{ file_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await openAIProxy.deleteFile(req.params.file_id);
    res.json(result);
  } catch (error) {
    logger.error('Delete file error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to delete file',
      500
    ));
  }
};

export const retrieveFileContent = async (
  req: Request<{ file_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const content = await openAIProxy.retrieveFileContent(req.params.file_id);
    res.send(content);
  } catch (error) {
    logger.error('Retrieve file content error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to retrieve file content',
      404
    ));
  }
};

// ============= Fine-tuning =============
export const createFineTuningJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await openAIProxy.createFineTuningJob(req.body);
    res.json(job);
  } catch (error) {
    logger.error('Create fine-tuning job error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to create fine-tuning job',
      500
    ));
  }
};

export const listFineTuningJobs = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobs = await openAIProxy.listFineTuningJobs();
    res.json(jobs);
  } catch (error) {
    logger.error('List fine-tuning jobs error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to list fine-tuning jobs',
      500
    ));
  }
};

export const retrieveFineTuningJob = async (
  req: Request<{ fine_tuning_job_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await openAIProxy.retrieveFineTuningJob(req.params.fine_tuning_job_id);
    res.json(job);
  } catch (error) {
    logger.error('Retrieve fine-tuning job error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to retrieve fine-tuning job',
      404
    ));
  }
};

export const cancelFineTuningJob = async (
  req: Request<{ fine_tuning_job_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await openAIProxy.cancelFineTuningJob(req.params.fine_tuning_job_id);
    res.json(result);
  } catch (error) {
    logger.error('Cancel fine-tuning job error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to cancel fine-tuning job',
      500
    ));
  }
};

export const listFineTuningEvents = async (
  req: Request<{ fine_tuning_job_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const events = await openAIProxy.listFineTuningEvents(req.params.fine_tuning_job_id);
    res.json(events);
  } catch (error) {
    logger.error('List fine-tuning events error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to list fine-tuning events',
      500
    ));
  }
};

// ============= Assistants =============
export const createAssistant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assistant = await openAIProxy.createAssistant(req.body);
    res.json(assistant);
  } catch (error) {
    logger.error('Create assistant error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to create assistant',
      500
    ));
  }
};

export const listAssistants = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assistants = await openAIProxy.listAssistants();
    res.json(assistants);
  } catch (error) {
    logger.error('List assistants error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to list assistants',
      500
    ));
  }
};

export const retrieveAssistant = async (
  req: Request<{ assistant_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const assistant = await openAIProxy.retrieveAssistant(req.params.assistant_id);
    res.json(assistant);
  } catch (error) {
    logger.error('Retrieve assistant error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to retrieve assistant',
      404
    ));
  }
};

export const modifyAssistant = async (
  req: Request<{ assistant_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const assistant = await openAIProxy.modifyAssistant(req.params.assistant_id, req.body);
    res.json(assistant);
  } catch (error) {
    logger.error('Modify assistant error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to modify assistant',
      500
    ));
  }
};

export const deleteAssistant = async (
  req: Request<{ assistant_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await openAIProxy.deleteAssistant(req.params.assistant_id);
    res.json(result);
  } catch (error) {
    logger.error('Delete assistant error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to delete assistant',
      500
    ));
  }
};

// ============= Threads =============
export const createThread = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const thread = await openAIProxy.createThread(req.body);
    res.json(thread);
  } catch (error) {
    logger.error('Create thread error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to create thread',
      500
    ));
  }
};

export const retrieveThread = async (
  req: Request<{ thread_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const thread = await openAIProxy.retrieveThread(req.params.thread_id);
    res.json(thread);
  } catch (error) {
    logger.error('Retrieve thread error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to retrieve thread',
      404
    ));
  }
};

export const modifyThread = async (
  req: Request<{ thread_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const thread = await openAIProxy.modifyThread(req.params.thread_id, req.body);
    res.json(thread);
  } catch (error) {
    logger.error('Modify thread error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to modify thread',
      500
    ));
  }
};

export const deleteThread = async (
  req: Request<{ thread_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await openAIProxy.deleteThread(req.params.thread_id);
    res.json(result);
  } catch (error) {
    logger.error('Delete thread error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to delete thread',
      500
    ));
  }
};

// ============= Messages =============
export const createMessage = async (
  req: Request<{ thread_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const message = await openAIProxy.createMessage(req.params.thread_id, req.body);
    res.json(message);
  } catch (error) {
    logger.error('Create message error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to create message',
      500
    ));
  }
};

export const listMessages = async (
  req: Request<{ thread_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const messages = await openAIProxy.listMessages(req.params.thread_id);
    res.json(messages);
  } catch (error) {
    logger.error('List messages error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to list messages',
      500
    ));
  }
};

export const retrieveMessage = async (
  req: Request<{ thread_id: string; message_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const message = await openAIProxy.retrieveMessage(req.params.thread_id, req.params.message_id);
    res.json(message);
  } catch (error) {
    logger.error('Retrieve message error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to retrieve message',
      404
    ));
  }
};

export const modifyMessage = async (
  req: Request<{ thread_id: string; message_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const message = await openAIProxy.modifyMessage(
      req.params.thread_id,
      req.params.message_id,
      req.body
    );
    res.json(message);
  } catch (error) {
    logger.error('Modify message error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to modify message',
      500
    ));
  }
};

// ============= Runs =============
export const createRun = async (
  req: Request<{ thread_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const run = await openAIProxy.createRun(req.params.thread_id, req.body);
    res.json(run);
  } catch (error) {
    logger.error('Create run error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to create run',
      500
    ));
  }
};

export const listRuns = async (
  req: Request<{ thread_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const runs = await openAIProxy.listRuns(req.params.thread_id);
    res.json(runs);
  } catch (error) {
    logger.error('List runs error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to list runs',
      500
    ));
  }
};

export const retrieveRun = async (
  req: Request<{ thread_id: string; run_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const run = await openAIProxy.retrieveRun(req.params.thread_id, req.params.run_id);
    res.json(run);
  } catch (error) {
    logger.error('Retrieve run error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to retrieve run',
      404
    ));
  }
};

export const modifyRun = async (
  req: Request<{ thread_id: string; run_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const run = await openAIProxy.modifyRun(
      req.params.thread_id,
      req.params.run_id,
      req.body
    );
    res.json(run);
  } catch (error) {
    logger.error('Modify run error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to modify run',
      500
    ));
  }
};

export const cancelRun = async (
  req: Request<{ thread_id: string; run_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await openAIProxy.cancelRun(req.params.thread_id, req.params.run_id);
    res.json(result);
  } catch (error) {
    logger.error('Cancel run error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to cancel run',
      500
    ));
  }
};

export const submitToolOutputs = async (
  req: Request<{ thread_id: string; run_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const run = await openAIProxy.submitToolOutputs(
      req.params.thread_id,
      req.params.run_id,
      req.body
    );
    res.json(run);
  } catch (error) {
    logger.error('Submit tool outputs error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to submit tool outputs',
      500
    ));
  }
};

// ============= Moderations =============
export const createModeration = async (
  req: Request<{}, {}, ModerationRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const moderation = await openAIProxy.createModeration(req.body);
    res.json(moderation);
  } catch (error) {
    logger.error('Create moderation error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Failed to create moderation',
      500
    ));
  }
};