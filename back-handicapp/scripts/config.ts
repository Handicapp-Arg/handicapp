/**
 * Configuración centralizada para scripts de mantenimiento
 * Este archivo contiene constantes y configuraciones compartidas
 */

export const SCRIPT_CONFIG = {
  // Configuración de base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'handicapp_db',
    user: process.env.DB_USER || 'handicapp_user',
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production',
  },

  // Configuración de backups
  backup: {
    enabled: true,
    beforeMigrations: true,
    beforeMaintenance: true,
  },

  // Configuración de migraciones
  migrations: {
    directory: 'migrations',
    table: '_migrations_log', // Tabla para trackear migraciones ejecutadas
  },

  // Timeouts
  timeouts: {
    queryTimeout: 30000, // 30 segundos
    connectionTimeout: 10000, // 10 segundos
  },
} as const;

/**
 * Validar que las variables de entorno requeridas estén presentes
 */
export function validateEnv(): void {
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
  }
}

/**
 * Helper para logging consistente en scripts
 */
export function scriptLogger(scriptName: string) {
  return {
    info: (...args: any[]) => console.log(`[${scriptName}] ℹ️`, ...args),
    success: (...args: any[]) => console.log(`[${scriptName}] ✅`, ...args),
    warn: (...args: any[]) => console.warn(`[${scriptName}] ⚠️`, ...args),
    error: (...args: any[]) => console.error(`[${scriptName}] ❌`, ...args),
  };
}
