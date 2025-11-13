import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Cargar variables de entorno del archivo de prueba
dotenv.config({ path: '.env.render-test' });

async function testConnection() {
  console.log('🔍 Testing connection to Render PostgreSQL...\n');

  console.log('Configuration:');
  console.log(`  DB_HOST: ${process.env.DB_HOST}`);
  console.log(`  DB_PORT: ${process.env.DB_PORT}`);
  console.log(`  DB_NAME: ${process.env.DB_NAME}`);
  console.log(`  DB_USER: ${process.env.DB_USER}`);
  console.log(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET'}`);
  console.log('');

  // Test 1: Sin SSL
  console.log('📝 Test 1: Connection WITHOUT SSL');
  const sequelizeNoSSL = new Sequelize({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    dialect: 'postgres',
    logging: false,
  });

  try {
    await sequelizeNoSSL.authenticate();
    console.log('✅ Connection WITHOUT SSL successful!\n');
    await sequelizeNoSSL.close();
  } catch (error: any) {
    console.log('❌ Connection WITHOUT SSL failed:');
    console.log(`   Error: ${error.name}`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Code: ${error.original?.code || 'N/A'}\n`);
  }

  // Test 2: Con SSL
  console.log('📝 Test 2: Connection WITH SSL (rejectUnauthorized: false)');
  const sequelizeSSL = new Sequelize({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      connectTimeout: 60000,
    },
  });

  try {
    await sequelizeSSL.authenticate();
    console.log('✅ Connection WITH SSL successful!');
    console.log('');
    console.log('✨ RESULTADO: La conexión requiere SSL');
    console.log('   Agregá DB_SSL=true en las variables de Render');
    await sequelizeSSL.close();
  } catch (error: any) {
    console.log('❌ Connection WITH SSL failed:');
    console.log(`   Error: ${error.name}`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Code: ${error.original?.code || 'N/A'}`);
  }

  process.exit(0);
}

testConnection();
