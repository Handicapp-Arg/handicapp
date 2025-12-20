import { Router, type Router as ExpressRouter } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { roleRoutes } from './roleRoutes';
import { departamentoRoutes } from './departamentoRoutes';
import { puestoRoutes } from './puestoRoutes';
import { establecimientoRoutes } from './establecimientoRoutes';
import { caballoRoutes } from './caballoRoutes';
import { eventoRoutes } from './eventoRoutes';
import { tareaRoutes } from './tareaRoutes';
import adjuntoRoutes from './adjuntoRoutes';
import qrCodeRoutes from './qrCodeRoutes';
import auditoriaRoutes from './auditoriaRoutes';
import { notificacionRoutes } from './notificacionRoutes';
import pushRoutes from './pushRoutes';
import notificacionCronRoutes from './notificacionCronRoutes';
import { inventarioRoutes } from './inventarioRoutes';
import { config } from '../config/config';
import { Router as ExpressRouter2 } from 'express';
import { UploadController, uploader } from '../controllers/uploadController';
import { webContactRoutes } from './webContactRoutes';

const router: ExpressRouter = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is healthy - Phase 2 Complete',
    timestamp: new Date().toISOString(),
    version: config.api.version,
    environment: config.nodeEnv,
    phase: 'Phase 2 - Controllers & Middleware Complete'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/departamentos', departamentoRoutes);
router.use('/puestos', puestoRoutes);

// Business entity routes (Phase 2)
router.use('/establecimientos', establecimientoRoutes);
router.use('/caballos', caballoRoutes);
router.use('/eventos', eventoRoutes);
router.use('/tareas', tareaRoutes);

// Inventario routes (Establecimiento)
router.use('/establecimiento/inventario', inventarioRoutes);
// Notification routes
router.use('/notificaciones', notificacionRoutes);

// Cron notification routes (testing - admin only)
router.use('/cron', notificacionCronRoutes);

// Push notification routes
router.use('/push', pushRoutes);
router.use('/push', pushRoutes);

// Document management routes
router.use('/adjuntos', adjuntoRoutes);

// QR Code routes
router.use('/qr', qrCodeRoutes);

// Audit routes (Admin only)
router.use('/auditoria', auditoriaRoutes);

// Upload routes
const uploadRouter: ExpressRouter2 = Router();
uploadRouter.post('/image', uploader.single('file'), UploadController.uploadImage);
router.use('/uploads', uploadRouter);

// Web contact routes
router.use('/web-contacts', webContactRoutes);

export { router as apiRoutes };

