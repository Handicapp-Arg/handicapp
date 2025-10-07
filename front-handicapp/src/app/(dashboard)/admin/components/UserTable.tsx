'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
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

function ActionMenu({ user, onEdit, onDelete, onToggleStatus }: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onToggleStatus: (userId: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
        variant="ghost"
      >
        <EllipsisVerticalIcon className="h-4 w-4 text-gray-500" />
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
            <button
              onClick={() => {
                onEdit(user);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="text-blue-600">✏️</span> Editar
            </button>
            <button
              onClick={() => {
                onToggleStatus(user.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              {user.estado_usuario === 'active' ? (
                <><span className="text-orange-600">⏸️</span> Desactivar</>
              ) : (
                <><span className="text-green-600">▶️</span> Activar</>
              )}
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                onDelete(user.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <span>🗑️</span> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (roleClave: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      establecimiento: 'bg-blue-100 text-blue-800',
      capataz: 'bg-green-100 text-green-800',
      veterinario: 'bg-purple-100 text-purple-800',
      empleado: 'bg-yellow-100 text-yellow-800',
      propietario: 'bg-gray-100 text-gray-800',
    };
    return colors[roleClave] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Usuario
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Contacto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Rol
              </th>
              <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Estado
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Fecha
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide w-16">
                
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-blue-700">
                        {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-xs text-gray-500 md:hidden truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell px-4 py-3">
                  <div className="text-sm text-gray-900 truncate max-w-[200px]">{user.email}</div>
                  {user.telefono && (
                    <div className="text-xs text-gray-500">{user.telefono}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getRoleBadgeColor(user.rol?.clave || 'unknown')}`}>
                    {user.rol?.nombre || 'Sin rol'}
                  </span>
                  <div className="sm:hidden mt-1">
                    <span className={`inline-flex items-center gap-1 text-xs ${
                      user.estado_usuario === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        user.estado_usuario === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {user.estado_usuario === 'active' ? 'Activo' : 'Inactivo'}
                      {user.verificado && <span className="text-blue-600">✓</span>}
                    </span>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      user.estado_usuario === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className={`text-xs font-medium ${
                      user.estado_usuario === 'active' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {user.estado_usuario === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                    {user.verificado && (
                      <span className="text-xs text-blue-600 font-medium">✓</span>
                    )}
                  </div>
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-xs text-gray-500">
                  {formatDate(user.fecha_creacion)}
                </td>
                <td className="px-4 py-3 text-right">
                  <ActionMenu 
                    user={user}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 sm:px-6">
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
    </div>
  );
}