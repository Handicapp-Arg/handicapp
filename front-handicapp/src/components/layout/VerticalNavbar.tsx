'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  HomeIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

// Definir los menús por rol con estructura clara
const ROLE_MENUS = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Establecimientos', href: '/admin/establecimientos', icon: BuildingOfficeIcon },
    { name: 'Caballos', href: '/admin/caballos', icon: ClipboardDocumentListIcon },
    { name: 'Eventos', href: '/admin/eventos', icon: CalendarDaysIcon },
    { name: 'Tareas', href: '/admin/tareas', icon: DocumentTextIcon },
    { name: 'Usuarios', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Estadísticas', href: '/admin/stats', icon: ChartBarIcon },
    { name: 'Configuración', href: '/admin/settings', icon: CogIcon },
  ],
  establecimiento: [
    { name: 'Dashboard', href: '/establecimiento', icon: HomeIcon },
    { name: 'Mi Establecimiento', href: '/establecimiento/perfil', icon: BuildingOfficeIcon },
    { name: 'Caballos', href: '/establecimiento/caballos', icon: ClipboardDocumentListIcon },
    { name: 'Eventos', href: '/establecimiento/eventos', icon: CalendarDaysIcon },
    { name: 'Tareas', href: '/establecimiento/tareas', icon: DocumentTextIcon },
    { name: 'Personal', href: '/establecimiento/personal', icon: UserGroupIcon },
    { name: 'Configuración', href: '/establecimiento/configuracion', icon: CogIcon },
  ],
  capataz: [
    { name: 'Dashboard', href: '/capataz', icon: HomeIcon },
    { name: 'Establecimiento', href: '/capataz/establecimiento', icon: BuildingOfficeIcon },
    { name: 'Caballos', href: '/capataz/caballos', icon: ClipboardDocumentListIcon },
    { name: 'Eventos', href: '/capataz/eventos', icon: CalendarDaysIcon },
    { name: 'Tareas', href: '/capataz/tareas', icon: DocumentTextIcon },
    { name: 'Reportes', href: '/capataz/reportes', icon: ChartBarIcon },
    { name: 'Mi Perfil', href: '/capataz/perfil', icon: UserIcon },
  ],
  veterinario: [
    { name: 'Dashboard', href: '/veterinario', icon: HomeIcon },
    { name: 'Establecimientos', href: '/veterinario/establecimientos', icon: BuildingOfficeIcon },
    { name: 'Caballos', href: '/veterinario/caballos', icon: ClipboardDocumentListIcon },
    { name: 'Eventos Médicos', href: '/veterinario/eventos', icon: BeakerIcon },
    { name: 'Historial Médico', href: '/veterinario/historial', icon: CalendarDaysIcon },
    { name: 'Tareas', href: '/veterinario/tareas', icon: DocumentTextIcon },
    { name: 'Mi Perfil', href: '/veterinario/perfil', icon: UserIcon },
  ],
  empleado: [
    { name: 'Dashboard', href: '/empleado', icon: HomeIcon },
    { name: 'Establecimiento', href: '/empleado/establecimiento', icon: BuildingOfficeIcon },
    { name: 'Caballos', href: '/empleado/caballos', icon: ClipboardDocumentListIcon },
    { name: 'Eventos', href: '/empleado/eventos', icon: CalendarDaysIcon },
    { name: 'Mis Tareas', href: '/empleado/tareas', icon: DocumentTextIcon },
    { name: 'Mi Perfil', href: '/empleado/perfil', icon: UserIcon },
  ],
  propietario: [
    { name: 'Dashboard', href: '/propietario', icon: HomeIcon },
    { name: 'Establecimientos', href: '/propietario/establecimientos', icon: BuildingOfficeIcon },
    { name: 'Mis Caballos', href: '/propietario/caballos', icon: ClipboardDocumentListIcon },
    { name: 'Eventos', href: '/propietario/eventos', icon: CalendarDaysIcon },
    { name: 'Tareas', href: '/propietario/tareas', icon: DocumentTextIcon },
    { name: 'Mi Perfil', href: '/propietario/perfil', icon: UserIcon },
  ],
};

