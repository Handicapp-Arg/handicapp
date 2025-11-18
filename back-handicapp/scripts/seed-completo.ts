/**
 * Seeder completo para HandicApp
 * Crea múltiples registros de todos los modelos y los relaciona entre sí
 */

import dotenv from 'dotenv';
import { sequelize } from '../src/config/database';
import { initializeModels } from '../src/models';
import { db } from '../src/models';
import { TipoEventoSeedService } from '../src/services/tipoEventoSeedService';
import bcrypt from 'bcrypt';
import {
  EstadoUsuario,
  EstadoMembresia,
  RolEnEstablecimiento,
  Disciplina,
  SexoCaballo,
  EstadoGlobalCaballo,
  EstadoAsociacionCE,
  EstadoValidacionEvento,
  TipoTarea,
  EstadoTarea
} from '../src/models/enums';
import { TipoEstablecimiento, EstadoEstablecimiento } from '../src/models/Establecimiento';

dotenv.config();

// Datos de prueba
const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofía', 'Diego', 'Valentina'];
const apellidos = ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];

async function seedCompleto() {
  try {
    console.log('🚀 Iniciando seeder completo...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Inicializar modelos
    initializeModels(sequelize);
    console.log('✅ Modelos inicializados\n');

    // 0. Crear Tipos de Evento primero (necesarios para eventos)
    console.log('📋 Creando tipos de evento...');
    await TipoEventoSeedService.seedTiposEvento();
    console.log('  ✓ Tipos de evento creados\n');

    // 1. Crear Roles
    console.log('📋 Creando roles...');
    const roles = [
      { clave: 'admin', nombre: 'Administrador' },
      { clave: 'establecimiento', nombre: 'Establecimiento' },
      { clave: 'capataz', nombre: 'Capataz' },
      { clave: 'veterinario', nombre: 'Veterinario' },
      { clave: 'empleado', nombre: 'Empleado' },
      { clave: 'propietario', nombre: 'Propietario' }
    ];

    const roleMap: Record<string, any> = {};
    for (const role of roles) {
      const [roleInstance] = await db.Role.findOrCreate({
        where: { clave: role.clave },
        defaults: { ...role, creado_el: new Date() }
      });
      roleMap[role.clave] = roleInstance;
      console.log(`  ✓ Rol: ${role.nombre}`);
    }

    // 2. Crear Usuarios (múltiples de cada rol)
    console.log('\n👥 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    const usuarios: any[] = [];

    // Admin
    const [admin] = await db.User.findOrCreate({
      where: { email: 'admin@handicapp.com' },
      defaults: {
        email: 'admin@handicapp.com',
        hash_contrasena: hashedPassword,
        rol_id: roleMap['admin'].id,
        verificado: true,
        estado_usuario: EstadoUsuario.active,
        nombre: 'Admin',
        apellido: 'HandicApp',
        telefono: '+54 11 1234-5678',
        creado_el: new Date()
      }
    });
    usuarios.push(admin);
    console.log(`  ✓ Admin: ${admin.email}`);

    // 3 Establecimientos (usuarios con rol establecimiento)
    for (let i = 1; i <= 3; i++) {
      const [user] = await db.User.findOrCreate({
        where: { email: `establecimiento${i}@test.com` },
        defaults: {
          email: `establecimiento${i}@test.com`,
          hash_contrasena: hashedPassword,
          rol_id: roleMap['establecimiento'].id,
          verificado: true,
          estado_usuario: EstadoUsuario.active,
          nombre: nombres[i % nombres.length],
          apellido: apellidos[i % apellidos.length],
          telefono: `+54 11 ${1000 + i}-${5000 + i}`,
          creado_el: new Date()
        }
      });
      usuarios.push(user);
      console.log(`  ✓ Establecimiento ${i}: ${user.email}`);
    }

    // 5 Veterinarios
    for (let i = 1; i <= 5; i++) {
      const [user] = await db.User.findOrCreate({
        where: { email: `vet${i}@test.com` },
        defaults: {
          email: `vet${i}@test.com`,
          hash_contrasena: hashedPassword,
          rol_id: roleMap['veterinario'].id,
          verificado: true,
          estado_usuario: EstadoUsuario.active,
          nombre: nombres[(i + 2) % nombres.length],
          apellido: apellidos[(i + 3) % apellidos.length],
          telefono: `+54 11 ${2000 + i}-${6000 + i}`,
          creado_el: new Date()
        }
      });
      usuarios.push(user);
      console.log(`  ✓ Veterinario ${i}: ${user.email}`);
    }

    // 10 Propietarios
    for (let i = 1; i <= 10; i++) {
      const [user] = await db.User.findOrCreate({
        where: { email: `propietario${i}@test.com` },
        defaults: {
          email: `propietario${i}@test.com`,
          hash_contrasena: hashedPassword,
          rol_id: roleMap['propietario'].id,
          verificado: true,
          estado_usuario: EstadoUsuario.active,
          nombre: nombres[i % nombres.length],
          apellido: apellidos[i % apellidos.length],
          telefono: `+54 11 ${3000 + i}-${7000 + i}`,
          creado_el: new Date()
        }
      });
      usuarios.push(user);
      console.log(`  ✓ Propietario ${i}: ${user.email}`);
    }

    // 5 Capataces
    for (let i = 1; i <= 5; i++) {
      const [user] = await db.User.findOrCreate({
        where: { email: `capataz${i}@test.com` },
        defaults: {
          email: `capataz${i}@test.com`,
          hash_contrasena: hashedPassword,
          rol_id: roleMap['capataz'].id,
          verificado: true,
          estado_usuario: EstadoUsuario.active,
          nombre: nombres[(i + 5) % nombres.length],
          apellido: apellidos[(i + 5) % apellidos.length],
          telefono: `+54 11 ${4000 + i}-${8000 + i}`,
          creado_el: new Date()
        }
      });
      usuarios.push(user);
      console.log(`  ✓ Capataz ${i}: ${user.email}`);
    }

    // 5 Empleados
    for (let i = 1; i <= 5; i++) {
      const [user] = await db.User.findOrCreate({
        where: { email: `empleado${i}@test.com` },
        defaults: {
          email: `empleado${i}@test.com`,
          hash_contrasena: hashedPassword,
          rol_id: roleMap['empleado'].id,
          verificado: true,
          estado_usuario: EstadoUsuario.active,
          nombre: nombres[(i + 7) % nombres.length],
          apellido: apellidos[(i + 7) % apellidos.length],
          telefono: `+54 11 ${5000 + i}-${9000 + i}`,
          creado_el: new Date()
        }
      });
      usuarios.push(user);
      console.log(`  ✓ Empleado ${i}: ${user.email}`);
    }

    // 3. Crear Establecimientos
    console.log('\n🏢 Creando establecimientos...');
    const establecimientos: any[] = [];
    const establecimientosData = [
      {
        nombre: 'Haras Los Pinos',
        cuit: '30-71234567-8',
        email: 'info@haraslospinos.com.ar',
        telefono: '+54 11 4567-8900',
        direccion_calle: 'Ruta Provincial 6',
        direccion_numero: 'Km 45',
        ciudad: 'Escobar',
        provincia: 'Buenos Aires',
        pais: 'Argentina',
        latitud: -34.3485,
        longitud: -58.7945,
        descripcion: 'Haras especializado en cría y entrenamiento de caballos de polo.',
        tipo_establecimiento: TipoEstablecimiento.polo,
        estado: EstadoEstablecimiento.activo,
        superficie_hectareas: 150,
        cantidad_boxes: 80,
        disciplina_principal: Disciplina.polo,
        servicios: ['Pensión completa', 'Entrenamiento', 'Veterinario 24hs'],
        verificado: true
      },
      {
        nombre: 'Estancia El Ombú',
        cuit: '30-71234568-9',
        email: 'contacto@estanciaelombu.com',
        telefono: '+54 2227 45-6789',
        direccion_calle: 'Camino Rural 205',
        direccion_numero: 'S/N',
        ciudad: 'Tandil',
        provincia: 'Buenos Aires',
        pais: 'Argentina',
        latitud: -37.3218,
        longitud: -59.1332,
        descripcion: 'Estancia familiar dedicada al salto y doma clásica.',
        tipo_establecimiento: TipoEstablecimiento.salto,
        estado: EstadoEstablecimiento.activo,
        superficie_hectareas: 85,
        cantidad_boxes: 45,
        disciplina_principal: Disciplina.equitacion,
        servicios: ['Clases de salto', 'Doma clásica', 'Pensión semi-completa'],
        verificado: true
      },
      {
        nombre: 'Club Hípico San Jorge',
        cuit: '30-71234569-0',
        email: 'administracion@clubsanjorge.com.ar',
        telefono: '+54 351 489-7654',
        direccion_calle: 'Avenida Colón',
        direccion_numero: '8965',
        ciudad: 'Córdoba',
        provincia: 'Córdoba',
        pais: 'Argentina',
        latitud: -31.4201,
        longitud: -64.1888,
        descripcion: 'Club hípico con más de 50 años de trayectoria.',
        tipo_establecimiento: TipoEstablecimiento.mixto,
        estado: EstadoEstablecimiento.activo,
        superficie_hectareas: 35,
        cantidad_boxes: 60,
        disciplina_principal: Disciplina.equitacion,
        servicios: ['Clases grupales', 'Clases individuales', 'Iniciación ecuestre'],
        verificado: true
      },
      {
        nombre: 'Haras Santa Rosa',
        cuit: '30-71234570-1',
        email: 'info@harassantarosa.com',
        telefono: '+54 3546 42-8765',
        direccion_calle: 'Ruta Provincial 5',
        direccion_numero: 'Km 12',
        ciudad: 'Santa Rosa de Calamuchita',
        provincia: 'Córdoba',
        pais: 'Argentina',
        latitud: -32.0683,
        longitud: -64.5371,
        descripcion: 'Haras boutique especializado en cría de caballos de sangre pura.',
        tipo_establecimiento: TipoEstablecimiento.haras,
        estado: EstadoEstablecimiento.activo,
        superficie_hectareas: 220,
        cantidad_boxes: 50,
        disciplina_principal: Disciplina.turf,
        servicios: ['Cría de SPC', 'Entrenamiento', 'Pensión premium'],
        verificado: true
      },
      {
        nombre: 'Centro Ecuestre La Esperanza',
        cuit: '30-71234571-2',
        email: 'info@centroecuestre.com',
        telefono: '+54 11 5234-5678',
        direccion_calle: 'Ruta 202',
        direccion_numero: 'Km 18',
        ciudad: 'Pilar',
        provincia: 'Buenos Aires',
        pais: 'Argentina',
        latitud: -34.4581,
        longitud: -58.9142,
        descripcion: 'Centro ecuestre moderno con instalaciones de primer nivel.',
        tipo_establecimiento: TipoEstablecimiento.mixto,
        estado: EstadoEstablecimiento.activo,
        superficie_hectareas: 60,
        cantidad_boxes: 40,
        disciplina_principal: Disciplina.equitacion,
        servicios: ['Clases', 'Pensión', 'Veterinario'],
        verificado: true
      }
    ];

    for (const data of establecimientosData) {
      const [establecimiento] = await db.Establecimiento.findOrCreate({
        where: { cuit: data.cuit },
        defaults: data
      });
      establecimientos.push(establecimiento);
      console.log(`  ✓ ${establecimiento.nombre}`);
    }

    // 4. Relacionar Usuarios con Establecimientos (Membresías)
    console.log('\n🔗 Creando membresías usuario-establecimiento...');
    const establecimientoUsers = usuarios.filter(u => u.rol_id === roleMap['establecimiento'].id);
    const capatazUsers = usuarios.filter(u => u.rol_id === roleMap['capataz'].id);
    const empleadoUsers = usuarios.filter(u => u.rol_id === roleMap['empleado'].id);

    // Asignar usuarios establecimiento a sus establecimientos
    for (let i = 0; i < establecimientos.length && i < establecimientoUsers.length; i++) {
      await db.MembresiaUsuarioEstablecimiento.findOrCreate({
        where: {
          usuario_id: establecimientoUsers[i].id,
          establecimiento_id: establecimientos[i].id
        },
        defaults: {
          usuario_id: establecimientoUsers[i].id,
          establecimiento_id: establecimientos[i].id,
          rol_en_establecimiento: RolEnEstablecimiento.capataz,
          estado_membresia: EstadoMembresia.active,
          fecha_inicio: new Date()
        }
      });
      console.log(`  ✓ ${establecimientoUsers[i].email} → ${establecimientos[i].nombre}`);
    }

    // Asignar capataces a establecimientos
    for (let i = 0; i < capatazUsers.length; i++) {
      const establecimiento = establecimientos[i % establecimientos.length];
      await db.MembresiaUsuarioEstablecimiento.findOrCreate({
        where: {
          usuario_id: capatazUsers[i].id,
          establecimiento_id: establecimiento.id
        },
        defaults: {
          usuario_id: capatazUsers[i].id,
          establecimiento_id: establecimiento.id,
          rol_en_establecimiento: RolEnEstablecimiento.capataz,
          estado_membresia: EstadoMembresia.active,
          fecha_inicio: new Date()
        }
      });
      console.log(`  ✓ Capataz ${capatazUsers[i].email} → ${establecimiento.nombre}`);
    }

    // Asignar empleados a establecimientos
    for (let i = 0; i < empleadoUsers.length; i++) {
      const establecimiento = establecimientos[i % establecimientos.length];
      await db.MembresiaUsuarioEstablecimiento.findOrCreate({
        where: {
          usuario_id: empleadoUsers[i].id,
          establecimiento_id: establecimiento.id
        },
        defaults: {
          usuario_id: empleadoUsers[i].id,
          establecimiento_id: establecimiento.id,
          rol_en_establecimiento: RolEnEstablecimiento.empleado,
          estado_membresia: EstadoMembresia.active,
          fecha_inicio: new Date()
        }
      });
      console.log(`  ✓ Empleado ${empleadoUsers[i].email} → ${establecimiento.nombre}`);
    }

    // 5. Crear Caballos
    console.log('\n🐴 Creando caballos...');
    const caballos: any[] = [];
    const razas = ['Sangre Pura de Carrera', 'Cuarto de Milla', 'Criollo', 'Polo Argentino', 'Silla Francés', 'Paint Horse', 'Árabe'];
    const pelajes = ['Alazán', 'Bayo', 'Negro', 'Tordillo', 'Overo', 'Tobiano', 'Ruano'];
    const propietarioUsers = usuarios.filter(u => u.rol_id === roleMap['propietario'].id);

    for (let i = 1; i <= 30; i++) {
      const fechaNacimiento = new Date(2015 + (i % 10), (i % 12), (i % 28) + 1);
      const propietario = propietarioUsers[i % propietarioUsers.length];
      const establecimiento = establecimientos[i % establecimientos.length];

      const razaValue = razas[i % razas.length];
      const pelajeValue = pelajes[i % pelajes.length];
      
      const [caballo] = await db.Caballo.findOrCreate({
        where: { microchip: `CHIP-${String(i).padStart(6, '0')}` },
        defaults: {
          nombre: `Caballo ${i}`,
          raza: razaValue || null,
          sexo: i % 2 === 0 ? SexoCaballo.macho : SexoCaballo.hembra,
          fecha_nacimiento: fechaNacimiento,
          pelaje: pelajeValue || null,
          altura: 150 + (i % 20),
          peso: 400 + (i % 200),
          microchip: `CHIP-${String(i).padStart(6, '0')}`,
          pasaporte: `PAS-${String(i).padStart(8, '0')}`,
          estado_global: EstadoGlobalCaballo.activo,
          creado_el: new Date()
        }
      });
      caballos.push(caballo);
      console.log(`  ✓ ${caballo.nombre} (${caballo.raza})`);

      // Relacionar caballo con propietario
      await db.PropietarioCaballo.findOrCreate({
        where: {
          caballo_id: caballo.id,
          propietario_usuario_id: propietario.id
        },
        defaults: {
          caballo_id: caballo.id,
          propietario_usuario_id: propietario.id,
          porcentaje_tenencia: 100,
          fecha_inicio: new Date(),
          actual: true
        }
      });

      // Relacionar caballo con establecimiento
      await db.CaballoEstablecimiento.findOrCreate({
        where: {
          caballo_id: caballo.id,
          establecimiento_id: establecimiento.id
        },
        defaults: {
          caballo_id: caballo.id,
          establecimiento_id: establecimiento.id,
          estado_asociacion: EstadoAsociacionCE.accepted,
          fecha_inicio: new Date(),
          fecha_fin: null
        }
      });
    }

    // 6. Crear Eventos
    console.log('\n📅 Creando eventos...');
    const tiposEvento = await db.TipoEvento.findAll({ limit: 10 });
    const capatazUsersForEvents = usuarios.filter(u => u.rol_id === roleMap['capataz'].id);

    for (let i = 1; i <= 50; i++) {
      const caballo = caballos[i % caballos.length];
      const establecimiento = establecimientos[i % establecimientos.length];
      const creador = capatazUsersForEvents[i % capatazUsersForEvents.length] || usuarios[0];
      const tipoEvento = tiposEvento[i % tiposEvento.length] || tiposEvento[0];

      const fecha = new Date();
      fecha.setDate(fecha.getDate() - (i % 30));

      await db.Evento.findOrCreate({
        where: {
          caballo_id: caballo.id,
          tipo_evento_id: tipoEvento?.id || 1,
          fecha_evento: fecha
        },
        defaults: {
          fecha_evento: fecha,
          tipo_evento_id: tipoEvento?.id || 1,
          caballo_id: caballo.id,
          establecimiento_id: establecimiento.id,
          creado_por_usuario_id: creador.id,
          titulo: `Evento ${i}: ${tipoEvento?.nombre || 'Evento'}`,
          descripcion: `Evento ${i} para ${caballo.nombre}`,
          estado_validacion: EstadoValidacionEvento.approved,
          es_publico: i % 2 === 0,
          requiere_validacion: false,
          creado_el: new Date()
        }
      });
    }
    console.log(`  ✓ 50 eventos creados`);

    // 7. Crear Tareas
    console.log('\n✅ Creando tareas...');
    const tiposTarea: TipoTarea[] = [TipoTarea.alimentacion, TipoTarea.limpieza_box, TipoTarea.aseo_caballo, TipoTarea.ejercicio, TipoTarea.salud, TipoTarea.entrenamiento, TipoTarea.mantenimiento, TipoTarea.otro];
    const estadosTarea: EstadoTarea[] = [EstadoTarea.open, EstadoTarea.in_progress, EstadoTarea.done];

    for (let i = 1; i <= 40; i++) {
      const establecimiento = establecimientos[i % establecimientos.length];
      const caballo = i % 3 === 0 ? null : caballos[i % caballos.length]; // Algunas tareas sin caballo
      const asignadoA = usuarios[i % usuarios.length];
      const creador = capatazUsersForEvents[i % capatazUsersForEvents.length] || usuarios[0];

      const tipoTareaValue = tiposTarea[i % tiposTarea.length] || TipoTarea.otro;
      const estadoTareaValue = estadosTarea[i % estadosTarea.length] || EstadoTarea.open;
      
      await db.Tarea.findOrCreate({
        where: {
          titulo: `Tarea ${i}: ${tipoTareaValue}`,
          establecimiento_id: establecimiento.id
        },
        defaults: {
          titulo: `Tarea ${i}: ${tipoTareaValue}`,
          notas: `Notas detalladas de la tarea ${i}`,
          fecha_vencimiento: new Date(Date.now() + (i % 7) * 24 * 60 * 60 * 1000),
          tipo: tipoTareaValue,
          estado: estadoTareaValue,
          asignado_a_usuario_id: asignadoA.id,
          creado_por_usuario_id: creador.id,
          caballo_id: caballo?.id || null,
          establecimiento_id: establecimiento.id,
          creado_el: new Date()
        }
      });
    }
    console.log(`  ✓ 40 tareas creadas`);

    // Resumen
    console.log('\n📊 Resumen del seed:');
    console.log(`  ✓ ${await db.Role.count()} roles`);
    console.log(`  ✓ ${await db.User.count()} usuarios`);
    console.log(`  ✓ ${await db.Establecimiento.count()} establecimientos`);
    console.log(`  ✓ ${await db.MembresiaUsuarioEstablecimiento.count()} membresías`);
    console.log(`  ✓ ${await db.Caballo.count()} caballos`);
    console.log(`  ✓ ${await db.PropietarioCaballo.count()} relaciones propietario-caballo`);
    console.log(`  ✓ ${await db.CaballoEstablecimiento.count()} relaciones caballo-establecimiento`);
    console.log(`  ✓ ${await db.Evento.count()} eventos`);
    console.log(`  ✓ ${await db.Tarea.count()} tareas`);

    console.log('\n🎉 ¡Seeder completo ejecutado exitosamente!');
    console.log('\n📝 Credenciales de prueba:');
    console.log('  - Todos los usuarios tienen la contraseña: password123');
    console.log('  - Admin: admin@handicapp.com');
    console.log('  - Establecimientos: establecimiento1@test.com, establecimiento2@test.com, etc.');
    console.log('  - Veterinarios: vet1@test.com, vet2@test.com, etc.');
    console.log('  - Propietarios: propietario1@test.com, propietario2@test.com, etc.');

  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el seeder
if (require.main === module) {
  seedCompleto()
    .then(() => {
      console.log('\n✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

export { seedCompleto };

