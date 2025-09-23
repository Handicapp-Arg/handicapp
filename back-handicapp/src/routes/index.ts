import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { config } from '../config/config';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: config.api.version,
    environment: config.nodeEnv,
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };
