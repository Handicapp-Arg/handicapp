import { sequelize } from '../src/config/database';
import Categoria from '../src/models/inventario/Categoria';

const categorias = [
  { nombre: 'Alimento', descripcion: 'Alimentos para caballos', color: '#10b981', icono: '🌾' },
  { nombre: 'Medicamentos', descripcion: 'Productos veterinarios', color: '#ef4444', icono: '💊' },
  { nombre: 'Equipamiento', descripcion: 'Sillas, riendas, etc', color: '#3b82f6', icono: '🐴' },
  { nombre: 'Mantenimiento', descripcion: 'Productos de limpieza', color: '#f59e0b', icono: '🧹' },
];

async function seed() {
  try {
    await sequelize.sync();
    console.log('✅ Database connected');

    for (const cat of categorias) {
      const [, wasCreated] = await Categoria.findOrCreate({
        where: { nombre: cat.nombre },
        defaults: cat as any,
      });
      console.log(`${wasCreated ? '✅ Creada' : '⏭️  Ya existe'}: ${cat.nombre}`);
    }

    console.log('✅ Seed completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();
