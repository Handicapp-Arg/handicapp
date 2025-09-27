import { checkDatabaseHealth, sequelize } from '../config/database';
import { logger } from '../utils/logger';
import { config } from '../config/config';

async function diagnoseSystem() {
  logger.info('🔍 Iniciando diagnóstico del sistema...');
  
  console.log('\n📋 CONFIGURACIÓN ACTUAL:');
  console.log(`- Entorno: ${config.nodeEnv}`);
  console.log(`- Puerto del servidor: ${config.port}`);
  console.log(`- Base de datos: ${config.database.host}:${config.database.port}/${config.database.name}`);
  console.log(`- Usuario DB: ${config.database.user}`);
  
  // 1. Test de conexión a la base de datos
  console.log('\n🔌 PROBANDO CONEXIÓN A LA BASE DE DATOS...');
  try {
    const isHealthy = await checkDatabaseHealth();
    if (isHealthy) {
      console.log('✅ Conexión a la base de datos: OK');
      
      // 2. Test de modelos
      console.log('\n📊 PROBANDO MODELOS...');
      try {
        // Import models
        const { User } = await import('../models/User');
        const { Role } = await import('../models/roles');
        
        console.log('✅ Modelos importados correctamente');
        
        // Test queries
        console.log('\n🔍 PROBANDO CONSULTAS...');
        
        const userCount = await User.count();
        console.log(`- Usuarios en la DB: ${userCount}`);
        
        const roleCount = await Role.count();
        console.log(`- Roles en la DB: ${roleCount}`);
        
        if (roleCount === 0) {
          console.log('⚠️  No hay roles en la base de datos. Ejecuta el seed.');
        }
        
        if (userCount === 0) {
          console.log('⚠️  No hay usuarios en la base de datos. Ejecuta el seed.');
        }
        
        // Test usuario admin
        const adminUser = await User.findOne({ 
          where: { email: 'admin@handicapp.com' },
          include: [{ model: Role, as: 'rol' }]
        });
        
        if (adminUser) {
          console.log('✅ Usuario admin encontrado');
          console.log(`- Nombre: ${adminUser.nombre} ${adminUser.apellido}`);
          console.log(`- Rol: ${adminUser.rol?.nombre || 'Sin rol'}`);
        } else {
          console.log('❌ Usuario admin no encontrado');
        }
        
      } catch (error) {
        console.log('❌ Error con los modelos:', error instanceof Error ? error.message : String(error));
      }
      
    } else {
      console.log('❌ No se puede conectar a la base de datos');
      console.log('💡 Soluciones posibles:');
      console.log('  1. Verifica que PostgreSQL esté corriendo');
      console.log('  2. Verifica las credenciales en el .env');
      console.log('  3. Crea la base de datos si no existe');
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error instanceof Error ? error.message : String(error));
  }
  
  // 3. Información adicional
  console.log('\n📝 INFORMACIÓN ADICIONAL:');
  console.log(`- El frontend debería conectar a: http://localhost:${config.port}`);
  console.log(`- Asegúrate de que el frontend use el puerto correcto`);
  
  await sequelize.close();
  console.log('\n✅ Diagnóstico completado');
}

// Ejecutar diagnóstico si se llama directamente
if (require.main === module) {
  diagnoseSystem().catch(console.error);
}

export { diagnoseSystem };