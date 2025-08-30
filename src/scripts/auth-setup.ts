#!/usr/bin/env node

/**
 * Script to setup ChatGPT authentication interactively
 * Run with: npm run auth:setup
 */

import dotenv from 'dotenv';
import { ChatGPTAuthService } from '../services/chatgpt-auth.service';
import readline from 'readline';
import { logger } from '../utils/logger';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
};

async function main() {
  console.log('========================================');
  console.log('  ChatGPT Authentication Setup');
  console.log('========================================\n');

  console.log('This script will help you authenticate with ChatGPT.');
  console.log('Your session will be saved for future use.\n');

  const authService = ChatGPTAuthService.getInstance();

  try {
    // Check if already authenticated
    console.log('Checking for existing session...');
    const existingAuth = await authService.authenticate({
      headless: true
    });

    if (existingAuth) {
      console.log('✅ Already authenticated! Session is valid.');
      const reauth = await question('Do you want to re-authenticate? (y/n): ');
      
      if (reauth.toLowerCase() !== 'y') {
        console.log('Using existing session.');
        process.exit(0);
      }
      
      await authService.logout();
    }

    // Authentication options
    console.log('\nAuthentication Methods:');
    console.log('1. Google OAuth (Interactive browser)');
    console.log('2. Google OAuth (With credentials)');
    console.log('3. Email/Password (Not implemented yet)');
    
    const choice = await question('\nSelect authentication method (1-3): ');

    switch (choice) {
      case '1':
        console.log('\n📌 Interactive Google OAuth Authentication');
        console.log('A browser window will open. Please complete the login process.');
        console.log('This includes:');
        console.log('  1. Clicking "Continue with Google"');
        console.log('  2. Entering your Google credentials');
        console.log('  3. Completing 2FA if required');
        console.log('  4. Granting permissions if asked\n');
        
        await question('Press Enter to open browser...');
        
        const success = await authService.authenticateInteractive();
        
        if (success) {
          console.log('\n✅ Authentication successful!');
          console.log('Session has been saved for future use.');
        } else {
          console.log('\n❌ Authentication failed.');
          console.log('Please try again or check the logs.');
        }
        break;

      case '2':
        console.log('\n📌 Google OAuth with Credentials');
        console.log('⚠️  WARNING: This method may not work if 2FA is enabled.');
        console.log('For better security, use interactive mode (option 1).\n');
        
        const email = await question('Enter your Google email: ');
        const password = await question('Enter your Google password: ');
        
        console.log('\nAuthenticating...');
        
        const credSuccess = await authService.authenticate({
          email,
          password,
          useGoogleAuth: true,
          headless: false // Show browser for 2FA if needed
        });
        
        if (credSuccess) {
          console.log('\n✅ Authentication successful!');
        } else {
          console.log('\n❌ Authentication failed.');
          console.log('Try interactive mode if 2FA is enabled.');
        }
        break;

      case '3':
        console.log('\n❌ Email/Password authentication not implemented yet.');
        console.log('Please use Google OAuth (option 1 or 2).');
        break;

      default:
        console.log('\n❌ Invalid choice.');
    }

  } catch (error) {
    console.error('\n❌ Error during authentication:', error);
    logger.error('Authentication setup failed:', error);
  } finally {
    await authService.close();
    rl.close();
    process.exit(0);
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\nInterrupted. Cleaning up...');
  const authService = ChatGPTAuthService.getInstance();
  await authService.close();
  process.exit(0);
});

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});