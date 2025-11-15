'use client';

import { useState, useEffect } from 'react';
import { UserTable } from './UserTable';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import ApiClient from '@/lib/services/apiClient';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/utils/logger';


export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  estado_usuario: 'active' | 'inactive';
  verificado: boolean;
  fecha_creacion: string;
  rol: {
    id: number;
    nombre: string;
    clave: string;
  };
}

export interface Role {
  id: number;
  nombre: string;
  clave: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (page = 1, search = '', roleId?: number, estado?: string) => {
    try {
      setLoading(true);
      
      const data = search 
        ? await ApiClient.searchUsers(search, page, 10)
        : await ApiClient.getUsers(page, 10, { roleId, estado });
      
      const usersArray = (data as any).data?.users || [];
      
      // Mapear los datos del backend al formato esperado por el frontend
      const mappedUsers = usersArray.map((user: any) => ({
        ...user,
        fecha_creacion: user.creado_el || user.fecha_creacion || new Date().toISOString(),
        estado_usuario: user.estado_usuario === 'active' ? 'active' : 'inactive',
      }));
      
      setUsers(mappedUsers);
      setTotalPages((data as any).meta?.totalPages || (data as any).data?.totalPages || 1);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await ApiClient.getRoles();
      setRoles((data as any).data.roles || []);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      // No redirigir, solo mostrar error en UI
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Búsqueda reactiva y cambios de página
  useEffect(() => {
    const roleId = selectedRole ? Number(selectedRole) : undefined;
    const estado = selectedEstado || undefined;
    fetchUsers(currentPage, searchTerm, roleId, estado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedRole, selectedEstado]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setSelectedRole(value);
    setCurrentPage(1);
  };

  const handleEstadoFilterChange = (value: string) => {
    setSelectedEstado(value);
    setCurrentPage(1);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      await ApiClient.deleteUser(userId);
      const roleId = selectedRole ? Number(selectedRole) : undefined;
      const estado = selectedEstado || undefined;
      fetchUsers(currentPage, searchTerm, roleId, estado);
    } catch (error: any) {
      alert(error.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await ApiClient.toggleUserStatus(userId);
      const roleId = selectedRole ? Number(selectedRole) : undefined;
      const estado = selectedEstado || undefined;
      fetchUsers(currentPage, searchTerm, roleId, estado);
    } catch (error: any) {
      alert(error.message || 'Error al cambiar estado del usuario');
    }
  };

  const handleUserCreated = () => {
    setShowCreateModal(false);
    const roleId = selectedRole ? Number(selectedRole) : undefined;
    const estado = selectedEstado || undefined;
    fetchUsers(currentPage, searchTerm, roleId, estado);
  };

  const handleUserUpdated = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    const roleId = selectedRole ? Number(selectedRole) : undefined;
    const estado = selectedEstado || undefined;
    fetchUsers(currentPage, searchTerm, roleId, estado);
  };

  // Nota: mantenemos el loader en la tabla para unificar experiencia, pero mostramos un skeleton simple aquí

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Buscador + Filtros + Acción */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-3">
          {/* Primera fila: Buscador y Botón */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
            >
              <span className="mr-2">➕</span>
              Crear Usuario
            </button>
          </div>
          
          {/* Segunda fila: Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filtro por Rol */}
            <div className="flex-1 sm:flex-none sm:w-48">
              <select
                value={selectedRole}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Todos los roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id.toString()}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro por Estado */}
            <div className="flex-1 sm:flex-none sm:w-48">
              <select
                value={selectedEstado}
                onChange={(e) => handleEstadoFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
                <option value="suspended">Suspendido</option>
                <option value="disabled">Deshabilitado</option>
              </select>
            </div>
            
            {/* Botón limpiar filtros */}
            {(selectedRole || selectedEstado) && (
              <button
                onClick={() => {
                  setSelectedRole('');
                  setSelectedEstado('');
                  setCurrentPage(1);
                }}
                className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <UserTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          const roleId = selectedRole ? Number(selectedRole) : undefined;
          const estado = selectedEstado || undefined;
          fetchUsers(page, searchTerm, roleId, estado);
        }}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          roles={roles}
          onClose={() => setShowCreateModal(false)}
          onUserCreated={handleUserCreated}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          roles={roles}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}
