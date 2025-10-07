// src/controllers/caballoController.ts
// -----------------------------------------------------------------------------
// HandicApp API - Controller de Caballos
// -----------------------------------------------------------------------------

import { Response } from 'express';
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
        fecha_nacimiento,
        pelaje,
        disciplina,
        microchip,
        foto_url,
        establecimiento_id,
        padre_id,
        madre_id,
      } = req.body;
      
      const usuarioId = req.user!.id;

      // Validaciones básicas
      if (!nombre || !sexo || !fecha_nacimiento) {
        res.status(400).json(ApiResponse.error('Nombre, raza, sexo y fecha de nacimiento son requeridos'));
        return;
      }

      const createResult = await CaballoService.createCaballo({
        nombre,
        raza,
        sexo,
        fecha_nacimiento: new Date(fecha_nacimiento),
        pelaje,
        disciplina,
        microchip,
        foto_url,
        establecimiento_id,
        padre_id,
        madre_id,
        creadoPorUsuarioId: usuarioId
      });

      if (!createResult.success || !createResult.data) {
        res.status(400).json(ApiResponse.error(createResult.error || 'No se pudo crear el caballo'));
        return;
      }

      logger.info(`Caballo creado: ${createResult.data.id} - ${createResult.data.nombre}`);
      res.status(201).json(ApiResponse.success(createResult.data, 'Caballo creado exitosamente'));

    } catch (error: any) {
      logger.error('Error creando caballo', { error });
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
  const page = parseInt((req.query['page'] as string) || '') || 1;
  const limit = parseInt((req.query['limit'] as string) || '') || 10;
  const search = req.query['search'] as string | undefined;
  const establecimientoId = req.query['establecimiento'] ? parseInt(req.query['establecimiento'] as string) : undefined;
  const raza = req.query['raza'] as string | undefined;
  const sexo = req.query['sexo'] as string | undefined;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const filterPayload: any = { page, limit, usuarioId, userRole };
      if (search) filterPayload.search = search;
      if (establecimientoId) filterPayload.establecimientoId = establecimientoId;
      if (raza) filterPayload.raza = raza;
      if (sexo) filterPayload.sexo = sexo;

      const result = await CaballoService.getAllCaballos(filterPayload);

      if (!result.success || !result.data) {
        res.status(500).json(ApiResponse.error(result.error || 'Error al obtener caballos'));
        return;
      }

      res.json({
        success: true,
        message: 'Success',
        data: result.data.caballos,
        meta: { page, limit, total: result.data.total, totalPages: result.data.totalPages },
      });

    } catch (error: any) {
      logger.error('Error obteniendo caballos', { error });
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
  const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const caballo = await CaballoService.getCaballoById(caballoId, usuarioId, userRole);

      if (!caballo) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado'));
        return;
      }

      res.json(ApiResponse.success(caballo));

    } catch (error: any) {
      logger.error('Error obteniendo caballo', { error });
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
  const caballoId = parseInt(req.params['id'] as string);
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

  logger.info(`Caballo actualizado: ${caballoId}`);
      res.json(ApiResponse.success(caballo, 'Caballo actualizado exitosamente'));

    } catch (error: any) {
      logger.error('Error actualizando caballo', { error });
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
  const caballoId = parseInt(req.params['id'] as string);
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

  logger.info(`Caballo eliminado: ${caballoId}`);
      res.json(ApiResponse.success(null, 'Caballo eliminado exitosamente'));

    } catch (error: any) {
      logger.error('Error eliminando caballo', { error });
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
  const caballoId = parseInt(req.params['id'] as string);
      const { propietarioId, fechaInicio, porcentaje } = req.body;
      

      if (isNaN(caballoId) || !propietarioId) {
        res.status(400).json(ApiResponse.error('Datos requeridos: propietarioId'));
        return;
      }

      const propietario = await CaballoService.addPropietarioToCaballo(
        caballoId,
        propietarioId,
        fechaInicio,
        porcentaje || 100
      );

      if (!propietario) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

  logger.info(`Propietario ${propietarioId} agregado a caballo ${caballoId}`);
      res.status(201).json(ApiResponse.success(propietario, 'Propietario agregado al caballo exitosamente'));

    } catch (error: any) {
      logger.error('Error agregando propietario a caballo', { error });
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
  const caballoId = parseInt(req.params['id'] as string);
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

    } catch (error: any) {
      logger.error('Error obteniendo propietarios del caballo', { error });
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
    const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const pedigree = await CaballoService.getCaballoPedigree(
        caballoId,
        usuarioId,
        userRole
      );

      if (!pedigree) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(pedigree));

    } catch (error: any) {
      logger.error('Error obteniendo pedigrí del caballo', { error });
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
  const caballoId = parseInt(req.params['id'] as string);
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

    } catch (error: any) {
      logger.error('Error obteniendo descendencia del caballo', { error });
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
  const caballoId = parseInt(req.params['id'] as string);
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

    } catch (error: any) {
      logger.error('Error obteniendo historial médico del caballo', { error });
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
  const caballoId = parseInt(req.params['id'] as string);
  const { nuevoEstablecimientoId } = req.body;
  const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId) || !nuevoEstablecimientoId) {
        res.status(400).json(ApiResponse.error('Datos requeridos: nuevoEstablecimientoId'));
        return;
      }

      const resultado = await CaballoService.moverCaballoEstablecimiento(
        caballoId,
        nuevoEstablecimientoId,
        usuarioId,
        userRole
      );

      if (!resultado) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      logger.info(`Caballo ${caballoId} movido a establecimiento ${nuevoEstablecimientoId}`);
      res.json(ApiResponse.success(resultado, 'Caballo movido exitosamente'));

    } catch (error: any) {
      logger.error('Error moviendo caballo de establecimiento', { error });
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
  const caballoId = parseInt(req.params['id'] as string);
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

    } catch (error: any) {
      logger.error('Error obteniendo estadísticas del caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }
}