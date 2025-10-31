import { connectDatabase } from '../src/config/database';

async function syncOnly() {
  try {
    console.log('🔄 Sincronizando modelos SIN borrar datos...\n');
    
    // 1. Conectar a la base de datos
    console.log('📡 Conectando a la base de datos...');
    await connectDatabase();
    
    // 2. Sincronizar modelos SIN forzar (no borra datos)
    console.log('📊 Sincronizando modelos (modo seguro)...');
    const { sequelize } = await import('../src/config/database');
    await sequelize.sync({ alter: false, force: false }); // Modo seguro
    
    console.log('\n✅ ¡Sincronización completada!');
    console.log('- Las tablas existentes se mantuvieron');
    console.log('- Solo se agregaron las que faltaban');
    console.log('- Los datos no fueron eliminados');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncOnly();
}

export { syncOnly };