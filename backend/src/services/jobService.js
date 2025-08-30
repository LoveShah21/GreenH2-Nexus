const Queue = require('bull');
const { logger } = require('../utils/logger');
const analyticsService = require('./analyticsService');
const optimizationService = require('./optimizationService');

class JobService {
  constructor() {
    this.logger = logger;
    this.queues = {};
    this.initializeQueues();
  }

  /**
   * Initialize Bull queues for different job types
   */
  initializeQueues() {
    // Analytics jobs queue
    this.queues.analytics = new Queue('analytics-jobs', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    // Optimization jobs queue
    this.queues.optimization = new Queue('optimization-jobs', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }
    });

    // Report generation queue
    this.queues.reports = new Queue('report-jobs', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000
        }
      }
    });

    this.setupQueueProcessors();
    this.setupQueueEventHandlers();
  }

  /**
   * Setup job processors for each queue
   */
  setupQueueProcessors() {
    // Analytics jobs processor
    this.queues.analytics.process('geospatial-analysis', async (job) => {
      try {
        this.logger.info(`Processing geospatial analysis job ${job.id}`);
        
        const result = await analyticsService.performGeospatialAnalysis(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`Geospatial analysis job ${job.id} failed:`, error);
        throw error;
      }
    });

    this.queues.analytics.process('demand-forecasting', async (job) => {
      try {
        this.logger.info(`Processing demand forecasting job ${job.id}`);
        
        const result = await analyticsService.performDemandForecasting(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`Demand forecasting job ${job.id} failed:`, error);
        throw error;
      }
    });

    this.queues.analytics.process('cost-optimization', async (job) => {
      try {
        this.logger.info(`Processing cost optimization job ${job.id}`);
        
        const result = await analyticsService.performCostOptimization(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`Cost optimization job ${job.id} failed:`, error);
        throw error;
      }
    });

    this.queues.analytics.process('network-analysis', async (job) => {
      try {
        this.logger.info(`Processing network analysis job ${job.id}`);
        
        const result = await analyticsService.performNetworkAnalysis(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`Network analysis job ${job.id} failed:`, error);
        throw error;
      }
    });

    this.queues.analytics.process('environmental-assessment', async (job) => {
      try {
        this.logger.info(`Processing environmental assessment job ${job.id}`);
        
        const result = await analyticsService.performEnvironmentalAssessment(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`Environmental assessment job ${job.id} failed:`, error);
        throw error;
      }
    });

    // Optimization jobs processor
    this.queues.optimization.process('genetic-optimization', async (job) => {
      try {
        this.logger.info(`Processing genetic optimization job ${job.id}`);
        
        const result = await optimizationService.performGeneticOptimization(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`Genetic optimization job ${job.id} failed:`, error);
        throw error;
      }
    });

    this.queues.optimization.process('mcda-analysis', async (job) => {
      try {
        this.logger.info(`Processing MCDA analysis job ${job.id}`);
        
        const result = await optimizationService.performMultiCriteriaAnalysis(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`MCDA analysis job ${job.id} failed:`, error);
        throw error;
      }
    });

    this.queues.optimization.process('cost-surface-modeling', async (job) => {
      try {
        this.logger.info(`Processing cost surface modeling job ${job.id}`);
        
        const result = await optimizationService.performCostSurfaceModeling(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`Cost surface modeling job ${job.id} failed:`, error);
        throw error;
      }
    });

    this.queues.optimization.process('capacity-planning', async (job) => {
      try {
        this.logger.info(`Processing capacity planning job ${job.id}`);
        
        const result = await optimizationService.performCapacityPlanning(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`Capacity planning job ${job.id} failed:`, error);
        throw error;
      }
    });

    // Report generation processor
    this.queues.reports.process('generate-report', async (job) => {
      try {
        this.logger.info(`Processing report generation job ${job.id}`);
        
        const result = await this.generateReport(job.data);
        
        await job.progress(100);
        return result;
      } catch (error) {
        this.logger.error(`Report generation job ${job.id} failed:`, error);
        throw error;
      }
    });
  }

  /**
   * Setup queue event handlers
   */
  setupQueueEventHandlers() {
    // Analytics queue events
    this.queues.analytics.on('completed', (job, result) => {
      this.logger.info(`Analytics job ${job.id} completed successfully`);
      this.emitJobCompleted('analytics', job, result);
    });

    this.queues.analytics.on('failed', (job, err) => {
      this.logger.error(`Analytics job ${job.id} failed:`, err);
      this.emitJobFailed('analytics', job, err);
    });

    this.queues.analytics.on('progress', (job, progress) => {
      this.logger.info(`Analytics job ${job.id} progress: ${progress}%`);
      this.emitJobProgress('analytics', job, progress);
    });

    // Optimization queue events
    this.queues.optimization.on('completed', (job, result) => {
      this.logger.info(`Optimization job ${job.id} completed successfully`);
      this.emitJobCompleted('optimization', job, result);
    });

    this.queues.optimization.on('failed', (job, err) => {
      this.logger.error(`Optimization job ${job.id} failed:`, err);
      this.emitJobFailed('optimization', job, err);
    });

    this.queues.optimization.on('progress', (job, progress) => {
      this.logger.info(`Optimization job ${job.id} progress: ${progress}%`);
      this.emitJobProgress('optimization', job, progress);
    });

    // Reports queue events
    this.queues.reports.on('completed', (job, result) => {
      this.logger.info(`Report job ${job.id} completed successfully`);
      this.emitJobCompleted('reports', job, result);
    });

    this.queues.reports.on('failed', (job, err) => {
      this.logger.error(`Report job ${job.id} failed:`, err);
      this.emitJobFailed('reports', job, err);
    });
  }

  /**
   * Add analytics job to queue
   */
  async addAnalyticsJob(jobType, data, options = {}) {
    try {
      const job = await this.queues.analytics.add(jobType, data, {
        priority: options.priority || 'normal',
        delay: options.delay || 0,
        ...options
      });

      this.logger.info(`Added analytics job ${job.id} of type ${jobType}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add analytics job:', error);
      throw error;
    }
  }

  /**
   * Add optimization job to queue
   */
  async addOptimizationJob(jobType, data, options = {}) {
    try {
      const job = await this.queues.optimization.add(jobType, data, {
        priority: options.priority || 'normal',
        delay: options.delay || 0,
        ...options
      });

      this.logger.info(`Added optimization job ${job.id} of type ${jobType}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add optimization job:', error);
      throw error;
    }
  }

  /**
   * Add report generation job to queue
   */
  async addReportJob(data, options = {}) {
    try {
      const job = await this.queues.reports.add('generate-report', data, {
        priority: options.priority || 'low',
        delay: options.delay || 0,
        ...options
      });

      this.logger.info(`Added report generation job ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add report job:', error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName, jobId) {
    try {
      const queue = this.queues[queueName];
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      const job = await queue.getJob(jobId);
      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const progress = await job.progress();
      const result = job.returnvalue;
      const failedReason = job.failedReason;

      return {
        id: job.id,
        status: state,
        progress,
        result,
        failedReason,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn
      };
    } catch (error) {
      this.logger.error('Failed to get job status:', error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName) {
    try {
      const queue = this.queues[queueName];
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();

      return {
        queueName,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats:', error);
      throw error;
    }
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats() {
    try {
      const stats = {};
      for (const [queueName, queue] of Object.entries(this.queues)) {
        stats[queueName] = await this.getQueueStats(queueName);
      }
      return stats;
    } catch (error) {
      this.logger.error('Failed to get all queue stats:', error);
      throw error;
    }
  }

  /**
   * Clean completed jobs
   */
  async cleanCompletedJobs(queueName, maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const queue = this.queues[queueName];
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      const completed = await queue.getCompleted();
      const jobsToRemove = completed.filter(job => 
        Date.now() - job.finishedOn > maxAge
      );

      for (const job of jobsToRemove) {
        await job.remove();
      }

      this.logger.info(`Cleaned ${jobsToRemove.length} completed jobs from ${queueName}`);
      return jobsToRemove.length;
    } catch (error) {
      this.logger.error('Failed to clean completed jobs:', error);
      throw error;
    }
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName) {
    try {
      const queue = this.queues[queueName];
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      await queue.pause();
      this.logger.info(`Paused queue ${queueName}`);
    } catch (error) {
      this.logger.error('Failed to pause queue:', error);
      throw error;
    }
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName) {
    try {
      const queue = this.queues[queueName];
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      await queue.resume();
      this.logger.info(`Resumed queue ${queueName}`);
    } catch (error) {
      this.logger.error('Failed to resume queue:', error);
      throw error;
    }
  }

  /**
   * Remove job
   */
  async removeJob(queueName, jobId) {
    try {
      const queue = this.queues[queueName];
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      const job = await queue.getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      await job.remove();
      this.logger.info(`Removed job ${jobId} from queue ${queueName}`);
    } catch (error) {
      this.logger.error('Failed to remove job:', error);
      throw error;
    }
  }

  /**
   * Generate report (placeholder implementation)
   */
  async generateReport(data) {
    // This would implement actual report generation
    // For now, return a placeholder
    return {
      reportId: `report_${Date.now()}`,
      type: data.reportType,
      generatedAt: new Date(),
      data: data
    };
  }

  /**
   * Emit job completed event (for WebSocket integration)
   */
  emitJobCompleted(queueName, job, result) {
    // This would emit to WebSocket for real-time updates
    this.logger.info(`Job ${job.id} completed in queue ${queueName}`);
  }

  /**
   * Emit job failed event (for WebSocket integration)
   */
  emitJobFailed(queueName, job, error) {
    // This would emit to WebSocket for real-time updates
    this.logger.error(`Job ${job.id} failed in queue ${queueName}:`, error);
  }

  /**
   * Emit job progress event (for WebSocket integration)
   */
  emitJobProgress(queueName, job, progress) {
    // This would emit to WebSocket for real-time updates
    this.logger.info(`Job ${job.id} progress in queue ${queueName}: ${progress}%`);
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down job service...');
      
      for (const [queueName, queue] of Object.entries(this.queues)) {
        await queue.close();
        this.logger.info(`Closed queue ${queueName}`);
      }
      
      this.logger.info('Job service shutdown completed');
    } catch (error) {
      this.logger.error('Error during job service shutdown:', error);
      throw error;
    }
  }
}

module.exports = new JobService();
