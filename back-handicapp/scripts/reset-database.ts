/**
 * Script para resetear completamente la base de datos
 * ⚠️ ADVERTENCIA: Esto elimina TODOS los datos
 */

import dotenv from 'dotenv';
import { sequelize } from '../src/config/database';
import { initializeModels } from '../src/models';

dotenv.config();

async function resetDatabase() {
  try {
    console.log('⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos\n');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Inicializar modelos
    initializeModels(sequelize);
    console.log('✅ Modelos inicializados\n');

    // Sincronizar con force: true (elimina todas las tablas y las recrea)
    console.log('🗑️  Eliminando todas las tablas y datos...');
    console.log('⚠️  Esto eliminará TODOS los datos existentes\n');
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos reseteada completamente\n');

    console.log('📝 Próximos pasos:');
    console.log('  1. Ejecuta: npm run seed:completo');
    console.log('  2. O ejecuta: npm run init (para seed básico)');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al resetear la base de datos:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetDatabase();
}

export { resetDatabase };

