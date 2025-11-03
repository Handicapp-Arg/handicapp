import { sequelize } from '../src/config/database';
import Categoria from '../src/models/inventario/Categoria';

async function check() {
  try {
    await sequelize.sync();
    const cats = await Categoria.findAll({ raw: true });
    console.log(`✅ Categorías encontradas: ${cats.length}`);
    console.log(JSON.stringify(cats, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

check();
