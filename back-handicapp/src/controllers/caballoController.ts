// src/controllers/caballoController.ts
// -----------------------------------------------------------------------------
// HandicApp API - Controller de Caballos
// -----------------------------------------------------------------------------

import { Request, Response } from 'express';
import { CaballoService } from '../services/caballoService';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class CaballoController {

  // ====================================
  // CRUD BÁSICO
  // ====================================

  /**
   * Crear nuevo caballo
   * POST /api/v1/caballos
   * Roles: admin, establecimiento, propietario, veterinario
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        nombre,
        raza,
        sexo,
        fechaNacimiento,
        color,
        alzada,
        peso,
        chip,
        pasaporte,
        establecimientoId,
        propietarioId,
        padreId,
        madreId,
        observaciones
      } = req.body;
      
      const usuarioId = req.user!.id;

      // Validaciones básicas
      if (!nombre || !raza || !sexo || !fechaNacimiento) {
        res.status(400).json(ApiResponse.error('Nombre, raza, sexo y fecha de nacimiento son requeridos'));
        return;
      }

      const caballo = await CaballoService.createCaballo({
        nombre,
        raza,
        sexo,
        fechaNacimiento,
        color,
        alzada,
        peso,
        chip,
        pasaporte,
        establecimientoId,
        propietarioId,
        padreId,
        madreId,
        observaciones,
        creadoPorUsuarioId: usuarioId
      });

      logger.info(`Caballo creado: ${caballo.id}`, { usuarioId, caballo: caballo.nombre });
      res.status(201).json(ApiResponse.success(caballo, 'Caballo creado exitosamente'));

    } catch (error) {
      logger.error('Error creando caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener todos los caballos con paginación y filtros
   * GET /api/v1/caballos?page=1&limit=10&search=nombre&establecimiento=1&raza=SPC
   * Roles: todos los autenticados
   */
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const establecimientoId = req.query.establecimiento ? parseInt(req.query.establecimiento as string) : undefined;
      const raza = req.query.raza as string;
      const sexo = req.query.sexo as string;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const result = await CaballoService.getAllCaballos({
        page,
        limit,
        search,
        establecimientoId,
        raza,
        sexo,
        usuarioId,
        userRole
      });

      res.json(ApiResponse.success(result));

    } catch (error) {
      logger.error('Error obteniendo caballos:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener caballo por ID
   * GET /api/v1/caballos/:id
   * Roles: usuarios con acceso al caballo
   */
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const caballo = await CaballoService.getCaballoById(
        caballoId,
        usuarioId,
        userRole
      );

      if (!caballo) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado'));
        return;
      }

      res.json(ApiResponse.success(caballo));

    } catch (error) {
      logger.error('Error obteniendo caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Actualizar caballo
   * PUT /api/v1/caballos/:id
   * Roles: admin, propietario del caballo, veterinario autorizado
   */
  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;
      const updateData = req.body;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const caballo = await CaballoService.updateCaballo(
        caballoId,
        updateData,
        usuarioId,
        userRole
      );

      if (!caballo) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      logger.info(`Caballo actualizado: ${caballoId}`, { usuarioId });
      res.json(ApiResponse.success(caballo, 'Caballo actualizado exitosamente'));

    } catch (error) {
      logger.error('Error actualizando caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Eliminar caballo (soft delete)
   * DELETE /api/v1/caballos/:id
   * Roles: admin únicamente
   */
  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      // Solo admins pueden eliminar caballos
      if (userRole !== 'admin') {
        res.status(403).json(ApiResponse.error('No tiene permisos para eliminar caballos'));
        return;
      }

      const success = await CaballoService.deleteCaballo(caballoId);

      if (!success) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado'));
        return;
      }

      logger.info(`Caballo eliminado: ${caballoId}`, { usuarioId });
      res.json(ApiResponse.success(null, 'Caballo eliminado exitosamente'));

    } catch (error) {
      logger.error('Error eliminando caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // GESTIÓN DE PROPIETARIOS
  // ====================================

  /**
   * Agregar propietario a caballo
   * POST /api/v1/caballos/:id/propietarios
   * Roles: admin, propietario actual del caballo
   */
  static async addPropietario(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const { propietarioId, fechaInicio, porcentaje } = req.body;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId) || !propietarioId) {
        res.status(400).json(ApiResponse.error('Datos requeridos: propietarioId'));
        return;
      }

      const propietario = await CaballoService.addPropietarioToCaballo(
        caballoId,
        propietarioId,
        fechaInicio,
        porcentaje || 100,
        usuarioId,
        userRole
      );

      if (!propietario) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      logger.info(`Propietario ${propietarioId} agregado a caballo ${caballoId}`, { usuarioId });
      res.status(201).json(ApiResponse.success(propietario, 'Propietario agregado al caballo exitosamente'));

    } catch (error) {
      logger.error('Error agregando propietario a caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener propietarios del caballo
   * GET /api/v1/caballos/:id/propietarios
   * Roles: usuarios con acceso al caballo
   */
  static async getPropietarios(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const propietarios = await CaballoService.getCaballoPropietarios(
        caballoId,
        usuarioId,
        userRole
      );

      if (!propietarios) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(propietarios));

    } catch (error) {
      logger.error('Error obteniendo propietarios del caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // GENEALOGÍA
  // ====================================

  /**
   * Obtener pedigrí del caballo
   * GET /api/v1/caballos/:id/pedigree?generations=3
   * Roles: usuarios con acceso al caballo
   */
  static async getPedigree(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const generations = parseInt(req.query.generations as string) || 3;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const pedigree = await CaballoService.getCaballoPedigree(
        caballoId,
        generations,
        usuarioId,
        userRole
      );

      if (!pedigree) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(pedigree));

    } catch (error) {
      logger.error('Error obteniendo pedigrí del caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener descendencia del caballo
   * GET /api/v1/caballos/:id/descendencia
   * Roles: usuarios con acceso al caballo
   */
  static async getDescendencia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const descendencia = await CaballoService.getCaballoDescendencia(
        caballoId,
        usuarioId,
        userRole
      );

      if (!descendencia) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(descendencia));

    } catch (error) {
      logger.error('Error obteniendo descendencia del caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // HISTORIAL MÉDICO
  // ====================================

  /**
   * Obtener historial médico del caballo
   * GET /api/v1/caballos/:id/historial-medico
   * Roles: propietario, veterinario autorizado
   */
  static async getHistorialMedico(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const historial = await CaballoService.getCaballoHistorialMedico(
        caballoId,
        usuarioId,
        userRole
      );

      if (!historial) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(historial));

    } catch (error) {
      logger.error('Error obteniendo historial médico del caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // CAMBIO DE ESTABLECIMIENTO
  // ====================================

  /**
   * Mover caballo a otro establecimiento
   * POST /api/v1/caballos/:id/mover-establecimiento
   * Roles: admin, propietario del caballo
   */
  static async moverEstablecimiento(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const { nuevoEstablecimientoId, fechaCambio, motivo } = req.body;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId) || !nuevoEstablecimientoId) {
        res.status(400).json(ApiResponse.error('Datos requeridos: nuevoEstablecimientoId'));
        return;
      }

      const resultado = await CaballoService.moverCaballoEstablecimiento(
        caballoId,
        nuevoEstablecimientoId,
        fechaCambio,
        motivo,
        usuarioId,
        userRole
      );

      if (!resultado) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      logger.info(`Caballo ${caballoId} movido a establecimiento ${nuevoEstablecimientoId}`, { usuarioId });
      res.json(ApiResponse.success(resultado, 'Caballo movido exitosamente'));

    } catch (error) {
      logger.error('Error moviendo caballo de establecimiento:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // ESTADÍSTICAS
  // ====================================

  /**
   * Obtener estadísticas del caballo
   * GET /api/v1/caballos/:id/estadisticas
   * Roles: usuarios con acceso al caballo
   */
  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params.id);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const stats = await CaballoService.getCaballoStats(
        caballoId,
        usuarioId,
        userRole
      );

      if (!stats) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(stats));

    } catch (error) {
      logger.error('Error obteniendo estadísticas del caballo:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }
}