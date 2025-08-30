import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { logger } from '../utils/logger';
import type { BrowserSession } from '../types';

puppeteer.use(StealthPlugin());

export class BrowserService {
  private static instance: BrowserService;
  private sessions: Map<string, BrowserSession> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly maxSessions: number;
  private readonly sessionTimeout: number;

  private constructor() {
    this.maxSessions = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5', 10);
    this.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT || '300000', 10);
    this.startCleanupInterval();
  }

  public static getInstance(): BrowserService {
    if (!BrowserService.instance) {
      BrowserService.instance = new BrowserService();
    }
    return BrowserService.instance;
  }

  private startCleanupInterval(): void {
    const interval = parseInt(process.env.CLEANUP_INTERVAL || '60000', 10);
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleSessions();
    }, interval);
  }

  private async cleanupStaleSessions(): Promise<void> {
    const now = Date.now();
    const staleSessions: string[] = [];

    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastUsed.getTime() > this.sessionTimeout) {
        staleSessions.push(id);
      }
    }

    for (const id of staleSessions) {
      await this.closeSession(id);
      logger.info(`Cleaned up stale session: ${id}`);
    }
  }

  private getLaunchOptions(): PuppeteerLaunchOptions {
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ];

    if (process.env.PUPPETEER_ARGS) {
      args.push(...process.env.PUPPETEER_ARGS.split(','));
    }

    return {
      headless: process.env.PUPPETEER_HEADLESS !== 'false',
      args,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      timeout: parseInt(process.env.PUPPETEER_TIMEOUT || '30000', 10),
    };
  }

  public async createSession(): Promise<string> {
    if (this.sessions.size >= this.maxSessions) {
      throw new Error('Maximum number of concurrent sessions reached');
    }

    const sessionId = this.generateSessionId();
    const browser = await puppeteer.launch(this.getLaunchOptions());
    
    const session: BrowserSession = {
      id: sessionId,
      browser,
      pages: new Map(),
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    this.sessions.set(sessionId, session);
    logger.info(`Created new browser session: ${sessionId}`);
    
    return sessionId;
  }

  public async getOrCreatePage(sessionId: string, pageId: string = 'default'): Promise<Page> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      const newSessionId = await this.createSession();
      return this.getOrCreatePage(newSessionId, pageId);
    }

    session.lastUsed = new Date();

    let page = session.pages.get(pageId);
    if (!page || page.isClosed()) {
      page = await session.browser.newPage();
      session.pages.set(pageId, page);

      if (process.env.PUPPETEER_DEVTOOLS === 'true') {
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
          });
        });
      }
    }

    return page;
  }

  public async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      try {
        await session.browser.close();
      } catch (error) {
        logger.error(`Error closing browser session ${sessionId}:`, error);
      }
      
      this.sessions.delete(sessionId);
      logger.info(`Closed browser session: ${sessionId}`);
    }
  }

  public async cleanup(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    const closePromises: Promise<void>[] = [];
    for (const [id] of this.sessions.entries()) {
      closePromises.push(this.closeSession(id));
    }

    await Promise.all(closePromises);
    logger.info('All browser sessions cleaned up');
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const testSessionId = await this.createSession();
      const page = await this.getOrCreatePage(testSessionId);
      await page.goto('about:blank');
      await this.closeSession(testSessionId);
      return true;
    } catch (error) {
      logger.error('Health check failed:', error);
      return false;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getSessionStats() {
    return {
      active: this.sessions.size,
      max: this.maxSessions,
      sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
        id,
        createdAt: session.createdAt,
        lastUsed: session.lastUsed,
        pages: session.pages.size,
      })),
    };
  }
}