/**
 * Role Service
 * Gestión completa de roles y permisos del sistema
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export interface Role {
  id: number;
  clave: string;
  nombre: string;
  creado_el: Date | string;
}

export interface RolePayload {
  clave: string;
  nombre: string;
}

export interface RoleFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RoleResponse {
  roles: Role[];
  total: number;
  totalPages: number;
}

// Permisos por rol (esto debería venir del backend idealmente)
export interface RolePermissions {
  [key: string]: {
    name: string;
    permissions: string[];
    description: string;
    color: string;
    icon: string;
  };
}

export const defaultPermissions: RolePermissions = {
  'admin': {
    name: 'Administrador',
    description: 'Acceso total al sistema',
    color: 'red',
    icon: '👑',
    permissions: [
      'usuarios.crear',
      'usuarios.editar',
      'usuarios.eliminar',
      'usuarios.ver',
      'roles.gestionar',
      'establecimientos.gestionar',
      'caballos.gestionar',
      'eventos.gestionar',
      'tareas.gestionar',
      'reportes.ver',
      'auditoria.ver',
      'configuracion.gestionar',
    ],
  },
  'propietario': {
    name: 'Propietario',
    description: 'Propietario de caballos',
    color: 'blue',
    icon: '🏇',
    permissions: [
      'caballos.ver',
      'caballos.crear',
      'caballos.editar',
      'eventos.ver',
      'eventos.crear',
      'tareas.ver',
      'tareas.crear',
      'reportes.ver',
      'establecimientos.ver',
    ],
  },
  'veterinario': {
    name: 'Veterinario',
    description: 'Profesional veterinario',
    color: 'green',
    icon: '⚕️',
    permissions: [
      'caballos.ver',
      'caballos.editar',
      'eventos.ver',
      'eventos.crear',
      'eventos.editar',
      'consultas.gestionar',
      'tratamientos.gestionar',
      'historial.ver',
      'reportes.medicos',
    ],
  },
  'establecimiento': {
    name: 'Establecimiento',
    description: 'Gestión de establecimiento',
    color: 'yellow',
    icon: '🏛️',
    permissions: [
      'caballos.ver',
      'eventos.ver',
      'eventos.crear',
      'tareas.gestionar',
      'personal.gestionar',
      'inventario.gestionar',
      'reportes.operativos',
    ],
  },
  'capataz': {
    name: 'Capataz',
    description: 'Supervisor de campo',
    color: 'purple',
    icon: '👷',
    permissions: [
      'caballos.ver',
      'tareas.ver',
      'tareas.asignar',
      'tareas.supervisar',
      'empleados.supervisar',
      'reportes.tareas',
    ],
  },
  'empleado': {
    name: 'Empleado',
    description: 'Personal del establecimiento',
    color: 'gray',
    icon: '👤',
    permissions: [
      'caballos.ver',
      'tareas.ver',
      'tareas.completar',
      'eventos.ver',
    ],
  },
};

class RoleService {
  /**
   * Obtener todos los roles
   */
  async getRoles(filters: RoleFilters = {}): Promise<RoleResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = `${API_BASE}/api/v1/roles${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener roles');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtener un rol por ID
   */
  async getRoleById(id: number): Promise<Role> {
    const response = await fetch(`${API_BASE}/api/v1/roles/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener rol');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Crear un nuevo rol
   */
  async createRole(payload: RolePayload): Promise<Role> {
    const response = await fetch(`${API_BASE}/api/v1/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear rol');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Actualizar un rol
   */
  async updateRole(id: number, payload: Partial<RolePayload>): Promise<Role> {
    const response = await fetch(`${API_BASE}/api/v1/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar rol');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Eliminar un rol
   */
  async deleteRole(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/roles/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar rol');
    }
  }

  /**
   * Obtener permisos de un rol
   */
  getRolePermissions(clave: string): string[] {
    return defaultPermissions[clave]?.permissions || [];
  }

  /**
   * Obtener información de un rol
   */
  getRoleInfo(clave: string) {
    return defaultPermissions[clave] || null;
  }

  /**
   * Obtener todos los permisos disponibles
   */
  getAllPermissions(): string[] {
    const allPerms = new Set<string>();
    Object.values(defaultPermissions).forEach(role => {
      role.permissions.forEach(perm => allPerms.add(perm));
    });
    return Array.from(allPerms).sort();
  }

  /**
   * Obtener color de badge por rol
   */
  getRoleBadgeColor(clave: string): string {
    const colorMap: Record<string, string> = {
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'propietario': 'bg-blue-100 text-blue-800 border-blue-200',
      'veterinario': 'bg-green-100 text-green-800 border-green-200',
      'establecimiento': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'capataz': 'bg-purple-100 text-purple-800 border-purple-200',
      'empleado': 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return colorMap[clave] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Obtener icono por rol
   */
  getRoleIcon(clave: string): string {
    return defaultPermissions[clave]?.icon || '👤';
  }

  /**
   * Formatear nombre de permiso
   */
  formatPermissionName(permission: string): string {
    const parts = permission.split('.');
    const permModule = parts[0];
    const action = parts[1] || '';

    const moduleMap: Record<string, string> = {
      'usuarios': 'Usuarios',
      'roles': 'Roles',
      'caballos': 'Caballos',
      'eventos': 'Eventos',
      'tareas': 'Tareas',
      'establecimientos': 'Establecimientos',
      'reportes': 'Reportes',
      'auditoria': 'Auditoría',
      'configuracion': 'Configuración',
      'consultas': 'Consultas',
      'tratamientos': 'Tratamientos',
      'historial': 'Historial',
      'personal': 'Personal',
      'inventario': 'Inventario',
      'empleados': 'Empleados',
    };

    const actionMap: Record<string, string> = {
      'crear': 'Crear',
      'editar': 'Editar',
      'eliminar': 'Eliminar',
      'ver': 'Ver',
      'gestionar': 'Gestionar',
      'asignar': 'Asignar',
      'supervisar': 'Supervisar',
      'completar': 'Completar',
      'medicos': 'Médicos',
      'operativos': 'Operativos',
    };

    return `${moduleMap[permModule] || permModule}: ${actionMap[action] || action}`;
  }

  /**
   * Validar clave de rol
   */
  validateRoleClave(clave: string): { valid: boolean; error?: string } {
    if (!clave || clave.trim() === '') {
      return { valid: false, error: 'La clave no puede estar vacía' };
    }

    if (clave.length < 3) {
      return { valid: false, error: 'La clave debe tener al menos 3 caracteres' };
    }

    if (clave.length > 50) {
      return { valid: false, error: 'La clave no puede tener más de 50 caracteres' };
    }

    if (!/^[a-z_]+$/.test(clave)) {
      return { valid: false, error: 'La clave solo puede contener letras minúsculas y guiones bajos' };
    }

    return { valid: true };
  }

  /**
   * Validar nombre de rol
   */
  validateRoleNombre(nombre: string): { valid: boolean; error?: string } {
    if (!nombre || nombre.trim() === '') {
      return { valid: false, error: 'El nombre no puede estar vacío' };
    }

    if (nombre.length < 3) {
      return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' };
    }

    if (nombre.length > 100) {
      return { valid: false, error: 'El nombre no puede tener más de 100 caracteres' };
    }

    return { valid: true };
  }
}

export const roleService = new RoleService();
