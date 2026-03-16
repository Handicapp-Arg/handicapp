'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, LogOut, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuthNew } from '../../lib/hooks/useAuthNew';
import { useNotificationContext } from '@/components/providers/NotificationProvider';

interface HorizontalNavbarProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export function HorizontalNavbar({ onMenuClick, onToggleCollapse, isCollapsed }: HorizontalNavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuthNew();
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { contador, notificaciones, marcarComoLeida, marcarTodasComoLeidas } = useNotificationContext();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    router.push('/login');
  };

  const role = user?.rol?.clave;
  const notifPath = role === 'admin'
    ? '/admin/notifications'
    : role === 'establecimiento'
    ? '/establecimiento/notifications'
    : '/propietario/notifications';

  const settingsPath = role === 'admin'
    ? '/admin/settings'
    : role === 'establecimiento'
    ? '/establecimiento/settings'
    : '/propietario/settings';

  const displayName = user?.nombre
    ? `${user.nombre} ${user.apellido || ''}`.trim()
    : user?.rol?.nombre || 'Usuario';

  const initial = displayName[0]?.toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">

      {/* Left */}
      <div className="flex items-center gap-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </button>
        <button onClick={onToggleCollapse} className="hidden lg:flex p-2 rounded-md text-gray-500 hover:bg-gray-100">
          {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">

        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            {contador > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                {contador > 9 ? '9+' : contador}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-1 w-72 max-w-[calc(100vw-1rem)] bg-white border border-gray-200 rounded-md shadow-sm z-50 flex flex-col max-h-96">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Notificaciones</span>
                {contador > 0 && (
                  <button onClick={() => marcarTodasComoLeidas()} className="text-xs text-gray-400 hover:text-gray-700">
                    Marcar leídas
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notificaciones?.length > 0 ? (
                  [...notificaciones]
                    .sort((a, b) => (!a.leida && b.leida ? -1 : a.leida && !b.leida ? 1 : 0))
                    .map((n) => (
                      <div key={n.id}
                        onClick={async () => { setNotifOpen(false); if (!n.leida) await marcarComoLeida(n.id); router.push(`${notifPath}?highlight=${n.id}`); }}
                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!n.leida ? 'bg-gray-50' : ''}`}>
                        <p className={`text-sm ${!n.leida ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{n.mensaje}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(n.creado_el).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="py-8 text-center text-sm text-gray-400">Sin notificaciones</p>
                )}
              </div>
              <button onClick={() => { setNotifOpen(false); router.push(notifPath); }}
                className="py-2 text-xs text-center text-gray-400 hover:text-gray-700 border-t border-gray-100">
                Ver todas
              </button>
            </div>
          )}
        </div>

        {/* Usuario */}
        <div className="relative" ref={userRef}>
          <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
            <div className="h-7 w-7 rounded-md bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {initial}
            </div>
            <span className="hidden sm:block text-sm text-gray-700 max-w-[120px] truncate">{displayName}</span>
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-md shadow-sm z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="p-1">
                <button onClick={() => { router.push(settingsPath); setUserOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md text-left">
                  <Settings className="h-4 w-4" /> Configuración
                </button>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md text-left">
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
