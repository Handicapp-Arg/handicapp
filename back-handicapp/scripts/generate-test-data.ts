/**
 * Script completo para generar datos de prueba
 * Crea usuarios de todos los roles con datos realistas y la misma contraseña
 * 
 * Uso: npx ts-node scripts/generate-test-data.ts
 */

import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';
import { Role } from '../src/models/roles';
import { Establecimiento } from '../src/models/Establecimiento';
import { Caballo } from '../src/models/Caballo';
import { Departamento } from '../src/models/Departamento';
import { Puesto } from '../src/models/Puesto';
import { PropietarioCaballo } from '../src/models/PropietarioCaballo';
import { CaballoEstablecimiento } from '../src/models/CaballoEstablecimiento';
import { initializeModels } from '../src/models';
import bcrypt from 'bcrypt';
import { 
  EstadoUsuario, 
  Disciplina,
  SexoCaballo,
  EstadoGlobalCaballo,
  EstadoAsociacionCE
} from '../src/models/enums';
import { TipoEstablecimiento, EstadoEstablecimiento } from '../src/models/Establecimiento';

// Configuración
const COMMON_PASSWORD = 'test123'; // Contraseña común para todos los usuarios

// Datos realistas para generar usuarios
const NOMBRES_HOMBRES = ['Carlos', 'Miguel', 'Fernando', 'Roberto', 'Diego', 'Alejandro', 'Eduardo', 'Ricardo', 'Martín', 'Sebastián'];
const NOMBRES_MUJERES = ['María', 'Ana', 'Carmen', 'Elena', 'Patricia', 'Sofía', 'Valentina', 'Claudia', 'Gabriela', 'Victoria'];
const APELLIDOS = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'];

const ESTABLECIMIENTOS_DATA = [
  {
    nombre: 'Haras Los Álamos',
    cuit: '30-12345678-9',
    email: 'info@haraslosalamos.com.ar',
    telefono: '+54 11 4567-8901',
    direccion_calle: 'Ruta 8 Km 65',
    direccion_numero: 'S/N',
    ciudad: 'Cañuelas',
    provincia: 'Buenos Aires',
    pais: 'Argentina',
    tipo_establecimiento: TipoEstablecimiento.haras,
    disciplina_principal: Disciplina.polo,
    superficie_hectareas: 150,
    cantidad_boxes: 40
  },
  {
    nombre: 'Club de Polo San Isidro',
    cuit: '30-23456789-0',
    email: 'admin@polosanisidro.com.ar',
    telefono: '+54 11 4890-1234',
    direccion_calle: 'Av. Santa Fe',
    direccion_numero: '2850',
    ciudad: 'San Isidro',
    provincia: 'Buenos Aires',
    pais: 'Argentina',
    tipo_establecimiento: TipoEstablecimiento.polo,
    disciplina_principal: Disciplina.polo,
    superficie_hectareas: 80,
    cantidad_boxes: 25
  },
  {
    nombre: 'Escuela de Equitación La Pampa',
    cuit: '30-34567890-1',
    email: 'contacto@equitacionlapampa.com',
    telefono: '+54 11 5234-5678',
    direccion_calle: 'Camino Real',
    direccion_numero: '1200',
    ciudad: 'Luján',
    provincia: 'Buenos Aires',
    pais: 'Argentina',
    tipo_establecimiento: TipoEstablecimiento.doma,
    disciplina_principal: Disciplina.equitacion,
    superficie_hectareas: 60,
    cantidad_boxes: 30
  }
];

