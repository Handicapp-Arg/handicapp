// src/controllers/notificacionController.ts
// -----------------------------------------------------------------------------
// HandicApp API - Controller de Notificaciones
// -----------------------------------------------------------------------------

import { Response } from 'express';
import { NotificacionService, NotificacionFilters } from '../services/notificacionService';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class NotificacionController {

  /**
   * Obtener todas las notificaciones del usuario autenticado
   * GET /api/v1/notificaciones
   */
  static async obtenerNotificaciones(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters: NotificacionFilters = {
        usuario_id: req.user!.id
      };

      // Agregar filtros opcionales
      if (req.query['page']) {
        filters.page = parseInt(req.query['page'] as string);
      }
      if (req.query['limit']) {
        filters.limit = parseInt(req.query['limit'] as string);
      }
      if (req.query['tipo']) {
        filters.tipo = req.query['tipo'] as string;
      }
      if (req.query['leida'] === 'true') {
        filters.leida = true;
      } else if (req.query['leida'] === 'false') {
        filters.leida = false;
      }
      if (req.query['fecha_desde']) {
        filters.fecha_desde = new Date(req.query['fecha_desde'] as string);
      }
      if (req.query['fecha_hasta']) {
        filters.fecha_hasta = new Date(req.query['fecha_hasta'] as string);
      }

      const result = await NotificacionService.obtenerNotificaciones(filters);

      if (!result.success || !result.data) {
        res.status(400).json(ApiResponse.error(result.error || 'Error al obtener notificaciones'));
        return;
      }

      res.json(ApiResponse.success(result.data));
    } catch (error: any) {
      logger.error('Error en obtenerNotificaciones', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener una notificación por ID
   * GET /api/v1/notificaciones/:id
   */
  static async obtenerPorId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;

      if (isNaN(id)) {
        res.status(400).json(ApiResponse.error('ID inválido'));
        return;
      }

      const result = await NotificacionService.obtenerPorId(id);

      if (!result.success || !result.data) {
        res.status(404).json(ApiResponse.error(result.error || 'Notificación no encontrada'));
        return;
      }

      // Verificar que pertenece al usuario
      if (result.data.usuario_id !== usuarioId) {
        res.status(403).json(ApiResponse.error('No autorizado'));
        return;
      }

      res.json(ApiResponse.success(result.data));
    } catch (error: any) {
      logger.error('Error en obtenerPorId', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Marcar notificación como leída
   * PATCH /api/v1/notificaciones/:id/leer
   */
  static async marcarComoLeida(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;

      if (isNaN(id)) {
        res.status(400).json(ApiResponse.error('ID inválido'));
        return;
      }

      const result = await NotificacionService.marcarComoLeida(id, usuarioId);

      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error || 'Error al marcar como leída'));
        return;
      }

      res.json(ApiResponse.success(result.data, 'Notificación marcada como leída'));
    } catch (error: any) {
      logger.error('Error en marcarComoLeida', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Marcar múltiples notificaciones como leídas
   * PATCH /api/v1/notificaciones/leer-multiples
   */
  static async marcarVariasComoLeidas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      const usuario_id = req.user!.id;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json(ApiResponse.error('Se requiere un array de IDs'));
        return;
      }

      const result = await NotificacionService.marcarVariasComoLeidas(ids, usuario_id);

      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error || 'Error al marcar notificaciones'));
        return;
      }

      res.json(ApiResponse.success(result.data, `${result.data?.updated || 0} notificaciones marcadas como leídas`));
    } catch (error: any) {
      logger.error('Error en marcarVariasComoLeidas', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   * PATCH /api/v1/notificaciones/leer-todas
   */
  static async marcarTodasComoLeidas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario_id = req.user!.id;

      const result = await NotificacionService.marcarTodasComoLeidas(usuario_id);

      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error || 'Error al marcar todas como leídas'));
        return;
      }

      res.json(ApiResponse.success(result.data, `${result.data?.updated || 0} notificaciones marcadas como leídas`));
    } catch (error: any) {
      logger.error('Error en marcarTodasComoLeidas', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Eliminar una notificación
   * DELETE /api/v1/notificaciones/:id
   */
  static async eliminar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;

      if (isNaN(id)) {
        res.status(400).json(ApiResponse.error('ID inválido'));
        return;
      }

      const result = await NotificacionService.eliminar(id, usuarioId);

      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error || 'Error al eliminar notificación'));
        return;
      }

      res.json(ApiResponse.success(null, 'Notificación eliminada exitosamente'));
    } catch (error: any) {
      logger.error('Error en eliminar', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Eliminar múltiples notificaciones
   * DELETE /api/v1/notificaciones/eliminar-multiples
   */
  static async eliminarVarias(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      const usuario_id = req.user!.id;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json(ApiResponse.error('Se requiere un array de IDs'));
        return;
      }

      const result = await NotificacionService.eliminarVarias(ids, usuario_id);

      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error || 'Error al eliminar notificaciones'));
        return;
      }

      res.json(ApiResponse.success(result.data, `${result.data?.deleted || 0} notificaciones eliminadas`));
    } catch (error: any) {
      logger.error('Error en eliminarVarias', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Eliminar todas las notificaciones leídas
   * DELETE /api/v1/notificaciones/eliminar-leidas
   */
  static async eliminarLeidas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario_id = req.user!.id;

      const result = await NotificacionService.eliminarLeidas(usuario_id);

      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error || 'Error al eliminar notificaciones leídas'));
        return;
      }

      res.json(ApiResponse.success(result.data, `${result.data?.deleted || 0} notificaciones eliminadas`));
    } catch (error: any) {
      logger.error('Error en eliminarLeidas', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   * GET /api/v1/notificaciones/stats
   */
  static async obtenerEstadisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario_id = req.user!.id;

      const result = await NotificacionService.obtenerEstadisticas(usuario_id);

      if (!result.success || !result.data) {
        res.status(400).json(ApiResponse.error(result.error || 'Error al obtener estadísticas'));
        return;
      }

      res.json(ApiResponse.success(result.data));
    } catch (error: any) {
      logger.error('Error en obtenerEstadisticas', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener contador de notificaciones no leídas
   * GET /api/v1/notificaciones/contador
   */
  static async obtenerContador(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario_id = req.user!.id;

      const result = await NotificacionService.obtenerConteoNoLeidas(usuario_id);

      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error || 'Error al obtener contador'));
        return;
      }

      res.json(ApiResponse.success({ count: result.data || 0 }));
    } catch (error: any) {
      logger.error('Error en obtenerContador', { error: error.message });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }
}
