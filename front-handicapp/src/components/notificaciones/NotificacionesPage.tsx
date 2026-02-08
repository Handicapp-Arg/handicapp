'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificacionService, type Notificacion } from '@/lib/services/notificacionService';
import { 
  Bell, 
  CheckCircle, 
  Trash2, 
  Info, 
  AlertTriangle, 
  XCircle, 
  Check, 
  Search,
  Inbox,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- Types & Constants ---

type FilterId = 'todas' | 'no_leidas' | 'leidas';

type NotificationStats = {
  total: number;
  noLeidas: number;
  leidas: number;
};

// --- Main Page Component ---

export function NotificacionesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterId>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'reciente' | 'antigua'>('reciente');
  const ITEMS_PER_PAGE = 15;

  // 1. Data Fetching
  const { data: notificaciones = [], isLoading } = useQuery<Notificacion[]>({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      try {
        return await notificacionService.obtenerNotificaciones();
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  // 2. Actions
  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation(); 
    try {
      await notificacionService.marcarComoLeida(id);
      invalidateQueries();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificacionService.marcarTodasComoLeidas();
      invalidateQueries();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await notificacionService.eliminarNotificacion(id);
      invalidateQueries();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    queryClient.invalidateQueries({ queryKey: ['notificaciones', 'contador'] });
  };

  // 3. Derived State (Stats & Filtering)
  const stats = useMemo<NotificationStats>(() => ({
    total: notificaciones.length,
    noLeidas: notificaciones.filter((n) => !n.leida).length,
    leidas: notificaciones.filter((n) => n.leida).length,
  }), [notificaciones]);

  const filteredNotificaciones = useMemo(() => {
    let result = notificaciones;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) => n.titulo.toLowerCase().includes(q) || n.mensaje.toLowerCase().includes(q)
      );
    }

    if (filter === 'no_leidas') result = result.filter(n => !n.leida);
    if (filter === 'leidas') result = result.filter(n => n.leida);

    // Ordenar
    return result.sort((a, b) => {
      const dateA = new Date(a.creado_el).getTime();
      const dateB = new Date(b.creado_el).getTime();
      return sortBy === 'reciente' ? dateB - dateA : dateA - dateB;
    });
  }, [notificaciones, filter, searchQuery, sortBy]);

  // 4. Grouping by Date (Modern Feed Style)
  const groupedNotifications = useMemo(() => {
      const groups = {
          hoy: [] as Notificacion[],
          ayer: [] as Notificacion[],
          antiguas: [] as Notificacion[]
      };

      filteredNotificaciones.forEach(notif => {
          const date = new Date(notif.creado_el);
          if (isToday(date)) {
              groups.hoy.push(notif);
          } else if (isYesterday(date)) {
              groups.ayer.push(notif);
          } else {
              groups.antiguas.push(notif);
          }
      });

      return groups;
  }, [filteredNotificaciones]);

  // 5. Paginación
  const totalNotifications = filteredNotificaciones.length;
  const totalPages = Math.ceil(totalNotifications / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedNotifications = filteredNotificaciones.slice(startIndex, endIndex);

  // Agrupar notificaciones paginadas
  const paginatedGroupedNotifications = useMemo(() => {
      const groups = {
          hoy: [] as Notificacion[],
          ayer: [] as Notificacion[],
          antiguas: [] as Notificacion[]
      };

      paginatedNotifications.forEach(notif => {
          const date = new Date(notif.creado_el);
          if (isToday(date)) {
              groups.hoy.push(notif);
          } else if (isYesterday(date)) {
              groups.ayer.push(notif);
          } else {
              groups.antiguas.push(notif);
          }
      });

      return groups;
  }, [paginatedNotifications]);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const hasNotifications = filteredNotificaciones.length > 0;

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in space-y-8">
      
      {/* Header / Toolbar */}
      <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
                <h1 className="text-[24px] font-semibold text-[#1e293b] tracking-tight">Centro de Notificaciones</h1>
          </div>
          
          {/* Barra de búsqueda y filtros alineados con el Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-end">
                {/* Descripción alineada con el sidebar (col-span-3) */}
                <div className="lg:col-span-3">
                    <p className="text-slate-500 text-sm">Gestiona las novedades y alertas de tus caballos.</p>
                </div>
                
                {/* Herramientas alineadas con el contenido (col-span-9) */}
                <div className="lg:col-span-9 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    {/* Buscador más largo (alineado con "Ayer") */}
                    <div className="relative w-full sm:w-[500px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                          type="text" 
                          placeholder="Buscar notificaciones..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-sm placeholder:text-slate-400 h-[40px]"
                      />
                    </div>

                    {/* Ordenar simple a la derecha */}
                    <div>
                      <Select value={sortBy} onValueChange={(val: 'reciente' | 'antigua') => setSortBy(val)}>
                        <SelectTrigger className="w-full sm:w-[160px] h-[40px] rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm focus:ring-slate-900/10 px-3">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-xl border-slate-200 shadow-md bg-white">
                          <SelectItem value="reciente" className="cursor-pointer">Más recientes</SelectItem>
                          <SelectItem value="antigua" className="cursor-pointer">Más antiguas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </div>
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* MOBILE FILTERS (visible only on small screens) */}
        <div className="lg:hidden col-span-1 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                {[
                    { id: 'todas', label: 'Todas', count: stats.total },
                    { id: 'no_leidas', label: 'No leídas', count: stats.noLeidas, alert: stats.noLeidas > 0 },
                    { id: 'leidas', label: 'Archivadas', count: stats.leidas }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setFilter(item.id as FilterId)}
                        className={`
                            whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 border snap-start
                            ${filter === item.id 
                                ? item.alert 
                                    ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-200' 
                                    : 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-200'
                                : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                            }
                        `}
                    >
                        {item.label}
                        {item.count > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1
                                ${filter === item.id 
                                    ? item.alert ? 'bg-white text-red-600' : 'bg-white/20 text-white'
                                    : item.alert ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'
                                }
                            `}>
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
                 <p className="text-sm font-medium text-slate-500 order-2 sm:order-1">
                    {filter === 'todas' ? 'Mostrando todas' : filter === 'no_leidas' ? 'Solo no leídas' : 'Solo archivadas'}
                 </p>
                 <button 
                    onClick={handleMarkAllAsRead}
                    disabled={stats.noLeidas === 0}
                    className="w-full sm:w-auto text-xs font-medium text-slate-700 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 order-1 sm:order-2 active:scale-95 transform"
                 >
                    <Check className="w-3.5 h-3.5" />
                    Marcar todo leído
                </button>
            </div>
        </div>

        {/* LEFT COMPONENT - Filters (Styled like Dashboard Card) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-4 space-y-6">
            <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-[19px] font-semibold text-[#1e293b]">Bandeja</h2>
            </div>

            {isLoading ? (
              // Skeleton para sidebar de filtros
              <div className="bg-white rounded-2xl border border-slate-200/60 p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                <div className="space-y-1 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-xl"></div>
                  ))}
                </div>
              </div>
            ) : (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                <nav className="space-y-1">
                    <SidebarItem 
                        active={filter === 'todas'} 
                        label="Todas" 
                        count={stats.total} 
                        icon={Inbox}
                        onClick={() => setFilter('todas')}
                    />
                    <SidebarItem 
                        active={filter === 'no_leidas'} 
                        label="No leídas" 
                        count={stats.noLeidas} 
                        icon={Bell}
                        onClick={() => setFilter('no_leidas')}
                        alert={stats.noLeidas > 0}
                    />
                     <SidebarItem 
                        active={filter === 'leidas'} 
                        label="Archivadas" 
                        count={stats.leidas} 
                        icon={CheckCircle}
                        onClick={() => setFilter('leidas')}
                    />
                </nav>
            </div>
            )}

            {/* Quick Action Card */}
            {isLoading ? (
              // Skeleton para card de acciones
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-full"></div>
                  <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-10 bg-slate-200 rounded-xl mt-4"></div>
                </div>
              </div>
            ) : (
             <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                <h3 className="text-[#1e293b] font-semibold text-[15px] mb-1">Acciones Rápidas</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                   Mantén tu bandeja limpia marcando todo como leído una vez revisado.
                </p>
                <button 
                    onClick={handleMarkAllAsRead}
                    disabled={stats.noLeidas === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <Check className="w-4 h-4" />
                    Marcar todo leído
                </button>
            </div>
            )}
        </div>

        {/* CENTER FEED */}
        <div className="lg:col-span-9 space-y-8">
            
            {isLoading ? (
                // Skeleton para notificaciones - estilo Airbnb con cards individuales
                <div className="space-y-8">
                  {/* Grupo 1 */}
                  <section>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-5 bg-slate-100 rounded w-16 animate-pulse"></div>
                      <div className="h-5 bg-slate-100 rounded-full w-8 animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-5 pl-6 animate-pulse">
                          <div className="flex gap-4">
                            <div className="w-11 h-11 rounded-xl bg-slate-200 flex-shrink-0"></div>
                            <div className="flex-1 space-y-3">
                              <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-100 rounded w-full"></div>
                                <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                              </div>
                              <div className="flex gap-3 pt-1">
                                <div className="h-6 bg-slate-100 rounded-md w-20"></div>
                                <div className="h-3 bg-slate-100 rounded w-24 self-center"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Grupo 2 */}
                  <section>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-5 bg-slate-100 rounded w-20 animate-pulse"></div>
                      <div className="h-5 bg-slate-100 rounded-full w-8 animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-5 pl-6 animate-pulse">
                          <div className="flex gap-4">
                            <div className="w-11 h-11 rounded-xl bg-slate-200 flex-shrink-0"></div>
                            <div className="flex-1 space-y-3">
                              <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                <div className="h-3 bg-slate-100 rounded w-full"></div>
                              </div>
                              <div className="flex gap-3 pt-1">
                                <div className="h-6 bg-slate-100 rounded-md w-20"></div>
                                <div className="h-3 bg-slate-100 rounded w-24 self-center"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
            ) : !hasNotifications ? (
                <EmptyState />
            ) : (
                <>
                  <div className="space-y-8 animate-fade-in-up">
                      {paginatedGroupedNotifications.hoy.length > 0 && (
                          <NotificationGroup title="Hoy" items={paginatedGroupedNotifications.hoy} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
                      )}
                      
                      {paginatedGroupedNotifications.ayer.length > 0 && (
                          <NotificationGroup title="Ayer" items={paginatedGroupedNotifications.ayer} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
                      )}

                      {paginatedGroupedNotifications.antiguas.length > 0 && (
                          <NotificationGroup title="Anteriormente" items={paginatedGroupedNotifications.antiguas} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
                      )}
                  </div>

                  {/* Paginador Responsive */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                      
                      {/* Info de página (Mobile: Order 2, Desktop: Order 1) */}
                      <div className="text-sm text-slate-500 order-2 sm:order-1 text-center sm:text-left w-full sm:w-auto">
                        <span className="hidden sm:inline">Mostrando </span>
                        <span className="font-medium text-slate-700">{startIndex + 1}-{Math.min(endIndex, totalNotifications)}</span>
                        <span className="text-slate-400 mx-1">de</span>
                        <span className="font-medium text-slate-700">{totalNotifications}</span>
                      </div>

                      {/* Controles (Mobile: Order 1, Desktop: Order 2) */}
                      <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-sm font-medium transition-all
                            disabled:opacity-40 disabled:cursor-not-allowed
                            bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300
                            disabled:hover:bg-white disabled:hover:border-slate-200 shadow-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="ml-1">Anterior</span>
                        </button>

                        {/* Números de página (Oculto en móvil muy pequeño si hay muchas páginas) */}
                        <div className="hidden sm:flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-medium transition-all
                                    ${page === currentPage
                                      ? 'bg-slate-900 text-white shadow-md'
                                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }
                                  `}
                                >
                                  {page}
                                </button>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return <span key={page} className="text-slate-400 px-1">...</span>;
                            }
                            return null;
                          })}
                        </div>
                        
                        {/* Indicador solo móvil */}
                        <span className="sm:hidden text-sm font-medium text-slate-700 px-2 bg-slate-100/50 rounded-lg py-1 border border-slate-200/50">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-sm font-medium transition-all
                            disabled:opacity-40 disabled:cursor-not-allowed
                            bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300
                            disabled:hover:bg-white disabled:hover:border-slate-200 shadow-sm"
                        >
                          <span className="mr-1">Siguiente</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
            )}
            
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

