/**
 * 🚀 COMPONENTES OPTIMIZADOS CON MEMOIZACIÓN
 * StatsGrid optimizado para evitar re-renders innecesarios
 */

import React, { memo, useMemo } from 'react';
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

// 🚀 Colores memoizados para evitar recrear objetos
const COLOR_CLASSES = {
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
    bg: 'bg-green-50',
    border: 'border-green-100',
    icon: 'bg-green-500',
    text: 'text-green-600',
    orb: 'bg-green-100/50',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
    icon: 'bg-yellow-500',
    text: 'text-yellow-600',
    orb: 'bg-yellow-100/50',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    icon: 'bg-red-500',
    text: 'text-red-600',
    orb: 'bg-red-100/50',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
    orb: 'bg-blue-100/50',
  },
} as const;

// 🚀 StatCard memoizado para prevenir re-renders
const OptimizedStatCard = memo<{ stat: StatCard }>(({ stat }) => {
  const colors = COLOR_CLASSES[stat.color || 'primary'];
  
  const IconComponent = useMemo(() => {
    return typeof stat.icon === 'string' ? null : stat.icon;
  }, [stat.icon]);

  const formattedValue = useMemo(() => {
    if (typeof stat.value === 'number') {
      return stat.value.toLocaleString();
    }
    return stat.value;
  }, [stat.value]);

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 transition-all duration-200
      ${colors.bg} ${colors.border} border-2 hover:shadow-lg
      group hover:scale-105 transform
    `}>
      {/* Orb decorativo */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${colors.orb} rounded-full blur-xl opacity-50`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.icon} transition-transform group-hover:scale-110`}>
            {IconComponent ? (
              <IconComponent className="w-6 h-6 text-white" />
            ) : (
              <span className="text-2xl">{stat.icon as string}</span>
            )}
          </div>
          
          {stat.trend && (
            <div className={`
              text-sm font-medium px-2 py-1 rounded-lg
              ${stat.trend.direction === 'up' ? 'text-green-600 bg-green-100' : ''}
              ${stat.trend.direction === 'down' ? 'text-red-600 bg-red-100' : ''}
              ${stat.trend.direction === 'neutral' ? 'text-gray-600 bg-gray-100' : ''}
            `}>
              {stat.trend.value}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className={`text-2xl font-bold ${colors.text}`}>
            {formattedValue}
          </p>
          
          <p className="text-gray-600 text-sm font-medium">
            {stat.label}
          </p>

          {stat.badges && stat.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {stat.badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || 'secondary'} className="text-xs">
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

OptimizedStatCard.displayName = 'OptimizedStatCard';

// 🚀 Grid optimizado con memoización completa
export const OptimizedStatsGrid = memo<StatsGridProps>(({ stats, columns = 4, loading = false }) => {
  const gridCols = useMemo(() => {
    switch (columns) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  }, [columns]);

  if (loading) {
    return (
      <div className={`grid gap-6 ${gridCols}`}>
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={index}
            className="h-32 bg-gray-100 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridCols}`}>
      {stats.map((stat, index) => (
        <OptimizedStatCard key={`${stat.label}-${index}`} stat={stat} />
      ))}
    </div>
  );
});

OptimizedStatsGrid.displayName = 'OptimizedStatsGrid';

// Export legacy component with warning
export const StatsGrid = (props: StatsGridProps) => {
  console.warn('🚨 StatsGrid is deprecated. Use OptimizedStatsGrid for better performance');
  return <OptimizedStatsGrid {...props} />;
};

export { OptimizedStatCard as StatCard };