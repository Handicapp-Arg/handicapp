'use client';

import { Badge } from '@/components/ui/badge';
import { Eye, Edit, UserX, UserPlus, Trash2 } from 'lucide-react';
import type { UserTableProps } from './types';

export function UserTable({
  users,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
  showActions = true,
  emptyMessage = 'No se encontraron usuarios'
}: UserTableProps) {
  
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-100">
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-100">
        <table className="w-full text-xs sm:text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Estado</th>
              {showActions && (
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                    {user.nombre} {user.apellido}
                  </div>
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">
                    {user.email}
                  </div>
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-none">
                    {user.telefono || '-'}
                  </div>
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-none">
                    {user.rol || user.puesto || '-'}
                  </div>
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <Badge 
                    className={`text-[10px] sm:text-xs px-1.5 sm:px-2 ${user.estado === 'activo' 
                      ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                    }`}
                  >
                    {user.estado === 'activo' ? '● Activo' : '● Inactivo'}
                  </Badge>
                </td>
                {showActions && (
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(user.id)}
                          type="button"
                          className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white active:bg-indigo-700 transition-all duration-200 hover:scale-110 inline-flex items-center justify-center"
                          title="Ver perfil"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(user)}
                          type="button"
                          className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white active:bg-blue-700 transition-all duration-200 hover:scale-110"
                          title="Editar"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      {onToggleStatus && (
                        <button
                          onClick={() => onToggleStatus(user.id)}
                          type="button"
                          className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                            user.estado === 'activo' 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 active:bg-red-200' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 active:bg-green-200'
                          }`}
                          title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        >
                          {user.estado === 'activo' ? <UserX className="h-3 w-3 sm:h-4 sm:w-4" /> : <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(user.id)}
                          type="button"
                          className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white active:bg-red-700 transition-all duration-200 hover:scale-110"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </>
  );
}
