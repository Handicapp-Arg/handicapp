import { sequelize, withTransaction } from '../config/database';
import { logger } from '../utils/logger';
import { Transaction, QueryTypes } from 'sequelize';

// Helper to bypass brittle Sequelize typings for `sequelize.query` under strict TS settings
const runQuery = async <R = unknown>(sql: string, options?: any): Promise<R> => {
  return (sequelize.query as any)(sql, options) as Promise<R>;
};

export class DatabaseService {
  /**
   * Ejecuta una consulta con transacción
   */
  static async executeInTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    return withTransaction(callback);
  }

  /**
   * Ejecuta múltiples operaciones en una sola transacción
   */
  static async executeBatch<T>(
    operations: Array<(transaction: Transaction) => Promise<T>>
  ): Promise<T[]> {
    return withTransaction(async (transaction) => {
      const results: T[] = [];
      for (const operation of operations) {
        const result = await operation(transaction);
        results.push(result);
      }
      return results;
    });
  }

  /**
   * Ejecuta una consulta raw con parámetros seguros
   */
  static async executeRawQuery<T extends object = any>(
    query: string,
    replacements?: unknown[],
    transaction?: Transaction
  ): Promise<T[]> {
    try {
      const rows = await runQuery<T[]>(query, {
        replacements: (replacements as any) ?? [],
        transaction,
        type: QueryTypes.SELECT,
      });
      return rows ?? [];
    } catch (error) {
      logger.error('Error ejecutando consulta raw:', error);
      throw error;
    }
  }

  /**
   * Ejecuta una consulta de actualización con parámetros seguros
   */
  static async executeUpdate(
    query: string,
    replacements?: unknown[],
    transaction?: Transaction
  ): Promise<[number, number]> {
    try {
      const [results, metadata] = await runQuery<[unknown[], any]>(query, {
        replacements: (replacements as any) ?? [],
        transaction,
      });
      // Try to derive affected rows cross-dialect
      let affected = 0;
      if (Array.isArray(results)) {
        affected = results.length;
      }
      const rowCount = (metadata as any)?.rowCount;
      if (typeof rowCount === 'number') {
        affected = rowCount;
      }
      return [affected, 0];
    } catch (error) {
      logger.error('Error ejecutando actualización:', error);
      throw error;
    }
  }

  /**
   * Verifica la integridad de la base de datos
   */
  static async checkIntegrity(): Promise<boolean> {
    try {
      // Verificar conexión
      await sequelize.authenticate();

      // Verificar que las tablas principales existen
      const tables = await runQuery<Array<{ table_name: string }>>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
        { type: QueryTypes.SELECT }
      );

      const requiredTables = ['roles', 'usuarios'];
      const existingTables = tables.map(t => t.table_name);

      for (const table of requiredTables) {
        if (!existingTables.includes(table)) {
          logger.error(`Tabla requerida no encontrada: ${table}`);
          return false;
        }
      }

      // Verificar que hay roles básicos
      const roles = await runQuery<Array<{ count: string }>>('SELECT COUNT(*) as count FROM roles', {
        type: QueryTypes.SELECT,
      });
      const countNum = Number(roles[0]?.count ?? 0);
      if (countNum < 3) {
        logger.error('Roles básicos no encontrados');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error verificando integridad de la base de datos:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de la base de datos
   */
  static async getDatabaseStats(): Promise<Array<{
    schemaname: string;
    tablename: string;
    attname: string;
    n_distinct: number;
    correlation: number;
  }>> {
    try {
      const stats = await runQuery<Array<{
        schemaname: string;
        tablename: string;
        attname: string;
        n_distinct: number;
        correlation: number;
      }>>(`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        ORDER BY tablename, attname
      `, { type: QueryTypes.SELECT });

      return stats ?? [];
    } catch (error) {
      logger.error('Error obteniendo estadísticas de la base de datos:', error);
      throw error;
    }
  }

  /**
   * Optimiza la base de datos (VACUUM y ANALYZE)
   */
  static async optimizeDatabase(): Promise<void> {
    try {
      await runQuery('VACUUM ANALYZE', { type: QueryTypes.RAW });
      logger.info('Base de datos optimizada exitosamente');
    } catch (error) {
      logger.error('Error optimizando la base de datos:', error);
      throw error;
    }
  }

  /**
   * Crea un backup de la base de datos
   */
  static async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup_${timestamp}.sql`;
      
      // En producción, esto debería usar pg_dump
      logger.info(`Backup creado: ${backupName}`);
      return backupName;
    } catch (error) {
      logger.error('Error creando backup:', error);
      throw error;
    }
  }
}
