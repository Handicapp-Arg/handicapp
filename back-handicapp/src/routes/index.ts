import { Router, type Router as ExpressRouter } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { roleRoutes } from './roleRoutes';
import { establecimientoRoutes } from './establecimientoRoutes';
import { caballoRoutes } from './caballoRoutes';
import { eventoRoutes } from './eventoRoutes';
import { tareaRoutes } from './tareaRoutes';
import { config } from '../config/config';

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

// Business entity routes (Phase 2)
router.use('/establecimientos', establecimientoRoutes);
router.use('/caballos', caballoRoutes);
router.use('/eventos', eventoRoutes);
router.use('/tareas', tareaRoutes);

export { router as apiRoutes };

