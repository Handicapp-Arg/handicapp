import { Response } from 'express';
import { EstablecimientoService } from '../services/establecimientoService';
import { logger } from '../utils/logger';
import { ResponseHelper } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class EstablecimientoController {

  /**
   * Obtener todos los establecimientos del usuario
   * GET /api/v1/establecimientos
   */
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const search = req.query['search'] as string;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      let result;
      
      if (userRole === 'admin') {
        result = await EstablecimientoService.searchEstablecimientos(
          search || '',
          usuarioId,
          { page, limit }
        );
      } else {
        result = await EstablecimientoService.getEstablecimientosByUser(usuarioId, {
          page,
          limit,
          search
        });
      }
      
      if (result.success && result.data) {
        ResponseHelper.success(res, {
          items: result.data.establecimientos,
          pagination: {
            page,
            limit,
            total: result.data.total,
            pages: result.data.totalPages
          }
        });
      } else {
        ResponseHelper.internalError(res, result.error || 'Error obteniendo establecimientos');
      }

    } catch (error) {
      logger.error('Error obteniendo establecimientos', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener establecimiento por ID
   * GET /api/v1/establecimientos/:id
   */
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const usuarioId = req.user!.id;

      if (isNaN(establecimientoId)) {
        ResponseHelper.badRequest(res, 'ID de establecimiento inválido');
        return;
      }

      const result = await EstablecimientoService.getEstablecimientoById(establecimientoId, usuarioId);

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data);
      } else {
        ResponseHelper.notFound(res, 'Establecimiento no encontrado');
      }

    } catch (error) {
      logger.error('Error obteniendo establecimiento', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Crear nuevo establecimiento
   * POST /api/v1/establecimientos
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { nombre, cuit, direccion_calle, telefono, email } = req.body;
      const usuarioId = req.user!.id;

      if (!nombre || !cuit) {
        ResponseHelper.badRequest(res, 'Nombre y CUIT son requeridos');
        return;
      }

      const result = await EstablecimientoService.createEstablecimiento({
        nombre,
        cuit,
        direccion_calle,
        telefono,
        email
      }, usuarioId);

      if (result.success && result.data) {
        ResponseHelper.created(res, result.data, 'Establecimiento creado exitosamente');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error creando establecimiento');
      }

    } catch (error) {
      logger.error('Error creando establecimiento', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar establecimiento
   * PUT /api/v1/establecimientos/:id
   */
  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const updateData = req.body;
      const usuarioId = req.user!.id;

      if (isNaN(establecimientoId)) {
        ResponseHelper.badRequest(res, 'ID de establecimiento inválido');
        return;
      }

      const result = await EstablecimientoService.updateEstablecimiento(establecimientoId, updateData, usuarioId);

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, 'Establecimiento actualizado exitosamente');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error actualizando establecimiento');
      }

    } catch (error) {
      logger.error('Error actualizando establecimiento', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar establecimiento
   * DELETE /api/v1/establecimientos/:id
   */
  static async delete(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      ResponseHelper.notFound(res, 'Funcionalidad no implementada');
    } catch (error) {
      logger.error('Error eliminando establecimiento', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Agregar usuario a establecimiento
   * POST /api/v1/establecimientos/:id/usuarios
   */
  static async addUser(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      ResponseHelper.notFound(res, 'Funcionalidad no implementada');
    } catch (error) {
      logger.error('Error agregando usuario', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener usuarios de establecimiento
   * GET /api/v1/establecimientos/:id/usuarios
   */
  static async getUsers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      ResponseHelper.notFound(res, 'Funcionalidad no implementada');
    } catch (error) {
      logger.error('Error obteniendo usuarios', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Remover usuario de establecimiento
   * DELETE /api/v1/establecimientos/:id/usuarios/:userId
   */
  static async removeUser(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      ResponseHelper.notFound(res, 'Funcionalidad no implementada');
    } catch (error) {
      logger.error('Error removiendo usuario', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener caballos de establecimiento
   * GET /api/v1/establecimientos/:id/caballos
   */
  static async getCaballos(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      ResponseHelper.notFound(res, 'Funcionalidad no implementada');
    } catch (error) {
      logger.error('Error obteniendo caballos', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de establecimiento
   * GET /api/v1/establecimientos/:id/stats
   */
  static async getStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      ResponseHelper.notFound(res, 'Funcionalidad no implementada');
    } catch (error) {
      logger.error('Error obteniendo estadísticas', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

}