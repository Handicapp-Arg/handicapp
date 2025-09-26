import { app } from './app';
import { initializeModels } from './models';
import { config } from './config/config';
import { logger } from './utils/logger';
import { connectDatabase, syncDatabase, closeDatabase, checkDatabaseHealth, sequelize } from './config/database';

// Database initialization with best practices
const initializeDatabase = async (): Promise<void> => {
  try {
    // Initialize models first (defines schemas and hooks)
    initializeModels(sequelize);
    logger.info('Models initialized successfully');

    // Connect and verify DB
    await connectDatabase();
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) throw new Error('Database integrity check failed');

    // Sync database and seed in development
    if (config.nodeEnv === 'development') {
      await syncDatabase();
      logger.info('Database sync completed - tables created/updated');

      try {
        const { seedDatabase } = require('./services/seedService');
        await seedDatabase();
        logger.info('Basic roles and users initialized');
      } catch (err) {
        logger.warn({ error: err instanceof Error ? err.message : String(err) }, 'Could not initialize roles and users');
      }
    }
  } catch (err) {
    logger.error({
      error: err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : String(err),
    }, 'Database initialization failed');
    process.exit(1);
  }
};

// Start server with best practices
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start HTTP server
    const server = app.listen(config.port, config.host, () => {
      logger.info(`🚀 Server running on http://${config.host}:${config.port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🔧 API Version: ${config.api.version}`);
      logger.info(`🗄️  Database: ${config.database.name}@${config.database.host}:${config.database.port}`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📡 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('🔌 HTTP server closed');
        
        try {
          await closeDatabase();
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error({ error }, '❌ Error during shutdown');
          process.exit(1);
        }
      });
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error({ error }, '💥 Uncaught Exception');
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, '💥 Unhandled Rejection');
      process.exit(1);
    });
    
  } catch (error) {
    logger.error({ error }, '❌ Failed to start server');
    process.exit(1);
  }
};

// Start the application
startServer();