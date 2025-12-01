'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CreateUserModal, EditUserModal } from '@/components/common/UserModal';
import { 
  UserManagementTable, 
  UserFilters,
  UserManagementHeader,
  type BaseUser,
  type FilterConfig,
  type ActionConfig,
  type PaginationConfig
} from '@/components/common/UserManagement';
import ApiClient from '@/lib/services/apiClient';
import { UserPlus, UserX, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { CardContent, CardHeader } from '@/components/ui/card';


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
  const [selectedRole, setSelectedRole] = useState<string>('todos');
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUsers = useCallback(async (page = 1, perPage = 10, search = '', roleId?: number, estado?: string) => {
    try {
      setLoading(true);
      
      const data = search 
        ? await ApiClient.searchUsers(search, page, perPage)
        : await ApiClient.getUsers(page, perPage, { roleId, estado });
      
      const usersArray = (data as any).data?.users || [];
      
      // Mapear los datos del backend al formato esperado por el frontend
      const mappedUsers = usersArray.map((user: any) => ({
        ...user,
        fecha_creacion: user.creado_el || user.fecha_creacion || new Date().toISOString(),
        estado_usuario: user.estado_usuario || 'pending',
      }));
      
      setUsers(mappedUsers);
      setTotalPages((data as any).meta?.totalPages || (data as any).data?.totalPages || 1);
      setTotalItems((data as any).meta?.totalItems || (data as any).data?.totalItems || usersArray.length);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    const roleId = selectedRole && selectedRole !== 'todos' ? Number(selectedRole) : undefined;
    const estado = selectedEstado && selectedEstado !== 'todos' ? selectedEstado : undefined;
    fetchUsers(currentPage, itemsPerPage, searchTerm, roleId, estado);
  }, [currentPage, itemsPerPage, searchTerm, selectedRole, selectedEstado, fetchUsers]);

  const handleClearFilters = () => {
    setSelectedRole('todos');
    setSelectedEstado('todos');
    setCurrentPage(1);
  };

  const handleEdit = (user: BaseUser) => {
    const fullUser = users.find(u => u.id === user.id);
    if (fullUser) {
      setSelectedUser(fullUser);
      setShowEditModal(true);
    }
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
      
      const roleId = selectedRole && selectedRole !== 'todos' ? Number(selectedRole) : undefined;
      const estado = selectedEstado && selectedEstado !== 'todos' ? selectedEstado : undefined;
      fetchUsers(currentPage, itemsPerPage, searchTerm, roleId, estado);
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
      const roleId = selectedRole && selectedRole !== 'todos' ? Number(selectedRole) : undefined;
      const estado = selectedEstado && selectedEstado !== 'todos' ? selectedEstado : undefined;
      fetchUsers(currentPage, itemsPerPage, searchTerm, roleId, estado);
    } finally {
      setShowConfirmModal(false);
      setUserToToggle(null);
    }
  };

  const handleUserCreated = () => {
    setShowCreateModal(false);
    const roleId = selectedRole && selectedRole !== 'todos' ? Number(selectedRole) : undefined;
    const estado = selectedEstado && selectedEstado !== 'todos' ? selectedEstado : undefined;
    fetchUsers(currentPage, itemsPerPage, searchTerm, roleId, estado);
  };

  const handleUserUpdated = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    const roleId = selectedRole && selectedRole !== 'todos' ? Number(selectedRole) : undefined;
    const estado = selectedEstado && selectedEstado !== 'todos' ? selectedEstado : undefined;
    fetchUsers(currentPage, itemsPerPage, searchTerm, roleId, estado);
  };

  // Wrapper para updateUser para mantener el contexto de ApiClient
  const updateUserWrapper = async (userId: number, userData: any) => {
    return await ApiClient.updateUser(userId, userData);
  };

  // Wrapper para createUser para mantener el contexto de ApiClient
  const createUserWrapper = async (userData: any) => {
    return await ApiClient.createUser(userData);
  };

  // Transform users to BaseUser format
  const usersAsBaseUsers: BaseUser[] = useMemo(() => {
    return users.map(user => ({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      estado: user.estado_usuario,
      rol: user.rol.nombre,
      rol_id: user.rol.id,
      verificado: user.verificado,
      ubicacion: user.ubicacion,
      establecimiento_id: user.establecimiento_id || undefined,
    }));
  }, [users]);

  // Configuración de filtros para admin
  const filterConfig: FilterConfig = {
    showRolFilter: true,
    showEstadoFilter: true,
    roles: roles,
  };

  // Configuración de acciones para admin (sin view/navegación)
  const actionConfig: ActionConfig = {
    showView: false,
    showEdit: true,
    showToggleStatus: true,
    showDelete: true,
    editLabel: 'Editar',
    toggleLabel: 'Desactivar',
    deleteLabel: 'Eliminar',
  };

  // Configuración de paginación
  const paginationConfig: PaginationConfig = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange: (page) => {
      setCurrentPage(page);
    },
    onItemsPerPageChange: (items) => {
      setItemsPerPage(items);
      setCurrentPage(1);
    },
  };

  return (
    <>
      <CardHeader className="px-4 sm:px-6">
        {/* Header con Buscador y Botón */}
        <UserManagementHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateClick={() => setShowCreateModal(true)}
          createButtonLabel="Crear Usuario"
          searchPlaceholder="Buscar por nombre o email..."
          primaryColor="#0f172a"
        />
      </CardHeader>

      <CardContent className="px-3 sm:px-4 md:px-6">
        {/* Filters con selector de registros */}
        <UserFilters
          config={filterConfig}
          filtroEstado={selectedEstado}
          setFiltroEstado={setSelectedEstado}
          filtroRol={selectedRole}
          setFiltroRol={setSelectedRole}
          onClearFilters={handleClearFilters}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />

        {/* Table */}
        <UserManagementTable
          users={usersAsBaseUsers}
          loading={loading}
          emptyMessage="No se encontraron usuarios"
          actions={actionConfig}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          primaryColor="#0f172a"
          pagination={paginationConfig}
          showVerificado={true}
          showUbicacion={true}
        />
      </CardContent>

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
    </>
  );
}
