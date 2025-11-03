import { sequelize } from '../../src/config/database';

async function checkFechas() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    const [tareas]: any = await sequelize.query(
      'SELECT id, titulo, fecha_vencimiento, creado_el FROM tareas ORDER BY id'
    );

    console.log('=== FECHAS EN TAREAS ===\n');
    tareas.forEach((t: any) => {
      console.log(`ID ${t.id}: ${t.titulo}`);
      console.log(`  - fecha_vencimiento: ${t.fecha_vencimiento}`);
      console.log(`  - creado_el: ${t.creado_el}\n`);
    });

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFechas();
