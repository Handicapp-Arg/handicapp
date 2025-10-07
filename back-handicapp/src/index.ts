import { app } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';
import { initializeApp } from './scripts/init-models';
import { closeDatabase } from './config/database';

// Start server with complete initialization
const startServer = async (): Promise<void> => {
  try {
    // Initialize complete application (models, relations, seeds)
    await initializeApp();
    
    // Start HTTP server
    const server = app.listen(config.port, config.host, () => {
  logger.info(`🚀 HandicApp API running on http://${config.host}:${config.port}`);
      if (config.nodeEnv === 'development') {
        logger.info(`📊 Environment: ${config.nodeEnv} | Version: ${config.api.version}`);
      }
      logger.info('🎉 Server ready');
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📡 Señal ${signal} recibida. Iniciando cierre controlado...`);
      
      server.close(async () => {
        logger.info('🔌 Servidor HTTP cerrado');
        
        try {
          await closeDatabase();
          logger.info('✅ Cierre controlado completado');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error durante el cierre', { error });
          process.exit(1);
        }
      });
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 Excepción no capturada', { error });
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Promise rechazada no manejada', { reason, promise });
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('❌ Error al iniciar servidor', { error });
    process.exit(1);
  }
};

// Start the application
startServer();
