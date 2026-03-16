// src/services/pushNotificationService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Push Notifications
// -----------------------------------------------------------------------------

import webpush from 'web-push';
import { PushSubscription } from '../models/PushSubscription';
import { logger } from '../utils/logger';
import { ServiceResponse } from '../types';

// Configurar VAPID
const vapidPublicKey = process.env['VAPID_PUBLIC_KEY'];
const vapidPrivateKey = process.env['VAPID_PRIVATE_KEY'];
const vapidSubject = process.env['VAPID_SUBJECT'] || 'mailto:info@handicapp.com.ar';

if (!vapidPublicKey || !vapidPrivateKey) {
  logger.error('❌ VAPID keys no configuradas. Push notifications no funcionarán.');
  logger.error('   Ejecuta: npx web-push generate-vapid-keys');
} else {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  logger.debug('VAPID configured');
}

// Interfaces
interface SubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PushNotificationService {
  /**
   * Suscribir usuario a push notifications
   */
  static async subscribe(
    userId: number,
    subscription: SubscriptionData,
    userAgent?: string
  ): Promise<ServiceResponse<PushSubscription>> {
    try {
      // Verificar si ya existe esta suscripción
      const existing = await PushSubscription.findOne({
        where: { endpoint: subscription.endpoint },
      });

      if (existing) {
        // Actualizar si es necesario
        if (existing.user_id !== userId) {
          await existing.update({ user_id: userId });
        }
        
        logger.info(`✅ Suscripción actualizada para usuario ${userId}`);
        return {
          success: true,
          data: existing,
        };
      }

      // Crear nueva suscripción
      const newSubscription = await PushSubscription.create({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        user_agent: userAgent || null,
      });

      logger.info(`✅ Nueva suscripción creada para usuario ${userId}`);
      return {
        success: true,
        data: newSubscription,
      };
    } catch (error: any) {
      logger.error('Error al suscribir a push notifications:', error);
      return {
        success: false,
        error: 'Error al suscribir a notificaciones',
      };
    }
  }

  /**
   * Desuscribir usuario de push notifications
   */
  static async unsubscribe(
    userId: number,
    endpoint: string
  ): Promise<ServiceResponse<void>> {
    try {
      const subscription = await PushSubscription.findOne({
        where: { user_id: userId, endpoint },
      });

      if (!subscription) {
        return {
          success: false,
          error: 'Suscripción no encontrada',
        };
      }

      await subscription.destroy();
      
      logger.info(`✅ Usuario ${userId} desuscrito de push notifications`);
      return {
        success: true,
      };
    } catch (error: any) {
      logger.error('Error al desuscribir de push notifications:', error);
      return {
        success: false,
        error: 'Error al desuscribir de notificaciones',
      };
    }
  }

  /**
   * Obtener suscripciones de un usuario
   */
  static async getUserSubscriptions(
    userId: number
  ): Promise<ServiceResponse<PushSubscription[]>> {
    try {
      const subscriptions = await PushSubscription.findAll({
        where: { user_id: userId },
      });

      return {
        success: true,
        data: subscriptions,
      };
    } catch (error: any) {
      logger.error('Error al obtener suscripciones:', error);
      return {
        success: false,
        error: 'Error al obtener suscripciones',
      };
    }
  }

  /**
   * Enviar notificación a un usuario específico
   */
  static async sendToUser(
    userId: number,
    payload: NotificationPayload
  ): Promise<ServiceResponse<{ sent: number; failed: number }>> {
    try {
      // Obtener todas las suscripciones del usuario
      const subscriptionsResult = await this.getUserSubscriptions(userId);
      
      if (!subscriptionsResult.success || !subscriptionsResult.data) {
        return {
          success: false,
          error: 'Usuario no tiene suscripciones activas',
        };
      }

      const subscriptions = subscriptionsResult.data;
      
      if (subscriptions.length === 0) {
        return {
          success: false,
          error: 'Usuario no tiene suscripciones activas',
        };
      }

      // Preparar payload
      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/logos/logo-icon-brown.png',
        badge: payload.badge || '/logos/logo-icon-brown.png',
        image: payload.image,
        data: payload.data || {},
        tag: payload.tag || `notification-${Date.now()}`,
        requireInteraction: payload.requireInteraction || false,
        actions: payload.actions || [],
      });

