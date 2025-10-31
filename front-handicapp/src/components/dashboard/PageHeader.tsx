/**
 * PageHeader - Header reutilizable para páginas internas
 * Diseño consistente con mini hero section
 */

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { StatsGrid, StatCard } from './StatsGrid';

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
  
  /** Color scheme (debe coincidir con el rol) */
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red' | 'indigo' | 'pink';
  
  /** Stats para mostrar debajo del header */
  stats?: StatCard[];
  
  /** Columnas para las stats (por defecto 4) */
  statsColumns?: 2 | 3 | 4;
  
  /** Botones de acción en el header */
  actions?: React.ReactNode;
  
  /** Breadcrumbs de navegación */
  breadcrumbs?: Breadcrumb[];
  
  /** Variante del header */
  variant?: 'default' | 'compact';
}

const colorSchemes = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500',
    textLight: 'text-blue-100',
    orb1: 'bg-blue-600/20',
    orb2: 'bg-cyan-500/20',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-500',
    textLight: 'text-emerald-100',
    orb1: 'bg-emerald-600/20',
    orb2: 'bg-teal-500/20',
  },
  purple: {
    bg: 'bg-gradient-to-br from-violet-500 to-purple-500',
    iconBg: 'bg-violet-500',
    textLight: 'text-violet-100',
    orb1: 'bg-violet-600/20',
    orb2: 'bg-purple-500/20',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    iconBg: 'bg-orange-500',
    textLight: 'text-orange-100',
    orb1: 'bg-orange-600/20',
    orb2: 'bg-amber-500/20',
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    iconBg: 'bg-teal-500',
    textLight: 'text-teal-100',
    orb1: 'bg-teal-600/20',
    orb2: 'bg-cyan-500/20',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-500 to-rose-500',
    iconBg: 'bg-red-500',
    textLight: 'text-red-100',
    orb1: 'bg-red-600/20',
    orb2: 'bg-rose-500/20',
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    iconBg: 'bg-indigo-500',
    textLight: 'text-indigo-100',
    orb1: 'bg-indigo-600/20',
    orb2: 'bg-blue-500/20',
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-500 to-rose-500',
    iconBg: 'bg-pink-500',
    textLight: 'text-pink-100',
    orb1: 'bg-pink-600/20',
    orb2: 'bg-rose-500/20',
  },
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  colorScheme = 'blue',
  stats,
  statsColumns = 4,
  actions,
  breadcrumbs,
  variant = 'default',
}: PageHeaderProps) {
  const colors = colorSchemes[colorScheme];

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

      {/* Stats Grid */}
      {stats && stats.length > 0 && (
        <div className="-mt-4">
          <StatsGrid stats={stats} columns={statsColumns} />
        </div>
      )}
    </div>
  );
}

/**
 * PageHeaderCompact - Versión compacta para páginas simples
 */
export function PageHeaderCompact(props: Omit<PageHeaderProps, 'variant'>) {
  return <PageHeader {...props} variant="compact" />;
}
