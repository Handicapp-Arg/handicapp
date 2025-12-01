import { connectDatabase } from '../src/config/database';
import { initializeModels } from '../src/models';
import { sequelize } from '../src/config/database';
import { seedDatabase } from '../src/services/seedService';

async function initializeApp() {
  try {
    console.log('🚀 Inicializando HandicApp Backend...\n');
    
    // 1. Conectar a la base de datos
    console.log('📡 Conectando a la base de datos...');
    await connectDatabase();
    
    // 2. Inicializar modelos y relaciones
    console.log('🏗️ Inicializando modelos y relaciones...');
    initializeModels(sequelize);
    
    // 3. Sincronizar modelos (crear tablas)
    console.log('📊 Sincronizando modelos de base de datos...');
    const forceReset = process.env['DB_RESET_ON_START'] === 'true';
    if (forceReset) {
      await sequelize.sync({ force: true });
      console.log('⚠️  Base de datos reseteada (FORCE mode)');
    } else {
      await sequelize.sync({ alter: true });
      console.log('✅ Base de datos sincronizada');
    }
    
    // 4. Ejecutar seeds (datos iniciales)
    console.log('🌱 Ejecutando seeds...');
    await seedDatabase();
    
    console.log('\n✅ ¡Inicialización completada exitosamente!');
    console.log('\n📝 Información importante:');
    console.log('- Usuario admin: admin@handicapp.com');
    console.log('- Contraseña admin: admin123');
    console.log('- El servidor está listo para iniciar');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la inicialización:', error);
    console.log('\n💡 Soluciones posibles:');
    console.log('1. Verifica que PostgreSQL esté corriendo');
    console.log('2. Verifica las credenciales en el archivo .env');
    console.log('3. Asegúrate de que la base de datos existe');
    console.log('4. Revisa los permisos del usuario de base de datos');
    
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeApp();
}

export { initializeApp };