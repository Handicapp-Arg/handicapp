import { app } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';
import { initializeApp } from './scripts/init-models';
import { closeDatabase } from './config/database';
import { websocketService } from './services/websocketService';
import { iniciarCronNotificacionesTareas } from './jobs/tareaNotificacionCron';
import http from 'http';

// Validate email provider at startup (production only)
if (config.nodeEnv === 'production') {
  const hasResend = !!config.email.resend.apiKey;
  const hasSmtp = !!(config.email.smtp.host && config.email.smtp.user && config.email.smtp.pass);

  if (!hasResend && !hasSmtp) {
    logger.error('❌ No hay proveedor de email configurado. Configure RESEND_API_KEY o SMTP_HOST/SMTP_USER/SMTP_PASS para enviar emails en producción.');
    process.exit(1);
  }
}

// Start server with complete initialization
const startServer = async (): Promise<void> => {
  try {
    // Initialize complete application (models, relations, seeds)
    await initializeApp();
    
    // Create HTTP server (necesario para Socket.IO)
    const httpServer = http.createServer(app);
    
    // Initialize WebSocket server
    websocketService.initialize(httpServer);
    logger.info('🔌 WebSocket server initialized');
    
    // Initialize Cron Jobs for notifications
    iniciarCronNotificacionesTareas();
    logger.info('⏰ Cron jobs initialized');
    
    // Use Render's PORT env var if available, otherwise fallback to 3000
    const listenPort = process.env['PORT'] ? Number(process.env['PORT']) : 3000;
    const listenHost = '0.0.0.0';

    // Start HTTP server
    httpServer.listen(listenPort, listenHost, () => {
      logger.info(`🚀 HandicApp API running on http://${listenHost}:${listenPort}`);
      if (config.nodeEnv === 'development') {
        logger.info(`📊 Environment: ${config.nodeEnv} | Version: ${config.api.version}`);
      }
      logger.info('🎉 Server ready');
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📡 Señal ${signal} recibida. Iniciando cierre controlado...`);
      
      httpServer.close(async () => {
        logger.info('🔌 Servidor HTTP cerrado');
        
        try {
          // Cerrar WebSocket server
          await websocketService.close();
          logger.info('🔌 WebSocket server cerrado');
          
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
