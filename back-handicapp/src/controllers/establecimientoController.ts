import { Response } from 'express';
import { EstablecimientoService } from '../services/establecimientoService';
import { logger } from '../utils/logger';
import { ResponseHelper } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { uploadImageBufferToCloudinary } from '../utils/imageUpload';

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
        // Admin ve TODOS los establecimientos (sin filtrar por membresía)
        result = await EstablecimientoService.getAllPublicEstablecimientos(
          { page, limit, search },
          undefined // No pasar usuarioId para que no filtre por caballos
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
        direccion_numero,
        direccion_complemento,
        codigo_postal,
        ciudad,
        provincia,
        pais,
        latitud,
        longitud,
        descripcion,
        telefono, 
        email,
        tipo_establecimiento,
        estado,
        superficie_hectareas,
        cantidad_boxes,
        servicios,
        disciplina_principal
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
        direccion_numero,
        direccion_complemento,
        codigo_postal,
        ciudad,
        provincia,
        pais,
        latitud,
        longitud,
        descripcion,
        telefono,
        email,
        tipo_establecimiento,
        estado,
        superficie_hectareas,
        cantidad_boxes,
        servicios,
        disciplina_principal
      }, usuarioId);

      if (result.success && result.data) {
        let finalData = result.data;

        // Si vino un logo (multer memory), subir a Cloudinary y actualizar logo_url
        const file = (req as any).file as Express.Multer.File | undefined;
        if (file && file.buffer && result.data.id) {
          const folder = `handicapp/establecimientos/${result.data.id}/logo`;
          const cloud = await uploadImageBufferToCloudinary(file.buffer, file.originalname || 'logo', {
            folder,
            publicId: 'logo',
            overwrite: true,
          });
          if (cloud.success && (cloud.secureUrl || cloud.url)) {
            const logoUrl = cloud.secureUrl || cloud.url || '';
            const updated = await EstablecimientoService.updateEstablecimiento(
              result.data.id,
              { logo_url: logoUrl },
              usuarioId,
              req.user!.rol?.clave,
              req.user!.establecimiento_id
            );
            if (updated.success && updated.data) {
              finalData = updated.data;
            }
          } else {
            logger.warn('Subida de logo de establecimiento fallida', { id: result.data.id, error: cloud.error });
          }
        }

        ResponseHelper.created(res, finalData, 'Establecimiento creado exitosamente');
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

      let finalUpdateData = { ...updateData };

      // Si vino un logo (multer memory), subir a Cloudinary y agregar logo_url
      const file = (req as any).file as Express.Multer.File | undefined;
      if (file && file.buffer) {
        const folder = `handicapp/establecimientos/${establecimientoId}/logo`;
        const cloud = await uploadImageBufferToCloudinary(file.buffer, file.originalname || 'logo', {
          folder,
          publicId: 'logo',
          overwrite: true,
        });
        if (cloud.success && (cloud.secureUrl || cloud.url)) {
          finalUpdateData.logo_url = cloud.secureUrl || cloud.url || '';
        } else {
          logger.warn('Subida de logo de establecimiento fallida', { id: establecimientoId, error: cloud.error });
        }
      }

      const result = await EstablecimientoService.updateEstablecimiento(
        establecimientoId, 
        finalUpdateData, 
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

  /**
   * Obtener establecimientos para mapa (solo con geolocalización)
   * GET /api/v1/establecimientos/mapa
   */
  static async getForMap(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tipo, rating_minimo, verificado } = req.query;
      
      const filters: any = {};
      if (tipo) filters.tipo = tipo as string;
      if (rating_minimo) filters.rating_minimo = parseFloat(rating_minimo as string);
      if (verificado === 'true') filters.verificado = true;
      
      const result = await EstablecimientoService.getEstablecimientosForMap(filters);

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data);
      } else {
        ResponseHelper.internalError(res, result.error || 'Error obteniendo establecimientos para mapa');
      }

    } catch (error) {
      logger.error('Error obteniendo establecimientos para mapa', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Crear reseña para un establecimiento
   * POST /api/v1/establecimientos/:id/resenas
   */
  static async createResena(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const usuarioId = req.user!.id;
      const { rating, comentario } = req.body;

      if (isNaN(establecimientoId)) {
        ResponseHelper.badRequest(res, 'ID de establecimiento inválido');
        return;
      }

      if (!rating || rating < 1 || rating > 5) {
        ResponseHelper.badRequest(res, 'Rating debe ser entre 1 y 5');
        return;
      }

      const result = await EstablecimientoService.createResena({
        establecimiento_id: establecimientoId,
        usuario_id: usuarioId,
        rating,
        comentario: comentario || null,
      });

      if (result.success && result.data) {
        ResponseHelper.created(res, result.data, 'Reseña creada exitosamente');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error al crear reseña');
      }

    } catch (error) {
      logger.error('Error al crear reseña', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener reseñas de un establecimiento
   * GET /api/v1/establecimientos/:id/resenas
   */
  static async getResenas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const ratingQuery = req.query['rating'];

      if (isNaN(establecimientoId)) {
        ResponseHelper.badRequest(res, 'ID de establecimiento inválido');
        return;
      }

      const options: any = { page, limit };
      if (ratingQuery) {
        options.rating = parseInt(ratingQuery as string);
      }

      const result = await EstablecimientoService.getResenas(establecimientoId, options);

      if (result.success && result.data) {
        ResponseHelper.success(res, {
          items: result.data.resenas,
          pagination: {
            page,
            limit,
            total: result.data.total,
            pages: result.data.totalPages
          }
        });
      } else {
        ResponseHelper.internalError(res, result.error || 'Error obteniendo reseñas');
      }

    } catch (error) {
      logger.error('Error obteniendo reseñas', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Responder a una reseña (solo establecimiento)
   * POST /api/v1/establecimientos/:id/resenas/:resenaId/responder
   */
  static async responderResena(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const resenaId = parseInt(req.params['resenaId'] || '0');
      const usuarioId = req.user!.id;
      const { respuesta } = req.body;

      if (isNaN(establecimientoId) || isNaN(resenaId)) {
        ResponseHelper.badRequest(res, 'IDs inválidos');
        return;
      }

      if (!respuesta || respuesta.trim().length === 0) {
        ResponseHelper.badRequest(res, 'La respuesta no puede estar vacía');
        return;
      }

      const result = await EstablecimientoService.responderResena(
        resenaId,
        establecimientoId,
        usuarioId,
        respuesta
      );

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, 'Respuesta agregada exitosamente');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error al responder reseña');
      }

    } catch (error) {
      logger.error('Error al responder reseña', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Agregar imágenes al establecimiento
   * POST /api/v1/establecimientos/:id/imagenes
   */
  static async addImagenes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const usuarioId = req.user!.id;

      if (isNaN(establecimientoId)) {
        ResponseHelper.badRequest(res, 'ID de establecimiento inválido');
        return;
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        ResponseHelper.badRequest(res, 'No se proporcionaron imágenes');
        return;
      }

      // Upload images to Cloudinary
      const imageUrls: string[] = [];
      for (const file of req.files as Express.Multer.File[]) {
        const uploadResult = await uploadImageBufferToCloudinary(
          file.buffer,
          'establecimientos'
        );
        if (uploadResult) {
          // uploadImageBufferToCloudinary returns CloudinaryUploadResult, extract URL
          const url = typeof uploadResult === 'string' ? uploadResult : uploadResult.secureUrl;
          if (url) imageUrls.push(url);
        }
      }

      if (imageUrls.length === 0) {
        ResponseHelper.internalError(res, 'Error al subir imágenes');
        return;
      }

      const result = await EstablecimientoService.addImagenes(
        establecimientoId,
        usuarioId,
        imageUrls
      );

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, 'Imágenes agregadas exitosamente');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error al agregar imágenes');
      }

    } catch (error) {
      logger.error('Error al agregar imágenes', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar imagen del establecimiento
   * DELETE /api/v1/establecimientos/:id/imagenes
   */
  static async deleteImagen(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const establecimientoId = parseInt(req.params['id'] || '0');
      const usuarioId = req.user!.id;
      const { imagen_url } = req.body;

      if (isNaN(establecimientoId)) {
        ResponseHelper.badRequest(res, 'ID de establecimiento inválido');
        return;
      }

      if (!imagen_url) {
        ResponseHelper.badRequest(res, 'URL de imagen requerida');
        return;
      }

      const result = await EstablecimientoService.deleteImagen(
        establecimientoId,
        usuarioId,
        imagen_url
      );

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, 'Imagen eliminada exitosamente');
      } else {
        ResponseHelper.badRequest(res, result.error || 'Error al eliminar imagen');
      }

    } catch (error) {
      logger.error('Error al eliminar imagen', { error });
      ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  }

}

