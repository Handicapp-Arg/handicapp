// src/jobs/tareaNotificacionCron.ts
// -----------------------------------------------------------------------------
// HandicApp API - Cron Job para Notificaciones de Tareas
// -----------------------------------------------------------------------------

import cron from 'node-cron';
import { TareaNotificacionService } from '../services/tareaNotificacionService';
import { logger } from '../utils/logger';

/**
 * Configurar cron job para verificar tareas vencidas y próximas a vencer
 * Se ejecuta cada hora
 */
export function iniciarCronNotificacionesTareas(): void {
  // Ejecutar cada hora en el minuto 0
  // Formato: '0 * * * *' = cada hora a las XX:00
  const cronExpression = '0 * * * *';

  cron.schedule(cronExpression, async () => {
    logger.info('⏰ [CRON] Ejecutando verificación de notificaciones de tareas...');
    
    try {
      await TareaNotificacionService.ejecutarVerificaciones();
    } catch (error: any) {
      logger.error('[CRON] Error en verificación de tareas:', error);
    }
  }, {
    timezone: 'America/Argentina/Buenos_Aires' // Ajusta según tu zona horaria
  });

  logger.info(`✅ Cron job de notificaciones de tareas iniciado: ${cronExpression}`);
  logger.info('📅 Se ejecutará cada hora para verificar tareas vencidas y próximas a vencer');

  // Opcionalmente, ejecutar inmediatamente al iniciar (para testing)
  if (process.env['RUN_CRON_ON_START'] === 'true') {
    logger.info('🚀 Ejecutando verificación inicial de tareas...');
    TareaNotificacionService.ejecutarVerificaciones().catch(error => {
      logger.error('Error en verificación inicial:', error);
    });
  }
}

/**
 * Ejecutar verificación manual (útil para testing)
 */
export async function ejecutarVerificacionManual(): Promise<void> {
  logger.info('🔧 Ejecutando verificación manual de tareas...');
  await TareaNotificacionService.ejecutarVerificaciones();
}
