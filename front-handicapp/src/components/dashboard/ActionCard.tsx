/**
 * ActionCard - Tarjeta de acción animada
 * Diseño consistente basado en el dashboard de Propietario
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export interface ActionCardProps {
  /** Título de la acción */
  title: string;
  
  /** Descripción breve */
  description: string;
  
  /** Ruta de navegación */
  href: string;
  
  /** Icono */
  icon: LucideIcon;
  
  /** Color scheme */
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red' | 'pink' | 'indigo' | 'yellow' | 'cyan';
  
  /** Badge opcional */
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
  
  /** Mostrar conteo */
  count?: number;
  
  /** Disabled state */
  disabled?: boolean;
}

const colorSchemes = {
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    text: 'text-blue-900 dark:text-blue-100',
    hover: 'group-hover:shadow-blue-500/20',
  },
  green: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    text: 'text-emerald-900 dark:text-emerald-100',
    hover: 'group-hover:shadow-emerald-500/20',
  },
  purple: {
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-200 dark:border-violet-800',
    icon: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500',
    text: 'text-violet-900 dark:text-violet-100',
    hover: 'group-hover:shadow-violet-500/20',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500',
    text: 'text-orange-900 dark:text-orange-100',
    hover: 'group-hover:shadow-orange-500/20',
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    border: 'border-teal-200 dark:border-teal-800',
    icon: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-gradient-to-br from-teal-400 to-cyan-500',
    text: 'text-teal-900 dark:text-teal-100',
    hover: 'group-hover:shadow-teal-500/20',
  },
  red: {
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-gradient-to-br from-red-400 to-rose-500',
    text: 'text-red-900 dark:text-red-100',
    hover: 'group-hover:shadow-red-500/20',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-950/20',
    border: 'border-pink-200 dark:border-pink-800',
    icon: 'text-pink-600 dark:text-pink-400',
    iconBg: 'bg-gradient-to-br from-pink-400 to-rose-500',
    text: 'text-pink-900 dark:text-pink-100',
    hover: 'group-hover:shadow-pink-500/20',
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-gradient-to-br from-indigo-400 to-blue-500',
    text: 'text-indigo-900 dark:text-indigo-100',
    hover: 'group-hover:shadow-indigo-500/20',
  },
  yellow: {
    gradient: 'from-yellow-500 to-amber-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    text: 'text-yellow-900 dark:text-yellow-100',
    hover: 'group-hover:shadow-yellow-500/20',
  },
  cyan: {
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    border: 'border-cyan-200 dark:border-cyan-800',
    icon: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    text: 'text-cyan-900 dark:text-cyan-100',
    hover: 'group-hover:shadow-cyan-500/20',
  },
};

export function ActionCard({
  title,
  description,
  href,
  icon: Icon,
  colorScheme = 'blue',
  badge,
  count,
  disabled = false,
}: ActionCardProps) {
  const colors = colorSchemes[colorScheme];

  const content = (
    <div
      className={`
        group relative overflow-hidden border-2 ${colors.border} ${colors.bg} 
        rounded-2xl shadow-lg transition-all duration-300
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer'}
        ${colors.hover}
      `}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${colors.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Badge or Count */}
          {badge && (
            <Badge variant={badge.variant || 'secondary'} className="shadow-sm">
              {badge.label}
            </Badge>
          )}
          {count !== undefined && !badge && (
            <div className={`px-3 py-1 rounded-full ${colors.iconBg} text-white font-bold text-sm shadow-md`}>
              {count}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-xl font-bold ${colors.text} mb-2 group-hover:translate-x-1 transition-transform duration-300`}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>

        {/* Arrow indicator */}
        {!disabled && (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
            <span>Ver más</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (disabled) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}

interface ActionGridProps {
  actions: ActionCardProps[];
  columns?: 2 | 3 | 4;
}

export function ActionGrid({ actions, columns = 3 }: ActionGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {actions.map((action, index) => (
        <ActionCard key={index} {...action} />
      ))}
    </div>
  );
}
