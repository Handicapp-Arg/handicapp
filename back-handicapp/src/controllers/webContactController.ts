import { Request, Response } from 'express';
import { WebContact } from '../models/WebContact';
import { ApiResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class WebContactController {
  // Guardar contacto desde la web
  static async create(req: Request, res: Response) {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json(ApiResponse.error('Missing required fields'));
      }
      const contact = await WebContact.create({ name, email, message });
      return res.json(ApiResponse.success(contact, 'Contact saved'));
    } catch (error) {
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
