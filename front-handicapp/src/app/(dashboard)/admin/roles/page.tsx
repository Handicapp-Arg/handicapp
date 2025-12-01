'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  Save,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
  UserCog,
  Lock,
} from 'lucide-react';
import { roleService, Role, RolePayload, defaultPermissions } from '@/lib/roleService';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { userService } from '@/lib/services/userService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RolesPage() {
  // Estado principal
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RolePayload>({
    clave: '',
    nombre: '',
  });
  const [formErrors, setFormErrors] = useState<{
    clave?: string;
    nombre?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Usuarios por rol
  const [usersByRole, setUsersByRole] = useState<Record<number, number>>({});

  // Modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Vista de matriz de permisos
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    loadRoles();
    loadUsersCount();
  }, []);

  /**
   * Cargar roles
   */
  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await roleService.getRoles({ limit: 100 });
      setRoles(response.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar cantidad de usuarios por rol
   */
  const loadUsersCount = async () => {
    try {
      const response = await userService.getAll();
      const usuarios = response?.data || [];

      const counts: Record<number, number> = {};
      usuarios.forEach((user) => {
        if (user.rol?.id) {
          counts[user.rol.id] = (counts[user.rol.id] || 0) + 1;
        }
      });

      setUsersByRole(counts);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  /**
   * Abrir modal para crear rol
   */
  const handleCreate = () => {
    setEditingRole(null);
    setFormData({ clave: '', nombre: '' });
    setFormErrors({});
    setShowModal(true);
  };

  /**
   * Abrir modal para editar rol
   */
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      clave: role.clave,
      nombre: role.nombre,
    });
    setFormErrors({});
    setShowModal(true);
  };

  /**
   * Validar formulario
   */
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    const claveValidation = roleService.validateRoleClave(formData.clave);
    if (!claveValidation.valid) {
      errors.clave = claveValidation.error;
    }

    const nombreValidation = roleService.validateRoleNombre(formData.nombre);
    if (!nombreValidation.valid) {
      errors.nombre = nombreValidation.error;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Guardar rol (crear o actualizar)
   */
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      if (editingRole) {
        // Actualizar
        await roleService.updateRole(editingRole.id, formData);
      } else {
        // Crear
        await roleService.createRole(formData);
      }

      setShowModal(false);
      loadRoles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar rol');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Confirmar eliminación
   */
  const confirmDelete = (role: Role) => {
    setRoleToDelete(role);
    setShowDeleteConfirm(true);
  };

  /**
   * Eliminar rol
   */
  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      await roleService.deleteRole(roleToDelete.id);
      setShowDeleteConfirm(false);
      setRoleToDelete(null);
      loadRoles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar rol');
    }
  };

  /**
   * Obtener permisos de un rol
   */
  const getRolePermissions = (clave: string) => {
    return roleService.getRolePermissions(clave);
  };

  return (
    <SimpleAdminOnly>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-72 h-72 bg-slate-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-72 h-72 bg-slate-600/20 rounded-full blur-3xl"></div>
            
            <div className="relative px-8 py-12">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-slate-500/10 backdrop-blur-sm rounded-2xl border border-slate-500/20">
                      <Shield className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-1">Gestión de Roles</h1>
                      <p className="text-slate-300">Administración de roles y permisos del sistema</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPermissionsMatrix(!showPermissionsMatrix)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-colors flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    {showPermissionsMatrix ? 'Ocultar' : 'Ver'} Matriz
                  </button>
                  <button
                    onClick={loadRoles}
                    disabled={loading}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Rol
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Roles */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-2xl group-hover:bg-slate-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="w-8 h-8 text-slate-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Total
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Total Roles</p>
                  <p className="text-3xl font-bold text-white">{roles.length}</p>
                  <p className="text-xs text-slate-400">Roles del sistema</p>
                </div>
              </div>
            </div>

            {/* Usuarios Asignados */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Activos
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Usuarios Asignados</p>
                  <p className="text-3xl font-bold text-white">{Object.values(usersByRole).reduce((a, b) => a + b, 0)}</p>
                  <p className="text-xs text-slate-400">Con roles asignados</p>
                </div>
              </div>
            </div>

            {/* Permisos del Sistema */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Lock className="w-8 h-8 text-purple-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Permisos
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Permisos del Sistema</p>
                  <p className="text-3xl font-bold text-white">{roleService.getAllPermissions().length}</p>
                  <p className="text-xs text-slate-400">Permisos disponibles</p>
                </div>
              </div>
            </div>

            {/* Roles Personalizados */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <UserCog className="w-8 h-8 text-green-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Custom
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Roles Personalizados</p>
                  <p className="text-3xl font-bold text-white">{roles.filter(r => !Object.keys(defaultPermissions).includes(r.clave)).length}</p>
                  <p className="text-xs text-slate-400">Creados manualmente</p>
                </div>
              </div>
            </div>
          </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Matriz de Permisos */}
      {showPermissionsMatrix && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Matriz de Permisos por Rol
            </h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Permiso</th>
                  {Object.entries(defaultPermissions).map(([clave, info]) => (
                    <th key={clave} className="text-center py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{info.icon}</span>
                        <span className="text-xs font-medium text-gray-700">{info.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roleService.getAllPermissions().map((permission) => (
                  <tr key={permission} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {roleService.formatPermissionName(permission)}
                    </td>
                    {Object.entries(defaultPermissions).map(([clave, info]) => (
                      <td key={`${permission}-${clave}`} className="text-center py-3 px-4">
                        {info.permissions.includes(permission) ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lista de Roles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay roles registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {roles.map((role) => {
              const roleInfo = roleService.getRoleInfo(role.clave);
              const permissions = getRolePermissions(role.clave);
              const usersCount = usersByRole[role.id] || 0;

              return (
                <div
                  key={role.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {roleService.getRoleIcon(role.clave)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {role.nombre}
                        </h3>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${roleService.getRoleBadgeColor(role.clave)}`}>
                          {role.clave}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(role)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar rol"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(role)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar rol"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Descripción */}
                  {roleInfo && (
                    <p className="text-sm text-gray-600 mb-4">
                      {roleInfo.description}
                    </p>
                  )}

                  {/* Usuarios */}
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      <span className="font-semibold">{usersCount}</span> usuario{usersCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Permisos */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {permissions.length} permiso{permissions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {permissions.slice(0, 6).map((permission) => (
                        <span
                          key={permission}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {roleService.formatPermissionName(permission)}
                        </span>
                      ))}
                      {permissions.length > 6 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{permissions.length - 6} más
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Creado: {new Date(role.creado_el).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clave del Rol *
                </label>
                <input
                  type="text"
                  value={formData.clave}
                  onChange={(e) => setFormData({ ...formData, clave: e.target.value.toLowerCase() })}
                  disabled={!!editingRole}
                  placeholder="Ej: gerente, supervisor"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formErrors.clave ? 'border-red-500' : 'border-gray-300'
                  } ${editingRole ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {formErrors.clave && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.clave}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Solo letras minúsculas y guiones bajos. No se puede modificar después.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Gerente, Supervisor"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formErrors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.nombre && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.nombre}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Nombre descriptivo para mostrar en la interfaz.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Nota importante:</p>
                    <p>
                      Los permisos del rol deben ser configurados en el código.
                      Este formulario solo gestiona la creación y nombres de roles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && roleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Confirmar Eliminación
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar el rol <strong>{roleToDelete.nombre}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> Esta acción no se puede deshacer.
                  {usersByRole[roleToDelete.id] > 0 && (
                    <> Hay {usersByRole[roleToDelete.id]} usuario(s) con este rol.</>
                  )}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRoleToDelete(null);
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
