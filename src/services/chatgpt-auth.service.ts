import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page } from 'puppeteer';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

puppeteer.use(StealthPlugin());

export interface AuthConfig {
  email?: string;
  password?: string;
  useGoogleAuth: boolean;
  sessionPath?: string;
  headless?: boolean;
}

export class ChatGPTAuthService {
  private static instance: ChatGPTAuthService;
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isAuthenticated: boolean = false;
  private sessionPath: string;
  private authConfig: AuthConfig;

  private constructor() {
    this.sessionPath = path.join(process.cwd(), 'sessions', 'chatgpt');
    this.authConfig = {
      useGoogleAuth: true,
      sessionPath: this.sessionPath,
      headless: process.env.PUPPETEER_HEADLESS !== 'false'
    };
  }

  public static getInstance(): ChatGPTAuthService {
    if (!ChatGPTAuthService.instance) {
      ChatGPTAuthService.instance = new ChatGPTAuthService();
    }
    return ChatGPTAuthService.instance;
  }

  /**
   * Initialize browser with session persistence
   */
  private async initBrowser(headless: boolean = true): Promise<void> {
    try {
      // Create session directory if it doesn't exist
      await fs.mkdir(this.sessionPath, { recursive: true });

      this.browser = await puppeteer.launch({
        headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          `--user-data-dir=${this.sessionPath}`,
          '--profile-directory=Default'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });

      this.page = await this.browser.newPage();
      
      // Set viewport and user agent
      await this.page.setViewport({ width: 1280, height: 800 });
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Additional stealth configurations
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      logger.info('Browser initialized for ChatGPT authentication');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  /**
   * Check if already authenticated by looking for session cookies
   */
  private async checkExistingSession(): Promise<boolean> {
    try {
      if (!this.page) return false;

      await this.page.goto('https://chat.openai.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait a bit for redirects
      await new Promise(resolve => setTimeout(resolve, 3000));

      const url = this.page.url();
      
      // Check if we're on the chat page (authenticated) or login page
      if (url.includes('chat.openai.com/chat') || url.includes('chat.openai.com/c/')) {
        logger.info('Existing session found, already authenticated');
        return true;
      }

      // Check for the new chat button or user menu
      const isLoggedIn = await this.page.evaluate(() => {
        const newChatButton = document.querySelector('[data-testid="new-chat-button"]');
        const userMenu = document.querySelector('[data-testid="profile-button"]');
        return !!(newChatButton || userMenu);
      });

      return isLoggedIn;
    } catch (error) {
      logger.error('Error checking existing session:', error);
      return false;
    }
  }

  /**
   * Perform Google OAuth authentication
   */
  private async authenticateWithGoogle(): Promise<boolean> {
    try {
      if (!this.page) throw new Error('Browser not initialized');

      logger.info('Starting Google OAuth authentication flow');

      // Go to ChatGPT login page
      await this.page.goto('https://chat.openai.com/auth/login', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Click on "Continue with Google" button
      const googleButton = await this.page.waitForSelector(
        'button[data-provider="google"], [data-testid="google-login-button"], button:has-text("Continue with Google")',
        { timeout: 10000 }
      );

      if (!googleButton) {
        throw new Error('Google login button not found');
      }

      // Click and wait for popup
      const [popup] = await Promise.all([
        new Promise<Page>(resolve => {
          this.browser?.once('targetcreated', async target => {
            const page = await target.page();
            if (page) resolve(page);
          });
        }),
        googleButton.click()
      ]);

      logger.info('Google OAuth popup opened');

      // Handle Google OAuth in popup
      if (popup) {
        await this.handleGoogleOAuthPopup(popup);
      }

      // Wait for redirect back to ChatGPT
      await this.page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Verify authentication
      const authenticated = await this.checkExistingSession();
      
      if (authenticated) {
        logger.info('Successfully authenticated with Google OAuth');
        await this.saveCookies();
      }

      return authenticated;
    } catch (error) {
      logger.error('Google OAuth authentication failed:', error);
      return false;
    }
  }

  /**
   * Handle Google OAuth popup flow
   */
  private async handleGoogleOAuthPopup(popup: Page): Promise<void> {
    try {
      await popup.waitForNavigation({ waitUntil: 'networkidle2' });

      // Check if email input is present
      const emailInput = await popup.$('input[type="email"]');
      
      if (emailInput && this.authConfig.email) {
        logger.info('Entering email in Google OAuth');
        await emailInput.type(this.authConfig.email, { delay: 100 });
        
        // Click Next button
        await popup.click('#identifierNext, button:has-text("Next")');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Check if password input is present
      const passwordInput = await popup.$('input[type="password"]');
      
      if (passwordInput && this.authConfig.password) {
        logger.info('Entering password in Google OAuth');
        await passwordInput.type(this.authConfig.password, { delay: 100 });
        
        // Click Next button
        await popup.click('#passwordNext, button:has-text("Next")');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Handle 2FA if needed
      const otpInput = await popup.$('input[type="tel"], input[aria-label*="code"]');
      if (otpInput) {
        logger.warn('2FA required - manual intervention needed');
        // In headless:false mode, user can enter 2FA code manually
        // Wait for user to complete 2FA
        await popup.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 120000 // 2 minutes for 2FA
        });
      }

      // Wait for OAuth consent/redirect
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      logger.error('Error in Google OAuth popup:', error);
      throw error;
    }
  }

  /**
   * Save cookies to file for session persistence
   */
  private async saveCookies(): Promise<void> {
    try {
      if (!this.page) return;

      const cookies = await this.page.cookies();
      const cookiesPath = path.join(this.sessionPath, 'cookies.json');
      
      await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
      logger.info('Session cookies saved');
    } catch (error) {
      logger.error('Failed to save cookies:', error);
    }
  }

  /**
   * Load cookies from file
   */
  private async loadCookies(): Promise<boolean> {
    try {
      const cookiesPath = path.join(this.sessionPath, 'cookies.json');
      
      try {
        await fs.access(cookiesPath);
      } catch {
        return false; // File doesn't exist
      }

      const cookiesData = await fs.readFile(cookiesPath, 'utf-8');
      const cookies = JSON.parse(cookiesData);

      if (!this.page) return false;

      await this.page.setCookie(...cookies);
      logger.info('Session cookies loaded');
      return true;
    } catch (error) {
      logger.error('Failed to load cookies:', error);
      return false;
    }
  }

  /**
   * Main authentication method
   */
  public async authenticate(config?: Partial<AuthConfig>): Promise<boolean> {
    try {
      // Merge config
      if (config) {
        this.authConfig = { ...this.authConfig, ...config };
      }

      // Initialize browser
      await this.initBrowser(this.authConfig.headless);

      // Try to load existing cookies
      const cookiesLoaded = await this.loadCookies();
      
      if (cookiesLoaded) {
        // Check if cookies are still valid
        const sessionValid = await this.checkExistingSession();
        if (sessionValid) {
          this.isAuthenticated = true;
          return true;
        }
      }

      // If no valid session, perform authentication
      if (this.authConfig.useGoogleAuth) {
        this.isAuthenticated = await this.authenticateWithGoogle();
      } else {
        // Implement standard email/password login if needed
        logger.error('Standard email/password login not implemented yet');
        this.isAuthenticated = false;
      }

      return this.isAuthenticated;
    } catch (error) {
      logger.error('Authentication failed:', error);
      return false;
    }
  }

  /**
   * Interactive authentication (headless: false)
   */
  public async authenticateInteractive(): Promise<boolean> {
    logger.info('Starting interactive authentication - browser will open');
    logger.info('Please complete the login process in the browser');
    
    return this.authenticate({
      headless: false
    });
  }

  /**
   * Get authenticated page instance
   */
  public getPage(): Page | null {
    if (!this.isAuthenticated) {
      logger.warn('Not authenticated. Call authenticate() first');
      return null;
    }
    return this.page;
  }

  /**
   * Get browser instance
   */
  public getBrowser(): Browser | null {
    return this.browser;
  }

  /**
   * Check authentication status
   */
  public isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Logout and clear session
   */
  public async logout(): Promise<void> {
    try {
      if (this.page) {
        await this.page.goto('https://chat.openai.com/auth/logout');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Clear cookies file
      const cookiesPath = path.join(this.sessionPath, 'cookies.json');
      try {
        await fs.unlink(cookiesPath);
      } catch {}

      this.isAuthenticated = false;
      logger.info('Logged out successfully');
    } catch (error) {
      logger.error('Logout failed:', error);
    }
  }

  /**
   * Close browser
   */
  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}