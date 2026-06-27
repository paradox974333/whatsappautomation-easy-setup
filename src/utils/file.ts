import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * Ensures that a target directory exists, creating it recursively if necessary.
 * @param dirPath Absolute path of the directory
 */
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Directory created successfully: ${dirPath}`);
    } catch (error) {
      logger.error(`Failed to create directory at ${dirPath}:`, error);
      throw error;
    }
  }
};

/**
 * Generates a safe, unique filename prefixed with a timestamp.
 * @param originalName The original user file name
 * @param mimeType The file's MIME type to derive fallback extension
 */
export const generateUniqueFileName = (originalName?: string, mimeType?: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  if (originalName) {
    // Replace non-alphanumeric characters except dots/hyphens
    const cleanName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `${timestamp}_${randomSuffix}_${cleanName}`;
  }

  const fileExtension = mimeType ? mimeType.split('/')[1]?.split(';')[0] || '' : 'bin';
  const cleanExtension = fileExtension === 'jpeg' ? 'jpg' : fileExtension;
  return `${timestamp}_${randomSuffix}_media.${cleanExtension}`;
};
