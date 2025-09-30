// src/controllers/tareaController.ts
// -----------------------------------------------------------------------------
// HandicApp API - Controller de Tareas
// -----------------------------------------------------------------------------

import { Request, Response } from 'express';
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
        prioridad,
        estado,
        asignadoAUsuarioId,
        caballoId,
        establecimientoId,
        categoria,
        frecuencia,
        instrucciones,
        observaciones
      } = req.body;
      
      const usuarioId = req.user!.id;

      // Validaciones básicas
      if (!titulo || !descripcion || !fechaVencimiento) {
        res.status(400).json(ApiResponse.error('Título, descripción y fecha de vencimiento son requeridos'));
        return;
      }

      const tarea = await TareaService.createTarea({
        titulo,
        descripcion,
        fechaVencimiento,
        prioridad: prioridad || 'media',
        estado: estado || 'pendiente',
        asignadoAUsuarioId,
        caballoId,
        establecimientoId,
        categoria,
        frecuencia,
        instrucciones,
        observaciones,
        creadoPorUsuarioId: usuarioId
      });

      logger.info(`Tarea creada: ${tarea.id}`, { usuarioId, tarea: tarea.titulo });
      res.status(201).json(ApiResponse.success(tarea, 'Tarea creada exitosamente'));

    } catch (error) {
      logger.error('Error creando tarea:', error);
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const estado = req.query.estado as string;
      const prioridad = req.query.prioridad as string;
      const categoria = req.query.categoria as string;
      const asignadoAUsuarioId = req.query.asignado ? parseInt(req.query.asignado as string) : undefined;
      const caballoId = req.query.caballo ? parseInt(req.query.caballo as string) : undefined;
      const establecimientoId = req.query.establecimiento ? parseInt(req.query.establecimiento as string) : undefined;
      const fechaVencimientoInicio = req.query.fechaInicio as string;
      const fechaVencimientoFin = req.query.fechaFin as string;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const result = await TareaService.getAllTareas({
        page,
        limit,
        estado,
        prioridad,
        categoria,
        asignadoAUsuarioId,
        caballoId,
        establecimientoId,
        fechaVencimientoInicio,
        fechaVencimientoFin,
        usuarioId,
        userRole
      });

      res.json(ApiResponse.success(result));

    } catch (error) {
      logger.error('Error obteniendo tareas:', error);
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
      const tareaId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(tareaId)) {
        res.status(400).json(ApiResponse.error('ID de tarea inválido'));
        return;
      }

      const tarea = await TareaService.getTareaById(
        tareaId,
        usuarioId,
        userRole
      );

      if (!tarea) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada'));
        return;
      }

      res.json(ApiResponse.success(tarea));

    } catch (error) {
      logger.error('Error obteniendo tarea:', error);
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
      const tareaId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;
      const updateData = req.body;

      if (isNaN(tareaId)) {
        res.status(400).json(ApiResponse.error('ID de tarea inválido'));
        return;
      }

      const tarea = await TareaService.updateTarea(
        tareaId,
        updateData,
        usuarioId,
        userRole
      );

      if (!tarea) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada o sin permisos'));
        return;
      }

      logger.info(`Tarea actualizada: ${tareaId}`, { usuarioId });
      res.json(ApiResponse.success(tarea, 'Tarea actualizada exitosamente'));

    } catch (error) {
      logger.error('Error actualizando tarea:', error);
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
      const tareaId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(tareaId)) {
        res.status(400).json(ApiResponse.error('ID de tarea inválido'));
        return;
      }

      const success = await TareaService.deleteTarea(tareaId, usuarioId, userRole);

      if (!success) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada o sin permisos'));
        return;
      }

      logger.info(`Tarea eliminada: ${tareaId}`, { usuarioId });
      res.json(ApiResponse.success(null, 'Tarea eliminada exitosamente'));

    } catch (error) {
      logger.error('Error eliminando tarea:', error);
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
  static async completar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tareaId = parseInt(req.params.id);
      const { observacionesComplecion, adjuntos } = req.body;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(tareaId)) {
        res.status(400).json(ApiResponse.error('ID de tarea inválido'));
        return;
      }

      const tarea = await TareaService.completarTarea(
        tareaId,
        observacionesComplecion,
        adjuntos,
        usuarioId,
        userRole
      );

      if (!tarea) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada o sin permisos'));
        return;
      }

      logger.info(`Tarea completada: ${tareaId}`, { usuarioId });
      res.json(ApiResponse.success(tarea, 'Tarea completada exitosamente'));

    } catch (error) {
      logger.error('Error completando tarea:', error);
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
      const tareaId = parseInt(req.params.id);
      const { nuevoEstado, observaciones } = req.body;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(tareaId) || !nuevoEstado) {
        res.status(400).json(ApiResponse.error('ID de tarea y nuevo estado son requeridos'));
        return;
      }

      const estadosValidos = ['pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida'];
      if (!estadosValidos.includes(nuevoEstado)) {
        res.status(400).json(ApiResponse.error('Estado inválido'));
        return;
      }

      const tarea = await TareaService.cambiarEstadoTarea(
        tareaId,
        nuevoEstado,
        observaciones,
        usuarioId,
        userRole
      );

      if (!tarea) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada o sin permisos'));
        return;
      }

      logger.info(`Estado de tarea cambiado: ${tareaId} -> ${nuevoEstado}`, { usuarioId });
      res.json(ApiResponse.success(tarea, 'Estado de tarea actualizado exitosamente'));

    } catch (error) {
      logger.error('Error cambiando estado de tarea:', error);
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
  static async asignar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tareaId = parseInt(req.params.id);
      const { asignadoAUsuarioId, observaciones } = req.body;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(tareaId) || !asignadoAUsuarioId) {
        res.status(400).json(ApiResponse.error('ID de tarea y usuario asignado son requeridos'));
        return;
      }

      const tarea = await TareaService.asignarTarea(
        tareaId,
        asignadoAUsuarioId,
        observaciones,
        usuarioId,
        userRole
      );

      if (!tarea) {
        res.status(404).json(ApiResponse.error('Tarea no encontrada o sin permisos'));
        return;
      }

      logger.info(`Tarea asignada: ${tareaId} -> usuario ${asignadoAUsuarioId}`, { usuarioId });
      res.json(ApiResponse.success(tarea, 'Tarea asignada exitosamente'));

    } catch (error) {
      logger.error('Error asignando tarea:', error);
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
  static async createRecurrente(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        titulo,
        descripcion,
        frecuencia, // diaria, semanal, mensual, anual
        diasSemana, // para frecuencia semanal: [1,2,3,4,5] (lun-vie)
        diaMes, // para frecuencia mensual: 15 (día del mes)
        fechaInicio,
        fechaFin,
        prioridad,
        asignadoAUsuarioId,
        caballoId,
        establecimientoId,
        categoria,
        instrucciones
      } = req.body;
      
      const usuarioId = req.user!.id;

      // Validaciones básicas
      if (!titulo || !descripcion || !frecuencia || !fechaInicio) {
        res.status(400).json(ApiResponse.error('Título, descripción, frecuencia y fecha de inicio son requeridos'));
        return;
      }

      const tareas = await TareaService.createTareaRecurrente({
        titulo,
        descripcion,
        frecuencia,
        diasSemana,
        diaMes,
        fechaInicio,
        fechaFin,
        prioridad: prioridad || 'media',
        asignadoAUsuarioId,
        caballoId,
        establecimientoId,
        categoria,
        instrucciones,
        creadoPorUsuarioId: usuarioId
      });

      logger.info(`Tareas recurrentes creadas: ${tareas.length}`, { usuarioId, titulo });
      res.status(201).json(ApiResponse.success(tareas, `${tareas.length} tareas recurrentes creadas exitosamente`));

    } catch (error) {
      logger.error('Error creando tareas recurrentes:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // REPORTES Y DASHBOARDS
  // ====================================

  /**
   * Obtener tareas pendientes del usuario
   * GET /api/v1/tareas/mis-tareas?estado=pendiente&prioridad=alta
   * Roles: todos los autenticados
   */
  static async getMisTareas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user!.id;
      const estado = req.query.estado as string;
      const prioridad = req.query.prioridad as string;
      const categoria = req.query.categoria as string;

      const tareas = await TareaService.getTareasUsuario(
        usuarioId,
        estado,
        prioridad,
        categoria
      );

      res.json(ApiResponse.success(tareas));

    } catch (error) {
      logger.error('Error obteniendo mis tareas:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener tareas vencidas
   * GET /api/v1/tareas/vencidas?establecimiento=1
   * Roles: admin, establecimiento, capataz
   */
  static async getTareasVencidas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = req.query.establecimiento ? parseInt(req.query.establecimiento as string) : undefined;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const tareas = await TareaService.getTareasVencidas(
        establecimientoId,
        usuarioId,
        userRole
      );

      res.json(ApiResponse.success(tareas));

    } catch (error) {
      logger.error('Error obteniendo tareas vencidas:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener estadísticas de tareas
   * GET /api/v1/tareas/estadisticas?establecimiento=1&periodo=mes
   * Roles: admin, establecimiento, capataz
   */
  static async getEstadisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = req.query.establecimiento ? parseInt(req.query.establecimiento as string) : undefined;
      const periodo = req.query.periodo as string || 'mes';
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const estadisticas = await TareaService.getEstadisticasTareas(
        establecimientoId,
        periodo,
        usuarioId,
        userRole
      );

      res.json(ApiResponse.success(estadisticas));

    } catch (error) {
      logger.error('Error obteniendo estadísticas de tareas:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener resumen de productividad
   * GET /api/v1/tareas/productividad?usuario=123&fechaInicio=2024-01-01&fechaFin=2024-12-31
   * Roles: admin, el propio usuario
   */
  static async getProductividad(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const targetUserId = req.query.usuario ? parseInt(req.query.usuario as string) : req.user!.id;
      const fechaInicio = req.query.fechaInicio as string;
      const fechaFin = req.query.fechaFin as string;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      // Solo admin o el propio usuario pueden ver productividad
      if (userRole !== 'admin' && targetUserId !== usuarioId) {
        res.status(403).json(ApiResponse.error('No tiene permisos para ver esta información'));
        return;
      }

      const productividad = await TareaService.getProductividadUsuario(
        targetUserId,
        fechaInicio,
        fechaFin
      );

      res.json(ApiResponse.success(productividad));

    } catch (error) {
      logger.error('Error obteniendo productividad:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }
}