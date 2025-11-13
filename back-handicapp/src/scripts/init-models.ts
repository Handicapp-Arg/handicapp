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
    logger.info('🚀 Initializing HandicApp...');

    // 1. Database connection
    await sequelize.authenticate();
    logger.info('✅ Database connected');

    // 2. Initialize models and relations
    initializeModels(sequelize);

    // 3. Sync database
    const resetOnStart = process.env['DB_RESET_ON_START'] === 'true';
    if (resetOnStart) {
      await sequelize.sync({ force: true });
      logger.warn('⚠️  Database reset (FORCE mode)');
    } else if (process.env['NODE_ENV'] === 'development') {
      await sequelize.sync({ alter: true });
      logger.debug('Database synced');
    } else {
      // En producción, solo validar modelos sin modificar la BD
      logger.info('⚠️  Skipping sync in production - use migrations instead');
    }

    // 4. Run seeds (silencioso si ya existen)
    try {
      await seedDatabase();
      await TipoEventoSeedService.seedTiposEvento();
      logger.info('✅ Seeds executed successfully');
    } catch (seedError) {
      logger.error('❌ Error during seed process', { error: seedError });
      // En producción sin tablas, esto es esperado - no detener el servidor
      if (process.env['NODE_ENV'] !== 'production') {
        throw seedError;
      }
      logger.warn('⚠️  Continuing without seeds in production mode');
    }

    return true;

  } catch (error) {
    logger.error('❌ Error during initialization', { error });
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  initializeApp().then(() => {
    logger.info('✅ Script de inicialización completado');
    process.exit(0);
  }).catch((error) => {
    logger.error('❌ Error en script de inicialización:', { error });
    process.exit(1);
  });
}

export { initializeApp };