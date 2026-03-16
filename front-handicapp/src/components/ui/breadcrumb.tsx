'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Mapeo de rutas a nombres legibles
const ROUTE_NAMES: Record<string, string> = {
  // Dashboard principal
  'dashboard': 'Dashboard',
  
  // Propietario
  'propietario': 'Propietario',
  'perfil': 'Mi Perfil',
  'caballos': 'Caballos',
  'establecimientos': 'Establecimientos',
  'eventos': 'Eventos',
  'notificaciones': 'Notificaciones',
  
  // Admin
  'admin': 'Administración',
  'usuarios': 'Usuarios',
  'roles': 'Roles',
  'configuracion': 'Configuración',
  'settings': 'Configuración',
  
  // Establecimiento
  'establecimiento': 'Establecimiento',
  'miembros': 'Miembros',
  
  // Acciones
  'nuevo': 'Nuevo',
  'editar': 'Editar',
  'detalle': 'Detalle',
};

export function Breadcrumb() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // No mostrar breadcrumbs en la raíz o login/register
    if (!pathname || pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return [];
    }

    const segments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Si estamos en el dashboard principal (solo /propietario, /admin, etc.)
    if (segments.length === 1) {
      items.push({
        label: 'Dashboard',
        href: '/' + segments[0],
      });
      return items;
    }

    // Construir breadcrumbs desde el segundo segmento (omitir rol)
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += '/' + segment;

      // Omitir el primer segmento (rol: propietario, admin, etc.)
      if (i === 0) continue;

      // Detectar si es un ID numérico - NO agregarlo al breadcrumb
      const isId = /^\d+$/.test(segment);
      if (isId) {
        continue; // Saltar IDs numéricos
      }

      // Usar el nombre mapeado o el segmento capitalizado
      const label = ROUTE_NAMES[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({
        label,
        href: currentPath,
      });
    }

    return items;
  }, [pathname]);

  // No renderizar si no hay breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 sm:gap-2 min-w-0">
      {/* Breadcrumb Navigation - Responsive */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm min-w-0">
        {/* Home icon - solo desktop */}
        <span className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 text-slate-600 flex-shrink-0">
          <Home className="w-4 h-4" />
          <span className="font-medium">Páginas</span>
        </span>

        {breadcrumbs.map((item, index) => {
          // En móvil, solo mostrar el último item (página actual)
          if (index < breadcrumbs.length - 1) {
            return (
              <div key={item.href} className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">/</span>
                <Link
                  href={item.href}
                  className="px-2.5 py-1.5 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 truncate max-w-[200px] font-medium"
                >
                  {item.label}
                </Link>
              </div>
            );
          }

          return (
            <div key={item.href} className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
              <span className="text-slate-400 hidden lg:inline">/</span>
              <span className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-slate-800 font-semibold truncate">
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// Breadcrumb Mobile (solo botón atrás)
export function MobileBreadcrumb() {
  const pathname = usePathname();

  const goBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  // No mostrar en rutas raíz o dashboard principal
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) {
    return null;
  }

  return (
    <button
      onClick={goBack}
      className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      <ChevronRight className="w-4 h-4 rotate-180" />
      <span>Atrás</span>
    </button>
  );
}
