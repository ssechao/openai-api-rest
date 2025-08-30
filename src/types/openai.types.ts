// OpenAI API Types - Exact reproduction of OpenAI's API structure

// ============= Chat Completions =============
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
  seed?: number;
  response_format?: ResponseFormat;
  tools?: Tool[];
  tool_choice?: string | ToolChoice;
  functions?: Function[]; // Deprecated
  function_call?: string | FunctionCall; // Deprecated
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string | null;
  name?: string;
  function_call?: FunctionCall;
  tool_calls?: ToolCall[];
}

export interface ResponseFormat {
  type: 'text' | 'json_object';
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, any>;
  };
}

export interface ToolChoice {
  type: 'function';
  function: {
    name: string;
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Function {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion' | 'chat.completion.chunk';
  created: number;
  model: string;
  system_fingerprint?: string;
  choices: ChatChoice[];
  usage?: Usage;
}

export interface ChatChoice {
  index: number;
  message?: ChatMessage;
  delta?: Partial<ChatMessage>;
  finish_reason: 'stop' | 'length' | 'function_call' | 'tool_calls' | 'content_filter' | null;
  logprobs?: LogProbs | null;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface LogProbs {
  content: LogProbContent[] | null;
}

export interface LogProbContent {
  token: string;
  logprob: number;
  bytes: number[] | null;
  top_logprobs: TopLogProb[];
}

export interface TopLogProb {
  token: string;
  logprob: number;
  bytes: number[] | null;
}

// ============= Completions (Legacy) =============
export interface CompletionRequest {
  model: string;
  prompt: string | string[] | number[] | number[][];
  suffix?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  logprobs?: number;
  echo?: boolean;
  stop?: string | string[];
  presence_penalty?: number;
  frequency_penalty?: number;
  best_of?: number;
  logit_bias?: Record<string, number>;
  user?: string;
}

export interface CompletionResponse {
  id: string;
  object: 'text_completion';
  created: number;
  model: string;
  choices: CompletionChoice[];
  usage: Usage;
}

export interface CompletionChoice {
  text: string;
  index: number;
  logprobs: LogProbs | null;
  finish_reason: 'stop' | 'length' | 'content_filter' | null;
}

// ============= Images =============
export interface ImageGenerationRequest {
  prompt: string;
  model?: 'dall-e-2' | 'dall-e-3';
  n?: number;
  quality?: 'standard' | 'hd';
  response_format?: 'url' | 'b64_json';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  user?: string;
}

export interface ImageEditRequest {
  image: string; // File
  prompt: string;
  mask?: string; // File
  model?: 'dall-e-2';
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

export interface ImageVariationRequest {
  image: string; // File
  model?: 'dall-e-2';
  n?: number;
  response_format?: 'url' | 'b64_json';
  size?: '256x256' | '512x512' | '1024x1024';
  user?: string;
}

export interface ImageResponse {
  created: number;
  data: ImageData[];
}

export interface ImageData {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

// ============= Audio =============
export interface AudioTranscriptionRequest {
  file: any; // File
  model: 'whisper-1';
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
  timestamp_granularities?: ('word' | 'segment')[];
}

export interface AudioTranslationRequest {
  file: any; // File
  model: 'whisper-1';
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

export interface AudioSpeechRequest {
  model: 'tts-1' | 'tts-1-hd';
  input: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  speed?: number;
}

export interface AudioTranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  words?: Word[];
  segments?: Segment[];
}

export interface Word {
  word: string;
  start: number;
  end: number;
}

export interface Segment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

// ============= Embeddings =============
export interface EmbeddingRequest {
  input: string | string[] | number[] | number[][];
  model: string;
  encoding_format?: 'float' | 'base64';
  dimensions?: number;
  user?: string;
}

export interface EmbeddingResponse {
  object: 'list';
  data: EmbeddingData[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingData {
  object: 'embedding';
  index: number;
  embedding: number[] | string;
}

// ============= Models =============
export interface Model {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
  permission?: ModelPermission[];
  root?: string;
  parent?: string;
}

export interface ModelPermission {
  id: string;
  object: 'model_permission';
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group: string | null;
  is_blocking: boolean;
}

export interface ModelListResponse {
  object: 'list';
  data: Model[];
}

// ============= Files =============
export interface FileObject {
  id: string;
  object: 'file';
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
  status?: 'uploaded' | 'processed' | 'error';
  status_details?: string | null;
}

export interface FileListResponse {
  object: 'list';
  data: FileObject[];
}

// ============= Fine-tuning =============
export interface FineTuningJob {
  id: string;
  object: 'fine_tuning.job';
  created_at: number;
  finished_at: number | null;
  model: string;
  fine_tuned_model: string | null;
  organization_id: string;
  status: 'validating_files' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  hyperparameters: {
    n_epochs?: number | 'auto';
    batch_size?: number | 'auto';
    learning_rate_multiplier?: number | 'auto';
  };
  training_file: string;
  validation_file: string | null;
  result_files: string[];
  trained_tokens: number | null;
  error: {
    code: string;
    message: string;
    param: string | null;
  } | null;
  user_provided_suffix?: string | null;
  seed?: number;
}

// ============= Assistants =============
export interface Assistant {
  id: string;
  object: 'assistant';
  created_at: number;
  name: string | null;
  description: string | null;
  model: string;
  instructions: string | null;
  tools: AssistantTool[];
  file_ids: string[];
  metadata: Record<string, any>;
}

export interface AssistantTool {
  type: 'code_interpreter' | 'retrieval' | 'function';
  function?: {
    name: string;
    description?: string;
    parameters: Record<string, any>;
  };
}

// ============= Threads =============
export interface Thread {
  id: string;
  object: 'thread';
  created_at: number;
  metadata: Record<string, any>;
}

// ============= Messages =============
export interface ThreadMessage {
  id: string;
  object: 'thread.message';
  created_at: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: MessageContent[];
  file_ids: string[];
  assistant_id: string | null;
  run_id: string | null;
  metadata: Record<string, any>;
}

export interface MessageContent {
  type: 'text' | 'image_file';
  text?: {
    value: string;
    annotations: any[];
  };
  image_file?: {
    file_id: string;
  };
}

// ============= Runs =============
export interface Run {
  id: string;
  object: 'thread.run';
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: 'queued' | 'in_progress' | 'requires_action' | 'cancelling' | 'cancelled' | 'failed' | 'completed' | 'expired';
  required_action: {
    type: 'submit_tool_outputs';
    submit_tool_outputs: {
      tool_calls: ToolCall[];
    };
  } | null;
  last_error: {
    code: string;
    message: string;
  } | null;
  expires_at: number;
  started_at: number | null;
  cancelled_at: number | null;
  failed_at: number | null;
  completed_at: number | null;
  model: string;
  instructions: string;
  tools: AssistantTool[];
  file_ids: string[];
  metadata: Record<string, any>;
  usage: Usage | null;
}

// ============= Moderations =============
export interface ModerationRequest {
  input: string | string[];
  model?: 'text-moderation-latest' | 'text-moderation-stable';
}

export interface ModerationResponse {
  id: string;
  model: string;
  results: ModerationResult[];
}

export interface ModerationResult {
  flagged: boolean;
  categories: {
    sexual: boolean;
    hate: boolean;
    harassment: boolean;
    'self-harm': boolean;
    'sexual/minors': boolean;
    'hate/threatening': boolean;
    'violence/graphic': boolean;
    'self-harm/intent': boolean;
    'self-harm/instructions': boolean;
    'harassment/threatening': boolean;
    violence: boolean;
  };
  category_scores: {
    sexual: number;
    hate: number;
    harassment: number;
    'self-harm': number;
    'sexual/minors': number;
    'hate/threatening': number;
    'violence/graphic': number;
    'self-harm/intent': number;
    'self-harm/instructions': number;
    'harassment/threatening': number;
    violence: number;
  };
}

// ============= Error Response =============
export interface OpenAIError {
  error: {
    message: string;
    type: string;
    param?: string | null;
    code?: string | null;
  };
}

// ============= Streaming =============
export interface StreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  system_fingerprint?: string;
  choices: StreamChoice[];
}

export interface StreamChoice {
  index: number;
  delta: Partial<ChatMessage>;
  finish_reason: 'stop' | 'length' | 'function_call' | 'tool_calls' | 'content_filter' | null;
}