import fs from 'fs/promises';
import sharp from 'sharp';
import { logger } from './logger';

/**
 * Optimiza y convierte una imagen a WebP usando Sharp
 * @param inputPath - Ruta del archivo de entrada
 * @param outputPath - Ruta donde guardar el archivo optimizado (opcional)
 * @returns Buffer optimizado y ruta del archivo temporal (si se creó)
 */
export async function optimizeImageToWebP(
  inputPath: string,
  outputPath?: string
): Promise<{ buffer: Buffer; tempPath?: string }> {
  try {
    const buffer = await sharp(inputPath)
      .webp({ quality: 85, effort: 4 })
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    const result: { buffer: Buffer; tempPath?: string } = { buffer };

    if (!outputPath) {
      const tempPath = `${inputPath}.optimized.webp`;
      await fs.writeFile(tempPath, buffer);
      result.tempPath = tempPath;
    } else {
      await fs.writeFile(outputPath, buffer);
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
 * Limpia archivos temporales (ignora errores)
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (_err) {
    // ignore
  }
}
