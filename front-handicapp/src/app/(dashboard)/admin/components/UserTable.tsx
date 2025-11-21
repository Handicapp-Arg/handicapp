'use client';

import { Button } from '@/components/ui/button';
import { UserTable as BaseUserTable } from '@/components/common/UserTable';
import type { BaseUser } from '@/components/common/UserTable';
import type { User } from './UserManagement';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onToggleStatus: (userId: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  currentPage,
  totalPages,
  onPageChange,
}: UserTableProps) {
  // Transform User to BaseUser format
  const transformedUsers: BaseUser[] = users.map(user => ({
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    telefono: user.telefono,
    estado: user.estado_usuario === 'active' ? 'activo' : 'inactivo',
    rol: user.rol?.nombre || 'Sin rol',
  }));

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
        <p className="text-gray-600">No se encontraron usuarios con los criterios especificados.</p>
      </div>
    );
  }

  return (
    <>
      <BaseUserTable
        users={transformedUsers}
        loading={loading}
        onEdit={(baseUser) => {
          const originalUser = users.find(u => u.id === baseUser.id);
          if (originalUser) onEdit(originalUser);
        }}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        showActions={true}
        emptyMessage="No se encontraron usuarios con los criterios especificados."
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 sm:px-6 mt-4 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </Button>
              <span className="text-sm text-gray-700 flex items-center">
                {currentPage} / {totalPages}
              </span>
              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="relative inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </Button>
            </div>
            <div className="hidden sm:flex sm:items-center sm:justify-between sm:w-full">
              <div>
                <p className="text-sm text-gray-600">
                  Página <span className="font-medium text-gray-900">{currentPage}</span> de{' '}
                  <span className="font-medium text-gray-900">{totalPages}</span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center px-2 py-1 text-sm font-medium rounded-lg text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </Button>
                
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border ${
                        currentPage === pageNum
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center px-2 py-1 text-sm font-medium rounded-lg text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
