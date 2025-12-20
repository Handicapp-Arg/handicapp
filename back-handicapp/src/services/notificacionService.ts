// src/services/notificacionService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Notificaciones
// -----------------------------------------------------------------------------

import { Notificacion } from '../models/Notificacion';
import { User } from '../models/User';
import { Evento } from '../models/Evento';
import { Tarea } from '../models/Tarea';
import { logger } from '../utils/logger';
import { ServiceResponse, PaginationQuery } from '../types';
import { EstadoNotificacion } from '../models/enums';
import { Op } from 'sequelize';
import { websocketService } from './websocketService';

// ====================================
// INTERFACES
// ====================================

export interface NotificacionFilters extends PaginationQuery {
  usuario_id?: number;
  tipo?: string;
  estado?: EstadoNotificacion;
  fecha_desde?: Date;
  fecha_hasta?: Date;
  leida?: boolean;
}

export interface CreateNotificacionData {
  usuario_id: number;
  tipo: string;
  titulo?: string;
  mensaje?: string;
  payload_json?: any;
  evento_id?: number;
  tarea_id?: number;
  importante?: boolean;
  url?: string;
}

export interface NotificacionStats {
  total: number;
  no_leidas: number;
  leidas: number;
  importantes: number;
  por_tipo: Record<string, number>;
}

// ====================================
// TIPOS DE NOTIFICACIONES
// ====================================

export enum TipoNotificacion {
  EVENTO_CREADO = 'evento.creado',
  EVENTO_ACTUALIZADO = 'evento.actualizado',
  EVENTO_PROXIMO = 'evento.proximo',
  EVENTO_VENCIDO = 'evento.vencido',
  
  TAREA_CREADA = 'tarea.creada',
  TAREA_ASIGNADA = 'tarea.asignada',
  TAREA_ACTUALIZADO = 'tarea.actualizado',
  TAREA_COMPLETADA = 'tarea.completada',
  TAREA_CANCELADA = 'tarea.cancelada',
  TAREA_VENCIDA = 'tarea.vencida',
  TAREA_PROXIMA_VENCER = 'tarea.proxima_vencer',
  
  CABALLO_CREADO = 'caballo.creado',
  CABALLO_ACTUALIZADO = 'caballo.actualizado',
  
  // Notificaciones de asociación bidireccional
  CABALLO_SOLICITUD_ASOCIACION = 'caballo.solicitud_asociacion',
  CABALLO_ASOCIACION_APROBADA = 'caballo.asociacion_aprobada',
  CABALLO_ASOCIACION_RECHAZADA = 'caballo.asociacion_rechazada',
  
  USUARIO_INVITADO = 'usuario.invitado',
  USUARIO_ACEPTADO = 'usuario.aceptado',
  
  SISTEMA_INFO = 'sistema.info',
  SISTEMA_ADVERTENCIA = 'sistema.advertencia',
  SISTEMA_ERROR = 'sistema.error',
}

// ====================================
// SERVICIO
// ====================================

export class NotificacionService {
  
