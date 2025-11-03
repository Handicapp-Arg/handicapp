import { Router, Request, Response } from 'express';
import { PushNotificationService } from '../services/pushNotificationService';
import { requireAuth } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router: Router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

/**
 * POST /api/push/subscribe
 * Suscribir usuario a push notifications
 * 
 * Body:
 * {
 *   "subscription": {
 *     "endpoint": "https://...",
 *     "keys": {
 *       "p256dh": "...",
 *       "auth": "..."
 *     }
 *   },
 *   "userAgent": "Mozilla/5.0..." (opcional)
 * }
 */
router.post(
  '/subscribe',
  [
    body('subscription').isObject().withMessage('subscription debe ser un objeto'),
    body('subscription.endpoint').isURL().withMessage('endpoint debe ser una URL válida'),
    body('subscription.keys').isObject().withMessage('keys debe ser un objeto'),
    body('subscription.keys.p256dh').isString().withMessage('p256dh es requerido'),
    body('subscription.keys.auth').isString().withMessage('auth es requerido'),
    body('userAgent').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos de suscripción inválidos',
        errors: errors.array() 
      });
    }

    try {
      const userId = req.user!.id;
      const { subscription, userAgent } = req.body;

      const result = await PushNotificationService.subscribe(
        userId,
        subscription,
        userAgent
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al suscribir a push notifications:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al procesar la suscripción' 
      });
    }
  }
);

/**
 * POST /api/push/unsubscribe
 * Desuscribir usuario de push notifications
 * 
 * Body:
 * {
 *   "endpoint": "https://..."
 * }
 */
router.post(
  '/unsubscribe',
  [
    body('endpoint').isURL().withMessage('endpoint debe ser una URL válida'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Endpoint inválido',
        errors: errors.array() 
      });
    }

    try {
      const userId = req.user!.id;
      const { endpoint } = req.body;

      const result = await PushNotificationService.unsubscribe(userId, endpoint);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al desuscribir de push notifications:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al procesar la desuscripción' 
      });
    }
  }
);

/**
 * GET /api/push/subscriptions
 * Obtener todas las suscripciones del usuario actual
 */
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await PushNotificationService.getUserSubscriptions(userId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error al obtener suscripciones:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener las suscripciones' 
    });
  }
});

/**
 * POST /api/push/test
 * Enviar notificación de prueba al usuario actual
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await PushNotificationService.sendTestNotification(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error al enviar notificación de prueba:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al enviar la notificación de prueba' 
    });
  }
});

/**
 * POST /api/push/send
 * Enviar notificación personalizada a usuarios específicos
 * (Solo admin/veterinario/cuidador)
 * 
 * Body:
 * {
 *   "userIds": [1, 2, 3],
 *   "title": "Título",
 *   "body": "Mensaje",
 *   "icon": "/icon.png" (opcional),
 *   "badge": "/badge.png" (opcional),
 *   "data": { ... } (opcional)
 * }
 */
router.post(
  '/send',
  [
    body('userIds').isArray().withMessage('userIds debe ser un array'),
    body('userIds.*').isInt().withMessage('Cada userId debe ser un número entero'),
    body('title').isString().notEmpty().withMessage('title es requerido'),
    body('body').isString().notEmpty().withMessage('body es requerido'),
    body('icon').optional().isString(),
    body('badge').optional().isString(),
    body('data').optional().isObject(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos de notificación inválidos',
        errors: errors.array() 
      });
    }

    try {
      // Verificar permisos (solo roles con permisos pueden enviar)
      const userRole = req.user!.rol?.clave;
      const allowedRoles = ['admin', 'veterinario', 'cuidador'];
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          message: 'No tienes permisos para enviar notificaciones' 
        });
      }

      const { userIds, title, body, icon, badge, data } = req.body;

      const result = await PushNotificationService.sendToUsers(userIds, {
        title,
        body,
        icon,
        badge,
        data,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al enviar notificaciones:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al enviar las notificaciones' 
      });
    }
  }
);

/**
 * POST /api/push/send-to-establecimiento
 * Enviar notificación a todos los usuarios de un establecimiento
 * (Solo admin/veterinario/cuidador)
 * 
 * Body:
 * {
 *   "establecimientoId": 1,
 *   "title": "Título",
 *   "body": "Mensaje",
 *   "icon": "/icon.png" (opcional),
 *   "badge": "/badge.png" (opcional),
 *   "data": { ... } (opcional)
 * }
 */
router.post(
  '/send-to-establecimiento',
  [
    body('establecimientoId').isInt().withMessage('establecimientoId debe ser un número entero'),
    body('title').isString().notEmpty().withMessage('title es requerido'),
    body('body').isString().notEmpty().withMessage('body es requerido'),
    body('icon').optional().isString(),
    body('badge').optional().isString(),
    body('data').optional().isObject(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos de notificación inválidos',
        errors: errors.array() 
      });
    }

    try {
      // Verificar permisos
      const userRole = req.user!.rol?.clave;
      const allowedRoles = ['admin', 'veterinario', 'cuidador'];
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          message: 'No tienes permisos para enviar notificaciones' 
        });
      }

      const { establecimientoId, title, body, icon, badge, data } = req.body;

      const result = await PushNotificationService.sendToEstablecimiento(
        establecimientoId,
        { title, body, icon, badge, data }
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al enviar notificaciones al establecimiento:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al enviar las notificaciones' 
      });
    }
  }
);

/**
 * GET /api/push/vapid-public-key
 * Obtener la clave pública VAPID (necesaria para el frontend)
 */
router.get('/vapid-public-key', (_req: Request, res: Response) => {
  const publicKey = process.env['VAPID_PUBLIC_KEY'];
  
  if (!publicKey) {
    return res.status(500).json({ 
      success: false, 
      message: 'Clave pública VAPID no configurada' 
    });
  }

  return res.status(200).json({ 
    success: true, 
    data: { publicKey } 
  });
});

export default router;
