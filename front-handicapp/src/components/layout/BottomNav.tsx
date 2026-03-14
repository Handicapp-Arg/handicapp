'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import {
  Home,
  FileText,
  ClipboardList,
  Calendar,
  Bell,
  Users,
  History,
  ShieldCheck,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BOTTOM_NAV: Record<string, { name: string; href: string; icon: React.ElementType }[]> = {
  admin: [
    { name: 'Inicio', href: '/admin', icon: Home },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Caballos', href: '/admin/caballos', icon: ClipboardList },
    { name: 'Tareas', href: '/admin/tareas', icon: FileText },
  ],
  establecimiento: [
    { name: 'Inicio', href: '/establecimiento', icon: Home },
    { name: 'Caballos', href: '/establecimiento/caballos', icon: ClipboardList },
    { name: 'Personal', href: '/establecimiento/personal', icon: Users },
    { name: 'Tareas', href: '/establecimiento/tareas', icon: FileText },
  ],
  veterinario: [
    { name: 'Inicio', href: '/veterinario', icon: Home },
    { name: 'Pacientes', href: '/veterinario/caballos', icon: ClipboardList },
    { name: 'Historial', href: '/veterinario/historial', icon: History },
    { name: 'Validar', href: '/veterinario/validacion', icon: ShieldCheck },
  ],
  empleado: [
    { name: 'Inicio', href: '/empleado', icon: Home },
    { name: 'Tareas', href: '/empleado/tareas', icon: FileText },
    { name: 'Caballos', href: '/empleado/caballos', icon: ClipboardList },
    { name: 'Notif.', href: '/empleado/notificaciones', icon: Bell },
  ],
  propietario: [
    { name: 'Inicio', href: '/propietario', icon: Home },
    { name: 'Caballos', href: '/propietario/caballos', icon: ClipboardList },
    { name: 'Eventos', href: '/propietario/eventos', icon: Calendar },
    { name: 'Tareas', href: '/propietario/tareas', icon: FileText },
  ],
};

// Roots que NO deben activar rutas hijas
const EXACT_ROOTS = ['/admin', '/establecimiento', '/capataz', '/veterinario', '/empleado', '/propietario'];

interface BottomNavProps {
  onMoreClick: () => void;
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuthNew();
  const role = user?.rol?.clave as string | undefined;

  if (isLoading || !role) return null;

  const items = BOTTOM_NAV[role];
  if (!items || items.length === 0) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-100"
      style={{
        boxShadow: '0 -4px 24px rgba(0,0,0,0.07)',
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
                'flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors duration-200 touch-manipulation',
                isActive ? 'text-[#af936f]' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {/* Active indicator line at top */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full bg-[#af936f]" />
              )}

              <Icon
                className={cn(
                  'w-[22px] h-[22px] transition-transform duration-200',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[10px] leading-none transition-all duration-200',
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
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors duration-200 touch-manipulation"
        >
          <MoreHorizontal className="w-[22px] h-[22px]" strokeWidth={2} />
          <span className="text-[10px] font-medium leading-none">Más</span>
        </button>
      </div>
    </nav>
  );
}