const CABALLOS_DATA = [
  { nombre: 'Thunder', sexo: SexoCaballo.macho, disciplina: Disciplina.polo, raza: 'Criollo', pelaje: 'Zaino' },
  { nombre: 'Lightning', sexo: SexoCaballo.hembra, disciplina: Disciplina.polo, raza: 'Thoroughbred', pelaje: 'Alazán' },
  { nombre: 'Storm', sexo: SexoCaballo.macho, disciplina: Disciplina.polo, raza: 'Polo Argentino', pelaje: 'Tordillo' },
  { nombre: 'Spirit', sexo: SexoCaballo.hembra, disciplina: Disciplina.equitacion, raza: 'Warmblood', pelaje: 'Castaño' },
  { nombre: 'Comet', sexo: SexoCaballo.macho, disciplina: Disciplina.equitacion, raza: 'Andaluz', pelaje: 'Tordillo' },
  { nombre: 'Eclipse', sexo: SexoCaballo.hembra, disciplina: Disciplina.turf, raza: 'Thoroughbred', pelaje: 'Negro' },
  { nombre: 'Tornado', sexo: SexoCaballo.macho, disciplina: Disciplina.polo, raza: 'Criollo', pelaje: 'Overo' },
  { nombre: 'Blaze', sexo: SexoCaballo.hembra, disciplina: Disciplina.polo, raza: 'Polo Argentino', pelaje: 'Alazán' },
  { nombre: 'Champion', sexo: SexoCaballo.macho, disciplina: Disciplina.turf, raza: 'Thoroughbred', pelaje: 'Zaino' },
  { nombre: 'Star', sexo: SexoCaballo.hembra, disciplina: Disciplina.equitacion, raza: 'Andaluz', pelaje: 'Tordillo' }
];

const DEPARTAMENTOS_DATA = [
  { nombre: 'Administración', descripcion: 'Gestión administrativa y financiera' },
  { nombre: 'Veterinaria', descripcion: 'Cuidado de la salud equina' },
  { nombre: 'Entrenamiento', descripcion: 'Preparación y entrenamiento de caballos' },
  { nombre: 'Mantenimiento', descripcion: 'Cuidado de instalaciones y equipos' },
  { nombre: 'Alimentación', descripcion: 'Nutrición y alimentación equina' }
];

const PUESTOS_DATA = [
  { nombre: 'Gerente', descripcion: 'Responsable general del establecimiento' },
  { nombre: 'Veterinario Principal', descripcion: 'Veterinario a cargo del área de salud' },
  { nombre: 'Capataz', descripcion: 'Supervisor de empleados' },
  { nombre: 'Entrenador', descripcion: 'Especialista en entrenamiento equino' },
  { nombre: 'Cuidador', descripcion: 'Cuidado diario de caballos' },
  { nombre: 'Petisero', descripcion: 'Alimentación y limpieza de boxes' },
  { nombre: 'Jinete', descripcion: 'Monta y ejercicio de caballos' }
];

// Funciones auxiliares
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhoneNumber(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `+54 11 ${area}-${number.toString().slice(0, 4)}`;
}

function generateDNI(): string {
  return (Math.floor(Math.random() * 90000000) + 10000000).toString();
}

