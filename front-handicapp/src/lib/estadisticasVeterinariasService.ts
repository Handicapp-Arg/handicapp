import { apiClient } from '@/lib/http';

// ==================== INTERFACES ====================

export interface EstadisticasGenerales {
  total_caballos: number;
  total_consultas: number;
  consultas_mes_actual: number;
  tratamientos_activos: number;
  vacunaciones_pendientes: number;
  alertas_sanitarias: number;
  promedio_consultas_dia: number;
  tasa_recuperacion: number; // porcentaje
}

export interface ConsultasPorPeriodo {
  fecha: string;
  total: number;
  urgentes: number;
  rutinarias: number;
  seguimiento: number;
}

export interface TratamientoActivo {
  id: number;
  caballo_id: number;
  caballo_nombre: string;
  tipo: 'medicamento' | 'terapia' | 'procedimiento';
  nombre: string;
  fecha_inicio: string;
  dias_restantes: number;
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'activo' | 'revision' | 'completado';
}

export interface AlertaSanitaria {
  id: number;
  tipo: 'vacunacion_vencida' | 'tratamiento_urgente' | 'revision_pendiente' | 'diagnostico_critico' | 'examen_pendiente';
  nivel: 'critico' | 'alto' | 'medio' | 'bajo';
  caballo_id: number;
  caballo_nombre: string;
  descripcion: string;
  fecha_generacion: string;
  fecha_limite?: string;
  leida: boolean;
}

export interface VacunacionCalendario {
  id: number;
  caballo_id: number;
  caballo_nombre: string;
  vacuna: string;
  fecha_aplicacion: string;
  fecha_proxima_dosis: string;
  dias_hasta_proxima: number;
  estado: 'al_dia' | 'proximo' | 'vencida';
  laboratorio?: string;
}

export interface MetricaSalud {
  metrica: string;
  valor: number;
  unidad: string;
  rango_normal: string;
  estado: 'normal' | 'atencion' | 'critico';
  tendencia: 'subiendo' | 'bajando' | 'estable';
}

export interface DiagnosticoPorTipo {
  tipo: string;
  cantidad: number;
  porcentaje: number;
  gravedad_promedio: 'leve' | 'moderada' | 'grave' | 'critica';
}

export interface RendimientoVeterinario {
  veterinario_id: number;
  veterinario_nombre: string;
  total_consultas: number;
  total_tratamientos: number;
  tasa_exito: number;
  especialidad?: string;
}

export interface TendenciaSalud {
  periodo: string;
  caballos_saludables: number;
  caballos_en_tratamiento: number;
  caballos_criticos: number;
  total_caballos: number;
}

// ==================== SERVICE CLASS ====================

class EstadisticasVeterinariasService {
  
  // ========== ESTADÍSTICAS GENERALES ==========
  
