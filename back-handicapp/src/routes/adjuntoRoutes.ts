import { Router, type Router as ExpressRouter } from 'express';
import { AdjuntoController } from '../controllers/adjuntoController';
import { requireAuth } from '../middleware/auth';
import { uploader } from '../controllers/uploadController';

const router: ExpressRouter = Router();

/**
 * @route   GET /api/v1/adjuntos/:id
 * @desc    Obtener información de un adjunto
 * @access  Private (requiere autenticación)
 */
router.get('/:id', requireAuth, AdjuntoController.getById);

/**
 * @route   GET /api/v1/adjuntos/:id/download
 * @desc    Descargar un adjunto
 * @access  Private (requiere autenticación)
 */
router.get('/:id/download', requireAuth, AdjuntoController.download);

/**
 * @route   POST /api/v1/adjuntos/upload
 * @desc    Subir un nuevo adjunto
 * @access  Private (requiere autenticación + rol staff/veterinario/capataz)
 * @body    { caballo_id?: number, evento_id?: number, categoria: string } + file
 */
router.post(
  '/upload',
  requireAuth,
  // TODO: Agregar middleware de autorización para roles específicos
  uploader.single('file'),
  AdjuntoController.upload
);

/**
 * @route   DELETE /api/v1/adjuntos/:id
 * @desc    Eliminar un adjunto (soft delete)
 * @access  Private (requiere autenticación + rol staff)
 */
router.delete(
  '/:id',
  requireAuth,
  // TODO: Agregar middleware de autorización para rol staff
  AdjuntoController.delete
);

export default router;
