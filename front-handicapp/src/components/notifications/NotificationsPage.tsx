'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificacionService, type Notificacion } from '@/lib/services/notificationService';
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

// --- Types ---

type FilterId = 'todas' | 'no_leidas' | 'leidas';

type NotificationStats = {
  total: number;
  noLeidas: number;
  leidas: number;
};

// --- Helper components ---

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
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm ${
        active
          ? 'bg-gray-900 text-white font-medium'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          alert
            ? 'bg-red-500 text-white'
            : active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
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
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map(notif => (
          <NotificationItem key={notif.id} notificacion={notif} onMarkAsRead={onMarkAsRead} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}

function NotificationItem({
  notificacion,
  onMarkAsRead,
  onDelete
}: {
  notificacion: Notificacion;
  onMarkAsRead: (id: number, e?: React.MouseEvent) => void;
  onDelete: (id: number, e?: React.MouseEvent) => void;
}) {
  const isUnread = !notificacion.leida;

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const StatusIcon = getIcon(notificacion.tipo);

  return (
    <div
      onClick={(e) => isUnread && onMarkAsRead(notificacion.id, e)}
      className={`group relative bg-white rounded-md border cursor-pointer overflow-hidden ${
        isUnread
          ? 'border-gray-300'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Indicador de no leído */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-900" />
      )}

      <div className="flex gap-3 p-4 pl-5">
        {/* Icono */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
          isUnread
            ? notificacion.tipo === 'tarea' ? 'bg-amber-50 text-amber-600'
              : notificacion.tipo === 'sistema' ? 'bg-red-50 text-red-600'
              : notificacion.tipo === 'evento' ? 'bg-green-50 text-green-600'
              : 'bg-gray-100 text-gray-500'
            : 'bg-gray-50 text-gray-300'
        }`}>
          <StatusIcon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <h4 className={`text-sm leading-tight mb-0.5 ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-500'}`}>
                {notificacion.titulo}
              </h4>
              <p className={`text-sm leading-relaxed ${isUnread ? 'text-gray-600' : 'text-gray-400'}`}>
                {notificacion.mensaje}
              </p>
            </div>

            {/* Acciones */}
            <div
              className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              {isUnread && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMarkAsRead(notificacion.id, e);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                  title="Marcar leído"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(notificacion.id, e);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              {notificacion.tipo || 'General'}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-[11px] text-gray-400">
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
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-md border border-dashed border-gray-200 text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
        <Inbox className="w-6 h-6 text-gray-300" />
      </div>
      <h3 className="text-gray-900 font-semibold text-sm">Estás al día</h3>
      <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
        No hay notificaciones para mostrar en esta sección.
      </p>
    </div>
  );
}

// --- Main Page Component ---

export function NotificacionesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterId>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'reciente' | 'antigua'>('reciente');
  const ITEMS_PER_PAGE = 15;

  // Data Fetching
  const { data: notificaciones = [], isLoading } = useQuery<Notificacion[]>({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      try {
        return await notificacionService.obtenerNotificaciones();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  // Actions
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    queryClient.invalidateQueries({ queryKey: ['notificaciones', 'contador'] });
  };

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

  // Derived State
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

    return result.sort((a, b) => {
      const dateA = new Date(a.creado_el).getTime();
      const dateB = new Date(b.creado_el).getTime();
      return sortBy === 'reciente' ? dateB - dateA : dateA - dateB;
    });
  }, [notificaciones, filter, searchQuery, sortBy]);

  // Grouping by Date
  const groupByDate = (items: Notificacion[]) => {
    const groups = { hoy: [] as Notificacion[], ayer: [] as Notificacion[], antiguas: [] as Notificacion[] };
    items.forEach(notif => {
      const date = new Date(notif.creado_el);
      if (isToday(date)) groups.hoy.push(notif);
      else if (isYesterday(date)) groups.ayer.push(notif);
      else groups.antiguas.push(notif);
    });
    return groups;
  };

  // Paginación
  const totalNotifications = filteredNotificaciones.length;
  const totalPages = Math.ceil(totalNotifications / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedNotifications = filteredNotificaciones.slice(startIndex, endIndex);
  const paginatedGrouped = groupByDate(paginatedNotifications);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const hasNotifications = filteredNotificaciones.length > 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Centro de Notificaciones</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p className="text-sm text-gray-500">Gestiona las novedades y alertas de tus caballos.</p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 placeholder:text-gray-400 h-10"
              />
            </div>

            <Select value={sortBy} onValueChange={(val: 'reciente' | 'antigua') => setSortBy(val)}>
              <SelectTrigger className="w-full sm:w-40 h-10 rounded-md border border-gray-200 bg-white text-gray-700 px-3">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-md border-gray-200 bg-white">
                <SelectItem value="reciente" className="cursor-pointer">Más recientes</SelectItem>
                <SelectItem value="antigua" className="cursor-pointer">Más antiguas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Mobile filters */}
        <div className="lg:hidden col-span-1 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'todas', label: 'Todas', count: stats.total },
              { id: 'no_leidas', label: 'No leídas', count: stats.noLeidas, alert: stats.noLeidas > 0 },
              { id: 'leidas', label: 'Archivadas', count: stats.leidas }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as FilterId)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border flex-shrink-0 ${
                  filter === item.id
                    ? item.alert
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {item.label}
                {item.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    filter === item.id
                      ? item.alert ? 'bg-white text-red-600' : 'bg-white/20 text-white'
                      : item.alert ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filter === 'todas' ? 'Mostrando todas' : filter === 'no_leidas' ? 'Solo no leídas' : 'Solo archivadas'}
            </p>
            <button
              onClick={handleMarkAllAsRead}
              disabled={stats.noLeidas === 0}
              className="text-xs font-medium text-gray-700 flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Marcar todo leído
            </button>
          </div>
        </div>

        {/* Sidebar (desktop) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-4 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 px-1">Bandeja</h2>

          {isLoading ? (
            <div className="bg-white rounded-md border border-gray-200 p-2 space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-md animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-md border border-gray-200 p-2">
              <nav className="space-y-0.5">
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

          {isLoading ? (
            <div className="bg-white rounded-md border border-gray-200 p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-9 bg-gray-200 rounded-md mt-2" />
            </div>
          ) : (
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <h3 className="text-gray-900 font-semibold text-sm mb-1">Acciones Rápidas</h3>
              <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                Mantén tu bandeja limpia marcando todo como leído una vez revisado.
              </p>
              <button
                onClick={handleMarkAllAsRead}
                disabled={stats.noLeidas === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Marcar todo leído
              </button>
            </div>
          )}
        </div>

        {/* Main feed */}
        <div className="lg:col-span-9 space-y-6">

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((group) => (
                <section key={group}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-4 bg-gray-100 rounded w-12 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded-full w-6 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-md border border-gray-200 p-4 animate-pulse">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-md bg-gray-100 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-100 rounded w-full" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : !hasNotifications ? (
            <EmptyState />
          ) : (
            <>
              <div className="space-y-6">
                {paginatedGrouped.hoy.length > 0 && (
                  <NotificationGroup title="Hoy" items={paginatedGrouped.hoy} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
                )}
                {paginatedGrouped.ayer.length > 0 && (
                  <NotificationGroup title="Ayer" items={paginatedGrouped.ayer} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
                )}
                {paginatedGrouped.antiguas.length > 0 && (
                  <NotificationGroup title="Anteriormente" items={paginatedGrouped.antiguas} onMarkAsRead={handleMarkAsRead} onDelete={handleDelete} />
                )}
              </div>

              {/* Paginador */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500 order-2 sm:order-1">
                    <span className="font-medium text-gray-700">{startIndex + 1}–{Math.min(endIndex, totalNotifications)}</span>
                    <span className="text-gray-400 mx-1">de</span>
                    <span className="font-medium text-gray-700">{totalNotifications}</span>
                  </div>

                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>

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
                              className={`w-9 h-9 rounded-md text-sm font-medium ${
                                page === currentPage
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="text-gray-400 px-1">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <span className="sm:hidden text-sm font-medium text-gray-700 px-3 py-1.5 bg-gray-100 rounded-md">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Siguiente
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
