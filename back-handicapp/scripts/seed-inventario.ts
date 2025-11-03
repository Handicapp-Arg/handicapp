// Script para insertar datos de prueba en el inventario
import { config as loadEnv } from 'dotenv';
import { sequelize } from '../src/config/database';
import { Producto } from '../src/models/inventario';

loadEnv();

async function seedInventario() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Buscar el primer establecimiento disponible
    const result = await sequelize.query('SELECT id FROM establecimientos LIMIT 1');
    const establecimientos = result[0] as any[];
    
    if (establecimientos.length === 0) {
      console.error('❌ No hay establecimientos en la base de datos');
      process.exit(1);
    }

    const establecimientoId = establecimientos[0].id;
    console.log(`📍 Usando establecimiento ID: ${establecimientoId}`);

    // Insertar productos de prueba
    const productos = [
      {
        establecimiento_id: establecimientoId,
        categoria_id: 1,
        codigo: 'ALI-001',
        nombre: 'Heno Premium',
        descripcion: 'Heno de alfalfa de alta calidad',
        unidad_medida: 'kg',
        precio_unitario: 150.00,
        stock_actual: 500,
        stock_minimo: 200,
        stock_maximo: 1000,
        estado: 'activo',
      },
      {
        establecimiento_id: establecimientoId,
        categoria_id: 1,
        codigo: 'ALI-002',
        nombre: 'Avena Grano',
        descripcion: 'Avena en grano para alimentación',
        unidad_medida: 'kg',
        precio_unitario: 80.00,
        stock_actual: 150,
        stock_minimo: 100,
        stock_maximo: 500,
        estado: 'activo',
      },
      {
        establecimiento_id: establecimientoId,
        categoria_id: 2,
        codigo: 'MED-001',
        nombre: 'Ivermectina',
        descripcion: 'Antiparasitario de amplio espectro',
        unidad_medida: 'unidad',
        precio_unitario: 1200.00,
        stock_actual: 5,
        stock_minimo: 3,
        stock_maximo: 15,
        estado: 'activo',
      },
      {
        establecimiento_id: establecimientoId,
        categoria_id: 3,
        codigo: 'EQU-001',
        nombre: 'Silla de Montar',
        descripcion: 'Silla de montar inglesa profesional',
        unidad_medida: 'unidad',
        precio_unitario: 25000.00,
        stock_actual: 2,
        stock_minimo: 1,
        stock_maximo: 5,
        estado: 'activo',
      },
      {
        establecimiento_id: establecimientoId,
        categoria_id: 4,
        codigo: 'CUI-001',
        nombre: 'Shampoo Equino',
        descripcion: 'Shampoo especial para caballos',
        unidad_medida: 'litro',
        precio_unitario: 450.00,
        stock_actual: 10,
        stock_minimo: 5,
        stock_maximo: 20,
        estado: 'activo',
      },
    ];

    for (const productoData of productos) {
      try {
        await Producto.create(productoData as any);
        console.log(`✅ Producto creado: ${productoData.nombre}`);
      } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(`⚠️  Producto ya existe: ${productoData.nombre}`);
        } else {
          console.error(`❌ Error creando producto ${productoData.nombre}:`, error.message);
        }
      }
    }

    console.log('\n✨ Proceso completado');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedInventario();
