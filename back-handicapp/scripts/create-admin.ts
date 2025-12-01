/**
 * Script para crear un usuario administrador
 * Uso: npx ts-node scripts/create-admin.ts
 */

import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { Role } from '../src/models/roles';
import bcrypt from 'bcrypt';
import { initializeModels } from '../src/models';

async function createAdminUser() {
  try {
    console.log('🔧 Creando usuario administrador...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Inicializar modelos
    initializeModels(sequelize);

    // Datos del admin
    const adminEmail = 'admin@handicapp.com';
    const adminPassword = 'Admin123!'; // Contraseña segura
    
    // Verificar si el admin ya existe
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe');
      console.log('📧 Email:', adminEmail);
      
      // Preguntar si quiere actualizar la contraseña
      const updatePassword = process.argv.includes('--update-password');
      
      if (updatePassword) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await existingAdmin.update({ hash_contrasena: hashedPassword });
        console.log('✅ Contraseña actualizada');
        console.log('🔑 Nueva contraseña:', adminPassword);
      } else {
        console.log('\n💡 Para actualizar la contraseña usa: npx ts-node scripts/create-admin.ts --update-password');
      }
      
      return;
    }

    // Buscar el rol de admin (id: 1)
    const adminRole = await Role.findByPk(1);
    
    if (!adminRole) {
      console.error('❌ No se encontró el rol de administrador (ID: 1)');
      console.log('💡 Asegúrate de haber ejecutado los seeds primero');
      process.exit(1);
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Crear usuario admin
    const admin = await User.create({
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: adminEmail,
      hash_contrasena: hashedPassword,
      rol_id: 1, // Admin role
      verificado: true,
      estado_usuario: 'active',
    });

    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('📋 Detalles del usuario:');
    console.log('  ID:', admin.id);
    console.log('  Nombre:', admin.nombre, admin.apellido);
    console.log('  📧 Email:', admin.email);
    console.log('  🔑 Contraseña:', adminPassword);
    console.log('  🎭 Rol:', adminRole.nombre);
    console.log('\n⚠️  IMPORTANTE: Guarda esta contraseña en un lugar seguro');
    console.log('💡 Puedes cambiar la contraseña desde la aplicación una vez que inicies sesión');

  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar
createAdminUser();
