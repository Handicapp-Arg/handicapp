/**
 * StatsGrid - Grid de estadísticas reutilizable
 * Diseño consistente basado en el dashboard de Propietario
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface StatCard {
  /** Título de la estadística */
  label: string;
  
  /** Valor principal */
  value: string | number;
  
  /** Icono (emoji o lucide icon) */
  icon: string | LucideIcon;
  
  /** Color scheme */
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  
  /** Badges adicionales */
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'outline';
  }>;
  
  /** Trend indicator */
  trend?: {
    value: string;
    direction?: 'up' | 'down' | 'neutral';
  };
}

interface StatsGridProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary/5',
    border: 'border-primary/10',
    icon: 'bg-primary',
    text: 'text-primary',
    orb: 'bg-primary/5',
  },
  secondary: {
    bg: 'bg-secondary/5',
    border: 'border-secondary/10',
    icon: 'bg-secondary',
    text: 'text-secondary',
    orb: 'bg-secondary/5',
  },
  accent: {
    bg: 'bg-accent/5',
    border: 'border-accent/10',
    icon: 'bg-accent',
    text: 'text-accent',
    orb: 'bg-accent/5',
  },
  success: {
    bg: 'bg-success/5',
    border: 'border-success/10',
    icon: 'bg-success',
    text: 'text-success',
    orb: 'bg-success/5',
  },
  warning: {
    bg: 'bg-warning/5',
    border: 'border-warning/10',
    icon: 'bg-warning',
    text: 'text-warning',
    orb: 'bg-warning/5',
  },
  danger: {
    bg: 'bg-destructive/5',
    border: 'border-destructive/10',
    icon: 'bg-destructive',
    text: 'text-destructive',
    orb: 'bg-destructive/5',
  },
  info: {
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/10',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
    orb: 'bg-blue-500/5',
  },
};

export function StatsGrid({ stats, columns = 4, loading = false }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-3 sm:gap-4`}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-3 sm:gap-4`}>
      {stats.map((stat, index) => {
        const color = stat.color || 'primary';
        const colors = colorClasses[color];
        const Icon = typeof stat.icon === 'string' ? null : stat.icon;

        return (
          <div
            key={index}
            className="group relative overflow-hidden bg-white border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            {/* Content */}
            <div className="relative p-4 sm:p-5">
              {/* Icon + Label */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-2xl sm:text-3xl font-bold ${colors.text} tabular-nums`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`flex-shrink-0 p-2 sm:p-2.5 rounded-lg ${colors.icon} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  {Icon ? (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <span className="text-lg">{typeof stat.icon === 'string' ? stat.icon : ''}</span>
                  )}
                </div>
              </div>

              {/* Badges & Trend */}
              <div className="flex items-center gap-2 flex-wrap">
                {stat.badges && stat.badges.length > 0 && (
                  <>
                    {stat.badges.map((badge, i) => (
                      <Badge
                        key={i}
                        variant={badge.variant || 'secondary'}
                        className="text-[10px] sm:text-xs px-2 py-0.5 font-medium"
                      >
                        {badge.label}
                      </Badge>
                    ))}
                  </>
                )}

                {stat.trend && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    {stat.trend.direction === 'up' && (
                      <span className="text-green-600 font-semibold">↗</span>
                    )}
                    {stat.trend.direction === 'down' && (
                      <span className="text-red-600 font-semibold">↘</span>
                    )}
                    <span className="truncate">{stat.trend.value}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle gradient overlay on hover */}
            <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}></div>
          </div>
        );
      })}
    </div>
  );
}
