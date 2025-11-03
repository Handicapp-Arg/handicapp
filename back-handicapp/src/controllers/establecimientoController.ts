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

      logger.info('📋 getAll establecimientos', { userRole, usuarioId, page, limit, search });

      let result;
      
      if (userRole === 'admin') {
        // Admin ve solo sus establecimientos (con membresía)
        result = await EstablecimientoService.searchEstablecimientos(
          search || '',
          usuarioId,
          { page, limit }
        );
      } else if (userRole === 'propietario') {
        // Propietarios ven TODOS los establecimientos activos + sus caballos en cada uno
        result = await EstablecimientoService.getAllPublicEstablecimientos({
          page,
          limit,
          search
        }, usuarioId);
      } else {
        // Otros roles (veterinario, capataz, etc.) ven sus establecimientos
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
      const { 
        nombre, 
        cuit, 
        direccion_calle, 
        telefono, 
        email,
        tipo_establecimiento,
        estado,
        superficie_hectareas,
        cantidad_boxes,
        servicios
      } = req.body;
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
        email,
        tipo_establecimiento,
        estado,
        superficie_hectareas,
        cantidad_boxes,
        servicios
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
      const userRole = req.user!.rol?.clave;
      const userEstablecimientoId = req.user!.establecimiento_id;

      console.log('🔵 CONTROLLER - Datos recibidos:', JSON.stringify(updateData, null, 2));
      console.log('🔵 CONTROLLER - Usuario:', { usuarioId, userRole, userEstablecimientoId });

      if (isNaN(establecimientoId)) {
        ResponseHelper.badRequest(res, 'ID de establecimiento inválido');
        return;
      }

      const result = await EstablecimientoService.updateEstablecimiento(
        establecimientoId, 
        updateData, 
        usuarioId,
        userRole,
        userEstablecimientoId
      );

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

  /**
   * Propietario solicita asociar su caballo al establecimiento
   * POST /api/v1/establecimientos/:id/caballos
   */
  static async asociarCaballo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const { caballo_id } = req.body;
      const usuarioId = req.user!.id;

      if (isNaN(establecimientoId) || !caballo_id) {
        ResponseHelper.badRequest(res, 'ID de establecimiento y caballo_id son requeridos');
        return;
      }

      const result = await EstablecimientoService.asociarCaballo(
        establecimientoId,
        parseInt(caballo_id),
        usuarioId
      );

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, 'Solicitud enviada exitosamente');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error al solicitar asociación');
      }

    } catch (error) {
      logger.error('Error al solicitar asociación', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Establecimiento solicita asociar un caballo
   * POST /api/v1/establecimientos/:id/solicitar-caballo
   */
  static async solicitarCaballo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const { caballo_id } = req.body;
      const usuarioId = req.user!.id;

      if (isNaN(establecimientoId) || !caballo_id) {
        ResponseHelper.badRequest(res, 'ID de establecimiento y caballo_id son requeridos');
        return;
      }

      const result = await EstablecimientoService.solicitarCaballo(
        establecimientoId,
        parseInt(caballo_id),
        usuarioId
      );

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, 'Solicitud enviada al propietario');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error al solicitar caballo');
      }

    } catch (error) {
      logger.error('Error al solicitar caballo', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Aprobar solicitud de asociación
   * POST /api/v1/establecimientos/:id/caballos/:caballoId/aprobar
   */
  static async aprobarAsociacion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const caballoId = parseInt(req.params['caballoId'] || '0');
      const usuarioId = req.user!.id;

      if (isNaN(establecimientoId) || isNaN(caballoId)) {
        ResponseHelper.badRequest(res, 'IDs inválidos');
        return;
      }

      const result = await EstablecimientoService.aprobarAsociacion(
        establecimientoId,
        caballoId,
        usuarioId
      );

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, 'Asociación aprobada exitosamente');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error al aprobar asociación');
      }

    } catch (error) {
      logger.error('Error al aprobar asociación', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Rechazar solicitud de asociación
   * POST /api/v1/establecimientos/:id/caballos/:caballoId/rechazar
   */
  static async rechazarAsociacion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const caballoId = parseInt(req.params['caballoId'] || '0');
      const usuarioId = req.user!.id;
      const { motivo } = req.body;

      if (isNaN(establecimientoId) || isNaN(caballoId)) {
        ResponseHelper.badRequest(res, 'IDs inválidos');
        return;
      }

      const result = await EstablecimientoService.rechazarAsociacion(
        establecimientoId,
        caballoId,
        usuarioId,
        motivo
      );

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, 'Solicitud rechazada');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error al rechazar solicitud');
      }

    } catch (error) {
      logger.error('Error al rechazar solicitud', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

}