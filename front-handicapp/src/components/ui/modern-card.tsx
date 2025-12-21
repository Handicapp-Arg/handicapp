/**
 * ModernCard Component
 * Card component con diseño tech moderno
 * Incluye glassmorphism, gradientes sutiles y efectos hover
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function ModernCard({ 
  children, 
  className, 
  hover = false,
  gradient = false,
  glass = false,
  onClick 
}: ModernCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-slate-200/50 transition-all duration-300",
        hover && "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
        glass && "backdrop-blur-sm bg-white/90",
        className
      )}
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        ...(gradient && {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'
        })
      }}
    >
      {children}
    </div>
  );
}

interface ModernCardHeaderProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function ModernCardHeader({ children, className, gradient = false }: ModernCardHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-slate-100",
        className
      )}
      style={gradient ? {
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.03) 0%, rgba(76, 29, 149, 0.03) 100%)'
      } : {}}
    >
      {children}
    </div>
  );
}

interface ModernCardContentProps {
  children: ReactNode;
  className?: string;
}

export function ModernCardContent({ children, className }: ModernCardContentProps) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}

interface ModernCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModernCardFooter({ children, className }: ModernCardFooterProps) {
  return (
    <div className={cn("px-6 py-4 border-t border-slate-100 bg-slate-50/30", className)}>
      {children}
    </div>
  );
}
