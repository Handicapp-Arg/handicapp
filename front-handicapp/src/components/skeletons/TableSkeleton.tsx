import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

/**
 * Skeleton para tablas de datos (usuarios, caballos, tareas, eventos).
 * Usar mientras se cargan listados en tablas.
 */
export default function TableSkeleton({ rows = 6, columns = 5, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="animate-pulse space-y-3">
      {/* Search / filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 bg-slate-200 rounded-lg flex-1 max-w-sm" />
        <div className="h-10 bg-slate-200 rounded-lg w-28" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        {showHeader && (
          <div className="bg-slate-100 px-6 py-3 flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className={`h-3.5 bg-slate-300 rounded ${i === 0 ? 'w-8' : 'flex-1'}`}
              />
            ))}
          </div>
        )}

        <div className="divide-y divide-slate-100 bg-white">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="px-6 py-4 flex items-center gap-4">
              {/* Checkbox / avatar */}
              <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0" />
              {/* Columns */}
              {Array.from({ length: columns - 1 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className={`h-3.5 bg-slate-200 rounded flex-1 ${colIdx === columns - 2 ? 'max-w-[80px]' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-3.5 bg-slate-200 rounded w-32" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 bg-slate-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
