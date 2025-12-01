'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LOGOS } from '@/lib/constants/logos';
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  Building2,
  User,
  ClipboardList,
  Stethoscope,
  Calendar,
  X,
  Bell,
  Trophy,
  Activity,
  Package,
  CreditCard
} from 'lucide-react';

// Definir los menús por rol con estructura clara
const ROLE_MENUS = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Roles', href: '/admin/roles', icon: Users },
    { name: 'Establecimientos', href: '/admin/establecimientos', icon: Building2 },
    { name: 'Caballos', href: '/admin/caballos', icon: ClipboardList },
    { name: 'Eventos', href: '/admin/eventos', icon: Calendar },
    { name: 'Tareas', href: '/admin/tareas', icon: FileText },
    { name: 'Auditoría', href: '/admin/auditoria', icon: FileText },
    { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
  ],
  establecimiento: [
    { name: 'Dashboard', href: '/establecimiento', icon: Home },
    { name: 'Caballos', href: '/establecimiento/caballos', icon: ClipboardList },
    { name: 'Eventos', href: '/establecimiento/eventos', icon: Calendar },
    { name: 'Tareas', href: '/establecimiento/tareas', icon: FileText },
    { name: 'Personal', href: '/establecimiento/personal', icon: Users },
    { name: 'Inventario', href: '/establecimiento/inventario', icon: Package },
    { name: 'Reportes', href: '/establecimiento/reportes', icon: BarChart3 },
    { name: 'Notificaciones', href: '/establecimiento/notificaciones', icon: Bell },
    { name: 'Configuración', href: '/establecimiento/configuracion', icon: Settings },
  ],
  capataz: [
    { name: 'Dashboard', href: '/capataz', icon: Home },
    { name: 'Notificaciones', href: '/capataz/notificaciones', icon: Bell },
    { name: 'Establecimiento', href: '/capataz/establecimiento', icon: Building2 },
    { name: 'Caballos', href: '/capataz/caballos', icon: ClipboardList },
    { name: 'Eventos', href: '/capataz/eventos', icon: Calendar },
    { name: 'Tareas', href: '/capataz/tareas', icon: FileText },
    { name: 'Personal', href: '/capataz/personal', icon: Users },
    { name: 'Reportes', href: '/capataz/reportes', icon: BarChart3 },
    { name: 'Configuración', href: '/capataz/configuracion', icon: Settings },
  ],
  veterinario: [
    { name: 'Dashboard', href: '/veterinario', icon: Home },
    { name: 'Notificaciones', href: '/veterinario/notificaciones', icon: Bell },
    { name: 'Caballos', href: '/veterinario/caballos', icon: ClipboardList },
    { name: 'Consultas', href: '/veterinario/consultas', icon: Stethoscope },
    { name: 'Tratamientos', href: '/veterinario/tratamientos', icon: Activity },
    { name: 'Reportes Médicos', href: '/veterinario/reportes-medicos', icon: FileText },
    { name: 'Estadísticas', href: '/veterinario/estadisticas', icon: BarChart3 },
    { name: 'Historial Médico', href: '/veterinario/historial', icon: Calendar },
    { name: 'Eventos Médicos', href: '/veterinario/eventos', icon: Calendar },
    { name: 'Tareas', href: '/veterinario/tareas', icon: FileText },
    { name: 'Reportes', href: '/veterinario/reportes', icon: BarChart3 },
    { name: 'Configuración', href: '/veterinario/configuracion', icon: Settings },
  ],
  empleado: [
    { name: 'Dashboard', href: '/empleado', icon: Home },
    { name: 'Notificaciones', href: '/empleado/notificaciones', icon: Bell },
    { name: 'Caballos', href: '/empleado/caballos', icon: ClipboardList },
    { name: 'Eventos', href: '/empleado/eventos', icon: Calendar },
    { name: 'Mis Tareas', href: '/empleado/tareas', icon: FileText },
    { name: 'Configuración', href: '/empleado/configuracion', icon: Settings },
  ],
  propietario: [
    { name: 'Dashboard', href: '/propietario', icon: Home },
    { name: 'Notificaciones', href: '/propietario/notificaciones', icon: Bell },
    { name: 'Establecimientos', href: '/propietario/establecimientos', icon: Building2 },
    { name: 'Mis Caballos', href: '/propietario/caballos', icon: ClipboardList },
    { name: 'Salud', href: '/propietario/salud', icon: Stethoscope },
    { name: 'Competencias', href: '/propietario/competencias', icon: Trophy },
    { name: 'Entrenamiento', href: '/propietario/entrenamiento', icon: Activity },
    { name: 'Eventos', href: '/propietario/eventos', icon: Calendar },
    { name: 'Reportes', href: '/propietario/reportes', icon: BarChart3 },
    { name: 'Tareas', href: '/propietario/tareas', icon: FileText },
    { name: 'Configuración', href: '/propietario/configuracion', icon: Settings },
  { name: 'Suscripciones', href: '/propietario/suscripciones', icon: CreditCard },
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
        isCollapsed ? 'lg:w-20' : 'lg:w-72'
      }`}>
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          <div className="flex items-center justify-center h-16 sm:h-18 lg:h-20 px-4">
            <div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = ROLE_MENUS[userRole as keyof typeof ROLE_MENUS] || [];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:fixed transition-all duration-300 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-72'
      } lg:left-0 lg:top-0 lg:bottom-0 z-30`}>
        <div className="flex flex-col h-full bg-[#0f172a] border-r border-white/10 shadow-lg"
             style={{
               boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)'
             }}>
          {/* Logo/Header */}
          <div className="relative h-16 sm:h-18 lg:h-20 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-center h-full px-4">
              {!isCollapsed ? (
                <div className="flex items-center gap-3">
                  <Image 
                    src={LOGOS.ICON_WHITE}
                    alt="HandicApp Icon" 
                    width={48} 
                    height={48}
                    className="object-contain flex-shrink-0"
                  />
                  <Image 
                    src={LOGOS.TEXT_BROWN}
                    alt="HandicApp" 
                    width={140} 
                    height={28}
                    className="object-contain flex-shrink-0 brightness-0 invert"
                  />
                </div>
              ) : (
                <Image 
                  src={LOGOS.ICON_WHITE}
                  alt="HandicApp" 
                  width={44} 
                  height={44}
                  className="object-contain"
                />
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className={`flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 ${
            isCollapsed ? 'overflow-x-hidden' : ''
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
          }}>
            {/* Label MENU */}
            {!isCollapsed && (
              <div className="px-3 py-2 mb-2">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Menú
                </span>
              </div>
            )}
            
            {menuItems.map((item) => {
              const Icon = item.icon;
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
                      flex items-center py-2.5 rounded-lg transition-smooth
                      ${isCollapsed ? 'px-2 justify-center' : 'px-3 gap-3'}
                      ${isActive
                        ? 'bg-[#af936f] text-white shadow-md shadow-[#af936f]/20'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                    {!isCollapsed && (
                      <span className="truncate font-medium text-[15px]">{item.name}</span>
                    )}
                  </Link>
                  {/* Tooltip para modo colapsado */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-[#1e293b] text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-smooth z-50 whitespace-nowrap border border-white/10 shadow-lg">
                      {item.name}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-[#1e293b]"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] border-r border-white/10 shadow-2xl transform transition-smooth lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Header */}
        <div className="relative h-16 sm:h-18 lg:h-20 border-b border-white/10">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-3">
              <Image 
                src={LOGOS.ICON_WHITE}
                alt="HandicApp Icon" 
                width={48} 
                height={48}
                className="object-contain flex-shrink-0"
              />
              <Image 
                src={LOGOS.TEXT_BROWN}
                alt="HandicApp" 
                width={140} 
                height={28}
                className="object-contain flex-shrink-0 brightness-0 invert"
              />
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-smooth touch-manipulation flex-shrink-0"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 pt-6 pb-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
        }}>
          {/* Label MENU */}
          <div className="px-3 py-2 mb-2">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Menú
            </span>
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
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
                  flex items-center px-3 py-2.5 gap-3 rounded-lg transition-smooth touch-manipulation
                  ${isActive
                    ? 'bg-[#af936f] text-white shadow-md shadow-[#af936f]/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                <span className="truncate font-medium text-[15px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Footer */}
        <div className="flex-shrink-0 p-4 border-t border-white/10">
          <div className="text-xs text-center text-muted-foreground">
            © 2025 HandicApp
          </div>
        </div>
      </div>
    </>
  );
}