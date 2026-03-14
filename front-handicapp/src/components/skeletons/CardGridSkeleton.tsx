import React from 'react';

interface CardGridSkeletonProps {
  cards?: number;
  columns?: 2 | 3 | 4;
}

/**
 * Skeleton para grillas de cards (caballos, establecimientos).
 * Replica el layout de CaballoCard con imagen + info.
 */
export default function CardGridSkeleton({ cards = 8, columns = 4 }: CardGridSkeletonProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridCols} gap-6 animate-pulse`}>
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm"
        >
          {/* Image placeholder */}
          <div className="aspect-[4/3] bg-slate-200" />

          {/* Info */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 flex-1">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3.5 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="h-5 bg-slate-100 rounded-full w-16 ml-2" />
            </div>

            <div className="flex items-center gap-2">
              <div className="h-3.5 bg-slate-100 rounded flex-1" />
              <div className="h-3.5 bg-slate-100 rounded w-1/3" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <div className="h-8 bg-slate-200 rounded-lg flex-1" />
              <div className="h-8 bg-slate-100 rounded-lg w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