interface SidebarItemProps {
  active: boolean;
  label: string;
  count?: number;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  alert?: boolean;
}

function SidebarItem({ active, label, count, icon: Icon, onClick, alert }: SidebarItemProps) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all
                ${active 
                    ? 'bg-slate-900 text-white font-medium shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50'
                }
            `}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{label}</span>
            </div>
            {count !== undefined && count > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${alert 
                        ? 'bg-red-500 text-white shadow-sm shadow-red-200' 
                        : active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }
                `}>
                    {count}
                </span>
            )}
        </button>
    )
}

interface NotificationGroupProps {
  title: string;
  items: Notificacion[];
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

function NotificationGroup({ title, items, onMarkAsRead, onDelete }: NotificationGroupProps) {
    return (
        <section>
            <div className="flex items-center gap-3 mb-5">
                <h3 className="text-[17px] font-semibold text-[#1e293b]">
                    {title}
                </h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {items.length}
                </span>
            </div>
            <div className="space-y-3">
                {items.map(notif => (
                    <NotificationItem key={notif.id} notificacion={notif} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />
                ))}
            </div>
        </section>
    )
}

function NotificationItem({ notificacion, onMarkAsRead, onDelete }: { notificacion: Notificacion, onMarkAsRead: (id: number, e?: React.MouseEvent) => void, onDelete: (id: number, e?: React.MouseEvent) => void }) {
    const isUnread = !notificacion.leida;
    
    // Gradientes modernos para avatares según tipo
    const getAvatarStyle = (tipo: string, isUnread: boolean) => {
        if (!isUnread) return 'bg-slate-50 text-slate-300';
        
        switch(tipo) {
            case 'success': return 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white';
            case 'warning': return 'bg-gradient-to-br from-amber-400 to-amber-500 text-white';
            case 'error': return 'bg-gradient-to-br from-rose-400 to-rose-500 text-white';
            default: return 'bg-gradient-to-br from-blue-400 to-blue-500 text-white';
        }
    }

    const getIcon = (tipo: string) => {
        switch(tipo) {
            case 'success': return CheckCircle;
            case 'warning': return AlertTriangle;
            case 'error': return XCircle;
            default: return Info;
        }
    }

    const StatusIcon = getIcon(notificacion.tipo);
    const avatarClasses = getAvatarStyle(notificacion.tipo, isUnread);

    return (
        <div 
            onClick={(e) => isUnread && onMarkAsRead(notificacion.id, e)}
            className={`group relative bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
                ${isUnread 
                    ? 'border-slate-300 shadow-sm bg-slate-50' 
                    : 'border-slate-200/60 hover:border-slate-300 hover:shadow-sm'
                }
            `}
        >
            {/* Barra de estado sutil */}
            {isUnread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1e293b]"></div>
            )}

