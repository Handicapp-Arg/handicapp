import { apiClient } from '@/lib/http';

// ==================== INTERFACES ====================

export interface Empleado {
  id: number;
  usuario_id: number;
  establecimiento_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  documento?: string;
  rol_id: number;
  rol_nombre: string;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'vacaciones';
  fecha_ingreso: string;
  fecha_egreso?: string;
  salario?: number;
  departamento?: string;
  puesto?: string;
  supervisor_id?: number;
  supervisor_nombre?: string;
  horario_id?: number;
  avatar_url?: string;
  observaciones?: string;
  creado_el?: string;
  actualizado_el?: string;
  created_at: string;
  updated_at: string;
}

export interface CrearEmpleadoDTO {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  documento?: string;
  rol_id: number;
  fecha_ingreso: string;
  salario?: number;
  departamento?: string;
  puesto?: string;
  supervisor_id?: number;
  horario_id?: number;
  observaciones?: string;
}

export interface ActualizarEmpleadoDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  documento?: string;
  rol_id?: number;
  estado?: 'activo' | 'inactivo' | 'suspendido' | 'vacaciones';
  salario?: number;
  departamento?: string;
  puesto?: string;
  supervisor_id?: number;
  horario_id?: number;
  observaciones?: string;
}

export interface Horario {
  id: number;
  nombre: string;
  descripcion?: string;
  dias_laborales: string[]; // ['lunes', 'martes', etc.]
  hora_entrada: string;
  hora_salida: string;
  horas_semanales: number;
  activo: boolean;
}

export interface Turno {
  id: number;
  empleado_id: number;
  empleado_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: 'normal' | 'extra' | 'nocturno' | 'feriado';
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  observaciones?: string;
}

export interface Ausencia {
  id: number;
  empleado_id: number;
  empleado_nombre: string;
  tipo: 'vacaciones' | 'enfermedad' | 'personal' | 'licencia' | 'suspension';
  fecha_inicio: string;
  fecha_fin: string;
  dias_total: number;
  motivo?: string;
  aprobada: boolean;
  aprobada_por?: string;
  fecha_aprobacion?: string;
  observaciones?: string;
}

export interface HistorialLaboral {
  id: number;
  empleado_id: number;
  fecha: string;
  tipo: 'contratacion' | 'promocion' | 'cambio_rol' | 'cambio_salario' | 'suspension' | 'reactivacion' | 'egreso';
  descripcion: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  realizado_por: string;
}

export interface EstadisticasPersonal {
  total_empleados: number;
  empleados_activos: number;
  empleados_inactivos: number;
  empleados_vacaciones: number;
  turnos_hoy: number;
  ausencias_pendientes: number;
  nuevos_mes: number;
  tasa_rotacion: number; // porcentaje
}

export interface EmpleadoPorRol {
  rol_nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface EmpleadoPorDepartamento {
  departamento: string;
  cantidad: number;
  salario_promedio: number;
}

export interface FiltrosEmpleados {
  estado?: 'activo' | 'inactivo' | 'suspendido' | 'vacaciones';
  rol_id?: number;
  departamento?: string;
  supervisor_id?: number;
  busqueda?: string;
}

// ==================== SERVICE CLASS ====================

class GestionPersonalService {
  
  // ========== EMPLEADOS - CRUD ==========
  
  async getEmpleados(filtros?: FiltrosEmpleados): Promise<Empleado[]> {
    try {
      // Obtener todos los usuarios y filtrar por roles de empleados (capataz, veterinario, empleado)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/users?limit=1000') as any; // Límite alto para obtener todos los empleados
      
      let usuarios = response.data?.users || response.users || response.data || response;
      
      if (!Array.isArray(usuarios)) {
        console.error('La respuesta no es un array:', usuarios);
        return [];
      }
      
      // Filtrar solo empleados, capataces y veterinarios (roles 3, 4, 5)
      usuarios = usuarios.filter((u: { rol_id: number }) => [3, 4, 5].includes(u.rol_id));
      
      // Mapear a formato Empleado
      let empleados: Empleado[] = usuarios.map((u: { 
        id: number; 
        nombre: string; 
        apellido: string; 
        email: string; 
        telefono?: string; 
        documento?: string; 
        rol_id: number; 
        rol?: { nombre: string }; 
        establecimiento_id?: number; 
        departamento?: string; 
        cargo?: string; 
        fecha_ingreso?: string; 
        estado?: string;
        estado_usuario?: string;
        salario?: number;
        creado_el?: string;
        actualizado_el?: string;
        puesto?: string;
      }) => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        telefono: u.telefono || '',
        documento: u.documento || '',
        rol_id: u.rol_id,
        rol_nombre: u.rol?.nombre || this.getRolNombre(u.rol_id),
        fecha_ingreso: u.creado_el || new Date().toISOString(),
        estado: u.estado_usuario === 'active' ? 'activo' : 'inactivo',
        departamento: u.departamento || 'Operaciones',
        puesto: u.puesto || this.getPuestoDefault(u.rol_id),
        salario: u.salario || null,
        creado_el: u.creado_el,
        actualizado_el: u.actualizado_el,
        created_at: u.creado_el || new Date().toISOString(),
        updated_at: u.actualizado_el || new Date().toISOString(),
      }));
      
