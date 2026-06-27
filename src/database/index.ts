import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  const options = {
    autoIndex: true,
  };

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
  });

  try {
    logger.info(`Connecting to MongoDB at: ${config.mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    await mongoose.connect(config.mongoUri, options);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
};
