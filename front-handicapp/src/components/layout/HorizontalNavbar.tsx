'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu,
  Bell,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  CheckCheck,
  Calendar,
  Trophy,
  Circle,
  ArrowRight,
  Check
} from 'lucide-react';
import { useAuthNew } from '../../lib/hooks/useAuthNew';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useNotificationContext } from '@/components/providers/NotificationProvider';

interface HorizontalNavbarProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export function HorizontalNavbar({ onMenuClick, onToggleCollapse, isCollapsed }: HorizontalNavbarProps) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthNew();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  // Usar el contexto de notificaciones con WebSocket
  const { contador, isConnected, notificaciones, stats, marcarComoLeida, marcarTodasComoLeidas } = useNotificationContext();

  // Cerrar dropdowns al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {      // Forzar redirección incluso si hay error
      router.push('/login');
    }
  };

  const getIconoTipo = (tipo: string) => {
    const iconos: Record<string, React.ElementType> = {
      evento: Calendar,
      tarea: CheckCheck,
      caballo: Trophy,
      sistema: Settings,
      recordatorio: Bell,
    };
    return iconos[tipo] || Bell;
  };

  const getColorTipo = (tipo: string) => {
    const colores: Record<string, string> = {
      evento: 'text-blue-600',
      tarea: 'text-green-600',
      caballo: 'text-amber-600',
      sistema: 'text-slate-600',
      recordatorio: 'text-purple-600',
    };
    return colores[tipo] || 'text-slate-600';
  };

  const getBgColorTipo = (tipo: string) => {
    const colores: Record<string, string> = {
      evento: 'bg-blue-50',
      tarea: 'bg-green-50',
      caballo: 'bg-amber-50',
      sistema: 'bg-slate-50',
      recordatorio: 'bg-purple-50',
    };
    return colores[tipo] || 'bg-slate-50';
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const goToProfile = () => {
    const roleKey = user?.rol?.clave;
    let path = '/profile';
    switch (roleKey) {
      case 'admin':
        path = '/admin/profile';
        break;
      case 'establecimiento':
        path = '/establecimiento/perfil';
        break;
      case 'capataz':
        path = '/capataz/perfil';
        break;
      case 'veterinario':
        path = '/veterinario/perfil';
        break;
      case 'empleado':
        path = '/empleado/perfil';
        break;
      case 'propietario':
        // Propietario va a Configuración (que incluye perfil en tabs)
        path = '/propietario/configuracion';
        break;
      default:
        path = '/profile';
    }
    router.push(path);
  };

  return (
    <header className="bg-white sticky top-0 z-30 transition-all shadow-sm rounded-tl-2xl">
      <div className="flex items-center justify-between h-20 px-6 lg:px-8">
        {/* Left Side - Menu Button, Collapse Button & Breadcrumb */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Mobile Menu Button - Más grande */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 touch-manipulation flex-shrink-0"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Collapse Button - Más grande */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center p-2.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 group flex-shrink-0"
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {isCollapsed ? (
              <ChevronsRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <ChevronsLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            )}
          </button>

          {/* Breadcrumb - Solo Desktop */}
          <Breadcrumb />
        </div>

        {/* Right Side - Notifications & User Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 touch-manipulation"
              title={isConnected ? 'Notificaciones (En tiempo real)' : 'Notificaciones (Desconectado)'}
            >
              <Bell className="h-5 w-5" />
              {contador > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white animate-pulse">
                  {contador > 99 ? '99+' : contador}
                </span>
              )}
              {/* Indicador de conexión WebSocket - solo si NO hay notificaciones */}
              {contador === 0 && !isConnected && (
                <span className="absolute bottom-1 right-1 h-2 w-2 bg-gray-400 rounded-full ring-2 ring-white" title="WebSocket desconectado"></span>
              )}
              {contador === 0 && isConnected && (
                <span className="absolute bottom-1 right-1 h-2 w-2 bg-green-500 rounded-full ring-2 ring-white animate-pulse" title="WebSocket conectado"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotifDropdownOpen && (
              <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto mt-3 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                {/* Header */}
                <div className="px-3 sm:px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <h3 className="font-bold text-sm sm:text-base text-slate-800 truncate">Notificaciones</h3>
                    </div>
                    {stats?.no_leidas > 0 && (
                      <button
                        onClick={async () => {
                          await marcarTodasComoLeidas();
                        }}
                        className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 flex-shrink-0"
                      >
                        <Check className="w-3 h-3" />
                        <span className="hidden xs:inline">Marcar todas</span>
                        <span className="xs:hidden">Todas</span>
                      </button>
                    )}
                  </div>
                  {stats && (
                    <p className="text-xs text-slate-600 mt-1">
                      {stats.no_leidas > 0 ? `${stats.no_leidas} sin leer` : 'Sin notificaciones pendientes'}
                    </p>
                  )}
                </div>

                {/* Notificaciones List */}
                <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto">
                  {notificaciones && notificaciones.length > 0 ? (
                    <>
                      {notificaciones.slice(0, 5).map((notif) => {
                        const Icono = getIconoTipo(notif.tipo);
                        return (
                          <div
                            key={notif.id}
                            onClick={async () => {
                              if (!notif.leida) {
                                await marcarComoLeida(notif.id);
                              }
                            }}
                            className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors ${
                              !notif.leida ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex gap-2 sm:gap-3">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${getBgColorTipo(notif.tipo)} flex items-center justify-center flex-shrink-0`}>
                                <Icono className={`w-4 h-4 sm:w-5 sm:h-5 ${getColorTipo(notif.tipo)}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs sm:text-sm ${!notif.leida ? 'font-semibold text-slate-900' : 'text-slate-700'} line-clamp-2 leading-relaxed`}>
                                    {notif.mensaje}
                                  </p>
                                  {!notif.leida && (
                                    <Circle className="w-2 h-2 text-primary fill-primary flex-shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                                  {formatFecha(notif.creado_el)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="py-8 sm:py-12 text-center px-4">
                      <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600">No hay notificaciones</p>
                      <p className="text-xs text-slate-500 mt-1">Cuando recibas notificaciones aparecerán aquí</p>
                    </div>
                  )}
                </div>

                {/* Footer - Ver todas */}
                {notificaciones && notificaciones.length > 0 && (
                  <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => {
                        setIsNotifDropdownOpen(false);
                        const roleKey = user?.rol?.clave || 'propietario';
                        router.push(`/${roleKey}/notificaciones`);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 active:text-primary/60 transition-colors py-1"
                    >
                      Ver todas las notificaciones
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 rounded-xl p-2 pr-3 hover:bg-slate-100 transition-all duration-200 touch-manipulation"
            >
              <Avatar className="h-9 w-9 ring-2 ring-slate-200">
                <AvatarFallback className="bg-[#1e293b] text-white text-sm font-medium">
                  {user?.nombre?.[0]}{user?.apellido?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden lg:block min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate max-w-32">
                  {isLoading ? 'Cargando...' : user?.rol?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-32">
                  {isLoading ? '' : (user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : '')}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 hidden lg:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {user?.rol?.nombre || 'Rol no definido'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      goToProfile();
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors touch-manipulation"
                  >
                    <UserCircle className="h-5 w-5 mr-3 flex-shrink-0 text-slate-400" />
                    <span>Mi Perfil</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors touch-manipulation"
                  >
                    <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar dropdown - COMENTADO porque bloquea todos los clicks en la página */}
      {/* {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )} */}
    </header>
  );
}