'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { LOGOS } from '@/lib/constants/logos';
import {
  Home,
  Users,
  Settings,
  FileText,
  Building2,
  ClipboardList,
  Stethoscope,
  Calendar,
  X,
  Bell,
  History,
  ShieldCheck,
  Pill,
  BarChart2,
} from 'lucide-react';

// Definir los menús por rol con estructura clara
const ROLE_MENUS = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Establecimientos', href: '/admin/establecimientos', icon: Building2 },
    { name: 'Caballos', href: '/admin/caballos', icon: ClipboardList },
    { name: 'Eventos', href: '/admin/eventos', icon: Calendar },
    { name: 'Tareas', href: '/admin/tareas', icon: FileText },
    { name: 'Notificaciones', href: '/admin/notificaciones', icon: Bell },
    { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
  ],
  establecimiento: [
    { name: 'Dashboard', href: '/establecimiento', icon: Home },
    { name: 'Caballos', href: '/establecimiento/caballos', icon: ClipboardList },
    { name: 'Personal', href: '/establecimiento/personal', icon: Users },
    { name: 'Trabajo Diario', href: '/establecimiento/tareas', icon: FileText },
    { name: 'Calendario', href: '/establecimiento/eventos', icon: Calendar },
    { name: 'Reportes', href: '/establecimiento/reportes', icon: BarChart2 },
    { name: 'Notificaciones', href: '/establecimiento/notificaciones', icon: Bell },
    { name: 'Configuración', href: '/establecimiento/configuracion', icon: Settings },
  ],
  capataz: [
    { name: 'Dashboard', href: '/capataz', icon: Home },
    { name: 'Notificaciones', href: '/capataz/notificaciones', icon: Bell },
    { name: 'Caballos', href: '/capataz/caballos', icon: ClipboardList },
    { name: 'Calendario', href: '/capataz/eventos', icon: Calendar },
    { name: 'Trabajo Diario', href: '/capataz/tareas', icon: FileText },
    { name: 'Configuración', href: '/capataz/configuracion', icon: Settings },
  ],
  veterinario: [
    { name: 'Dashboard', href: '/veterinario', icon: Home },
    { name: 'Pacientes', href: '/veterinario/caballos', icon: ClipboardList },
    { name: 'Atención Médica', href: '/veterinario/consultas', icon: Stethoscope },
    { name: 'Tratamientos', href: '/veterinario/tratamientos', icon: Pill },
    { name: 'Historial Médico', href: '/veterinario/historial', icon: History },
    { name: 'Validación', href: '/veterinario/validacion', icon: ShieldCheck },
    { name: 'Calendario', href: '/veterinario/eventos', icon: Calendar },
    { name: 'Mis Tareas', href: '/veterinario/tareas', icon: FileText },
    { name: 'Notificaciones', href: '/veterinario/notificaciones', icon: Bell },
    { name: 'Configuración', href: '/veterinario/configuracion', icon: Settings },
  ],
  empleado: [
    { name: 'Dashboard', href: '/empleado', icon: Home },
    { name: 'Mis Tareas', href: '/empleado/tareas', icon: FileText },
    { name: 'Caballos', href: '/empleado/caballos', icon: ClipboardList },
    { name: 'Calendario', href: '/empleado/eventos', icon: Calendar },
    { name: 'Notificaciones', href: '/empleado/notificaciones', icon: Bell },
    { name: 'Perfil', href: '/empleado/perfil', icon: Users },
  ],
  propietario: [
    { name: 'Dashboard', href: '/propietario', icon: Home },
    { name: 'Mis Caballos', href: '/propietario/caballos', icon: ClipboardList },
    { name: 'Establecimientos', href: '/propietario/establecimientos', icon: Building2 },
    { name: 'Calendario', href: '/propietario/eventos', icon: Calendar },
    { name: 'Mis Tareas', href: '/propietario/tareas', icon: FileText },
    { name: 'Notificaciones', href: '/propietario/notificaciones', icon: Bell },
    { name: 'Configuración', href: '/propietario/configuracion', icon: Settings },
  ],
};

