/**
 * Propietario Routes — Dashboard endpoints para el rol propietario.
 * TODO: Renombrar este archivo a propietarioRoutes.ts para consistencia con el resto de rutas.
 */

import { Router, type Router as ExpressRouter } from 'express';
import { propietarioDashboard } from '../controllers/propietarioController';
import { requireAuth } from '../middleware/auth';

const router: ExpressRouter = Router();

// Dashboard optimizado para propietario (requiere autenticación)
router.get('/dashboard', requireAuth, propietarioDashboard);

export default router;
