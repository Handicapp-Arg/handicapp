import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  cols?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  gap?: 3 | 4 | 5 | 6 | 8;
  className?: string;
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const gapClasses = {
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
};

export function ResponsiveGrid({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 }, 
  gap = 6,
  className = "" 
}: GridProps) {
  const gridClasses = cn(
    'grid',
    gapClasses[gap],
    cols.sm && `${colsClasses[cols.sm]}`,
    cols.md && `md:${colsClasses[cols.md]}`,
    cols.lg && `lg:${colsClasses[cols.lg]}`,
    cols.xl && `xl:${colsClasses[cols.xl]}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// Grid preconfigurados para casos comunes
export function StatsGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ sm: 1, md: 2, lg: 4 }} 
      gap={6}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function ActionsGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ sm: 1, md: 2, lg: 3 }} 
      gap={4}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function ContentGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ sm: 1, lg: 2 }} 
      gap={6}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}