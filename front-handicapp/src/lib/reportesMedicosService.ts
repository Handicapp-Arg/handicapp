/**
 * Reportes Médicos Service
 * Servicio para gestionar reportes veterinarios especializados
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export interface HistorialClinico {
  caballo_id: number;
  caballo_nombre: string;
  consultas: Consulta[];
  tratamientos: Tratamiento[];
  vacunaciones: Vacunacion[];
  diagnosticos: Diagnostico[];
  cirugias: Cirugia[];
  examenes: Examen[];
}

export interface Consulta {
  id: number;
  fecha: Date | string;
  veterinario: string;
  motivo: string;
  sintomas: string;
  diagnostico_preliminar: string;
  observaciones: string;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
}

export interface Tratamiento {
  id: number;
  fecha_inicio: Date | string;
  fecha_fin?: Date | string;
  tipo: 'medicamento' | 'terapia' | 'procedimiento';
  nombre: string;
  descripcion: string;
  dosis?: string;
  frecuencia?: string;
  via_administracion?: string;
  estado: 'activo' | 'completado' | 'suspendido';
  observaciones?: string;
}

export interface Vacunacion {
  id: number;
  fecha: Date | string;
  vacuna: string;
  laboratorio?: string;
  lote?: string;
  dosis: string;
  via_administracion: string;
  proxima_dosis?: Date | string;
  veterinario: string;
  observaciones?: string;
}

export interface Diagnostico {
  id: number;
  fecha: Date | string;
  diagnostico: string;
  descripcion: string;
  gravedad: 'leve' | 'moderada' | 'grave' | 'critica';
  estado: 'activo' | 'en_tratamiento' | 'resuelto';
  veterinario: string;
}

export interface Cirugia {
  id: number;
  fecha: Date | string;
  tipo: string;
  descripcion: string;
  veterinario_principal: string;
  asistentes?: string[];
  duracion_minutos?: number;
  complicaciones?: string;
  resultado: 'exitosa' | 'complicaciones' | 'fallida';
  observaciones?: string;
}

export interface Examen {
  id: number;
  fecha: Date | string;
  tipo: 'sangre' | 'orina' | 'rayos_x' | 'ecografia' | 'endoscopia' | 'otro';
  nombre: string;
  resultados: string;
  valores_normales?: string;
  interpretacion?: string;
  archivo_adjunto?: string;
}

export interface ReporteMedicoCompleto {
  caballo: {
    id: number;
    nombre: string;
    raza?: string;
    edad?: number;
    sexo?: string;
    propietario?: string;
  };
  resumen: {
    total_consultas: number;
    tratamientos_activos: number;
    ultima_consulta?: Date | string;
    proxima_vacunacion?: Date | string;
    alertas_activas: number;
  };
  historial: HistorialClinico;
}

export interface FiltrosReporte {
  caballo_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo?: 'consultas' | 'tratamientos' | 'vacunaciones' | 'diagnosticos' | 'cirugias' | 'examenes' | 'completo';
  veterinario_id?: number;
}

class ReportesMedicosService {
  /**
   * Obtener historial clínico completo de un caballo
   */
  async getHistorialClinico(caballoId: number): Promise<HistorialClinico> {
    try {
      // En producción, esto vendría de endpoints específicos
      const response = await fetch(`${API_BASE}/api/v1/caballos/${caballoId}/historial-clinico`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener historial clínico');
      }

      const data = await response.json();
      return data.data || this.getMockHistorialClinico(caballoId);
    } catch (error) {
      console.warn('Usando datos mock para historial clínico:', error);
      return this.getMockHistorialClinico(caballoId);
    }
  }

  /**
   * Obtener reporte médico completo
   */
  async getReporteMedicoCompleto(caballoId: number): Promise<ReporteMedicoCompleto> {
    try {
      const [caballoRes, historial] = await Promise.all([
        fetch(`${API_BASE}/api/v1/caballos/${caballoId}`, { credentials: 'include' }),
        this.getHistorialClinico(caballoId),
      ]);

      const caballoData = await caballoRes.json();
      const caballo = caballoData.data;

      const resumen = {
        total_consultas: historial.consultas.length,
        tratamientos_activos: historial.tratamientos.filter(t => t.estado === 'activo').length,
        ultima_consulta: historial.consultas[0]?.fecha,
        proxima_vacunacion: historial.vacunaciones
          .filter(v => v.proxima_dosis)
          .sort((a, b) => new Date(a.proxima_dosis!).getTime() - new Date(b.proxima_dosis!).getTime())[0]?.proxima_dosis,
        alertas_activas: historial.diagnosticos.filter(d => d.estado !== 'resuelto' && d.gravedad !== 'leve').length,
      };

      return {
        caballo: {
          id: caballo.id,
          nombre: caballo.nombre,
          raza: caballo.raza,
          edad: this.calcularEdad(caballo.fecha_nacimiento),
          sexo: caballo.sexo,
          propietario: caballo.propietario?.nombre || 'N/A',
        },
        resumen,
        historial,
      };
    } catch (error) {
      console.error('Error obteniendo reporte médico completo:', error);
      throw error;
    }
  }

  /**
   * Obtener reportes con filtros
   */
  async getReportesFiltrados(filtros: FiltrosReporte) {
    try {
      const params = new URLSearchParams();
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.veterinario_id) params.append('veterinario_id', filtros.veterinario_id.toString());

      const url = `${API_BASE}/api/v1/reportes/medicos?${params.toString()}`;
      const response = await fetch(url, { credentials: 'include' });

      if (!response.ok) {
        throw new Error('Error al obtener reportes filtrados');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error obteniendo reportes filtrados:', error);
      throw error;
    }
  }

  /**
   * Generar PDF de reporte médico
   */
  async generarPDFReporte(caballoId: number): Promise<void> {
    try {
      const reporte = await this.getReporteMedicoCompleto(caballoId);
      
      // Aquí iría la lógica de generación de PDF
      // Por ahora, exportamos como JSON simulado
      const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_medico_${reporte.caballo.nombre}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }

  /**
   * Calcular edad del caballo
   */
  private calcularEdad(fechaNacimiento: string | Date): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  /**
   * Datos mock para desarrollo (temporal)
   */
  private getMockHistorialClinico(caballoId: number): HistorialClinico {
    return {
      caballo_id: caballoId,
      caballo_nombre: 'Thunder',
      consultas: [
        {
          id: 1,
          fecha: new Date('2025-10-15'),
          veterinario: 'Dr. García',
          motivo: 'Control rutinario',
          sintomas: 'Ninguno',
          diagnostico_preliminar: 'Estado de salud óptimo',
          observaciones: 'Continuar con plan de alimentación actual',
          temperatura: 37.8,
          frecuencia_cardiaca: 40,
          frecuencia_respiratoria: 12,
        },
        {
          id: 2,
          fecha: new Date('2025-09-20'),
          veterinario: 'Dra. Martínez',
          motivo: 'Cojera leve',
          sintomas: 'Cojera en extremidad anterior derecha',
          diagnostico_preliminar: 'Inflamación del tendón',
          observaciones: 'Reposo por 2 semanas, aplicar hielo',
          temperatura: 38.2,
          frecuencia_cardiaca: 44,
          frecuencia_respiratoria: 14,
        },
      ],
      tratamientos: [
        {
          id: 1,
          fecha_inicio: new Date('2025-09-20'),
          fecha_fin: new Date('2025-10-04'),
          tipo: 'medicamento',
          nombre: 'Antiinflamatorio',
          descripcion: 'Fenilbutazona',
          dosis: '2g',
          frecuencia: 'Cada 12 horas',
          via_administracion: 'Oral',
          estado: 'completado',
          observaciones: 'Tratamiento completado exitosamente',
        },
        {
          id: 2,
          fecha_inicio: new Date('2025-10-01'),
          tipo: 'terapia',
          nombre: 'Fisioterapia',
          descripcion: 'Ejercicios de rehabilitación',
          frecuencia: '3 veces por semana',
          estado: 'activo',
        },
      ],
      vacunaciones: [
        {
          id: 1,
          fecha: new Date('2025-08-15'),
          vacuna: 'Influenza Equina',
          laboratorio: 'Zoetis',
          lote: 'INF2025-08',
          dosis: '1ml',
          via_administracion: 'Intramuscular',
          proxima_dosis: new Date('2026-02-15'),
          veterinario: 'Dr. García',
          observaciones: 'Sin reacciones adversas',
        },
        {
          id: 2,
          fecha: new Date('2025-07-01'),
          vacuna: 'Tétanos',
          laboratorio: 'Merial',
          lote: 'TET2025-07',
          dosis: '1ml',
          via_administracion: 'Intramuscular',
          proxima_dosis: new Date('2026-07-01'),
          veterinario: 'Dra. Martínez',
        },
      ],
      diagnosticos: [
        {
          id: 1,
          fecha: new Date('2025-09-20'),
          diagnostico: 'Tendinitis',
          descripcion: 'Inflamación del tendón flexor digital superficial',
          gravedad: 'moderada',
          estado: 'en_tratamiento',
          veterinario: 'Dra. Martínez',
        },
      ],
      cirugias: [],
      examenes: [
        {
          id: 1,
          fecha: new Date('2025-09-21'),
          tipo: 'ecografia',
          nombre: 'Ecografía de tendón',
          resultados: 'Lesión grado 2 en tendón flexor',
          interpretacion: 'Inflamación moderada, pronóstico favorable con tratamiento',
        },
        {
          id: 2,
          fecha: new Date('2025-08-01'),
          tipo: 'sangre',
          nombre: 'Hemograma completo',
          resultados: 'Valores dentro de rangos normales',
          valores_normales: 'Hematocrito: 32-52%, Hemoglobina: 11-19 g/dL',
        },
      ],
    };
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: Date | string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Formatear fecha y hora
   */
  formatearFechaHora(fecha: Date | string): string {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Obtener color por gravedad
   */
  getColorGravedad(gravedad: string): string {
    const colores: Record<string, string> = {
      'leve': 'bg-blue-100 text-blue-800 border-blue-200',
      'moderada': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'grave': 'bg-orange-100 text-orange-800 border-orange-200',
      'critica': 'bg-red-100 text-red-800 border-red-200',
    };
    return colores[gravedad] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Obtener color por estado
   */
  getColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      'activo': 'bg-green-100 text-green-800 border-green-200',
      'en_tratamiento': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'completado': 'bg-blue-100 text-blue-800 border-blue-200',
      'resuelto': 'bg-gray-100 text-gray-800 border-gray-200',
      'suspendido': 'bg-red-100 text-red-800 border-red-200',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Obtener icono por tipo de examen
   */
  getIconoTipoExamen(tipo: string): string {
    const iconos: Record<string, string> = {
      'sangre': '🩸',
      'orina': '💧',
      'rayos_x': '📷',
      'ecografia': '📡',
      'endoscopia': '🔬',
      'otro': '📋',
    };
    return iconos[tipo] || '📋';
  }

  /**
   * Formatear nombre de tipo
   */
  formatearTipoExamen(tipo: string): string {
    const nombres: Record<string, string> = {
      'sangre': 'Análisis de Sangre',
      'orina': 'Análisis de Orina',
      'rayos_x': 'Rayos X',
      'ecografia': 'Ecografía',
      'endoscopia': 'Endoscopía',
      'otro': 'Otro',
    };
    return nombres[tipo] || tipo;
  }
}

export const reportesMedicosService = new ReportesMedicosService();
