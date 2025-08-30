import { Router } from 'express';
import * as openAIController from '../controllers/openai.controller';
import { validateOpenAIRequest } from '../middleware/openai-validation.middleware';

export const openAIRouter = Router();

// Chat Completions - Main endpoint
openAIRouter.post(
  '/chat/completions',
  validateOpenAIRequest('chatCompletion'),
  openAIController.chatCompletions
);

// Legacy Completions (for compatibility)
openAIRouter.post(
  '/completions',
  validateOpenAIRequest('completion'),
  openAIController.completions
);

// Images
openAIRouter.post(
  '/images/generations',
  validateOpenAIRequest('imageGeneration'),
  openAIController.imagesGenerations
);

openAIRouter.post(
  '/images/edits',
  validateOpenAIRequest('imageEdit'),
  openAIController.imagesEdits
);

openAIRouter.post(
  '/images/variations',
  validateOpenAIRequest('imageVariation'),
  openAIController.imagesVariations
);

// Audio
openAIRouter.post(
  '/audio/transcriptions',
  validateOpenAIRequest('audioTranscription'),
  openAIController.audioTranscriptions
);

openAIRouter.post(
  '/audio/translations',
  validateOpenAIRequest('audioTranslation'),
  openAIController.audioTranslations
);

openAIRouter.post(
  '/audio/speech',
  validateOpenAIRequest('audioSpeech'),
  openAIController.audioSpeech
);

// Embeddings
openAIRouter.post(
  '/embeddings',
  validateOpenAIRequest('embeddings'),
  openAIController.embeddings
);

// Models
openAIRouter.get('/models', openAIController.listModels);
openAIRouter.get('/models/:model', openAIController.retrieveModel);

// Files
openAIRouter.post('/files', openAIController.uploadFile);
openAIRouter.get('/files', openAIController.listFiles);
openAIRouter.get('/files/:file_id', openAIController.retrieveFile);
openAIRouter.delete('/files/:file_id', openAIController.deleteFile);
openAIRouter.get('/files/:file_id/content', openAIController.retrieveFileContent);

// Fine-tuning
openAIRouter.post(
  '/fine_tuning/jobs',
  validateOpenAIRequest('fineTuningJob'),
  openAIController.createFineTuningJob
);
openAIRouter.get('/fine_tuning/jobs', openAIController.listFineTuningJobs);
openAIRouter.get('/fine_tuning/jobs/:fine_tuning_job_id', openAIController.retrieveFineTuningJob);
openAIRouter.post('/fine_tuning/jobs/:fine_tuning_job_id/cancel', openAIController.cancelFineTuningJob);
openAIRouter.get('/fine_tuning/jobs/:fine_tuning_job_id/events', openAIController.listFineTuningEvents);

// Assistants
openAIRouter.post(
  '/assistants',
  validateOpenAIRequest('assistant'),
  openAIController.createAssistant
);
openAIRouter.get('/assistants', openAIController.listAssistants);
openAIRouter.get('/assistants/:assistant_id', openAIController.retrieveAssistant);
openAIRouter.post('/assistants/:assistant_id', openAIController.modifyAssistant);
openAIRouter.delete('/assistants/:assistant_id', openAIController.deleteAssistant);

// Threads
openAIRouter.post('/threads', openAIController.createThread);
openAIRouter.get('/threads/:thread_id', openAIController.retrieveThread);
openAIRouter.post('/threads/:thread_id', openAIController.modifyThread);
openAIRouter.delete('/threads/:thread_id', openAIController.deleteThread);

// Messages
openAIRouter.post(
  '/threads/:thread_id/messages',
  validateOpenAIRequest('message'),
  openAIController.createMessage
);
openAIRouter.get('/threads/:thread_id/messages', openAIController.listMessages);
openAIRouter.get('/threads/:thread_id/messages/:message_id', openAIController.retrieveMessage);
openAIRouter.post('/threads/:thread_id/messages/:message_id', openAIController.modifyMessage);

// Runs
openAIRouter.post(
  '/threads/:thread_id/runs',
  validateOpenAIRequest('run'),
  openAIController.createRun
);
openAIRouter.get('/threads/:thread_id/runs', openAIController.listRuns);
openAIRouter.get('/threads/:thread_id/runs/:run_id', openAIController.retrieveRun);
openAIRouter.post('/threads/:thread_id/runs/:run_id', openAIController.modifyRun);
openAIRouter.post('/threads/:thread_id/runs/:run_id/cancel', openAIController.cancelRun);
openAIRouter.post('/threads/:thread_id/runs/:run_id/submit_tool_outputs', openAIController.submitToolOutputs);

// Moderations
openAIRouter.post(
  '/moderations',
  validateOpenAIRequest('moderation'),
  openAIController.createModeration
);