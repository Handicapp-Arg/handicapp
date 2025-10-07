'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuthNew } from '../../lib/hooks/useAuthNew';
import type { UserData } from '../../lib/auth/AuthManager';

interface HorizontalNavbarProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export function HorizontalNavbar({ onMenuClick, onToggleCollapse, isCollapsed }: HorizontalNavbarProps) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthNew();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications] = useState(3); // Simulado - después conectar con API

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar redirección incluso si hay error
      router.push('/login');
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
        {/* Left Side - Menu Button & Collapse Button */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors touch-manipulation"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 transition-colors"
            style={{
              '--tw-ring-color': '#3C2013'
            } as React.CSSProperties}
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            <svg
              className={`h-5 w-5 transform transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Espacio flexible */}
          <div className="min-w-0 flex-1">
            {/* Sin contenido - solo espacio flexible */}
          </div>
        </div>

        {/* Right Side - Notifications & User Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors touch-manipulation">
            <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            {notifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[1.125rem] h-4.5">
                {notifications > 99 ? '99+' : notifications}
              </span>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-1 sm:space-x-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 p-1.5 sm:p-2 hover:bg-gray-100 transition-colors touch-manipulation"
            >
              <UserCircleIcon className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600 flex-shrink-0" />
              <div className="text-left hidden md:block min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate max-w-24 lg:max-w-none">
                  {isLoading ? 'Cargando...' : user?.rol?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-24 lg:max-w-none">
                  {isLoading ? '' : (user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : '')}
                </p>
              </div>
              <ChevronDownIcon className={`h-4 w-4 text-gray-600 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.rol?.nombre || 'Rol no definido'}
                  </p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Navegar a perfil - implementar después
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                >
                  <UserCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>Mi Perfil</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Navegar a configuración - implementar después
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>Configuración</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors touch-manipulation"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile User Info - Solo mostrar si no hay dropdown abierto */}
      {!isDropdownOpen && (
        <div className="md:hidden px-3 sm:px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 truncate">
            <span className="font-medium">
              {user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Usuario'}
            </span> - {user?.rol?.nombre || 'Rol'}
          </p>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}