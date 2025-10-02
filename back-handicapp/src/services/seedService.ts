import { db } from '../models';
import { logger } from '../utils/logger';
import { EstadoUsuario } from '../models/enums';
import bcrypt from 'bcrypt';

export const seedDatabase = async () => {
  try {
    // Crear roles básicos
    const roles = [
      { clave: 'admin', nombre: 'Administrador' },
      { clave: 'establecimiento', nombre: 'Establecimiento' },
      { clave: 'capataz', nombre: 'Capataz' },
      { clave: 'veterinario', nombre: 'Veterinario' },
      { clave: 'empleado', nombre: 'Empleado' },
      { clave: 'propietario', nombre: 'Propietario' }
    ];

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

    logger.info('✅ Roles created');

    // Crear usuario admin por defecto
    const adminRole = await db.Role.findOne({ where: { clave: 'admin' } });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    const adminRoleId: number | undefined = (adminRole as any).id ?? (adminRole as any).get?.('id');

    const salt = await bcrypt.genSalt(12);
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Verificar que la contraseña se hashea correctamente
    const testResult = await bcrypt.compare(plainPassword, hashedPassword);
    if (!testResult) {
      throw new Error('Password hash error');
    }

    // Asegurarnos de que tenemos un ID válido
    if (!adminRoleId || typeof adminRoleId !== 'number') {
      throw new Error('Invalid admin role ID');
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

    const [_adminUser, adminCreated] = await db.User.findOrCreate({
      where: { email: 'admin@handicapp.com' },
      defaults: adminData
    });

    // Crear usuario veterinario por defecto
    const vetRole = await db.Role.findOne({ where: { clave: 'veterinario' } });
    if (!vetRole) {
      throw new Error('Veterinario role not found');
    }
    const vetRoleId: number | undefined = (vetRole as any).id ?? (vetRole as any).get?.('id');

    const [_vetUser, vetCreated] = await db.User.findOrCreate({
      where: { email: 'vet@test.com' },
      defaults: {
        email: 'vet@test.com',
        hash_contrasena: hashedPassword,
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

    if (adminCreated || vetCreated) {
      logger.info('✅ Default users created');
    }

    return true;
  } catch (error) {
    logger.error({ error }, '❌ Error during seed process');
    throw error;
  }
};