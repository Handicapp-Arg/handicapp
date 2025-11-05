#!/usr/bin/env ts-node
/**
 * Script de prueba para funciones de subida de imágenes a Cloudinary
 * 
 * Uso:
 *   pnpm run test:image-upload <ruta-imagen>
 *   pnpm run test:image-upload <imagen1> <imagen2> ...
 *   
 * O directamente:
 *   ts-node scripts/test-image-upload.ts <ruta-imagen>
 */

import path from 'path';
import { 
  uploadImageToCloudinary, 
  uploadMultipleImagesToCloudinary 
} from '../src/utils/imageUpload';
import { logger } from '../src/utils/logger';

async function testSingleImage(imagePath: string) {
  console.log('\n📸 Probando subida de UNA imagen...');
  console.log(`📁 Archivo: ${imagePath}`);
  
  const resultado = await uploadImageToCloudinary(imagePath, {
    folder: 'handicapp/test',
    overwrite: true,
  });
  
  if (resultado.success) {
    console.log('✅ ¡Imagen subida exitosamente!');
    console.log(`   URL: ${resultado.secureUrl}`);
    console.log(`   Public ID: ${resultado.publicId}`);
  } else {
    console.log('❌ Error al subir imagen:');
    console.log(`   ${resultado.error}`);
  }
  
  return resultado;
}

async function testMultipleImages(imagePaths: string[]) {
  console.log('\n📸📸 Probando subida de MÚLTIPLES imágenes...');
  console.log(`📁 Archivos: ${imagePaths.join(', ')}`);
  
  const resultado = await uploadMultipleImagesToCloudinary(imagePaths, {
    folder: 'handicapp/test',
    overwrite: true,
  });
  
  console.log(`\n📊 Resultados:`);
  console.log(`   Total: ${resultado.total}`);
  console.log(`   Exitosas: ${resultado.successful}`);
  console.log(`   Fallidas: ${resultado.failedCount}`);
  
  if (resultado.uploaded.length > 0) {
    console.log('\n✅ Imágenes subidas exitosamente:');
    resultado.uploaded.forEach((img, index) => {
      console.log(`   ${index + 1}. ${path.basename(img.filePath)}`);
      console.log(`      URL: ${img.secureUrl}`);
      console.log(`      Public ID: ${img.publicId}`);
    });
  }
  
  if (resultado.failed.length > 0) {
    console.log('\n❌ Imágenes con error:');
    resultado.failed.forEach((img, index) => {
      console.log(`   ${index + 1}. ${path.basename(img.filePath)}`);
      console.log(`      Error: ${img.error}`);
    });
  }
  
  return resultado;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Error: Debes proporcionar al menos una ruta de imagen');
    console.log('\nUso:');
    console.log('  pnpm run test:image-upload <ruta-imagen>');
    console.log('  pnpm run test:image-upload <imagen1> <imagen2> ...');
    console.log('\nEjemplo:');
    console.log('  pnpm run test:image-upload ./test-image.jpg');
    console.log('  pnpm run test:image-upload ./img1.jpg ./img2.png ./img3.webp');
    process.exit(1);
  }
  
  // Verificar que los archivos existen
  const imagePaths = args.map(arg => {
    const fullPath = path.resolve(arg);
    return fullPath;
  });
  
  for (const imagePath of imagePaths) {
    try {
      const fs = await import('fs/promises');
      await fs.access(imagePath);
    } catch (error) {
      console.error(`❌ Error: El archivo no existe: ${imagePath}`);
      process.exit(1);
    }
  }
  
  console.log('🚀 Iniciando pruebas de subida de imágenes a Cloudinary...\n');
  
  try {
    if (imagePaths.length === 1 && imagePaths[0]) {
      // Probar una sola imagen
      await testSingleImage(imagePaths[0]);
    } else if (imagePaths.length > 1) {
      // Probar múltiples imágenes
      await testMultipleImages(imagePaths);
    } else {
      console.error('❌ No se encontraron imágenes válidas');
      process.exit(1);
    }
    
    console.log('\n✅ Pruebas completadas');
  } catch (error: any) {
    console.error('\n❌ Error durante la prueba:');
    console.error(error?.message || String(error));
    logger.error('Error en test de imágenes', { error: error?.message || String(error) });
    process.exit(1);
  }
}

main();