      // Aplicar filtros
      if (filtros?.estado) {
        empleados = empleados.filter(e => e.estado === filtros.estado);
      }
      if (filtros?.rol_id) {
        empleados = empleados.filter(e => e.rol_id === filtros.rol_id);
      }
      if (filtros?.departamento) {
        empleados = empleados.filter(e => e.departamento === filtros.departamento);
      }
      
      return empleados;
    } catch (error) {
      console.error('Error fetching empleados:', error);
      // Si falla, retornar array vacío
      return [];
    }
  }
  
  private getRolNombre(rolId: number): string {
    const roles: Record<number, string> = {
      3: 'Capataz',
      4: 'Veterinario',
      5: 'Empleado'
    };
    return roles[rolId] || 'Empleado';
  }
  
  private getPuestoDefault(rolId: number): string {
    const puestos: Record<number, string> = {
      3: 'Supervisor',
      4: 'Veterinaria',
      5: 'Auxiliar'
    };
    return puestos[rolId] || 'Operaciones';
  }

  async getEmpleado(id: number): Promise<Empleado | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(`/users/${id}`) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching empleado:', error);
      return null;
    }
  }

  async crearEmpleado(data: CrearEmpleadoDTO): Promise<{ empleado: Empleado; passwordTemporal: string } | null> {
    try {
      // Crear usuario usando la API de users
      // Generar contraseña temporal basada en el documento o email
      const passwordTemp = data.documento 
        ? `Temp${data.documento.slice(-4)}!` 
        : `Temp${Math.floor(1000 + Math.random() * 9000)}!`;
      
      const userData = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: passwordTemp, // Contraseña temporal
        telefono: data.telefono,
        documento: data.documento,
        rol_id: data.rol_id,
        estado_usuario: 'active', // Usar estado_usuario en lugar de activo
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.post('/users', userData) as any;
      
      return {
        empleado: response.data || response,
        passwordTemporal: passwordTemp
      };
    } catch (error) {
      console.error('Error creando empleado:', error);
      return null;
    }
  }

  async actualizarEmpleado(id: number, data: ActualizarEmpleadoDTO): Promise<Empleado | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.put(`/users/${id}`, data) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error actualizando empleado:', error);
      return null;
    }
  }

  async eliminarEmpleado(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/users/${id}`);
      return true;
    } catch (error) {
      console.error('Error eliminando empleado:', error);
      return false;
    }
  }

  async cambiarEstadoEmpleado(id: number, _estado: string): Promise<boolean> {
    try {
      // La ruta correcta es /users/:id/toggle-status del backend
      // Pero como solo cambiamos entre activo/inactivo, usamos toggle
      await apiClient.patch(`/users/${id}/toggle-status`);
      return true;
    } catch (error) {
      console.error('Error cambiando estado:', error);
      return false;
    }
  }

  // ========== HORARIOS ==========
  
  async getHorarios(): Promise<Horario[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/establecimiento/horarios') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching horarios:', error);
      return []; // ✅ Retornar array vacío en lugar de mock
    }
  }

  async asignarHorario(empleadoId: number, horarioId: number): Promise<boolean> {
    try {
      await apiClient.patch(`/users/${empleadoId}/horario`, { horario_id: horarioId });
      return true;
    } catch (error) {
      console.error('Error asignando horario:', error);
      return false;
    }
  }

  // ========== TURNOS ==========
  
  async getTurnos(fecha?: string, empleadoId?: number): Promise<Turno[]> {
    try {
      let url = '/establecimiento/turnos';
      const params = new URLSearchParams();
      
      if (fecha) params.append('fecha', fecha);
      if (empleadoId) params.append('empleado_id', empleadoId.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(url) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching turnos:', error);
      return []; // ✅ Retornar array vacío en lugar de mock
    }
  }

  async crearTurno(turnoData: Partial<Turno>): Promise<Turno | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.post('/establecimiento/turnos', turnoData) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error creando turno:', error);
      return null;
    }
  }

  // ========== AUSENCIAS ========== 
  // FUNCIONALIDAD DESHABILITADA TEMPORALMENTE
  // Será implementada en una versión futura
  
  async getAusencias(_empleadoId?: number, _pendientes?: boolean): Promise<Ausencia[]> {
    // Endpoint no implementado aún - retornar array vacío
    return [];
  }

  async solicitarAusencia(_ausenciaData: Partial<Ausencia>): Promise<Ausencia | null> {
    console.warn('Funcionalidad de ausencias no implementada aún');
    return null;
  }

  async aprobarAusencia(_ausenciaId: number, _aprobada: boolean): Promise<boolean> {
    console.warn('Funcionalidad de ausencias no implementada aún');
    return false;
  }

  // ========== HISTORIAL LABORAL ==========
  
  async getHistorialLaboral(empleadoId: number): Promise<HistorialLaboral[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(`/users/${empleadoId}/historial`) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching historial laboral:', error);
      return []; // ✅ Retornar array vacío en lugar de mock
    }
  }

  // ========== ESTADÍSTICAS ==========
  
  async getEstadisticasPersonal(): Promise<EstadisticasPersonal> {
    try {
      // Calcular estadísticas basadas en los empleados reales
      const empleados = await this.getEmpleados();
      
      return {
        total_empleados: empleados.length,
        empleados_activos: empleados.filter(e => e.estado === 'activo').length,
        empleados_inactivos: empleados.filter(e => e.estado === 'inactivo').length,
        empleados_vacaciones: 0,
        turnos_hoy: 0,
        ausencias_pendientes: 0,
        nuevos_mes: 0,
        tasa_rotacion: 0,
      };
    } catch (error: unknown) {
      console.error('Error fetching estadísticas personal:', error);
      // ✅ Retornar estadísticas vacías en lugar de mock
      return {
        total_empleados: 0,
        empleados_activos: 0,
        empleados_inactivos: 0,
        empleados_vacaciones: 0,
        turnos_hoy: 0,
        ausencias_pendientes: 0,
        nuevos_mes: 0,
        tasa_rotacion: 0,
      };
    }
  }

  async getEmpleadosPorRol(): Promise<EmpleadoPorRol[]> {
    try {
      // Calcular basado en empleados reales
      const empleados = await this.getEmpleados();
      
      const roleMap: Record<number, string> = {
        3: 'Capataz',
        4: 'Veterinario',
        5: 'Empleado'
      };
      
      const roleCounts: Record<string, number> = {};
      empleados.forEach(emp => {
        const roleName = roleMap[emp.rol_id] || 'Otro';
        roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
      });
      
      const total = empleados.length;
      
      return Object.entries(roleCounts).map(([nombre, cantidad]) => ({
        rol: nombre,
        rol_nombre: nombre,
        cantidad,
        porcentaje: total > 0 ? (cantidad / total) * 100 : 0
      }));
    } catch (error) {
      console.error('Error fetching empleados por rol:', error);
      return [];
    }
  }

  async getEmpleadosPorDepartamento(): Promise<EmpleadoPorDepartamento[]> {
    try {
      // Calcular basado en empleados reales
      const empleados = await this.getEmpleados();
      
      const deptCounts: Record<string, number> = {};
      const deptSalaries: Record<string, number[]> = {};
      
      empleados.forEach(emp => {
        const dept = emp.departamento || 'Sin asignar';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        
        if (!deptSalaries[dept]) {
          deptSalaries[dept] = [];
        }
        if (emp.salario) {
          deptSalaries[dept].push(emp.salario);
        }
      });
      
      return Object.entries(deptCounts).map(([departamento, cantidad]) => {
        const salarios = deptSalaries[departamento] || [];
        const salario_promedio = salarios.length > 0
          ? salarios.reduce((sum, sal) => sum + sal, 0) / salarios.length
          : 0;
        
        return {
          departamento,
          cantidad,
          salario_promedio
        };
      });
    } catch (error) {
      console.error('Error fetching empleados por departamento:', error);
      return []; // ✅ Retornar array vacío
    }
  }

  // ========== MOCK DATA - ELIMINADO ==========
  // Ya no se usan datos de prueba, todo viene del backend real

  // ========== HELPERS ==========

  getColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      activo: 'border-green-300 bg-green-50 text-green-800',
      inactivo: 'border-gray-300 bg-gray-50 text-gray-800',
      suspendido: 'border-red-300 bg-red-50 text-red-800',
      vacaciones: 'border-blue-300 bg-blue-50 text-blue-800',
    };
    return colores[estado] || colores.activo;
  }

  getIconoEstado(estado: string): string {
    const iconos: Record<string, string> = {
      activo: '✅',
      inactivo: '⚪',
      suspendido: '🚫',
      vacaciones: '🏖️',
    };
    return iconos[estado] || '📌';
  }

  getColorTipoAusencia(tipo: string): string {
    const colores: Record<string, string> = {
      vacaciones: 'border-blue-300 bg-blue-50 text-blue-800',
      enfermedad: 'border-red-300 bg-red-50 text-red-800',
      personal: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      licencia: 'border-purple-300 bg-purple-50 text-purple-800',
      suspension: 'border-orange-300 bg-orange-50 text-orange-800',
    };
    return colores[tipo] || colores.personal;
  }

  formatearFecha(fecha: string | Date): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(valor);
  }

  calcularDiasEntreFechas(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }
}

export const gestionPersonalService = new GestionPersonalService();
export default gestionPersonalService;
