import { Request, Response } from 'express';
import { WebContact } from '../models/WebContact';
import { ApiResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { sendEmail } from '../utils/emailSender';
import { webContactNotificationEmail } from '../emails/webContactNotification';
import { logger } from '../utils/logger';

export class WebContactController {
  // Guardar contacto desde la web y enviar notificación por email
  static async create(req: Request, res: Response) {
    try {
      const { name, email, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json(ApiResponse.error('Missing required fields'));
      }
      
      // Guardar en la base de datos
      const contact = await WebContact.create({ name, email, message });
      
      // Enviar notificación por email a info@handicapp.com.ar
      try {
        const emailDate = new Date().toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const emailHtml = webContactNotificationEmail({
          name,
          email,
          message,
          date: emailDate
        });
        
        await sendEmail({
          to: 'info@handicapp.com.ar',
          subject: `🔔Nuevo mensaje de contacto web - ${name}`,
          html: emailHtml
        });
        
        logger.info(`📧 Notificación de contacto web enviada para: ${name} (${email})`);
      } catch (emailError) {
        // Si falla el email, logueamos el error pero no fallar la request
        logger.error('Error enviando email de notificación de contacto:', emailError);
        // Continuar aunque falle el email
      }
      
      return res.json(ApiResponse.success(contact, 'Contact saved'));
    } catch (error) {
      logger.error('Error en webContactController.create:', error);
      return res.status(500).json(ApiResponse.error('Error saving contact'));
    }
  }

  // Listar contactos (solo admin)
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || req.user.rol?.clave !== 'admin') {
        return res.status(403).json(ApiResponse.error('Forbidden'));
      }
      const contacts = await WebContact.findAll({ order: [['created_at', 'DESC']] });
      return res.json(ApiResponse.success(contacts));
    } catch (error) {
      return res.status(500).json(ApiResponse.error('Error fetching contacts'));
    }
  }
}
