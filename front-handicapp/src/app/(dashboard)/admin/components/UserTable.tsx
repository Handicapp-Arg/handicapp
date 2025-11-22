'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, UserX, UserPlus, Trash2, CheckCircle, XCircle, Building2, MapPin } from 'lucide-react';
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

// Badge de estado con colores
function EstadoBadge({ estado }: { estado: string }) {
  const configs = {
    active: { label: 'Activo', color: 'bg-green-100 text-green-800 border-green-300' },
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    invited: { label: 'Invitado', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    suspended: { label: 'Suspendido', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    disabled: { label: 'Deshabilitado', color: 'bg-red-100 text-red-800 border-red-300' },
    deleted: { label: 'Eliminado', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  };
  
  const config = configs[estado as keyof typeof configs] || configs.pending;
  
  return (
    <Badge className={`${config.color} text-xs px-2 py-0.5 font-medium`}>
      {config.label}
    </Badge>
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

  return (
    <>
      {/* Tabla Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Contacto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Verificado
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.nombre} {user.apellido}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    {user.ubicacion && (
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {user.ubicacion}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="outline" className="text-xs">
                    {user.rol?.nombre || 'Sin rol'}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600">
                    {user.telefono || '-'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <EstadoBadge estado={user.estado_usuario} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    {user.verificado ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Sí</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">No</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.estado_usuario === 'active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={user.estado_usuario === 'active' ? 'Desactivar' : 'Activar'}
                    >
                      {user.estado_usuario === 'active' ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla Mobile/Tablet - Cards */}
      <div className="lg:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {user.nombre} {user.apellido}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-1">
                {user.verificado ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {user.rol?.nombre || 'Sin rol'}
              </Badge>
              <EstadoBadge estado={user.estado_usuario} />
            </div>

            {user.telefono && (
              <p className="text-sm text-gray-600 mb-2">📱 {user.telefono}</p>
            )}
            
            {user.ubicacion && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                <MapPin className="w-3 h-3" />
                {user.ubicacion}
              </p>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => onEdit(user)}
                className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => onToggleStatus(user.id)}
                className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1 ${
                  user.estado_usuario === 'active'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {user.estado_usuario === 'active' ? (
                  <>
                    <UserX className="w-4 h-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Activar
                  </>
                )}
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="py-2 px-3 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
