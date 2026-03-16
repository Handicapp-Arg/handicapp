import React from 'react';
import { cn } from '@/lib/utils';

type LoaderVariant = 'page' | 'section' | 'inline' | 'overlay';
type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  className?: string;
}

const sizeMap: Record<LoaderSize, string> = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-2',
  lg: 'w-14 h-14 border-4',
};

function Spinner({ size = 'md', className }: { size?: LoaderSize; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-full border-gray-200 border-t-gray-800 animate-spin',
        sizeMap[size],
        className
      )}
      aria-label="Cargando"
    />
  );
}

export function Loader({ variant = 'page', size = 'md', className }: LoaderProps) {
  switch (variant) {
    case 'page':
      return (
        <div className={cn(
          'fixed flex items-center justify-center top-16 left-0 lg:left-20 right-0 bottom-0',
          className
        )}>
          <Spinner size="lg" />
        </div>
      );

    case 'section':
      return (
        <div className={cn('flex items-center justify-center py-12', className)}>
          <Spinner size={size} />
        </div>
      );

    case 'inline':
      return (
        <div className={cn('inline-flex items-center justify-center', className)}>
          <div className="w-4 h-4 border-2 rounded-full animate-spin border-current border-t-transparent" />
        </div>
      );

    case 'overlay':
      return (
        <div className={cn(
          'absolute inset-0 z-50 flex items-center justify-center bg-white/80',
          className
        )}>
          <Spinner size={size} />
        </div>
      );

    default:
      return <Spinner size={size} className={className} />;
  }
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-md bg-gray-200 animate-pulse', className)}
      {...props}
    />
  );
}

export const SkeletonPresets = {
  Card: () => (
    <div className="bg-white rounded-md p-6 shadow-sm space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  ),

  Table: ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  ),

  Chart: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-md p-6 space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-2 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-1/2" />
        ))}
      </div>
    </div>
  ),
};
