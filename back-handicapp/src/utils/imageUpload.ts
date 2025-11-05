import fs from 'fs/promises';
import { config } from '../config/config';
import { logger } from './logger';
import { optimizeImageToWebP, cleanupTempFile } from './imageOptimize';

// Tipos
export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  secureUrl?: string;
  error?: string;
}

export interface MultipleCloudinaryUploadResult {
  success: boolean;
  uploaded: Array<{
    filePath: string;
    url?: string;
    secureUrl?: string;
    publicId?: string;
  }>;
  failed: Array<{
    filePath: string;
    error: string;
  }>;
  total: number;
  successful: number;
  failedCount: number;
}

// Configuración de Cloudinary
let cloudinaryConfig: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} | null = null;

function getCloudinaryConfig() {
  if (cloudinaryConfig) return cloudinaryConfig;
  
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    cloudinaryConfig = {
      cloudName: config.cloudinary.cloudName,
      apiKey: config.cloudinary.apiKey,
      apiSecret: config.cloudinary.apiSecret,
    };
    return cloudinaryConfig;
  }
  
  return null;
}

/**
 * Sube una imagen a Cloudinary (optimizándola a WebP por defecto)
 */
export async function uploadImageToCloudinary(
  filePath: string,
  options: {
    folder?: string;
    publicId?: string;
    overwrite?: boolean;
    optimize?: boolean; // Por defecto true
  } = {}
): Promise<CloudinaryUploadResult> {
  const cloudinaryConfig = getCloudinaryConfig();
  const shouldOptimize = options.optimize !== false; // Por defecto optimizar
  
  if (!cloudinaryConfig) {
    return {
      success: false,
      error: 'Cloudinary no está configurado. Verifica CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET',
    };
  }

  let tempPath: string | undefined;
  let buffer: Buffer;

  try {
    // Optimizar imagen a WebP
    if (shouldOptimize) {
      const optimized = await optimizeImageToWebP(filePath);
      buffer = optimized.buffer;
      if (optimized.tempPath) {
        tempPath = optimized.tempPath;
      }
    } else {
      buffer = await fs.readFile(filePath);
    }

    // Configurar Cloudinary
    const cloudinaryModule = await import('cloudinary');
    const cloudinary = cloudinaryModule.v2;
    
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });

    const uploadOptions: any = {
      resource_type: 'image',
      folder: options.folder || 'handicapp',
      overwrite: options.overwrite ?? true,
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    // Subir a Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: any, result: any) => {
          if (error) {
            logger.error('Error subiendo a Cloudinary', { error: error.message, filePath });
            resolve({
              success: false,
              error: error.message || 'Error desconocido al subir a Cloudinary',
            });
          } else {
            logger.info('Imagen subida a Cloudinary', {
              publicId: result.public_id,
              url: result.secure_url,
              optimized: shouldOptimize,
            });
            resolve({
              success: true,
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      ).end(buffer);
    });

    // Limpiar archivo temporal si existe
    if (tempPath) {
      await cleanupTempFile(tempPath);
    }

    return result;
  } catch (error: any) {
    // Limpiar archivo temporal en caso de error
    if (tempPath) {
      await cleanupTempFile(tempPath);
    }
    
    logger.error('Error en uploadImageToCloudinary', { error: error.message, filePath });
    return {
      success: false,
      error: error.message || 'Error desconocido',
    };
  }
}

/**
 * Sube múltiples imágenes a Cloudinary (optimizadas a WebP)
 */
export async function uploadMultipleImagesToCloudinary(
  filePaths: string[],
  options: {
    folder?: string;
    overwrite?: boolean;
    optimize?: boolean; // Por defecto true
  } = {}
): Promise<MultipleCloudinaryUploadResult> {
  const results = await Promise.all(
    filePaths.map(async (filePath) => {
      const result = await uploadImageToCloudinary(filePath, options);
      return { filePath, ...result };
    })
  );

  const uploaded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success).map(r => ({
    filePath: r.filePath,
    error: r.error || 'Error desconocido',
  }));

  logger.info('Subida múltiple a Cloudinary completada', {
    total: results.length,
    successful: uploaded.length,
    failed: failed.length,
    optimized: options.optimize !== false,
  });

  return {
    success: failed.length === 0,
    uploaded: uploaded.map(r => {
      const item: {
        filePath: string;
        url?: string;
        secureUrl?: string;
        publicId?: string;
      } = { filePath: r.filePath };
      if (r.url) item.url = r.url;
      if (r.secureUrl) item.secureUrl = r.secureUrl;
      if (r.publicId) item.publicId = r.publicId;
      return item;
    }),
    failed,
    total: results.length,
    successful: uploaded.length,
    failedCount: failed.length,
  };
}
