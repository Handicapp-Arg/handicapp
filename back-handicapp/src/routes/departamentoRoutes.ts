// src/routes/departamentoRoutes.ts
import { Router, type Router as ExpressRouter } from 'express';
import { DepartamentoController } from '../controllers/departamentoController';
import { requireAuth } from '../middleware/auth';

const router: ExpressRouter = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Obtener departamentos
router.get('/', DepartamentoController.getDepartamentos);

export { router as departamentoRoutes };
