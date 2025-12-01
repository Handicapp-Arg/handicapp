// src/routes/puestoRoutes.ts
import { Router, type Router as ExpressRouter } from 'express';
import { DepartamentoController } from '../controllers/departamentoController';
import { requireAuth } from '../middleware/auth';

const router: ExpressRouter = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Obtener puestos
router.get('/', DepartamentoController.getPuestos);

export { router as puestoRoutes };
