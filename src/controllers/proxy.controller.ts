import type { Request, Response, NextFunction } from 'express';
import { BrowserService } from '../services/browser.service';
import { AppError } from '../middleware/error.middleware';
import type { NavigateRequest, ScreenshotRequest, ExtractRequest, InteractRequest } from '../types';
import { logger } from '../utils/logger';

const browserService = BrowserService.getInstance();

export const navigate = async (
  req: Request<{}, {}, NavigateRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url, waitUntil = 'networkidle2', timeout = 30000 } = req.body;
    
    const sessionId = await browserService.createSession();
    const page = await browserService.getOrCreatePage(sessionId);
    
    await page.goto(url, {
      waitUntil,
      timeout,
    });
    
    const title = await page.title();
    const currentUrl = page.url();
    
    res.json({
      success: true,
      data: {
        sessionId,
        title,
        url: currentUrl,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Navigation error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Navigation failed',
      500
    ));
  }
};

export const screenshot = async (
  req: Request<{}, {}, ScreenshotRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      url,
      fullPage = false,
      type = 'png',
      quality,
      viewport,
    } = req.body;
    
    const sessionId = await browserService.createSession();
    const page = await browserService.getOrCreatePage(sessionId);
    
    if (viewport) {
      await page.setViewport(viewport);
    }
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    const screenshotOptions: any = {
      fullPage,
      type,
    };
    
    if (type === 'jpeg' && quality) {
      screenshotOptions.quality = quality;
    }
    
    const buffer = await page.screenshot(screenshotOptions);
    
    await browserService.closeSession(sessionId);
    
    res.set('Content-Type', `image/${type}`);
    res.send(buffer);
  } catch (error) {
    logger.error('Screenshot error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Screenshot failed',
      500
    ));
  }
};

export const extract = async (
  req: Request<{}, {}, ExtractRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      url,
      selector,
      attribute,
      multiple = false,
      waitForSelector = true,
      timeout = 10000,
    } = req.body;
    
    const sessionId = await browserService.createSession();
    const page = await browserService.getOrCreatePage(sessionId);
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    if (waitForSelector) {
      await page.waitForSelector(selector, { timeout });
    }
    
    let result;
    
    if (multiple) {
      result = await page.$$eval(selector, (elements, attr) => {
        return elements.map(el => {
          if (attr) {
            return el.getAttribute(attr);
          }
          return el.textContent?.trim() || '';
        });
      }, attribute);
    } else {
      result = await page.$eval(selector, (element, attr) => {
        if (attr) {
          return element.getAttribute(attr);
        }
        return element.textContent?.trim() || '';
      }, attribute);
    }
    
    await browserService.closeSession(sessionId);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Extract error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Data extraction failed',
      500
    ));
  }
};

export const interact = async (
  req: Request<{}, {}, InteractRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url, actions, screenshot = false } = req.body;
    
    const sessionId = await browserService.createSession();
    const page = await browserService.getOrCreatePage(sessionId);
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    const results = [];
    
    for (const action of actions) {
      let actionResult: any = { type: action.type, success: true };
      
      try {
        switch (action.type) {
          case 'click':
            if (action.selector) {
              await page.click(action.selector, action.options);
              actionResult.message = `Clicked on ${action.selector}`;
            }
            break;
            
          case 'type':
            if (action.selector && action.value) {
              await page.type(action.selector, String(action.value), action.options);
              actionResult.message = `Typed into ${action.selector}`;
            }
            break;
            
          case 'select':
            if (action.selector && action.value) {
              await page.select(action.selector, String(action.value));
              actionResult.message = `Selected ${action.value} in ${action.selector}`;
            }
            break;
            
          case 'hover':
            if (action.selector) {
              await page.hover(action.selector);
              actionResult.message = `Hovered over ${action.selector}`;
            }
            break;
            
          case 'scroll':
            await page.evaluate((scrollOptions) => {
              window.scrollTo(scrollOptions);
            }, action.options || { top: 100, behavior: 'smooth' });
            actionResult.message = 'Scrolled page';
            break;
            
          case 'wait':
            const waitTime = action.value ? Number(action.value) : 1000;
            await page.waitForTimeout(waitTime);
            actionResult.message = `Waited for ${waitTime}ms`;
            break;
            
          default:
            actionResult.success = false;
            actionResult.message = `Unknown action type: ${action.type}`;
        }
      } catch (error) {
        actionResult.success = false;
        actionResult.error = error instanceof Error ? error.message : 'Action failed';
      }
      
      results.push(actionResult);
    }
    
    let screenshotData = null;
    if (screenshot) {
      const buffer = await page.screenshot({ fullPage: false });
      screenshotData = buffer.toString('base64');
    }
    
    await browserService.closeSession(sessionId);
    
    res.json({
      success: true,
      data: {
        actions: results,
        screenshot: screenshotData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Interact error:', error);
    next(new AppError(
      error instanceof Error ? error.message : 'Interaction failed',
      500
    ));
  }
};