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
    if (process.env['NODE_ENV'] === 'development') {
      await sequelize.sync({ force: true });
      logger.info('✅ Database synced (development)');
    } else {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database synced (production)');
    }

    // 4. Run seeds
    const seedResult = await seedDatabase();
    const tipoEventoSeedResult = await TipoEventoSeedService.seedTiposEvento();
    
    if (seedResult && tipoEventoSeedResult) {
      logger.info('✅ Seeds completed');
    }

    return true;

  } catch (error) {
    logger.error({ error }, '❌ Error during initialization');
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