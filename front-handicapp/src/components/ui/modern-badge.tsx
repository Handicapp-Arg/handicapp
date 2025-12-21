/**
 * ModernBadge Component
 * Badge con diseño tech moderno
 * Variantes con gradientes y efectos glassmorphism
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';
type BadgeSize = 'sm' | 'md' | 'lg';

interface ModernBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  pill?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-blue-100 text-blue-700 border-blue-200',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-purple-100 text-purple-700 border-purple-200',
  gradient: 'text-white border-transparent',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function ModernBadge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className,
  pill = false
}: ModernBadgeProps) {
  const isGradient = variant === 'gradient';
  
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border transition-all duration-200",
        pill ? 'rounded-full' : 'rounded-lg',
        variantStyles[variant],
        sizeStyles[size],
        !isGradient && 'hover:shadow-sm',
        className
      )}
      style={isGradient ? {
        background: 'linear-gradient(135deg, #0f172a 0%, #0e445d 100%)',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)'
      } : {}}
    >
      {children}
    </span>
  );
}

interface ModernBadgeDotProps {
  variant?: BadgeVariant;
  className?: string;
}

export function ModernBadgeDot({ variant = 'default', className }: ModernBadgeDotProps) {
  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-slate-400',
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-purple-500',
    gradient: 'bg-[#af936f]',
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("w-2 h-2 rounded-full", dotColors[variant])} />
    </span>
  );
}
