const Redis = require('redis');
const { logger } = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  static getInstance() {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async connect() {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redisPassword = process.env.REDIS_PASSWORD;

      this.client = Redis.createClient({
        url: redisUrl,
        password: redisPassword,
        socket: {
          connectTimeout: 10000,
          lazyConnect: true,
        },
        retry_strategy: (options) => {
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      this.client.on('error', (error) => {
        logger.error('Redis Client Error:', error);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.warn('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        this.client = null;
        logger.info('Redis Client Disconnected');
      } catch (error) {
        logger.error('Error disconnecting Redis client:', error);
        throw error;
      }
    }
  }

  getClient() {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }
    return this.client;
  }

  isConnectedToRedis() {
    return this.isConnected;
  }

  // Cache methods
  async set(key, value, expireSeconds) {
    const client = this.getClient();
    if (expireSeconds) {
      await client.setEx(key, expireSeconds, value);
    } else {
      await client.set(key, value);
    }
  }

  async get(key) {
    const client = this.getClient();
    return await client.get(key);
  }

  async del(key) {
    const client = this.getClient();
    return await client.del(key);
  }

  async exists(key) {
    const client = this.getClient();
    return await client.exists(key);
  }

  async expire(key, seconds) {
    const client = this.getClient();
    return await client.expire(key, seconds);
  }
}

const redisClient = RedisClient.getInstance();

module.exports = { RedisClient, redisClient };
