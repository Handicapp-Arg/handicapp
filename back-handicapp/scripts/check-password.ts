import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import bcrypt from 'bcrypt';

async function checkPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    const user = await User.findOne({ where: { email: 'establecimiento1@test.com' } });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('Usuario encontrado:');
    console.log('  Email:', user.email);
    console.log('  Hash almacenado:', user.hash_contrasena.substring(0, 30) + '...');
    console.log('  Verificado:', user.verificado);
    console.log('  Estado:', user.estado_usuario);
    
    // Probar varias contraseñas
    const passwords = ['Test1234!', 'test1234!', 'Test1234', 'password123', 'admin123', 'Handicapp2024!'];
    
    console.log('\nProbando contraseñas:');
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, user.hash_contrasena);
      console.log(`  ${pwd}: ${isValid ? '✅ VÁLIDA' : '❌'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkPassword();
