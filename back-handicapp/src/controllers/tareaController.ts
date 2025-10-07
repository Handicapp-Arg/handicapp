// src/controllers/tareaController.ts
// -----------------------------------------------------------------------------
// HandicApp API - Controller de Tareas
// -----------------------------------------------------------------------------

import { Response } from 'express';
import { TareaService } from '../services/tareaService';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class TareaController {

  // ====================================
  // CRUD BÁSICO
  // ====================================

  /**
   * Crear nueva tarea
   * POST /api/v1/tareas
   * Roles: admin, establecimiento, capataz, veterinario
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        titulo,
        descripcion,
        fechaVencimiento,
        asignadoAUsuarioId,
        caballoId,
        establecimientoId,
        categoria,
        observaciones
      } = req.body;
      
      const usuarioId = req.user!.id;

      // Validaciones básicas
      if (!titulo || !descripcion || !fechaVencimiento) {
        res.status(400).json(ApiResponse.error('Título, descripción y fecha de vencimiento son requeridos'));
        return;
      }

      const createPayload = {
        titulo,
        descripcion,
        fechaVencimiento,
        // mapeo a modelo backend
        establecimiento_id: establecimientoId!,
        caballo_id: caballoId,
        tipo: (categoria as any) || 'otro',
        notas: observaciones || descripcion,
        asignado_a_usuario_id: asignadoAUsuarioId,
      } as any;

      const tareaResult = await TareaService.createTarea(createPayload, usuarioId);

      if (!tareaResult.success || !tareaResult.data) {
        res.status(400).json(ApiResponse.error(tareaResult.error || 'No se pudo crear la tarea'));
        return;
      }

      logger.info(`Tarea creada: ${tareaResult.data.id}`);
      res.status(201).json(ApiResponse.success(tareaResult.data, 'Tarea creada exitosamente'));

    } catch (error) {
      logger.error('Error creando tarea', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener todas las tareas con paginación y filtros
   * GET /api/v1/tareas?page=1&limit=10&estado=pendiente&prioridad=alta&asignado=123
   * Roles: todos los autenticados
   */
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query['page'] as string) || '') || 1;
      const limit = parseInt((req.query['limit'] as string) || '') || 10;
      const estado = req.query['estado'] as string | undefined;
      const prioridad = req.query['prioridad'] as string | undefined;
      const categoria = req.query['categoria'] as string | undefined;
      const asignadoAUsuarioId = req.query['asignado'] ? parseInt(req.query['asignado'] as string) : undefined;
      const caballoId = req.query['caballo'] ? parseInt(req.query['caballo'] as string) : undefined;
      const establecimientoId = req.query['establecimiento'] ? parseInt(req.query['establecimiento'] as string) : undefined;
      const fechaVencimientoInicio = req.query['fechaInicio'] as string | undefined;
      const fechaVencimientoFin = req.query['fechaFin'] as string | undefined;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const result = await TareaService.getAllTareas({
        page,
        limit,
        ...(estado ? { estado } : {}),
        ...(prioridad ? { prioridad } : {}),
        ...(categoria ? { categoria } : {}),
        ...(typeof asignadoAUsuarioId === 'number' ? { asignadoAUsuarioId } : {}),
        ...(typeof caballoId === 'number' ? { caballoId } : {}),
        ...(typeof establecimientoId === 'number' ? { establecimientoId } : {}),
        ...(fechaVencimientoInicio ? { fechaVencimientoInicio } : {}),
        ...(fechaVencimientoFin ? { fechaVencimientoFin } : {}),
        ...(typeof usuarioId === 'number' ? { usuarioId } : {}),
        ...(userRole ? { userRole } : {}),
      });

      if (!result.success || !result.data) {
        res.status(500).json(ApiResponse.error(result.error || 'Error al obtener tareas'));
        return;
      }

      res.json({
        success: true,
        message: 'Success',
        data: result.data.tareas,
        meta: { page, limit, total: result.data.total, totalPages: result.data.totalPages },
      });

    } catch (error) {
      logger.error('Error obteniendo tareas', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener tarea por ID
   * GET /api/v1/tareas/:id
   * Roles: usuarios con acceso a la tarea
   */
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tareaId = parseInt((req.params['id'] as string) || '');

      if (isNaN(tareaId)) {
        res.status(400).json(ApiResponse.error('ID de tarea inválido'));
        return;
      }

      const tareaResult = await TareaService.getTareaById(tareaId);

      if (!tareaResult.success || !tareaResult.data) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada'));
        return;
      }

      // Nota: permisos finos se pueden añadir aquí si se requieren
      res.json(ApiResponse.success(tareaResult.data));

    } catch (error) {
      logger.error('Error obteniendo tarea', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Actualizar tarea
   * PUT /api/v1/tareas/:id
   * Roles: admin, usuario que creó la tarea, usuario asignado
   */
  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tareaId = parseInt((req.params['id'] as string) || '');
      const usuarioId = req.user!.id;
      const updateData = req.body;

      if (isNaN(tareaId)) {
        res.status(400).json(ApiResponse.error('ID de tarea inválido'));
        return;
      }

      const updateResult = await TareaService.updateTarea(
        tareaId,
        updateData,
        usuarioId
      );

      if (!updateResult.success || !updateResult.data) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada o sin permisos'));
        return;
      }

  logger.info('Tarea actualizada', { usuarioId, tareaId });
      res.json(ApiResponse.success(updateResult.data, 'Tarea actualizada exitosamente'));

    } catch (error) {
      logger.error('Error actualizando tarea', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Eliminar tarea (soft delete)
   * DELETE /api/v1/tareas/:id
   * Roles: admin, usuario que creó la tarea
   */
  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tareaId = parseInt((req.params['id'] as string) || '');
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(tareaId)) {
        res.status(400).json(ApiResponse.error('ID de tarea inválido'));
        return;
      }

      const delResult = await TareaService.deleteTarea(tareaId, usuarioId, userRole);

      if (!delResult.success || !delResult.data) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada o sin permisos'));
        return;
      }

  logger.info('Tarea eliminada', { usuarioId, tareaId });
      res.json(ApiResponse.success(null, 'Tarea eliminada exitosamente'));

    } catch (error) {
      logger.error('Error eliminando tarea', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // GESTIÓN DE ESTADO
  // ====================================

  /**
   * Marcar tarea como completada
   * POST /api/v1/tareas/:id/completar
   * Roles: usuario asignado, admin, creador de la tarea
   */
  static async completar(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const req = _req; // para tipos
      const tareaId = parseInt((req.params['id'] as string) || '');
      const { observacionesComplecion } = req.body;
      const usuarioId = req.user!.id;

      if (isNaN(tareaId)) {
        res.status(400).json(ApiResponse.error('ID de tarea inválido'));
        return;
      }

      const result = await TareaService.completarTarea(
        tareaId,
        observacionesComplecion,
        usuarioId
      );

      if (!result.success || !result.data) {
        res.status(400).json(ApiResponse.error(result.error || 'No se pudo completar la tarea'));
        return;
      }

  logger.info('Tarea completada', { usuarioId, tareaId });
      res.json(ApiResponse.success(result.data, 'Tarea completada exitosamente'));
    } catch (error) {
      logger.error('Error completando tarea', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Cambiar estado de tarea
   * PUT /api/v1/tareas/:id/estado
   * Roles: usuario asignado, admin, creador de la tarea
   */
  static async cambiarEstado(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const tareaId = parseInt((req.params['id'] as string) || '');
  const { nuevoEstado } = req.body;
      const usuarioId = req.user!.id;

      if (isNaN(tareaId) || !nuevoEstado) {
        res.status(400).json(ApiResponse.error('ID de tarea y nuevo estado son requeridos'));
        return;
      }

      const estadosValidos = ['pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida'];
      if (!estadosValidos.includes(nuevoEstado)) {
        res.status(400).json(ApiResponse.error('Estado inválido'));
        return;
      }

      const changeResult = await TareaService.cambiarEstadoTarea(
        tareaId,
        nuevoEstado as any,
        usuarioId
      );

      if (!changeResult.success || !changeResult.data) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada o sin permisos'));
        return;
      }

  logger.info('Estado de tarea cambiado', { usuarioId, tareaId, nuevoEstado });
      res.json(ApiResponse.success(changeResult.data, 'Estado de tarea actualizado exitosamente'));

    } catch (error) {
      logger.error('Error cambiando estado de tarea', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // ASIGNACIÓN DE TAREAS
  // ====================================

  /**
   * Asignar tarea a usuario
   * PUT /api/v1/tareas/:id/asignar
   * Roles: admin, creador de la tarea, capataz
   */
  static async asignar(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const req = _req;
      const tareaId = parseInt((req.params['id'] as string) || '');
      const { asignadoAUsuarioId, observaciones } = req.body;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(tareaId) || !asignadoAUsuarioId) {
        res.status(400).json(ApiResponse.error('ID de tarea y usuario asignado son requeridos'));
        return;
      }

      const result = await TareaService.asignarTarea(
        tareaId,
        asignadoAUsuarioId,
        usuarioId,
        userRole,
        observaciones
      );

      if (!result.success || !result.data) {
        res.status(400).json(ApiResponse.error(result.error || 'No se pudo asignar la tarea'));
        return;
      }

  logger.info('Tarea asignada', { usuarioId, tareaId, asignadoAUsuarioId });
      res.json(ApiResponse.success(result.data, 'Tarea asignada exitosamente'));
    } catch (error) {
      logger.error('Error asignando tarea', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // TAREAS RECURRENTES
  // ====================================

  /**
   * Crear tarea recurrente
   * POST /api/v1/tareas/recurrente
   * Roles: admin, establecimiento, capataz, veterinario
   */
  static async createRecurrente(_req: AuthenticatedRequest, res: Response): Promise<void> {
    // No implementado aún en el servicio. Evitar errores de compilación.
    res.status(501).json(ApiResponse.error('No implementado'));
  }

  // ====================================
  // REPORTES Y DASHBOARDS
  // ====================================

  /**
   * Obtener tareas pendientes del usuario
   * GET /api/v1/tareas/mis-tareas?estado=pendiente&prioridad=alta
   * Roles: todos los autenticados
   */
  static async getMisTareas(_req: AuthenticatedRequest, res: Response): Promise<void> {
    // No implementado aún en el servicio. Evitar errores de compilación.
    res.status(501).json(ApiResponse.error('No implementado'));
  }

  /**
   * Obtener tareas vencidas
   * GET /api/v1/tareas/vencidas?establecimiento=1
   * Roles: admin, establecimiento, capataz
   */
  static async getTareasVencidas(_req: AuthenticatedRequest, res: Response): Promise<void> {
    // No implementado aún en el servicio. Evitar errores de compilación.
    res.status(501).json(ApiResponse.error('No implementado'));
  }

  /**
   * Obtener estadísticas de tareas
   * GET /api/v1/tareas/estadisticas?establecimiento=1&periodo=mes
   * Roles: admin, establecimiento, capataz
   */
  static async getEstadisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = req.query['establecimiento'] ? parseInt(req.query['establecimiento'] as string) : undefined;
      const usuarioId = req.user!.id;

      const statsResult = await TareaService.getTareaStats(establecimientoId, usuarioId);
      if (!statsResult.success || !statsResult.data) {
        res.status(500).json(ApiResponse.error(statsResult.error || 'Error obteniendo estadísticas'));
        return;
      }

      res.json(ApiResponse.success(statsResult.data));

    } catch (error) {
      logger.error('Error obteniendo estadísticas de tareas', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener resumen de productividad
   * GET /api/v1/tareas/productividad?usuario=123&fechaInicio=2024-01-01&fechaFin=2024-12-31
   * Roles: admin, el propio usuario
   */
  static async getProductividad(_req: AuthenticatedRequest, res: Response): Promise<void> {
    // No implementado aún en el servicio. Evitar errores de compilación.
    res.status(501).json(ApiResponse.error('No implementado'));
  }
}