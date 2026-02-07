/**
 * Script para generar actividad masiva de prueba
 * Crea eventos, tareas y notificaciones para los caballos existentes
 * 
 * Uso: npx ts-node scripts/seed-actividad-masiva.ts
 */

import { sequelize } from '../src/config/database';
import { Caballo } from '../src/models/Caballo';
import { Evento } from '../src/models/Evento';
import { Tarea } from '../src/models/Tarea';
import { Notificacion } from '../src/models/Notificacion';
import { TipoEvento } from '../src/models/TipoEvento';
import { User } from '../src/models/User';
import { Establecimiento } from '../src/models/Establecimiento';
import { Gasto } from '../src/models/Gasto';
import { initializeModels } from '../src/models';
import { EstadoValidacionEvento, TipoTarea } from '../src/models/enums';
import { Op } from 'sequelize';

// Configuración
const CANTIDAD_NOTIFICACIONES = 30;

// Datos para generar eventos realistas
const TITULOS_ENTRENAMIENTOS = [
  'Entrenamiento de resistencia',
  'Trabajo en pista',
  'Ejercicios de salto',
  'Galope controlado',
  'Trabajo de rienda',
  'Entrenamiento en cancha',
  'Sesión de doma',
  'Práctica de polo',
  'Calentamiento matutino',
  'Ejercicios de flexibilidad'
];

const DESCRIPCIONES_ENTRENAMIENTOS = [
  'Sesión de 45 minutos enfocada en resistencia cardiovascular',
  'Trabajo técnico en pista cubierta con obstáculos',
  'Práctica de saltos con diferentes alturas y combinaciones',
  'Galope progresivo de 30 minutos con intervalos',
  'Ejercicios de rienda y control de cabeza',
  'Entrenamiento específico en cancha de polo',
  'Trabajo de doma clásica y movimientos laterales',
  'Práctica de jugadas y posiciones en cancha',
  'Calentamiento suave para preparación física',
  'Ejercicios de estiramiento y flexibilidad muscular'
];

const TITULOS_VETERINARIOS = [
  'Control veterinario mensual',
  'Vacunación antirrábica',
  'Desparasitación',
  'Revisión dental',
  'Ecografía de tendones',
  'Control de cascos',
  'Análisis de sangre',
  'Chequeo preventivo',
  'Revisión post-entrenamiento',
  'Control de peso y condición corporal'
];

const TITULOS_HERRAJES = [
  'Herraje completo',
  'Recorte de cascos',
  'Cambio de herraduras',
  'Herraje correctivo',
  'Mantenimiento de herraje',
  'Revisión de cascos',
  'Ajuste de herraduras'
];

const TITULOS_TAREAS = [
  'Limpieza profunda del box',
  'Alimentación matutina',
  'Alimentación vespertina',
  'Cepillado y limpieza',
  'Revisión de agua y comida',
  'Cambio de cama',
  'Limpieza de bebederos',
  'Control de estado general',
  'Preparación para entrenamiento',
  'Enfriamiento post-ejercicio',
  'Aplicación de vendajes',
  'Duchado y secado',
  'Revisión de equipo de montura',
  'Limpieza de cascos',
  'Control de temperatura'
];

const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];
const ESTADOS_EVENTO = ['programado', 'en_curso', 'completado', 'cancelado'];

// Función para generar fecha aleatoria en rango
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función para generar hora en formato HH:MM
function randomHora(): string {
  const hora = Math.floor(Math.random() * 14) + 6; // Entre 6 y 20
  const minuto = Math.random() > 0.5 ? '00' : '30';
  return `${hora.toString().padStart(2, '0')}:${minuto}`;
}

