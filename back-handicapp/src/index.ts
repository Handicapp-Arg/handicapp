import { app } from './app';
import { initializeModels } from './models';
import { config } from './config/config';
import { logger } from './utils/logger';
import { connectDatabase, syncDatabase, closeDatabase, checkDatabaseHealth, sequelize } from './config/database';

// Database initialization with best practices
const initializeDatabase = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Initialize models after database connection
    initializeModels(sequelize);
    logger.info('Models initialized successfully');
    
    // Check database integrity
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error('Database integrity check failed');
    }
    
    // Sync database in development
    if (config.nodeEnv === 'development') {
      await syncDatabase();
      logger.info('Database sync completed - tables created/updated');
      
      // Initialize basic roles
      try {
        const fs = require('fs');
        const path = require('path');
        const initScript = fs.readFileSync(path.join(__dirname, '../init-roles.sql'), 'utf8');
        await sequelize.query(initScript);
        logger.info('Basic roles initialized');
      } catch (error) {
        logger.warn('Could not initialize roles:', error);
      }
    }
  } catch (error) {
    logger.error('Database initialization failed:', error);
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
          logger.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();