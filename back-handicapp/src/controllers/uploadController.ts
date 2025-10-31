import type { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';
import { logger } from '../utils/logger';

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), config.upload.path);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const stamp = Date.now();
    cb(null, `${base}_${stamp}${ext.toLowerCase()}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo imágenes JPEG, PNG, WEBP o GIF.'));
  }
};

export const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize }
});

export class UploadController {
  static async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
        return;
      }

  // Build absolute public URL to access the file via static server
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const publicUrl = `${baseUrl}/uploads/${file.filename}`;

      logger.info('Imagen subida', { filename: file.filename, size: file.size });

      res.status(201).json({
        success: true,
        message: 'Imagen subida correctamente',
        data: { url: publicUrl, filename: file.filename }
      });
    } catch (error: any) {
      logger.error('Error subiendo imagen', { error: error?.message });
      res.status(500).json({ success: false, message: 'Error al subir la imagen' });
    }
  }
}