  /**
   * Crear una nueva notificación
   */
  static async crear(data: CreateNotificacionData): Promise<ServiceResponse<Notificacion>> {
    try {
      const payload = {
        usuario_id: data.usuario_id,
        tipo: data.tipo,
        payload_json: data.payload_json ? JSON.stringify({
          titulo: data.titulo,
          mensaje: data.mensaje,
          importante: data.importante || false,
          url: data.url,
          evento_id: data.evento_id,
          tarea_id: data.tarea_id,
          ...data.payload_json
        }) : JSON.stringify({
          titulo: data.titulo,
          mensaje: data.mensaje,
          importante: data.importante || false,
          url: data.url,
          evento_id: data.evento_id,
          tarea_id: data.tarea_id,
        }),
        estado: EstadoNotificacion.unread,
        creado_el: new Date(),
      };

      const notificacion = await Notificacion.create(payload as any);
      
      logger.info('Notificación creada', { 
        id: notificacion.id, 
        usuario_id: data.usuario_id,
        tipo: data.tipo 
      });

      // 🔔 Emitir notificación en tiempo real vía WebSocket
      try {
        const payloadData = JSON.parse(notificacion.payload_json || '{}');
        websocketService.emitNotificacionNueva(data.usuario_id, {
          id: notificacion.id,
          tipo: notificacion.tipo,
          titulo: payloadData.titulo || 'Nueva notificación',
          mensaje: payloadData.mensaje || '',
          importante: payloadData.importante || false,
          url: payloadData.url,
          payload: payloadData
        });
      } catch (wsError: any) {
        logger.error('Error al emitir notificación por WebSocket', { error: wsError.message });
      }

      return { success: true, data: notificacion };
    } catch (error: any) {
      logger.error('Error al crear notificación', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Crear notificaciones para múltiples usuarios
   */
  static async crearMultiple(
    usuarios_ids: number[],
    data: Omit<CreateNotificacionData, 'usuario_id'>
  ): Promise<ServiceResponse<Notificacion[]>> {
    try {
      const notificaciones = await Promise.all(
        usuarios_ids.map(usuario_id =>
          this.crear({ ...data, usuario_id })
        )
      );

      const exitosas = notificaciones.filter(n => n.success && n.data).map(n => n.data!);
      
      logger.info('Notificaciones múltiples creadas', { 
        total: usuarios_ids.length,
        exitosas: exitosas.length
      });

      return { success: true, data: exitosas };
    } catch (error: any) {
      logger.error('Error al crear notificaciones múltiples', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener notificaciones con filtros y paginación
   */
  static async obtenerNotificaciones(
    filters: NotificacionFilters = {}
  ): Promise<ServiceResponse<{ notificaciones: Notificacion[]; total: number; totalPages: number }>> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;

      const where: any = {};

      // Filtros
      if (filters.usuario_id) {
        where.usuario_id = filters.usuario_id;
      }

      if (filters.tipo) {
        where.tipo = filters.tipo;
      }

      if (filters.estado) {
        where.estado = filters.estado;
      }

      if (filters.leida !== undefined) {
        where.estado = filters.leida ? EstadoNotificacion.read : EstadoNotificacion.unread;
      }

      if (filters.fecha_desde || filters.fecha_hasta) {
        where.creado_el = {};
        if (filters.fecha_desde) {
          where.creado_el[Op.gte] = filters.fecha_desde;
        }
        if (filters.fecha_hasta) {
          where.creado_el[Op.lte] = filters.fecha_hasta;
        }
      }

      const { count, rows } = await Notificacion.findAndCountAll({
        where,
        limit,
        offset,
        order: [['creado_el', 'DESC']],
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'email']
          },
          {
            model: Evento,
            as: 'evento',
            required: false,
            attributes: ['id', 'titulo', 'fecha_evento']
          },
          {
            model: Tarea,
            as: 'tarea',
            required: false,
            attributes: ['id', 'titulo', 'fecha_vencimiento']
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      // Parsear payload_json y extraer titulo/mensaje
      const notificacionesFormateadas = rows.map(notif => {
        const notifJson = notif.toJSON() as any;
        
        // Parsear payload_json si existe
        if (notifJson.payload_json) {
          try {
            const payload = typeof notifJson.payload_json === 'string' 
              ? JSON.parse(notifJson.payload_json) 
              : notifJson.payload_json;
            
            // Extraer titulo y mensaje del payload
            notifJson.titulo = payload.titulo || '';
            notifJson.mensaje = payload.mensaje || '';
            notifJson.importante = payload.importante || false;
            notifJson.url = payload.url || null;
            
            // Mantener el payload completo por si se necesita
            notifJson.payload = payload;
          } catch (e) {
            logger.warn('Error parsing payload_json', { notificacion_id: notifJson.id });
          }
        }
        
        // Mapear estado a leida (boolean) para compatibilidad frontend
        notifJson.leida = notifJson.estado === 'read' || notifJson.estado === EstadoNotificacion.read;
        notifJson.fecha_creacion = notifJson.creado_el;
        
        return notifJson;
      });

      return {
        success: true,
        data: { notificaciones: notificacionesFormateadas, total: count, totalPages }
      };
    } catch (error: any) {
      logger.error('Error al obtener notificaciones', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener una notificación por ID
   */
  static async obtenerPorId(id: number): Promise<ServiceResponse<Notificacion>> {
    try {
      const notificacion = await Notificacion.findByPk(id, {
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'email']
          },
          {
            model: Evento,
            as: 'evento',
            required: false
          },
          {
            model: Tarea,
            as: 'tarea',
            required: false
          }
        ]
      });

      if (!notificacion) {
        return { success: false, error: 'Notificación no encontrada' };
      }

      return { success: true, data: notificacion };
    } catch (error: any) {
      logger.error('Error al obtener notificación', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Marcar notificación como leída
   */
  static async marcarComoLeida(id: number, usuario_id: number): Promise<ServiceResponse<Notificacion>> {
    try {
      const notificacion = await Notificacion.findByPk(id);

      if (!notificacion) {
        return { success: false, error: 'Notificación no encontrada' };
      }

      // Verificar que pertenece al usuario
      const notif_usuario_id = notificacion.getDataValue('usuario_id');
      
      if (notif_usuario_id !== usuario_id) {
        return { success: false, error: 'No autorizado' };
      }

      await notificacion.update({
        estado: EstadoNotificacion.read,
        leido_el: new Date()
      });

      // 🔔 Emitir actualización por WebSocket
      try {
        websocketService.emitNotificacionLeida(usuario_id, id);
      } catch (wsError: any) {
        logger.error('Error al emitir notificación leída por WebSocket', { error: wsError.message });
      }

      return { success: true, data: notificacion };
    } catch (error: any) {
      logger.error('Error al marcar notificación como leída', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Marcar múltiples notificaciones como leídas
   */
  static async marcarVariasComoLeidas(
    ids: number[],
    usuario_id: number
  ): Promise<ServiceResponse<{ updated: number }>> {
    try {
      const [updated] = await Notificacion.update(
        {
          estado: EstadoNotificacion.read,
          leido_el: new Date()
        },
        {
          where: {
            id: { [Op.in]: ids },
            usuario_id,
            estado: EstadoNotificacion.unread
          }
        }
      );

      // 🔔 Emitir actualización por WebSocket
      if (updated > 0) {
        try {
          websocketService.emitNotificacionesLeidas(usuario_id, ids);
        } catch (wsError: any) {
          logger.error('Error al emitir notificaciones leídas por WebSocket', { error: wsError.message });
        }
      }

      return { success: true, data: { updated } };
    } catch (error: any) {
      logger.error('Error al marcar notificaciones como leídas', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async marcarTodasComoLeidas(usuario_id: number): Promise<ServiceResponse<{ updated: number }>> {
    try {
      const [updated] = await Notificacion.update(
        {
          estado: EstadoNotificacion.read,
          leido_el: new Date()
        },
        {
          where: {
            usuario_id,
            estado: EstadoNotificacion.unread
          }
        }
      );

      logger.info('Todas las notificaciones marcadas como leídas', { usuario_id, updated });

      // 🔔 Emitir actualización por WebSocket
      if (updated > 0) {
        try {
          websocketService.emitContadorNoLeidas(usuario_id, 0);
        } catch (wsError: any) {
          logger.error('Error al emitir contador por WebSocket', { error: wsError.message });
        }
      }

      return { success: true, data: { updated } };
    } catch (error: any) {
      logger.error('Error al marcar todas como leídas', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar una notificación
   */
  static async eliminar(id: number, usuario_id: number): Promise<ServiceResponse<void>> {
    try {
      const notificacion = await Notificacion.findByPk(id);

      if (!notificacion) {
        return { success: false, error: 'Notificación no encontrada' };
      }

      // Verificar que pertenece al usuario
      const notif_usuario_id = notificacion.getDataValue('usuario_id');
      if (notif_usuario_id !== usuario_id) {
        return { success: false, error: 'No autorizado' };
      }

      await notificacion.destroy();

      // 🔔 Emitir eliminación por WebSocket
      try {
        websocketService.emitNotificacionEliminada(usuario_id, id);
      } catch (wsError: any) {
        logger.error('Error al emitir notificación eliminada por WebSocket', { error: wsError.message });
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Error al eliminar notificación', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar múltiples notificaciones
   */
  static async eliminarVarias(ids: number[], usuario_id: number): Promise<ServiceResponse<{ deleted: number }>> {
    try {
      const deleted = await Notificacion.destroy({
        where: {
          id: { [Op.in]: ids },
          usuario_id
        }
      });

      // 🔔 Emitir eliminación por WebSocket
      if (deleted > 0) {
        try {
          websocketService.emitNotificacionesEliminadas(usuario_id, ids);
        } catch (wsError: any) {
          logger.error('Error al emitir notificaciones eliminadas por WebSocket', { error: wsError.message });
        }
      }

      return { success: true, data: { deleted } };
    } catch (error: any) {
      logger.error('Error al eliminar notificaciones', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar todas las notificaciones leídas
   */
  static async eliminarLeidas(usuario_id: number): Promise<ServiceResponse<{ deleted: number }>> {
    try {
      // Obtener IDs antes de eliminar para emitir por WebSocket
      const notificaciones = await Notificacion.findAll({
        where: {
          usuario_id,
          estado: EstadoNotificacion.read
        },
        attributes: ['id']
      });

      const ids = notificaciones.map(n => n.id);

      const deleted = await Notificacion.destroy({
        where: {
          usuario_id,
          estado: EstadoNotificacion.read
        }
      });

      logger.info('Notificaciones leídas eliminadas', { usuario_id, deleted });

      // 🔔 Emitir eliminación por WebSocket
      if (deleted > 0 && ids.length > 0) {
        try {
          websocketService.emitNotificacionesEliminadas(usuario_id, ids);
        } catch (wsError: any) {
          logger.error('Error al emitir notificaciones eliminadas por WebSocket', { error: wsError.message });
        }
      }

      return { success: true, data: { deleted } };
    } catch (error: any) {
      logger.error('Error al eliminar notificaciones leídas', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  static async obtenerEstadisticas(usuario_id: number): Promise<ServiceResponse<NotificacionStats>> {
    try {
      const notificaciones = await Notificacion.findAll({
        where: { usuario_id },
        attributes: ['id', 'tipo', 'estado', 'payload_json']
      });

      const no_leidas = notificaciones.filter(n => n.estado === EstadoNotificacion.unread).length;
      const leidas = notificaciones.filter(n => n.estado === EstadoNotificacion.read).length;

      // Contar importantes
      let importantes = 0;
      const por_tipo: Record<string, number> = {};

      notificaciones.forEach(n => {
        // Contar por tipo
        if (n.tipo) {
          const tipoBase = n.tipo.split('.')[0]; // evento, tarea, etc.
          if (tipoBase) {
            por_tipo[tipoBase] = (por_tipo[tipoBase] || 0) + 1;
          }
        }

        // Contar importantes
        try {
          const payload = JSON.parse(n.payload_json || '{}');
          if (payload.importante) {
            importantes++;
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      });

      const stats: NotificacionStats = {
        total: notificaciones.length,
        no_leidas,
        leidas,
        importantes,
        por_tipo
      };

      return { success: true, data: stats };
    } catch (error: any) {
      logger.error('Error al obtener estadísticas', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener contador de no leídas
   */
  static async obtenerConteoNoLeidas(usuario_id: number): Promise<ServiceResponse<number>> {
    try {
      const count = await Notificacion.count({
        where: {
          usuario_id,
          estado: EstadoNotificacion.unread
        }
      });

      return { success: true, data: count };
    } catch (error: any) {
      logger.error('Error al obtener conteo de no leídas', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // HELPERS PARA TRIGGERS AUTOMÁTICOS
  // ====================================

  /**
   * Notificación cuando se crea un evento
   */
  static async notificarEventoCreado(evento: any, _creador_id: number): Promise<void> {
    try {
      // Obtener usuarios a notificar (propietarios del caballo, veterinarios, etc.)
      const usuarios_a_notificar: number[] = [];

      // Aquí puedes agregar lógica para determinar quién debe ser notificado
      // Por ejemplo: propietarios del caballo, usuarios del establecimiento, etc.

      if (usuarios_a_notificar.length > 0) {
        await this.crearMultiple(usuarios_a_notificar, {
          tipo: TipoNotificacion.EVENTO_CREADO,
          titulo: 'Nuevo evento creado',
          mensaje: `Se ha creado el evento: ${evento.titulo}`,
          evento_id: evento.id,
          importante: evento.prioridad === 'alta' || evento.prioridad === 'critica',
          url: `/eventos/${evento.id}`
        });
      }
    } catch (error: any) {
      logger.error('Error al notificar evento creado', { error: error.message });
    }
  }

  /**
   * Notificación cuando se actualiza un evento
   */
  static async notificarEventoActualizado(evento: any, _actualizado_por_id: number): Promise<void> {
    try {
      // Obtener usuarios a notificar (relacionados al evento)
      const usuarios_a_notificar: number[] = [];

      // Aquí puedes agregar lógica para determinar quién debe ser notificado
      // Por ejemplo: usuarios que siguen el evento, propietarios del caballo, etc.

      if (usuarios_a_notificar.length > 0) {
        await this.crearMultiple(usuarios_a_notificar, {
          tipo: TipoNotificacion.EVENTO_ACTUALIZADO,
          titulo: 'Evento actualizado',
          mensaje: `Se ha actualizado el evento: ${evento.titulo}`,
          evento_id: evento.id,
          importante: evento.prioridad === 'alta' || evento.prioridad === 'critica',
          url: `/eventos/${evento.id}`
        });
      }
    } catch (error: any) {
      logger.error('Error al notificar evento actualizado', { error: error.message });
    }
  }

  /**
   * Notificación cuando se asigna una tarea
   */
  static async notificarTareaAsignada(tarea: any): Promise<void> {
    try {
      if (!tarea.asignado_a_usuario_id) return;

      await this.crear({
        usuario_id: tarea.asignado_a_usuario_id,
        tipo: TipoNotificacion.TAREA_ASIGNADA,
        titulo: 'Nueva tarea asignada',
        mensaje: `Se te ha asignado la tarea: ${tarea.titulo}`,
        tarea_id: tarea.id,
        importante: tarea.prioridad === 'alta' || tarea.prioridad === 'critica',
        url: `/tareas/${tarea.id}`
      });
    } catch (error: any) {
      logger.error('Error al notificar tarea asignada', { error: error.message });
    }
  }

  /**
   * Notificación cuando se completa una tarea
   */
  static async notificarTareaCompletada(tarea: any, completado_por_id: number): Promise<void> {
    try {
      // Notificar al creador de la tarea si no es quien la completó
      if (tarea.creado_por_usuario_id && tarea.creado_por_usuario_id !== completado_por_id) {
        await this.crear({
          usuario_id: tarea.creado_por_usuario_id,
          tipo: TipoNotificacion.TAREA_COMPLETADA,
          titulo: 'Tarea completada',
          mensaje: `La tarea "${tarea.titulo}" ha sido completada`,
          tarea_id: tarea.id,
          url: `/tareas/${tarea.id}`
        });
      }
    } catch (error: any) {
      logger.error('Error al notificar tarea completada', { error: error.message });
    }
  }
}
