export interface NavigateRequest {
  url: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
}

export interface ScreenshotRequest {
  url: string;
  fullPage?: boolean;
  type?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface ExtractRequest {
  url: string;
  selector: string;
  attribute?: string;
  multiple?: boolean;
  waitForSelector?: boolean;
  timeout?: number;
}

export interface InteractionAction {
  type: 'click' | 'type' | 'select' | 'hover' | 'scroll' | 'wait';
  selector?: string;
  value?: string | number;
  options?: Record<string, any>;
}

export interface InteractRequest {
  url: string;
  actions: InteractionAction[];
  screenshot?: boolean;
}

export interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface BrowserSession {
  id: string;
  browser: any;
  pages: Map<string, any>;
  createdAt: Date;
  lastUsed: Date;
}

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}