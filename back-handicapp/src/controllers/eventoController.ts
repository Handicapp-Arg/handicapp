// src/controllers/eventoController.ts
// -----------------------------------------------------------------------------
// HandicApp API - Controller de Eventos
// -----------------------------------------------------------------------------

import { Response } from 'express';
import { EventoService } from '../services/eventoService';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class EventoController {

  // ====================================
  // CRUD BÁSICO
  // ====================================

  /**
   * Crear nuevo evento
   * POST /api/v1/eventos
   * Roles: admin, establecimiento, veterinario
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        titulo,
        descripcion,
        fecha_evento,
        tipo_evento_id,
        caballo_id,
        establecimiento_id,
        costo_monto,
        costo_moneda
      } = req.body;
      
      const usuarioId = req.user!.id;

      // Validaciones básicas
      if (!fecha_evento || !tipo_evento_id || !caballo_id) {
        res.status(400).json(ApiResponse.error('Fecha, tipo de evento y caballo son requeridos'));
        return;
      }

      const createData = {
        titulo,
        descripcion,
        fecha_evento: new Date(fecha_evento),
        tipo_evento_id,
        caballo_id,
        establecimiento_id,
        costo_monto,
        costo_moneda
      } as any;

      const eventoResult = await EventoService.createEvento(createData, usuarioId, req.user!.rol?.clave);

      if (!eventoResult.success || !eventoResult.data) {
        res.status(400).json(ApiResponse.error(eventoResult.error || 'No se pudo crear el evento'));
        return;
      }

      logger.info(`Evento creado: ${eventoResult.data.id}`);
      res.status(201).json(ApiResponse.success(eventoResult.data, 'Evento creado exitosamente'));

    } catch (error: any) {
      logger.error('Error creando evento', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener todos los eventos con paginación y filtros
   * GET /api/v1/eventos?page=1&limit=10&caballo=1&tipo=1&fechaInicio=2024-01-01&fechaFin=2024-12-31
   * Roles: todos los autenticados
   */
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const page = parseInt((req.query['page'] as string) || '') || 1;
  const limit = parseInt((req.query['limit'] as string) || '') || 10;
  const caballoId = req.query['caballo'] ? parseInt(req.query['caballo'] as string) : undefined;
  const tipoEventoId = req.query['tipo'] ? parseInt(req.query['tipo'] as string) : undefined;
  const establecimientoId = req.query['establecimiento'] ? parseInt(req.query['establecimiento'] as string) : undefined;
  const fechaInicio = req.query['fechaInicio'] as string | undefined;
  const fechaFin = req.query['fechaFin'] as string | undefined;
  const veterinarioId = req.query['veterinario'] ? parseInt(req.query['veterinario'] as string) : undefined;
     const usuarioId = req.user!.id;
     const userRole = req.user!.rol?.clave;

      const filterPayload: any = { page, limit, usuarioId, userRole };
      if (caballoId) filterPayload.caballoId = caballoId;
      if (tipoEventoId) filterPayload.tipoEventoId = tipoEventoId;
      if (establecimientoId) filterPayload.establecimientoId = establecimientoId;
      if (fechaInicio) filterPayload.fechaInicio = fechaInicio;
      if (fechaFin) filterPayload.fechaFin = fechaFin;
      if (veterinarioId) filterPayload.veterinarioId = veterinarioId;

      const result = await EventoService.getAllEventos(filterPayload);

      if (!result.success || !result.data) {
        res.status(500).json(ApiResponse.error(result.error || 'Error al obtener eventos'));
        return;
      }

      res.json({
        success: true,
        message: 'Success',
        data: result.data.eventos,
        meta: { page, limit, total: result.data.total, totalPages: result.data.totalPages },
      });

    } catch (error: any) {
      logger.error('Error obteniendo eventos', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener evento por ID
   * GET /api/v1/eventos/:id
   * Roles: usuarios con acceso al evento
   */
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const eventoId = parseInt(req.params['id'] as string);

      if (isNaN(eventoId)) {
        res.status(400).json(ApiResponse.error('ID de evento inválido'));
        return;
      }

      const evento = await EventoService.getEventoById(eventoId);

      if (!evento) {
        res.status(404).json(ApiResponse.error('Evento no encontrado'));
        return;
      }

      res.json(ApiResponse.success(evento));

    } catch (error: any) {
      logger.error('Error obteniendo evento', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Actualizar evento
   * PUT /api/v1/eventos/:id
   * Roles: admin, veterinario que creó el evento, usuario autorizado
   */
  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const eventoId = parseInt(req.params['id'] as string);
  const usuarioId = req.user!.id;
      const updateData = req.body;

      if (isNaN(eventoId)) {
        res.status(400).json(ApiResponse.error('ID de evento inválido'));
        return;
      }

      const evento = await EventoService.updateEvento(
        eventoId,
        updateData,
        usuarioId
      );
      if (!evento) {
        res.status(404).json(ApiResponse.error('Evento no encontrado o sin permisos'));
        return;
      }

  logger.info(`Evento actualizado: ${eventoId}`);
      res.json(ApiResponse.success(evento, 'Evento actualizado exitosamente'));

    } catch (error: any) {
      logger.error('Error actualizando evento', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Eliminar evento (soft delete)
   * DELETE /api/v1/eventos/:id
   * Roles: admin, veterinario que creó el evento
   */
  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const eventoId = parseInt(req.params['id'] as string);
  const usuarioId = req.user!.id;

      if (isNaN(eventoId)) {
        res.status(400).json(ApiResponse.error('ID de evento inválido'));
        return;
      }

  const success = await EventoService.deleteEvento(eventoId, usuarioId);

      if (!success) {
        res.status(404).json(ApiResponse.error('Evento no encontrado o sin permisos'));
        return;
      }

  logger.info(`Evento eliminado: ${eventoId}`);
      res.json(ApiResponse.success(null, 'Evento eliminado exitosamente'));

    } catch (error: any) {
      logger.error('Error eliminando evento', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // TIPOS DE EVENTO
  // ====================================

  /**
   * Obtener tipos de eventos disponibles
   * GET /api/v1/eventos/tipos
   * Roles: todos los autenticados
   */
  static async getTipos(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const tipos = await EventoService.getTiposEvento();

      res.json(ApiResponse.success(tipos));

    } catch (error: any) {
      logger.error('Error obteniendo tipos de eventos', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // HISTORIAL MÉDICO
  // ====================================

  /**
   * Obtener historial médico completo de un caballo
   * GET /api/v1/eventos/historial-medico/caballo/:caballoId
   * Roles: propietario, veterinario autorizado
   */
  static async getHistorialMedico(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['caballoId'] as string);

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      // Usamos getEventosByCaballo como historial básico por ahora
      const historialResult = await EventoService.getEventosByCaballo(caballoId, { page: 1, limit: 100 });
      if (!historialResult.success || !historialResult.data) {
        res.status(404).json(ApiResponse.error(historialResult.error || 'Historial no disponible'));
        return;
      }

      res.json(ApiResponse.success(historialResult.data.eventos));

    } catch (error: any) {
      logger.error('Error obteniendo historial médico', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // EVENTOS PROGRAMADOS
  // ====================================

  /**
   * Obtener eventos programados (próximos)
   * GET /api/v1/eventos/programados?dias=30&establecimiento=1
   * Roles: todos los autenticados
   */
  static async getProgramados(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Método no implementado en el servicio; responder 501 por ahora
      res.status(501).json(ApiResponse.error('Endpoint no implementado'));

    } catch (error: any) {
      logger.error('Error obteniendo eventos programados', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // REPORTES Y ESTADÍSTICAS
  // ====================================

  /**
   * Obtener reporte de eventos por periodo
   * GET /api/v1/eventos/reporte?fechaInicio=2024-01-01&fechaFin=2024-12-31&establecimiento=1
   * Roles: admin, establecimiento autorizado
   */
  static async getReporte(_req: AuthenticatedRequest, res: Response): Promise<void> {
    // No implementado en el servicio
    res.status(501).json(ApiResponse.error('Endpoint no implementado'));
  }

  /**
   * Obtener estadísticas de eventos
   * GET /api/v1/eventos/estadisticas?establecimiento=1&periodo=mes
   * Roles: admin, establecimiento autorizado
   */
  static async getEstadisticas(_req: AuthenticatedRequest, res: Response): Promise<void> {
    // No implementado en el servicio
    res.status(501).json(ApiResponse.error('Endpoint no implementado'));
  }

  // ====================================
  // ADJUNTOS
  // ====================================

  /**
   * Agregar adjunto a evento
   * POST /api/v1/eventos/:id/adjuntos
   * Roles: veterinario que creó el evento, admin
   */
  static async addAdjunto(_req: AuthenticatedRequest, res: Response): Promise<void> {
    // No implementado en el servicio
    res.status(501).json(ApiResponse.error('Endpoint no implementado'));
  }

  /**
   * Obtener adjuntos de un evento
   * GET /api/v1/eventos/:id/adjuntos
   * Roles: usuarios con acceso al evento
   */
  static async getAdjuntos(_req: AuthenticatedRequest, res: Response): Promise<void> {
    // No implementado en el servicio
    res.status(501).json(ApiResponse.error('Endpoint no implementado'));
  }
}