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
import { AuthService, UserProfile } from '../../lib/services/authService';

interface HorizontalNavbarProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export function HorizontalNavbar({ onMenuClick, onToggleCollapse, isCollapsed }: HorizontalNavbarProps) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications] = useState(3); // Simulado - después conectar con API
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Función helper para obtener cookies
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    // Función para crear fallback desde cookies
    const createFallbackUser = (roleId: string) => {
      const roleMap: Record<string, string> = {
        '1': 'Administrador',
        '2': 'Establecimiento',
        '3': 'Capataz',
        '4': 'Veterinario',
        '5': 'Empleado',
        '6': 'Propietario'
      };

      const claveMap: Record<string, string> = {
        '1': 'admin',
        '2': 'establecimiento',
        '3': 'capataz',
        '4': 'veterinario',
        '5': 'empleado',
        '6': 'propietario'
      };

      // Obtener nombre y apellido reales de las cookies
      const nombre = getCookie('nombre') ? decodeURIComponent(getCookie('nombre')!) : 'Usuario';
      const apellido = getCookie('apellido') ? decodeURIComponent(getCookie('apellido')!) : '';
      
      return {
        id: 0,
        email: 'usuario@handicapp.com',
        nombre: nombre,
        apellido: apellido,
        rol_id: parseInt(roleId),
        verificado: true,
        estado_usuario: 'active',
        rol: {
          id: parseInt(roleId),
          nombre: roleMap[roleId] || 'Usuario',
          clave: claveMap[roleId] || 'user'
        }
      };
    };

    // Obtener información del usuario desde la API
    const loadUserProfile = async () => {
      try {
        // Verificar si hay token antes de hacer la petición
        const token = getCookie('auth-token');
        if (!token) {
          const roleId = getCookie('role');
          if (roleId) {
            setUserInfo(createFallbackUser(roleId));
          }
          return;
        }

        // Si tenemos todos los datos en cookies, usarlos directamente para evitar errores 401
        const roleId = getCookie('role');
        const nombre = getCookie('nombre');
        const apellido = getCookie('apellido');
        
        if (roleId && nombre && apellido) {
          // Datos completos en cookies - usar directamente sin llamar a API
          setUserInfo(createFallbackUser(roleId));
          return;
        }

        // Solo llamar a API si faltan datos (muy poco probable)
        const response = await AuthService.getProfile();
        if (response.success && response.data) {
          setUserInfo(response.data);
        } else {
          const roleId = getCookie('role');
          if (roleId) {
            setUserInfo(createFallbackUser(roleId));
          }
        }
      } catch (error) {
        // Si es error 401, es normal (token expirado), no hacer ruido en consola
        const is401Error = error instanceof Error && error.message.includes('HTTP 401');
        
        if (is401Error) {
          // Token expirado/inválido - comportamiento normal, usar fallback silenciosamente
        } else {
          // Solo logear errores reales (no 401)
          console.error('Error cargando perfil:', error);
        }
        
        // Usar fallback en caso de error
        const roleId = getCookie('role');
        if (roleId) {
          setUserInfo(createFallbackUser(roleId));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleLogout = () => {
    // Limpiar cookies y localStorage
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'nombre=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'apellido=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
                  {isLoading ? 'Cargando...' : userInfo?.rol?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-24 lg:max-w-none">
                  {isLoading ? '' : (userInfo?.nombre && userInfo?.apellido ? `${userInfo.nombre} ${userInfo.apellido}` : '')}
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
                    {userInfo?.nombre && userInfo?.apellido ? `${userInfo.nombre} ${userInfo.apellido}` : 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userInfo?.rol?.nombre || 'Rol no definido'}
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
              {userInfo?.nombre && userInfo?.apellido ? `${userInfo.nombre} ${userInfo.apellido}` : 'Usuario'}
            </span> - {userInfo?.rol?.nombre || 'Rol'}
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