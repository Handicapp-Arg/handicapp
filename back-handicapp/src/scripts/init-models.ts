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
    // 1. Database connection
    await sequelize.authenticate();

    // 2. Initialize models and relations
    initializeModels(sequelize);

    // 3. Sync database schema
    const resetOnStart = process.env['DB_RESET_ON_START'] === 'true';
    if (resetOnStart) {
      await sequelize.sync({ force: true });
      logger.warn('Database reset (FORCE mode)');
    } else if (process.env['NODE_ENV'] === 'development') {
      try {
        await sequelize.sync({ alter: true });
      } catch (syncError) {
        logger.warn('DB sync skipped — schema may be out of date', { reason: (syncError as Error)?.message });
      }
    }

    // 4. Seed demo data (never block startup)
    try {
      await seedDatabase();
      await TipoEventoSeedService.seedTiposEvento();
    } catch (seedError) {
      logger.warn('Seed skipped', { reason: (seedError as Error)?.message });
    }

    return true;

  } catch (error) {
    logger.error('Initialization failed', { error: (error as Error).message });
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