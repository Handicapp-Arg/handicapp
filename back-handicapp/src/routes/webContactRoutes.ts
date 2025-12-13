import { Router } from 'express';
import { WebContactController } from '../controllers/webContactController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Ruta pública para recibir mensajes desde la web
router.post('/', WebContactController.create);

// Ruta protegida solo para admin para listar mensajes
router.get('/', requireAuth, WebContactController.list);

export { router as webContactRoutes };
