import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const requiredEnvVars = ['CEREBRAS_API_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable ${envVar}`);
    process.exit(1);
  }
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-bot',
  cerebrasApiKey: process.env.CEREBRAS_API_KEY || '',
  cerebrasModel: process.env.CEREBRAS_MODEL || 'llama-3.3-70b',
  wppSessionName: process.env.WPP_SESSION_NAME || 'socialbuzzz18-bot',
  logLevel: process.env.LOG_LEVEL || 'info',
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
  tokenDir: process.env.TOKEN_DIR || path.join(process.cwd(), 'tokens'),
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '',
  ownerPhoneNumber: process.env.OWNER_PHONE_NUMBER || '919900239806',
  meetingLink: process.env.MEETING_LINK || 'https://meet.google.com/socialbuzzz-consult',
};