function generateEmail(nombre: string, apellido: string, domain: string = 'test.com'): string {
  const normalizedNombre = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedApellido = apellido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${normalizedNombre}.${normalizedApellido}@${domain}`;
}

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

async function createTestData() {
  try {
    console.log('🚀 Iniciando generación de datos de prueba...\n');

    // Conectar y inicializar
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    initializeModels(sequelize);
    
    // Hash de la contraseña común
    const hashedPassword = await hashPassword(COMMON_PASSWORD);
    console.log(`🔐 Contraseña común para todos: ${COMMON_PASSWORD}\n`);

    // Crear departamentos
    console.log('📋 Creando departamentos...');
    const departamentos = [];
    for (const depData of DEPARTAMENTOS_DATA) {
      const [dept] = await Departamento.findOrCreate({
        where: { nombre: depData.nombre },
        defaults: depData
      });
      departamentos.push(dept);
    }
    console.log(`✅ ${departamentos.length} departamentos creados\n`);

    // Crear puestos
    console.log('👔 Creando puestos...');
    const puestos = [];
    for (const puestoData of PUESTOS_DATA) {
      const [puesto] = await Puesto.findOrCreate({
        where: { nombre: puestoData.nombre },
        defaults: puestoData
      });
      puestos.push(puesto);
    }
    console.log(`✅ ${puestos.length} puestos creados\n`);

    // Crear establecimientos
    console.log('🏢 Creando establecimientos...');
    const establecimientos = [];
    for (const estabData of ESTABLECIMIENTOS_DATA) {
      const [estab] = await Establecimiento.findOrCreate({
        where: { nombre: estabData.nombre },
        defaults: {
          ...estabData,
          estado: EstadoEstablecimiento.activo,
          imagenes: [],
          servicios: ['boxes', 'agua', 'luz', 'veterinario'],
          rating_promedio: 4.5,
          total_resenas: 0,
          verificado: true
        }
      });
      establecimientos.push(estab);
    }
    console.log(`✅ ${establecimientos.length} establecimientos creados\n`);

    // Obtener roles
    const roles = await Role.findAll();
    const rolesMap = roles.reduce((acc, role) => {
      acc[role.clave] = role;
      return acc;
    }, {} as Record<string, any>);

    // Crear usuarios por rol
    console.log('👥 Creando usuarios...');

    // Admin ya existe, no lo tocamos
    console.log('👨‍💼 Admin existente - no modificado');

    // Propietarios (5 usuarios)
    console.log('🏇 Creando propietarios...');
    const propietarios = [];
    for (let i = 0; i < 5; i++) {
      const esHombre = Math.random() > 0.5;
      const nombre = getRandomElement(esHombre ? NOMBRES_HOMBRES : NOMBRES_MUJERES);
      const apellido = getRandomElement(APELLIDOS);
      const email = generateEmail(nombre, apellido, 'propietarios.com');
      
      const [propietario] = await User.findOrCreate({
        where: { email },
        defaults: {
          nombre,
          apellido,
          email,
          hash_contrasena: hashedPassword,
          rol_id: rolesMap['propietario'].id,
          verificado: true,
          estado_usuario: EstadoUsuario.active,
          telefono: generatePhoneNumber(),
          documento: generateDNI()
        }
      });
      propietarios.push(propietario);
    }
    console.log(`✅ ${propietarios.length} propietarios creados`);

    // Usuarios de establecimiento (3 por establecimiento)
    console.log('🏢 Creando usuarios de establecimiento...');
    const usuariosEstablecimiento = [];
    for (const establecimiento of establecimientos) {
      for (let i = 0; i < 3; i++) {
        const esHombre = Math.random() > 0.5;
        const nombre = getRandomElement(esHombre ? NOMBRES_HOMBRES : NOMBRES_MUJERES);
        const apellido = getRandomElement(APELLIDOS);
        const email = generateEmail(nombre, apellido, 'establecimiento.com');
        
        const [usuario] = await User.findOrCreate({
          where: { email },
          defaults: {
            nombre,
            apellido,
            email,
            hash_contrasena: hashedPassword,
            rol_id: rolesMap['establecimiento'].id,
            establecimiento_id: establecimiento.id,
            verificado: true,
            estado_usuario: EstadoUsuario.active,
            telefono: generatePhoneNumber(),
            documento: generateDNI(),
            departamento_id: getRandomElement(departamentos).id,
            puesto_id: getRandomElement(puestos).id
          }
        });
        usuariosEstablecimiento.push(usuario);
      }
    }
    console.log(`✅ ${usuariosEstablecimiento.length} usuarios de establecimiento creados`);

    // Veterinarios (2 por establecimiento)
    console.log('🩺 Creando veterinarios...');
    const veterinarios = [];
    for (const establecimiento of establecimientos) {
      for (let i = 0; i < 2; i++) {
        const esHombre = Math.random() > 0.5;
        const nombre = getRandomElement(esHombre ? NOMBRES_HOMBRES : NOMBRES_MUJERES);
        const apellido = getRandomElement(APELLIDOS);
        const email = generateEmail(nombre, apellido, 'veterinarios.com');
        
        const [veterinario] = await User.findOrCreate({
          where: { email },
          defaults: {
            nombre,
            apellido,
            email,
            hash_contrasena: hashedPassword,
            rol_id: rolesMap['veterinario'].id,
            establecimiento_id: establecimiento.id,
            verificado: true,
            estado_usuario: EstadoUsuario.active,
            telefono: generatePhoneNumber(),
            documento: generateDNI(),
            departamento_id: departamentos.find(d => d.nombre === 'Veterinaria')?.id,
            puesto_id: puestos.find(p => p.nombre === 'Veterinario Principal')?.id
          }
        });
        veterinarios.push(veterinario);
      }
    }
    console.log(`✅ ${veterinarios.length} veterinarios creados`);

    // Capataces (1 por establecimiento)
    console.log('👨‍🔧 Creando capataces...');
    const capataces = [];
    for (const establecimiento of establecimientos) {
      const esHombre = Math.random() > 0.5;
      const nombre = getRandomElement(esHombre ? NOMBRES_HOMBRES : NOMBRES_MUJERES);
      const apellido = getRandomElement(APELLIDOS);
      const email = generateEmail(nombre, apellido, 'capataces.com');
      
      const [capataz] = await User.findOrCreate({
        where: { email },
        defaults: {
          nombre,
          apellido,
          email,
          hash_contrasena: hashedPassword,
          rol_id: rolesMap['capataz'].id,
          establecimiento_id: establecimiento.id,
          verificado: true,
          estado_usuario: EstadoUsuario.active,
          telefono: generatePhoneNumber(),
          documento: generateDNI(),
          departamento_id: getRandomElement(departamentos).id,
          puesto_id: puestos.find(p => p.nombre === 'Capataz')?.id
        }
      });
      capataces.push(capataz);
    }
    console.log(`✅ ${capataces.length} capataces creados`);

    // Empleados (4 por establecimiento)
    console.log('👷‍♂️ Creando empleados...');
    const empleados = [];
    for (const establecimiento of establecimientos) {
      for (let i = 0; i < 4; i++) {
        const esHombre = Math.random() > 0.5;
        const nombre = getRandomElement(esHombre ? NOMBRES_HOMBRES : NOMBRES_MUJERES);
        const apellido = getRandomElement(APELLIDOS);
        const email = generateEmail(nombre, apellido, 'empleados.com');
        
        const [empleado] = await User.findOrCreate({
          where: { email },
          defaults: {
            nombre,
            apellido,
            email,
            hash_contrasena: hashedPassword,
            rol_id: rolesMap['empleado'].id,
            establecimiento_id: establecimiento.id,
            verificado: true,
            estado_usuario: EstadoUsuario.active,
            telefono: generatePhoneNumber(),
            documento: generateDNI(),
            departamento_id: getRandomElement(departamentos).id,
            puesto_id: getRandomElement([
              puestos.find(p => p.nombre === 'Cuidador'),
              puestos.find(p => p.nombre === 'Petisero'),
              puestos.find(p => p.nombre === 'Jinete'),
              puestos.find(p => p.nombre === 'Entrenador')
            ])?.id
          }
        });
        empleados.push(empleado);
      }
    }
    console.log(`✅ ${empleados.length} empleados creados`);

    // Crear caballos
    console.log('🐴 Creando caballos...');
    const caballos = [];
    for (const caballoData of CABALLOS_DATA) {
      const fechaNacimiento = getRandomDate(new Date('2015-01-01'), new Date('2020-12-31'));
      
      const [caballo] = await Caballo.findOrCreate({
        where: { nombre: caballoData.nombre },
        defaults: {
          ...caballoData,
          fecha_nacimiento: fechaNacimiento,
          estado_global: EstadoGlobalCaballo.activo,
          altura: Math.floor(Math.random() * 20) + 150, // 150-170 cm
          peso: Math.floor(Math.random() * 150) + 400, // 400-550 kg
          microchip: `ARG${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
          rp: `RP${Math.floor(Math.random() * 100000)}`,
          sba: `SBA${Math.floor(Math.random() * 100000)}`
        }
      });
      caballos.push(caballo);
    }
    console.log(`✅ ${caballos.length} caballos creados`);

    // Asignar propietarios a caballos
    console.log('🤝 Asignando propietarios a caballos...');
    for (let i = 0; i < caballos.length; i++) {
      const caballo = caballos[i];
      const propietario = propietarios[i % propietarios.length];
      
      if (caballo && propietario) {
        await PropietarioCaballo.findOrCreate({
          where: { 
            propietario_usuario_id: propietario.id,
            caballo_id: caballo.id 
          },
          defaults: {
            propietario_usuario_id: propietario.id,
            caballo_id: caballo.id,
            fecha_inicio: getRandomDate(new Date('2020-01-01'), new Date()),
            actual: true
          }
        });
      }
    }
    console.log('✅ Propietarios asignados a caballos');

    // Asignar caballos a establecimientos
    console.log('🏠 Asignando caballos a establecimientos...');
    for (let i = 0; i < caballos.length; i++) {
      const caballo = caballos[i];
      const establecimiento = establecimientos[i % establecimientos.length];
      
      if (caballo && establecimiento) {
        await CaballoEstablecimiento.findOrCreate({
          where: { 
            caballo_id: caballo.id,
            establecimiento_id: establecimiento.id 
          },
          defaults: {
            caballo_id: caballo.id,
            establecimiento_id: establecimiento.id,
            fecha_inicio: getRandomDate(new Date('2020-01-01'), new Date()),
            estado_asociacion: EstadoAsociacionCE.accepted
          }
        });
      }
    }
    console.log('✅ Caballos asignados a establecimientos');

    // Resumen final
    console.log('\n🎉 ¡DATOS DE PRUEBA GENERADOS EXITOSAMENTE!\n');
    
    console.log('📊 RESUMEN:');
    console.log('═══════════════════════════════════════');
    console.log(`🏢 Establecimientos: ${establecimientos.length}`);
    console.log(`🐴 Caballos: ${caballos.length}`);
    console.log(`📋 Departamentos: ${departamentos.length}`);
    console.log(`👔 Puestos: ${puestos.length}`);
    
    console.log('\n👥 USUARIOS POR ROL:');
    console.log('═══════════════════════════════════════');
    console.log(`👨‍💼 Admin: 1`);
    console.log(`🏇 Propietarios: ${propietarios.length}`);
    console.log(`🏢 Establecimiento: ${usuariosEstablecimiento.length}`);
    console.log(`🩺 Veterinarios: ${veterinarios.length}`);
    console.log(`👨‍🔧 Capataces: ${capataces.length}`);
    console.log(`👷‍♂️ Empleados: ${empleados.length}`);
    
    console.log('\n🔐 CREDENCIALES:');
    console.log('═══════════════════════════════════════');
    console.log(`Contraseña universal: ${COMMON_PASSWORD}`);
    console.log('Admin: admin@handicapp.com');
    
    console.log('\n📧 EJEMPLOS DE EMAILS:');
    console.log('═══════════════════════════════════════');
    console.log('Propietarios: *.propietarios.com');
    console.log('Establecimiento: *.establecimiento.com');
    console.log('Veterinarios: *.veterinarios.com');
    console.log('Capataces: *.capataces.com');
    console.log('Empleados: *.empleados.com');
    
    console.log('\n✨ ¡Todo listo para probar la aplicación!');

  } catch (error) {
    console.error('❌ Error generando datos de prueba:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar el script
createTestData();