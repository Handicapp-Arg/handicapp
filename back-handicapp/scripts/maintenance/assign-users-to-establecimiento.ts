import { sequelize } from '../../src/config/database';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Asignar usuarios al establecimiento 5 (Don Pedros)
    const usuariosIds = [6, 7, 8, 10, 11]; // capataz, empleado, veterinario, adrian gomez, fede diaz
    const establecimientoId = 5;

    const [result] = await sequelize.query(`
      UPDATE usuarios 
      SET establecimiento_id = ${establecimientoId}
      WHERE id IN (${usuariosIds.join(',')})
      RETURNING id, email, nombre, apellido
    `);

    console.log('\n✅ Usuarios actualizados:');
    (result as any[]).forEach(user => {
      console.log(`  - ID ${user.id}: ${user.nombre} ${user.apellido} (${user.email})`);
    });
    console.log(`\nEstablecimiento asignado: ${establecimientoId}`);

    // Verificar resultado
    const [usuarios] = await sequelize.query(`
      SELECT 
        u.id, 
        u.email, 
        u.nombre, 
        u.establecimiento_id,
        r.clave as rol
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      WHERE u.id IN (${usuariosIds.join(',')})
    `);

    console.log('\n=== VERIFICACIÓN ===');
    (usuarios as any[]).forEach(u => {
      console.log(`ID ${u.id}: ${u.nombre} - Rol: ${u.rol} - Establecimiento: ${u.establecimiento_id}`);
    });

    await sequelize.close();
    console.log('\n✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