  async getEstadisticasGenerales(): Promise<EstadisticasGenerales> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/veterinario/estadisticas/generales') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching estadísticas generales:', error);
      return this.getMockEstadisticasGenerales();
    }
  }

  // ========== CONSULTAS POR PERÍODO ==========
  
  async getConsultasPorPeriodo(dias: number = 30): Promise<ConsultasPorPeriodo[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(`/veterinario/estadisticas/consultas?dias=${dias}`) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching consultas por período:', error);
      return this.getMockConsultasPorPeriodo(dias);
    }
  }

  // ========== TRATAMIENTOS ACTIVOS ==========
  
  async getTratamientosActivos(): Promise<TratamientoActivo[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/veterinario/tratamientos/activos') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching tratamientos activos:', error);
      return this.getMockTratamientosActivos();
    }
  }

  // ========== ALERTAS SANITARIAS ==========
  
  async getAlertasSanitarias(filtro?: 'todas' | 'no_leidas' | 'criticas'): Promise<AlertaSanitaria[]> {
    try {
      const url = filtro ? `/veterinario/alertas?filtro=${filtro}` : '/veterinario/alertas';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(url) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching alertas sanitarias:', error);
      return this.getMockAlertasSanitarias();
    }
  }

  async marcarAlertaLeida(alertaId: number): Promise<boolean> {
    try {
      await apiClient.patch(`/veterinario/alertas/${alertaId}/leer`);
      return true;
    } catch (error) {
      console.error('Error marcando alerta como leída:', error);
      return false;
    }
  }

  // ========== CALENDARIO DE VACUNACIÓN ==========
  
  async getCalendarioVacunacion(meses: number = 3): Promise<VacunacionCalendario[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(`/veterinario/vacunaciones/calendario?meses=${meses}`) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching calendario vacunación:', error);
      return this.getMockCalendarioVacunacion();
    }
  }

  // ========== MÉTRICAS DE SALUD ==========
  
  async getMetricasSalud(caballoId?: number): Promise<MetricaSalud[]> {
    try {
      const url = caballoId 
        ? `/veterinario/metricas-salud/${caballoId}`
        : '/veterinario/metricas-salud/promedio';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(url) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching métricas de salud:', error);
      return this.getMockMetricasSalud();
    }
  }

  // ========== DIAGNÓSTICOS POR TIPO ==========
  
  async getDiagnosticosPorTipo(meses: number = 6): Promise<DiagnosticoPorTipo[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(`/veterinario/diagnosticos/por-tipo?meses=${meses}`) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching diagnósticos por tipo:', error);
      return this.getMockDiagnosticosPorTipo();
    }
  }

  // ========== RENDIMIENTO VETERINARIOS ==========
  
  async getRendimientoVeterinarios(): Promise<RendimientoVeterinario[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/veterinario/rendimiento') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching rendimiento veterinarios:', error);
      return this.getMockRendimientoVeterinarios();
    }
  }

  // ========== TENDENCIAS DE SALUD ==========
  
  async getTendenciasSalud(meses: number = 12): Promise<TendenciaSalud[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(`/veterinario/estadisticas/tendencias?meses=${meses}`) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching tendencias de salud:', error);
      return this.getMockTendenciasSalud(meses);
    }
  }

  // ========== MOCK DATA ==========

  private getMockEstadisticasGenerales(): EstadisticasGenerales {
    return {
      total_caballos: 48,
      total_consultas: 342,
      consultas_mes_actual: 28,
      tratamientos_activos: 12,
      vacunaciones_pendientes: 5,
      alertas_sanitarias: 3,
      promedio_consultas_dia: 2.8,
      tasa_recuperacion: 94.5,
    };
  }

  private getMockConsultasPorPeriodo(dias: number): ConsultasPorPeriodo[] {
    const data: ConsultasPorPeriodo[] = [];
    const today = new Date();
    
    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date(today);
      fecha.setDate(fecha.getDate() - i);
      
      const total = Math.floor(Math.random() * 8) + 1;
      const urgentes = Math.floor(total * 0.2);
      const seguimiento = Math.floor(total * 0.3);
      const rutinarias = total - urgentes - seguimiento;
      
      data.push({
        fecha: fecha.toISOString().split('T')[0],
        total,
        urgentes,
        rutinarias,
        seguimiento,
      });
    }
    
    return data;
  }

  private getMockTratamientosActivos(): TratamientoActivo[] {
    return [
      {
        id: 1,
        caballo_id: 1,
        caballo_nombre: 'Thunder',
        tipo: 'medicamento',
        nombre: 'Fenilbutazona',
        fecha_inicio: '2025-10-15',
        dias_restantes: 7,
        prioridad: 'alta',
        estado: 'activo',
      },
      {
        id: 2,
        caballo_id: 2,
        caballo_nombre: 'Lightning',
        tipo: 'terapia',
        nombre: 'Fisioterapia post-lesión',
        fecha_inicio: '2025-10-10',
        dias_restantes: 14,
        prioridad: 'media',
        estado: 'activo',
      },
      {
        id: 3,
        caballo_id: 3,
        caballo_nombre: 'Storm',
        tipo: 'medicamento',
        nombre: 'Antibiótico (Penicilina)',
        fecha_inicio: '2025-10-18',
        dias_restantes: 5,
        prioridad: 'alta',
        estado: 'activo',
      },
      {
        id: 4,
        caballo_id: 4,
        caballo_nombre: 'Blaze',
        tipo: 'procedimiento',
        nombre: 'Vendaje compresivo',
        fecha_inicio: '2025-10-20',
        dias_restantes: 3,
        prioridad: 'media',
        estado: 'activo',
      },
      {
        id: 5,
        caballo_id: 1,
        caballo_nombre: 'Thunder',
        tipo: 'terapia',
        nombre: 'Crioterapia',
        fecha_inicio: '2025-10-12',
        dias_restantes: 10,
        prioridad: 'baja',
        estado: 'revision',
      },
    ];
  }

  private getMockAlertasSanitarias(): AlertaSanitaria[] {
    return [
      {
        id: 1,
        tipo: 'vacunacion_vencida',
        nivel: 'alto',
        caballo_id: 5,
        caballo_nombre: 'Shadow',
        descripcion: 'Vacuna de Influenza Equina vencida hace 7 días',
        fecha_generacion: '2025-10-15',
        fecha_limite: '2025-10-22',
        leida: false,
      },
      {
        id: 2,
        tipo: 'tratamiento_urgente',
        nivel: 'critico',
        caballo_id: 3,
        caballo_nombre: 'Storm',
        descripcion: 'Tratamiento antibiótico debe completarse en 3 días',
        fecha_generacion: '2025-10-20',
        fecha_limite: '2025-10-23',
        leida: false,
      },
      {
        id: 3,
        tipo: 'revision_pendiente',
        nivel: 'medio',
        caballo_id: 2,
        caballo_nombre: 'Lightning',
        descripcion: 'Revisión post-fisioterapia programada para esta semana',
        fecha_generacion: '2025-10-18',
        fecha_limite: '2025-10-25',
        leida: false,
      },
      {
        id: 4,
        tipo: 'examen_pendiente',
        nivel: 'medio',
        caballo_id: 6,
        caballo_nombre: 'Midnight',
        descripcion: 'Análisis de sangre pendiente - control anual',
        fecha_generacion: '2025-10-16',
        fecha_limite: '2025-10-30',
        leida: true,
      },
      {
        id: 5,
        tipo: 'diagnostico_critico',
        nivel: 'critico',
        caballo_id: 7,
        caballo_nombre: 'Star',
        descripcion: 'Resultados de ecografía requieren atención inmediata',
        fecha_generacion: '2025-10-21',
        fecha_limite: '2025-10-22',
        leida: false,
      },
    ];
  }

  private getMockCalendarioVacunacion(): VacunacionCalendario[] {
    return [
      {
        id: 1,
        caballo_id: 1,
        caballo_nombre: 'Thunder',
        vacuna: 'Influenza Equina',
        fecha_aplicacion: '2025-04-15',
        fecha_proxima_dosis: '2026-04-15',
        dias_hasta_proxima: 175,
        estado: 'al_dia',
        laboratorio: 'Zoetis',
      },
      {
        id: 2,
        caballo_id: 2,
        caballo_nombre: 'Lightning',
        vacuna: 'Tétanos',
        fecha_aplicacion: '2025-01-20',
        fecha_proxima_dosis: '2026-01-20',
        dias_hasta_proxima: 90,
        estado: 'al_dia',
        laboratorio: 'Merial',
      },
      {
        id: 3,
        caballo_id: 3,
        caballo_nombre: 'Storm',
        vacuna: 'Encefalomielitis',
        fecha_aplicacion: '2025-05-10',
        fecha_proxima_dosis: '2025-11-10',
        dias_hasta_proxima: 19,
        estado: 'proximo',
        laboratorio: 'Boehringer',
      },
      {
        id: 4,
        caballo_id: 5,
        caballo_nombre: 'Shadow',
        vacuna: 'Influenza Equina',
        fecha_aplicacion: '2024-10-15',
        fecha_proxima_dosis: '2025-10-15',
        dias_hasta_proxima: -7,
        estado: 'vencida',
        laboratorio: 'Zoetis',
      },
      {
        id: 5,
        caballo_id: 4,
        caballo_nombre: 'Blaze',
        vacuna: 'Herpesvirus',
        fecha_aplicacion: '2025-06-01',
        fecha_proxima_dosis: '2025-12-01',
        dias_hasta_proxima: 40,
        estado: 'al_dia',
        laboratorio: 'Fort Dodge',
      },
      {
        id: 6,
        caballo_id: 6,
        caballo_nombre: 'Midnight',
        vacuna: 'Rabia',
        fecha_aplicacion: '2025-03-15',
        fecha_proxima_dosis: '2026-03-15',
        dias_hasta_proxima: 144,
        estado: 'al_dia',
        laboratorio: 'Merial',
      },
    ];
  }

  private getMockMetricasSalud(): MetricaSalud[] {
    return [
      {
        metrica: 'Temperatura Corporal',
        valor: 37.8,
        unidad: '°C',
        rango_normal: '37.5 - 38.5',
        estado: 'normal',
        tendencia: 'estable',
      },
      {
        metrica: 'Frecuencia Cardíaca',
        valor: 40,
        unidad: 'bpm',
        rango_normal: '28 - 44',
        estado: 'normal',
        tendencia: 'estable',
      },
      {
        metrica: 'Frecuencia Respiratoria',
        valor: 16,
        unidad: 'rpm',
        rango_normal: '10 - 24',
        estado: 'normal',
        tendencia: 'estable',
      },
      {
        metrica: 'Peso Promedio',
        valor: 485,
        unidad: 'kg',
        rango_normal: '450 - 550',
        estado: 'normal',
        tendencia: 'subiendo',
      },
      {
        metrica: 'Condición Corporal',
        valor: 6.5,
        unidad: '/9',
        rango_normal: '5 - 7',
        estado: 'normal',
        tendencia: 'estable',
      },
    ];
  }

  private getMockDiagnosticosPorTipo(): DiagnosticoPorTipo[] {
    return [
      {
        tipo: 'Lesiones Musculares',
        cantidad: 18,
        porcentaje: 25.7,
        gravedad_promedio: 'moderada',
      },
      {
        tipo: 'Problemas Respiratorios',
        cantidad: 12,
        porcentaje: 17.1,
        gravedad_promedio: 'leve',
      },
      {
        tipo: 'Cólico',
        cantidad: 10,
        porcentaje: 14.3,
        gravedad_promedio: 'grave',
      },
      {
        tipo: 'Lesiones en Cascos',
        cantidad: 15,
        porcentaje: 21.4,
        gravedad_promedio: 'moderada',
      },
      {
        tipo: 'Problemas Dentales',
        cantidad: 8,
        porcentaje: 11.4,
        gravedad_promedio: 'leve',
      },
      {
        tipo: 'Infecciones',
        cantidad: 7,
        porcentaje: 10.0,
        gravedad_promedio: 'moderada',
      },
    ];
  }

  private getMockRendimientoVeterinarios(): RendimientoVeterinario[] {
    return [
      {
        veterinario_id: 1,
        veterinario_nombre: 'Dr. Carlos García',
        total_consultas: 156,
        total_tratamientos: 89,
        tasa_exito: 96.2,
        especialidad: 'Medicina General',
      },
      {
        veterinario_id: 2,
        veterinario_nombre: 'Dra. María Martínez',
        total_consultas: 134,
        total_tratamientos: 76,
        tasa_exito: 94.8,
        especialidad: 'Ortopedia Equina',
      },
      {
        veterinario_id: 3,
        veterinario_nombre: 'Dr. Juan López',
        total_consultas: 52,
        total_tratamientos: 31,
        tasa_exito: 93.5,
        especialidad: 'Cirugía',
      },
    ];
  }

  private getMockTendenciasSalud(meses: number): TendenciaSalud[] {
    const data: TendenciaSalud[] = [];
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const today = new Date();
    
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(today);
      fecha.setMonth(fecha.getMonth() - i);
      
      const total = 48;
      const criticos = Math.floor(Math.random() * 3) + 1;
      const en_tratamiento = Math.floor(Math.random() * 8) + 5;
      const saludables = total - criticos - en_tratamiento;
      
      data.push({
        periodo: mesesNombres[fecha.getMonth()],
        caballos_saludables: saludables,
        caballos_en_tratamiento: en_tratamiento,
        caballos_criticos: criticos,
        total_caballos: total,
      });
    }
    
    return data;
  }

  // ========== HELPERS ==========

  getColorNivelAlerta(nivel: string): string {
    const colores: Record<string, string> = {
      critico: 'border-red-300 bg-red-50 text-red-800',
      alto: 'border-orange-300 bg-orange-50 text-orange-800',
      medio: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      bajo: 'border-blue-300 bg-blue-50 text-blue-800',
    };
    return colores[nivel] || colores.medio;
  }

  getIconoTipoAlerta(tipo: string): string {
    const iconos: Record<string, string> = {
      vacunacion_vencida: '💉',
      tratamiento_urgente: '⚕️',
      revision_pendiente: '📋',
      diagnostico_critico: '🚨',
      examen_pendiente: '🔬',
    };
    return iconos[tipo] || '📌';
  }

  getColorEstadoVacuna(estado: string): string {
    const colores: Record<string, string> = {
      al_dia: 'border-green-300 bg-green-50 text-green-800',
      proximo: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      vencida: 'border-red-300 bg-red-50 text-red-800',
    };
    return colores[estado] || colores.al_dia;
  }

  getColorPrioridad(prioridad: string): string {
    const colores: Record<string, string> = {
      alta: 'border-red-300 bg-red-50 text-red-800',
      media: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      baja: 'border-blue-300 bg-blue-50 text-blue-800',
    };
    return colores[prioridad] || colores.media;
  }

  formatearFecha(fecha: string | Date): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }
}

export const estadisticasVeterinariasService = new EstadisticasVeterinariasService();
export default estadisticasVeterinariasService;
