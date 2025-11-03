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
  
  // Veterinario
  'veterinario': 'Veterinario',
  'consultas': 'Consultas',
  
  // Capataz
  'capataz': 'Capataz',
  'tareas': 'Tareas',
  
  // Empleado
  'empleado': 'Empleado',
  
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

  // Obtener el título de la página actual (último breadcrumb)
  const currentPageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  // No renderizar si no hay breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:flex flex-col gap-2">
      {/* Breadcrumb Navigation - Iconos y texto más grandes */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <span className="flex items-center gap-2 px-2.5 py-1.5 text-slate-600">
          <Home className="w-4 h-4" />
          <span className="font-medium">Páginas</span>
        </span>

        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div key={item.href} className="flex items-center gap-1.5">
              <span className="text-slate-400">/</span>
              {isLast ? (
                <span className="px-2.5 py-1.5 text-slate-800 font-semibold truncate max-w-[200px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 truncate max-w-[200px] font-medium"
                >
                  {item.label}
                </Link>
              )}
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
      className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
    >
      <ChevronRight className="w-4 h-4 rotate-180" />
      <span>Atrás</span>
    </button>
  );
}
