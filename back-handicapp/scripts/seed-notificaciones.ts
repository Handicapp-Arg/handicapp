/**
 * Script para generar notificaciones de prueba masivas
 * Crea notificaciones realistas para el propietario especificado
 * 
 * Uso: npx ts-node scripts/seed-notificaciones.ts
 */

import { sequelize } from '../src/config/database';
import { Notificacion } from '../src/models/Notificacion';
import { User } from '../src/models/User';
import { Caballo } from '../src/models/Caballo';
import { Evento } from '../src/models/Evento';
import { Tarea } from '../src/models/Tarea';
import { initializeModels } from '../src/models';
import { EstadoNotificacion } from '../src/models/enums';
import { QueryTypes } from 'sequelize';

// Configuración
const USUARIO_EMAIL = 'alejo_maros@hotmail.com';
const CANTIDAD_NOTIFICACIONES = 50;

// Plantillas de notificaciones por tipo
const NOTIFICACIONES_TEMPLATES = {
  info: [
    {
      titulo: 'Nueva tarea asignada',
      mensaje: 'Se ha creado una nueva tarea para {caballo}. Revisa los detalles en tu panel de tareas.'
    },
    {
      titulo: 'Actualización de calendario',
      mensaje: 'Se agregó un nuevo evento al calendario de {caballo} para el próximo mes.'
    },
    {
      titulo: 'Recordatorio de actividad',
      mensaje: '{caballo} tiene actividades programadas para esta semana. Revisa el calendario.'
    },
    {
      titulo: 'Informe disponible',
      mensaje: 'El informe mensual de {caballo} está disponible para su revisión.'
    },
    {
      titulo: 'Actualización de perfil',
      mensaje: 'Se actualizó la información de {caballo}. Los cambios ya están reflejados en el sistema.'
    },
    {
      titulo: 'Nuevo mensaje del establecimiento',
      mensaje: 'Hay un mensaje importante del establecimiento sobre las actividades de {caballo}.'
    },
    {
      titulo: 'Confirmación de entrenamiento',
      mensaje: 'El entrenamiento de {caballo} programado para mañana fue confirmado.'
    },
    {
      titulo: 'Reporte de progreso',
      mensaje: '{caballo} completó el 80% de sus objetivos del mes. ¡Buen trabajo!'
    }
  ],
  success: [
    {
      titulo: 'Tarea completada',
      mensaje: 'La tarea "{tarea}" para {caballo} fue completada exitosamente.'
    },
    {
      titulo: 'Evento finalizado',
      mensaje: '{caballo} participó exitosamente en el evento "{evento}". Detalles disponibles en el historial.'
    },
    {
      titulo: 'Control veterinario OK',
      mensaje: 'El control veterinario de {caballo} fue exitoso. Todos los indicadores están en orden.'
    },
    {
      titulo: 'Herraje completado',
      mensaje: 'El herraje de {caballo} fue completado sin inconvenientes. Próximo herraje en 45 días.'
    },
    {
      titulo: 'Vacunación aplicada',
      mensaje: 'Se aplicó la vacunación programada a {caballo}. Registro actualizado en el sistema.'
    },
    {
      titulo: 'Entrenamiento exitoso',
      mensaje: '{caballo} completó la sesión de entrenamiento con excelente desempeño.'
    },
    {
      titulo: 'Análisis de sangre normal',
      mensaje: 'Los resultados del análisis de sangre de {caballo} están dentro de los parámetros normales.'
    },
    {
      titulo: 'Meta alcanzada',
      mensaje: '{caballo} alcanzó el objetivo de entrenamiento del mes. ¡Felicitaciones!'
    }
  ],
  warning: [
    {
      titulo: 'Tarea próxima a vencer',
      mensaje: 'La tarea "{tarea}" para {caballo} vence en 2 días. Por favor, complétala a tiempo.'
    },
    {
      titulo: 'Evento próximo',
      mensaje: 'Recordatorio: {caballo} tiene un evento importante en 3 días. Verifica todos los detalles.'
    },
    {
      titulo: 'Control veterinario pendiente',
      mensaje: '{caballo} debe realizar su control veterinario mensual esta semana.'
    },
    {
      titulo: 'Herraje próximo',
      mensaje: 'Se acerca la fecha del próximo herraje de {caballo}. Programar con anticipación.'
    },
    {
      titulo: 'Vacunación pendiente',
      mensaje: '{caballo} tiene una vacunación pendiente. Revisar calendario de vacunación.'
    },
    {
      titulo: 'Alimentación especial',
      mensaje: 'Recordatorio: {caballo} requiere suplemento dietético en su alimentación matutina.'
    },
    {
      titulo: 'Revisión de cascos',
      mensaje: 'Se recomienda revisar los cascos de {caballo} esta semana debido al entrenamiento intensivo.'
    },
    {
      titulo: 'Clima adverso',
      mensaje: 'Alerta meteorológica: se recomienda reprogramar las actividades al aire libre de {caballo}.'
    }
  ],
  error: [
    {
      titulo: 'Tarea vencida',
      mensaje: 'La tarea "{tarea}" para {caballo} venció hace 2 días. Requiere atención inmediata.'
    },
    {
      titulo: 'Evento cancelado',
      mensaje: 'El evento "{evento}" programado para {caballo} fue cancelado. Se requiere reprogramación.'
    },
    {
      titulo: 'Falta control veterinario',
      mensaje: '{caballo} no ha tenido control veterinario en los últimos 45 días. Programar urgente.'
    },
    {
      titulo: 'Vacuna vencida',
      mensaje: 'Atención: La vacuna antirrábica de {caballo} está vencida. Actualizar inmediatamente.'
    },
    {
      titulo: 'Herraje urgente',
      mensaje: '{caballo} necesita herraje urgente. La última intervención fue hace más de 60 días.'
    },
    {
      titulo: 'Problema reportado',
      mensaje: 'Se reportó un problema con {caballo} durante el entrenamiento. Revisar detalles urgente.'
    },
    {
      titulo: 'Pago pendiente',
      mensaje: 'Hay facturas pendientes de pago relacionadas con {caballo}. Gestionar a la brevedad.'
    }
  ]
};

