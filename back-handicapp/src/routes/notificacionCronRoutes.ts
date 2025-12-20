// src/routes/notificacionCronRoutes.ts
// -----------------------------------------------------------------------------
// Rutas para testing de cron jobs de notificaciones (solo admin)
// -----------------------------------------------------------------------------

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { TareaNotificacionService } from '../services/tareaNotificacionService';
import { ResponseHelper } from '../utils/response';

const router: Router = Router();

/**
 * POST /api/v1/cron/tareas/verificar-vencidas
 * Ejecutar manualmente verificación de tareas vencidas (testing)
 */
router.post('/tareas/verificar-vencidas', requireAuth, async (req, res) => {
  try {
    // Solo admin puede ejecutar
    if (req.user?.rol?.nombre !== 'admin') {
      return ResponseHelper.forbidden(res, 'Solo administradores pueden ejecutar verificaciones manuales');
    }

    await TareaNotificacionService.verificarTareasVencidas();
    
    return ResponseHelper.success(res, {
      message: 'Verificación de tareas vencidas ejecutada correctamente'
    });
  } catch (error: any) {
    return ResponseHelper.internalError(res, error.message);
  }
});

/**
 * POST /api/v1/cron/tareas/verificar-proximas
 * Ejecutar manualmente verificación de tareas próximas a vencer (testing)
 */
router.post('/tareas/verificar-proximas', requireAuth, async (req, res) => {
  try {
    // Solo admin puede ejecutar
    if (req.user?.rol?.nombre !== 'admin') {
      return ResponseHelper.forbidden(res, 'Solo administradores pueden ejecutar verificaciones manuales');
    }

    await TareaNotificacionService.verificarTareasProximasVencer();
    
    return ResponseHelper.success(res, {
      message: 'Verificación de tareas próximas a vencer ejecutada correctamente'
    });
  } catch (error: any) {
    return ResponseHelper.internalError(res, error.message);
  }
});

/**
 * POST /api/v1/cron/tareas/verificar-todas
 * Ejecutar todas las verificaciones (testing)
 */
router.post('/tareas/verificar-todas', requireAuth, async (req, res) => {
  try {
    // Solo admin puede ejecutar
    if (req.user?.rol?.nombre !== 'admin') {
      return ResponseHelper.forbidden(res, 'Solo administradores pueden ejecutar verificaciones manuales');
    }

    await TareaNotificacionService.ejecutarVerificaciones();
    
    return ResponseHelper.success(res, {
      message: 'Todas las verificaciones ejecutadas correctamente'
    });
  } catch (error: any) {
    return ResponseHelper.internalError(res, error.message);
  }
});

export default router;
