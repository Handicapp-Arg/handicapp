import { Request, Response } from 'express';
import { CaballoService } from '../services/caballoService';
import { TareaService } from '../services/tareaService';
import { getEventosPorUsuarioYCaballos } from '../services/eventoPorUsuarioService';
import { logger } from '../utils/logger';
import { ResponseHelper } from '../utils/response';

// Endpoint optimizado para dashboard propietario
export async function propietarioDashboard(req: Request, res: Response) {
  try {
    let userId = undefined;
    if (req.user && typeof req.user === 'object' && 'id' in req.user) {
      userId = (req.user as any).id;
    } else if (req.body && typeof req.body === 'object' && 'userId' in req.body) {
      userId = req.body['userId'];
    } else if (req.query && typeof req.query === 'object' && 'userId' in req.query) {
      userId = req.query['userId'];
    }
    if (!userId) return ResponseHelper.unauthorized(res, 'Usuario no autenticado');

    // Traer caballos del usuario (reutilizamos CaballoService)
    const caballosResp = await CaballoService.getAllCaballos({ usuarioId: userId, userRole: 'propietario', limit: 100 });
  const caballos = caballosResp.success && caballosResp.data && caballosResp.data.caballos ? caballosResp.data.caballos : [];
    const caballoIds = caballos.map((c: any) => c.id);

    // Tareas (reutilizamos TareaService)
    const tareasResp = await TareaService.getAllTareas({ usuarioId: userId, userRole: 'propietario', limit: 100 });
  const tareas = tareasResp.success && tareasResp.data && tareasResp.data.tareas ? tareasResp.data.tareas : [];

    // Eventos (nuevo servicio)
    const eventosResp = await getEventosPorUsuarioYCaballos(userId, caballoIds, 20);
    const eventos = eventosResp.success ? eventosResp.data : [];

    return ResponseHelper.success(res, { caballos, tareas, eventos });
  } catch (error) {
    logger.error('Error en propietarioDashboard', { error });
    return ResponseHelper.internalError(res, 'Error interno del servidor');
  }
}
