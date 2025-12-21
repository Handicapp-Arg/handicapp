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
  Check,
  Search,
  Loader2
} from 'lucide-react';
import { useAuthNew } from '../../lib/hooks/useAuthNew';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNotificationContext } from '@/components/providers/NotificationProvider';
import { useCaballos } from '@/lib/hooks/useCaballosQuery';
import { Caballo } from '@/lib/services/caballoService';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch caballos para búsqueda
  const { data: caballosData, isLoading: searchLoading } = useCaballos({ limit: 100 });
  
  // Normalizar datos de caballos
  type CaballosResponse = { data?: { caballos?: Caballo[] } } | { caballos?: Caballo[] } | { data?: Caballo[] } | Caballo[];
  const caballosResponse = caballosData as CaballosResponse;
  
  const caballosList: Caballo[] = Array.isArray((caballosResponse as { data?: { caballos?: Caballo[] } })?.data?.caballos) 
    ? (caballosResponse as { data: { caballos: Caballo[] } }).data.caballos 
    : Array.isArray((caballosResponse as { caballos?: Caballo[] })?.caballos) 
      ? (caballosResponse as { caballos: Caballo[] }).caballos 
      : Array.isArray((caballosResponse as { data?: Caballo[] })?.data) 
        ? (caballosResponse as { data: Caballo[] }).data 
        : Array.isArray(caballosResponse) 
          ? caballosResponse 
          : [];

  // Filtrar caballos según búsqueda
  const filteredCaballos = searchQuery.trim() 
    ? caballosList.filter(c => 
        c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.microchip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.raza?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5) // Máximo 5 resultados
    : [];

  // Cerrar dropdown de búsqueda al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegar al caballo seleccionado
  const handleSelectCaballo = (caballoId: number) => {
    setSearchQuery('');
    setShowSearchResults(false);
    const roleKey = user?.rol?.clave;
    router.push(`/${roleKey}/caballos/${caballoId}`);
  };

  // Cerrar notificaciones al hacer scroll en móvil
  useEffect(() => {
    if (!isNotifDropdownOpen) return;
    const handleScroll = () => {
      setIsNotifDropdownOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isNotifDropdownOpen]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  // Usar el contexto de notificaciones con WebSocket
  const { contador, notificaciones, stats, marcarComoLeida, marcarTodasComoLeidas } = useNotificationContext();

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
    } catch {
      // Forzar redirección incluso si hay error
      router.push('/login');
    }
  };

  const getNotificacionesPath = () => {
    const roleKey = user?.rol?.clave;
    const rolesDisponibles = new Set([
      'propietario',
      'veterinario',
      'establecimiento',
      'empleado',
      'capataz',
    ]);

    if (!roleKey || !rolesDisponibles.has(roleKey)) {
      return '/propietario/notificaciones';
    }

    return `/${roleKey}/notificaciones`;
  };

  const notificacionesPath = getNotificacionesPath();

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
        path = '/admin/configuracion';
        break;
      case 'establecimiento':
        path = '/establecimiento/configuracion';
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
    <header 
      className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-200/50"
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)'
      }}
    >
      <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20 px-4 sm:px-6 lg:px-8">
        {/* Left Side - Menu Button, Collapse Button & Search */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200 flex-shrink-0"
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200 group flex-shrink-0"
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {isCollapsed ? (
              <ChevronsRight className="h-5 w-5 text-slate-600 group-hover:translate-x-0.5 transition-transform duration-300" />
            ) : (
              <ChevronsLeft className="h-5 w-5 text-slate-600 group-hover:-translate-x-0.5 transition-transform duration-300" />
            )}
          </button>

          {/* Search Bar - Oculto en móviles pequeños, visible desde sm */}
          <div className="hidden sm:flex min-w-0 flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Buscar caballos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.trim().length > 0);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSearchResults(true);
                }}
                className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e445d] focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
              />

              {/* Dropdown con resultados */}
              {showSearchResults && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto"
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  {searchLoading ? (
                    <div className="px-4 py-8 text-center">
                      <Loader2 className="h-6 w-6 text-slate-400 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Buscando...</p>
                    </div>
                  ) : filteredCaballos.length > 0 ? (
                    <>
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Caballos ({filteredCaballos.length})
                        </p>
                      </div>
                      {filteredCaballos.map((caballo) => (
                        <button
                          key={caballo.id}
                          onClick={() => handleSelectCaballo(caballo.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f172a] to-[#0e445d] flex items-center justify-center flex-shrink-0">
                            <Trophy className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {caballo.nombre}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {caballo.raza || 'Raza no especificada'}
                              {caballo.microchip && ` • ${caballo.microchip}`}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Trophy className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-600">No se encontraron caballos</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Intenta con otro nombre o microchip
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Notifications & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Notifications Icon - Estilo TailAdmin */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors duration-200 flex-shrink-0"
              title={contador > 0 ? `${contador} notificación${contador !== 1 ? 'es' : ''} sin leer` : 'Sin notificaciones'}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              {contador > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#af936f] text-[9px] sm:text-[10px] font-semibold text-white ring-1 sm:ring-2 ring-white">
                  {contador > 9 ? '9+' : contador}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotifDropdownOpen && (
              <div 
                className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto mt-3 sm:w-96 bg-white rounded-2xl border border-slate-200/50 z-50 overflow-hidden flex flex-col max-h-[85vh]"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Header */}
                <div 
                  className="px-3 sm:px-4 py-3 border-b border-slate-100 flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.03) 0%, rgba(14, 68, 93, 0.03) 100%)'
                  }}
                >
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

                {/* Notificaciones List - Con scroll */}
                <div className="overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {notificaciones && notificaciones.length > 0 ? (
                    <>
                      {/* Mostrar todas las notificaciones ordenadas: primero no leídas, luego leídas */}
                      {[...notificaciones]
                        .sort((a, b) => {
                          // Primero las no leídas
                          if (!a.leida && b.leida) return -1;
                          if (a.leida && !b.leida) return 1;
                          // Luego por fecha más reciente
                          return new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime();
                        })
                        .map((notif) => {
                        const Icono = getIconoTipo(notif.tipo);
                        return (
                          <div
                            key={notif.id}
                            onClick={async () => {
                              setIsNotifDropdownOpen(false);
                              if (!notif.leida) {
                                await marcarComoLeida(notif.id);
                              }
                              router.push(`${notificacionesPath}?highlight=${notif.id}`);
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
                  <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <button
                      onClick={() => {
                        setIsNotifDropdownOpen(false);
                        router.push(notificacionesPath);
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

          {/* User Dropdown - Estilo TailAdmin */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 hover:bg-slate-50 rounded-full py-0.5 sm:py-1 pl-0.5 sm:pl-1 pr-2 sm:pr-3 transition-colors duration-200"
            >
              <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-1 sm:ring-2 ring-white shadow-sm flex-shrink-0">
                <AvatarFallback 
                  className="text-white text-xs sm:text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #0e445d 100%)'
                  }}
                >
                  {user?.rol?.clave === 'establecimiento' && user?.establecimiento_nombre
                    ? user.establecimiento_nombre.substring(0, 2).toUpperCase()
                    : `${user?.nombre?.[0] || ''}${user?.apellido?.[0] || ''}`
                  }
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate max-w-32">
                  {isLoading ? 'Cargando...' : (
                    user?.rol?.clave === 'establecimiento' && user?.establecimiento_nombre
                      ? user.establecimiento_nombre
                      : (user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : user?.rol?.nombre || 'Usuario')
                  )}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-32">
                  {isLoading ? '' : user?.rol?.nombre || 'Rol no definido'}
                </p>
              </div>
              <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 text-slate-400 transition-transform duration-200 hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-200/50 py-2 z-50 overflow-hidden"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* User Info */}
                <div 
                  className="px-4 py-3 border-b border-slate-100"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.03) 0%, rgba(14, 68, 93, 0.03) 100%)'
                  }}
                >
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.rol?.clave === 'establecimiento' && user?.establecimiento_nombre
                      ? user.establecimiento_nombre
                      : (user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Usuario')
                    }
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
                    className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:text-[#0f172a] hover:bg-slate-50 transition-all duration-300 touch-manipulation group"
                  >
                    <UserCircle className="h-5 w-5 mr-3 flex-shrink-0 text-slate-400 group-hover:text-[#0e445d] transition-colors duration-300" />
                    <span className="group-hover:text-slate-900 transition-colors duration-300">Mi Perfil</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 touch-manipulation group"
                  >
                    <LogOut className="h-5 w-5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}