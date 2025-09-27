import { db } from '../models';
import { logger } from '../utils/logger';
import { EstadoUsuario } from '../models/enums';
import bcrypt from 'bcrypt';

export const seedDatabase = async () => {
  try {
    // Crear roles básicos
  logger.info('Iniciando creación de roles básicos...');
    
    const roles = [
      { clave: 'admin', nombre: 'Administrador' },
      { clave: 'establecimiento', nombre: 'Establecimiento' },
      { clave: 'capataz', nombre: 'Capataz' },
      { clave: 'veterinario', nombre: 'Veterinario' },
      { clave: 'empleado', nombre: 'Empleado' },
      { clave: 'propietario', nombre: 'Propietario' }
    ];

  logger.info({ roles }, 'Roles a crear');

    for (const role of roles) {
      await db.Role.findOrCreate({
        where: { clave: role.clave },
        defaults: {
          clave: role.clave,
          nombre: role.nombre,
          creado_el: new Date()
        }
      });
    }

    logger.info('✅ Roles básicos creados correctamente');

    // Crear usuario admin por defecto
    const adminRole = await db.Role.findOne({ where: { clave: 'admin' } });
    if (!adminRole) {
      throw new Error('No se encontró el rol de admin');
    }

  // Obtener ID del rol de forma robusta (evita problemas si hay shadowing u opciones de getters)
  const adminRoleId: number | undefined = (adminRole as any).id ?? (adminRole as any).get?.('id');
  logger.info(`Role admin encontrado con ID: ${adminRoleId}`);

    const salt = await bcrypt.genSalt(12);
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Verificamos que el hash funciona
    const testResult = await bcrypt.compare(plainPassword, hashedPassword);
    logger.info({
      salt,
      hashedPassword,
      testResult,
      plainPassword
    }, 'Test de contraseña en seedService');

    // Asegurarnos de que tenemos un ID válido
    if (!adminRoleId || typeof adminRoleId !== 'number') {
      throw new Error('ID del rol de admin no es válido');
    }

    const adminData = {
      email: 'admin@handicapp.com',
      hash_contrasena: hashedPassword,
  rol_id: adminRoleId,
      verificado: true,
      estado_usuario: EstadoUsuario.active,
      nombre: 'Admin',
      apellido: 'HandicApp',
      telefono: null,
      creado_el: new Date(),
      actualizado_el: new Date(),
      ultimo_acceso_el: new Date()
    };

  logger.info({ adminData: { ...adminData, hash_contrasena: '[HIDDEN]' } }, 'Intentando crear usuario admin con datos');

    const [_adminUser, adminCreated] = await db.User.findOrCreate({
      where: { email: 'admin@handicapp.com' },
      defaults: adminData
    });

    if (adminCreated) {
      logger.info('✅ Usuario admin creado correctamente');
    }

    // Crear usuario veterinario por defecto
    const vetRole = await db.Role.findOne({ where: { clave: 'veterinario' } });
    if (!vetRole) {
      throw new Error('No se encontró el rol de veterinario');
    }
    const vetRoleId: number | undefined = (vetRole as any).id ?? (vetRole as any).get?.('id');
    logger.info(`Role veterinario encontrado con ID: ${vetRoleId}`);

    const [_vetUser, vetCreated] = await db.User.findOrCreate({
      where: { email: 'vet@test.com' },
      defaults: {
        email: 'vet@test.com',
        hash_contrasena: hashedPassword, // Usamos la misma contraseña para simplificar
  rol_id: vetRoleId as number,
        verificado: true,
        estado_usuario: EstadoUsuario.active,
        nombre: 'Veterinario',
        apellido: 'Test',
        telefono: null,
        creado_el: new Date(),
        actualizado_el: new Date(),
        ultimo_acceso_el: new Date()
      }
    });

    if (vetCreated) {
      logger.info('✅ Usuario veterinario creado correctamente');
    }

    return true;
  } catch (error) {
    logger.error({ 
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : String(error),
      step: 'seed_database'
    }, '❌ Error durante el proceso de seed');
    throw error;
  }
};