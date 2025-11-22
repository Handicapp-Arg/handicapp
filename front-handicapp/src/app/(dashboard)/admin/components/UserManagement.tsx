'use client';

import { useState, useEffect } from 'react';
import { UserTable } from './UserTable';
import { CreateUserModal, EditUserModal } from '@/components/common/UserModal';
import ApiClient from '@/lib/services/apiClient';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { UserPlus, UserX, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';


export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  estado_usuario: 'pending' | 'invited' | 'active' | 'suspended' | 'disabled' | 'deleted';
  verificado: boolean;
  fecha_creacion: string;
  establecimiento_id?: number | null;
  ubicacion?: string;
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

export interface Establecimiento {
  id: number;
  nombre: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
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
        estado_usuario: user.estado_usuario || 'pending',
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

  const fetchEstablecimientos = async () => {
    try {
      const data = await ApiClient.getEstablecimientos(1, 1000);
      const estArray = (data as any).data?.establecimientos || (data as any).data || [];
      setEstablecimientos(estArray);
    } catch (error: any) {
      console.error('Error fetching establecimientos:', error);
      setEstablecimientos([]);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchEstablecimientos();
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

  const handleDelete = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }
  };

  const confirmarEliminar = async () => {
    if (!userToDelete) return;

    try {
      await ApiClient.deleteUser(userToDelete.id);
      toast.success('Usuario eliminado correctamente');
      
      const roleId = selectedRole ? Number(selectedRole) : undefined;
      const estado = selectedEstado || undefined;
      fetchUsers(currentPage, searchTerm, roleId, estado);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar usuario');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleToggleStatus = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToToggle(user);
      setShowConfirmModal(true);
    }
  };

  const confirmarToggleEstado = async () => {
    if (!userToToggle) return;

    try {
      const response = await ApiClient.toggleUserStatus(userToToggle.id);
      
      // Extraer el estado actualizado de la respuesta del backend
      const updatedUser = (response as any)?.data;
      
      if (updatedUser) {
        // Actualizar el usuario específico en el estado local inmediatamente
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userToToggle.id 
              ? { 
                  ...user, 
                  estado_usuario: updatedUser.estado_usuario || 'pending',
                  actualizado_el: updatedUser.actualizado_el || new Date().toISOString()
                }
              : user
          )
        );
      }
      
      const nuevoEstado = userToToggle.estado_usuario === 'active' ? 'inactivo' : 'activo';
      toast.success(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar estado del usuario');
      
      // En caso de error, recargar para asegurar consistencia
      const roleId = selectedRole ? Number(selectedRole) : undefined;
      const estado = selectedEstado || undefined;
      fetchUsers(currentPage, searchTerm, roleId, estado);
    } finally {
      setShowConfirmModal(false);
      setUserToToggle(null);
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

  // Wrapper para updateUser para mantener el contexto de ApiClient
  const updateUserWrapper = async (userId: number, userData: any) => {
    return await ApiClient.updateUser(userId, userData);
  };

  // Wrapper para createUser para mantener el contexto de ApiClient
  const createUserWrapper = async (userData: any) => {
    return await ApiClient.createUser(userData);
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-xl font-semibold hover:bg-[#0f172a]/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5" />
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
                <option value="pending">Pendiente</option>
                <option value="invited">Invitado</option>
                <option value="suspended">Suspendido</option>
                <option value="disabled">Deshabilitado</option>
                <option value="deleted">Eliminado</option>
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
      <div className="p-4 sm:p-6">
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
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
        roles={roles}
        createUserFn={createUserWrapper}
        primaryColor="#0f172a"
      />

      <EditUserModal
        isOpen={showEditModal && selectedUser !== null}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
        roles={roles}
        establecimientos={establecimientos}
        updateUserFn={updateUserWrapper}
        primaryColor="#0f172a"
      />

      {/* Modal de Confirmación para Activar/Desactivar */}
      <Dialog 
        open={showConfirmModal} 
        onOpenChange={(open) => {
          setShowConfirmModal(open);
          if (!open) setUserToToggle(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {userToToggle?.estado_usuario === 'active' ? (
                <UserX className="w-6 h-6 text-red-600" />
              ) : (
                <UserPlus className="w-6 h-6 text-green-600" />
              )}
              Confirmar Acción
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              ¿Estás seguro de {userToToggle?.estado_usuario === 'active' ? 'desactivar' : 'activar'} a{' '}
              <span className="font-bold">
                {userToToggle?.nombre} {userToToggle?.apellido}
              </span>
              ?
            </p>
            {userToToggle?.estado_usuario === 'active' ? (
              <p className="text-sm text-gray-500 mt-2">
                Al desactivar, el usuario no podrá acceder al sistema hasta que sea reactivado.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Al activar, el usuario podrá acceder nuevamente al sistema.
              </p>
            )}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowConfirmModal(false);
                setUserToToggle(null);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarToggleEstado}
              className={`px-4 py-2 rounded-lg text-white ${
                userToToggle?.estado_usuario === 'active'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {userToToggle?.estado_usuario === 'active' ? 'Desactivar' : 'Activar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación para Eliminar */}
      <Dialog 
        open={showDeleteModal} 
        onOpenChange={(open) => {
          setShowDeleteModal(open);
          if (!open) setUserToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              Eliminar Usuario
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              ¿Estás seguro de eliminar a{' '}
              <span className="font-bold">
                {userToDelete?.nombre} {userToDelete?.apellido}
              </span>
              ?
            </p>
            <p className="text-sm text-red-600 mt-2 font-medium">
              ⚠️ Esta acción es permanente y no se puede deshacer.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Se eliminarán todos los datos asociados al usuario.
            </p>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setUserToDelete(null);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarEliminar}
              className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
