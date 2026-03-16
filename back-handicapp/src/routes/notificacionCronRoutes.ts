// src/routes/notificacionCronRoutes.ts
// -----------------------------------------------------------------------------
// Rutas para testing de cron jobs de notificaciones (solo admin)
// -----------------------------------------------------------------------------

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorization';
import { TareaNotificacionService } from '../services/tareaNotificacionService';
import { ResponseHelper } from '../utils/response';

const router: Router = Router();

/**
 * POST /api/v1/cron/tareas/verificar-vencidas
 * Ejecutar manualmente verificación de tareas vencidas (testing)
 */
const adminOnly = [requireAuth, requireRole('admin')];

router.post('/tareas/verificar-vencidas', ...adminOnly, async (_req, res) => {
  try {
    await TareaNotificacionService.verificarTareasVencidas();
    return ResponseHelper.success(res, { message: 'Verificación de tareas vencidas ejecutada correctamente' });
  } catch (error: any) {
    return ResponseHelper.internalError(res, error.message);
  }
});

/**
 * POST /api/v1/cron/tareas/verificar-proximas
 * Ejecutar manualmente verificación de tareas próximas a vencer (testing)
 */
router.post('/tareas/verificar-proximas', ...adminOnly, async (_req, res) => {
  try {
    await TareaNotificacionService.verificarTareasProximasVencer();
    return ResponseHelper.success(res, { message: 'Verificación de tareas próximas a vencer ejecutada correctamente' });
  } catch (error: any) {
    return ResponseHelper.internalError(res, error.message);
  }
});

/**
 * POST /api/v1/cron/tareas/verificar-todas
 * Ejecutar todas las verificaciones (testing)
 */
router.post('/tareas/verificar-todas', ...adminOnly, async (_req, res) => {
  try {
    await TareaNotificacionService.ejecutarVerificaciones();
    return ResponseHelper.success(res, { message: 'Todas las verificaciones ejecutadas correctamente' });
  } catch (error: any) {
    return ResponseHelper.internalError(res, error.message);
  }
});

export default router;
