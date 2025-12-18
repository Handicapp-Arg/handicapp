// ============================================================================
// TareaEventoMapper - Mapeo de Tipos de Tareas a Tipos de Eventos
// ============================================================================
// Fecha: 2025-12-17
// Autor: HandicApp Team
// Descripción: Servicio para mapear tipos de tareas a tipos de eventos
//              cuando una tarea se completa y genera un evento automáticamente
// ============================================================================

import { TipoTarea } from '../models/enums';
import { TipoEvento } from '../models/TipoEvento';
import { logger } from '../utils/logger';

/**
 * Mapeo estático de tipos de tareas a nombres de tipos de eventos
 * Este mapeo asegura que cada tarea completada genere el tipo de evento correcto
 */
const TAREA_TO_EVENTO_MAP: Record<TipoTarea, string> = {
  // Tareas de cuidado del caballo
  [TipoTarea.alimentacion]: 'Alimentación',
  [TipoTarea.limpieza_box]: 'Limpieza de Box',
  [TipoTarea.aseo_caballo]: 'Aseo del Caballo',
  [TipoTarea.ejercicio]: 'Ejercicio',
  [TipoTarea.salud]: 'Cuidado de Salud',
  [TipoTarea.entrenamiento]: 'Entrenamiento',
  
  // Tareas del establecimiento (estas no deberían generar eventos automáticamente)
  [TipoTarea.mantenimiento]: 'Mantenimiento',
  [TipoTarea.reparacion]: 'Reparación',
  [TipoTarea.limpieza_general]: 'Limpieza General',
  [TipoTarea.compras]: 'Compras',
  [TipoTarea.otro]: 'Otro',
};

/**
 * Servicio para mapear tareas a eventos
 */
export class TareaEventoMapper {
  
  /**
   * Obtiene el ID del tipo de evento correspondiente a un tipo de tarea
   * @param tipoTarea - Tipo de tarea que se completó
   * @returns Promise con el ID del tipo de evento o null si no se encuentra
   */
  static async obtenerTipoEventoId(tipoTarea: TipoTarea): Promise<number | null> {
    try {
      const nombreEvento = TAREA_TO_EVENTO_MAP[tipoTarea];
      
      if (!nombreEvento) {
        logger.warn(`⚠️ No hay mapeo definido para el tipo de tarea: ${tipoTarea}`);
        return null;
      }

      // Buscar el tipo de evento en la base de datos
      const tipoEvento = await TipoEvento.findOne({
        where: { nombre: nombreEvento }
      });

      if (!tipoEvento) {
        logger.warn(`⚠️ Tipo de evento "${nombreEvento}" no encontrado en la base de datos`);
        
        // Intentar buscar uno genérico como fallback
        const tipoEventoGenerico = await TipoEvento.findOne({
          where: { nombre: 'Otro' }
        });

        if (tipoEventoGenerico) {
          logger.info(`✅ Usando tipo de evento genérico como fallback: ${tipoEventoGenerico.id}`);
          return tipoEventoGenerico.id;
        }

        return null;
      }

      logger.info(`✅ Tipo de evento encontrado: ${tipoEvento.nombre} (ID: ${tipoEvento.id})`);
      return tipoEvento.id;

    } catch (error) {
      logger.error('❌ Error al obtener tipo de evento:', error);
      return null;
    }
  }

  /**
   * Verifica si un tipo de tarea debe generar un evento automáticamente
   * Solo las tareas vinculadas a caballos deben generar eventos
   * @param tipoTarea - Tipo de tarea
   * @returns true si debe generar evento, false en caso contrario
   */
  static debeGenerarEvento(tipoTarea: TipoTarea, caballoId: number | null): boolean {
    // No generar evento si no hay caballo asociado
    if (!caballoId) {
      return false;
    }

    // Tareas del establecimiento no generan eventos
    const tareasNoEventos = [
      TipoTarea.mantenimiento,
      TipoTarea.reparacion,
      TipoTarea.limpieza_general,
      TipoTarea.compras,
      TipoTarea.otro
    ];

    return !tareasNoEventos.includes(tipoTarea);
  }

  /**
   * Obtiene una descripción detallada para el evento generado
   * @param tarea - Objeto tarea con la información completa
   * @returns Descripción formateada para el evento
   */
  static generarDescripcionEvento(tarea: {
    titulo: string;
    notas: string | null;
    tipo: TipoTarea;
    asignado_a_usuario_id: number | null;
  }): string {
    let descripcion = `✅ Tarea completada: ${tarea.titulo}`;
    
    if (tarea.notas) {
      descripcion += `\n\n📝 Notas: ${tarea.notas}`;
    }

    descripcion += `\n\n🏷️ Tipo: ${this.obtenerNombreTipo(tarea.tipo)}`;
    
    return descripcion;
  }

  /**
   * Obtiene el nombre legible de un tipo de tarea
   * @param tipo - Tipo de tarea
   * @returns Nombre formateado
   */
  private static obtenerNombreTipo(tipo: TipoTarea): string {
    const nombres: Record<TipoTarea, string> = {
      [TipoTarea.alimentacion]: 'Alimentación',
      [TipoTarea.limpieza_box]: 'Limpieza de Box',
      [TipoTarea.aseo_caballo]: 'Aseo del Caballo',
      [TipoTarea.ejercicio]: 'Ejercicio',
      [TipoTarea.salud]: 'Cuidado de Salud',
      [TipoTarea.entrenamiento]: 'Entrenamiento',
      [TipoTarea.mantenimiento]: 'Mantenimiento',
      [TipoTarea.reparacion]: 'Reparación',
      [TipoTarea.limpieza_general]: 'Limpieza General',
      [TipoTarea.compras]: 'Compras',
      [TipoTarea.otro]: 'Otro'
    };

    return nombres[tipo] || tipo;
  }

  /**
   * Obtiene la prioridad del evento basada en la prioridad de la tarea
   * @param prioridadTarea - Prioridad de la tarea original
   * @returns Prioridad para el evento
   */
  static mapearPrioridad(prioridadTarea: string | null): string {
    if (!prioridadTarea) {
      return 'media';
    }

    // Mapeo directo si coinciden los valores
    const prioridadesValidas = ['baja', 'media', 'alta', 'critica'];
    if (prioridadesValidas.includes(prioridadTarea.toLowerCase())) {
      return prioridadTarea.toLowerCase();
    }

    return 'media';
  }
}
