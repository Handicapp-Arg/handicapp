'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import {
  Home,
  Users,
  Settings,
  FileText,
  Building2,
  ClipboardList,
  Calendar,
  X,
  Bell,
} from 'lucide-react';

const ROLE_MENUS = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Establecimientos', href: '/admin/stables', icon: Building2 },
    { name: 'Caballos', href: '/admin/horses', icon: ClipboardList },
    { name: 'Eventos', href: '/admin/events', icon: Calendar },
    { name: 'Tareas', href: '/admin/tasks', icon: FileText },
    { name: 'Notificaciones', href: '/admin/notifications', icon: Bell },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ],
  establecimiento: [
    { name: 'Dashboard', href: '/establecimiento', icon: Home },
    { name: 'Caballos', href: '/establecimiento/horses', icon: ClipboardList },
    { name: 'Tareas', href: '/establecimiento/tasks', icon: FileText },
    { name: 'Eventos', href: '/establecimiento/events', icon: Calendar },
    { name: 'Notificaciones', href: '/establecimiento/notifications', icon: Bell },
    { name: 'Configuración', href: '/establecimiento/settings', icon: Settings },
  ],
  propietario: [
    { name: 'Dashboard', href: '/propietario', icon: Home },
    { name: 'Mis Caballos', href: '/propietario/horses', icon: ClipboardList },
    { name: 'Establecimientos', href: '/propietario/stables', icon: Building2 },
    { name: 'Eventos', href: '/propietario/events', icon: Calendar },
    { name: 'Tareas', href: '/propietario/tasks', icon: FileText },
    { name: 'Notificaciones', href: '/propietario/notifications', icon: Bell },
    { name: 'Configuración', href: '/propietario/settings', icon: Settings },
  ],
};

interface VerticalNavbarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

function NavItems({ items, onClose }: { items: typeof ROLE_MENUS.admin; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== '/admin' &&
            item.href !== '/establecimiento' &&
            item.href !== '/propietario' &&
            pathname.startsWith(item.href + '/'));

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
            }`}
          >
            <Icon
              className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`}
            />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </>
  );
}

export function VerticalNavbar({ isOpen, isCollapsed, onClose }: VerticalNavbarProps) {
  const { user, isLoading } = useAuthNew();
  const userRole = user?.rol?.clave ?? null;

  if (isLoading || !userRole) {
    return (
      <div className={`hidden lg:flex lg:flex-col ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col flex-grow bg-zinc-900">
          <div className="h-16 border-b border-white/10" />
        </div>
      </div>
    );
  }

  const menuItems = ROLE_MENUS[userRole as keyof typeof ROLE_MENUS] || [];

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    establecimiento: 'Establecimiento',
    propietario: 'Propietario',
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 z-30 ${
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        }`}
      >
        <div className="flex flex-col h-full bg-zinc-900">
          {/* Brand */}
          <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0">
            {isCollapsed ? (
              <span className="text-sm font-bold text-white mx-auto">H</span>
            ) : (
              <div>
                <span className="text-base font-semibold text-white tracking-tight">HandicApp</span>
                <p className="text-[10px] text-zinc-500 mt-0.5">{roleLabel[userRole] ?? ''}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {isCollapsed ? (
              menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={item.name}
                    className="flex justify-center p-2.5 rounded-md text-zinc-500 hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })
            ) : (
              <NavItems items={menuItems} />
            )}
          </nav>

          {/* User pill */}
          {!isCollapsed && user && (
            <div className="px-3 py-3 border-t border-white/10">
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md">
                <div className="h-7 w-7 rounded-md bg-zinc-700 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                  {user.nombre?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div>
            <span className="text-base font-semibold text-white tracking-tight">HandicApp</span>
            <p className="text-[10px] text-zinc-500">{roleLabel[userRole] ?? ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-zinc-400 hover:bg-white/10 hover:text-white touch-manipulation"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-2 py-3 space-y-0.5 overflow-y-auto h-[calc(100%-4rem)]">
          <NavItems items={menuItems} onClose={onClose} />
        </nav>
      </div>
    </>
  );
}
