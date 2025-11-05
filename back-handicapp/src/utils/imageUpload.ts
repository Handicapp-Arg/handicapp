import fs from 'fs/promises';
import { config } from '../config/config';
import { logger } from './logger';
import sharp from 'sharp';

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
 * Optimiza y convierte una imagen a WebP usando Sharp
 * @param inputPath - Ruta del archivo de entrada
 * @param outputPath - Ruta donde guardar el archivo optimizado (opcional, si no se proporciona se crea temporal)
 * @returns Buffer optimizado y ruta del archivo temporal (si se creó)
 */
async function optimizeImageToWebP(
  inputPath: string,
  outputPath?: string
): Promise<{ buffer: Buffer; tempPath?: string }> {
  try {
    // Leer y optimizar la imagen
    const buffer = await sharp(inputPath)
      .webp({ 
        quality: 85,        // Calidad WebP (0-100)
        effort: 4,          // Esfuerzo de compresión (0-6, más alto = mejor compresión pero más lento)
      })
      .resize(1920, 1920, {  // Limitar tamaño máximo
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    const result: { buffer: Buffer; tempPath?: string } = { buffer };

    // Guardar archivo temporal si no se proporcionó outputPath
    if (!outputPath) {
      const tempPath = `${inputPath}.optimized.webp`;
      await fs.writeFile(tempPath, buffer);
      result.tempPath = tempPath;
    }

    const originalSize = (await fs.stat(inputPath)).size;
    logger.info('Imagen optimizada', {
      original: inputPath,
      originalSize,
      optimizedSize: buffer.length,
      reduction: `${((1 - buffer.length / originalSize) * 100).toFixed(1)}%`,
    });

    return result;
  } catch (error: any) {
    logger.error('Error optimizando imagen', { error: error.message, inputPath });
    throw error;
  }
}

/**
 * Limpia archivos temporales
 */
async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignorar errores al eliminar archivos temporales
  }
}

/**
 * Sube una imagen a Cloudinary (optimizada a WebP)
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
