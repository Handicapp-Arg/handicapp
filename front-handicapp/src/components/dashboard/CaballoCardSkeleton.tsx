"use client";

import React from 'react';

export default function CaballoCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200/80 animate-pulse">
      {/* Skeleton Imagen */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200">
        {/* Simular gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-slate-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-slate-300/20 rounded-full blur-2xl"></div>
        
        {/* Top bar skeleton */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="h-7 w-20 bg-slate-300 rounded-full"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-slate-300 rounded-full"></div>
            <div className="h-8 w-8 bg-slate-300 rounded-full"></div>
          </div>
        </div>

        {/* Bottom info skeleton */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div className="h-6 w-3/4 bg-slate-300 rounded"></div>
          <div className="h-4 w-1/2 bg-slate-300/70 rounded"></div>
        </div>
      </div>

      {/* Skeleton Content */}
      <div className="p-5 space-y-4">
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-200 rounded-md"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-12 bg-slate-200 rounded"></div>
                <div className="h-4 w-16 bg-slate-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <div className="h-12 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}

export function CaballosGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <CaballoCardSkeleton key={i} />
      ))}
    </div>
  );
}
