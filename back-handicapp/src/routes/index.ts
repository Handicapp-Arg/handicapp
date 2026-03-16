import { Router, type Router as ExpressRouter } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { roleRoutes } from './roleRoutes';
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
import { config } from '../config/config';
import { UploadController, uploader } from '../controllers/uploadController';
import propietarioRoutes from './propietarioRoutes';

const router: ExpressRouter = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: config.api.version,
    environment: config.nodeEnv,
  });
});

// Auth & users
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

// Core business entities
router.use('/establecimientos', establecimientoRoutes);
router.use('/caballos', caballoRoutes);
router.use('/eventos', eventoRoutes);
router.use('/tareas', tareaRoutes);

// Notifications
router.use('/notificaciones', notificacionRoutes);
router.use('/cron', notificacionCronRoutes);
router.use('/push', pushRoutes);

// Attachments & QR
router.use('/adjuntos', adjuntoRoutes);
router.use('/qr', qrCodeRoutes);

// Audit (admin only)
router.use('/auditoria', auditoriaRoutes);

// File uploads
const uploadRouter = Router();
uploadRouter.post('/image', uploader.single('file'), UploadController.uploadImage);
router.use('/uploads', uploadRouter);

// Propietario dashboard routes
router.use('/propietario', propietarioRoutes);

export { router as apiRoutes };