async function main() {
  try {
    console.log('🔄 Inicializando modelos...');
    await initializeModels(sequelize);
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener datos necesarios
    console.log('\n📦 Obteniendo datos existentes...');
    
    const caballos = await Caballo.findAll({
      where: {
        nombre: {
          [Op.like]: 'Caballo%'
        }
      },
      limit: 6
    });

    if (caballos.length === 0) {
      console.error('❌ No se encontraron caballos con nombre "Caballo 1, 2, 3..." ');
      console.log('💡 Ejecuta primero: npx ts-node scripts/generate-test-data.ts');
      process.exit(1);
    }

    console.log(`✅ Encontrados ${caballos.length} caballos`);

    // Obtener tipos de evento
    const tiposEvento = await TipoEvento.findAll({ where: { activo: true } });
    if (tiposEvento.length === 0) {
      console.error('❌ No hay tipos de evento en la base de datos');
      process.exit(1);
    }

    const tipoEntrenamiento = tiposEvento.find(t => t.clave.includes('entrenamiento') || t.nombre.includes('Entrenamiento'));
    const tipoVeterinario = tiposEvento.find(t => t.clave.includes('veterinario') || t.nombre.includes('Veterinari'));
    const tipoHerraje = tiposEvento.find(t => t.clave.includes('herraje') || t.nombre.includes('Herraje'));

    console.log(`✅ Tipos de evento disponibles: ${tiposEvento.length}`);

    // Obtener primer empleado o admin para asignar
    const empleado = await User.findOne({
      where: {
        rol_id: [5, 1] // Empleado o Admin
      }
    });

    if (!empleado) {
      console.error('❌ No se encontró un usuario empleado o admin');
      process.exit(1);
    }

    console.log(`✅ Usuario para asignar: ${empleado.nombre} (${empleado.email})`);

    // Obtener establecimiento
    const establecimiento = await Establecimiento.findOne();
    if (!establecimiento) {
      console.error('❌ No se encontró un establecimiento');
      process.exit(1);
    }

    console.log(`✅ Establecimiento: ${establecimiento.nombre}`);

    // Obtener propietario para los gastos
    const propietario = await User.findOne({
      where: {
        rol_id: 4 // Rol propietario
      }
    });
    
    if (!propietario) {
      console.error('❌ No se encontró un usuario propietario');
      process.exit(1);
    }

    console.log(`✅ Propietario para gastos: ${propietario.nombre}`);

    // Rangos de fechas
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    let totalEventos = 0;
    let totalTareas = 0;
    let totalNotificaciones = 0;
    let totalGastos = 0;

    console.log('\n📅 Generando EVENTOS...');
    
    for (const caballo of caballos) {
      console.log(`\n  🐴 ${caballo.nombre}:`);
      
      // Generar eventos de entrenamiento
      const cantidadEntrenamientos = Math.floor(Math.random() * 5) + 5; // 5-10 entrenamientos
      for (let i = 0; i < cantidadEntrenamientos; i++) {
        const fechaEvento = randomDate(hace30Dias, en30Dias);
        const horaInicio = randomHora();
        const titulo = TITULOS_ENTRENAMIENTOS[Math.floor(Math.random() * TITULOS_ENTRENAMIENTOS.length)];
        const descripcion = DESCRIPCIONES_ENTRENAMIENTOS[Math.floor(Math.random() * DESCRIPCIONES_ENTRENAMIENTOS.length)];
        
        const [hora, minuto] = horaInicio.split(':');
        const horaFin = `${(parseInt(hora!) + 1).toString().padStart(2, '0')}:${minuto!}`;
        
        await Evento.create({
          caballo_id: caballo.id,
          tipo_evento_id: tipoEntrenamiento?.id || tiposEvento[0]!.id,
          fecha_evento: fechaEvento,
          titulo: titulo || null,
          descripcion: descripcion || null,
          creado_por_usuario_id: empleado.id,
          establecimiento_id: establecimiento.id,
          hora_inicio: horaInicio || null,
          hora_fin: horaFin || null,
          estado: ESTADOS_EVENTO[Math.floor(Math.random() * ESTADOS_EVENTO.length)] || null,
          prioridad: PRIORIDADES[Math.floor(Math.random() * PRIORIDADES.length)] || null,
          es_publico: Math.random() > 0.3,
          requiere_validacion: false,
          estado_validacion: EstadoValidacionEvento.approved
        });
        totalEventos++;
      }

      // Generar eventos veterinarios
      const cantidadVeterinarios = Math.floor(Math.random() * 3) + 2; // 2-5 controles
      for (let i = 0; i < cantidadVeterinarios; i++) {
        const fechaEvento = randomDate(hace30Dias, en30Dias);
        const titulo = TITULOS_VETERINARIOS[Math.floor(Math.random() * TITULOS_VETERINARIOS.length)];
        
        await Evento.create({
          caballo_id: caballo.id,
          tipo_evento_id: tipoVeterinario?.id || tiposEvento[1]?.id || tiposEvento[0]!.id,
          fecha_evento: fechaEvento,
          titulo: titulo || null,
          descripcion: `Control veterinario de rutina. Revisión completa del estado de salud del equino.`,
          creado_por_usuario_id: empleado.id,
          establecimiento_id: establecimiento.id,
          hora_inicio: randomHora() || null,
          estado: fechaEvento < hoy ? 'completado' : 'programado',
          prioridad: ['media', 'alta'][Math.floor(Math.random() * 2)] || null,
          costo_monto: (Math.random() * 50000 + 10000).toFixed(2),
          costo_moneda: 'ARS',
          es_publico: true,
          requiere_validacion: false,
          estado_validacion: EstadoValidacionEvento.approved
        });
        totalEventos++;
      }

      // Generar eventos de herraje
      const cantidadHerrajes = Math.floor(Math.random() * 2) + 1; // 1-3 herrajes
      for (let i = 0; i < cantidadHerrajes; i++) {
        const fechaEvento = randomDate(hace30Dias, en30Dias);
        const titulo = TITULOS_HERRAJES[Math.floor(Math.random() * TITULOS_HERRAJES.length)];
        
        await Evento.create({
          caballo_id: caballo.id,
          tipo_evento_id: tipoHerraje?.id || tiposEvento[2]?.id || tiposEvento[0]!.id,
          fecha_evento: fechaEvento,
          titulo: titulo || null,
          descripcion: `Trabajo de herraje profesional. Revisión y mantenimiento de cascos.`,
          creado_por_usuario_id: empleado.id,
          establecimiento_id: establecimiento.id,
          hora_inicio: randomHora() || null,
          estado: fechaEvento < hoy ? 'completado' : 'programado',
          prioridad: 'media',
          costo_monto: (Math.random() * 30000 + 15000).toFixed(2),
          costo_moneda: 'ARS',
          es_publico: true,
          requiere_validacion: false,
          estado_validacion: EstadoValidacionEvento.approved
        });
        totalEventos++;
      }

      console.log(`    ✅ Eventos generados: ${cantidadEntrenamientos + cantidadVeterinarios + cantidadHerrajes}`);
    }

    console.log('\n📋 Generando TAREAS...');
    
    for (const caballo of caballos) {
      console.log(`\n  🐴 ${caballo.nombre}:`);
      
      const cantidadTareas = Math.floor(Math.random() * 10) + 15; // 15-25 tareas
      
      for (let i = 0; i < cantidadTareas; i++) {
        const fechaVencimiento = randomDate(hace30Dias, en30Dias);
        const estaVencida = fechaVencimiento < hoy;
        const estaCompletada = Math.random() > 0.3; // 70% completadas
        
        let estado: string;
        if (estaVencida && !estaCompletada) {
          estado = 'pendiente'; // Será vencida por lógica del sistema
        } else if (estaCompletada) {
          estado = 'completada';
        } else if (Math.random() > 0.7) {
          estado = 'en_progreso';
        } else {
          estado = 'pendiente';
        }

        const tiposTarea = Object.values(TipoTarea);
        const titulo = TITULOS_TAREAS[Math.floor(Math.random() * TITULOS_TAREAS.length)];
        const tipoTarea = tiposTarea[Math.floor(Math.random() * tiposTarea.length)]!;
        
        await Tarea.create({
          establecimiento_id: establecimiento.id,
          caballo_id: caballo.id,
          tipo: tipoTarea,
          titulo: titulo || 'Tarea general',
          notas: Math.random() > 0.5 ? `Tarea asignada para ${caballo.nombre}. Requiere atención especial.` : null,
          asignado_a_usuario_id: empleado.id,
          creado_por_usuario_id: empleado.id,
          estado: estado as any,
          fecha_vencimiento: fechaVencimiento,
          prioridad: PRIORIDADES[Math.floor(Math.random() * PRIORIDADES.length)] || null
        });
        totalTareas++;
        
        // 40% de las tareas completadas tendrán gastos asociados
        if (estado === 'completada' && Math.random() > 0.6) {
          const categorias = ['alimentacion', 'veterinaria', 'herraje', 'entrenamiento', 'transporte', 'mantenimiento'];
          const categoria = categorias[Math.floor(Math.random() * categorias.length)]!;
          
          let montoBase = 0;
          let descripcionGasto = '';
          
          // Asignar montos según categoría
          if (categoria === 'alimentacion') {
            montoBase = Math.random() * 15000 + 5000; // $5,000 - $20,000
            descripcionGasto = 'Alimento balanceado y suplementos';
          } else if (categoria === 'veterinaria') {
            montoBase = Math.random() * 40000 + 10000; // $10,000 - $50,000
            descripcionGasto = 'Consulta veterinaria y medicamentos';
          } else if (categoria === 'herraje') {
            montoBase = Math.random() * 25000 + 15000; // $15,000 - $40,000
            descripcionGasto = 'Servicio de herraje profesional';
          } else if (categoria === 'entrenamiento') {
            montoBase = Math.random() * 30000 + 20000; // $20,000 - $50,000
            descripcionGasto = 'Sesión de entrenamiento especializado';
          } else if (categoria === 'transporte') {
            montoBase = Math.random() * 20000 + 10000; // $10,000 - $30,000
            descripcionGasto = 'Transporte a evento/entrenamiento';
          } else {
            montoBase = Math.random() * 10000 + 3000; // $3,000 - $13,000
            descripcionGasto = 'Mantenimiento y equipamiento';
          }
          
          await Gasto.create({
            usuario_id: propietario!.id,
            caballo_id: caballo.id,
            monto: parseFloat(montoBase.toFixed(2)),
            descripcion: `${descripcionGasto} - ${titulo}`,
            fecha: fechaVencimiento,
            categoria: categoria
          });
          totalGastos++;
        }
      }

      console.log(`    ✅ Tareas generadas: ${cantidadTareas}`);
    }

    console.log('\n🔔 Generando NOTIFICACIONES...');
    
    const tiposNotificacion = ['info', 'success', 'warning', 'error'];
    const titulosNotificaciones = [
      'Recordatorio de entrenamiento',
      'Evento próximo',
      'Tarea completada',
      'Control veterinario programado',
      'Herraje pendiente',
      'Actualización de estado',
      'Nuevo evento asignado',
      'Tarea vencida',
      'Cambio en calendario',
      'Alerta de salud'
    ];

    for (let i = 0; i < CANTIDAD_NOTIFICACIONES; i++) {
      const caballoAleatorio = caballos[Math.floor(Math.random() * caballos.length)]!;
      const tipo = tiposNotificacion[Math.floor(Math.random() * tiposNotificacion.length)]!;
      const titulo = titulosNotificaciones[Math.floor(Math.random() * titulosNotificaciones.length)]!;
      
      await Notificacion.create({
        usuario_id: empleado.id,
        tipo: tipo,
        payload_json: JSON.stringify({
          titulo: titulo,
          mensaje: `Notificación relacionada con ${caballoAleatorio.nombre}. ${titulo}.`,
          link: `/caballos/${caballoAleatorio.id}`,
          caballo_id: caballoAleatorio.id,
          caballo_nombre: caballoAleatorio.nombre
        }),
        estado: Math.random() > 0.4 ? 'read' : 'unread' as any
      });
      totalNotificaciones++;
    }

    console.log(`✅ ${totalNotificaciones} notificaciones generadas`);

    console.log('\n✨ RESUMEN:');
    console.log('═══════════════════════════════════════');
    console.log(`📅 Eventos creados:        ${totalEventos}`);
    console.log(`📋 Tareas creadas:         ${totalTareas}`);
    console.log(`� Gastos generados:       ${totalGastos}`);
    console.log(`�🔔 Notificaciones:         ${totalNotificaciones}`);
    console.log(`🐴 Caballos procesados:    ${caballos.length}`);
    console.log('═══════════════════════════════════════');
    console.log('✅ ¡Datos de prueba generados exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n👋 Conexión cerrada');
  }
}

main();
