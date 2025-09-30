// src/controllers/establecimientoController.ts
// -----------------------------------------------------------------------------
// HandicApp API - Controller de Establecimientos
// -----------------------------------------------------------------------------

import { Response } from 'express';
import { EstablecimientoService } from '../services/establecimientoService';
import { logger } from '../utils/logger';
import { ResponseHelper } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class EstablecimientoController {

  // ====================================
  // CRUD BÁSICO
  // ====================================

  /**
   * Crear nuevo establecimiento
   * POST /api/v1/establecimientos
   * Roles: admin, establecimiento
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { nombre, direccion, telefono, email, descripcion } = req.body;
      const usuarioId = req.user!.id;

      // Validaciones básicas
      if (!nombre || !direccion) {
        res.status(400).json(ApiResponse.error('Nombre y dirección son requeridos'));
        return;
      }

      const establecimiento = await EstablecimientoService.createEstablecimiento({
        nombre,
        direccion,
        telefono,
        email,
        descripcion,
        creadoPorUsuarioId: usuarioId
      });

      logger.info(`Establecimiento creado: ${establecimiento.id}`, { usuarioId, establecimiento: establecimiento.nombre });
      res.status(201).json(ApiResponse.success(establecimiento, 'Establecimiento creado exitosamente'));

    } catch (error) {
      logger.error('Error creando establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener todos los establecimientos con paginación
   * GET /api/v1/establecimientos?page=1&limit=10&search=nombre
   * Roles: todos los autenticados
   */
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const result = await EstablecimientoService.getAllEstablecimientos({
        page,
        limit,
        search,
        usuarioId,
        userRole
      });

      res.json(ApiResponse.success(result));

    } catch (error) {
      logger.error('Error obteniendo establecimientos:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener establecimiento por ID
   * GET /api/v1/establecimientos/:id
   * Roles: usuarios con acceso al establecimiento
   */
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(establecimientoId)) {
        res.status(400).json(ApiResponse.error('ID de establecimiento inválido'));
        return;
      }

      const establecimiento = await EstablecimientoService.getEstablecimientoById(
        establecimientoId,
        usuarioId,
        userRole
      );

      if (!establecimiento) {
        res.status(404).json(ApiResponse.error('Establecimiento no encontrado'));
        return;
      }

      res.json(ApiResponse.success(establecimiento));

    } catch (error) {
      logger.error('Error obteniendo establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Actualizar establecimiento
   * PUT /api/v1/establecimientos/:id
   * Roles: admin, propietario del establecimiento
   */
  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;
      const updateData = req.body;

      if (isNaN(establecimientoId)) {
        res.status(400).json(ApiResponse.error('ID de establecimiento inválido'));
        return;
      }

      const establecimiento = await EstablecimientoService.updateEstablecimiento(
        establecimientoId,
        updateData,
        usuarioId,
        userRole
      );

      if (!establecimiento) {
        res.status(404).json(ApiResponse.error('Establecimiento no encontrado o sin permisos'));
        return;
      }

      logger.info(`Establecimiento actualizado: ${establecimientoId}`, { usuarioId });
      res.json(ApiResponse.success(establecimiento, 'Establecimiento actualizado exitosamente'));

    } catch (error) {
      logger.error('Error actualizando establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Eliminar establecimiento (soft delete)
   * DELETE /api/v1/establecimientos/:id
   * Roles: admin únicamente
   */
  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(establecimientoId)) {
        res.status(400).json(ApiResponse.error('ID de establecimiento inválido'));
        return;
      }

      // Solo admins pueden eliminar establecimientos
      if (userRole !== 'admin') {
        res.status(403).json(ApiResponse.error('No tiene permisos para eliminar establecimientos'));
        return;
      }

      const success = await EstablecimientoService.deleteEstablecimiento(establecimientoId);

      if (!success) {
        res.status(404).json(ApiResponse.error('Establecimiento no encontrado'));
        return;
      }

      logger.info(`Establecimiento eliminado: ${establecimientoId}`, { usuarioId });
      res.json(ApiResponse.success(null, 'Establecimiento eliminado exitosamente'));

    } catch (error) {
      logger.error('Error eliminando establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // GESTIÓN DE MEMBRESÍAS
  // ====================================

  /**
   * Agregar usuario a establecimiento
   * POST /api/v1/establecimientos/:id/usuarios
   * Roles: admin, propietario del establecimiento
   */
  static async addUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params.id);
      const { usuarioId: targetUserId, rolEnEstablecimiento, fechaInicio } = req.body;
      const currentUserId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(establecimientoId) || !targetUserId || !rolEnEstablecimiento) {
        res.status(400).json(ApiResponse.error('Datos requeridos: usuarioId, rolEnEstablecimiento'));
        return;
      }

      const membresia = await EstablecimientoService.addUserToEstablecimiento(
        establecimientoId,
        targetUserId,
        rolEnEstablecimiento,
        fechaInicio,
        currentUserId,
        userRole
      );

      if (!membresia) {
        res.status(404).json(ApiResponse.error('Establecimiento no encontrado o sin permisos'));
        return;
      }

      logger.info(`Usuario ${targetUserId} agregado a establecimiento ${establecimientoId}`, { currentUserId });
      res.status(201).json(ApiResponse.success(membresia, 'Usuario agregado al establecimiento exitosamente'));

    } catch (error) {
      logger.error('Error agregando usuario a establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener usuarios del establecimiento
   * GET /api/v1/establecimientos/:id/usuarios
   * Roles: usuarios con acceso al establecimiento
   */
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(establecimientoId)) {
        res.status(400).json(ApiResponse.error('ID de establecimiento inválido'));
        return;
      }

      const usuarios = await EstablecimientoService.getEstablecimientoUsers(
        establecimientoId,
        usuarioId,
        userRole
      );

      if (!usuarios) {
        res.status(404).json(ApiResponse.error('Establecimiento no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(usuarios));

    } catch (error) {
      logger.error('Error obteniendo usuarios del establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Remover usuario del establecimiento
   * DELETE /api/v1/establecimientos/:id/usuarios/:userId
   * Roles: admin, propietario del establecimiento
   */
  static async removeUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params.id);
      const targetUserId = parseInt(req.params.userId);
      const currentUserId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(establecimientoId) || isNaN(targetUserId)) {
        res.status(400).json(ApiResponse.error('IDs inválidos'));
        return;
      }

      const success = await EstablecimientoService.removeUserFromEstablecimiento(
        establecimientoId,
        targetUserId,
        currentUserId,
        userRole
      );

      if (!success) {
        res.status(404).json(ApiResponse.error('Relación no encontrada o sin permisos'));
        return;
      }

      logger.info(`Usuario ${targetUserId} removido del establecimiento ${establecimientoId}`, { currentUserId });
      res.json(ApiResponse.success(null, 'Usuario removido del establecimiento exitosamente'));

    } catch (error) {
      logger.error('Error removiendo usuario del establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // CABALLOS DEL ESTABLECIMIENTO
  // ====================================

  /**
   * Obtener caballos del establecimiento
   * GET /api/v1/establecimientos/:id/caballos
   * Roles: usuarios con acceso al establecimiento
   */
  static async getCaballos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(establecimientoId)) {
        res.status(400).json(ApiResponse.error('ID de establecimiento inválido'));
        return;
      }

      const caballos = await EstablecimientoService.getEstablecimientoCaballos(
        establecimientoId,
        usuarioId,
        userRole
      );

      if (!caballos) {
        res.status(404).json(ApiResponse.error('Establecimiento no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(caballos));

    } catch (error) {
      logger.error('Error obteniendo caballos del establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // ESTADÍSTICAS
  // ====================================

  /**
   * Obtener estadísticas del establecimiento
   * GET /api/v1/establecimientos/:id/estadisticas
   * Roles: usuarios con acceso al establecimiento
   */
  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(establecimientoId)) {
        res.status(400).json(ApiResponse.error('ID de establecimiento inválido'));
        return;
      }

      const stats = await EstablecimientoService.getEstablecimientoStats(
        establecimientoId,
        usuarioId,
        userRole
      );

      if (!stats) {
        res.status(404).json(ApiResponse.error('Establecimiento no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(stats));

    } catch (error) {
      logger.error('Error obteniendo estadísticas del establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }
}