interface VerticalNavbarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export function VerticalNavbar({ isOpen, isCollapsed, onClose }: VerticalNavbarProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuthNew();
  const userRole = user?.rol?.clave ?? null;

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
        <div
          className="flex flex-col h-full relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.05)]"
        >
          {/* Glassmorphism overlay */}
          <div
            className="absolute inset-0 pointer-events-none backdrop-blur-[10px] bg-gradient-to-br from-cyan-950/15 to-transparent"
          />
          
          {/* Logo/Header */}
          <div className="relative h-16 sm:h-18 lg:h-20 flex-shrink-0 border-b border-white/10">
            <div className="flex items-center justify-center h-full px-4">
              {!isCollapsed ? (
                <div className="flex items-center gap-3">
                  <Image
                    src={LOGOS.ICON_WHITE}
                    alt="HandicApp Icon"
                    width={48}
                    height={48}
                    priority={true}
                    className="object-contain flex-shrink-0 drop-shadow-lg aspect-square"
                  />
                  <h1
                    className="text-white drop-shadow-lg select-none text-xl font-bold tracking-widest"
                    style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}
                  >
                    Handicapp
                  </h1>
                </div>
              ) : (
                <Image
                  src={LOGOS.ICON_WHITE}
                  alt="HandicApp"
                  width={44}
                  height={44}
                  priority={true}
                  className="object-contain drop-shadow-lg aspect-square"
                />
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className={`flex-1 px-3 py-6 space-y-1.5 overflow-y-auto relative ${
            isCollapsed ? 'overflow-x-hidden' : ''
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
          }}>
            {/* Custom scrollbar styles */}
            <style jsx>{`
              nav::-webkit-scrollbar {
                width: 6px;
              }
              nav::-webkit-scrollbar-track {
                background: transparent;
              }
              nav::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
              }
              nav::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            `}</style>
            
            {/* Label MENU */}
            {!isCollapsed && (
              <div className="px-3 py-2 mb-3">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
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
                      flex items-center py-3 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/10' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }
                      ${isCollapsed ? 'justify-center px-0' : 'px-4'}
                    `}
                    title={isCollapsed ? item.name : ''}
                  >
                    {/* Active Glow Effect */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-900/40 to-accent/10 blur-sm -z-10"></div>
                    )}

                    <Icon
                      size={20}
                      className={`
                        flex-shrink-0 transition-transform duration-300 group-hover:scale-110
                        ${isActive ? 'text-accent' : 'text-slate-400 group-hover:text-white'}
                        ${isCollapsed ? '' : 'mr-3'}
                      `}
                    />

                    {!isCollapsed && (
                      <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-semibold text-white' : ''}`}>
                        {item.name}
                      </span>
                    )}

                    {/* Hover arrow */}
                    {!isCollapsed && !isActive && (
                      <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_theme(colors.amber.400/80%)]"></div>
                      </div>
                    )}
                  </Link>

                  {/* Tooltip para modo colapsado */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-white/10">
                      {item.name}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-slate-800"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 shadow-2xl transform transition-all duration-300 lg:hidden
          bg-gradient-to-b from-slate-950 to-slate-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        
        {/* Mobile Header */}
        <div className="relative h-16 sm:h-18 lg:h-20 border-b border-white/10">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-3">
              <Image
                src={LOGOS.ICON_WHITE}
                alt="HandicApp Icon"
                width={48}
                height={48}
                className="object-contain flex-shrink-0 drop-shadow-lg aspect-square"
              />
              <h1
                className="text-white drop-shadow-lg select-none text-xl font-bold tracking-widest"
                style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}
              >
                HANDICAPP
              </h1>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 touch-manipulation flex-shrink-0 relative z-10"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5 text-white/90" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 pt-6 pb-4 space-y-1.5 overflow-y-auto relative"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
        }}>
          {/* Custom scrollbar */}
          <style jsx>{`
            nav::-webkit-scrollbar {
              width: 6px;
            }
            nav::-webkit-scrollbar-track {
              background: transparent;
            }
            nav::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 3px;
            }
            nav::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>
          
          {/* Label MENU */}
          <div className="px-3 py-2 mb-3">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
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
                  flex items-center px-4 py-3 gap-3 rounded-xl transition-all duration-300 touch-manipulation relative
                  ${isActive
                    ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm'
                  }
                `}
              >
                {/* Active Glow Effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-900/40 to-accent/10 blur-sm -z-10"></div>
                )}

                <Icon className={`flex-shrink-0 transition-all duration-300 ${
                  isActive ? 'w-6 h-6 text-accent drop-shadow-md' : 'w-5 h-5 text-slate-400'
                }`} />
                <span className={`truncate font-medium transition-all duration-300 ${
                  isActive ? 'text-[15px] text-white' : 'text-[14px] text-white/80'
                }`}>
                  {item.name}
                </span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_theme(colors.amber.400/80%)]"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
