import { sequelize } from '../src/config/database';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const [users] = await sequelize.query(`
      SELECT 
        u.id, 
        u.email, 
        u.nombre, 
        u.apellido, 
        u.rol_id,
        u.establecimiento_id,
        r.nombre as rol_nombre,
        r.clave as rol_clave
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id
    `);

    console.log('\n=== USUARIOS EN LA BASE DE DATOS ===\n');
    (users as any[]).forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Nombre: ${user.nombre} ${user.apellido}`);
      console.log(`  Rol: ${user.rol_clave} (${user.rol_nombre})`);
      console.log(`  Rol ID: ${user.rol_id}`);
      console.log(`  Establecimiento ID: ${user.establecimiento_id || 'NULL'}`);
      console.log('');
    });

    console.log(`Total: ${(users as any[]).length} usuarios\n`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
