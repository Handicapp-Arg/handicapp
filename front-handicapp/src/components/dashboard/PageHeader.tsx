/**
 * PageHeader - Header reutilizable para páginas internas
 * Diseño consistente con mini hero section
 */

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  /** Título principal de la página */
  title: string;
  
  /** Descripción opcional */
  description?: string;
  
  /** Icono principal */
  icon?: LucideIcon;
  
  /** Botones de acción en el header */
  actions?: React.ReactNode;
  
  /** Breadcrumbs de navegación */
  breadcrumbs?: Breadcrumb[];
  
  /** Variante del header */
  variant?: 'default' | 'compact';
}

// Tema unificado Navy + Gold para toda la aplicación
const unifiedTheme = {
  bg: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0e445d]',
  iconBg: 'bg-[#af936f]',
  textLight: 'text-slate-100',
  textAccent: 'text-[#af936f]',
  orb1: 'bg-[#0e445d]/30',
  orb2: 'bg-[#af936f]/10',
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumbs,
  variant = 'default',
}: PageHeaderProps) {
  const colors = unifiedTheme;

  return (
    <div className="mb-8">
      {/* Header Section */}
      <div className={`relative overflow-hidden rounded-2xl shadow-xl ${variant === 'compact' ? 'mb-6' : 'mb-8'}`}>
        {/* Background gradient */}
        <div className={`absolute inset-0 ${colors.bg}`}></div>
        
        {/* Decorative orbs */}
        <div className={`absolute top-0 right-1/4 w-64 h-64 ${colors.orb1} rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-0 left-1/3 w-48 h-48 ${colors.orb2} rounded-full blur-3xl`}></div>
        
        {/* Content */}
        <div className={`relative z-10 px-6 sm:px-8 ${variant === 'compact' ? 'py-6' : 'py-8'}`}>
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className={`w-4 h-4 mx-2 ${colors.textLight}`} />
                    )}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-white hover:text-white/80 transition-colors font-medium"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={colors.textLight}>{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title Section */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              {Icon && (
                <div className={`p-3 ${colors.iconBg} rounded-xl shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold text-white ${variant === 'compact' ? 'mb-1' : 'mb-2'}`}>
                  {title}
                </h1>
                {description && (
                  <p className={`${colors.textLight} text-sm sm:text-base max-w-2xl`}>
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2 flex-wrap">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PageHeaderCompact - Versión compacta para páginas simples
 */
export function PageHeaderCompact(props: Omit<PageHeaderProps, 'variant'>) {
  return <PageHeader {...props} variant="compact" />;
}
