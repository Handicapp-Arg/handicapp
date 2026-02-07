import { Request, Response } from 'express';
import { getFinanzasUsuarioYCaballos } from '../services/finanzasService';
import { CaballoService } from '../services/caballoService';
import { TareaService } from '../services/tareaService';
import { getEventosPorUsuarioYCaballos } from '../services/eventoPorUsuarioService';

// Endpoint optimizado para dashboard propietario
export async function propietarioDashboard(req: Request, res: Response) {
  try {
    // Debug: loguear el request para ver qué llega
    // console.log('Dashboard req.user:', req.user, 'body:', req.body, 'query:', req.query);
    let userId = undefined;
    if (req.user && typeof req.user === 'object' && 'id' in req.user) {
      userId = (req.user as any).id;
    } else if (req.body && typeof req.body === 'object' && 'userId' in req.body) {
      userId = req.body['userId'];
    } else if (req.query && typeof req.query === 'object' && 'userId' in req.query) {
      userId = req.query['userId'];
    }
    if (!userId) return res.status(400).json({ error: 'Usuario no autenticado' });

    // Traer caballos del usuario (reutilizamos CaballoService)
    const caballosResp = await CaballoService.getAllCaballos({ usuarioId: userId, userRole: 'propietario', limit: 100 });
  const caballos = caballosResp.success && caballosResp.data && caballosResp.data.caballos ? caballosResp.data.caballos : [];
    const caballoIds = caballos.map((c: any) => c.id);

    // Finanzas (nuevo servicio)
    const finanzasResp = await getFinanzasUsuarioYCaballos(userId, caballoIds);
    const finanzas = finanzasResp.success ? finanzasResp.data : [];

    // Tareas (reutilizamos TareaService)
    const tareasResp = await TareaService.getAllTareas({ usuarioId: userId, userRole: 'propietario', limit: 100 });
  const tareas = tareasResp.success && tareasResp.data && tareasResp.data.tareas ? tareasResp.data.tareas : [];

    // Eventos (nuevo servicio)
    const eventosResp = await getEventosPorUsuarioYCaballos(userId, caballoIds, 20);
    const eventos = eventosResp.success ? eventosResp.data : [];

    return res.json({
      finanzas,
      caballos,
      tareas,
      eventos
    });
  } catch (error) {
    console.error('Error en propietarioDashboard:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
