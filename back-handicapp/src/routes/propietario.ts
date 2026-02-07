import { Router } from 'express';
import { propietarioDashboard } from '../controllers/propietarioController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Dashboard optimizado para propietario (requiere autenticación)
router.get('/dashboard', requireAuth, propietarioDashboard);

export default router;
