import { Sequelize } from 'sequelize';
import { config } from './config';
import { logger } from '../utils/logger';

// Configuración optimizada de la base de datos
const dbConfig = {
  development: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres' as const,
    logging: config.database.logging ? (sql: string) => logger.debug(sql) : false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    },
    dialectOptions: {
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
    },
    retry: {
      max: 3,
      timeout: 60000,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },
    benchmark: true,
    define: {
      timestamps: false,
      underscored: false,
      freezeTableName: true,
      paranoid: false,
    },
  },
  test: {
    username: config.database.user,
    password: config.database.password,
    database: `${config.database.name}_test`,
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres' as const,
    logging: false,
    pool: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 30000,
      acquireTimeout: 30000,
      timeout: 30000,
    },
    define: {
      timestamps: false,
      underscored: false,
      freezeTableName: true,
      paranoid: false,
    },
  },
  production: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres' as const,
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
    },
    retry: {
      max: 5,
      timeout: 60000,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },
    benchmark: false,
    define: {
      timestamps: false,
      underscored: false,
      freezeTableName: true,
      paranoid: false,
    },
  },
};

// Crear instancia de Sequelize
export const sequelize = new Sequelize(
  dbConfig[config.nodeEnv as keyof typeof dbConfig]
);

// Event listeners para monitoreo
sequelize.addHook('beforeConnect', (config) => {
  logger.info({
    host: config.host || 'unknown',
    port: config.port || 5432,
    database: config.database || 'unknown',
  }, '🔌 Conectando a la base de datos...');
});

sequelize.addHook('afterConnect', (_connection, config) => {
  logger.info({
    host: config.host || 'unknown',
    port: config.port || 5432,
    database: config.database || 'unknown',
  }, '✅ Conexión a la base de datos establecida');
});

sequelize.addHook('beforeDisconnect', () => {
  logger.info('🔌 Cerrando conexión a la base de datos...');
});

sequelize.addHook('afterDisconnect', () => {
  logger.info('✅ Conexión a la base de datos cerrada');
});

// Función para conectar a la base de datos
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexión a la base de datos establecida correctamente');
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, '❌ Error al conectar con la base de datos');
    throw error;
  }
};

// Función para sincronizar modelos
export const syncDatabase = async (): Promise<void> => {
  try {
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ force: true });
      logger.info('✅ Base de datos sincronizada (desarrollo)');
    } else {
      await sequelize.sync({ alter: true });
      logger.info('✅ Base de datos sincronizada (producción)');
    }
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, '❌ Error al sincronizar la base de datos');
    throw error;
  }
};

// Función para cerrar la conexión
export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('✅ Conexión a la base de datos cerrada correctamente');
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, '❌ Error al cerrar la conexión a la base de datos');
    throw error;
  }
};

// Función para ejecutar transacciones
export const withTransaction = async <T>(
  callback: (transaction: import('sequelize').Transaction) => Promise<T>
): Promise<T> => {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Función para verificar la salud de la base de datos
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, '❌ Base de datos no saludable');
    return false;
  }
};