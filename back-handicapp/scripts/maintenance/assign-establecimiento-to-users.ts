/**
 * Script para asignar establecimiento_id a usuarios con rol 'establecimiento'
 * que no tengan un establecimiento asignado.
 * 
 * Uso:
 *   npm run script:assign-establecimiento
 *   o directamente: ts-node scripts/maintenance/assign-establecimiento-to-users.ts
 */

import { QueryTypes } from 'sequelize';
import { sequelize } from '../../src/config/database';

interface User {
  id: number;
  email: string;
  establecimiento_id: number | null;
  rol_id: number;
}

interface Establecimiento {
  id: number;
  nombre: string;
}

async function assignEstablecimientoToUsers() {
  try {
    console.log('🔍 Verificando estructura de base de datos...');
    
    // Verificar si la columna establecimiento_id existe
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND column_name = 'establecimiento_id';
    `);
    
    if (!columns || columns.length === 0) {
      console.log('⚠️  La columna establecimiento_id no existe en la tabla usuarios.');
      console.log('📝 Creando columna establecimiento_id...');
      
      await sequelize.query(`
        ALTER TABLE usuarios 
        ADD COLUMN establecimiento_id INTEGER REFERENCES establecimientos(id);
      `);
      
      console.log('✅ Columna establecimiento_id creada exitosamente.');
    } else {
      console.log('✅ La columna establecimiento_id ya existe.');
    }
    
    // Obtener el rol_id de 'establecimiento'
    const roles = await sequelize.query<{ id: number }>(`
      SELECT id FROM roles WHERE clave = 'establecimiento' LIMIT 1;
    `, { type: QueryTypes.SELECT });
    
    if (!roles || roles.length === 0) {
      console.log('❌ No se encontró el rol "establecimiento" en la base de datos.');
      return;
    }
    
    const establecimientoRolId = roles[0]!.id;
    console.log(`📋 Rol 'establecimiento' tiene ID: ${establecimientoRolId}`);
    
    // Buscar usuarios con rol establecimiento sin establecimiento_id
    const users = await sequelize.query<User>(`
      SELECT id, email, establecimiento_id, rol_id
      FROM usuarios
      WHERE rol_id = ${establecimientoRolId}
      AND (establecimiento_id IS NULL OR establecimiento_id = 0);
    `, { type: QueryTypes.SELECT });
    
    if (!users || users.length === 0) {
      console.log('✅ Todos los usuarios con rol "establecimiento" ya tienen establecimiento_id asignado.');
      return;
    }
    
    console.log(`\n🔍 Encontrados ${users.length} usuario(s) sin establecimiento asignado:`);
    users.forEach(u => console.log(`   - ID: ${u.id}, Email: ${u.email}`));
    
    // Obtener lista de establecimientos disponibles
    const establecimientos = await sequelize.query<Establecimiento>(`
      SELECT id, nombre
      FROM establecimientos
      ORDER BY id;
    `, { type: QueryTypes.SELECT });
    
    if (!establecimientos || establecimientos.length === 0) {
      console.log('\n❌ No hay establecimientos en la base de datos.');
      console.log('💡 Debes crear al menos un establecimiento primero.');
      return;
    }
    
    console.log(`\n📋 Establecimientos disponibles:`);
    establecimientos.forEach(e => console.log(`   ${e.id}. ${e.nombre}`));
    
    // Estrategia: Asignar el primer establecimiento disponible a cada usuario
    // En producción, esto debería ser manual o con lógica de negocio específica
    const defaultEstablecimientoId = establecimientos[0]!.id;
    
    console.log(`\n⚙️  Asignando establecimiento ID ${defaultEstablecimientoId} (${establecimientos[0]!.nombre}) a usuarios sin establecimiento...`);
    
    for (const user of users) {
      await sequelize.query(`
        UPDATE usuarios
        SET establecimiento_id = ${defaultEstablecimientoId}
        WHERE id = ${user.id};
      `);
      console.log(`   ✅ Usuario ${user.email} (ID: ${user.id}) -> Establecimiento ${defaultEstablecimientoId}`);
    }
    
    console.log(`\n✅ Proceso completado. ${users.length} usuario(s) actualizado(s).`);
    console.log('\n💡 IMPORTANTE: Verifica que las asignaciones sean correctas según tu lógica de negocio.');
    console.log('   Si necesitas cambiar asignaciones, ejecuta manualmente:');
    console.log('   UPDATE usuarios SET establecimiento_id = <ID> WHERE id = <USER_ID>;');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar script
if (require.main === module) {
  assignEstablecimientoToUsers()
    .then(() => {
      console.log('\n🎉 Script finalizado exitosamente.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

export default assignEstablecimientoToUsers;
