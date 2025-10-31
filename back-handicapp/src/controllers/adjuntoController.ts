import type { Request, Response } from 'express';
import { AdjuntoService } from '../services/adjuntoService';
import { logger } from '../utils/logger';
import { CategoriaAdjunto } from '../models/enums';
import fs from 'fs';

export class AdjuntoController {
  /**
   * GET /api/v1/caballos/:id/adjuntos
   * Obtener todos los adjuntos de un caballo
   */
  static async getByCaballo(req: Request, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params['id'] || '0');

      if (isNaN(caballoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de caballo inválido',
        });
        return;
      }

      const adjuntos = await AdjuntoService.getAdjuntosByCaballo(caballoId);

      // Convertir instancias Sequelize a objetos planos
      const adjuntosPlain = adjuntos.map(adj => adj.get({ plain: true }));

      res.status(200).json({
        success: true,
        data: adjuntosPlain,
      });
    } catch (error: any) {
      logger.error('Error obteniendo adjuntos por caballo', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al obtener adjuntos',
      });
    }
  }

  /**
   * GET /api/v1/eventos/:id/adjuntos
   * Obtener todos los adjuntos de un evento
   */
  static async getByEvento(req: Request, res: Response): Promise<void> {
    try {
      const eventoId = parseInt(req.params['id'] || '0');

      if (isNaN(eventoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de evento inválido',
        });
        return;
      }

      const adjuntos = await AdjuntoService.getAdjuntosByEvento(eventoId);

      // Convertir instancias Sequelize a objetos planos
      const adjuntosPlain = adjuntos.map(adj => adj.get({ plain: true }));

      res.status(200).json({
        success: true,
        data: adjuntosPlain,
      });
    } catch (error: any) {
      logger.error('Error obteniendo adjuntos por evento', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al obtener adjuntos',
      });
    }
  }

  /**
   * GET /api/v1/adjuntos/:id/download
   * Descargar un adjunto específico
   */
  static async download(req: Request, res: Response): Promise<void> {
    try {
      const adjuntoId = parseInt(req.params['id'] || '0');

      if (isNaN(adjuntoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de adjunto inválido',
        });
        return;
      }

      const { adjunto, filePath } = await AdjuntoService.getDownloadUrl(adjuntoId);

      // Configurar headers para descarga
      res.setHeader('Content-Type', adjunto.tipo_mime);
      res.setHeader('Content-Disposition', `attachment; filename="${adjunto.nombre_archivo}"`);
      
      // Si es una imagen, también permitir visualización inline
      if (adjunto.tipo_mime.startsWith('image/')) {
        res.setHeader('Content-Disposition', `inline; filename="${adjunto.nombre_archivo}"`);
      }

      // Stream del archivo
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      logger.info('Adjunto descargado', { adjuntoId, filename: adjunto.nombre_archivo });
    } catch (error: any) {
      logger.error('Error descargando adjunto', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al descargar adjunto',
      });
    }
  }

  /**
   * POST /api/v1/adjuntos/upload
   * Subir un nuevo adjunto
   * Requiere: autenticación + rol staff/veterinario/capataz
   */
  static async upload(req: Request, res: Response): Promise<void> {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo',
        });
        return;
      }

      const { caballo_id, evento_id, categoria } = req.body;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Validar que se especificó caballo o evento
      if (!caballo_id && !evento_id) {
        res.status(400).json({
          success: false,
          message: 'Debe especificar caballo_id o evento_id',
        });
        return;
      }

      // Validar categoría
      const validCategories = Object.values(CategoriaAdjunto);
      if (!categoria || !validCategories.includes(categoria)) {
        res.status(400).json({
          success: false,
          message: `Categoría inválida. Debe ser una de: ${validCategories.join(', ')}`,
        });
        return;
      }

      // Crear adjunto en BD
      const adjunto = await AdjuntoService.createAdjunto({
        caballo_id: caballo_id ? parseInt(caballo_id) : undefined,
        evento_id: evento_id ? parseInt(evento_id) : undefined,
        subido_por_usuario_id: userId,
        rol_autor: userRole,
        categoria: categoria as CategoriaAdjunto,
        nombre_archivo: file.filename,
        tipo_mime: file.mimetype,
        tamanio_bytes: BigInt(file.size),
        ruta_almacenamiento: file.path,
      });

      // Build public URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const publicUrl = `${baseUrl}/api/v1/adjuntos/${adjunto.id}/download`;

      res.status(201).json({
        success: true,
        message: 'Adjunto subido correctamente',
        data: {
          id: adjunto.id,
          url: publicUrl,
          filename: adjunto.nombre_archivo,
          categoria: adjunto.categoria,
          tipo_mime: adjunto.tipo_mime,
        },
      });
    } catch (error: any) {
      logger.error('Error subiendo adjunto', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al subir adjunto',
      });
    }
  }

  /**
   * DELETE /api/v1/adjuntos/:id
   * Eliminar un adjunto (soft delete)
   * Requiere: autenticación + rol staff
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const adjuntoId = parseInt(req.params['id'] || '0');
      const userId = (req as any).user?.id;

      if (isNaN(adjuntoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de adjunto inválido',
        });
        return;
      }

      await AdjuntoService.deleteAdjunto(adjuntoId, userId);

      res.status(200).json({
        success: true,
        message: 'Adjunto eliminado correctamente',
      });
    } catch (error: any) {
      logger.error('Error eliminando adjunto', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al eliminar adjunto',
      });
    }
  }

  /**
   * GET /api/v1/adjuntos/:id
   * Obtener información de un adjunto específico
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const adjuntoId = parseInt(req.params['id'] || '0');

      if (isNaN(adjuntoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de adjunto inválido',
        });
        return;
      }

      const adjunto = await AdjuntoService.getAdjuntoById(adjuntoId);

      // Convertir instancia Sequelize a objeto plano
      const adjuntoPlain = adjunto.get({ plain: true });

      res.status(200).json({
        success: true,
        data: adjuntoPlain,
      });
    } catch (error: any) {
      logger.error('Error obteniendo adjunto', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al obtener adjunto',
      });
    }
  }

  /**
   * GET /api/v1/caballos/:id/adjuntos/estadisticas
   * Obtener estadísticas de adjuntos por categoría
   */
  static async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params['id'] || '0');

      if (isNaN(caballoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de caballo inválido',
        });
        return;
      }

      const stats = await AdjuntoService.getEstadisticasByCaballo(caballoId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Error obteniendo estadísticas', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al obtener estadísticas',
      });
    }
  }
}