      // Enviar a todas las suscripciones del usuario
      let sent = 0;
      let failed = 0;

      const promises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh_key,
                auth: subscription.auth_key,
              },
            },
            notificationPayload
          );
          sent++;
          logger.info(`✅ Notificación enviada a usuario ${userId} (endpoint: ${subscription.endpoint.substring(0, 50)}...)`);
        } catch (error: any) {
          failed++;
          
          // Si el endpoint ya no es válido (410 Gone), eliminarlo
          if (error.statusCode === 410) {
            await subscription.destroy();
            logger.warn(`⚠️  Suscripción inválida eliminada (410 Gone): ${subscription.endpoint.substring(0, 50)}...`);
          } else {
            logger.error(`❌ Error enviando notificación a ${subscription.endpoint.substring(0, 50)}...:`, error.body || error.message);
          }
        }
      });

      await Promise.all(promises);

      logger.info(`📊 Push notifications enviadas a usuario ${userId}: ${sent} éxito, ${failed} fallos`);

      return {
        success: true,
        data: { sent, failed },
      };
    } catch (error: any) {
      logger.error('Error al enviar notificaciones push:', error);
      return {
        success: false,
        error: 'Error al enviar notificaciones',
      };
    }
  }

  /**
   * Enviar notificación a múltiples usuarios
   */
  static async sendToUsers(
    userIds: number[],
    payload: NotificationPayload
  ): Promise<ServiceResponse<{ sent: number; failed: number }>> {
    try {
      let totalSent = 0;
      let totalFailed = 0;

      const promises = userIds.map(async (userId) => {
        const result = await this.sendToUser(userId, payload);
        if (result.success && result.data) {
          totalSent += result.data.sent;
          totalFailed += result.data.failed;
        }
      });

      await Promise.all(promises);

      logger.info(`📊 Push notifications enviadas a ${userIds.length} usuarios: ${totalSent} éxito, ${totalFailed} fallos`);

      return {
        success: true,
        data: { sent: totalSent, failed: totalFailed },
      };
    } catch (error: any) {
      logger.error('Error al enviar notificaciones a múltiples usuarios:', error);
      return {
        success: false,
        error: 'Error al enviar notificaciones',
      };
    }
  }

  /**
   * Enviar notificación a todos los usuarios de un establecimiento
   */
  static async sendToEstablecimiento(
    establecimientoId: number,
    payload: NotificationPayload
  ): Promise<ServiceResponse<{ sent: number; failed: number }>> {
    try {
      // Obtener usuarios del establecimiento
      const { MembresiaUsuarioEstablecimiento } = await import('../models/MembresiaUsuarioEstablecimiento');
      
      const memberships = await MembresiaUsuarioEstablecimiento.findAll({
        where: { 
          establecimiento_id: establecimientoId,
          fecha_fin: null, // Solo membresías activas
        },
        attributes: ['usuario_id'],
      });

      const userIds = memberships.map((m: any) => m.usuario_id);

      if (userIds.length === 0) {
        return {
          success: false,
          error: 'No hay usuarios en el establecimiento',
        };
      }

      return await this.sendToUsers(userIds, payload);
    } catch (error: any) {
      logger.error('Error al enviar notificaciones al establecimiento:', error);
      return {
        success: false,
        error: 'Error al enviar notificaciones al establecimiento',
      };
    }
  }

  /**
   * Enviar notificación de prueba
   */
  static async sendTestNotification(
    userId: number
  ): Promise<ServiceResponse<{ sent: number; failed: number }>> {
    return await this.sendToUser(userId, {
      title: 'HandicApp - Notificación de Prueba',
      body: 'Las notificaciones push están funcionando correctamente ✅',
      icon: '/logos/logo-icon-brown.png',
      badge: '/logos/logo-icon-brown.png',
      tag: 'test-notification',
      data: {
        url: '/dashboard',
        type: 'test',
      },
    });
  }
}

export default PushNotificationService;
