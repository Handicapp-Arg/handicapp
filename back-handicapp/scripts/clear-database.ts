import { pool } from '../src/config/database';

async function clearDatabase() {
  try {
    console.log('🗑️  Limpiando base de datos...');
    
    // Desactivar foreign keys temporalmente
    await pool.query('SET session_replication_role = replica;');
    
    // Lista de tablas a limpiar (ajustá según tus tablas)
    const tables = [
      'push_subscriptions',
      'notificaciones',
      'asociacion_establecimiento_usuario',
      'asociacion_usuario_evento',
      'eventos',
      'categorias',
      'inventario_movimientos',
      'inventario_items',
      'usuarios',
      'establecimientos',
      'roles',
    ];
    
    // Truncar todas las tablas
    for (const table of tables) {
      try {
        await pool.query(`TRUNCATE TABLE ${table} CASCADE;`);
        console.log(`✅ Tabla ${table} limpiada`);
      } catch (error: any) {
        console.log(`⚠️  No se pudo limpiar ${table}: ${error.message}`);
      }
    }
    
    // Reactivar foreign keys
    await pool.query('SET session_replication_role = DEFAULT;');
    
    console.log('✅ Base de datos limpiada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
    process.exit(1);
  }
}

clearDatabase();
