/**
 * Script para agregar columnas de llaves foráneas al modelo Notificacion
 * 
 * Agrega:
 * - evento_id (FK a eventos)
 * - tarea_id (FK a tareas)
 * - Índices para optimizar consultas
 * 
 * Uso:
 *   npx ts-node scripts/add-notificacion-foreign-keys.ts
 */

import { sequelize } from '../src/config/database';
import { logger } from '../src/utils/logger';

async function addNotificacionForeignKeys() {
  try {
    logger.info('🚀 Iniciando migración de notificaciones...');

    // Verificar conexión
    await sequelize.authenticate();
    logger.info('✅ Conexión a base de datos establecida');

    // Agregar columna evento_id si no existe
    logger.info('📝 Agregando columna evento_id...');
    await sequelize.query(`
      ALTER TABLE notificaciones
      ADD COLUMN IF NOT EXISTS evento_id INTEGER REFERENCES eventos(id) ON DELETE SET NULL;
    `);
    logger.info('✅ Columna evento_id agregada');

    // Agregar columna tarea_id si no existe
    logger.info('📝 Agregando columna tarea_id...');
    await sequelize.query(`
      ALTER TABLE notificaciones
      ADD COLUMN IF NOT EXISTS tarea_id INTEGER REFERENCES tareas(id) ON DELETE SET NULL;
    `);
    logger.info('✅ Columna tarea_id agregada');

    // Crear índice para evento_id si no existe
    logger.info('📝 Creando índice ix_notif_evento...');
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS ix_notif_evento ON notificaciones(evento_id);
    `);
    logger.info('✅ Índice ix_notif_evento creado');

    // Crear índice para tarea_id si no existe
    logger.info('📝 Creando índice ix_notif_tarea...');
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS ix_notif_tarea ON notificaciones(tarea_id);
    `);
    logger.info('✅ Índice ix_notif_tarea creado');

    // Verificar las columnas agregadas
    logger.info('🔍 Verificando estructura de la tabla...');
    const [columns]: any = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'notificaciones'
      AND column_name IN ('evento_id', 'tarea_id');
    `);

    logger.info('📊 Columnas verificadas:');
    columns.forEach((col: any) => {
      logger.info(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Verificar los índices creados
    const [indexes]: any = await sequelize.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'notificaciones'
      AND indexname IN ('ix_notif_evento', 'ix_notif_tarea');
    `);

    logger.info('📊 Índices verificados:');
    indexes.forEach((idx: any) => {
      logger.info(`   - ${idx.indexname}`);
    });

    logger.info('🎉 Migración completada exitosamente!');
    logger.info('');
    logger.info('📝 Resumen:');
    logger.info('   ✅ Columna evento_id agregada');
    logger.info('   ✅ Columna tarea_id agregada');
    logger.info('   ✅ Índice ix_notif_evento creado');
    logger.info('   ✅ Índice ix_notif_tarea creado');
    logger.info('');
    logger.info('💡 Próximos pasos:');
    logger.info('   1. Reiniciar el servidor backend');
    logger.info('   2. Probar endpoints de notificaciones');
    logger.info('   3. Verificar triggers automáticos (crear tarea/evento)');

    process.exit(0);
  } catch (error: any) {
    logger.error('❌ Error durante la migración:', { 
      error: error.message,
      stack: error.stack 
    });
    process.exit(1);
  }
}

// Ejecutar migración
addNotificacionForeignKeys();
