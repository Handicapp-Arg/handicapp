// src/services/tipoEventoSeedService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Seed para Tipos de Evento
// -----------------------------------------------------------------------------

import { TipoEvento } from '../models/TipoEvento';
import { Disciplina } from '../models/enums';
import { logger } from '../utils/logger';

export class TipoEventoSeedService {
  
  static async seedTiposEvento(): Promise<boolean> {
    try {
      const tiposEvento = [
        // TIPOS GENERALES (Todas las disciplinas)
        { clave: 'nacimiento', nombre: 'Nacimiento', disciplina: null },
        { clave: 'registro', nombre: 'Registro Inicial', disciplina: null },
        { clave: 'muerte', nombre: 'Fallecimiento', disciplina: null },
        { clave: 'venta', nombre: 'Venta/Transferencia', disciplina: null },
        
        // EVENTOS DE SALUD (Veterinarios)
        { clave: 'vacunacion', nombre: 'Vacunación', disciplina: null },
        { clave: 'desparasitacion', nombre: 'Desparasitación', disciplina: null },
        { clave: 'examen_veterinario', nombre: 'Examen Veterinario', disciplina: null },
        { clave: 'tratamiento_medico', nombre: 'Tratamiento Médico', disciplina: null },
        { clave: 'cirugia', nombre: 'Cirugía', disciplina: null },
        { clave: 'herrado', nombre: 'Herrado', disciplina: null },
        { clave: 'odontologia', nombre: 'Odontología Equina', disciplina: null },
        { clave: 'radiografia', nombre: 'Radiografía', disciplina: null },
        { clave: 'ecografia', nombre: 'Ecografía', disciplina: null },
        
        // EVENTOS DE REPRODUCCIÓN
        { clave: 'servicio', nombre: 'Servicio/Monta', disciplina: null },
        { clave: 'inseminacion', nombre: 'Inseminación Artificial', disciplina: null },
        { clave: 'ecografia_gestacion', nombre: 'Ecografía de Gestación', disciplina: null },
        { clave: 'parto', nombre: 'Parto', disciplina: null },
        { clave: 'destete', nombre: 'Destete', disciplina: null },
        
        // EVENTOS DE ENTRENAMIENTO
        { clave: 'inicio_entrenamiento', nombre: 'Inicio de Entrenamiento', disciplina: null },
        { clave: 'sesion_entrenamiento', nombre: 'Sesión de Entrenamiento', disciplina: null },
        { clave: 'evaluacion_fisica', nombre: 'Evaluación Física', disciplina: null },
        { clave: 'descanso', nombre: 'Período de Descanso', disciplina: null },
        
        // EVENTOS ESPECÍFICOS DE POLO
        { clave: 'evaluacion_polo', nombre: 'Evaluación de Polo', disciplina: Disciplina.polo },
        { clave: 'chukker_entrenamiento', nombre: 'Chukker de Entrenamiento', disciplina: Disciplina.polo },
        { clave: 'partido_polo', nombre: 'Partido de Polo', disciplina: Disciplina.polo },
        { clave: 'torneo_polo', nombre: 'Torneo de Polo', disciplina: Disciplina.polo },
        { clave: 'handicap_polo', nombre: 'Evaluación de Handicap', disciplina: Disciplina.polo },
        
        // EVENTOS ESPECÍFICOS DE EQUITACIÓN
        { clave: 'doma_basica', nombre: 'Doma Básica', disciplina: Disciplina.equitacion },
        { clave: 'salto_entrenamiento', nombre: 'Entrenamiento de Salto', disciplina: Disciplina.equitacion },
        { clave: 'adiestramiento', nombre: 'Adiestramiento', disciplina: Disciplina.equitacion },
        { clave: 'concurso_salto', nombre: 'Concurso de Salto', disciplina: Disciplina.equitacion },
        { clave: 'concurso_adiestramiento', nombre: 'Concurso de Adiestramiento', disciplina: Disciplina.equitacion },
        { clave: 'cross_country', nombre: 'Cross Country', disciplina: Disciplina.equitacion },
        { clave: 'concurso_completo', nombre: 'Concurso Completo', disciplina: Disciplina.equitacion },
        
        // EVENTOS ESPECÍFICOS DE TURF/CARRERAS
        { clave: 'breeze_trabajo', nombre: 'Breeze/Trabajo', disciplina: Disciplina.turf },
        { clave: 'carrera_oficial', nombre: 'Carrera Oficial', disciplina: Disciplina.turf },
        { clave: 'carrera_condicional', nombre: 'Carrera Condicional', disciplina: Disciplina.turf },
        { clave: 'stakes_race', nombre: 'Stakes Race', disciplina: Disciplina.turf },
        { clave: 'maiden_race', nombre: 'Maiden Race', disciplina: Disciplina.turf },
        { clave: 'tiempo_oficial', nombre: 'Tiempo Oficial', disciplina: Disciplina.turf },
        { clave: 'pesaje', nombre: 'Pesaje', disciplina: Disciplina.turf },
        
        // EVENTOS ADMINISTRATIVOS Y LEGALES
        { clave: 'cambio_propietario', nombre: 'Cambio de Propietario', disciplina: null },
        { clave: 'cambio_establecimiento', nombre: 'Cambio de Establecimiento', disciplina: null },
        { clave: 'seguro', nombre: 'Seguro/Póliza', disciplina: null },
        { clave: 'transporte', nombre: 'Transporte', disciplina: null },
        { clave: 'documento_legal', nombre: 'Documento Legal', disciplina: null },
        
        // EVENTOS DE NUTRICIÓN Y CUIDADO
        { clave: 'cambio_dieta', nombre: 'Cambio de Dieta', disciplina: null },
        { clave: 'suplementacion', nombre: 'Suplementación', disciplina: null },
        { clave: 'pesaje_animal', nombre: 'Pesaje del Animal', disciplina: null },
        { clave: 'bano_medicinal', nombre: 'Baño Medicinal', disciplina: null },
        
        // EVENTOS ESPECIALES
        { clave: 'exposicion', nombre: 'Exposición/Muestra', disciplina: null },
        { clave: 'fotografia', nombre: 'Sesión Fotográfica', disciplina: null },
        { clave: 'video', nombre: 'Grabación de Video', disciplina: null },
        { clave: 'otro', nombre: 'Otro Evento', disciplina: null },
      ];

      let createdCount = 0;
      for (const tipoData of tiposEvento) {
        const [_tipoEventoInstance, created] = await TipoEvento.findOrCreate({
          where: { clave: tipoData.clave },
          defaults: {
            ...tipoData,
            activo: true,
          }
        });

        if (created) {
          createdCount++;
        }
      }

      if (createdCount > 0) {
        logger.info(`✅ Event types created (${createdCount}/${tiposEvento.length})`);
      }
      
      return true;
      
    } catch (error) {
      logger.error('❌ Error seeding event types', { error });
      return false;
    }
  }
}