            <div className="flex gap-4 p-5 pl-6">
                {/* Avatar con gradiente */}
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${avatarClasses}`}>
                    <StatusIcon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                            <h4 className={`text-[15px] leading-tight mb-1 ${isUnread ? 'font-semibold text-[#1e293b]' : 'font-medium text-slate-600'}`}>
                                {notificacion.titulo}
                            </h4>
                            <p className={`text-[14px] leading-relaxed ${isUnread ? 'text-slate-600' : 'text-slate-500'}`}>
                                {notificacion.mensaje}
                            </p>
                        </div>
                        
                        {/* Actions Menu - Minimalista */}
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" 
                             onClick={(e) => e.stopPropagation()}>
                            {isUnread && (
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onMarkAsRead(notificacion.id, e);
                                    }}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all z-20"
                                    title="Marcar leído"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(notificacion.id, e);
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all z-20"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Metadata con mejor diseño */}
                    <div className="flex items-center gap-2.5 mt-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                            {notificacion.tipo || 'General'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[12px] text-slate-400">
                            {formatDistanceToNow(new Date(notificacion.creado_el), { addSuffix: true, locale: es })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-[#1e293b] font-semibold text-lg">Estás al día</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                No hay notificaciones para mostrar en esta sección.
            </p>
        </div>
    )
}

