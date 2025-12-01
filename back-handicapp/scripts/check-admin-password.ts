import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { Role } from '../src/models/roles';
import { initializeModels } from '../src/models';
import bcrypt from 'bcrypt';

async function checkAdminPassword() {
  try {
    await sequelize.authenticate();
    initializeModels(sequelize);
    
    const admin = await User.findOne({ 
      where: { email: 'admin@handicapp.com' },
      include: [{ model: Role, as: 'rol' }]
    });
    
    if (!admin) {
      console.log('❌ Admin no encontrado');
      return;
    }
    
    console.log('👤 Usuario Admin:');
    console.log('  ID:', admin.id);
    console.log('  Email:', admin.email);
    console.log('  Nombre:', admin.nombre, admin.apellido);
    console.log('  Rol:', admin.rol?.nombre);
    console.log('');
    console.log('🔐 Probando contraseñas:');
    
    const passwords = ['password123', 'Admin123!', 'admin123', 'Admin1234!', 'Handicapp2024!', 'admin', 'test123'];
    
    for (const pwd of passwords) {
      const match = await bcrypt.compare(pwd, admin.hash_contrasena);
      if (match) {
        console.log(`  ✅ ${pwd} ← CORRECTA`);
      } else {
        console.log(`  ❌ ${pwd}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAdminPassword();
