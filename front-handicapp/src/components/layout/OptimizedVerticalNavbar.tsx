/**
 * 🚀 VERTICAL NAVBAR OPTIMIZADO
 * Máximo rendimiento con memoización profunda
 */

'use client';

import React, { memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LOGOS } from '@/lib/constants/logos';
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  Building2,
  ClipboardList,
  Stethoscope,
  Calendar,
  X,
  Bell,
  Trophy,
  Activity,
  Package,
  CreditCard,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

// 🚀 Menús por rol memoizados como constantes para prevenir recreación
const ROLE_MENUS = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
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
    { name: 'Calendario', href: '/establecimiento/eventos', icon: Calendar },
    { name: 'Trabajo Diario', href: '/establecimiento/tareas', icon: FileText },
    { name: 'Personal', href: '/establecimiento/personal', icon: Users },
    { name: 'Inventario', href: '/establecimiento/inventario', icon: Package },
    { name: 'Reportes', href: '/establecimiento/reportes', icon: BarChart3 },
  ],
  propietario: [
    { name: 'Dashboard', href: '/propietario', icon: Home },
    { name: 'Mis Caballos', href: '/propietario/caballos', icon: ClipboardList },
    { name: 'Competencias', href: '/propietario/competencias', icon: Trophy },
    { name: 'Histórico', href: '/propietario/historico', icon: Activity },
    { name: 'Calendario', href: '/propietario/eventos', icon: Calendar },
    { name: 'Facturación', href: '/propietario/facturacion', icon: CreditCard },
    { name: 'Reportes', href: '/propietario/reportes', icon: BarChart3 },
  ],
  capataz: [
    { name: 'Dashboard', href: '/capataz', icon: Home },
    { name: 'Caballos', href: '/capataz/caballos', icon: ClipboardList },
    { name: 'Tareas Diarias', href: '/capataz/tareas', icon: FileText },
    { name: 'Personal', href: '/capataz/personal', icon: Users },
    { name: 'Calendario', href: '/capataz/eventos', icon: Calendar },
    { name: 'Inventario', href: '/capataz/inventario', icon: Package },
    { name: 'Reportes', href: '/capataz/reportes', icon: BarChart3 },
  ],
  empleado: [
    { name: 'Dashboard', href: '/empleado', icon: Home },
    { name: 'Mis Tareas', href: '/empleado/tareas', icon: FileText },
    { name: 'Caballos', href: '/empleado/caballos', icon: ClipboardList },
    { name: 'Calendario', href: '/empleado/eventos', icon: Calendar },
  ],
  veterinario: [
    { name: 'Dashboard', href: '/veterinario', icon: Home },
    { name: 'Caballos', href: '/veterinario/caballos', icon: ClipboardList },
    { name: 'Consultas', href: '/veterinario/consultas', icon: Stethoscope },
    { name: 'Calendario', href: '/veterinario/eventos', icon: Calendar },
    { name: 'Reportes', href: '/veterinario/reportes', icon: BarChart3 },
  ],
} as const;

// 🚀 Item de menú memoizado para prevenir re-renders innecesarios
const OptimizedMenuItem = memo<{
  item: MenuItem;
  isActive: boolean;
  onClick?: () => void;
}>(({ item, isActive, onClick }) => {
  const IconComponent = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
        isActive
          ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <IconComponent className="h-5 w-5" />
      <span className="truncate">{item.name}</span>
    </Link>
  );
});

OptimizedMenuItem.displayName = 'OptimizedMenuItem';

// 🚀 Header del navbar memoizado
const OptimizedNavHeader = memo<{
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}>(({ isCollapsed, onToggleCollapse }) => (
  <div className="flex items-center justify-between p-4 border-b">
    {!isCollapsed && (
      <div className="flex items-center space-x-3">
        <Image
          src={LOGOS.ICON_BROWN}
          alt="HandicApp Logo"
          width={32}
          height={32}
          className="rounded-lg"
          priority
        />
        <div>
          <h1 className="text-lg font-bold text-gray-900">HandicApp</h1>
          <p className="text-xs text-gray-500">Gestión Ecuestre</p>
        </div>
      </div>
    )}
    
    <button
      onClick={onToggleCollapse}
      className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
      aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
    >
      <X className="h-5 w-5" />
    </button>
  </div>
));

OptimizedNavHeader.displayName = 'OptimizedNavHeader';

// 🚀 Props del navbar principal
interface OptimizedVerticalNavbarProps {
  userRole: keyof typeof ROLE_MENUS;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * 🚀 Navbar vertical completamente optimizado
 * - Memoización profunda de todos los componentes
 * - useCallback para handlers estables
 * - useMemo para arrays y objetos
 * - Evita re-renders innecesarios
 */
export const OptimizedVerticalNavbar = memo<OptimizedVerticalNavbarProps>(({
  userRole,
  isOpen = false,
  onClose,
  className
}) => {
  const pathname = usePathname();

  // 🚀 Menú memoizado por rol para evitar recreación
  const menuItems = useMemo(() => ROLE_MENUS[userRole] || [], [userRole]);
  
  // 🚀 Active path memoizado para evitar recálculos
  const isActivePath = useCallback((href: string) => {
    if (href === `/${userRole}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }, [pathname, userRole]);

  // 🚀 Handler estable para cerrar
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // 🚀 Items con estado activo memoizados
  const navItems = useMemo(() => 
    menuItems.map(item => ({
      ...item,
      isActive: isActivePath(item.href)
    })), 
    [menuItems, isActivePath]
  );

  return (
    <>
      {/* 🚀 Overlay para móvil memoizado */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* 🚀 Navbar principal */}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200",
          "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:transform-none",
          className
        )}
        aria-label="Navegación principal"
      >
        {/* Header */}
        <OptimizedNavHeader 
          isCollapsed={false}
          onToggleCollapse={handleClose}
        />

        {/* 🚀 Scrollable menu area */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3" role="navigation">
            {navItems.map((item) => (
              <OptimizedMenuItem
                key={item.href}
                item={item}
                isActive={item.isActive}
                onClick={handleClose}
              />
            ))}
          </nav>
        </div>

        {/* 🚀 Footer */}
        <div className="border-t p-4">
          <p className="text-xs text-gray-500 text-center">
            HandicApp v2.0
          </p>
        </div>
      </nav>
    </>
  );
});

OptimizedVerticalNavbar.displayName = 'OptimizedVerticalNavbar';

// Re-exportar para compatibilidad
export default OptimizedVerticalNavbar;