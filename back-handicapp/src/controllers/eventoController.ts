// src/controllers/eventoController.ts
// -----------------------------------------------------------------------------
// HandicApp API - Controller de Eventos
// -----------------------------------------------------------------------------

import { Request, Response } from 'express';
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
        fecha,
        tipoEventoId,
        caballoId,
        establecimientoId,
        descripcion,
        observaciones,
        veterinarioId,
        temperatura,
        peso,
        frecuenciaCardiaca,
        frecuenciaRespiratoria,
        resultados,
        costo,
        adjuntos
      } = req.body;
      
      const usuarioId = req.user!.id;

      // Validaciones básicas
      if (!fecha || !tipoEventoId || !caballoId) {
        res.status(400).json(ApiResponse.error('Fecha, tipo de evento y caballo son requeridos'));
        return;
      }

      const evento = await EventoService.createEvento({
        fecha,
        tipoEventoId,
        caballoId,
        establecimientoId,
        descripcion,
        observaciones,
        veterinarioId,
        temperatura,
        peso,
        frecuenciaCardiaca,
        frecuenciaRespiratoria,
        resultados,
        costo,
        adjuntos,
        creadoPorUsuarioId: usuarioId
      });

      logger.info(`Evento creado: ${evento.id}`, { usuarioId, evento: evento.tipoEvento?.nombre });
      res.status(201).json(ApiResponse.success(evento, 'Evento creado exitosamente'));

    } catch (error) {
      logger.error('Error creando evento:', error);
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const caballoId = req.query.caballo ? parseInt(req.query.caballo as string) : undefined;
      const tipoEventoId = req.query.tipo ? parseInt(req.query.tipo as string) : undefined;
      const establecimientoId = req.query.establecimiento ? parseInt(req.query.establecimiento as string) : undefined;
      const fechaInicio = req.query.fechaInicio as string;
      const fechaFin = req.query.fechaFin as string;
      const veterinarioId = req.query.veterinario ? parseInt(req.query.veterinario as string) : undefined;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const result = await EventoService.getAllEventos({
        page,
        limit,
        caballoId,
        tipoEventoId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        veterinarioId,
        usuarioId,
        userRole
      });

      res.json(ApiResponse.success(result));

    } catch (error) {
      logger.error('Error obteniendo eventos:', error);
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
      const eventoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(eventoId)) {
        res.status(400).json(ApiResponse.error('ID de evento inválido'));
        return;
      }

      const evento = await EventoService.getEventoById(
        eventoId,
        usuarioId,
        userRole
      );

      if (!evento) {
        res.status(404).json(ApiResponse.error('Evento no encontrado'));
        return;
      }

      res.json(ApiResponse.success(evento));

    } catch (error) {
      logger.error('Error obteniendo evento:', error);
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
      const eventoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;
      const updateData = req.body;

      if (isNaN(eventoId)) {
        res.status(400).json(ApiResponse.error('ID de evento inválido'));
        return;
      }

      const evento = await EventoService.updateEvento(
        eventoId,
        updateData,
        usuarioId,
        userRole
      );

      if (!evento) {
        res.status(404).json(ApiResponse.error('Evento no encontrado o sin permisos'));
        return;
      }

      logger.info(`Evento actualizado: ${eventoId}`, { usuarioId });
      res.json(ApiResponse.success(evento, 'Evento actualizado exitosamente'));

    } catch (error) {
      logger.error('Error actualizando evento:', error);
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
      const eventoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(eventoId)) {
        res.status(400).json(ApiResponse.error('ID de evento inválido'));
        return;
      }

      const success = await EventoService.deleteEvento(eventoId, usuarioId, userRole);

      if (!success) {
        res.status(404).json(ApiResponse.error('Evento no encontrado o sin permisos'));
        return;
      }

      logger.info(`Evento eliminado: ${eventoId}`, { usuarioId });
      res.json(ApiResponse.success(null, 'Evento eliminado exitosamente'));

    } catch (error) {
      logger.error('Error eliminando evento:', error);
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
  static async getTipos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const categoria = req.query.categoria as string;
      const activo = req.query.activo !== undefined ? req.query.activo === 'true' : undefined;

      const tipos = await EventoService.getTiposEvento(categoria, activo);

      res.json(ApiResponse.success(tipos));

    } catch (error) {
      logger.error('Error obteniendo tipos de eventos:', error);
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
      const caballoId = parseInt(req.params.caballoId);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;
      const fechaInicio = req.query.fechaInicio as string;
      const fechaFin = req.query.fechaFin as string;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const historial = await EventoService.getHistorialMedicoCaballo(
        caballoId,
        usuarioId,
        userRole,
        fechaInicio,
        fechaFin
      );

      if (!historial) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(historial));

    } catch (error) {
      logger.error('Error obteniendo historial médico:', error);
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
  static async getProgramados(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const dias = parseInt(req.query.dias as string) || 30;
      const establecimientoId = req.query.establecimiento ? parseInt(req.query.establecimiento as string) : undefined;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const eventos = await EventoService.getEventosProgramados(
        dias,
        establecimientoId,
        usuarioId,
        userRole
      );

      res.json(ApiResponse.success(eventos));

    } catch (error) {
      logger.error('Error obteniendo eventos programados:', error);
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
  static async getReporte(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const fechaInicio = req.query.fechaInicio as string;
      const fechaFin = req.query.fechaFin as string;
      const establecimientoId = req.query.establecimiento ? parseInt(req.query.establecimiento as string) : undefined;
      const tipoEventoId = req.query.tipo ? parseInt(req.query.tipo as string) : undefined;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (!fechaInicio || !fechaFin) {
        res.status(400).json(ApiResponse.error('Fecha de inicio y fin son requeridas'));
        return;
      }

      const reporte = await EventoService.getReporteEventos(
        fechaInicio,
        fechaFin,
        establecimientoId,
        tipoEventoId,
        usuarioId,
        userRole
      );

      res.json(ApiResponse.success(reporte));

    } catch (error) {
      logger.error('Error generando reporte de eventos:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener estadísticas de eventos
   * GET /api/v1/eventos/estadisticas?establecimiento=1&periodo=mes
   * Roles: admin, establecimiento autorizado
   */
  static async getEstadisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = req.query.establecimiento ? parseInt(req.query.establecimiento as string) : undefined;
      const periodo = req.query.periodo as string || 'mes'; // mes, año, semana
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const estadisticas = await EventoService.getEstadisticasEventos(
        establecimientoId,
        periodo,
        usuarioId,
        userRole
      );

      res.json(ApiResponse.success(estadisticas));

    } catch (error) {
      logger.error('Error obteniendo estadísticas de eventos:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // ADJUNTOS
  // ====================================

  /**
   * Agregar adjunto a evento
   * POST /api/v1/eventos/:id/adjuntos
   * Roles: veterinario que creó el evento, admin
   */
  static async addAdjunto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const eventoId = parseInt(req.params.id);
      const { nombre, descripcion, url, tipo } = req.body;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(eventoId) || !nombre || !url) {
        res.status(400).json(ApiResponse.error('Datos requeridos: nombre, url'));
        return;
      }

      const adjunto = await EventoService.addAdjuntoToEvento(
        eventoId,
        {
          nombre,
          descripcion,
          url,
          tipo,
          creadoPorUsuarioId: usuarioId
        },
        usuarioId,
        userRole
      );

      if (!adjunto) {
        res.status(404).json(ApiResponse.error('Evento no encontrado o sin permisos'));
        return;
      }

      logger.info(`Adjunto agregado a evento ${eventoId}`, { usuarioId });
      res.status(201).json(ApiResponse.success(adjunto, 'Adjunto agregado exitosamente'));

    } catch (error) {
      logger.error('Error agregando adjunto a evento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener adjuntos de un evento
   * GET /api/v1/eventos/:id/adjuntos
   * Roles: usuarios con acceso al evento
   */
  static async getAdjuntos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const eventoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(eventoId)) {
        res.status(400).json(ApiResponse.error('ID de evento inválido'));
        return;
      }

      const adjuntos = await EventoService.getEventoAdjuntos(
        eventoId,
        usuarioId,
        userRole
      );

      if (!adjuntos) {
        res.status(404).json(ApiResponse.error('Evento no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(adjuntos));

    } catch (error) {
      logger.error('Error obteniendo adjuntos del evento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }
}