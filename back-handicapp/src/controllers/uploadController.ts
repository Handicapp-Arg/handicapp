import type { Request, Response } from 'express';
import multer from 'multer';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { uploadImageBufferToCloudinary } from '../utils/imageUpload';

// Multer configuration for memory storage (no disk writes, direct to Cloudinary)
const storage = multer.memoryStorage();

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

      // Subir a Cloudinary desde el buffer
      const folder = 'handicapp/uploads'; // Carpeta genérica para uploads
      const cloud = await uploadImageBufferToCloudinary(file.buffer, file.originalname || 'image', {
        folder,
        overwrite: true,
      });

      if (!cloud.success) {
        logger.error('Cloudinary upload failed', { error: cloud.error });
        res.status(500).json({ success: false, message: cloud.error || 'Error al subir la imagen' });
        return;
      }

      logger.info('Imagen subida a Cloudinary', { publicId: cloud.publicId });

      res.status(201).json({
        success: true,
        message: 'Imagen subida correctamente',
        data: { url: cloud.secureUrl || cloud.url, publicId: cloud.publicId }
      });
    } catch (error: any) {
      logger.error('Error subiendo imagen', { error: error?.message });
      res.status(500).json({ success: false, message: 'Error al subir la imagen' });
    }
  }
}
