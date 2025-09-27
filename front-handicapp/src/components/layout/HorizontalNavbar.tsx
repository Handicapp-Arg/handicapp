'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface HorizontalNavbarProps {
  onMenuClick: () => void;
}

export function HorizontalNavbar({ onMenuClick }: HorizontalNavbarProps) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{
    role: string;
    email?: string;
  } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications] = useState(3); // Simulado - después conectar con API

  useEffect(() => {
    // Obtener información del usuario desde cookies
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const roleId = getCookie('role');
    if (roleId) {
      const roleMap: Record<string, string> = {
        '1': 'Administrador',
        '2': 'Establecimiento',
        '3': 'Capataz',
        '4': 'Veterinario',
        '5': 'Empleado',
        '6': 'Propietario'
      };
      
      setUserInfo({
        role: roleMap[roleId] || 'Usuario',
        email: 'usuario@handicapp.com' // Después obtener del perfil
      });
    }
  }, []);

  const handleLogout = () => {
    // Limpiar cookies y localStorage
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('auth-token');
    
    // Redirigir al login
    router.push('/login');
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
        {/* Left Side - Menu Button & Title */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors touch-manipulation"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="h-6 w-6" />
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
                  {userInfo?.role || 'Cargando...'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-24 lg:max-w-none">
                  {userInfo?.email || ''}
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
                    {userInfo?.role || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userInfo?.email || 'usuario@handicapp.com'}
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
            Conectado como <span className="font-medium">{userInfo?.role || 'Usuario'}</span>
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