'use client';

import { useState, useEffect } from 'react';
import { UserTable } from './UserTable';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { Button } from '@/components/ui/button';
import ApiClient from '@/lib/services/apiClient';


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
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      // No redirigir, solo mostrar error en UI
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
    fetchUsers();
    fetchRoles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-gray-600 mt-1">Administra usuarios del sistema</p>
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span>➕</span>
            Crear Usuario
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            type="submit"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            🔍 Buscar
          </Button>
          {searchTerm && (
            <Button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
                fetchUsers(1, '');
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Limpiar
            </Button>
          )}
        </form>
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