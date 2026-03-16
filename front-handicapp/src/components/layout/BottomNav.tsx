'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { useNotificationContext } from '@/components/providers/NotificationProvider';
import {
  Home,
  FileText,
  ClipboardList,
  Calendar,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BOTTOM_NAV: Record<string, { name: string; href: string; icon: React.ElementType }[]> = {
  admin: [
    { name: 'Inicio', href: '/admin', icon: Home },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Caballos', href: '/admin/horses', icon: ClipboardList },
    { name: 'Tareas', href: '/admin/tasks', icon: FileText },
  ],
  establecimiento: [
    { name: 'Inicio', href: '/establecimiento', icon: Home },
    { name: 'Caballos', href: '/establecimiento/horses', icon: ClipboardList },
    { name: 'Tareas', href: '/establecimiento/tasks', icon: FileText },
    { name: 'Eventos', href: '/establecimiento/events', icon: Calendar },
  ],
  propietario: [
    { name: 'Inicio', href: '/propietario', icon: Home },
    { name: 'Caballos', href: '/propietario/horses', icon: ClipboardList },
    { name: 'Eventos', href: '/propietario/events', icon: Calendar },
    { name: 'Tareas', href: '/propietario/tasks', icon: FileText },
  ],
};

// Roots que NO deben activar rutas hijas
const EXACT_ROOTS = ['/admin', '/establecimiento', '/propietario'];

interface BottomNavProps {
  onMoreClick: () => void;
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuthNew();
  const { contador } = useNotificationContext();
  const role = user?.rol?.clave as string | undefined;

  if (isLoading || !role) return null;

  const items = BOTTOM_NAV[role];
  if (!items || items.length === 0) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-slate-200"
      style={{
        
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex h-[60px]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (!EXACT_ROOTS.includes(item.href) && pathname.startsWith(item.href + '/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 relative touch-manipulation',
                isActive ? 'text-zinc-900' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-zinc-900" />
              )}

              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[10px] leading-none',
                  isActive ? 'font-bold' : 'font-medium'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Más — abre el sidebar con todo el menú */}
        <button
          onClick={onMoreClick}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-gray-600 touch-manipulation relative"
        >
          <div className="relative">
            <MoreHorizontal className="w-[22px] h-[22px]" strokeWidth={2} />
            {contador > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold">
                {contador > 9 ? '9+' : contador}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium leading-none">Más</span>
        </button>
      </div>
    </nav>
  );
}
