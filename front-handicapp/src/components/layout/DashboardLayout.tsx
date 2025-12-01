'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { VerticalNavbar } from './VerticalNavbar';
import { HorizontalNavbar } from './HorizontalNavbar';
import { PrefetchManager } from './PrefetchManager';
import { useAuthNew } from '@/lib/hooks/useAuthNew';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuthNew();
  const pathname = usePathname();

  // Auto-cerrar sidebar cuando cambia la ruta (en móvil)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024); // lg breakpoint de Tailwind
      // Auto-cerrar sidebar en móvil si se hace más grande
      if (width >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Prefetch Manager - Pre-carga rutas comunes */}
      <PrefetchManager role={user?.rol?.clave} />
      
      {/* Layout Mobile-First */}
      <div className="flex flex-col h-screen lg:flex-row">
        
        {/* OVERLAY COMPLETAMENTE REMOVIDO - Ya no bloquea clics */}

        {/* Sidebar - Navbar Vertical */}
        <VerticalNavbar 
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}>
          {/* Top Navbar - Navbar Horizontal */}
          <HorizontalNavbar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            isCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}