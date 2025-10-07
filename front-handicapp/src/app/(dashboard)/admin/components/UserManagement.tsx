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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      
      const data = search 
        ? await ApiClient.searchUsers(search, page, 10)
        : await ApiClient.getUsers(page, 10);
      
      const usersArray = (data as any).data?.users || [];
      setUsers(usersArray);
      setTotalPages((data as any).meta?.totalPages || (data as any).data?.totalPages || 1);
    } catch (error: any) {
      logger.error('Error fetching users:', error);
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
      logger.error('Error fetching roles:', error);
      // No redirigir, solo mostrar error en UI
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Búsqueda reactiva y cambios de página
  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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
      fetchUsers(currentPage, searchTerm);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await ApiClient.toggleUserStatus(userId);
      fetchUsers(currentPage, searchTerm);
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      alert(error.message || 'Error al cambiar estado del usuario');
    }
  };

  const handleUserCreated = () => {
    setShowCreateModal(false);
    fetchUsers(currentPage, searchTerm);
  };

  const handleUserUpdated = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    fetchUsers(currentPage, searchTerm);
  };

  // Nota: mantenemos el loader en la tabla para unificar experiencia, pero mostramos un skeleton simple aquí

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Buscador + Acción */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
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
            className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
          >
            <span className="mr-2">➕</span>
            Crear Usuario
          </button>
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
        onPageChange={(page) => fetchUsers(page, searchTerm)}
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