// Función para generar fecha aleatoria en rango
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función para seleccionar elemento aleatorio de un array
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

async function main() {
  try {
    console.log('🔄 Inicializando modelos...');
    await initializeModels(sequelize);
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Buscar usuario propietario
    console.log(`\n👤 Buscando usuario: ${USUARIO_EMAIL}`);
    const propietario = await User.findOne({
      where: { email: USUARIO_EMAIL }
    });

    if (!propietario) {
      console.error(`❌ No se encontró el usuario con email: ${USUARIO_EMAIL}`);
      console.log('💡 Verifica que el email sea correcto y que el usuario exista en la base de datos.');
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado: ${propietario.nombre} (ID: ${propietario.id})`);

    // Obtener caballos del propietario a través de la tabla intermedia
    console.log('\n🐴 Buscando caballos del propietario...');
    const caballos = await sequelize.query(`
      SELECT c.* FROM caballos c
      INNER JOIN propietarios_caballos pc ON c.id = pc.caballo_id
      WHERE pc.propietario_usuario_id = :usuarioId
    `, {
      replacements: { usuarioId: propietario.id },
      type: QueryTypes.SELECT,
      model: Caballo,
      mapToModel: true
    }) as Caballo[];

    if (caballos.length === 0) {
      console.error('❌ El propietario no tiene caballos asignados');
      console.log('💡 Asegúrate de que el propietario tenga caballos en el sistema.');
      process.exit(1);
    }

    console.log(`✅ Encontrados ${caballos.length} caballos`);
    caballos.forEach(c => console.log(`   - ${c.nombre} (ID: ${c.id})`));

    // Obtener algunas tareas y eventos para referencias
    console.log('\n📋 Obteniendo tareas y eventos...');
    const tareas = await Tarea.findAll({
      where: { caballo_id: caballos.map(c => c.id) },
      limit: 20
    });

    const eventos = await Evento.findAll({
      where: { caballo_id: caballos.map(c => c.id) },
      limit: 20
    });

    console.log(`✅ ${tareas.length} tareas y ${eventos.length} eventos encontrados`);

    // Rangos de fechas para notificaciones
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    console.log(`\n🔔 Generando ${CANTIDAD_NOTIFICACIONES} notificaciones...`);
    
    let notificacionesCreadas = 0;

    for (let i = 0; i < CANTIDAD_NOTIFICACIONES; i++) {
      // Seleccionar tipo aleatorio con distribución
      let tipo: keyof typeof NOTIFICACIONES_TEMPLATES;
      const random = Math.random();
      if (random < 0.4) {
        tipo = 'info';
      } else if (random < 0.7) {
        tipo = 'success';
      } else if (random < 0.9) {
        tipo = 'warning';
      } else {
        tipo = 'error';
      }

      // Seleccionar template aleatorio del tipo
      const template = randomItem(NOTIFICACIONES_TEMPLATES[tipo]);
      
      // Seleccionar caballo aleatorio
      const caballo = randomItem(caballos);
      
      // Reemplazar placeholders
      let titulo = template.titulo;
      let mensaje = template.mensaje;
      
      titulo = titulo.replace('{caballo}', caballo.nombre);
      mensaje = mensaje.replace('{caballo}', caballo.nombre);

      // Agregar referencias a tareas o eventos si es relevante
      if (mensaje.includes('{tarea}') && tareas.length > 0) {
        const tarea = randomItem(tareas);
        mensaje = mensaje.replace('{tarea}', tarea.titulo || 'Tarea general');
      }

      if (mensaje.includes('{evento}') && eventos.length > 0) {
        const evento = randomItem(eventos);
        mensaje = mensaje.replace('{evento}', evento.titulo || 'Evento programado');
      }

      // Generar fecha aleatoria
      const fechaCreacion = randomDate(hace30Dias, hoy);
      
      // Determinar estado (70% leídas, 30% no leídas para notificaciones antiguas)
      let estado: EstadoNotificacion;
      const diasDesdeCreacion = (hoy.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diasDesdeCreacion < 2) {
        // Notificaciones recientes: 50% no leídas
        estado = Math.random() > 0.5 ? EstadoNotificacion.read : EstadoNotificacion.unread;
      } else {
        // Notificaciones antiguas: 80% leídas
        estado = Math.random() > 0.2 ? EstadoNotificacion.read : EstadoNotificacion.unread;
      }

      const leidoEl = estado === EstadoNotificacion.read 
        ? new Date(fechaCreacion.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        : null;

      // Crear payload JSON
      const payload = {
        titulo,
        mensaje,
        caballo_id: caballo.id,
        caballo_nombre: caballo.nombre,
        link: `/propietario/caballos/${caballo.id}`,
        importante: tipo === 'error' || (tipo === 'warning' && Math.random() > 0.5)
      };

      // Crear notificación
      await Notificacion.create({
        usuario_id: propietario.id,
        tipo: tipo,
        payload_json: JSON.stringify(payload),
        estado: estado,
        evento_id: eventos.length > 0 && Math.random() > 0.7 ? randomItem(eventos).id : null,
        tarea_id: tareas.length > 0 && Math.random() > 0.7 ? randomItem(tareas).id : null,
        creado_el: fechaCreacion,
        leido_el: leidoEl
      });

      notificacionesCreadas++;
      
      // Mostrar progreso cada 10 notificaciones
      if (notificacionesCreadas % 10 === 0) {
        console.log(`   ✓ ${notificacionesCreadas}/${CANTIDAD_NOTIFICACIONES} notificaciones creadas`);
      }
    }

    console.log('\n✨ RESUMEN:');
    console.log('═══════════════════════════════════════');
    console.log(`👤 Usuario: ${propietario.nombre} (${propietario.email})`);
    console.log(`🐴 Caballos: ${caballos.length}`);
    console.log(`🔔 Notificaciones creadas: ${notificacionesCreadas}`);
    
    // Contar por tipo
    const notificacionesPorTipo = await Notificacion.findAll({
      where: { usuario_id: propietario.id },
      attributes: [
        'tipo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['tipo'],
      raw: true
    }) as any[];

    console.log('\n📊 Distribución por tipo:');
    notificacionesPorTipo.forEach((row: any) => {
      const icono = row.tipo === 'info' ? 'ℹ️' : row.tipo === 'success' ? '✅' : row.tipo === 'warning' ? '⚠️' : '❌';
      console.log(`   ${icono} ${row.tipo}: ${row.count}`);
    });

    // Contar por estado
    const leidas = await Notificacion.count({
      where: { 
        usuario_id: propietario.id,
        estado: EstadoNotificacion.read
      }
    });
    
    const noLeidas = await Notificacion.count({
      where: { 
        usuario_id: propietario.id,
        estado: EstadoNotificacion.unread
      }
    });

    console.log('\n📬 Estado de notificaciones:');
    console.log(`   ✓ Leídas: ${leidas}`);
    console.log(`   ✉️  No leídas: ${noLeidas}`);
    console.log('═══════════════════════════════════════');
    console.log('✅ ¡Notificaciones de prueba generadas exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n👋 Conexión cerrada');
  }
}

main();
