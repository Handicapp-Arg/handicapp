'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { UserPlus } from 'lucide-react';
import type { UserManagementHeaderProps } from './types';

export function UserManagementHeader({
  searchTerm,
  onSearchChange,
  onCreateClick,
  createButtonLabel = 'Crear Usuario',
  searchPlaceholder = 'Buscar por nombre o email...',
}: UserManagementHeaderProps) {
  
  const buttonBg = 'bg-blue-600 hover:bg-blue-700';
  
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
      {/* Buscador */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>
      
      {/* Botón Crear */}
      <button
        onClick={onCreateClick}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2 ${buttonBg} text-white rounded-lg font-medium transition-colors text-sm`}
      >
        <UserPlus className="w-4 h-4" />
        {createButtonLabel}
      </button>
    </div>
  );
}
