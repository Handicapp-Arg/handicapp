import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { roleRoutes } from './roleRoutes';
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

// TEST LOGIN ENDPOINT - For development testing
router.post('/test-login', (req, res) => {
  res.json({
    success: true,
    message: 'Test login works!',
    data: {
      email: req.body.email,
      timestamp: new Date().toISOString()
    }
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

export { router as apiRoutes };

