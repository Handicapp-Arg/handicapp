#!/usr/bin/env node

/**
 * Script para configurar la base de datos PostgreSQL para HandicApp
 * Este script crea la base de datos y el usuario si no existen
 */

import { Client } from 'pg';
import { config } from '../src/config/config';

const ADMIN_DB_CONFIG = {
  host: config.database.host,
  port: config.database.port,
  user: 'postgres', // Usuario admin por defecto de PostgreSQL
  password: process.env.POSTGRES_ADMIN_PASSWORD || 'postgres', // Cambiar por la contraseña real
  database: 'postgres', // Base de datos por defecto
};

async function setupDatabase() {
  console.log('🚀 Configurando base de datos HandicApp...\n');
  
  const adminClient = new Client(ADMIN_DB_CONFIG);
  
  try {
    await adminClient.connect();
    console.log('✅ Conectado como administrador de PostgreSQL');
    
    // 1. Crear usuario si no existe
    try {
      await adminClient.query(`
        CREATE USER ${config.database.user} 
        WITH PASSWORD '${config.database.password}' 
        CREATEDB LOGIN;
      `);
      console.log(`✅ Usuario '${config.database.user}' creado`);
    } catch (error) {
      if ((error as any).code === '42710') {
        console.log(`ℹ️  Usuario '${config.database.user}' ya existe`);
      } else {
        throw error;
      }
    }
    
    // 2. Crear base de datos si no existe
    try {
      await adminClient.query(`
        CREATE DATABASE ${config.database.name} 
        WITH OWNER ${config.database.user} 
        ENCODING 'UTF8';
      `);
      console.log(`✅ Base de datos '${config.database.name}' creada`);
    } catch (error) {
      if ((error as any).code === '42P04') {
        console.log(`ℹ️  Base de datos '${config.database.name}' ya existe`);
      } else {
        throw error;
      }
    }
    
    // 3. Otorgar permisos
    await adminClient.query(`
      GRANT ALL PRIVILEGES ON DATABASE ${config.database.name} TO ${config.database.user};
    `);
    console.log(`✅ Permisos otorgados a '${config.database.user}'`);
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    throw error;
  } finally {
    await adminClient.end();
  }
  
  // 4. Probar conexión con el usuario de la aplicación
  console.log('\n🔍 Probando conexión con el usuario de la aplicación...');
  
  const appClient = new Client({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
  });
  
  try {
    await appClient.connect();
    await appClient.query('SELECT NOW()');
    console.log('✅ Conexión de aplicación exitosa');
  } catch (error) {
    console.error('❌ Error en conexión de aplicación:', error);
    throw error;
  } finally {
    await appClient.end();
  }
  
  console.log('\n🎉 Base de datos configurada correctamente!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Ejecuta: npm run dev (para iniciar el servidor)');
  console.log('2. El servidor sincronizará las tablas automáticamente');
  console.log('3. Ejecuta el seed para crear datos iniciales');
}

if (require.main === module) {
  setupDatabase().catch((error) => {
    console.error('💥 Falló la configuración:', error);
    process.exit(1);
  });
}

export { setupDatabase };