// src/scripts/init-models.ts
// -----------------------------------------------------------------------------
// HandicApp API - Script de Inicialización de Modelos
// -----------------------------------------------------------------------------

import { sequelize } from '../config/database';
import { initializeModels } from '../models';
import { seedDatabase } from '../services/seedService';
import { TipoEventoSeedService } from '../services/tipoEventoSeedService';
import { logger } from '../utils/logger';

async function initializeApp() {
  try {
    logger.info('🚀 Iniciando inicialización de la aplicación...');

    // 1. Verificar conexión a la base de datos
    logger.info('📊 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    logger.info('✅ Conexión a la base de datos establecida');

    // 2. Inicializar todos los modelos y sus relaciones
    logger.info('🏗️ Inicializando modelos y relaciones...');
    initializeModels(sequelize);
    logger.info('✅ Modelos y relaciones inicializados');

    // 3. Sincronizar la base de datos
    logger.info('🔄 Sincronizando base de datos...');
    if (process.env.NODE_ENV === 'development') {
      // En desarrollo, recrear las tablas
      await sequelize.sync({ force: true });
      logger.info('✅ Base de datos sincronizada (desarrollo - tablas recreadas)');
    } else {
      // En producción, solo actualizar
      await sequelize.sync({ alter: true });
      logger.info('✅ Base de datos sincronizada (producción - actualizada)');
    }

    // 4. Ejecutar seeds básicos
    logger.info('🌱 Ejecutando seeds...');
    
    // Seed de roles y usuarios básicos
    const seedResult = await seedDatabase();
    if (seedResult) {
      logger.info('✅ Roles y usuarios básicos creados');
    } else {
      logger.warn('⚠️ Error en seed de roles y usuarios');
    }

    // Seed de tipos de evento
    const tipoEventoSeedResult = await TipoEventoSeedService.seedTiposEvento();
    if (tipoEventoSeedResult) {
      logger.info('✅ Tipos de evento creados');
    } else {
      logger.warn('⚠️ Error en seed de tipos de evento');
    }

    logger.info('🎉 Inicialización de la aplicación completada exitosamente');
    
    // No cerrar la conexión aquí, se usará en la aplicación
    return true;

  } catch (error) {
    logger.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  initializeApp().then(() => {
    logger.info('✅ Script de inicialización completado');
    process.exit(0);
  }).catch((error) => {
    logger.error('❌ Error en script de inicialización:', error);
    process.exit(1);
  });
}

export { initializeApp };