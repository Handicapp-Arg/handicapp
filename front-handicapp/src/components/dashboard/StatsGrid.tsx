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
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6`}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6`}>
      {stats.map((stat, index) => {
        const color = stat.color || 'primary';
        const colors = colorClasses[color];
        const Icon = typeof stat.icon === 'string' ? null : stat.icon;

        return (
          <div
            key={index}
            className="relative overflow-hidden border bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl"
          >
            {/* Decorative orbs */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${colors.orb} rounded-full blur-3xl`}></div>
            <div className={`absolute -bottom-8 -left-8 w-24 h-24 ${colors.orb} rounded-full blur-2xl`}></div>

            {/* Content */}
            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <p className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                  {stat.label}
                </p>
                <div className={`p-2.5 rounded-xl ${colors.icon} shadow-md`}>
                  {Icon ? (
                    <Icon className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-xl">{typeof stat.icon === 'string' ? stat.icon : ''}</span>
                  )}
                </div>
              </div>

              {/* Value */}
              <div className="space-y-3">
                <p className={`text-5xl font-bold ${colors.text} tabular-nums tracking-tight`}>
                  {stat.value}
                </p>

                {/* Badges */}
                {stat.badges && stat.badges.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {stat.badges.map((badge, i) => (
                      <Badge
                        key={i}
                        variant={badge.variant || 'secondary'}
                        className="text-xs font-medium shadow-sm"
                      >
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Trend */}
                {stat.trend && (
                  <div className="flex items-center gap-1 text-sm">
                    {stat.trend.direction === 'up' && (
                      <span className="text-green-600">↗</span>
                    )}
                    {stat.trend.direction === 'down' && (
                      <span className="text-red-600">↘</span>
                    )}
                    <span className="text-gray-600">{stat.trend.value}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
