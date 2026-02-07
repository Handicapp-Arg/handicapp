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
  Calendar,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

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

    return result.sort((a, b) => new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime());
  }, [notificaciones, filter, searchQuery]);

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

  const hasNotifications = filteredNotificaciones.length > 0;

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in space-y-8">
      
      {/* Header / Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
                <h1 className="text-[24px] font-semibold text-[#1e293b] tracking-tight">Centro de Notificaciones</h1>
                <p className="text-slate-500 mt-1">Gestiona las novedades y alertas de tus caballos.</p>
          </div>
          <div className="w-full sm:w-80">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                      type="text" 
                      placeholder="Buscar en notificaciones..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e293b]/10 focus:border-slate-300 transition-all shadow-sm placeholder:text-slate-400"
                  />
                </div>
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COMPONENT - Filters (Styled like Dashboard Card) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-4 space-y-6">
            <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-[19px] font-semibold text-[#1e293b]">Bandeja</h2>
            </div>

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

            {/* Quick Action Card */}
             <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                <h3 className="text-[#1e293b] font-semibold text-[15px] mb-1">Acciones Rápidas</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                   Mantén tu bandeja limpia marcando todo como leído una vez revisado.
                </p>
                <button 
                    onClick={handleMarkAllAsRead}
                    disabled={stats.noLeidas === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#af936f] text-white text-sm font-medium hover:bg-[#9c8261] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#af936f]/20"
                >
                    <Check className="w-4 h-4" />
                    Marcar todo leído
                </button>
            </div>
        </div>

        {/* CENTER FEED */}
        <div className="lg:col-span-9 space-y-8">
            
            {isLoading ? (
                 <div className="p-12 flex justify-center">
                    <Loader />
                 </div>
            ) : !hasNotifications ? (
                <EmptyState filter={filter} />
            ) : (
                <div className="space-y-8 animate-fade-in-up">
                    {groupedNotifications.hoy.length > 0 && (
                        <NotificationGroup title="Hoy" items={groupedNotifications.hoy} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
                    )}
                    
                    {groupedNotifications.ayer.length > 0 && (
                        <NotificationGroup title="Ayer" items={groupedNotifications.ayer} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
                    )}

                    {groupedNotifications.antiguas.length > 0 && (
                        <NotificationGroup title="Anteriormente" items={groupedNotifications.antiguas} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
                    )}
                </div>
            )}
            
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

function SidebarItem({ active, label, count, icon: Icon, onClick, alert }: any) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all
                ${active 
                    ? 'bg-[#af936f] text-white font-medium shadow-md shadow-[#af936f]/20' 
                    : 'text-slate-600 hover:bg-slate-50'
                }
            `}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{label}</span>
            </div>
            {count > 0 && (
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

function NotificationGroup({ title, items, onMarkAsRead, onDelete }: { title: string, items: Notificacion[], onMarkAsRead: any, onDelete: any }) {
    return (
        <section>
            <h3 className="text-[19px] font-semibold text-[#1e293b] mb-4 sticky top-20 bg-slate-50/0 backdrop-blur-sm z-10 w-fit px-1 rounded-lg">
                {title}
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden divide-y divide-slate-100">
                {items.map(notif => (
                    <NotificationItem key={notif.id} notificacion={notif} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />
                ))}
            </div>
        </section>
    )
}

function NotificationItem({ notificacion, onMarkAsRead, onDelete }: { notificacion: Notificacion, onMarkAsRead: (id: number, e?: React.MouseEvent) => void, onDelete: (id: number, e?: React.MouseEvent) => void }) {
    const isUnread = !notificacion.leida;
    
    // Modern minimal status colors
    const getStatusColor = (tipo: string) => {
        switch(tipo) {
            case 'success': return 'text-emerald-500 bg-emerald-50';
            case 'warning': return 'text-amber-500 bg-amber-50';
            case 'error': return 'text-rose-500 bg-rose-50';
            default: return 'text-blue-500 bg-blue-50';
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
    const statusClasses = getStatusColor(notificacion.tipo);

    return (
        <div 
            onClick={(e) => isUnread && onMarkAsRead(notificacion.id, e)}
            className={`group relative p-5 transition-all cursor-pointer hover:bg-slate-50/80
                ${isUnread ? 'bg-slate-50/40' : 'bg-white'}
            `}
        >
            {/* Unread Indicator Line */}
            {isUnread && (
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#af936f] z-10"></div>
            )}

            <div className="flex gap-4">
                {/* Avatar / Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1 ${isUnread ? statusClasses : 'bg-slate-100 text-slate-400'}`}>
                    <StatusIcon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 pr-20 relative">
                        <h4 className={`text-[15px] leading-tight ${isUnread ? 'font-bold text-[#1e293b]' : 'font-medium text-slate-600'}`}>
                            {notificacion.titulo}
                        </h4>
                        
                        {/* Actions Menu (Desktop Hover + Mobile Always) */}
                        <div className="absolute right-[-10px] -top-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/80 backdrop-blur-sm sm:bg-transparent rounded-lg p-1 shadow-sm sm:shadow-none border sm:border-none border-slate-100/50" 
                             onClick={(e) => e.stopPropagation()}>
                            {isUnread && (
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onMarkAsRead(notificacion.id, e);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-[#af936f] hover:bg-[#af936f]/10 rounded-lg transition-colors z-20"
                                    title="Marcar leído"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation(); // FORCE STOP
                                    onDelete(notificacion.id, e);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors z-20"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <p className={`text-[14px] mt-1.5 leading-relaxed ${isUnread ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                        {notificacion.mensaje}
                    </p>

                    <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {notificacion.tipo || 'General'}
                        </span>
                        <span className="text-slate-300 text-[10px]">•</span>
                        <span className="text-[11px] text-slate-400">
                            {formatDistanceToNow(new Date(notificacion.creado_el), { addSuffix: true, locale: es })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ filter }: { filter: string }) {
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

