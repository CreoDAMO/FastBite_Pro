
import mongoose from 'mongoose';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

// MongoDB connection
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastbite-pro');
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

// PostgreSQL connection
export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/fastbite_pro',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const connectPostgreSQL = async () => {
  try {
    await pgPool.connect();
    logger.info('Connected to PostgreSQL');
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
};

// Redis connection
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const connectRedis = async () => {
  try {
    await redis.ping();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
};

// Initialize all database connections
export const connectDatabase = async () => {
  await Promise.all([
    connectMongoDB(),
    connectPostgreSQL(),
    connectRedis()
  ]);
};
