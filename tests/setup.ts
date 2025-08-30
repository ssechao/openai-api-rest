import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.PUPPETEER_HEADLESS = 'true';

jest.setTimeout(30000);

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});