import React from 'react';
import { CaballosGridSkeleton } from '@/components/dashboard/CaballoCardSkeleton';

export default function LoadingCaballos() {
  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
      <div className="mb-8 space-y-2">
        {/* Título Skeleton */}
        <div className="h-8 w-48 bg-slate-200/80 rounded-lg animate-pulse"></div>
        {/* Subtítulo Skeleton */}
        <div className="h-5 w-96 bg-slate-100 rounded animate-pulse"></div>
      </div>
      
      {/* Filtros Skeleton */}
      <div className="flex gap-3 mb-8 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
             <div key={i} className="h-9 w-24 bg-slate-100 rounded-full animate-pulse"></div>
        ))}
      </div>

      <CaballosGridSkeleton count={8} />
    </div>
  );
}