interface VerticalNavbarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export function VerticalNavbar({ isOpen, isCollapsed, onClose }: VerticalNavbarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener rol del usuario desde cookies
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const roleId = getCookie('role');
    if (roleId) {
      const roleMap: Record<string, string> = {
        '1': 'admin',
        '2': 'establecimiento',
        '3': 'capataz',
        '4': 'veterinario',
        '5': 'empleado',
        '6': 'propietario'
      };
      setUserRole(roleMap[roleId] || null);
    }
    setIsLoading(false);
  }, []);

  if (isLoading || !userRole) {
    return (
      <div className={`hidden lg:flex lg:flex-col transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        <div className="flex flex-col flex-grow text-white" style={{backgroundColor: '#3C2013'}}>
          <div className="flex items-center justify-center h-16 px-4 border-b" style={{borderColor: '#D2B48C'}}>
            <div className="animate-pulse h-8 w-32 rounded" style={{backgroundColor: '#D2B48C'}}></div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = ROLE_MENUS[userRole as keyof typeof ROLE_MENUS] || [];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        <div className="flex flex-col flex-grow text-white shadow-xl" style={{backgroundColor: '#3C2013'}}>
          {/* Logo/Header */}
          <div className="flex items-center justify-center h-20 px-4 pb-2 border-b" style={{borderColor: '#3C2013'}}>
            {isCollapsed ? (
              <img 
                src="/logos/logo-icon-white.png" 
                alt="HandicApp" 
                className="h-8 w-8"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.classList.remove('hidden');
                }}
              />
            ) : (
              <img 
                src="/logos/logo-icon-white.png" 
                alt="HandicApp" 
                className="h-20 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.classList.remove('hidden');
                }}
              />
            )}
            <div className="hidden text-xl font-bold text-white">HandicApp</div>
          </div>

          {/* Navigation Menu */}
          <nav className={`flex-1 px-3 pb-4 space-y-2 ${
            isCollapsed ? 'overflow-hidden' : 'overflow-y-auto'
          }`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              // Detección de ruta activa para estructura por roles
              const isActive = pathname === item.href || 
                             (item.href !== '/admin' && item.href !== '/establecimiento' && 
                              item.href !== '/capataz' && item.href !== '/veterinario' && 
                              item.href !== '/empleado' && item.href !== '/propietario' && 
                              pathname.startsWith(item.href + '/'));
              
              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={`
                      flex items-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                      ${isCollapsed ? 'px-2 justify-center' : 'px-3'}
                      ${isActive
                        ? 'text-white shadow-lg border-l-4'
                        : 'text-gray-200 hover:text-white'
                      }
                    `}
                    style={isActive ? {
                      backgroundColor: 'rgba(210, 180, 140, 0.3)',
                      borderLeftColor: '#D2B48C'
                    } : {}}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(210, 180, 140, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                  
                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                      {item.name}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Spacer */}
      <div className={`hidden lg:block lg:flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        {/* Spacer for fixed sidebar */}
      </div>

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 text-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{backgroundColor: '#3C2013'}}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-18 px-4 pb-2 border-b" style={{borderColor: '#D2B48C'}}>
          <div className="flex items-center">
            <img 
              src="/logos/logo-full-white.png" 
              alt="HandicApp" 
              className="h-8 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling!.classList.remove('hidden');
              }}
            />
            <div className="hidden text-lg font-bold text-white ml-2">HandicApp</div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors touch-manipulation hover:bg-gray-700"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(210, 180, 140, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Cerrar menú"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 pt-6 pb-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Detección de ruta activa para estructura por roles
            const isActive = pathname === item.href || 
                           (item.href !== '/admin' && item.href !== '/establecimiento' && 
                            item.href !== '/capataz' && item.href !== '/veterinario' && 
                            item.href !== '/empleado' && item.href !== '/propietario' && 
                            pathname.startsWith(item.href + '/'));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center px-4 py-3.5 text-base font-medium rounded-lg transition-all duration-200 touch-manipulation
                  ${isActive
                    ? 'text-white shadow-lg border-l-4'
                    : 'text-gray-200'
                  }
                `}
                style={isActive ? {
                  backgroundColor: 'rgba(210, 180, 140, 0.3)',
                  borderLeftColor: '#D2B48C'
                } : {}}
                onTouchStart={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(210, 180, 140, 0.2)';
                  }
                }}
                onTouchEnd={(e) => {
                  if (!isActive) {
                    setTimeout(() => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }, 150);
                  }
                }}
              >
                <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Footer */}
        <div className="flex-shrink-0 p-4 border-t" style={{borderColor: '#D2B48C'}}>
          <div className="text-xs text-center" style={{color: '#D2B48C'}}>
            © 2025 HandicApp
          </div>
        </div>
      </div>
    </>
  );
}