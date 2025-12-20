// src/services/tareaNotificacionService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Notificaciones Automáticas para Tareas
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import { Tarea } from '../models/Tarea';
import { User } from '../models/User';
import { EstadoTarea } from '../models/enums';
import { logger } from '../utils/logger';
import { NotificacionService, TipoNotificacion } from './notificacionService';

/**
 * Servicio para gestionar notificaciones automáticas de tareas
 * (Tareas vencidas, próximas a vencer, etc.)
 */
export class TareaNotificacionService {
  
  /**
   * Verificar y notificar tareas vencidas
   * Ejecutar cada hora vía cron job
   */
  static async verificarTareasVencidas(): Promise<void> {
    try {
      logger.info('🔍 Verificando tareas vencidas...');

      const ahora = new Date();

      // Buscar tareas vencidas que no estén completadas o canceladas
      const tareasVencidas = await Tarea.findAll({
        where: {
          estado: {
            [Op.in]: [EstadoTarea.open, EstadoTarea.in_progress]
          },
          fecha_vencimiento: {
            [Op.lt]: ahora,
            [Op.gte]: new Date(ahora.getTime() - 60 * 60 * 1000) // Últimas 1 hora para evitar duplicados
          }
        },
        include: [
          {
            model: User,
            as: 'asignado_a',
            attributes: ['id', 'nombre', 'apellido', 'email']
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido', 'email']
          }
        ]
      });

      logger.info(`📊 Encontradas ${tareasVencidas.length} tareas vencidas`);

      for (const tarea of tareasVencidas) {
        const usuariosANotificar = new Set<number>();

        // Notificar al usuario asignado
        if (tarea.asignado_a_usuario_id) {
          usuariosANotificar.add(tarea.asignado_a_usuario_id);
        }

        // Notificar al creador (si es diferente del asignado)
        if (tarea.creado_por_usuario_id && tarea.creado_por_usuario_id !== tarea.asignado_a_usuario_id) {
          usuariosANotificar.add(tarea.creado_por_usuario_id);
        }

        // Enviar notificaciones
        for (const usuarioId of usuariosANotificar) {
          try {
            await NotificacionService.crear({
              usuario_id: usuarioId,
              tipo: TipoNotificacion.TAREA_VENCIDA,
              titulo: '⚠️ Tarea vencida',
              mensaje: `La tarea "${tarea.titulo}" ha vencido sin completarse`,
              tarea_id: tarea.id,
              importante: true,
              url: `/tareas/${tarea.id}`
            });

            logger.info(`🔔 Notificación de tarea vencida enviada a usuario ${usuarioId} para tarea ${tarea.id}`);
          } catch (error: any) {
            logger.error(`Error al enviar notificación de tarea vencida: ${error.message}`);
          }
        }
      }

      logger.info(`✅ Verificación de tareas vencidas completada: ${tareasVencidas.length} notificaciones enviadas`);
    } catch (error: any) {
      logger.error('Error al verificar tareas vencidas:', error);
    }
  }

  /**
   * Verificar y notificar tareas próximas a vencer (24 horas antes)
   * Ejecutar cada hora vía cron job
   */
  static async verificarTareasProximasVencer(): Promise<void> {
    try {
      logger.info('🔍 Verificando tareas próximas a vencer...');

      const ahora = new Date();
      const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
      const en23Horas = new Date(ahora.getTime() + 23 * 60 * 60 * 1000);

      // Buscar tareas que vencen en 24 horas (ventana de 1 hora para evitar duplicados)
      const tareasProximas = await Tarea.findAll({
        where: {
          estado: {
            [Op.in]: [EstadoTarea.open, EstadoTarea.in_progress]
          },
          fecha_vencimiento: {
            [Op.gte]: en23Horas,
            [Op.lte]: en24Horas
          }
        },
        include: [
          {
            model: User,
            as: 'asignado_a',
            attributes: ['id', 'nombre', 'apellido', 'email']
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido', 'email']
          }
        ]
      });

      logger.info(`📊 Encontradas ${tareasProximas.length} tareas próximas a vencer`);

      for (const tarea of tareasProximas) {
        const usuariosANotificar = new Set<number>();

        // Notificar al usuario asignado (PRINCIPAL)
        if (tarea.asignado_a_usuario_id) {
          usuariosANotificar.add(tarea.asignado_a_usuario_id);
        }

        // Notificar al creador solo si la tarea es de alta/crítica prioridad
        if (tarea.creado_por_usuario_id && 
            tarea.creado_por_usuario_id !== tarea.asignado_a_usuario_id &&
            (tarea.prioridad === 'alta' || tarea.prioridad === 'critica')) {
          usuariosANotificar.add(tarea.creado_por_usuario_id);
        }

        // Enviar notificaciones
        for (const usuarioId of usuariosANotificar) {
          try {
            await NotificacionService.crear({
              usuario_id: usuarioId,
              tipo: TipoNotificacion.TAREA_PROXIMA_VENCER,
              titulo: '⏰ Tarea próxima a vencer',
              mensaje: `La tarea "${tarea.titulo}" vence mañana`,
              tarea_id: tarea.id,
              importante: tarea.prioridad === 'critica' || tarea.prioridad === 'alta',
              url: `/tareas/${tarea.id}`
            });

            logger.info(`🔔 Notificación de tarea próxima a vencer enviada a usuario ${usuarioId} para tarea ${tarea.id}`);
          } catch (error: any) {
            logger.error(`Error al enviar notificación de tarea próxima: ${error.message}`);
          }
        }
      }

      logger.info(`✅ Verificación de tareas próximas completada: ${tareasProximas.length} notificaciones enviadas`);
    } catch (error: any) {
      logger.error('Error al verificar tareas próximas a vencer:', error);
    }
  }

  /**
   * Ejecutar todas las verificaciones de notificaciones
   * (Llamar desde cron job)
   */
  static async ejecutarVerificaciones(): Promise<void> {
    logger.info('🚀 Iniciando verificaciones automáticas de tareas...');
    
    try {
      await Promise.all([
        this.verificarTareasVencidas(),
        this.verificarTareasProximasVencer()
      ]);
      
      logger.info('✅ Verificaciones automáticas completadas');
    } catch (error: any) {
      logger.error('Error en verificaciones automáticas:', error);
    }
  }
}
